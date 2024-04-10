/* Imports */
const mongoose = require('mongoose');
const regexEscape = require('regex-escape');
const MongoStore = require('connect-mongo')

/* Schemas */
const {User} = require("./schema/user");
const {Post} = require("./schema/post");
const {Notification} = require("./schema/notification");

/* Connection Properties */
const MONGO_HOST = process.env.MONGO_HOST || "localhost";
const MONGO_USER = process.env.MONGO_USER || "admin";
const MONGO_PASS = process.env.MONGO_PASS;
const MONGO_DBNAME = process.env.MONGO_DBNAME || "test";
const MONGO_CONNNAME = process.env.MONGO_CONNNAME || "mongodb";

/* Connection String */
const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}/${MONGO_DBNAME}?retryWrites=true&w=majority`;

/* Variables */
let connected = false;

mongoose.connect(connectionString);

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', async () => {
    console.log(`Connected to ${MONGO_CONNNAME}`);
    connected = true;
});

/* Session Storage */
let store;
if (connected) {
    // Use Session schema from connect-mongo which aligns with express-session setup.
    store = new MongoStore.create({
        client: db,
        dbName: process.env.MONGO_DBNAME,
        collection: 'sessions',
        expires: 1000 * 60 * 60 * 48,
        crypto: {
            secret: process.env.STORE_SECRET || "secret",
        }
    });
}

const searchUser = async (filter) => {
    return User.findOne(filter);
}

const getUserById = async (id) => {
    return User.findOne({_id: id});
}

const getPostById = async (id) => {
    const post = await Post.findOne({_id: id}).populate('comments.replies.user');
    if (post.comments?.length > 0) {
        post.comments.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (post.identification?.potentials?.length > 0) {
        // Sort by upvotes and then by ascending downvotes. So highest upvotes at the top, 0 in the middle highest downvotes at the bottom
        post.identification.potentials.sort((a, b) => {
            if (a.upvotes > b.upvotes) {
                return -1;
            } else if (a.upvotes < b.upvotes) {
                return 1;
            } else {
                if (a.downvotes < b.downvotes) {
                    return -1;
                } else if (a.downvotes > b.downvotes) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });
    }
    return post;
}

/**
 * Add a post to the database
 * @param posting_user {String} The ID of the user posting the post
 * @param title {String} The title of the post
 * @param state {Number} The state of the post. See {@link PostState} for possible values
 * @param seen_at {Date} The date the plant was seen
 * @param images {{image_type: String, image_data: Buffer}[]} An array of image objects
 * @param description {String} The description of the post
 * @param location {{location_name: String, latitude: Number, longitude: Number}} The location of the plant
 * @param details {{height: Number, spread: Number, exposure: Number, has_flowers: Boolean, colour: Number, leaf_type: Number, seed_type: Number}} The details of the plant
 * @param identification {{potentials: [{name: String, suggesting_user: String, upvotes: Number, downvotes: Number}], is_accepted: Boolean, date_accepted: Date, accepted_potential: Number, dbpedia_url: String}} The identification details of the plant
 * @returns {Promise<Post>} Returns the post object that was added to the database
 */
const addPost = async (posting_user, title, state, seen_at, images, description, location, details, identification) => {
    const post = new Post({
        posting_user,
        title,
        state,
        seen_at,
        images,
        description,
        location,
        details,
        identification
    });

    return post.save();
}

/**
 * Add a new potential identification to a post object
 * @param postId {String} The ID of the post to add the potential identification to
 * @param potential {{name: String, suggesting_user: String, upvotes: Number, downvotes: Number}} The potential identification to add
 * @returns {Promise<Post>} Returns the updated post object with the new potential identification
 */
const addPostPotentialIdentification = async (postId, potential) => {
    const post = await Post.findById(postId);
    post.identification.potentials.push(potential);
    return post.save();
}


/**
 * Add a comment to a post object.
 * This function will not work for adding a reply to a comment. Use {@link addReply} instead.
 * @param postId {String} The ID of the post to add the comment to
 * @param data{{userID: String, content: String, likes: Number}} The data object containing the comment information
 * @returns {Promise<Comment>} Returns the new comment object
 */
const addComment = async (postId, data) => {
    const post = await Post.findOne({_id: postId});
    const comment = {
        user: data.userID,
        content: data.content,
        likes: data.likes,
    }

    post.comments?.push(comment);
    await post.save();

    const returnComment = post.comments[post.comments.length - 1];
    return returnComment;
}

/**
 * Add a reply to a comment
 * @param postId {String} The ID of the post to add the reply to
 * @param commentId {String} The ID of the comment to add the reply to
 * @param data{{userID: String, content: String, likes: Number}} The data object containing the reply information
 * @returns {Promise<Comment>} Returns the new reply object
 */
const addReply = async (postId, commentId, data) => {
    const post = await Post.findById(postId);

    //As the comment schema is recursive, the comment could be multiple levels deep, so we will need to traverse the comments array to find the correct comment
    const comment = findComment(post.comments, commentId);

    if (comment) {
        const reply = {
            user: data.userID,
            content: data.content,
            likes: data.likes
        }

        comment.replies.push(reply);
        await post.save();

        //Get the latest reply
        const returnReply = comment.replies[comment.replies.length - 1];
        return returnReply;
    }
}

/**
 * Get a comment from a post
 * @param postId The ID of the post
 * @param commentId The ID of the comment
* @returns {Promise<{user: String, content: String, likes: Number, replies: Array|null}>} The comment object if found, otherwise null
 */
const getCommentFromPost = async (postId, commentId) => {
    const post = await getPostById(postId);
    const comment = findComment(post.comments, commentId);

    return comment;
}

/**
 * Finds a comment inside a comments array
 * @param comments {Array} The array of comments to search
 * @param id {String} The ID of the comment to find
 * @returns {{user: String, content: String, likes: Number, date: Date, replies: Array|null}|null} Returns the comment object if found, otherwise null
 */
const findComment = (comments, id) => {
    for (const comment of comments) {
        if (comment._id.toString() === id) {
            return comment;
        }
        if (comment.replies?.length > 0) {
            const found = findComment(comment.replies, id);
            if (found) {
                return found;
            }
        }
    }
}

/**
 * Add a suggestion to post identifications
 * @param postId {String} The ID of the post to add the suggestion to
 * @param data {{userID: String, name: String}} The data object containing the suggestion information
 * @returns {Promise<{name: String, suggesting_user: User, upvotes: Number, downvotes: Number, upvoters: Array<User>, downvoters: Array<User>}>} Returns the new suggestion object
 * @author Benjamin Lister
 */
const addSuggestion = async (postId, data) => {
    const post = await getPostById(postId);
    const suggestion = {
        suggesting_user: data.userID,
        name: data.name,
    }

    post.identification.potentials.push(suggestion);

    await post.save();

    return post.identification.potentials[post.identification.potentials.length - 1];
}

/**
 * Get a suggestion from a post
 * @param postId The ID of the post
 * @param suggestionId The ID of the suggestion
 * @returns {Promise<*>} The suggestion object if found, otherwise null
 */
const getSuggestionFromPost = async (postId, suggestionId) => {
    const post = await getPostById(postId);
    const suggestion = post.identification.potentials.id(suggestionId);
    return suggestion;
}

/**
 * Find a suggestion in the suggestions array of a post
 * @param suggestions The array of suggestions to search
 * @param id The ID of the suggestion to find
 * @returns {*} The suggestion object if found, otherwise null
 */
const findSuggestion = (suggestions, id) => {
    for (const suggestion of suggestions) {
        if (suggestion._id.toString() === id) {
            return suggestion;
        }
    }
}

module.exports = {
    searchUser,
    getUserById,
    addPost,
    addPostPotentialIdentification,
    addComment,
    addReply,
    getPostById,
    getCommentFromPost,
    findComment,
    addSuggestion,
    getSuggestionFromPost,
    findSuggestion,
}
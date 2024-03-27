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
 * @returns {Promise<Post>} Returns the updated post object with the new comment
 */
const addComment = async (postId, data) => {
    const post = await Post.findById(postId);
    const comment = {
        user: data.userID,
        content: data.content,
        likes: data.likes
    }

    post.comments.push(comment);
    return post.save();
}

/**
 * Add a reply to a comment
 * @param postId {String} The ID of the post to add the reply to
 * @param commentId {String} The ID of the comment to add the reply to
 * @param data{{userID: String, content: String, likes: Number}} The data object containing the reply information
 * @returns {Promise<Post>} Returns the updated post object with the new reply
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
        return post.save();
    }
}

/**
 * Finds a comment inside a comments array
 * @param comments {Array} The array of comments to search
 * @param id {String} The ID of the comment to find
 * @returns {{user: String, content: String, likes: Number, replies: Array|null}|null} Returns the comment object if found, otherwise null
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

module.exports = {
    searchUser,
    addPost,
    addPostPotentialIdentification,
    addComment,
    addReply
}
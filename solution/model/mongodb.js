/* Imports */
const mongoose = require('mongoose');
const regexEscape = require('regex-escape');
const MongoStore = require('connect-mongo')

/* Schemas */
const {User} = require("./schema/user");
const {Post} = require("./schema/post");
const {Notification} = require("./schema/notification");
const {NEW} = require("./enum/notificationStates")
const notificationTypes = require("./enum/notificationTypes")

/* Connection Properties */
const MONGO_USE_LOCAL = process.env.MONGO_USE_LOCAL || false;
const MONGO_HOST = process.env.MONGO_HOST || "localhost";
const MONGO_USER = process.env.MONGO_USER || "admin";
const MONGO_PASS = process.env.MONGO_PASS;
const MONGO_DBNAME = process.env.MONGO_DBNAME || "test";
const MONGO_CONNNAME = process.env.MONGO_CONNNAME || "mongodb";

/* Connection String */
let connectionString;

if (MONGO_USE_LOCAL) {
    connectionString = `mongodb://localhost:27017/${MONGO_DBNAME}`;
} else {
    connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}/${MONGO_DBNAME}?retryWrites=true&w=majority`;
}
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
    return User.findOne({_id: id}).populate("posts")
}

const updateUser = async (id, data) => {
    return User.findByIdAndUpdate(id, data)
}

const getAllUsers = async () => {
    return User.find();
}

const getUserByIdWithPosts = async (id) => {
    return User.findOne({_id: id}).populate('posts');
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


const getFeedPosts = async (page = 1, limit = 10, filters={}) => {
    return await Post.find(filters).sort({createdAt: -1}).skip((page - 1) * limit).limit(limit)
}


const getPostsBySearchTerms = async (search_text, search_order, limit) => {
    //If search_text is empty, return an empty array
    if (!search_text) {
        return [];
    }

    //Convert search_order to a search order query
    let sort = {}
    switch (search_order) {
        case 'recent':
            sort = {createdAt: -1};
            break;
        case 'oldest':
            sort = {createdAt: 1};
            break;
        case 'user':
            sort = {
                "posting_user.first_name": 1,
                "posting_user.last_name": 1
            };
            break;
        default:
            sort = {createdAt: -1};
    }

    //Perform a text search
    const posts = Post.find({
        $or: [
            {
                title: {
                    $regex: search_text,
                    $options: 'i'
                }
            },
            {
                description: {
                    $regex: search_text,
                    $options: 'i'
                }
            },
            {
                "identification.potentials.name": {
                    $regex: search_text,
                    $options: 'i'
                }
            },
            {
                "posting_user.first_name": {
                    $regex: search_text,
                    $options: 'i'
                }
            },
            {
                "posting_user.last_name": {
                    $regex: search_text,
                    $options: 'i'
                }
            }
        ]
    })
        .populate('posting_user')
        .sort(sort)
        .limit(limit || 10);

    return posts;
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
    const comment = {
        user: data.userID,
        content: data.content,
        likes: data.likes,
        client_temp_id: data.client_temp_id
    }

    //Push the new comment into the comments array and return the new comment
    const post = Post.findOneAndUpdate({_id: postId}, {$push: {comments: comment}}, {new: true});

    const notification = await addNotification(post._id, post.posting_user._id, notificationTypes.NEW_COMMENT, post.title, comment.content, data.userID)
    const returnComment = post.comments[post.comments.length - 1];
    return {
        post: returnComment,
        notification
    };
}

/**
 * Add a reply to a comment
 * @param postId {String} The ID of the post to add the reply to
 * @param commentId {String} The ID of the comment to add the reply to
 * @param data{{userID: String, content: String, likes: Number, client_temp_id: String}} The data object containing the reply information
 * @returns {Promise<Comment>} Returns the new reply object
 */
const addReply = async (postId, commentId, data) => {
    const post = await Post.findById(postId);

    //As the comment schema is recursive, the comment could be multiple levels deep, so we will need to traverse the comments array to find the correct comment
    let comment = findComment(post.comments, commentId);

    if (comment) {
        const reply = {
            user: data.userID,
            content: data.content,
            likes: data.likes,
            client_temp_id: data.client_temp_id
        }

        //Push the new reply into the replies array of the comment and return the new reply
        const post = await Post.findOneAndUpdate({_id: postId, "comments._id": commentId}, {$push: {"comments.$.replies": reply}}, {new: true});
        comment = findComment(post.comments, commentId);

        const notification = await addNotification(postId, comment.user, notificationTypes.NEW_REPLY, post.title, reply.content, reply.user, comment._id)

        //Get the latest reply
        const returnReply = comment.replies[comment.replies.length - 1];
        return {
            reply: returnReply,
            notification
        }
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

    const notification = await addNotification(post._id, post.posting_user._id, notificationTypes.NEW_IDENTIFICATION, post.title, suggestion.name, suggestion.suggesting_user)
    return {
        suggestion: post.identification.potentials[post.identification.potentials.length - 1],
        notification
    };
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

const createPost = async (postData) => {
    return Post.create(postData);
}

const getCommentsSinceTime = async (postID, time) => {
    const post = await Post.findById(postID);

    //If the post doesn't exist, return an empty array
    if (!post) {
        return [];
    }

    //Filter the comments array to only include comments that were created after the given time
    const comments = post.comments.filter((comment) => comment.createdAt > time);
    return comments;
}

/**
 * Returns an array of replies that were created after the given time.
 * Important distinction: this function will only return replies that were created after the given time on comments that were created before the given time.
 * This is because the function is designed to be used in conjunction with {@link getCommentsSinceTime}, and this will automatically handle comments that were created after the given time.
 * @param postID
 * @param time
 * @returns {Promise<Aggregate<Array<any>>>}
 */
const getRepliesSinceTime = async (postID, time) => {
    const post = await Post.aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(postID)}}, // Match the post
        {$unwind: "$comments"}, // Deconstruct the comments array
        {$match: {"comments.createdAt": {$lt: new Date(time)}}}, // Match comments before the given time
        {
            $addFields: {
                "comments.filteredReplies": {
                    $filter: {
                        input: "$comments.replies",
                        as: "reply",
                        cond: {$gt: ["$$reply.createdAt", new Date(time)]}
                    }
                }
            }
        }, // Add a new field that contains the filtered replies
        {$unwind: "$comments.filteredReplies"}, // Deconstruct the filteredReplies array
        {
            $project: {
                "reply": "$comments.filteredReplies",
                "commentId": "$comments._id"
            }
        } // Include only the new field and comment ID
    ]);

    return post;
}

const addNotification = async (targetPostId, targetUserId, notificationType, notificationTitle, content = "", authorId = null, targetCommentId = null) => {
    const author = await User.findById(authorId)
    const notification = {
        target_user: targetUserId,
        target_post: targetPostId,
        target_comment: targetCommentId,
        notification_type: notificationType,
        state: NEW,
        content: notificationTypes.notificationTypeToContent(notificationType, notificationTitle, author.first_name + " " + author.last_name, content)
    }

    const newNotification = new Notification(notification)
    await newNotification.save()

    return newNotification
}

const getAllNotifications = async (userId, page = 0, limit = 10) => {
    return await Notification.find({target_user: userId}).populate({
        path: 'target_post',
        populate: {
            path: 'posting_user'
        }
    }).sort({createdAt: -1}).skip(page * limit).limit(limit)
}

const getNotificationCount = async (userId) => {
    return await Notification.countDocuments({
        target_user: userId,
        seen: false
    }).exec()
}

const viewNotification = async (notificationId) => {
    return await Notification.findOneAndUpdate({_id: notificationId}, {$set: {"seen": true}})
}

const getPostOwner = async (plantID) => {
    return await Post.findById(plantID).select("posting_user")
}

const getCommentOwnerId = async (postID, commentID) => {
    const comment = await getCommentFromPost(postID, commentID);
    return comment.user
}

const markAllNotificationAsRead = async (userID) => {
    await Notification.updateMany({
        target_user: userID,
        seen: false
    }, {$set: {"seen": true}})
}

const deleteLikeNotificationByCommentId = async (commentID) => {
    return await Notification.findOneAndDelete({
        target_comment: commentID,
        notification_type: notificationTypes.NEW_LIKE
    })
}
module.exports = {
    markAllNotificationAsRead,
    viewNotification,
    getPostOwner,
    getNotificationCount,
    searchUser,
    getAllUsers,
    updateUser,
    getUserById,
    getUserByIdWithPosts,
    getPostsBySearchTerms,
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
    createPost,
    getCommentsSinceTime,
    getRepliesSinceTime,
    getFeedPosts,
    addNotification,
    getAllNotifications,
    getCommentOwnerId,
    deleteLikeNotificationByCommentId
}
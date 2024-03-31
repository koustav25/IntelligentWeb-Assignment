const {getPostById, addComment, getCommentFromPost, addReply, findComment} = require("../../model/mongodb");
const postStates = require("../../model/enum/postStates");
const leafTypes = require("../../model/enum/leafTypes");
const exposureTypes = require("../../model/enum/exposureTypes");
const seedTypes = require("../../model/enum/seedTypes");
const {mongo} = require("mongoose");
const mongoose = require("mongoose");

function getPost(req, res) {
    //TODO: Render the post view
    //res.render('post', { title: 'Post' })

    res.send('Post')
}

async function getPlant(req, res, next) {
    //Get the post ID from the URL
    const id = req.params.id

    //Check if the ID is valid
    if (!id) {
        res.status(400);
        res.send("Invalid ID");
        return;
    }

    try {
        const post = await getPostById(id)
        //TODO: Add the correct auth info once available
        res.render('posts/plant_details', {title: 'Plant', plant: post, postStates, exposureTypes, leafTypes, seedTypes, upvotesDownvotesAsAPercentage, user: {id: "6605a97814ddcdf43b5697d4"}, isLoggedIn: true})
    } catch (err) {
        console.log(err)
        res.status(500);
        next(err);
    }
}

async function postComment(req, res, next) {
    //Get the post ID from the URL
    const plant_id = req.params.id;

    //Get the text and user ID from the request
    const text = req.body.text;
    const user_id = req.body.user_id;

    //Check if the ID is valid
    if (!plant_id) {
        res.status(400);
        res.send("Invalid ID");
        return;
    }

    if (!text || !user_id) {
        res.status(400);
        res.send("Invalid body");
        return;
    }

    try {
        const post = await addComment(plant_id, {userID: user_id, content: text, likes: 0})
        res.status(200).send(post);
    } catch (err) {
        console.log(err)
        res.status(500).json({error: err});
    }
}

async function getCommentHTML(req, res) {
    //Get the plant_id and comment_id from the URL
    const plant_id = req.params.plant_id;
    const comment_id = req.params.comment_id;

    //Get the comment from the post
    const comment = await getCommentFromPost(plant_id, comment_id);

    //Render the comment HTML from the EJS template
    res.render('posts/comment', {comment: comment, isReply: false});
}

async function postReply(req, res) {
    //Get the post ID from the URL
    const plant_id = req.params.plant_id;
    const comment_id = req.params.comment_id;

    //Get the text and user ID from the request
    const text = req.body.text;
    const user_id = req.body.user_id;

    //Check if the ID is valid
    if (!plant_id) {
        res.status(400);
        res.send("Invalid ID");
        return;
    }

    if (!comment_id) {
        res.status(400);
        res.send("Invalid comment ID");
        return;
    }

    if (!text || !user_id) {
        res.status(400);
        res.send("Invalid body");
        return;
    }

    try {
        const post = await addReply(plant_id, comment_id, {userID: user_id, content: text, likes: 0})
        res.status(200).send(post);
    } catch (err) {
        console.log(err)
        res.status(500).json({error: err});
    }
}

async function getReplyHTML(req, res) {
    //Get the plant_id, comment_id, and reply_id from the URL
    const plant_id = req.params.plant_id;
    const comment_id = req.params.comment_id;
    const reply_id = req.params.reply_id;

    //Get the comment from the post
    const comment = await getCommentFromPost(plant_id, reply_id);

    //Render the comment HTML from the EJS template
    res.render('posts/comment', {comment: comment, isReply: true});
}

async function postLike(req, res) {
    //Get the plant_id and comment_id from the URL
    const plant_id = req.params.plant_id;
    const comment_id = req.params.comment_id;

    const userID = req.body.userID;

    if (!userID) {
        res.status(400);
        res.send("Invalid user ID");
        return;
    }

    //Get the comment from the post
    const post = await getPostById(plant_id);
    const comment = findComment(post.comments, comment_id);

    //Increment the likes
    comment.likes += 1;
    comment.likers.push(userID);

    //Save the post
    await post.save();

    res.status(200).send(comment);
}

async function postUnlike(req, res) {
    //Get the plant_id and comment_id from the URL
    const plant_id = req.params.plant_id;
    const comment_id = req.params.comment_id;

    const userID = req.body.userID;

    if (!userID) {
        res.status(400);
        res.send("Invalid user ID");
        return;
    }

    const post = await getPostById(plant_id);

    //Get the comment from the post
    const comment = findComment(post.comments, comment_id);

    //Increment the likes
    comment.likes -= 1;
    comment.likers = comment.likers.filter(id => id.toString() !== userID.toString());

    //Save the post
    await post.save();

    res.status(200).send(comment);

}

function upvotesDownvotesAsAPercentage(upvotes, downvotes) {
    const total = upvotes + downvotes;
    if (total === 0) {
        return 0;
    }

    const upvotePercentage = Math.floor((upvotes / total) * 100);
    const downvotePercentage = 100 - upvotePercentage;

    return {upvote: upvotePercentage, downvote: downvotePercentage};
}

module.exports = {
    getPost,
    getPlant,
    postComment,
    getCommentHTML,
    postReply,
    getReplyHTML,
    postLike,
    postUnlike
}
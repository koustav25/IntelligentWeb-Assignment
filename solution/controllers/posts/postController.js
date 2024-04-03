const {getPostById, addComment, getCommentFromPost, addReply, findComment, addSuggestion, getSuggestionFromPost,
    findSuggestion
} = require("../../model/mongodb");
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

async function postSuggestion(req, res) {
    //Get the plant_id from the URL
    const plant_id = req.params.plant_id;

    //Get the text and user ID from the request
    const text = req.body.text;
    const user_id = req.body.userID;

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
        const post = await addSuggestion(plant_id, {userID: user_id, name: text})
        res.status(200).send(post);
    } catch (err) {
        console.log(err)
        res.status(500).json({error: err});
    }
}

async function getSuggestionHTML(req, res) {
    //Get the plant_id and suggestion_id from the URL
    const plant_id = req.params.plant_id;
    const suggestion_id = req.params.suggestion_id;

    const post = await getPostById(plant_id);
    //Get the suggestion from the post
    const suggestion = findSuggestion(post.identification.potentials, suggestion_id);

    //Render the suggestion HTML from the EJS template
    //TODO: Add the correct auth info once available
    res.render('posts/suggestion', {suggestion: suggestion, identification: post.identification, user: {id: "6605a97814ddcdf43b5697d4"}, upvotesDownvotesAsAPercentage, isPoster: (suggestion.suggesting_user.toString() === "6605a97814ddcdf43b5697d4")} );

}

async function postUpvote(req, res) {
    //Get the plant_id and suggestion_id from the URL
    const plant_id = req.params.plant_id;
    const suggestion_id = req.params.suggestion_id;

    const userID = req.body.userID;

    if (!userID) {
        res.status(400);
        res.send("Invalid user ID");
        return;
    }

    //Get the suggestion from the post
    const post = await getPostById(plant_id);
    const suggestion = findSuggestion(post.identification.potentials, suggestion_id);

    //Increment the likes
    suggestion.upvotes += 1;
    suggestion.upvoters.push(userID);

    //Save the post
    await post.save();

    res.status(200).send(suggestion);

}

async function postUnupvote(req, res) {
    //Get the plant_id and suggestion_id from the URL
    const plant_id = req.params.plant_id;
    const suggestion_id = req.params.suggestion_id;

    const userID = req.body.userID;

    if (!userID) {
        res.status(400);
        res.send("Invalid user ID");
        return;
    }

    const post = await getPostById(plant_id);

    //Get the suggestion from the post
    const suggestion = findSuggestion(post.identification.potentials, suggestion_id);

    //Increment the likes
    suggestion.upvotes -= 1;
    suggestion.upvoters = suggestion.upvoters.filter(id => id.toString() !== userID.toString());

    //Save the post
    await post.save();

    res.status(200).json(suggestion);
}

async function postDownvote(req, res) {
    //Get the plant_id and suggestion_id from the URL
    const plant_id = req.params.plant_id;
    const suggestion_id = req.params.suggestion_id;

    const userID = req.body.userID;

    if (!userID) {
        res.status(400);
        res.send("Invalid user ID");
        return;
    }

    //Get the suggestion from the post
    const post = await getPostById(plant_id);
    const suggestion = findSuggestion(post.identification.potentials, suggestion_id);

    //Increment the likes
    suggestion.downvotes += 1;
    suggestion.downvoters.push(userID);

    //Save the post
    await post.save();

    res.status(200).send(suggestion);


}

async function postUndownvote(req, res) {
    //Get the plant_id and suggestion_id from the URL
    const plant_id = req.params.plant_id;
    const suggestion_id = req.params.suggestion_id;

    const userID = req.body.userID;

    if (!userID) {
        res.status(400);
        res.send("Invalid user ID");
        return;
    }

    const post = await getPostById(plant_id);

    //Get the suggestion from the post
    const suggestion = findSuggestion(post.identification.potentials, suggestion_id);

    //Increment the likes
    suggestion.downvotes -= 1;
    suggestion.downvoters = suggestion.downvoters.filter(id => id.toString() !== userID.toString());

    //Save the post
    await post.save();

    res.status(200).send(suggestion);
}

async function postAcceptSuggestion(req, res) {
    //Get the plant_id and suggestion_id from the URL
    const plant_id = req.params.plant_id;
    const suggestion_id = req.params.suggestion_id;

    const post = await getPostById(plant_id);

    //Get the index of the suggestion in the potentials array
    const index = post.identification.potentials.findIndex(suggestion => suggestion._id.toString() === suggestion_id);

    //Set is_accepted to true
    post.identification.is_accepted = true;
    post.identification.date_accepted = new Date();
    post.identification.accepted_potential = index;
    post.identification.accepted_potential_id = post.identification.potentials[index]._id;

    //TODO: Add the dbpedia URL once available

    //Save the post
    await post.save();

    res.status(200).send(post);
}

async function postUnacceptSuggestion(req, res) {
    //Get the plant_id and suggestion_id from the URL
    const plant_id = req.params.plant_id;
    const suggestion_id = req.params.suggestion_id;

    const post = await getPostById(plant_id);

    //Set is_accepted to false
    post.identification.is_accepted = false;
    post.identification.date_accepted = null;
    post.identification.accepted_potential = null;
    post.identification.accepted_potential_id = null;

    await post.save();

    res.status(200).send(post);
}

function upvotesDownvotesAsAPercentage(upvotes, downvotes) {
    const total = upvotes + downvotes;
    if (total === 0) {
        return {upvote: 50, downvote: 50};
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
    postUnlike,
    postSuggestion,
    getSuggestionHTML,
    postUpvote,
    postUnupvote,
    postDownvote,
    postUndownvote,
    postAcceptSuggestion,
    postUnacceptSuggestion
}
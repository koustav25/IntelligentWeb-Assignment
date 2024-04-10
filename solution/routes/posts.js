const express = require("express");
const router = express.Router();

const {getPost, getPlant, postComment, getCommentHTML, postReply, getReplyHTML, postLike, postUnlike, postSuggestion,
    getSuggestionHTML, postUpvote, postUnupvote, postDownvote, postUndownvote, postUnacceptSuggestion,
    postAcceptSuggestion
} = require("../controllers/posts/postController");
const {getFeed} = require("../controllers/posts/feedController");
const {getSearch} = require("../controllers/posts/searchController");
const {userInBody} = require("../middlewares/posts");

router.get("/feed", getFeed);

router.get("/plant/:id", getPlant);

router.post("/plant/:id/comment", userInBody, postComment);
router.get("/plant/:plant_id/comment/:comment_id/render", getCommentHTML);
router.post("/plant/:plant_id/comment/:comment_id/like", userInBody, postLike);
router.post("/plant/:plant_id/comment/:comment_id/unlike", userInBody, postUnlike);

router.post("/plant/:plant_id/comment/:comment_id/reply", userInBody, postReply);
router.get("/plant/:plant_id/comment/:comment_id/reply/:reply_id/render", getReplyHTML);

router.post("/plant/:plant_id/suggestion", userInBody, postSuggestion);
router.get("/plant/:plant_id/suggestion/:suggestion_id/render", getSuggestionHTML);

router.post("/plant/:plant_id/suggestion/:suggestion_id/upvote", userInBody, postUpvote);
router.post("/plant/:plant_id/suggestion/:suggestion_id/unupvote", userInBody, postUnupvote);
router.post("/plant/:plant_id/suggestion/:suggestion_id/downvote", userInBody, postDownvote);
router.post("/plant/:plant_id/suggestion/:suggestion_id/undownvote", userInBody, postUndownvote);
router.post("/plant/:plant_id/suggestion/:suggestion_id/accept", postAcceptSuggestion);
router.post("/plant/:plant_id/suggestion/:suggestion_id/unaccept", postUnacceptSuggestion);

router.get("/post", getPost);

router.get("/search", getSearch);

module.exports = router;

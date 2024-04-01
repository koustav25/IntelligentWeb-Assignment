const express = require("express");
const router = express.Router();

const {getPost, getPlant, postComment, getCommentHTML, postReply, getReplyHTML, postLike, postUnlike, postSuggestion,
    getSuggestionHTML, postUpvote, postUnupvote, postDownvote, postUndownvote
} = require("../controllers/posts/postController");
const {getFeed} = require("../controllers/posts/feedController");
const {getSearch} = require("../controllers/posts/searchController");

router.get("/feed", getFeed);

router.get("/plant/:id", getPlant);

router.post("/plant/:id/comment", postComment);
router.get("/plant/:plant_id/comment/:comment_id/render", getCommentHTML);
router.post("/plant/:plant_id/comment/:comment_id/like", postLike);
router.post("/plant/:plant_id/comment/:comment_id/unlike", postUnlike);

router.post("/plant/:plant_id/comment/:comment_id/reply", postReply);
router.get("/plant/:plant_id/comment/:comment_id/reply/:reply_id/render", getReplyHTML);

router.post("/plant/:plant_id/suggestion", postSuggestion);
router.get("/plant/:plant_id/suggestion/:suggestion_id/render", getSuggestionHTML);

router.post("/plant/:plant_id/suggestion/:suggestion_id/upvote", postUpvote);
router.post("/plant/:plant_id/suggestion/:suggestion_id/unupvote", postUnupvote);
router.post("/plant/:plant_id/suggestion/:suggestion_id/downvote", postDownvote);
router.post("/plant/:plant_id/suggestion/:suggestion_id/undownvote", postUndownvote);

router.get("/post", getPost);

router.get("/search", getSearch);

module.exports = router;

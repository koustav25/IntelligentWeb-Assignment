const express = require("express");
const router = express.Router();

const {getPost, getPlant, postComment, getCommentHTML, postReply, getReplyHTML, postLike, postUnlike} = require("../controllers/posts/postController");
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

router.get("/post", getPost);

router.get("/search", getSearch);

module.exports = router;

const express = require("express");
const router = express.Router();

const {getPost, getPlant, postComment, getCommentHTML} = require("../controllers/posts/postController");
const {getFeed} = require("../controllers/posts/feedController");
const {getSearch} = require("../controllers/posts/searchController");

router.get("/feed", getFeed);

router.get("/plant/:id", getPlant);
router.post("/plant/:id/comment", postComment);
router.get("/plant/:plant_id/comment/:comment_id/render", getCommentHTML);

router.get("/post", getPost);

router.get("/search", getSearch);

module.exports = router;

const express = require("express");
const router = express.Router();

const {getPost, getPlant} = require("../controllers/posts/postController");
const {getFeed} = require("../controllers/posts/feedController");
const {getSearch} = require("../controllers/posts/searchController");

router.get("/feed", getFeed);

router.get("/plant/:id", getPlant);

router.get("/post", getPost);

router.get("/search", getSearch);

module.exports = router;

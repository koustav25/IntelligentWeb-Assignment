const express = require("express");
const feedApiController = require("../controllers/api/feed")
const router = express.Router();

router.get("/feed", feedApiController.fetchPosts);

module.exports = router;

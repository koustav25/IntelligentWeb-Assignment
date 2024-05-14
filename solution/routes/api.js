const express = require("express");
const feedApiController = require("../controllers/api/feed")
const notificationApiController = require("../controllers/api/notification")
const postApiController = require("../controllers/api/post");
const router = express.Router();

//Comment Sync routes
router.get("/plant/:plant_id/comment/since", postApiController.getCommentsSinceTime);
router.get("/plant/:plant_id/replies/since", postApiController.getRepliesSinceTime);

router.get("/feed", feedApiController.fetchPosts);
router.get("/get-notifications", notificationApiController.getNotifications);
router.get("/new-notification-count", notificationApiController.getNotificationCount);
router.get("/get-plant-owner", notificationApiController.getPostOwner)
router.get("/get-comment-owner", notificationApiController.getCommentOwner)

router.post("/mark-all-notifications-as-read", notificationApiController.markAllAsRead)
router.post("/view-notification", notificationApiController.viewNotification)

module.exports = router;

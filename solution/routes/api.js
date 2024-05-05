const express = require("express");
const feedApiController = require("../controllers/api/feed")
const notificationApiController = require("../controllers/api/notification")
const router = express.Router();

router.get("/feed", feedApiController.fetchPosts);
router.get("/get-notifications", notificationApiController.getNotifications);
router.get("/new-notification-count", notificationApiController.getNotificationCount);
router.get("/get-plant-owner", notificationApiController.getPostOwner)
router.get("/get-comment-owner", notificationApiController.getCommentOwner)

router.post("/mark-all-notifications-as-read", notificationApiController.markAllAsRead)
router.post("/view-notification", notificationApiController.viewNotification)
module.exports = router;

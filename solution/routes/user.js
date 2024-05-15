const express = require('express');
const router = express.Router();

const {getProfile, getNotifications, postNewUserPassword, updateProfile,markAllNotificationsAsRead} = require("../controllers/user/userController");

router.get('/notifications', getNotifications);
router.post('/notifications/markAllRead', markAllNotificationsAsRead);

router.get('/profile', getProfile);

router.post('/updateProfile',updateProfile)

router.post('/:id/password', postNewUserPassword);

module.exports = router;

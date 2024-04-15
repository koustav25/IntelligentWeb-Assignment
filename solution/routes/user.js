const express = require('express');
const router = express.Router();

const {getProfile, getNotifications, postNewUserPassword} = require("../controllers/user/userController");

router.get('/notifications', getNotifications);

router.get('/profile', getProfile);

router.post('/:id/password', postNewUserPassword);

module.exports = router;

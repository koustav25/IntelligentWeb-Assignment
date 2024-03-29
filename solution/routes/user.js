const express = require('express');
const router = express.Router();

const {getProfile, getNotifications,getSearch} = require("../controllers/user/userController");

router.get('/notifications', getNotifications);

router.get('/profile', getProfile);

module.exports = router;

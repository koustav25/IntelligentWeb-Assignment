const express = require('express');
const router = express.Router();

const {getLandingPage} = require("../controllers/indexController");

/* GET home page. */
router.get('/', getLandingPage);

module.exports = router;

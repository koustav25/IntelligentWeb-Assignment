const express = require('express');
const router = express.Router();

const {getLandingPage} = require("../controllers/indexController");
const {authInfo} = require("../middlewares/auth");

/* GET home page. */
router.get('/', authInfo, getLandingPage);

module.exports = router;

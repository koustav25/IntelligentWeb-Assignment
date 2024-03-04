const express = require("express");
const router = express.Router();

const {getLogin, getRegister} = require("../controllers/auth/authController");

router.get("/login", getLogin);

router.get("/logout", function(req, res, next) {
    res.send("[Logout Handler] Not implemented yet.");
});

router.get("/register", getRegister);

module.exports = router;
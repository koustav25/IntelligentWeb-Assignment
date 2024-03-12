const express = require("express");
const router = express.Router();

const {getLogin, getRegister, registerUser,loginUser} = require("../controllers/auth/authController");

router.get("/login", getLogin);
router.post("/login", loginUser)
router.get("/logout", function(req, res, next) {
    res.send("[Logout Handler] Not implemented yet.");
});

router.get("/register", getRegister);
router.post("/register", registerUser)

module.exports = router;
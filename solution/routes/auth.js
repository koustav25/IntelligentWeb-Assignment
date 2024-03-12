const express = require("express");
const router = express.Router();
const {authenticate} = require("../auth/passportAuth")
const {isAuthenticated} = require("../middlewares/auth");

const {getLogin, getRegister, registerUser,logoutUser} = require("../controllers/auth/authController");

router.get("/login", getLogin);
router.post("/login", authenticate)

router.post("/logout", isAuthenticated, logoutUser)

router.get("/register", getRegister);
router.post("/register", registerUser)

module.exports = router;
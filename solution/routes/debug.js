const express = require("express");
const router = express.Router();

const {getDebug, getDebugRoutes} = require("../controllers/debug/debugController");

router.get("/", getDebug);

router.get("/routes", getDebugRoutes);

module.exports = router;
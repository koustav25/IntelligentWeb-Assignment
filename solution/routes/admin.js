const express = require("express");
const router = express.Router();

const {getAdminPlantDetails, getAdminPlants, getAdminUserDetails, getAdminUsers, getAdminDashboard, getAdminSettings} = require("../controllers/admin/adminController");

router.get("/", getAdminDashboard);

router.get("/plants", getAdminPlants);

router.get("/plants/:id", getAdminPlantDetails);

router.get("/settings", getAdminSettings);

router.get("/users", getAdminUsers);

router.get("/users/:id", getAdminUserDetails);


module.exports = router;
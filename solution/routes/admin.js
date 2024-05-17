const express = require("express");
const router = express.Router();

const {getAdminPlantDetails, getAdminPlants, getAdminUserDetails, getAdminUsers, getAdminDashboard, getAdminSettings,
    postNewUserPassword, postUserUpdate, deletePost,editPost
} = require("../controllers/admin/adminController");

router.get("/", getAdminDashboard);

router.get("/plants", getAdminPlants);

router.get("/plants/:id", getAdminPlantDetails);

router.get("/users", getAdminUsers);

router.get("/users/:id", getAdminUserDetails);
router.post("/users/:id/update", postUserUpdate);

router.post("/plant/delete", deletePost)
router.post("/plant/edit", editPost)

module.exports = router;
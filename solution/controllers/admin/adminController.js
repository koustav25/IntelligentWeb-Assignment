const {getUsers, getMockFeed, getMockPlants} = require("../../util/mock/mockData");
const {getAllUsers, getUserById, getUserByIdWithPosts, updateUser} = require("../../model/mongodb");
const roleTypes = require("../../model/enum/roleTypes");

function getAdminDashboard(req, res) {
    //TODO: Add admin dashboard rendering logic here
    //res.render('admin/dashboard', { title: 'Admin Dashboard' });

    res.render("admin/index", {isLoggedIn: req.isLoggedIn})
}

async function getAdminUsers(req, res) {
    const users = await getAllUsers()
    res.render("admin/users", {isLoggedIn: req.isLoggedIn, users, roleTypes})
}

async function getAdminUserDetails(req, res) {
    const {id} = req.params;

    const user = (await getUserByIdWithPosts(id));

    res.render("admin/user_details", {isLoggedIn: req.isLoggedIn, userDetails: user, roleTypes})
}

async function postUserUpdate(req, res) {
    try {
        const {id} = req.params;

        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const email = req.body.email;
        const username = req.body.username;
        const role = req.body.role;

        if (!first_name || !last_name || !email || !username || !role) {
            return res.status(400).send({message: "Please fill in all fields"});
        }

        const user = await getUserById(id);

        if (!user) {
            return res.status(404).send({message: "User not found"});
        }

        //Check if the role of the user being changed is <= the role of the user making the change
        //TODO: Remove true once authentication is implemented
        if (req.user.role <= user.role && req.user.role >= roleTypes.ADMIN) {
            return res.status(403).send({message: "You do not have permission to change this user's role"});
        }

        await updateUser(id, {first_name, last_name, email, username, role})

        res.status(200).send("User updated successfully");
    } catch (error) {
        console.log(error)
        res.status(500).send({message: "An error occurred"});
    }
}

function getAdminPlants(req, res) {
    //TODO: Add admin plants rendering logic here
    const plants = getMockPlants()
    res.render('admin/plants', { plants, isLoggedIn: req.isLoggedIn });
}

function getAdminPlantDetails(req, res) {
    //TODO: Add admin plant details rendering logic here
    //res.render('admin/plant-details', { title: 'Admin Plant Details' });

    res.send('Admin Plant Details');
}

function getAdminSettings(req, res) {
    //TODO: Add admin settings rendering logic here
    //res.render('admin/settings', { title: 'Admin Settings' });

    res.send('Admin Settings');
}

module.exports = {
    getAdminDashboard,

    getAdminUsers,
    getAdminUserDetails,
    postUserUpdate,

    getAdminPlants,
    getAdminPlantDetails,
    getAdminSettings
}
const {getUsers, getMockFeed, getMockPlants} = require("../../util/mock/mockData");
const {getAllUsers, getUserById, getUserByIdWithPosts, updateUser, getAllPosts, getPostById,deletePostFromDb, updatePost} = require("../../model/mongodb");
const roleTypes = require("../../model/enum/roleTypes");
const postStates = require("../../model/enum/postStates");
const exposureTypes = require("../../model/enum/exposureTypes")
const leafTypes = require("../../model/enum/leafTypes")
const seedTypes = require("../../model/enum/seedTypes")
function getAdminDashboard(req, res) {
    res.render("admin/index", {isLoggedIn: req.isLoggedIn, user:req.user})
}

async function getAdminUsers(req, res) {
    const users = await getAllUsers()
    res.render("admin/users", {isLoggedIn: req.isLoggedIn, users, roleTypes, user:req.user})
}

async function getAdminUserDetails(req, res) {
    const {id} = req.params;

    const user = (await getUserByIdWithPosts(id));

    res.render("admin/user_details", {isLoggedIn: req.isLoggedIn, userDetails: user, roleTypes,postStates, user:req.user})
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

async function getAdminPlants(req, res) {
    const plants = await getAllPosts()
    res.render('admin/plants', { plants, isLoggedIn: req.isLoggedIn, user:req.user, postStates });
}

async function getAdminPlantDetails(req, res) {
    const { id } = req.params
    const post = await getPostById(id)
    res.render('admin/plant_details', { title: 'Admin Plant Details', post , isLoggedIn: req.isLoggedIn, user: req.user, exposureTypes, leafTypes, seedTypes });
}

async function deletePost(req,res) {
    try {
        if (!req.body.postID) {
            return res.status(404).send({message: "User not found"});
        }
        await deletePostFromDb(req.body.postID)
        return res.status(200)
    }catch(e){
        console.log(e.message)
        res.status(500).json({})
    }

}

async function editPost(req,res) {
    try {
        const {data, postID} = req.body
        if (!postID || !data) {
            return res.status(404).send({message: "Post not found"});
        }
        const locationData = {
            location_name: data.location_name,
            latitude: data.latitude,
            longitude: data.longitude
        };

        const postObject = {
            title: data.title,
            seen_at: data.seen_at,
            description: data.description,
            location: locationData,
            details: {
                height: data.height,
                spread: data.spread,
                exposure: data.sun_exposure,
                has_flowers: data.has_flowers,
                colour: parseInt(data.flower_colour.replace("#", ""), 16),
                leaf_type: data.leaf_type,
                seed_type: data.seed_type
            },
        }

        await updatePost(postID, postObject)
        return res.status(200).send()
    }catch (e){
        console.log(e.message)
        res.status(500).json({})
    }
}


module.exports = {
    getAdminDashboard,
    getAdminUsers,
    getAdminUserDetails,
    postUserUpdate,
    deletePost,
    getAdminPlants,
    getAdminPlantDetails,
    editPost
}
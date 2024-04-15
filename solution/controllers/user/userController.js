const { getUserNotifications } = require("../../util/mock/mockData")
const {getUserById} = require("../../model/mongodb");

const {promisify} = require('node:util');
const {randomBytes, pbkdf2} = require('node:crypto');
const pbkdf2Promise = promisify(pbkdf2);

async function getProfile(req, res) {
    //TODO: Update to use req.user.id once authentication is implemented
    const id = "6605a97814ddcdf43b5697d4" //req.user.id;

    const userDetails = await getUserById(id);
    res.render('user/profile', {isLoggedIn: true, user: {id: 1}, userDetails});
}

async function postNewUserPassword(req, res) {
    try {
        const {id} = req.params;

        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;

        //Check the passwords exist
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).send({message: "Please fill in all fields"});
        }

        const user = await getUserById(id);

        if (!user) {
            return res.status(404).send({message: "User not found"});
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).send({message: "Passwords do not match"});
        }

        //Hash the old password and compare
        const oldPasswordHash = await pbkdf2Promise(oldPassword, user.salt, 310000, 32, 'sha256');

        if (oldPasswordHash !== user.password) {
            return res.status(400).send({message: "Old password is incorrect"});
        }

        //Hash the new password and save
        const newSalt = randomBytes(16);
        const newPasswordHash = await pbkdf2Promise(newPassword, newSalt, 310000, 32, 'sha256');

        user.salt = newSalt;
        user.password = newPasswordHash;

        await user.save();

        res.status(200).send("Password changed successfully");
    } catch (error) {
        console.log(error)
        res.status(500).send({message: "An error occurred"});
    }
}

function getNotifications(req, res) {
    const notifications = getUserNotifications()

    res.render('user/notifications', {title: 'Notifications', notifications, user: {id: 1}});
}

module.exports = {
    getProfile,
    postNewUserPassword,

    getNotifications
}
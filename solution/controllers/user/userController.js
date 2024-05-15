const { getUserNotifications } = require("../../util/mock/mockData")
const {getUserById, updateUser, getAllNotifications} = require("../../model/mongodb");
const postStates = require("../../model/enum/postStates")
const {promisify} = require('node:util');
const {randomBytes, pbkdf2} = require('node:crypto');
const roleTypes = require("../../model/enum/roleTypes");
const pbkdf2Promise = promisify(pbkdf2);
const { notificationTypes } = require('../../model/enum/notificationTypes');
const { notificationSates } = require('../../model/enum/notificationStates');

async function getProfile(req, res) {
    const id = req.user.id;

    const userDetails = await getUserById(id);
    res.render('user/profile', {isLoggedIn: req.isLoggedIn, userDetails, postStates});
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

async function updateProfile(req,res){
    try {
        const id = req.body.user_id;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const email = req.body.email;
        const username = req.body.username;

        if(!id){
            return res.status(400).send({message: "ID cannot be null"})
        }

        if (!first_name || !last_name || !username || !email ) {
            return res.status(400).send({message: "Please fill in all fields"});
        }



        await updateUser(id, {first_name, last_name, email, username})

        res.status(200).send("Profile Updated Successfully");
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page, limit, sortByDate, notificationType } = req.query;
        let notifications = await getAllNotifications(userId, parseInt(page, 10) || 0, parseInt(limit, 10) || 10);
        if (notificationType) {
            notifications = notifications.filter(n => n.notification_type === notificationTypes[notificationType]);
        }
        if (sortByDate === 'oldest') {
            notifications.reverse();
        }
        res.render('user/notifications', {
            title: 'Your Notifications',
            notifications,
            user: req.user,
            isLoggedIn: true
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).send('Internal Server Error');
    }
};

async function markAllNotificationsAsRead(req, res) {
    try {
        const userId = req.user.id;
        await markAllNotificationAsRead(userId);
        res.redirect('user/notifications');
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getProfile,
    postNewUserPassword,
    updateProfile,
    getNotifications,
    markAllNotificationsAsRead
}
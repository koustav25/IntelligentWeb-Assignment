const { getUserNotifications } = require("../../util/mock/mockData")
function getProfile(req, res) {
    //TODO: Render the profile view
    //res.render('profile', { title: 'Profile' });

    res.send('Profile');
}

function getNotifications(req, res) {
    const notifications = getUserNotifications()

    res.render('user/notifications', {title: 'Notifications', notifications, user: {id: 1}});
}

module.exports = {
    getProfile,
    getNotifications
}
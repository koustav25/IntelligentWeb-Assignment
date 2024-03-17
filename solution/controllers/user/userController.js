const { getUserNotifications } = require("../../util/mock/mockData")
const {getMockData} = require("../../util/mock/mockData")
function getProfile(req, res) {
    //TODO: Render the profile view
   const profile = getMockData();



    res.render('user/profile',{profile});
}

function getNotifications(req, res) {
    const notifications = getUserNotifications()

    res.render('user/notifications', {title: 'Notifications', notifications, user: {id: 1}});
}

module.exports = {
    getProfile,
    getNotifications
}
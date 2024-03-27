const { getUserNotifications,getMockSearch } = require("../../util/mock/mockData")
function getProfile(req, res) {
    //TODO: Render the profile view
    res.render('user/profile',{});
}

function getNotifications(req, res) {
    const notifications = getUserNotifications()

    res.render('user/notifications', {title: 'Notifications', notifications, user: {id: 1}});
}

function getSearch(req,res){

    const getData = getMockSearch();
        res.render('posts/search',{getData});

}

module.exports = {
    getProfile,
    getNotifications,
    getSearch
}
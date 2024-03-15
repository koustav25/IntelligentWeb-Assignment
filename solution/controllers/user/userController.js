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

function getSearchAndSorting(req,res){

        const plantPost = [
            {user:'Victor',DateTime:'2023-12-25 10:30:00', Location:'London',Comments:'Rose Plant'},
            {user:'Prince',DateTime:'2023-11-10 12:30:09', Location:'New York', Comments:'Sunflower Plant is beautiful'},
            {user:'David',DateTime: '2023-09-10 00:30:49',Location:'Bangalore',Comments:'Coconut Plant'},
        ];
        res.render('user/search',{plantPost});

}

module.exports = {
    getProfile,
    getNotifications,
    getSearchAndSorting
}
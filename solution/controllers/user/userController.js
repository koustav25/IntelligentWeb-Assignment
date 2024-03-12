function getProfile(req, res) {
    //TODO: Render the profile view
    //res.render('profile', { title: 'Profile' });

    res.send('Profile');
}

function getNotifications(req, res) {
    //TODO: Render the notifications view
    //res.render('notifications', { title: 'Notifications' });

    res.send('Notifications');
}

module.exports = {
    getProfile,
    getNotifications
}
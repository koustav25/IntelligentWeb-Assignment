const {getUsers} = require("../../util/mock/mockData");

function getAdminDashboard(req, res) {
    //TODO: Add admin dashboard rendering logic here
    //res.render('admin/dashboard', { title: 'Admin Dashboard' });

    res.render("admin/index", {isLoggedIn: true})
}

function getAdminUsers(req, res) {
    //TODO: Add admin users rendering logic here
    //res.render('admin/users', { title: 'Admin Users' });
    const users = getUsers()
    res.render("admin/users", {isLoggedIn: true, searchQuery:"lorem ipsum", users})
}

function getAdminUserDetails(req, res) {
    //TODO: Add admin user details rendering logic here
    //res.render('admin/user-details', { title: 'Admin User Details' });

    res.send('Admin User Details');
}

function getAdminPlants(req, res) {
    //TODO: Add admin plants rendering logic here
    //res.render('admin/plants', { title: 'Admin Plants' });

    res.send('Admin Plants');
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
    getAdminPlants,
    getAdminPlantDetails,
    getAdminSettings
}
function getLandingPage(req, res) {
    //TODO: Handle landing page logic
    //TODO: Check if user is logged in
    res.render('index', { title: 'Intelligent Web Project Team', isLoggedIn: true});
}

module.exports = {
    getLandingPage
}
function getLandingPage(req, res) {
    res.render('index', { title: 'Intelligent Web Project Team', isLoggedIn: req.isLoggedIn, user: req.user});
}

module.exports = {
    getLandingPage
}
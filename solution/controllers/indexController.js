function getLandingPage(req, res) {
    res.render('index', { title: 'Intelligent Web Project Team', isLoggedIn: req.isLoggedIn});
}

module.exports = {
    getLandingPage
}
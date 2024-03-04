function getLandingPage(req, res) {
    //TODO: Handle landing page logic
    res.render('index', { title: 'Intelligent Web Project Team' });
}

module.exports = {
    getLandingPage
}
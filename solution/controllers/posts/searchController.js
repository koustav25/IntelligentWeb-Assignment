function getSearch(req, res) {
    const getData = {};
    res.render('posts/search',{isLoggedIn: true, getData });
}

module.exports = {
    getSearch
}
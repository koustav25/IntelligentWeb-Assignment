const {getMockSearch} = require("../../util/mock/mockData");

function getSearch(req, res) {
    const getData = getMockSearch();
    res.render('posts/search',{isLoggedIn: true, getData});
}

module.exports = {
    getSearch
}
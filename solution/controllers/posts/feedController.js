const {getMockFeed} = require("../../util/mock/mockData")
const { getFeedPosts } = require("../../model/mongodb")

async function getFeed(req, res) {
    res.render('posts/feed', {title: 'Feed', isLoggedIn: req.isLoggedIn, user: req.user})
}

module.exports = {
    getFeed
}
const {getMockFeed} = require("../../util/mock/mockData")
const { getFeedPosts } = require("../../model/mongodb")

async function getFeed(req, res) {
    console.log(req.user)
    res.render('posts/feed', {title: 'Feed', isLoggedIn: req.isLoggedIn})
}

module.exports = {
    getFeed
}
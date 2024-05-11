const {getMockFeed} = require("../../util/mock/mockData")
const { getFeedPosts } = require("../../model/mongodb")
const postStates = require("../../model/enum/postStates")

async function getFeed(req, res) {
    res.render('posts/feed', {title: 'Feed', isLoggedIn: req.isLoggedIn ,postStates})
}

module.exports = {
    getFeed
}
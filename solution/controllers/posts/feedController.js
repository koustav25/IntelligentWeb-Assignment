const {getMockFeed} = require("../../util/mock/mockData")
const { getFeedPosts } = require("../../model/mongodb")

async function getFeed(req, res) {
    //TODO: Render the feed view
    const posts = await getFeedPosts(1)
    res.render('posts/feed', {title: 'Feed', isLoggedIn: true, posts})
}

module.exports = {
    getFeed
}
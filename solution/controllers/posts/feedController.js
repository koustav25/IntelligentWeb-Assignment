const { getMockFeed } = require("../../util/mock/mockData")

function getFeed(req, res) {
    //TODO: Render the feed view
    const posts = getMockFeed()
    res.render('posts/feed', {title: 'Feed', isLoggedIn: true, posts})
}

module.exports = {
    getFeed
}
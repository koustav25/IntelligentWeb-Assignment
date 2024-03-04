function getFeed(req, res) {
    //TODO: Render the feed view
    //res.render('feed', { title: 'Feed' })

    res.send('Feed')
}

module.exports = {
    getFeed
}
const { getFeedPosts } = require("../../model/mongodb")
const fetchPosts = async (req, res, next) => {
    const page = req.query.page
    const posts = await getFeedPosts(page)

    res.status(200).json(posts)
}

module.exports = {
    fetchPosts
}
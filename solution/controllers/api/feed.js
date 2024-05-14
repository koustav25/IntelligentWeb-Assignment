const { getFeedPosts } = require("../../model/mongodb")

const fetchPosts = async (req, res, next) => {
    const { page, state, sortBy } = req.query;
    try {
        let posts;
        if (state || sortBy) {
            // If state is provided, apply the state filter
            posts = await getFeedPosts(page, 10,  state, sortBy);
        } else {
            // If state is not provided, fetch all posts
            posts = await getFeedPosts(page);
        }
        res.status(200).json(posts);
    } catch (e) {
        res.status(500).json([]);
    }
};

module.exports = {
    fetchPosts
}
const { getFeedPosts } = require("../../model/mongodb")

const fetchPosts = async (req, res, next) => {
    const {page, state, sortBy} = req.query;
    try {
        let posts;
        const filters = {};
        if (state) filters.state = state;
        if (sortBy) filters.sortBy = sortBy;
        if (state || sortBy) {

            // If state is provided, apply the state filter
            posts = await getFeedPosts(page, 10, filters);
        } else {
            // If state is not provided, fetch all posts
            posts = await getFeedPosts(page);
        }
        res.status(200).json({posts})
    } catch (e) {
        console.log(e)
        res.status(500).json([])
    }
}

const fetchMissingPosts = async (req,res,next) => {
    try {
        const { lastPostDateTime } = req.body;
        const newPosts = await getFeedPosts(1, 10, {createdAt: {$gt: new Date(lastPostDateTime)}})
        res.status(200).json({newPosts})
    }catch(e){
        res.status(500).json({newPosts: []})
    }

}
module.exports = {
    fetchPosts,
    fetchMissingPosts
}
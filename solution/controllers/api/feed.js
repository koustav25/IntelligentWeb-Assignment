const { getFeedPosts } = require("../../model/mongodb")
const fetchPosts = async (req, res, next) => {
    try {
        const lastPostCreatedAt = req.query.lastPostCreatedAt ? new Date(req.query.lastPostCreatedAt) : null;
        const posts = await getFeedPosts(lastPostCreatedAt)
        res.status(200).json({posts})
    }catch (e){
        console.log(e)
        res.status(500).json([])
    }

}

const fetchMissingPosts = async (req,res,next) => {
    try {
        const { lastPostDateTime } = req.body;
        const newPosts = await getFeedPosts(null, 10, {createdAt: {$gt: new Date(lastPostDateTime)}})
        res.status(200).json({newPosts})
    }catch(e){
        res.status(500).json({newPosts: []})
    }

}
module.exports = {
    fetchPosts,
    fetchMissingPosts
}
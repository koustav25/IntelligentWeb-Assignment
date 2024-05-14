const { getFeedPosts } = require("../../model/mongodb")
const fetchPosts = async (req, res, next) => {
    const page = req.query.page
    try {
        const posts = await getFeedPosts(page)
        res.status(200).json({posts})
    }catch (e){
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
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

module.exports = {
    fetchPosts
}
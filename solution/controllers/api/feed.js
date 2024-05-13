const { getFeedPosts } = require("../../model/mongodb")
// const fetchPosts = async (req, res, next) => {
//     const page = req.query.page
//     try {
//         const posts = await getFeedPosts(page)
//         res.status(200).json(posts)
//     }catch (e){
//         res.status(500).json([])
//     }
//
// }

const fetchPosts = async (req, res, next) => {
    const { page, state } = req.query;
    try {
        let posts;
        if (state) {
            // If state is provided, apply the state filter
            posts = await getFeedPosts(page, 10,  state);
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
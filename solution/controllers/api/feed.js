const {getFeedPosts} = require("../../model/mongodb")
const {SortOrder} = require("../../model/enum/sortOrders");

const fetchPosts = async (req, res, next) => {
    try {
        const PAGE_LIMIT = 10;
        const lastPostId = req.query.lastPostId ? req.query.lastPostId : null;
        const filter = (req.query.filter) ? parseInt(req.query.filter) : undefined;
        const sortBy = parseInt(req.query.sortBy);

        let posts;

        const filters = {};

        if (filter !== undefined) filters.state = filter;

        posts = await getFeedPosts(lastPostId, PAGE_LIMIT, filters, sortBy);

        res.status(200).json({posts})
    } catch (e) {
        console.log(e)
        res.status(500).json([])
    }
}

const fetchMissingPosts = async (req, res, next) => {
    const PAGE_LIMIT = 10;
    try {
        const lastPostDateTime = req.body.lastPostDateTime;
        const filter = (req.body.filter) ? parseInt(req.body.filter) : undefined;
        const sortBy = parseInt(req.body.sortBy);

        let posts;
        let filters;

        //If the sort order is by oldest, we need to get the posts that are older than the last post
        if (sortBy === SortOrder.OLDEST) {
            filters = {createdAt: {$lt: new Date(lastPostDateTime)}};
        } else if (sortBy === SortOrder.RECENT) {
            filters = {createdAt: {$gt: new Date(lastPostDateTime)}};
        }

        if (filter) filters.state = filter;

        const newPosts = await getFeedPosts(null, 10, filters, sortBy);
        res.status(200).json({newPosts})
    } catch (e) {
        res.status(500).json({newPosts: []})
    }

}
module.exports = {
    fetchPosts,
    fetchMissingPosts
}
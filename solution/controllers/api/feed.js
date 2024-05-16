const {getFeedPosts} = require("../../model/mongodb")
const {SortOrder} = require("../../model/enum/sortOrders");

const fetchPosts = async (req, res, next) => {
    try {
        const PAGE_LIMIT = 10;
        const lastPostId = req.query.lastPostId ? req.query.lastPostId : null;
        const filter = (req.query.filter) ? parseInt(req.query.filter) : undefined;
        const sortBy = parseInt(req.query.sortBy);

        let latitude = null;
        let longitude = null;

        if (sortBy === SortOrder.DISTANCE) {
            //Get the latitude and longitude of the user from the request
            latitude = req.query.lat;
            longitude = req.query.lon;

            //If the latitude and longitude are not provided, set the latitude and longitude to null
            if (latitude === undefined || longitude === undefined) {
                latitude = null;
                longitude = null;
            }

            //If the latitude and longitude are provided, convert them to numbers
            if (latitude !== null && longitude !== null) {
                latitude = parseFloat(latitude);
                longitude = parseFloat(longitude);
            }

            //If the latitude and longitude are not valid numbers, set them to null
            if (isNaN(latitude) || isNaN(longitude)) {
                latitude = null;
                longitude = null;
            }
        }

        let posts;

        const filters = {};

        if (filter !== undefined) filters.state = filter;

        posts = await getFeedPosts(lastPostId, PAGE_LIMIT, filters, sortBy, latitude, longitude);

        res.status(200).json({posts})
    } catch (e) {
        console.log(e)
        res.status(500).json([])
    }
}

function haversine_distance(lat1, lon1, lat2, lon2) {
    //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
    const R = 6371; // The radius of the earth in km

    const lat_diff = degreesToRadians(lat2-lat1);
    const lon_diff = degreesToRadians(lon2-lon1);

    const sin_lat = Math.sin(lat_diff/2);
    const sin_lon = Math.sin(lon_diff/2);
    const sin_lat_sq = sin_lat * sin_lat;
    const sin_lon_sq = sin_lon * sin_lon;

    //A = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
    const a = sin_lat_sq + Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * sin_lon_sq;

    const root_a = Math.sqrt(a);
    const root_1_minus_a = Math.sqrt(1-a);

    //C = 2 * atan2( √a, √(1−a) )
    const c = 2 * Math.atan2(root_a, root_1_minus_a);

    //D = R ⋅ c
    const d = R * c; // The distance in km

    return d;
}

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
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
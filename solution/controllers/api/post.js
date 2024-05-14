const mongodb = require("../../model/mongodb");

/**
 * Gets all comment objects that were created after a specified time
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function getCommentsSinceTime(req, res) {
    //Check if the time is valid and exists
    const time = req.query.time;
    const post_id = req.params.plant_id;

    if (!time) {
        res.status(400);
        res.send("Invalid time");
        return;
    }

    //Ensure the time is a valid Date object
    const date = new Date(time);

    if (isNaN(date.getTime())) {
        res.status(400);
        res.send("Invalid time");
        return;
    }

    //Get the comments since the time
    const comments = await mongodb.getCommentsSinceTime(post_id, date);

    res.status(200).json(comments);
}

/**
 * Gets all reply objects that were created after a specified time.
 * This function excludes any replies that were created on posts created after the specified time as
 * any replies to those are already handled by the getCommentsSinceTime function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function getRepliesSinceTime(req, res) {
    //Check if the time is valid and exists
    const time = req.query.time;
    const post_id = req.params.plant_id;

    if (!time) {
        res.status(400);
        res.send("Invalid time");
        return;
    }

    //Ensure the time is a valid Date object
    const date = new Date(time);

    if (isNaN(date.getTime())) {
        res.status(400);
        res.send("Invalid time");
        return;
    }

    //Get the comments since the time
    const replies = await mongodb.getRepliesSinceTime(post_id, date);

    res.status(200).json(replies);
}

module.exports = {
    getCommentsSinceTime,
    getRepliesSinceTime
}
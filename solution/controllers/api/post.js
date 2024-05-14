const mongodb = require("../../model/mongodb");

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
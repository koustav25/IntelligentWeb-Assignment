exports.userInBody = (req, res, next) => {
    const userID = req.body.user_id;

    if (!userID) {
        res.status(400);
        res.send("Invalid user ID");
        return;
    }

    next();
}
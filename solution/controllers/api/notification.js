const {getCommentOwnerId, getNotificationCount: getNotificationCountDB, getPostOwner: getPostOwnerDB, viewNotification : viewNotificationDB,markAllNotificationAsRead,
    getAllNotifications
} = require("../../model/mongodb")

async function getNotificationCount(req, res, next) {
    try {
        const notificationCount = await getNotificationCountDB(req.user.id)
        res.json({count: notificationCount, user_id: req.user.id})
    } catch (e) {
        next(e)
    }
}

async function getPostOwner(req, res, next) {
    try {
        const {plantID} = req.query
        const post = await getPostOwnerDB(plantID)
        res.json({owner: post.posting_user._id})
    } catch (e) {
        next(e)
    }
}

async function getCommentOwner(req,res,next) {
    try {
        const {commentID, plantID} = req.query
        const commentOwner = await getCommentOwnerId(plantID, commentID)
        res.json({owner: commentOwner})
    }catch (e){
        next(e)
    }
}
async function viewNotification(req, res, next) {
    try {
        const {notificationID} = req.body
        const view = await viewNotificationDB(notificationID);
        res.status(200)
    } catch (e) {
        next(e)
    }
}

async function  getNotifications(req,res,next) {
    try {
        const page = req.query.page ? req.query.page : 0;
        const notifications = await getAllNotifications(req.user.id, page)
        res.status(200).json({notifications})
    }catch(e) {
        console.log(e)
        next(e)
    }

}

async function markAllAsRead(req,res,next) {
    try {
        await markAllNotificationAsRead(req.user.id)
        res.status(200).send()
    }catch(e){
        next(e)
    }
}

module.exports = {
    markAllAsRead,
    getNotifications,
    getCommentOwner,
    viewNotification,
    getPostOwner,
    getNotificationCount
}
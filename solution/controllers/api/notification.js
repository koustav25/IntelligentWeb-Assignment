const {getCommentOwnerId, getNotificationCount: getNotificationCountDB, getPostOwner: getPostOwnerDB, viewNotification : viewNotificationDB,markAllNotificationAsRead,
    getAllNotifications, deleteLikeNotificationByCommentId
} = require("../../model/mongodb")
const notificationTypes = require("../../model/enum/notificationTypes");

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
        const n = await viewNotificationDB(notificationID);
        res.status(200).json({notification: n})
    } catch (e) {
        next(e)
    }
}

async function  getNotifications(req,res,next) {
    const PAGE_LIMIT = 10;
    try {
        const page = req.query.page ? req.query.page : 0;
        const userId = req.user.id;

        const sort = req.query.sort || 'recent';
        const filter = req.query.filter || 'all';

        let filters = {};
        switch (filter) {
            case 'all':
                break;
            case 'user':
                filters.notification_type = { $in: [notificationTypes.NEW_COMMENT, notificationTypes.NEW_REPLY] };
                break;
            case 'comments':
                filters.notification_type = notificationTypes.NEW_REPLY;
                break;
            default:
                break;
        }

        let order;
        switch (sort) {
            case 'recent':
                order = -1;
                break;
            case 'oldest':
                order = 1;
                break;
            default:
                order = -1;
                break;
        }

        const notifications = await getAllNotifications(userId, page, PAGE_LIMIT, filters, order)
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
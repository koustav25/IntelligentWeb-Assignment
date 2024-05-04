const NEW_COMMENT = 0;
const NEW_REPLY = 1;
const NEW_LIKE = 2;
const NEW_IDENTIFICATION = 3;

const notificationTypes = {
    NEW_COMMENT,
    NEW_REPLY,
    NEW_LIKE,
    NEW_IDENTIFICATION,

    notificationTypeToString: (notificationType) => {
        switch (notificationType) {
            case NEW_COMMENT:
                return 'New Comment';
            case NEW_REPLY:
                return 'New Reply';
            case NEW_LIKE:
                return 'New Like';
            case NEW_IDENTIFICATION:
                return 'New Identification';
            default:
                return 'Unknown';
        }
    },

    notificationTypeToContent: (notificationType, plantName, commentAuthorFullName, content) => {
        switch (notificationType) {
            case NEW_COMMENT:
                return {
                    title: `Your post ${plantName} has a new comment!`,
                    body: `${commentAuthorFullName} added a comment: "${content.length > 30 ? content.slice(0,30): content}..."`
                }
            case NEW_REPLY:
                return {
                    title: `Your comment under ${plantName} has a new reply!`,
                    body: `${commentAuthorFullName} replied to your comment: "${content.length > 30 ? content.slice(0,30): content}..."`
                }
            case NEW_LIKE:
                return {
                    title: `Your comment under ${plantName} was liked!`,
                    body: `${commentAuthorFullName} liked your comment: "${content.length > 30 ? content.slice(0,30): content}..."`
                }
            case NEW_IDENTIFICATION:
                return {
                    title: `Your post ${plantName} has a new identification suggestion!`,
                    body: `${commentAuthorFullName} suggested: "${content.length > 30 ? content.slice(0,30): content}..."`
                }
            default:
                return {
                    title: `Notification Type Unknown!`,
                    body: `Invalid body."`
                }
        }
    }
};

module.exports = notificationTypes;
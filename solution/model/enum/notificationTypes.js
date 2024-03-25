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
    }
};

module.exports = notificationTypes;
const USER = 0;
const ADMIN = 1;

const roleTypes = {
    USER,
    ADMIN,

    roleTypeToString: (roleType) => {
        switch (roleType) {
            case USER:
                return 'User';
            case ADMIN:
                return 'Admin';
            default:
                return 'Unknown';
        }
    }
};

module.exports = roleTypes;
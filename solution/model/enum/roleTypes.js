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
    },

    roleTypeToColour: (role, prefix = "") => {
        switch (role) {
            case USER:
                return `${prefix}primary`;
            case ADMIN:
                return `${prefix}danger`;
            default:
                return `${prefix}secondary`;
        }
    },

    getList: () => Object.values(roleTypes).filter(value => typeof value === 'number')
};

module.exports = roleTypes;
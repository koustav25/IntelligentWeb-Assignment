const NEW_POST = 0;
const IN_PROGRESS = 1;
const IDENTIFIED = 2;

const postStates = {
    NEW_POST,
    IN_PROGRESS,
    IDENTIFIED,

    postStateToString: (postState) => {
        switch (postState) {
            case NEW_POST:
                return 'New Post';
            case IN_PROGRESS:
                return 'In Progress';
            case IDENTIFIED:
                return 'Identified';
            default:
                return 'Unknown';
        }
    },

    postStateToColor: (postState, prefix = "") => {
        switch (postState) {
            case NEW_POST:
                return prefix + 'danger';
            case IN_PROGRESS:
                return prefix + 'warning';
            case IDENTIFIED:
                return prefix + 'success';
            default:
                return prefix + 'secondary';
        }
    }
}
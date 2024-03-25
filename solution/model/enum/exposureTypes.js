const FULL_SUN = 0;
const PARTIAL_SUN = 1;
const FULL_SHADE = 2;

const exposureTypes = {
    FULL_SUN,
    PARTIAL_SUN,
    FULL_SHADE,

    exposureTypeToString: (exposureType) => {
        switch (exposureType) {
            case FULL_SUN:
                return 'Full sun';
            case PARTIAL_SUN:
                return 'Partial sun';
            case FULL_SHADE:
                return 'Full shade';
            default:
                return 'Unknown';
        }
    },

    exposureTypeToIcon: (exposureType) => {
        switch (exposureType) {
            case FULL_SUN:
                return 'fa-solid fa-sun';
            case PARTIAL_SUN:
                return 'fa-solid fa-cloud-sun';
            case FULL_SHADE:
                return 'fa-solid fa-cloud';
            default:
                return 'fa-solid fa-circle-question';
        }
    }
};

module.exports = exposureTypes;

const NO_SEED = 0;
const SEED = 1;
const FRUIT = 2;
const UNKNOWN = 3;

const seedTypes = {
    NO_SEED,
    SEED,
    FRUIT,
    UNKNOWN,

    seedTypeToString: function (seedType) {
        switch (seedType) {
            case NO_SEED:
                return 'No seed';
            case SEED:
                return 'Seed';
            case FRUIT:
                return 'Fruit';
            case UNKNOWN:
            default:
                return 'Unknown';
        }
    },

    seedTypeToIcon: function (seedType) {
        switch (seedType) {
            case NO_SEED:
                return 'fa-solid fa-circle-xmark';
            case SEED:
                return 'fa-solid fa-seedling';
            case FRUIT:
                return 'fa-solid fa-lemon';
            case UNKNOWN:
            default:
                return 'fa-solid fa-circle-question';

        }
    }
};

module.exports = seedTypes;
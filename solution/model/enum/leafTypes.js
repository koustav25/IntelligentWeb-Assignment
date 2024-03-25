const NO_LEAF = 0;
const SIMPLE_LEAF = 1;
const COMPLEX_LEAF = 2;

const leafTypes = {
    NO_LEAF,
    SIMPLE_LEAF,
    COMPLEX_LEAF,

    leafTypeToString: function (leafType) {
        switch (leafType) {
            case NO_LEAF:
                return 'No leaf';
            case SIMPLE_LEAF:
                return 'Simple leaf';
            case COMPLEX_LEAF:
                return 'Complex leaf';
            default:
                return 'Unknown';
        }
    },
};

module.exports = leafTypes;
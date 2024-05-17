const SortOrder = {
    RECENT: 0,
    OLDEST: 1,
    DISTANCE: 2,

    sortStateToInt: (state) => {
        switch (state) {
            case "0":
                return SortOrder.RECENT;
            case "1":
                return SortOrder.OLDEST;
            case "2":
                return SortOrder.DISTANCE;
            default:
                return SortOrder.RECENT;
        }
    },


    filterStateToInt: (state) => {
        switch (state) {
            case "all":
                return undefined
            case "0":
                return postStates.NEW_POST;
            case "1":
                return postStates.IN_PROGRESS;
            case "2":
                return postStates.IDENTIFIED;
            default:
                return undefined
        }
    },

    sortStateIntToString: (state) => {
        switch (state) {
            case SortOrder.RECENT:
                return '0';
            case SortOrder.OLDEST:
                return '1';
            case SortOrder.DISTANCE:
                return '2';
            default:
                return '0'
        }
    },

    filterStateIntToString: (state) => {
        switch (state) {
            case postStates.NEW_POST:
                return '0';
            case postStates.IN_PROGRESS:
                return '1';
            case postStates.IDENTIFIED:
                return '2';
            default:
                return '-1';
        }
    }
}
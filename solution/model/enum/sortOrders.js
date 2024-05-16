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
    }
}

module.exports = {
    SortOrder
}
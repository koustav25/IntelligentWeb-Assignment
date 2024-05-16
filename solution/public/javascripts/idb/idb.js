function openFeedIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("feed", 3);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('feed')) {
                db.createObjectStore('feed', {keyPath: '_id'});
            }

            // Create somewhere to store the cached sort order and filter state
            if (!db.objectStoreNames.contains('sortState')) {
                db.createObjectStore('sortState');
            }
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}

const clearFeedIDB = (feedIDB) => {
    const transaction = feedIDB.transaction(["feed"], "readwrite");
    const feedStore = transaction.objectStore("feed");
    const clearRequest = feedStore.clear();

    return new Promise((resolve, reject) => {
        clearRequest.addEventListener("success", () => {
            resolve();
        });

        clearRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
};

const updateFeedIDB = (feedIDB, posts) => {
    return new Promise((resolve, reject) => {
        const transaction = feedIDB.transaction(["feed"], "readwrite");
        const feedStore = transaction.objectStore("feed");

        const addPromises = posts.map(post => {
            return new Promise((resolveAdd, rejectAdd) => {
                const addRequest = feedStore.add(post);
                addRequest.addEventListener("success", () => {
                    console.log("Added " + "#" + addRequest.result + ": " + post.title);
                    const getRequest = feedStore.get(addRequest.result);
                    getRequest.addEventListener("success", () => {
                        // console.log("Found " + JSON.stringify(getRequest.result));
                        resolveAdd(); // Resolve the add promise
                    });
                    getRequest.addEventListener("error", (event) => {
                        rejectAdd(event.target.error);
                    });
                });
                addRequest.addEventListener("error", (event) => {
                    rejectAdd(event.target.error);
                });
            });
        });

        // Resolve the main promise when all add operations are completed
        Promise.all(addPromises).then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
};

const getFeedIDB = (feedIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = feedIDB.transaction(["feed"]);
        const feedStore = transaction.objectStore("feed");
        const getAllRequest = feedStore.getAll();

        // Handle success event
        getAllRequest.addEventListener("success", (event) => {
            // Sort posts by date
            const posts = event.target.result.sort((a,b) => { return new Date(b.createdAt) - new Date(a.createdAt)})

            resolve(posts); // Use event.target.result to get the result
        });

        // Handle error event
        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

/**
 * Get the current sort state from the IDB
 * @param feedIDB The feed IDB
 * @returns {Promise<{filter: number, sort: number}>} The sort state
 */
const getSortState = (feedIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = feedIDB.transaction(["sortState"]);
        const sortStateStore = transaction.objectStore("sortState");
        const getRequest = sortStateStore.get(1);

        getRequest.addEventListener("success", (event) => {
            resolve(event.target.result);
        });

        getRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

/**
 * Set the sort state in the IDB
 * @param feedIDB The feed IDB
 * @param sortState {filter: number, sort: number} The sort state
 * @returns {Promise<unknown>} A promise that resolves when the sort state is set
 */
const setSortState = (feedIDB, sortState) => {
    return new Promise((resolve, reject) => {
        const transaction = feedIDB.transaction(["sortState"], "readwrite");
        const sortStateStore = transaction.objectStore("sortState");
        const putRequest = sortStateStore.put(sortState, 1);

        putRequest.addEventListener("success", (event) => {
            resolve();
        });

        putRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

const resetSortState = (feedIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = feedIDB.transaction(["sortState"], "readwrite");
        const sortStateStore = transaction.objectStore("sortState");
        const deleteRequest = sortStateStore.delete(1);

        deleteRequest.addEventListener("success", (event) => {
            const sortState = {
                filter: undefined,
                sort: 0
            };

            const putRequest = sortStateStore.put(sortState, 1);

            putRequest.addEventListener("success", () => {
                resolve();
            });

            putRequest.addEventListener("error", (event) => {
                reject(event.target.error);
            });
        });

        deleteRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}
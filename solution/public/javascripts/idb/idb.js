function openFeedIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("feed", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore('feed', {keyPath: '_id'});
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
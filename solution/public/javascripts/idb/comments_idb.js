function openCommentsIdb() {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open("comments", 2);

        openRequest.addEventListener("upgradeneeded", (event) => {
            const db = event.target.result;
            //If the object store doesn't exist, create it
            if (!db.objectStoreNames.contains("comments")) {
                db.createObjectStore("comments", {
                    keyPath: "id",
                    autoIncrement: true
                });
            }
            if (!db.objectStoreNames.contains("replies")) {
                db.createObjectStore('replies', {
                    keyPath: "id",
                    autoIncrement: true
                });
            }
        });

        openRequest.addEventListener("success", (event) => {
            const db = event.target.result;
            resolve(db);
        });

        openRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

function deleteCommentFromIdb(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["comments"], "readwrite");
        const store = transaction.objectStore("comments");
        const request = store.delete(id);

        request.addEventListener("success", () => {
            resolve();
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

function deleteReplyFromIdb(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["replies"], "readwrite");
        const store = transaction.objectStore("replies");
        const request = store.delete(id);

        request.addEventListener("success", () => {
            resolve();
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

function getCommentsFromIdb(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["comments"], "readonly");
        const store = transaction.objectStore("comments");
        const request = store.getAll();

        request.addEventListener("success", () => {
            resolve(request.result);
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

function getRepliesFromIdb(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["replies"], "readonly");
        const store = transaction.objectStore("replies");
        const request = store.getAll();

        request.addEventListener("success", () => {
            resolve(request.result);
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

function addCommentToIdb(db, comment, tempId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["comments"], "readwrite");
        const store = transaction.objectStore("comments");

        const commentObj = {
            temp_id: tempId,
            ...comment
        }

        const request = store.add(commentObj);

        request.addEventListener("success", () => {
            const getRequest = store.get(request.result);
            getRequest.addEventListener("success", () => {
                navigator.serviceWorker.ready.then(registration => {
                    registration.sync.register("sync-new-comment");
                }).catch(console.error);

                resolve(getRequest.result);
            });
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

function addReplyToIdb(db, reply) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["replies"], "readwrite");
        const store = transaction.objectStore("replies");
        const request = store.add(reply);

        request.addEventListener("success", () => {
            const getRequest = store.get(request.result);
            getRequest.addEventListener("success", () => {
                navigator.serviceWorker.ready.then(registration => {
                    registration.sync.register("sync-new-reply");
                }).catch(console.error);

                resolve(getRequest.result);
            });
        });

        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}
function openNewPostIdb() {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open("postUploads", 1);

        openRequest.addEventListener("upgradeneeded", (event) => {
            const db = event.target.result;
            db.createObjectStore("posts", { keyPath: "id", autoIncrement: true });
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

function deletePostFromIdb(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["posts"], "readwrite");
        const store = transaction.objectStore("posts");
        const request = store.delete(id);

        request.addEventListener("success", () => {
            resolve();
        });
        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

function getPostsFromIDB(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["posts"], "readonly");
        const store = transaction.objectStore("posts");
        const request = store.getAll();

        request.addEventListener("success", () => {
            resolve(request.result);
        });
        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

function getPostFromIdb(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["posts"], "readonly");
        const store = transaction.objectStore("posts");
        const request = store.get(id);

        request.addEventListener("success", () => {
            resolve(request.result);
        });
        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

function addNewPostToIdb(db, post) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["posts"], "readwrite");
        const store = transaction.objectStore("posts");
        const request = store.add(post);

        request.addEventListener("success", () => {
            const getRequest = store.get(request.result);
            getRequest.addEventListener("success", () => {
                navigator.serviceWorker.ready.then(registration => {
                    registration.sync.register("sync-new-post");
                }).catch(console.error);

                resolve(getRequest.result);
            });
        });
        request.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}
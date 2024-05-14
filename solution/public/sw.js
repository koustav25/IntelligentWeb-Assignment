importScripts('/javascripts/socket.io.min.js');

importScripts('/javascripts/idb/idb.js');
importScripts('/javascripts/idb/posting_idb.js');
importScripts('/javascripts/idb/comments_idb.js');

self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {

        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            const cache = await caches.open("static");
            cache.addAll([
                '/',
                '/feed',
                '/manifest.json',
                '/javascripts/jquery.min.js',
                '/javascripts/bootstrap.bundle.min.js',
                '/javascripts/navbar/navbar.js',
                '/javascripts/service_worker/activate_sw.js',
                '/javascripts/feed/feed.js',
                '/javascripts/idb/idb.js',
                "/javascripts/leaflet.js",
                "/javascripts/socket.io.min.js",
                '/stylesheets/style.css',
                "/stylesheets/leaflet.css",
                '/stylesheets/bootstrap.min.css',
                '/images/logo.png',
            ]);
            console.log('Service Worker: App Shell Cached');
        } catch {
            console.log("error occurred while caching...")
        }

    })());
});

//clear cache on reload
self.addEventListener('activate', event => {
// Remove old caches
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            return keys.map(async (cache) => {
                if (cache !== "static") {
                    console.log('Service Worker: Removing old cache: ' + cache);
                    return await caches.delete(cache);
                }
            })
        })()
    )
})

function shouldBeCached(request) {
    //Check if the request is a GET request
    if (request.method !== "GET") {
        return false;
    }

    const invalidURLParts =
        [
            'api',
            'socket.io',
        ];

    //Check if the request URL contains any of the invalid URL parts
    for (let part of invalidURLParts) {
        if (request.url.includes(part)) {
            return false;
        }
    }

    return true;
}

//Fetch event to fetch from cache first
self.addEventListener('fetch', async event => {
    event.respondWith((async () => {
        const cache = await caches.open("static");
        //console.log('Service Worker: Fetching from URL: ', event.request.url);
        try {
            let response = await fetch(event.request)

            //Don't cache the response if it's not a GET request
            if (shouldBeCached(event.request)) {
                //Cache the fetched response
                if (response.redirected) {
                    response = await cleanResponse(response);
                }
                await cache.put(event.request, response.clone());
            }
            return response;
        } catch (e) {
            //If the fetch request fails, try to fetch from cache
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                //console.log('Service Worker: Fetching from Cache: ', event.request.url);
                return cachedResponse;
            }

            //console.log("Service Worker: Fetch Error: ", event.request.url)

            //If we have reached this point, it means that the request is not in the cache
            //We can return a custom offline page here
            return new Response("You are offline. Please check your internet connection and try again.", {
                status: 503,
                statusText: "Service Unavailable",
                headers: new Headers({
                    'Content-Type': 'text/plain'
                })
            });
        }

    })());
});

//Taken from https://stackoverflow.com/questions/45434470/only-in-chrome-service-worker-a-redirected-response-was-used-for-a-reque
//Accessed 10/05/2024
//In order to address the issue of the service worker not being able to handle redirect requests
function cleanResponse(response) {
    const clonedResponse = response.clone();

    // Not all browsers support the Response.body stream, so fall back to reading
    // the entire body into memory as a blob.
    const bodyPromise = 'body' in clonedResponse ?
        Promise.resolve(clonedResponse.body) :
        clonedResponse.blob();

    return bodyPromise.then((body) => {
        // new Response() is happy when passed either a stream or a Blob.
        return new Response(body, {
            headers: clonedResponse.headers,
            status: clonedResponse.status,
            statusText: clonedResponse.statusText,
        });
    });
}
//sync event
self.addEventListener('sync', async event => {
    let socket = io('http://localhost:3000', {
        jsonp: false,
        transports: ['websocket']
    });
    if (event.tag === "sync-new-post") {
        console.log("Service Worker: Syncing new Posts");

        const db = await openNewPostIdb();
        const posts = await getPostsFromIDB(db);
        if (posts.length > 0) {
            for (const post of posts) {
                try {
                    const title = post.title;
                    const seen_at = post.seen_at;
                    const description = post.description;
                    const location_name = post.location_name;
                    const latitude = post.latitude;
                    const longitude = post.longitude;
                    const height = post.height;
                    const spread = post.spread;
                    const sun_exposure = post.sun_exposure;
                    const has_flowers = post.has_flowers;
                    const colour = post.flower_colour;
                    const leaf_type = post.leaf_type;
                    const seed_type = post.seed_type;
                    const images = post.images;

                    //Prepare formData
                    const formData = new FormData();
                    formData.append('title', title);
                    formData.append('seen_at', seen_at);
                    formData.append('description', description);
                    formData.append('location_name', location_name);
                    formData.append('latitude', latitude);
                    formData.append('longitude', longitude);
                    formData.append('height', height);
                    formData.append('spread', spread);
                    formData.append('sun_exposure', sun_exposure);
                    formData.append('has_flowers', has_flowers);
                    formData.append('flower_colour', colour);
                    formData.append('leaf_type', leaf_type);
                    formData.append('seed_type', seed_type);
                    for (let i = 0; i < images.length; i++) {
                        formData.append('images', images[i]);
                    }

                    fetch('http://localhost:3000/post', {
                        method: 'POST',
                        body: formData
                    }).then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            console.log("Service Worker: Sync Error: ", response.statusText)
                        }
                    });


                    await deletePostFromIdb(db, post.id);
                } catch (e) {
                    console.log("Service Worker: Sync Error: ", e);
                }
            }
            console.log("Service Worker: Synced new Posts");
        }
    } else if (event.tag === "sync-new-comment") {
        console.log("Service Worker: Syncing new Comments");

        const db = await openCommentsIdb();
        const comments = await getCommentsFromIdb(db);
        if (comments.length > 0) {
            for (const comment of comments) {
                try {
                    const temp_id = comment.temp_id;
                    const post_id = comment.post_id;
                    const user_id = comment.user_id;
                    const text = comment.text;

                    fetch(`http://localhost:3000/plant/${post_id}/comment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text: text,
                            user_id: user_id,
                            temp_id: temp_id
                        })
                    }).then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            console.log("Service Worker: Sync Error: ", response.statusText)
                        }
                    }).then(async data => {
                        socket.emit("new_comment", post_id, data.post);
                        socket.emit("new_notification", data.notification)

                        await deleteCommentFromIdb(db, comment.id);
                    }).catch(error => {
                        console.log("Service Worker: Sync Error: ", error);
                    });
                } catch (e) {
                    console.log("Service Worker: Sync Error: ", e);
                }
            }
            console.log("Service Worker: Synced new Comments");
        }
    } else if (event.tag === "sync-new-reply") {
        console.log("Service Worker: Syncing new Replies");

        const db = await openCommentsIdb();
        const replies = await getRepliesFromIdb(db);
        if (replies.length > 0) {
            for (const reply of replies) {
                try {
                    const post_id = reply.plant_id;
                    const comment_id = reply.comment_id;
                    const user_id = reply.user_id;
                    const reply_text = reply.text;
                    const temp_id = reply.temp_id;

                    fetch(`http://localhost:3000/plant/${post_id}/comment/${comment_id}/reply`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text: reply_text,
                            user_id: user_id,
                            temp_id: temp_id
                        })
                    }).then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            console.log("Service Worker: Sync Error: ", response.statusText)
                        }
                    }).then(async data => {
                        socket.emit("new_reply", post_id, {comment_id, reply: data.reply});
                        socket.emit("new_notification", data.notification)

                        await deleteReplyFromIdb(db, reply.id);
                    }).catch(error => {
                        console.log("Service Worker: Sync Error: ", error);
                    });
                } catch (e) {
                    console.log("Service Worker: Sync Error: ", e);
                }
            }
            console.log("Service Worker: Synced new Replies");
        }
    }
});

importScripts('/javascripts/idb/idb.js');
importScripts('/javascripts/idb/posting_idb.js');

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
            console.log("error occured while caching...")
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

//Fetch event to fetch from cache first
self.addEventListener('fetch', async event => {
    event.respondWith((async () => {
        const cache = await caches.open("static");
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            console.log('Service Worker: Fetching from Cache: ', event.request.url);
            return cachedResponse;
        }
        console.log('Service Worker: Fetching from URL: ', event.request.url);
        try {
            return await fetch(event.request)
        } catch (e) {
            console.log("Service Worker: Fetch Error: ", event.request.url)
        }

    })());
});

//sync event
self.addEventListener('sync', async event => {
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
    }
});

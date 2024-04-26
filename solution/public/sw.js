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
        }
        catch{
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
                if(cache !== "static") {
                    console.log('Service Worker: Removing old cache: '+cache);
                    return await caches.delete(cache);
                }
            })
        })()
    )
})

// Fetch event to fetch from cache first
self.addEventListener('fetch', async event => {
    event.respondWith((async () => {
        const cache = await caches.open("static");
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            console.log('Service Worker: Fetching from Cache: ', event.request.url);
            return cachedResponse;
        }
        // console.log('Service Worker: Fetching from URL: ', event.request.url);
        try {
            return await fetch(event.request)
        }catch(e) {
            console.log("Service Worker: Fetch Error: ", event.request.url)
        }

    })());
});

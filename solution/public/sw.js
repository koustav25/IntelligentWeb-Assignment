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
                if(cache !== "static") {
                    console.log('Service Worker: Removing old cache: '+cache);
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
            //Check if the fetch request is from a redirected URL
            if(cachedResponse.redirected) {
                console.log("Service Worker: Fetching from URL: ", event.request.url);
                return fetch(event.request);
            }
            console.log('Service Worker: Fetching from Cache: ', event.request.url);
            return cachedResponse;
        }
        console.log('Service Worker: Fetching from URL: ', event.request.url);
        try {
            return await fetch(event.request)
        }catch(e) {
            console.log("Service Worker: Fetch Error: ", event.request.url)
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
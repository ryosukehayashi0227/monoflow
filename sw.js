const CACHE_NAME = 'monoflow-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './metrics.html',
    './burndown.html',
    './help.html',
    './about.html',
    './css/style.css',
    './js/common.js',
    './js/app.js',
    './js/metrics.js',
    './js/burndown.js',
    './js/help.js',
    './js/about.js',
    './manifest.json',
    './img/icon-192x192.svg',
    './img/icon-512x512.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Network-First strategy (fallback to cache)
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If network fetch successful, update cache
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clone);
                });
                return response;
            })
            .catch(() => {
                // Return fallback from cache if available
                return caches.match(event.request).then((response) => {
                    return response || new Response('Offline Content Not Available', { status: 503, statusText: 'Service Unavailable' });
                });
            })
    );
});

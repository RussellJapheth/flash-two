const CACHE_NAME = 'flashcards-v2';
const STATIC_ASSETS = [
	'/',
	'/manifest.json',
	'/favicon.png',
	'/icons/icon-192x192.png',
	'/icons/icon-512x512.png',
	'/icons/icon-maskable-192x192.png',
	'/icons/icon-maskable-512x512.png',
	'/icons/apple-touch-icon-180x180.png',
	'/mascots/flame.png',
	'/mascots/owl.png'
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		})
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
			);
		})
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	// Skip external API requests (e.g. json-drive) from stale caching, let application layer handle network/offline state
	if (event.request.url.includes('json-drive.thespot.workers.dev')) {
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				return cachedResponse;
			}
			return fetch(event.request)
				.then((response) => {
					// Cache static resources and sveltekit bundle assets
					if (
						response.status === 200 &&
						(event.request.url.startsWith(self.location.origin) ||
							event.request.url.includes('fonts.googleapis.com') ||
							event.request.url.includes('fonts.gstatic.com'))
					) {
						const responseToCache = response.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, responseToCache);
						});
					}
					return response;
				})
				.catch(() => {
					// If offline and requesting navigation, return index
					if (event.request.mode === 'navigate') {
						return caches.match('/');
					}
				});
		})
	);
});

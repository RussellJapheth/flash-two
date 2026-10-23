/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';
import { API_ORIGIN } from '$lib/utils/apiBase';

// Unique cache name for this deployment version
const CACHE = `flashcards-cache-${version}`;

const ASSETS = [
	...build, // all Vite-generated JS and CSS chunks
	...files // all static assets
];

self.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		// Precache all JS/CSS bundles, static files, and root app shell
		await cache.addAll([...ASSETS, '/']);
	}

	event.waitUntil(addFilesToCache());
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) {
				await caches.delete(key);
			}
		}
	}

	event.waitUntil(deleteOldCaches());
	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	// Skip external API sync requests from SW caching
	if (API_ORIGIN && event.request.url.startsWith(API_ORIGIN)) {
		return;
	}

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// 1. Special handling for manifest.json:
		// Keep cached for offline use, but check network first.
		// When an update is detected, purge stale manifest and store latest.
		if (url.pathname === '/manifest.json') {
			try {
				const networkResponse = await fetch(event.request, { cache: 'no-cache' });
				if (networkResponse && networkResponse.status === 200) {
					const cachedResponse =
						(await cache.match(event.request)) || (await cache.match('/manifest.json'));
					if (cachedResponse) {
						const [newText, oldText] = await Promise.all([
							networkResponse.clone().text(),
							cachedResponse.text()
						]);
						if (newText !== oldText) {
							await cache.delete(event.request);
							await cache.delete('/manifest.json');
						}
					}
					await cache.put(event.request, networkResponse.clone());
					return networkResponse;
				}
			} catch {
				const cachedManifest =
					(await cache.match(event.request)) || (await cache.match('/manifest.json'));
				if (cachedManifest) {
					return cachedManifest;
				}
			}
		}

		// 2. For static/build assets, serve from cache first
		if (ASSETS.includes(url.pathname)) {
			const cachedAsset = await cache.match(url.pathname);
			if (cachedAsset) {
				return cachedAsset;
			}
		}

		// 2. Try network, fall back to cache
		try {
			const response = await fetch(event.request);

			if (
				response.status === 200 &&
				(event.request.url.startsWith(self.location.origin) ||
					event.request.url.includes('fonts.googleapis.com') ||
					event.request.url.includes('fonts.gstatic.com'))
			) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			// Network failed: try cache for specific request
			const cachedResponse = await cache.match(event.request);
			if (cachedResponse) {
				return cachedResponse;
			}

			// For SPA navigation requests offline, return cached root shell
			if (event.request.mode === 'navigate') {
				const cachedShell = await cache.match('/');
				if (cachedShell) {
					return cachedShell;
				}
			}

			throw err;
		}
	}

	event.respondWith(respond());
});

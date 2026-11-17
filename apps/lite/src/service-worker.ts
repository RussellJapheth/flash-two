/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';
import { API_ORIGIN } from '$lib/apiBase';

const CACHE = `flashcards-lite-cache-${version}`;

const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
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

	if (API_ORIGIN && event.request.url.startsWith(API_ORIGIN)) {
		return;
	}

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// Special handling for manifest.json
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

		// Static assets from cache first
		if (ASSETS.includes(url.pathname)) {
			const cachedAsset = await cache.match(url.pathname);
			if (cachedAsset) {
				return cachedAsset;
			}
		}

		// Try network, fallback to cache
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
			const cachedResponse = await cache.match(event.request);
			if (cachedResponse) {
				return cachedResponse;
			}

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

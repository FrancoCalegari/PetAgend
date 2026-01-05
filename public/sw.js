const CACHE_NAME = "petagent-v1";
const urlsToCache = [
	"/",
	"/css/style.css",
	"/auth/login",
	"/auth/register",
	"/images/default-pet.png",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(urlsToCache);
		})
	);
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			if (response) {
				return response;
			}
			return fetch(event.request);
		})
	);
});

const CACHE_NAME = 'otk1863-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    // Network first, fall back to cache strategy for better freshness
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

// Daily Notification Logic
// This basically waits for a push event or sync event to trigger
// Since we don't have a backend pushing, we rely on local scheduling if possible
// or periodic sync if supported. For now, we'll listen for a specific message
// from the client to schedule/show notifications.

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
        // In a real PWA, you might use the Notification API directly here
        // or rely on the OS via the client scheduling it.
        // Simulating a "New Games Available" notification logic
        setTimeout(() => {
            self.registration.showNotification("1863 Postası - Boundle", {
                body: "Günlük bulmacalar yenilendi! İsmini efsaneler arasına yazdır.",
                icon: "/pwa-192x192.png",
                badge: "/pwa-192x192.png",
                tag: "daily-boundle"
            });
        }, calculateTimeToNextMidnight());
    }
});

function calculateTimeToNextMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
}

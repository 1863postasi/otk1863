importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const CACHE_NAME = 'otk1863-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    // Force new Service Worker to activate immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (event) => {
    // Claim clients immediately so the new SW controls the page without reload
    event.waitUntil(self.clients.claim());
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

// Initialize Firebase in SW
firebase.initializeApp({
    apiKey: "AIzaSyCPWaTQtnG19k40aDEf6kYbK2VPPeqYVzg",
    projectId: "postasi-b5327",
    messagingSenderId: "405383525944",
    appId: "1:405383525944:web:84f62222beff8a742418cd"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/pwa-icon.png',
        badge: '/pwa-icon.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

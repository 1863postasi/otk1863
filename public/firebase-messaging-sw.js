importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCPWaTQtnG19k40aDEf6kYbK2VPPeqYVzg",
    authDomain: "postasi-b5327.firebaseapp.com",
    projectId: "postasi-b5327",
    storageBucket: "postasi-b5327.firebasestorage.app",
    messagingSenderId: "405383525944",
    appId: "1:405383525944:web:84f62222beff8a742418cd"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/pwa-icon.png',
        badge: '/pwa-icon.png',
        data: payload.data
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
    console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification);
    event.notification.close();

    // Open the app and navigate to the link
    const urlToOpen = event.notification.data?.url || '/'; // Default to root if no URL

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
            // Check if there is already a window open
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                // Check if the client is focusing on the app base URL
                // Note: Comparing exact URL might be tricky if query params differ, so checking origin is safer but we want to navigate.
                // Let's just focus the first available window and navigate it.
                if ('focus' in client) {
                    return client.focus().then(function (focusedClient) {
                        if (focusedClient && focusedClient.navigate) {
                            return focusedClient.navigate(urlToOpen);
                        }
                        return focusedClient;
                    });
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

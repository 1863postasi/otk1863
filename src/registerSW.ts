export const registerSW = () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch((err) => {
                    console.warn('ServiceWorker registration failed: ', err);
                });
        });
    }
};

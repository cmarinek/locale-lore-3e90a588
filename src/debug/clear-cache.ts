// Clear ServiceWorker cache and reload
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log('[SW] Unregistered service worker:', registration);
    });
  });
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      caches.delete(cacheName);
      console.log('[SW] Deleted cache:', cacheName);
    });
  });
}

// Force reload after cache clear
setTimeout(() => {
  window.location.reload();
}, 1000);

export {};
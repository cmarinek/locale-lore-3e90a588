const CACHE_NAME = 'locale-lore-v1';
const OFFLINE_URL = '/offline.html';

const CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
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

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache API responses and static assets
            if (
              event.request.url.includes('/api/') ||
              event.request.url.includes('supabase.co') ||
              event.request.destination === 'image' ||
              event.request.destination === 'script' ||
              event.request.destination === 'style'
            ) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const db = await openDB();
    const tx = db.transaction(['pending_actions'], 'readonly');
    const store = tx.objectStore('pending_actions');
    const pendingActions = await store.getAll();

    for (const action of pendingActions) {
      try {
        await syncAction(action);
        // Remove synced action
        const deleteTx = db.transaction(['pending_actions'], 'readwrite');
        const deleteStore = deleteTx.objectStore('pending_actions');
        await deleteStore.delete(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function syncAction(action) {
  const { type, data, timestamp } = action;
  
  switch (type) {
    case 'submit_fact':
      await fetch('/api/facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      break;
    case 'vote':
      await fetch(`/api/facts/${data.factId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUpvote: data.isUpvote })
      });
      break;
    case 'comment':
      await fetch(`/api/facts/${data.factId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content })
      });
      break;
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LocaleLoreDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pending_actions')) {
        const store = db.createObjectStore('pending_actions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
      }
      
      if (!db.objectStoreNames.contains('cached_facts')) {
        const store = db.createObjectStore('cached_facts', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('location', ['latitude', 'longitude']);
      }
      
      if (!db.objectStoreNames.contains('map_tiles')) {
        const store = db.createObjectStore('map_tiles', { keyPath: 'url' });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag || 'default',
      data: data.data || {}
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
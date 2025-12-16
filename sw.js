const CACHE_NAME = 'dayplan-v1.0';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/archive.html',
  '/style.css',
  '/app.js',
  '/auth.js',
  '/archive.js',
  '/icons/icon-72x72.png',
  '/icons/icon-192x192.png'
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Стратегия: Cache First, затем сеть
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Возвращаем из кэша
        }
        return fetch(event.request); // Идём в сеть
      })
  );
});
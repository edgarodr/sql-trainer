/* =============================================
   SQL TRAINER — SERVICE WORKER
   Cache-first strategy for all local assets.
   Bump CACHE_VERSION to force a full refresh.
   ============================================= */

const CACHE_VERSION = 'v2';
const CACHE_NAME    = `sql-trainer-${CACHE_VERSION}`;

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/js/app.js',
  '/js/lessons.js',
  '/icons/icon.svg',
  '/vendor/codemirror/codemirror.min.js',
  '/vendor/codemirror/codemirror.min.css',
  '/vendor/codemirror/material-darker.min.css',
  '/vendor/codemirror/sql.min.js',
  '/vendor/codemirror/matchbrackets.min.js',
  '/vendor/codemirror/closebrackets.min.js',
  '/vendor/sqljs/sql-wasm.js',
  '/vendor/sqljs/sql-wasm.wasm',
];

// Pre-cache all assets on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Delete old caches on activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Cache-first: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Cache any new successful responses (e.g. future assets)
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for page navigations
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

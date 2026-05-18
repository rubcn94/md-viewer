const CACHE = 'md-viewer-v1';
const PRECACHE = [
  './',
  './index.html',
  './app.js',
  './modules/storage.js',
  './modules/import.js',
  './modules/render.js',
  './modules/search.js',
  './modules/tabs.js',
  './modules/ui.js',
  './modules/utils.js',
  './modules/fileOperations.js',
  './modules/folderOperations.js',
  './modules/readingProgress.js',
  './modules/longPress.js',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only cache same-origin requests
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

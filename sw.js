const CACHE_NAME = 'tudoutil-shell-v1';
const SHELL_URLS = [
  '/',
  '/login/',
  '/conta/',
  '/baixar/',
  '/assets/css/tudoutil.css',
  '/assets/css/home.css',
  '/assets/css/login.css',
  '/assets/css/account.css',
  '/assets/css/baixar.css',
  '/assets/js/tudoutil.js',
  '/assets/img/icon-192.png',
  '/assets/img/icon-512.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(SHELL_URLS.map(function (url) {
        return cache.add(url).catch(function () {});
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/tools/') || url.pathname.startsWith('/blog/')) return;

  event.respondWith(
    fetch(event.request).then(function (response) {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy).catch(function () {}); });
      }
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) { return cached || caches.match('/'); });
    })
  );
});

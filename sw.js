/* ==========================================================================
   TUDOUTIL — service worker
   Objetivo: abrir instantâneo e funcionar offline, sem nunca guardar
   arquivo de usuário. Só o "casco" do site entra no cache.
   ========================================================================== */
const VERSION    = 'v3';
const SHELL      = 'tudoutil-shell-' + VERSION;
const RUNTIME    = 'tudoutil-runtime-' + VERSION;
const TOOLS      = 'tudoutil-tools-' + VERSION;
const MAX_TOOLS  = 40;   // teto de páginas de ferramenta guardadas

const SHELL_URLS = [
  '/',
  '/ferramentas/',
  '/baixar/',
  '/vip/',
  '/imagens/',
  '/404/',
  '/assets/css/tudoutil.css',
  '/assets/css/style.css',
  '/assets/css/tu-ds.css',
  '/assets/css/home.css',
  '/assets/js/tudoutil.js',
  '/assets/js/tu-catalog.js',
  '/assets/js/tu-core.js',
  '/assets/img/icon-192.png',
  '/assets/img/icon-512.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) =>
      Promise.all(SHELL_URLS.map((url) => cache.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => ![SHELL, RUNTIME, TOOLS].includes(k)).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* Corta o cache de ferramentas quando passa do teto (FIFO). */
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  /* NUNCA cachear: conta, login, retorno de pagamento e blobs de arquivo. */
  if (/^\/(conta|login)\//.test(url.pathname)) return;
  if (url.search.includes('status=') || url.search.includes('ref=')) return;

  /* Assets com hash de versão: cache primeiro, é imutável na prática. */
  if (/^\/assets\//.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(RUNTIME).then((c) => c.put(req, copy).catch(() => {}));
          }
          return res;
        })
      )
    );
    return;
  }

  /* Páginas de ferramenta: rede primeiro, cache como rede de segurança.
     É o que faz "juntar PDF" continuar funcionando no avião. */
  if (/^\/tools\//.test(url.pathname)) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(TOOLS).then((c) => {
            c.put(req, copy).catch(() => {});
            trim(TOOLS, MAX_TOOLS);
          });
        }
        return res;
      }).catch(() => caches.match(req).then((hit) => hit || caches.match('/')))
    );
    return;
  }

  /* Resto do site: rede primeiro com fallback no casco. */
  event.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(RUNTIME).then((c) => c.put(req, copy).catch(() => {}));
      }
      return res;
    }).catch(() =>
      caches.match(req).then((hit) => hit || caches.match('/404/') || caches.match('/'))
    )
  );
});

/* A página pede pra limpar tudo (botão "limpar dados" em /conta/). */
self.addEventListener('message', (event) => {
  if (event.data === 'tu:purge-cache') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
});

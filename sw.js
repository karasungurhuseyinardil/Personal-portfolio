/* ═══════════════════════════════════════════════════════════
   SERVICE WORKER — Portfolio PWA
   Caches all core assets for offline use.
   Strategy: Cache-First for static assets, Network-First for HTML.
═══════════════════════════════════════════════════════════ */
const CACHE_NAME = 'hak-portfolio-v7';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
];

/* ── Install: pre-cache static assets ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* ── Activate: remove old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: cache-first for same-origin, network-first for HTML ── */
self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin (CDN fonts, FontAwesome, GitHub API)
  if (!request.url.startsWith(self.location.origin)) return;

  // Network-first for HTML (always get fresh page)
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Stale-while-revalidate for everything else.
  // Cache-first idi: CACHE_NAME her deploy'da değişmediği için siteyi bir kez
  // ziyaret etmiş kullanıcılara yeni CSS/JS hiç ulaşmıyordu. Artık önbellekteki
  // sürüm anında gösteriliyor, arka planda tazeleniyor; sonraki açılışta güncel.
  event.respondWith(
    caches.match(request).then(cached => {
      const fresh = fetch(request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return res;
      }).catch(() => cached);

      return cached || fresh;
    })
  );
});

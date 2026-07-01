/* Deutsch lernen — service worker (Build v22) */
const CACHE = 'deutsch-lernen-v26';

/* App shell — small, always cached for offline use.
   Audio MP3s are NOT precached (there can be tens of thousands); they are
   cached lazily as they are played, so offline replays work after first hear. */
const FILES = [
  './index.html?v=22',
  './data.js?v=22',
  './integration.js?v=22',
  './manifest.webmanifest?v=22',
  './icon.svg?v=22',
  './README.md'
];

self.addEventListener('install', e =>
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
  )
);

self.addEventListener('activate', e =>
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
);

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  // navigations: network-first, fall back to cached shell
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); return r; })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html?v=22')))
    );
    return;
  }

  // audio clips: cache-first, then network, then store for offline replay
  if (url.pathname.includes('/audio/')) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(r => {
        if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
        return r;
      }).catch(() => undefined))
    );
    return;
  }

  // everything else: cache-first
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});

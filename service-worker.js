const CACHE='german-a1-b2-telc-v68-publication';
const FILES=[
  './index.html?v=68',
  './styles.css?v=68',
  './data.js?v=68',
  './app.js?v=68',
  './manifest.webmanifest?v=68',
  './icon.svg?v=68',
  './README.md',
  './qa-report.json',
  './translation-pack/translation_review_template.csv',
  './translation-pack/translation_review_template.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

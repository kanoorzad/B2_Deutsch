const CACHE='german-a1-b2-telc-v79-unified-all-books-languages';
const FILES=[
 './index.html?v=79','./styles.css?v=79','./data.js?v=79','./app.js?v=79',
 './manifest.webmanifest?v=79','./icon.svg?v=79','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

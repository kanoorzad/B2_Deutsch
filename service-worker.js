const CACHE='german-a1-b2-telc-v94-labeled-verb-forms';
const FILES=[
 './index.html?v=94','./styles.css?v=94','./data.js?v=94','./app.js?v=94',
 './manifest.webmanifest?v=94','./icon.svg?v=94','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

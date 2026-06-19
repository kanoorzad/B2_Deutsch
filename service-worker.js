const CACHE='german-a1-b2-telc-v84-from-v83-report-backend-ready';
const FILES=[
 './index.html?v=84','./styles.css?v=84','./data.js?v=84','./app.js?v=84',
 './manifest.webmanifest?v=84','./icon.svg?v=84','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

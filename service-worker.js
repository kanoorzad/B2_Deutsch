const CACHE='german-a1-b2-telc-public-v1';
const FILES=[
 './index.html?v=1','./styles.css?v=1','./data.js?v=1','./app.js?v=1',
 './manifest.webmanifest?v=1','./icon.svg?v=1','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

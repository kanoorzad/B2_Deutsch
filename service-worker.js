const CACHE='german-a1-b2-telc-v81-spec-consolidated';
const FILES=[
 './index.html?v=81','./styles.css?v=81','./data.js?v=81','./app.js?v=81',
 './manifest.webmanifest?v=81','./icon.svg?v=81','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

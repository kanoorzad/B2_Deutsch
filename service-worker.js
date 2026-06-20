const CACHE='german-a1-b2-telc-v90-stable-repair-from-v88';
const FILES=[
 './index.html?v=90','./styles.css?v=90','./data.js?v=90','./app.js?v=90',
 './manifest.webmanifest?v=90','./icon.svg?v=90','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

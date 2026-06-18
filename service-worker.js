const CACHE='german-a1-b2-telc-v74-full-flow-repair';
const FILES=[
 './index.html?v=74','./styles.css?v=74','./data.js?v=74','./app.js?v=74',
 './manifest.webmanifest?v=74','./icon.svg?v=74','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

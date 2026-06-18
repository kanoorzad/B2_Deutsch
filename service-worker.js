const CACHE='german-a1-b2-telc-v77-full-interlink-repair';
const FILES=[
 './index.html?v=77','./styles.css?v=77','./data.js?v=77','./app.js?v=77',
 './manifest.webmanifest?v=77','./icon.svg?v=77','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

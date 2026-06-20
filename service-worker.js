const CACHE='german-a1-b2-telc-v88-b1-words-added';
const FILES=[
 './index.html?v=88','./styles.css?v=88','./data.js?v=88','./app.js?v=88',
 './manifest.webmanifest?v=88','./icon.svg?v=88','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

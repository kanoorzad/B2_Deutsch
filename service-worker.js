const CACHE='german-a1-b2-telc-v97-short-verb-labels';
const FILES=[
 './index.html?v=97','./styles.css?v=97','./data.js?v=97','./app.js?v=97',
 './manifest.webmanifest?v=97','./icon.svg?v=97','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

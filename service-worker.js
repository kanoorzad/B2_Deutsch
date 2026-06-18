const CACHE='german-a1-b2-telc-v83-final-addendum';
const FILES=[
 './index.html?v=83','./styles.css?v=83','./data.js?v=83','./app.js?v=83',
 './manifest.webmanifest?v=83','./icon.svg?v=83','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

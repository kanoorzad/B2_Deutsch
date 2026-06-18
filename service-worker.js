const CACHE='german-a1-b2-telc-v80-language-switch-visible-translation';
const FILES=[
 './index.html?v=80','./styles.css?v=80','./data.js?v=80','./app.js?v=80',
 './manifest.webmanifest?v=80','./icon.svg?v=80','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

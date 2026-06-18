const CACHE='german-a1-b2-telc-v71-wizard-bootstrap-fixed';
const FILES=[
 './index.html?v=71','./styles.css?v=71','./data.js?v=71','./app.js?v=71',
 './manifest.webmanifest?v=71','./icon.svg?v=71','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

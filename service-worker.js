const CACHE='german-a1-b2-telc-v85-report-problem-fixed';
const FILES=[
 './index.html?v=85','./styles.css?v=85','./data.js?v=85','./app.js?v=85',
 './manifest.webmanifest?v=85','./icon.svg?v=85','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

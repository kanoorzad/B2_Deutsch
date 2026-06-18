const CACHE='german-a1-b2-telc-v76-inline-options-a1verb-fix';
const FILES=[
 './index.html?v=76','./styles.css?v=76','./data.js?v=76','./app.js?v=76',
 './manifest.webmanifest?v=76','./icon.svg?v=76','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

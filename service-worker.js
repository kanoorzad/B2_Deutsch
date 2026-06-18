const CACHE='german-a1-b2-telc-v70-language-click-fixed';
const FILES=[
 './index.html?v=70','./styles.css?v=70','./data.js?v=70','./app.js?v=70',
 './manifest.webmanifest?v=70','./icon.svg?v=70','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

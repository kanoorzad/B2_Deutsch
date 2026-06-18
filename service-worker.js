const CACHE='german-a1-b2-telc-v75-autoplay-sequence-fixed';
const FILES=[
 './index.html?v=75','./styles.css?v=75','./data.js?v=75','./app.js?v=75',
 './manifest.webmanifest?v=75','./icon.svg?v=75','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

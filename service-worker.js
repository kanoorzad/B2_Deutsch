const CACHE='german-a1-b2-telc-v96-plusquamperfekt-playback';
const FILES=[
 './index.html?v=96','./styles.css?v=96','./data.js?v=96','./app.js?v=96',
 './manifest.webmanifest?v=96','./icon.svg?v=96','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

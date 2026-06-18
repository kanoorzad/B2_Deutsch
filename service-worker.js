const CACHE='b2-b1plus-native-flashcards-v550-user-pickvoice-patch';
const FILES=['./index.html?v=55','./styles.css?v=55','./data.js?v=55','./app.js?v=55','./manifest.webmanifest?v=55','./icon.svg?v=55','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

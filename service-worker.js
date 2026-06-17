const CACHE='b2-b1plus-native-flashcards-v450-stable-playback-repair';
const FILES=['./index.html?v=45','./styles.css?v=45','./data.js?v=45','./app.js?v=45','./manifest.webmanifest?v=45','./icon.svg?v=45','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

const CACHE='b2-b1plus-native-flashcards-v460-auto-clean-audio';
const FILES=['./index.html?v=46','./styles.css?v=46','./data.js?v=46','./app.js?v=46','./manifest.webmanifest?v=46','./icon.svg?v=46','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

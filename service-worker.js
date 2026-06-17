const CACHE='b2-b1plus-native-flashcards-v360-classic-v6-voice';
const FILES=['./index.html?v=36','./styles.css?v=36','./data.js?v=36','./app.js?v=36','./manifest.webmanifest?v=36','./icon.svg?v=36','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

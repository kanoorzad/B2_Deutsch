const CACHE='b2-b1plus-native-flashcards-v370-audio-packs';
const FILES=['./index.html?v=37','./styles.css?v=37','./data.js?v=37','./audio-manifest.js?v=37','./app.js?v=37','./manifest.webmanifest?v=37','./icon.svg?v=37','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

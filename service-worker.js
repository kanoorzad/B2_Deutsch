const CACHE='b2-b1plus-native-flashcards-v430-remove-daria-bg';
const FILES=['./index.html?v=43','./styles.css?v=43','./data.js?v=43','./app.js?v=43','./manifest.webmanifest?v=43','./icon.svg?v=43','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

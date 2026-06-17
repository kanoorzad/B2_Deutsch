const CACHE='b2-b1plus-native-flashcards-v400-dari-bruteforce';
const FILES=['./index.html?v=40','./styles.css?v=40','./data.js?v=40','./app.js?v=40','./manifest.webmanifest?v=40','./icon.svg?v=40','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

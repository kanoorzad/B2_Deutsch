const CACHE='b2-b1plus-native-flashcards-v520-mobile-gesture-queue';
const FILES=['./index.html?v=52','./styles.css?v=52','./data.js?v=52','./app.js?v=52','./manifest.webmanifest?v=52','./icon.svg?v=52','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

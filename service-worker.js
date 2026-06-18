const CACHE='b2-b1plus-native-flashcards-v590-dari-system-default-fa';
const FILES=['./index.html?v=59','./styles.css?v=59','./data.js?v=59','./app.js?v=59','./manifest.webmanifest?v=59','./icon.svg?v=59','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

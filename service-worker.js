const CACHE='b2-b1plus-native-flashcards-v610-persian-farsi-mode';
const FILES=['./index.html?v=61','./styles.css?v=61','./data.js?v=61','./app.js?v=61','./manifest.webmanifest?v=61','./icon.svg?v=61','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

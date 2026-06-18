const CACHE='b2-b1plus-native-flashcards-v580-prioritize-persian-voice';
const FILES=['./index.html?v=58','./styles.css?v=58','./data.js?v=58','./app.js?v=58','./manifest.webmanifest?v=58','./icon.svg?v=58','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

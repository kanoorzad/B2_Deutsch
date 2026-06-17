const CACHE='b2-b1plus-native-flashcards-v510-full-v4-voice-engine';
const FILES=['./index.html?v=51','./styles.css?v=51','./data.js?v=51','./app.js?v=51','./manifest.webmanifest?v=51','./icon.svg?v=51','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

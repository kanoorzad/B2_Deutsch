const CACHE='b2-b1plus-native-flashcards-v570-dari-english-voice-fallback';
const FILES=['./index.html?v=57','./styles.css?v=57','./data.js?v=57','./app.js?v=57','./manifest.webmanifest?v=57','./icon.svg?v=57','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

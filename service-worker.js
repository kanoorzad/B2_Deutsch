const CACHE='b2-b1plus-native-flashcards-v470-fully-automatic-audio';
const FILES=['./index.html?v=47','./styles.css?v=47','./data.js?v=47','./app.js?v=47','./manifest.webmanifest?v=47','./icon.svg?v=47','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

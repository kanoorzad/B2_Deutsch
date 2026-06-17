const CACHE='b2-b1plus-native-flashcards-v390-browser-voice-selector';
const FILES=['./index.html?v=39','./styles.css?v=39','./data.js?v=39','./app.js?v=39','./manifest.webmanifest?v=39','./icon.svg?v=39','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

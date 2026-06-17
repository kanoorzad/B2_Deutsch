const CACHE='b2-b1plus-native-flashcards-v350-browser-first-dari';
const FILES=["./index.html?v=35", "./styles.css?v=35", "./data.js?v=35", "./audio-index.js?v=35", "./app.js?v=35", "./manifest.webmanifest?v=35", "./icon.svg?v=35", "./README.md", "./qa-report.json", "./dari-sprite-1.mp3?v=35", "./dari-sprite-2.mp3?v=35", "./dari-sprite-3.mp3?v=35", "./dari-sprite-4.mp3?v=35"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

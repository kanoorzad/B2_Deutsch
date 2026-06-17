const CACHE='b2-b1plus-native-flashcards-v330-clear-dari-correct-version';
const FILES=["./index.html?v=33", "./styles.css?v=33", "./data.js?v=33", "./audio-index.js?v=33", "./app.js?v=33", "./manifest.webmanifest?v=33", "./icon.svg?v=33", "./README.md", "./qa-report.json", "./dari-sprite-1.mp3?v=33", "./dari-sprite-2.mp3?v=33", "./dari-sprite-3.mp3?v=33", "./dari-sprite-4.mp3?v=33"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

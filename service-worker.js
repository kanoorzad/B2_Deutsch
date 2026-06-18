const CACHE='b2-b1plus-native-flashcards-v540-v51-restore-wakelock';
const FILES=['./index.html?v=54','./styles.css?v=54','./data.js?v=54','./app.js?v=54','./manifest.webmanifest?v=54','./icon.svg?v=54','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

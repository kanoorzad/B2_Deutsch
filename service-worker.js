const CACHE='b2-b1plus-native-flashcards-v420-online-ai-tts';
const FILES=['./index.html?v=42','./styles.css?v=42','./data.js?v=42','./app.js?v=42','./manifest.webmanifest?v=42','./icon.svg?v=42','./README.md','./qa-report.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

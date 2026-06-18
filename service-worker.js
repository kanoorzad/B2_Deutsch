const CACHE='de-flashcards-v660-unit-step-change-material';
const FILES=['./index.html?v=66','./styles.css?v=66','./data.js?v=66','./app.js?v=66','./manifest.webmanifest?v=66','./icon.svg?v=66','./README.md','./qa-report.json','./translation-pack/translation_review_template.csv','./translation-pack/translation_review_template.json','./translation-pack/README_TRANSLATIONS.md'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

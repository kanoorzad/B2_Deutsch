const CACHE='de-flashcards-v630-final-clean-multilingual';
const FILES=['./index.html?v=63','./styles.css?v=63','./data.js?v=63','./app.js?v=63','./manifest.webmanifest?v=63','./icon.svg?v=63','./README.md','./qa-report.json','./translation-pack/translation_review_template.csv','./translation-pack/translation_review_template.json','./translation-pack/README_TRANSLATIONS.md'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

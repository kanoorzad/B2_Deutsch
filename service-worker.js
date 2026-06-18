const CACHE='de-flashcards-v640-german-start-flow';
const FILES=['./index.html?v=64','./styles.css?v=64','./data.js?v=64','./app.js?v=64','./manifest.webmanifest?v=64','./icon.svg?v=64','./README.md','./qa-report.json','./translation-pack/translation_review_template.csv','./translation-pack/translation_review_template.json','./translation-pack/README_TRANSLATIONS.md'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

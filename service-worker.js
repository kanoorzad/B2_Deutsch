const CACHE='german-a1-b2-telc-v69-corrected';
const FILES=[
  './index.html?v=69',
  './styles.css?v=69',
  './data.js?v=69',
  './app.js?v=69',
  './manifest.webmanifest?v=69',
  './icon.svg?v=69',
  './README.md',
  './qa-report.json',
  './translation-pack/translation_review_template.csv',
  './translation-pack/translation_review_template.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

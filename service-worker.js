const CACHE='german-a1-b2-telc-v93-verb-forms-real-synonyms';
const FILES=[
 './index.html?v=93','./styles.css?v=93','./data.js?v=93','./app.js?v=93',
 './manifest.webmanifest?v=93','./icon.svg?v=93','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

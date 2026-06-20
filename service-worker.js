const CACHE='german-a1-b2-telc-v91-static-german-synonyms-from-v88';
const FILES=[
 './index.html?v=91','./styles.css?v=91','./data.js?v=91','./app.js?v=91',
 './manifest.webmanifest?v=91','./icon.svg?v=91','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

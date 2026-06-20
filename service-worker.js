const CACHE='german-a1-b2-telc-v89-app-version-dynamic-synonyms-audio';
const FILES=[
 './index.html?v=89','./styles.css?v=89','./data.js?v=89','./app.js?v=89',
 './manifest.webmanifest?v=89','./icon.svg?v=89','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

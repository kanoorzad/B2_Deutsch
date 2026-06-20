const CACHE='german-a1-b2-telc-v99-force-version-cache-reset';
const FILES=[
 './index.html?v=99','./styles.css?v=99','./data.js?v=99','./app.js?v=99',
 './manifest.webmanifest?v=99','./icon.svg?v=99','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{
      const copy=r.clone();
      caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      return r;
    }).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html?v=99'))));
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});

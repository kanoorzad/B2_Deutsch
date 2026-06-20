const CACHE='german-a1-b2-telc-v100-clean-flashcard-area';
const FILES=[
 './index.html?v=100','./styles.css?v=100','./data.js?v=100','./app.js?v=100',
 './manifest.webmanifest?v=100','./icon.svg?v=100','./README.md','./qa-report.json'
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
    }).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html?v=100'))));
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});

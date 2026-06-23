const CACHE='german-a1-b2-telc-v2-0-3-irregular-interlink-verb-forms-fix';
const FILES=[
 './index.html?v=2.0.3','./styles.css?v=2.0.3','./data.js?v=2.0.3','./app.js?v=2.0.3',
 './manifest.webmanifest?v=2.0.3','./icon.svg?v=2.0.3','./README.md','./qa-report.json'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const req=e.request;
  const url=new URL(req.url);
  if(req.mode==='navigate'){
    e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{
      const copy=r.clone();
      caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      return r;
    }).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html?v=2.0.3'))));
    return;
  }
  if(url.pathname.endsWith('/audio-manifest.js') || url.pathname.includes('/audio/fa/')){
    e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{
      if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});}
      return r;
    }).catch(()=>caches.match(req)));
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});

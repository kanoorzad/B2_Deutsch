const CACHE='german-a1-b2-telc-v104-github-actions-persisch-audio-workflow';
const FILES=[
 './index.html?v=104','./styles.css?v=104','./data.js?v=104','./app.js?v=104',
 './audio-manifest.js?v=104','./manifest.webmanifest?v=104','./icon.svg?v=104',
 './README.md','./qa-report.json','./PERSISCH_AUDIO_GUIDE.md','./persian_audio_jobs.csv'
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
    }).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html?v=104'))));
    return;
  }
  if(url.pathname.includes('/audio/fa/')){
    e.respondWith(fetch(req).then(r=>{
      if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});}
      return r;
    }).catch(()=>caches.match(req)));
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});

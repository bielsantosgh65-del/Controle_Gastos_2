// Finanças da Moto - service worker (funcionamento offline e atualizações)
const VERSION='fm-4defbd8a31';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./maskable-512.png','./apple-touch-icon.png','./favicon-64.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION&&k!=='fm-fonts').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting();});
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'){
  e.respondWith(caches.open('fm-fonts').then(async c=>{const hit=await c.match(req);const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r;}).catch(()=>hit);return hit||net;}));return;}
 if(url.origin!==self.location.origin)return;
 e.respondWith(caches.match(req,{ignoreSearch:req.mode==='navigate'}).then(hit=>{if(hit)return hit;
  return fetch(req).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(VERSION).then(c=>c.put(req,cp));}return r;})
   .catch(()=>req.mode==='navigate'?caches.match('./index.html'):Response.error());}));
});

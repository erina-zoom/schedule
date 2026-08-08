const CACHE_NAME = "erina-v5";

self.addEventListener("install",e=>{
    self.skipWaiting();
});

self.addEventListener("activate",e=>{
    caches.keys().then(keys=>{
        keys.forEach(key=>{
            if(key!==CACHE_NAME){
                caches.delete(key);
            }
        });
    });
});

self.addEventListener("fetch",e=>{
    e.respondWith(fetch(e.request));
});
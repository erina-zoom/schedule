const CACHE_NAME = "erina-cache-v2";

// インストール
self.addEventListener("install", e=>{
    self.skipWaiting();
});

// アクティブ
self.addEventListener("activate", e=>{
    clients.claim();
});

// フェッチ
self.addEventListener("fetch", event => {

    // APIは絶対キャッシュしない
    if(event.request.url.includes("workers.dev")){
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        fetch(event.request).catch(()=>{
            return caches.match(event.request);
        })
    );
});
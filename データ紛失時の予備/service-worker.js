// ======================================
// ERINA Zoom Ver5（修正版）
// ======================================

const CACHE_NAME = "erina-zoom-v5";

// キャッシュ対象
const STATIC_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json"
];

// ========================
// インストール
// ========================
self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(STATIC_FILES))
    );
});

// ========================
// アクティベート
// ========================
self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if(key !== CACHE_NAME){
                        return caches.delete(key);
                    }
                })
            )
        )
    );

    self.clients.claim();
});

// ========================
// fetch（重要）
// ========================
self.addEventListener("fetch", event => {

    const url = new URL(event.request.url);

    // 🔥 API系は絶対キャッシュしない
    if(
        url.pathname.includes("events") ||
        url.pathname.includes("notices")
    ){
        event.respondWith(
            fetch(event.request, {
                cache: "no-store"
            })
        );
        return;
    }

    // 🔥 HTMLは常に最新
    if(event.request.mode === "navigate"){
        event.respondWith(fetch(event.request));
        return;
    }

    // 🔥 JS/CSSもネット優先
    event.respondWith(
        fetch(event.request)
        .then(res => {
            return caches.open(CACHE_NAME)
            .then(cache => {
                cache.put(event.request, res.clone());
                return res;
            });
        })
        .catch(() => caches.match(event.request))
    );
});
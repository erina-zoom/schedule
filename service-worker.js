// ==========================================
// ERINA Zoom Schedule Service Worker
// Version 1.0
// ==========================================

const CACHE_NAME = "erina-zoom-v1";

const urlsToCache = [
    "./",
    "./index.html",
    "./style.css",
    "./events.js",
    "./calendar.js",
    "./manifest.json"
];

// インストール
self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME).then(cache => {

            return cache.addAll(urlsToCache);

        })

    );

});

// キャッシュから取得
self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request).then(response => {

            return response || fetch(event.request);

        })

    );

});

// 古いキャッシュ削除
self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys => {

            return Promise.all(

                keys.map(key => {

                    if (key !== CACHE_NAME) {

                        return caches.delete(key);

                    }

                })

            );

        })

    );

});
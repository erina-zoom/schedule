// ==========================================
// ERINA Zoom Schedule
// service-worker.js
// ==========================================

const CACHE_NAME = "erina-zoom-v1";

const FILES = [

    "./",

    "./index.html",

    "./style.css",

    "./app.js",

    "./events.js",

    "./manifest.json",

    "./icons/icon-192.png",

    "./icons/icon-512.png"

];


// インストール

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => {

            return cache.addAll(FILES);

        })

    );

});


// 起動時キャッシュ利用

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)

        .then(response => {

            return response || fetch(event.request);

        })

    );

});


// 更新時に古いキャッシュ削除

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()

        .then(keys => {

            return Promise.all(

                keys.map(key => {

                    if(key !== CACHE_NAME){

                        return caches.delete(key);

                    }

                })

            );

        })

    );

});
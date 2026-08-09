// ======================================
// ERINA Zoom
// service-worker.js
// 最新UI自動更新対応版
// ======================================


const CACHE_NAME =
"erina-zoom-v8";



const STATIC_FILES = [

"./",

"./index.html",

"./style.css",

"./app.js",

"./manifest.json"

];





// ======================================
// Install
// ======================================


self.addEventListener(
"install",
event => {


    // 新しいWorkerを即有効化

    self.skipWaiting();



    event.waitUntil(

        caches.open(
            CACHE_NAME
        )

        .then(cache=>{


            return cache.addAll(
                STATIC_FILES
            );


        })

    );


});






// ======================================
// Activate
// 古いキャッシュ削除
// ======================================


self.addEventListener(
"activate",
event=>{


    event.waitUntil(

        caches.keys()

        .then(keys=>{


            return Promise.all(

                keys.map(key=>{


                    if(
                        key !== CACHE_NAME
                    ){


                        return caches.delete(
                            key
                        );


                    }


                })

            );


        })

        .then(()=>{


            return self.clients.claim();


        })

    );


});







// ======================================
// Fetch
// ======================================


self.addEventListener(
"fetch",
event=>{


    if(
        event.request.method !== "GET"
    ){

        return;

    }



    const url =
    new URL(
        event.request.url
    );





    // ==================================
    // 常に最新版取得するもの
    // ==================================


    if(

        url.pathname.endsWith(
            ".html"
        )

        ||

        url.pathname.endsWith(
            ".css"
        )

        ||

        url.pathname.endsWith(
            ".js"
        )

        ||

        url.pathname.includes(
            "events.json"
        )

    ){


        event.respondWith(

            fetch(
                event.request,
                {
                    cache:"no-store"
                }
            )


        );


        return;

    }





    // ==================================
    // 画像などはキャッシュ利用
    // ==================================


    event.respondWith(

        caches.match(
            event.request
        )

        .then(cached=>{


            return cached ||

            fetch(
                event.request
            );


        })

    );


});






// ======================================
// 手動更新
// ======================================


self.addEventListener(
"message",
event=>{


    if(
        event.data ===
        "skipWaiting"
    ){

        self.skipWaiting();

    }


});







// ======================================
// Push通知（将来用）
// ======================================


self.addEventListener(
"push",
event=>{


    if(!event.data)
        return;



    const data =
    event.data.json();



    event.waitUntil(

        self.registration.showNotification(

            data.title,

            {

                body:
                data.body,


                icon:
                "images/icon-192.png",


                badge:
                "images/icon-192.png"

            }

        )

    );


});






// ======================================
// 通知クリック
// ======================================


self.addEventListener(
"notificationclick",
event=>{


    event.notification.close();



    event.waitUntil(

        clients.openWindow(
            "./"
        )

    );


});
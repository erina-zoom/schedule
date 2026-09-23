/* ===============================
   ERINA Zoom予定表
   新アプリ用 app.js
================================ */


/* ===============================
   Cloudflare Worker
================================ */

const DATA_URL =
    "https://erina-zoom.tomoya19980427goku.workers.dev/api/events";

const PRODUCTS_URL =
    "https://erina-zoom.tomoya19980427goku.workers.dev/api/products";

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
/* ===============================
   データ
================================ */

let events = [];

let products = [];


/* ===============================
   メニュー
================================ */

const menuButton =
    document.getElementById("menuButton");

const menuClose =
    document.getElementById("menuClose");

const sideMenu =
    document.getElementById("sideMenu");

const menuOverlay =
    document.getElementById("menuOverlay");


function openMenu(){

    if(sideMenu){
        sideMenu.classList.add("open");
    }

    if(menuOverlay){
        menuOverlay.classList.add("show");
    }

}


function closeMenu(){

    if(sideMenu){
        sideMenu.classList.remove("open");
    }

    if(menuOverlay){
        menuOverlay.classList.remove("show");
    }

}


if(menuButton){

    menuButton.addEventListener(
        "click",
        openMenu
    );

}


if(menuClose){

    menuClose.addEventListener(
        "click",
        closeMenu
    );

}


if(menuOverlay){

    menuOverlay.addEventListener(
        "click",
        closeMenu
    );

}


/* ===============================
   ページ切り替え
================================ */

function showView(viewName){

    const views = [

        "homeView",
        "scheduleView",
        "calendarView",
        "guideView",
        "productsView"

    ];


    views.forEach(id => {

        const view =
            document.getElementById(id);

        if(!view){
            return;
        }


        view.style.display =
            "none";

        view.classList.remove(
            "active-view"
        );

    });


    const target =
        document.getElementById(
            viewName + "View"
        );


    if(target){

        target.style.display =
            "block";

        target.classList.add(
            "active-view"
        );

    }


    document
        .querySelectorAll(
            ".menu-item"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );


            if(
                button.dataset.view ===
                viewName
            ){

                button.classList.add(
                    "active"
                );

            }

        });


    closeMenu();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if(
        viewName === "calendar"
    ){

        renderCalendar();

    }

}


/* ===============================
   メインメニュー
================================ */

document
    .querySelectorAll(
        ".menu-item"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const view =
                    button.dataset.view;

                if(view){

                    showView(view);

                }

            }
        );

    });

/* ===============================
   ホーム画面ナビゲーション
================================ */

document
    .querySelectorAll(
        ".home-nav-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const view =
                    button.dataset.view;

                if(view){

                    showView(view);

                }

            }
        );

    });
    /* ===============================
   予定表・カレンダー切り替え
================================ */

document
    .querySelectorAll(
        ".schedule-calendar-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const view =
                    button.dataset.view;

                if(view){

                    showView(view);

                }

            }
        );

    });
/* ===============================
   日本時間
================================ */

function getJapanDate(){

    const now =
        new Date();


    return new Date(

        now.toLocaleString(
            "ja-JP",
            {
                timeZone:
                    "Asia/Tokyo"
            }
        )

    );

}


function formatDate(date){

    const y =
        date.getFullYear();


    const m =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const d =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${y}-${m}-${d}`;

}


/* ===============================
   イベント取得
================================ */

async function loadEvents(){

    try{

        const res =
            await fetch(
                DATA_URL +
                "?t=" +
                Date.now(),
                {
                    cache: "no-store"
                }
            );


        if(!res.ok){

            throw new Error(
                "イベント取得失敗"
            );

        }


        const data =
            await res.json();


        events =
            Array.isArray(data)
                ? data
                : (
                    data.events || []
                );


        events.sort(
            (a, b) => {

                const da =
                    `${a.event_date || a.date} ${
                        a.start_time || a.startTime || "00:00"
                    }`;

                const db =
                    `${b.event_date || b.date} ${
                        b.start_time || b.startTime || "00:00"
                    }`;


                return da.localeCompare(db);

            }
        );


        renderSchedule();


        renderCalendar();


    }catch(error){

        console.error(
            "イベント取得エラー:",
            error
        );

    }

}


/* ===============================
   イベントデータを統一
================================ */

function normalizeEvent(e){

    return {

        id:
            e.id,

        date:
            e.event_date ||
            e.date ||
            "",

        startTime:
            e.start_time ||
            e.startTime ||
            "",

        endTime:
            e.end_time ||
            e.endTime ||
            "",

        title:
            e.title ||
            "",

        shortTitle:
            e.short_title ||
            e.shortTitle ||
            e.title ||
            "",

        color:
            e.color ||
            "#247447",

        image:
            e.image_url ||
            e.image ||
            "",

        zoomUrl:
            e.zoom_url ||
            e.zoomUrl ||
            "",

        description:
            e.description ||
            "",
locked:
    !!e.locked,

        program:
            e.programs ||
            e.program ||
            []

    };

}


/* ===============================
   予定表
================================ */

function renderSchedule(){

    const todayBox =
        document.getElementById(
            "today"
        );


    const scheduleTodayBox =
        document.getElementById(
            "scheduleToday"
        );


    const nextBox =
        document.getElementById(
            "next"
        );


    const weekBox =
        document.getElementById(
            "week"
        );


    const allBox =
        document.getElementById(
            "allSchedule"
        );


    const normalizedEvents =
        events.map(
            normalizeEvent
        );


    const today =
        formatDate(
            getJapanDate()
        );


    const todayEvents =
        normalizedEvents.filter(
            e =>
                e.date === today
        );


    const futureEvents =
        normalizedEvents.filter(
            e =>
                e.date >= today
        );


    const weekStart =
        getJapanDate();


    const weekEnd =
        new Date(
            weekStart
        );


    weekEnd.setDate(
        weekEnd.getDate() + 7
    );


    const weekEvents =
        normalizedEvents.filter(
            e => {

                const d =
                    new Date(
                        e.date +
                        "T00:00:00"
                    );


                return (
                    d >= weekStart &&
                    d < weekEnd
                );

            }
        );


    if(todayBox){

        todayBox.innerHTML = "";


        if(todayEvents.length){

            todayEvents.forEach(
                e => {

                    todayBox.appendChild(
                        createCard(
                            e,
                            true
                        )
                    );

                }
            );

        }else{

            todayBox.innerHTML = `
                <p class="empty">
                    今日のZoomはありません
                </p>
            `;

        }

    }


    if(scheduleTodayBox){

        scheduleTodayBox.innerHTML = "";


        if(todayEvents.length){

            todayEvents.forEach(
                e => {

                    scheduleTodayBox.appendChild(
                        createCard(
                            e,
                            true
                        )
                    );

                }
            );

        }else{

            scheduleTodayBox.innerHTML = `
                <p class="empty">
                    今日のZoomはありません
                </p>
            `;

        }

    }


    if(nextBox){

        nextBox.innerHTML = "";


        if(futureEvents.length){

            nextBox.appendChild(
                createCard(
                    futureEvents[0],
                    true
                )
            );

        }else{

            nextBox.innerHTML = `
                <p class="empty">
                    次回のZoomはありません
                </p>
            `;

        }

    }


    if(weekBox){

        weekBox.innerHTML = "";


        if(weekEvents.length){

            weekEvents.forEach(
                e => {

                    weekBox.appendChild(
                        createCard(
                            e,
                            false
                        )
                    );

                }
            );

        }else{

            weekBox.innerHTML = `
                <p class="empty">
                    今週の予定はありません
                </p>
            `;

        }

    }


    if(allBox){

        allBox.innerHTML = "";


        if(normalizedEvents.length){

            normalizedEvents.forEach(
                e => {

                    allBox.appendChild(
                        createCard(
                            e,
                            false
                        )
                    );

                }
            );

        }else{

            allBox.innerHTML = `
                <p class="empty">
                    現在予定はありません
                </p>
            `;

        }

    }

}


/* ===============================
   イベントカード
================================ */

function createCard(
    e,
    showZoom = false
){

    const div =
        document.createElement(
            "div"
        );


    div.className =
        "event-card";


    const dateObj =
        new Date(
            e.date +
            "T00:00:00"
        );


    const week = [

        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"

    ];


    const dateText =
        `${dateObj.getMonth() + 1}/${
            dateObj.getDate()
        }(${
            week[dateObj.getDay()]
        })`;


    div.innerHTML = `

        <div class="event-header">

            <div class="event-date">
                ${dateText}
            </div>


            <div class="event-time">
                🕒 ${e.startTime || ""}
            </div>

        </div>


        <div class="event-title">
            ${e.title || ""}
        </div>


        ${
    showZoom && (e.zoomUrl || e.locked)
    ?

    `
    <a
        href="#"
        class="zoom-btn"
        onclick="
            event.stopPropagation();
            handleZoomJoin('${e.id}');
            return false;
        "
    >
        Zoomに参加する
    </a>
    `

    :

    ""
}

    `;


    div.onclick = () => {

        openModal(e);

    };


    return div;

}


/* ===============================
   モーダル
================================ */

function openModal(e){

    const modal =
        document.getElementById(
            "modal"
        );


    const detail =
        document.getElementById(
            "eventDetail"
        );


    if(!modal || !detail){

        return;

    }


    let html = "";


    if(e.image){

        html += `

            <img
                src="${e.image}"
                class="modal-image"
                alt=""
            >

        `;

    }


    html += `

        <h2>
            ${e.title || ""}
        </h2>


        <p>
            📅 ${e.date || ""}
        </p>


        <p>
            🕒 ${e.startTime || ""}
            ${
                e.endTime
                ?
                `〜${e.endTime}`
                :
                ""
            }
        </p>

    `;


    if(e.description){

        html += `

            <hr>

            <p>
                ${e.description}
            </p>

        `;

    }


    if(
        e.program &&
        Array.isArray(e.program) &&
        e.program.length
    ){

        html += `

            <hr>

            <h3>
                📋 催事スケジュール
            </h3>

            <div class="program-list">

        `;


        e.program.forEach(
            item => {

                html += `

                    <div class="program-item">

                        <div>

                            <div class="program-time">
                                ${item.program_time || item.time || ""}
                            </div>

                        </div>


                        <div class="program-content">

                            <div class="program-title">
                                ${item.title || ""}
                            </div>


                            ${
                                item.person
                                ?
                                `
                                <div class="program-person">
                                    👤 ${item.person}
                                </div>
                                `
                                :
                                ""
                            }

                        </div>

                    </div>

                `;

            }
        );


        html += `
            </div>
        `;

    }


    if(e.zoomUrl || e.locked){

    html += `

        <a
            href="#"
            class="zoom-btn modal-zoom"
            onclick="
                event.stopPropagation();
                handleZoomJoin('${e.id}');
                return false;
            "
        >
            Zoomに参加する
        </a>

    `;

}


    detail.innerHTML =
        html;


    modal.classList.add(
        "show"
    );

}


/* ===============================
   モーダルを閉じる
================================ */

function closeModal(){

    const modal =
        document.getElementById(
            "modal"
        );


    if(modal){

        modal.classList.remove(
            "show"
        );

    }

}


document.addEventListener(
    "click",
    event => {

        if(
            event.target.id ===
            "closeModal"
        ){

            closeModal();

        }

    }
);


/* ===============================
   カレンダー
================================ */

let currentDate =
    new Date();


function renderCalendar(){

    const calendar =
        document.getElementById(
            "calendar"
        );


    const monthTitle =
        document.getElementById(
            "monthTitle"
        );


    if(!calendar){

        return;

    }


    calendar.innerHTML =
        "";


    const year =
        currentDate.getFullYear();


    const month =
        currentDate.getMonth();


    if(monthTitle){

        monthTitle.innerText =
            `${year}年${month + 1}月`;

    }


    let first =
        new Date(
            year,
            month,
            1
        ).getDay();


    first =
        first === 0
        ? 6
        : first - 1;


    const last =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for(
        let i = 0;
        i < first;
        i++
    ){

        calendar.innerHTML +=
            "<div></div>";

    }


    const normalizedEvents =
        events.map(
            normalizeEvent
        );


    for(
        let d = 1;
        d <= last;
        d++
    ){

        const dateStr =
            `${year}-${String(
                month + 1
            ).padStart(2, "0")}-${
                String(d).padStart(2, "0")
            }`;


        const dayEvents =
            normalizedEvents.filter(
                e =>
                    e.date === dateStr
            );


        const day =
            document.createElement(
                "div"
            );


        day.className =
            "calendar-day";


        let eventHtml =
            "";


        dayEvents.forEach(
            e => {

                eventHtml += `

                    <div
                        class="calendar-event"
                        style="background:${
                            e.color ||
                            "#247447"
                        }"
                    >
                        ${
                            e.shortTitle ||
                            e.title
                        }
                    </div>

                `;

            }
        );


        day.innerHTML = `

            <div>
                ${d}
            </div>

            ${eventHtml}

        `;


        if(dayEvents.length){

            day.onclick = () => {

                openModal(
                    dayEvents[0]
                );

            };

        }


        calendar.appendChild(
            day
        );

    }

}


/* ===============================
   カレンダー月移動
================================ */

const prev =
    document.getElementById(
        "prevMonth"
    );


const next =
    document.getElementById(
        "nextMonth"
    );


if(prev){

    prev.onclick = () => {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );


        renderCalendar();

    };

}


if(next){

    next.onclick = () => {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );


        renderCalendar();

    };

}


/* ===============================
   使い方
================================ */

function showGuide(type){

    const guideContent =
        document.getElementById("guideContent");


    if(!guideContent){
        return;
    }


    showView("guide");


    /* ===============================
       iPhone
    =============================== */

    if(type === "iphone"){

        guideContent.innerHTML = `

            <div class="guide-card">

                <h2>🍎 iPhoneでの使い方</h2>

                <p class="guide-intro">
                    ERINA Zoomスケジュールをホーム画面に追加すると、
                    次回からホーム画面のアイコンをタップするだけで、
                    すぐに開くことができます。
                </p>


                <!-- パターン① -->

                <div class="guide-pattern">

                    <h3>パターン①</h3>

                    <h4>
                        Safariの画面右下に「・・・」が表示されている場合
                    </h4>

                    <p>
                        SafariでERINA Zoomスケジュールを開いた状態から、
                        以下の手順でホーム画面に追加してください。
                    </p>


                    <ol>

                        <li>
                            画面右下の「・・・」を押します。
                        </li>

                        <li>
                            「共有」を押します。
                        </li>

                        <li>
                            右下の「表示を増やす」の
                            <strong>下向き「∨」ボタン</strong>
                            を押します。
                        </li>

                        <li>
                            「ホーム画面に追加」を押します。
                        </li>

                        <li>
                            右上の「追加」を押します。
                        </li>

                    </ol>


                    <div class="guide-image-placeholder">

                       <div class="guide-image">

    <img
        src="./images/guides/iphone-pattern1.png"
        alt="iPhone パターン①のホーム画面追加方法"
    >

</div>
                </div>



                <!-- パターン② -->

                <div class="guide-pattern">

                    <h3>パターン②</h3>

                    <h4>
                        Safariの画面下に「共有」ボタン（□↑）が
                        表示されている場合
                    </h4>

                    <p>
                        SafariでERINA Zoomスケジュールを開いた状態から、
                        以下の手順でホーム画面に追加してください。
                    </p>


                    <ol>

                        <li>
                            画面下の「共有」ボタンを押します。
                        </li>

                        <li>
                            右下の「表示を増やす」の
                            <strong>下向き「∨」ボタン</strong>
                            を押します。
                        </li>

                        <li>
                            「ホーム画面に追加」を押します。
                        </li>

                        <li>
                            右上の「追加」を押します。
                        </li>

                    </ol>


                    <div class="guide-image-placeholder">

                        <div class="guide-image">

    <img
        src="./images/guides/iphone-pattern2.png"
        alt="iPhone パターン②のホーム画面追加方法"
    >

</div>

                </div>

            </div>

        `;


    /* ===============================
       iPad
    =============================== */

    }else if(type === "ipad"){

    guideContent.innerHTML = `

        <div class="guide-card">

            <h2>📱 iPadでの使い方</h2>

            <p class="guide-intro">
                iPadのホーム画面に追加する方法をご案内します。
            </p>


            <div class="guide-pattern">

                <h3>ホーム画面に追加</h3>

                <p>
                    SafariでERINA Zoomスケジュールを開いた状態から、
                    以下の手順でホーム画面に追加してください。
                </p>


                <ol>

                    <li>
                        SafariでERINA Zoomスケジュールを開きます。
                    </li>

                    <li>
                        共有メニューを開きます。
                    </li>

                    <li>
                        「ホーム画面に追加」を選びます。
                    </li>

                    <li>
                        「追加」を押します。
                    </li>

                </ol>


                <!-- iPad画像を後から追加 -->

                <div class="guide-image-placeholder">

                    <div class="guide-image">

    <img
        src="./images/guides/ipad-home-add.png"
        alt="iPadのホーム画面追加方法"
    >

</div>

            </div>

        </div>

    `;


    /* ===============================
       Android
    =============================== */

    }else if(type === "android"){

    guideContent.innerHTML = `

        <div class="guide-card">

            <h2>🤖 Androidでの使い方</h2>

            <p class="guide-intro">
                AndroidではChromeからホーム画面に追加できます。
            </p>


            <div class="guide-pattern">

                <h3>ホーム画面に追加</h3>

                <ol>

                    <li>
                        ChromeでERINA Zoomスケジュールを開きます。
                    </li>

                    <li>
                        右上の「︙」を押します。
                    </li>

                    <li>
                        「ホーム画面に追加」または
                        「ショートカットを作成」を選びます。
                    </li>

                    <li>
                        表示された画面で、
                        名前を確認・変更します。
                    </li>

                    <li>
                        「追加」を押します。
                    </li>

                </ol>


                <div class="guide-image">

    <img
        src="./images/guides/android-home-add.png"
        alt="Androidのホーム画面への追加方法"
    >

</div>

            </div>

        </div>

    `;

/* ===============================
   Zoom
================================ */
}else if(type === "zoom"){

    guideContent.innerHTML = `

        <div class="guide-card">

            <h2>📱 Zoomアプリのインストール</h2>

            <p class="guide-intro">
                Zoomに参加するには、お使いの端末に合わせて
            下のボタンから、Zoomアプリをインストールしてください。
            </p>


            <!-- iPhone・iPad -->

            <div class="guide-pattern">

                <h3>🍎 iPhone・iPad</h3>

            
                <a
                    href="https://apps.apple.com/jp/app/zoom-workplace/id546505307"
                    target="_blank"
                    rel="noopener"
                    class="guide-button"
                >
                    App StoreでZoomをインストール
                </a>

            </div>

            <!-- Android -->

            <div class="guide-pattern">

                <h3>🤖 Android</h3>

    
                <a
                    href="https://play.google.com/store/apps/details?id=us.zoom.videomeetings&hl=ja"
                    target="_blank"
                    rel="noopener"
                    class="guide-button"
                >
                    Google PlayでZoomをインストール
                </a>

            </div>

        </div>

    `;

}

}

/* ===============================
   使い方メニュー
================================ */

document
    .querySelectorAll(
        "[data-guide]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showGuide(
                    button.dataset.guide
                );

            }
        );

    });


/* ===============================
   商品
================================ */
document
    .querySelectorAll("[data-category]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const category =
                    button.dataset.category;

                if (category) {
                    loadProducts(category);
                }

            }
        );

    });
async function loadProducts(
    category
){

    showView("products");

    const isLimited =
        category === "限定販売";

    const apiCategory =
        isLimited
            ? "スキンケア"
            : category;


    const productList =
        document.getElementById(
            "productList"
        );


    if(!productList){

        return;

    }


    productList.innerHTML = `

        <p class="empty">
            商品を読み込んでいます……
        </p>

    `;


    try{

        const res =
            await fetch(
                PRODUCTS_URL +
"?category=" +
encodeURIComponent(
    apiCategory
)
                +
                "&t=" +
                Date.now()
            );


        if(!res.ok){

            throw new Error(
                "商品取得失敗"
            );

        }


        const data =
            await res.json();


        products =
    Array.isArray(data)
        ? data
        : (
            data.products || []
        );

if (isLimited) {
    products = products.filter(
        product =>
            product.product_type === "limited"
    );
}


        renderProducts(
            products,
            category
        );


    }catch(error){

        console.error(
            "商品取得エラー:",
            error
        );


        productList.innerHTML = `

            <p class="empty">
                商品情報を取得できませんでした。
            </p>

        `;

    }

}


/* ===============================
   商品表示
================================ */

function renderProducts(list, category) {

    const container =
        document.getElementById("productList");

    if (!container) return;

    if (!list || list.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                現在、掲載中の商品はありません。
            </div>
        `;

        return;
    }

    container.innerHTML = list.map(product => {

        return `
            <article class="product-card">

                ${
                    product.image_url
                        ? `
                            <div
                                class="product-image"
                                style="cursor:pointer;"
                                onclick="showProductDetail(${product.id})"
                            >
                                <img
                                    src="${escapeHtml(product.image_url)}"
                                    alt="${escapeHtml(product.name || "")}"
                                    loading="lazy"
                                >
                            </div>
                        `
                        : ""
                }

                <div class="product-info">

                    <h3
                        style="cursor:pointer;"
                        onclick="showProductDetail(${product.id})"
                    >
                        ${escapeHtml(product.name || "")}
                    </h3>

                </div>

            </article>
        `;

    }).join("");
}

/* ===============================
   商品詳細
================================ */

async function showProductDetail(productId) {

    try {

        const oldModal =
            document.getElementById(
                "productDetailModal"
            );

        if (oldModal) {
            oldModal.remove();
        }

        const res = await fetch(
            PRODUCTS_URL +
            "/" +
            encodeURIComponent(productId) +
            "?t=" +
            Date.now()
        );

        if (!res.ok) {
            throw new Error("商品詳細取得失敗");
        }

        const data = await res.json();

        if (!data.product) {
            throw new Error("商品情報がありません");
        }

        const product = data.product;

        const prices =
            Array.isArray(product.prices)
                ? product.prices
                : [];


        /* ===============================
           価格・ポイント
        ================================ */

        const priceHtml =
            prices.length > 0
                ? `
                    <div style="
                        margin-top:25px;
                        overflow-x:auto;
                    ">

                        <h3>
                            価格・ポイント
                        </h3>

                        <table style="
                            width:100%;
                            min-width:650px;
                            border-collapse:collapse;
                            text-align:center;
                        ">

                            <thead>
                                <tr>

                                    ${prices.map(price => {

                                        let backgroundColor =
                                            "#f5f5f5";

                                        if (
                                            price.rank_name ===
                                            "おすすめ"
                                        ) {
                                            backgroundColor =
                                                "#d9d9d9";

                                        } else if (
                                            price.rank_name ===
                                            "ホワイト"
                                        ) {
                                            backgroundColor =
                                                "#ffffff";

                                        } else if (
                                            price.rank_name ===
                                            "イエロー"
                                        ) {
                                            backgroundColor =
                                                "#fff2a8";

                                        } else if (
                                            price.rank_name ===
                                            "グリーン"
                                        ) {
                                            backgroundColor =
                                                "#c8e6c9";

                                        } else if (
                                            price.rank_name ===
                                            "アンバー"
                                        ) {
                                            backgroundColor =
                                                "#e8b879";
                                        }

                                        return `
                                            <th style="
                                                border:1px solid #ddd;
                                                padding:12px 8px;
                                                background:${backgroundColor};
                                            ">
                                                ${escapeHtml(
                                                    price.rank_name || ""
                                                )}
                                            </th>
                                        `;

                                    }).join("")}

                                </tr>
                            </thead>

                            <tbody>

                                <tr>

                                    ${prices.map(price => `
                                        <td style="
                                            border:1px solid #ddd;
                                            padding:12px 8px;
                                            font-weight:bold;
                                        ">
                                            ${
                                                price.price != null
                                                    ? Number(
                                                        price.price
                                                    ).toLocaleString() +
                                                      "円"
                                                    : "-"
                                            }
                                        </td>
                                    `).join("")}

                                </tr>

                                <tr>

                                    ${prices.map(price => `
                                        <td style="
                                            border:1px solid #ddd;
                                            padding:10px 8px;
                                        ">
                                            ${
                                                price.points != null
                                                    ? price.points +
                                                      "ポイント"
                                                    : "-"
                                            }
                                        </td>
                                    `).join("")}

                                </tr>

                            </tbody>

                        </table>

                    </div>
                `
                : "";


        /* ===============================
           モーダル
        ================================ */

        const modal =
            document.createElement("div");

        modal.id =
            "productDetailModal";

        modal.style.cssText = `
            position:fixed;
            inset:0;
            background:rgba(0,0,0,.55);
            z-index:9999;
            overflow-y:auto;
            padding:20px;
            box-sizing:border-box;
        `;


        modal.innerHTML = `

            <div style="
                max-width:900px;
                margin:30px auto;
                background:#fff;
                border-radius:16px;
                padding:25px;
                box-sizing:border-box;
            ">

                <button
                    onclick="closeProductDetail()"
                    style="
                        display:block;
                        margin-left:auto;
                        border:none;
                        background:#eee;
                        border-radius:50%;
                        width:40px;
                        height:40px;
                        font-size:20px;
                        cursor:pointer;
                    "
                >
                    ×
                </button>


                <!-- 商品名 -->

                <h2 style="
                    color:#247447;
                    text-align:center;
                    margin:10px 0 25px;
                ">
                    ${escapeHtml(
                        product.name || ""
                    )}
                </h2>


                <!-- 商品画像 -->

                ${
                    product.image_url
                        ? `
                            <div style="
                                text-align:center;
                                margin-bottom:30px;
                            ">

                                <img
                                    src="${escapeHtml(
                                        product.image_url
                                    )}"
                                    alt=""
                                    style="
                                        display:block;
                                        width:100%;
                                        max-width:500px;
                                        height:auto;
                                        margin:0 auto;
                                        border-radius:10px;
                                    "
                                >

                            </div>
                        `
                        : ""
                }


                ${
    product.pdf_url
        ? `
            <div style="
                margin:0 0 30px;
            ">

                <a
                    href="${escapeHtml(
                        product.pdf_url
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                        display:block;
                        max-width:420px;
                        margin:0 auto;
                        padding:15px 20px;
                        background:#fff;
                        color:#247447;
                        text-align:center;
                        text-decoration:none;
                        border:1px solid #247447;
                        border-radius:10px;
                        font-weight:bold;
                        box-sizing:border-box;
                    "
                >
                    PDFを別画面で開く
                </a>

            </div>
        `
        : ""
}


                <!-- 商品説明 -->

                ${
                    product.description
                        ? `
                            <div style="
                                background:#f7f7f7;
                                padding:20px;
                                border-radius:12px;
                                margin-bottom:20px;
                            ">

                                <p>
                                    ${escapeHtml(
                                        product.description
                                    )}
                                </p>

                            </div>
                        `
                        : ""
                }


                <!-- 価格 -->

                ${priceHtml}


                <!-- 公式ページ -->

                ${
                    product.product_url
                        ? `
                            <a
                                href="${escapeHtml(
                                    product.product_url
                                )}"
                                target="_blank"
                                rel="noopener noreferrer"
                                style="
                                    display:block;
                                    max-width:420px;
                                    margin:30px auto 10px;
                                    padding:15px 20px;
                                    background:#247447;
                                    color:#fff;
                                    text-align:center;
                                    text-decoration:none;
                                    border-radius:10px;
                                    font-weight:bold;
                                    box-sizing:border-box;
                                "
                            >
                                ERINA公式商品ページを見る
                            </a>
                        `
                        : ""
                }

            </div>

        `;


        document.body.appendChild(
            modal
        );


    } catch (error) {

        console.error(
            "商品詳細取得エラー:",
            error
        );

        alert(
            "商品詳細を取得できませんでした。"
        );

    }

}

/* ===============================
   商品詳細を閉じる
================================ */

function closeProductDetail() {

    const modal =
        document.getElementById(
            "productDetailModal"
        );

    if (modal) {
        modal.remove();
    }

}

/* ===============================
   起動
================================ */

showView("home");

loadEvents();


/* ===============================
   30秒自動更新
================================ */

setInterval(
    () => {

        loadEvents();

    },
    30000
);
/* ===============================
   Zoomパスワード入力
================================ */

let passwordEvent = null;
function handleZoomJoin(eventId){

    const event =
        events
            .map(normalizeEvent)
            .find(e => e.id === eventId);

    if(!event){
        return;
    }

    // パスワードなし
    if(!event.locked){

        if(event.zoomUrl){

            window.open(
                event.zoomUrl,
                "_blank"
            );

        }

        return;
    }

    // パスワードあり
    openPasswordModal(eventId);

}

function openPasswordModal(eventId){

    passwordEvent =
        events
            .map(normalizeEvent)
            .find(e => e.id === eventId);

    const modal =
        document.getElementById(
            "passwordModal"
        );

    const passwordInput =
        document.getElementById(
            "zoomPassword"
        );

    const error =
        document.getElementById(
            "passwordError"
        );

    if(!modal || !passwordInput){
        return;
    }

    passwordInput.value = "";

    if(error){
        error.style.display = "none";
    }

    modal.classList.add("show");

    passwordInput.focus();

}


function closePasswordModal(){

    const modal =
        document.getElementById(
            "passwordModal"
        );

    if(modal){

        modal.classList.remove("show");

    }

}


const closePasswordButton =
    document.getElementById(
        "closePasswordModal"
    );


if(closePasswordButton){

    closePasswordButton.addEventListener(
        "click",
        closePasswordModal
    );

}


const passwordSubmit =
    document.getElementById(
        "passwordSubmit"
    );


if(passwordSubmit){

    passwordSubmit.addEventListener(
        "click",
        async () => {

            if(!passwordEvent){
                return;
            }

            const passwordInput =
                document.getElementById(
                    "zoomPassword"
                );

            const error =
                document.getElementById(
                    "passwordError"
                );

            const password =
                passwordInput.value.trim();

            if(!password){

                if(error){

                    error.textContent =
                        "パスワードを入力してください。";

                    error.style.display =
                        "block";

                }

                return;

            }

            try{

                const res =
                    await fetch(
                        DATA_URL.replace(
                            "/api/events",
                            `/api/events/${passwordEvent.id}/unlock`
                        ),
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    password:
                                        password
                                })
                        }
                    );


                const data =
                    await res.json();


                if(!res.ok){

                    if(error){

                        error.textContent =
                            "パスワードが正しくありません。";

                        error.style.display =
                            "block";

                    }

                    return;

                }


                closePasswordModal();

if(data.event && data.event.zoom_url){

    window.location.href =
        data.event.zoom_url;

}

            }catch(error){

                console.error(
                    "パスワード確認エラー:",
                    error
                );

            }

        }
    );

}
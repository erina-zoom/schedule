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


    if(e.zoomUrl){

        html += `

            <a
                href="${e.zoomUrl}"
                target="_blank"
                rel="noopener"
                class="zoom-btn modal-zoom"
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

    const guideView =
        document.getElementById(
            "guideView"
        );


    const guideContent =
        document.getElementById(
            "guideContent"
        );


    if(!guideView || !guideContent){

        return;

    }


    showView("guide");


    let title = "";


    if(type === "iphone"){

        title = "iPhone";

    }else if(type === "ipad"){

        title = "iPad";

    }else if(type === "android"){

        title = "Android";

    }else if(type === "zoom"){

        title =
            "Zoomアプリのインストール";

    }


    guideContent.innerHTML = `

        <div class="home-card">

            <h2>
                📱 ${title}
            </h2>

            <p>
                このページはこれから設定します。
            </p>

        </div>

    `;

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

                closeMenu();

            }
        );

    });


/* ===============================
   商品
================================ */

async function loadProducts(
    category
){

    showView("products");


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
                    category
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

function renderProducts(
    list,
    category
){

    const productList =
        document.getElementById(
            "productList"
        );


    if(!productList){

        return;

    }


    if(!list.length){

        productList.innerHTML = `

            <p class="empty">
                ${category}の商品はありません。
            </p>

        `;

        return;

    }


    productList.innerHTML = "";


    list.forEach(
        product => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "product-card";


            card.innerHTML = `

                ${
                    product.image_url
                    ?
                    `
                    <img
                        src="${product.image_url}"
                        alt="${product.name || ""}"
                    >
                    `
                    :
                    ""
                }


                <h3>
                    ${product.name || ""}
                </h3>


                ${
                    product.description
                    ?
                    `
                    <p>
                        ${product.description}
                    </p>
                    `
                    :
                    ""
                }


                ${
                    product.product_url
                    ?
                    `
                    <a
                        href="${product.product_url}"
                        target="_blank"
                        rel="noopener"
                        class="product-link"
                    >
                        ERINA公式商品ページを見る
                    </a>
                    `
                    :
                    ""
                }

            `;


            productList.appendChild(
                card
            );

        }
    );

}


/* ===============================
   商品メニュー
================================ */

document
    .querySelectorAll(
        "[data-category]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                loadProducts(
                    button.dataset.category
                );

                closeMenu();

            }
        );

    });


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


                if(data.zoom_url){

    window.location.href =
        data.zoom_url;

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
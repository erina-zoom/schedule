// ==========================================
// ERINA Zoom Manager Ver5（完全版）
// ==========================================

"use strict";

// ==========================================
// 設定
// ==========================================
const WORKER_URL =
"https://erina-manager.tomoya19980427goku.workers.dev";

const EVENTS_URL =
`${WORKER_URL}?action=events`;

// ==========================================
// データ
// ==========================================
let events = [];
let editingEventId = null;
let selectedImageFile = null;
let removeCurrentImage = false;

// ==========================================
// 初期化
// ==========================================
document.addEventListener("DOMContentLoaded", initializeManager);

async function initializeManager(){

    setupEventListeners();

    clearEditor();

    await loadEvents();

    // 🔥 ここが重要（お知らせ一覧表示）
    await renderNoticeList();
}

// ==========================================
// イベント設定
// ==========================================
function setupEventListeners(){

    document.getElementById("saveNoticeButton")?.addEventListener("click", saveNotice);
}

// ==========================================
// events取得
// ==========================================
async function loadEvents(){

    try{
        const res = await fetch(`${EVENTS_URL}&t=${Date.now()}`, {
            cache:"no-store"
        });

        const data = await res.json();

        events = data;

    }catch(e){
        console.error(e);
    }
}

// ==========================================
// お知らせ保存
// ==========================================
async function saveNotice(){

    const notice = {
        title: document.getElementById("noticeTitle").value,
        message: document.getElementById("noticeMessage").value,
        startDate: document.getElementById("noticeStart").value,
        endDate: document.getElementById("noticeEnd").value,
        enabled: document.getElementById("noticeEnabled").value === "true"
    };

    const res = await fetch(WORKER_URL, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            action:"saveNotice",
            notice: notice
        })
    });

    const result = await res.json();

    if(result.success){
        alert("保存OK👍");
        renderNoticeList(); // 🔥 保存後に更新
    }else{
        alert("保存失敗");
    }
}

// ==========================================
// お知らせ一覧表示（削除付き）
// ==========================================
async function renderNoticeList(){

    console.log("お知らせ描画スタート");

    const res = await fetch(WORKER_URL + "?action=notices");
    const notices = await res.json();

    const list = document.getElementById("noticeList");

    if(!list){
        console.log("noticeListが存在しない");
        return;
    }

    list.innerHTML = "";

    notices.forEach(notice => {

        const item = document.createElement("div");

        item.style.border = "1px solid #ccc";
        item.style.padding = "10px";
        item.style.marginBottom = "10px";

        item.innerHTML = `
            <strong>${notice.title}</strong><br>
            ${notice.message}<br>
            <button class="delete-btn">削除</button>
        `;

        item.querySelector(".delete-btn").onclick = async () => {

            if(!confirm("削除する？")) return;

            await fetch(WORKER_URL, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    action:"deleteNotice",
                    id: notice.id
                })
            });

            alert("削除した👍");

            renderNoticeList(); // 再読み込み
        };

        list.appendChild(item);
    });
}
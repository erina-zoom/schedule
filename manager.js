// ==========================================
// ERINA Zoom Manager Ver5（完全版）
// ==========================================

"use strict";

// ==========================================
// 設定
// ==========================================
const WORKER_URL = "https://erina-manager.tomoya19980427goku.workers.dev";

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

    renderEvents(); // ←🔥これ重要

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

        console.log("イベント取得", events);

    }catch(e){
        console.error("イベント取得失敗", e);
    }
}

// ==========================================
// イベント描画（←追加）
// ==========================================
function renderEvents(){

    const container = document.getElementById("eventList");

    if(!container){
        console.log("eventListがない");
        return;
    }

    container.innerHTML = "";

    if(events.length === 0){
        container.innerHTML = "イベントがありません";
        return;
    }

    events.forEach(e => {

        const item = document.createElement("div");

        item.style.padding = "10px";
        item.style.borderBottom = "1px solid #ccc";

        item.innerHTML = `
            <div><strong>${e.title}</strong></div>
            <div>${e.date} ${e.startTime}</div>
        `;

        container.appendChild(item);
    });
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
        clearEditor(); // ←追加
        renderNoticeList();
    }else{
        alert("保存失敗");
    }
}

// ==========================================
// お知らせ一覧表示（削除付き）
// ==========================================
async function renderNoticeList(){

    const res = await fetch(WORKER_URL + "?action=notices");
    let notices = await res.json();

    const list = document.getElementById("noticeList");

    if(!list) return;

    list.innerHTML = "";

    notices = notices.filter(n => n.enabled !== false);

    notices.sort((a,b)=> b.startDate.localeCompare(a.startDate));

    notices.forEach(notice => {

        const item = document.createElement("div");

        item.className = "notice-item";

        item.innerHTML = `
            <div class="notice-title">${notice.title}</div>
            <div class="notice-message">${notice.message}</div>
            <div>📅 ${notice.startDate}〜${notice.endDate}</div>
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

            renderNoticeList();
        };

        list.appendChild(item);
    });
}

// ==========================================
// 入力リセット
// ==========================================
function clearEditor(){

    const title = document.getElementById("noticeTitle");
    const message = document.getElementById("noticeMessage");
    const start = document.getElementById("noticeStart");
    const end = document.getElementById("noticeEnd");
    const enabled = document.getElementById("noticeEnabled");

    if(title) title.value = "";
    if(message) message.value = "";
    if(start) start.value = "";
    if(end) end.value = "";
    if(enabled) enabled.value = "true";
}
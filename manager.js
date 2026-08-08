// ==========================================
// ERINA Zoom Manager 完全完成版（画像連動あり）
// ==========================================

"use strict";

// ==========================================
// 設定
// ==========================================
const WORKER_URL = "https://erina-manager.tomoya19980427goku.workers.dev";
const EVENTS_URL = `${WORKER_URL}?action=events`;

// ==========================================
// データ
// ==========================================
let events = [];
let editingEventId = null;

// ==========================================
// 初期化
// ==========================================
document.addEventListener("DOMContentLoaded", initializeManager);

async function initializeManager(){

    setupEventListeners();

    clearEditor();

    await loadEvents();

    renderEvents();

    await renderNoticeList();
}

// ==========================================
// イベント設定
// ==========================================
function setupEventListeners(){

    document.getElementById("saveNoticeButton")
        ?.addEventListener("click", saveNotice);

    document.getElementById("saveEventButton")
        ?.addEventListener("click", saveEvent);

    document.getElementById("newEventButton")
        ?.addEventListener("click", ()=>{
            editingEventId = null;
            clearEditor();
            window.scrollTo({top:0,behavior:"smooth"});
        });

    document.getElementById("reloadButton")
        ?.addEventListener("click", async ()=>{
            await loadEvents();
            renderEvents();
        });

    document.getElementById("clearButton")
        ?.addEventListener("click", clearEditor);

    document.getElementById("deleteButton")
        ?.addEventListener("click", async ()=>{
            if(!editingEventId) return;
            await deleteEvent(editingEventId);
        });

    // 🔥 画像アップロード
    document.getElementById("uploadImageButton")
        ?.addEventListener("click", uploadImage);
}

// ==========================================
// events取得
// ==========================================
async function loadEvents(){
    try{
        const res = await fetch(`${EVENTS_URL}&t=${Date.now()}`, {
            cache:"no-store"
        });
        events = await res.json();
    }catch(e){
        console.error("イベント取得失敗", e);
    }
}

// ==========================================
// イベント描画
// ==========================================
function renderEvents(){

    const container = document.getElementById("eventList");
    if(!container) return;

    container.innerHTML = "";

    if(!events || events.length === 0){
        container.innerHTML = "イベントがありません";
        return;
    }

    events.forEach(e => {

        const item = document.createElement("div");
        item.className = "event-card";

        item.innerHTML = `
            <div class="event-info">
                <div class="event-title">${e.title}</div>
                <div class="event-date">${e.date} ${e.startTime || ""}</div>
                ${e.image ? `<img src="${e.image}" style="width:80px;margin-top:5px;border-radius:6px;">` : ""}
            </div>

            <div class="event-actions">
                <button class="edit-btn">編集</button>
                <button class="copy-btn">複製</button>
                <button class="delete-btn">削除</button>
            </div>
        `;

        item.querySelector(".edit-btn").onclick = ()=> editEvent(e.id);
        item.querySelector(".copy-btn").onclick = ()=> duplicateEvent(e.id);
        item.querySelector(".delete-btn").onclick = ()=> deleteEvent(e.id);

        container.appendChild(item);
    });
}

// ==========================================
// 保存
// ==========================================
async function saveEvent(){

    const event = {
        id: editingEventId || Date.now(),
        title: document.getElementById("title").value,
        shortTitle: document.getElementById("shortTitle").value,
        category: document.getElementById("category").value,
        date: document.getElementById("eventDate").value,
        color: document.getElementById("eventColor").value,
        startTime: document.getElementById("startTime").value,
        endTime: document.getElementById("endTime").value,
        zoomUrl: document.getElementById("zoomUrl").value,
        image: document.getElementById("imagePreview")?.dataset.url || ""
    };

    await fetch(WORKER_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
            action:"saveEvent",
            event:event
        })
    });

    alert("保存OK👍");

    editingEventId = null;

    clearEditor();

    await loadEvents();
    renderEvents();
}

// ==========================================
// 編集
// ==========================================
function editEvent(id){

    const e = events.find(x => x.id === id);
    if(!e) return;

    editingEventId = id;

    document.getElementById("title").value = e.title || "";
    document.getElementById("shortTitle").value = e.shortTitle || "";
    document.getElementById("category").value = e.category || "";
    document.getElementById("eventDate").value = e.date || "";
    document.getElementById("eventColor").value = e.color || "#247447";
    document.getElementById("startTime").value = e.startTime || "";
    document.getElementById("endTime").value = e.endTime || "";
    document.getElementById("zoomUrl").value = e.zoomUrl || "";

    const preview = document.getElementById("imagePreview");
    if(e.image){
        preview.innerHTML = `<img src="${e.image}" style="width:120px;border-radius:8px;">`;
        preview.dataset.url = e.image;
    }else{
        preview.innerHTML = "";
        preview.dataset.url = "";
    }

    window.scrollTo({ top:0, behavior:"smooth" });
}

// ==========================================
// 複製
// ==========================================
function duplicateEvent(id){

    const e = events.find(x => x.id === id);
    if(!e) return;

    editingEventId = null;

    document.getElementById("title").value = e.title || "";
    document.getElementById("shortTitle").value = e.shortTitle || "";
    document.getElementById("category").value = e.category || "";
    document.getElementById("eventDate").value = "";
    document.getElementById("eventColor").value = e.color || "#247447";
    document.getElementById("startTime").value = e.startTime || "";
    document.getElementById("endTime").value = e.endTime || "";
    document.getElementById("zoomUrl").value = e.zoomUrl || "";

    const preview = document.getElementById("imagePreview");
    if(e.image){
        preview.innerHTML = `<img src="${e.image}" style="width:120px;border-radius:8px;">`;
        preview.dataset.url = e.image;
    }else{
        preview.innerHTML = "";
        preview.dataset.url = "";
    }

    window.scrollTo({ top:0, behavior:"smooth" });
}

// ==========================================
// 削除
// ==========================================
async function deleteEvent(id){

    if(!confirm("削除する？")) return;

    await fetch(WORKER_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
            action:"deleteEvent",
            id:id
        })
    });

    alert("削除した👍");

    await loadEvents();
    renderEvents();
}

// ==========================================
// 画像アップロード
// ==========================================
async function uploadImage(){

    const file = document.getElementById("imageInput").files[0];
    if(!file) return alert("画像選んで");

    const reader = new FileReader();

    reader.onload = async () => {

        const base64 = reader.result;

        const preview = document.getElementById("imagePreview");

        preview.innerHTML = `<img src="${base64}" style="width:120px;border-radius:8px;">`;
        preview.dataset.url = base64;

        await fetch(WORKER_URL,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
                type:"image",
                data: base64
            })
        });

        alert("アップロードOK👍");
    };

    reader.readAsDataURL(file);
}

// ==========================================
// お知らせ
// ==========================================
async function saveNotice(){

    const notice = {
        title: document.getElementById("noticeTitle").value,
        message: document.getElementById("noticeMessage").value,
        startDate: document.getElementById("noticeStart").value,
        endDate: document.getElementById("noticeEnd").value,
        enabled: document.getElementById("noticeEnabled").value === "true"
    };

    const res = await fetch(WORKER_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
            action:"saveNotice",
            notice:notice
        })
    });

    const result = await res.json();

    if(result.success){
        alert("保存OK👍");
        clearEditor();
        renderNoticeList();
    }
}

// ==========================================
// お知らせ一覧
// ==========================================
async function renderNoticeList(){

    const res = await fetch(WORKER_URL + "?action=notices");
    let notices = await res.json();

    const list = document.getElementById("noticeList");
    if(!list) return;

    list.innerHTML = "";

    notices = notices.filter(n => n.enabled !== false);

    notices.forEach(n => {

        const item = document.createElement("div");

        item.innerHTML = `
            <div>${n.title}</div>
            <div>${n.message}</div>
            <button>削除</button>
        `;

        item.querySelector("button").onclick = async ()=>{
            await fetch(WORKER_URL,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify({
                    action:"deleteNotice",
                    id:n.id
                })
            });
            renderNoticeList();
        };

        list.appendChild(item);
    });
}

// ==========================================
// リセット
// ==========================================
function clearEditor(){

    const ids = [
        "title","shortTitle","category",
        "eventDate","eventColor",
        "startTime","endTime","zoomUrl",
        "noticeTitle","noticeMessage",
        "noticeStart","noticeEnd"
    ];

    ids.forEach(id=>{
        const el = document.getElementById(id);
        if(el){
            if(el.type === "color"){
                el.value = "#247447";
            }else{
                el.value = "";
            }
        }
    });

    const preview = document.getElementById("imagePreview");
    if(preview){
        preview.innerHTML = "";
        preview.dataset.url = "";
    }

    const enabled = document.getElementById("noticeEnabled");
    if(enabled) enabled.value = "true";
}
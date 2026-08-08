// ==========================================
// ERINA Zoom Manager 完全完成版（画像連動あり）
// ==========================================

"use strict";

// ==========================================
const WORKER_URL = "https://erina-manager.tomoya19980427goku.workers.dev";
const EVENTS_URL = `${WORKER_URL}?action=events`;


// ==========================================
let events = [];
let editingEventId = null;

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
function setupEventListeners(){

    document.getElementById("saveEventButton")?.addEventListener("click", saveEvent);
    document.getElementById("saveNoticeButton")?.addEventListener("click", saveNotice);

    document.getElementById("newEventButton")?.addEventListener("click", ()=>{
        editingEventId = null;
        clearEditor();
    });

    document.getElementById("reloadButton")?.addEventListener("click", async ()=>{
        await loadEvents();
        renderEvents();
    });

    document.getElementById("clearButton")?.addEventListener("click", clearEditor);

    document.getElementById("deleteButton")?.addEventListener("click", async ()=>{
        if(!editingEventId) return;
        await deleteEvent(editingEventId);
    });

    document.getElementById("uploadImageButton")?.addEventListener("click", uploadImage);

    document.getElementById("addProgramButton")?.addEventListener("click", addProgramItem);
}

// ==========================================
async function loadEvents(){
    const res = await fetch(`${EVENTS_URL}&t=${Date.now()}`,{cache:"no-store"});
    events = await res.json();
}

// ==========================================
function renderEvents(){

    const container = document.getElementById("eventList");
    container.innerHTML = "";

    events.forEach(e=>{
        const item = document.createElement("div");
        item.className = "event-card";

        item.innerHTML = `
            <div>
                <b>${e.title}</b><br>
                ${e.date} ${e.startTime || ""}
                ${e.image ? `<br><img src="${e.image}" width="80">` : ""}
            </div>

            <div>
                <button class="edit">編集</button>
                <button class="copy">複製</button>
                <button class="delete">削除</button>
            </div>
        `;

        item.querySelector(".edit").onclick = ()=>editEvent(e.id);
        item.querySelector(".copy").onclick = ()=>duplicateEvent(e.id);
        item.querySelector(".delete").onclick = ()=>deleteEvent(e.id);

        container.appendChild(item);
    });
}

// ==========================================
async function saveEvent(){

    // 🔥 program取得
    const program = [];
    document.querySelectorAll(".program-row").forEach(row=>{
        const time = row.querySelector(".program-time").value;
        const content = row.querySelector(".program-content").value;

        if(time || content){
            program.push({time, content});
        }
    });

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
        image: document.getElementById("imagePreview")?.dataset.url || "",
        program: program
    };

    await fetch(WORKER_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({action:"saveEvent", event})
    });

    alert("保存OK👍");

    editingEventId = null;
    clearEditor();

    await loadEvents();
    renderEvents();
}

// ==========================================
function editEvent(id){

    const e = events.find(x=>x.id===id);
if(!e) return;

editingEventId = id;

    document.getElementById("title").value = e.title || "";
    document.getElementById("eventDate").value = e.date || "";
    document.getElementById("startTime").value = e.startTime || "";
    document.getElementById("endTime").value = e.endTime || "";
    document.getElementById("zoomUrl").value = e.zoomUrl || "";

    // 🔥画像
    const preview = document.getElementById("imagePreview");
    if(e.image){
        preview.innerHTML = `<img src="${e.image}" width="120">`;
        preview.dataset.url = e.image;
    }

    // 🔥 program復元
    const list = document.getElementById("programList");
    list.innerHTML = "";

    if(e.program){
        e.program.forEach(p=>{
            addProgramItem(p.time, p.content);
        });
    }
}

// ==========================================
function duplicateEvent(id){
    const e = events.find(x=>x.id===id);

    editingEventId = null;

    document.getElementById("title").value = e.title;
    document.getElementById("startTime").value = e.startTime;
    document.getElementById("endTime").value = e.endTime;
}

// ==========================================
async function deleteEvent(id){
    if(!confirm("削除する？")) return;

    await fetch(WORKER_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({action:"deleteEvent", id})
    });

    await loadEvents();
    renderEvents();
}

// ==========================================
async function uploadImage(){

    const file = document.getElementById("imageInput").files[0];
    if(!file) return alert("画像選んで");

    const reader = new FileReader();

    reader.onload = async ()=>{
        const base64 = reader.result;

        const preview = document.getElementById("imagePreview");
        preview.innerHTML = `<img src="${base64}" width="120">`;
        preview.dataset.url = base64;

        await fetch(WORKER_URL,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
                type:"image",
                data: base64
            })
        });
    };

    reader.readAsDataURL(file);
}

// ==========================================
function addProgramItem(time="", content=""){

    const list = document.getElementById("programList");

    const row = document.createElement("div");
    row.className = "program-row";

    row.innerHTML = `
        <input type="time" class="program-time" value="${time}">
        <input type="text" class="program-content" value="${content}">
        <button>削除</button>
    `;

    row.querySelector("button").onclick = ()=>row.remove();

    list.appendChild(row);
}

// ==========================================
function clearEditor(){

    document.querySelectorAll("input").forEach(i=>{
        if(i.type !== "button") i.value = "";
    });

    document.getElementById("programList").innerHTML = "";

    const preview = document.getElementById("imagePreview");
    if(preview){
        preview.innerHTML = "";
        preview.dataset.url = "";
    }
}
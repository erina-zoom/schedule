// ==========================================
// ERINA Zoom フロント 完全版（元UI復元）
// ==========================================

"use strict";

const WORKER_URL = "https://erina-manager.tomoya19980427goku.workers.dev";

let events = [];

// ==========================================
// 初期読み込み
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    await loadEvents();
    renderAll();
});

// ==========================================
async function loadEvents(){
    const res = await fetch(WORKER_URL + "?action=events&t=" + Date.now());
    events = await res.json();
}

// ==========================================
function renderAll(){
    renderToday();
    renderNext();
    renderWeek();
    renderSchedule();
}

// ==========================================
// 今日
// ==========================================
function renderToday(){
    const today = new Date().toISOString().slice(0,10);
    const e = events.find(x=>x.date === today);

    const el = document.getElementById("todayEvent");

    if(!e){
        el.innerHTML = "本日の予定はありません";
        return;
    }

    el.innerHTML = createEventHTML(e);
}

// ==========================================
// 次回
// ==========================================
function renderNext(){
    const today = new Date().toISOString().slice(0,10);

    const e = events
        .filter(x=>x.date >= today)
        .sort((a,b)=>a.date.localeCompare(b.date))[0];

    const el = document.getElementById("nextEvent");

    if(!e){
        el.innerHTML = "予定なし";
        return;
    }

    el.innerHTML = createEventHTML(e);
}

// ==========================================
// 今週
// ==========================================
function renderWeek(){

    const container = document.getElementById("weekEvents");
    container.innerHTML = "";

    // 今日（時間リセット）
    const today = new Date();
    today.setHours(0,0,0,0);

    // 7日後
    const end = new Date();
    end.setDate(today.getDate() + 7);
    end.setHours(23,59,59,999);

    events.forEach(e=>{

        const d = new Date(e.date + "T00:00:00");

        // 👇ここが完全修正
        if(d >= today && d <= end){

            const div = document.createElement("div");
            div.className = "card";

            div.innerHTML = createEventHTML(e);

            div.onclick = ()=>showDetail(e);

            container.appendChild(div);
        }

    });
}

// ==========================================
// スケジュール一覧
// ==========================================
function renderSchedule(){
    const container = document.getElementById("scheduleList");
    container.innerHTML = "";

    events.forEach(e=>{
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = createEventHTML(e);

        div.onclick = ()=>showDetail(e);

        container.appendChild(div);
    });
}

// ==========================================
// イベント表示HTML
// ==========================================
function createEventHTML(e){

    return `
        <b>${e.title}</b><br>
        ${e.date} ${e.startTime || ""}<br>
        ${e.zoomUrl ? `<a href="${e.zoomUrl}" target="_blank">Zoom参加</a>` : ""}
    `;
}

// ==========================================
// モーダル表示（←これが元UIの核心）
// ==========================================
function showDetail(e){

    document.getElementById("modal").classList.remove("hidden");

    // 🔥画像
    const imageArea = document.getElementById("eventImageArea");

    if(e.image){
        imageArea.innerHTML = `<img src="${e.image}" style="width:100%;border-radius:10px;">`;
    }else{
        imageArea.innerHTML = "";
    }

    // 🔥詳細
    let html = `
        <h3>${e.title}</h3>
        <p>${e.date} ${e.startTime || ""}</p>
    `;

    // 🔥プログラム（のびしろ用）
    if(e.program && e.program.length > 0){

        html += `<hr><b>📋 タイムスケジュール</b><br>`;

        e.program.forEach(p=>{
            html += `
                <div style="margin:5px 0;">
                    ${p.time ? `<b>${p.time}</b>` : ""}
                    ${p.title || ""}
                    ${p.person ? `<br><small>${p.person}</small>` : ""}
                </div>
            `;
        });
    }

    // 🔥Zoom
    if(e.zoomUrl){
        html += `<br><a href="${e.zoomUrl}" target="_blank">▶ Zoom参加</a>`;
    }

    document.getElementById("eventDetail").innerHTML = html;
}

// ==========================================
// モーダル閉じる
// ==========================================
document.getElementById("closeModal").onclick = ()=>{
    document.getElementById("modal").classList.add("hidden");
};

// ==========================================
// 表示切り替え
// ==========================================
document.getElementById("showSchedule").onclick = ()=>{
    document.getElementById("scheduleSection").style.display="block";
    document.getElementById("calendarSection").style.display="none";
};

document.getElementById("showCalendar").onclick = ()=>{
    document.getElementById("scheduleSection").style.display="none";
    document.getElementById("calendarSection").style.display="block";
};
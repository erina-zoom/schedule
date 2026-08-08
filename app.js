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

        if(d >= today && d <= end){

            const div = document.createElement("div");

            // 👇ここだけ変更
            div.className = "week-card";
            　div.style.borderLeft = `6px solid ${getColor(e.category)}`;

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
// アイコン
// ==========================================
function getIcon(category){
    switch(category){
        case "チェリーライブ": return "🍒";
        case "FMなまず": return "📻";
        case "サクラ咲く会": return "🌸";
        case "竹の子族": return "🎵";
        case "佐賀オンラインセミナー": return "💻";
        default: return "📌";
    }
}

// ==========================================
// 色
// ==========================================
function getColor(category){
    switch(category){
        case "チェリーライブ": return "#e91e63";
        case "FMなまず": return "#4caf50";
        case "サクラ咲く会": return "#ff9800";
        case "竹の子族": return "#9c27b0";
        case "佐賀オンラインセミナー": return "#2196f3";
        default: return "#2e7d32";
    }
}
// ==========================================
// イベント表示HTML
// ==========================================
function createEventHTML(e){

    const d = new Date(e.date);

    const month = d.getMonth() + 1;
    const day = d.getDate();

    const week = ["日","月","火","水","木","金","土"][d.getDay()];

    return `
        <div class="week-date">
            ${month}/${day}<br>
            (${week})
        </div>

        <div class="week-content">
            <div class="time">${e.startTime}</div>
            <div class="title">
                ${getIcon(e.category)} ${e.title}
            </div>
        </div>
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
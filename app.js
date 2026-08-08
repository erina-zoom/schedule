// ==========================================
// ERINA Zoom フロント 完全復旧版
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
// 今日（←ここ修正済み🔥）
// ==========================================
function getTodayLocal(){
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,"0");
    const day = String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
}

function renderToday(){
    const today = getTodayLocal();

    const e = events.find(x=>x.date === today);

    const el = document.getElementById("todayEvent");

    if(!e){
        el.innerHTML = "本日のZoomはありません";
        return;
    }

    el.innerHTML = createCardHTML(e);
}

// ==========================================
// 次回
// ==========================================
function renderNext(){
    const today = getTodayLocal();

    const e = events
        .filter(x=>x.date >= today)
        .sort((a,b)=>a.date.localeCompare(b.date))[0];

    const el = document.getElementById("nextEvent");

    if(!e){
        el.innerHTML = "予定なし";
        return;
    }

    el.innerHTML = createCardHTML(e);
}

// ==========================================
// 今週（カードUI復元🔥）
// ==========================================
function renderWeek(){

    const container = document.getElementById("weekEvents");
    container.innerHTML = "";

    const today = new Date();
    today.setHours(0,0,0,0);

    const end = new Date();
    end.setDate(today.getDate() + 7);
    end.setHours(23,59,59,999);

    events.forEach(e=>{

        const d = new Date(e.date + "T00:00:00");

        if(d >= today && d <= end){

            const div = document.createElement("div");

            div.className = "card";

            div.innerHTML = createCardHTML(e);

            div.onclick = ()=>showDetail(e);

            container.appendChild(div);
        }

    });
}

// ==========================================
// スケジュール一覧（元UI🔥）
// ==========================================
function renderSchedule(){

    const container = document.getElementById("scheduleList");
    container.innerHTML = "";

    events.forEach(e=>{

        const div = document.createElement("div");

        div.className = "card";

        div.style.borderLeft = `6px solid ${getColor(e.category)}`;

        div.innerHTML = createCardHTML(e);

        div.onclick = ()=>showDetail(e);

        container.appendChild(div);
    });
}

// ==========================================
// アイコン（←ピン消した）
// ==========================================
function getIcon(category){
    switch(category){
        case "チェリーライブ": return "🍒";
        case "FMなまず": return "📻";
        case "サクラ咲く会": return "🌸";
        case "竹の子族": return "🎵";
        case "佐賀オンラインセミナー": return "💻";
        case "ミナソンチャンネル": return "♣";
        case "ワンコインダンス": return "💃";
        default: return "";
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
        case "ミナソンチャンネル": return "#000";
        case "ワンコインダンス": return "#f44336";
        default: return "#2e7d32";
    }
}

// ==========================================
// 🔥元のカードUI（これが超重要）
// ==========================================
function createCardHTML(e){

    const d = new Date(e.date);

    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const week = ["日","月","火","水","木","金","土"][d.getDay()];

    return `
        <div style="
            border-left:6px solid ${getColor(e.category)};
            padding:16px;
            border-radius:16px;
            background:#fff;
            box-shadow:0 2px 8px rgba(0,0,0,0.05);
        ">
            <div style="font-size:18px;font-weight:bold;">
                ${year}年${month}月${day}日（${week}）
            </div>

            <div style="margin-top:10px;color:#2e7d32;font-weight:bold;">
                🕒 ${e.startTime}
            </div>

            <div style="margin-top:8px;font-size:20px;">
                ${getIcon(e.category)} ${e.title}
            </div>
        </div>
    `;
}

// ==========================================
// モーダル（そのまま）
// ==========================================
function showDetail(e){

    document.getElementById("modal").classList.remove("hidden");

    const imageArea = document.getElementById("eventImageArea");

    if(e.image){
        imageArea.innerHTML = `<img src="${e.image}" style="width:100%;border-radius:10px;">`;
    }else{
        imageArea.innerHTML = "";
    }

    let html = `
        <h3>${e.title}</h3>
        <p>${e.date} ${e.startTime || ""}</p>
    `;

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

    if(e.zoomUrl){
        html += `<br><a href="${e.zoomUrl}" target="_blank">▶ Zoom参加</a>`;
    }

    document.getElementById("eventDetail").innerHTML = html;
}

// ==========================================
document.getElementById("closeModal").onclick = ()=>{
    document.getElementById("modal").classList.add("hidden");
};
"use strict";

const WORKER_URL = "https://erina-manager.tomoya19980427goku.workers.dev";

let events = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadEvents();
    renderAll();
});

async function loadEvents(){
    const res = await fetch(WORKER_URL + "?action=events&t=" + Date.now());
    events = await res.json();
}

function renderAll(){
    renderToday();
    renderNext();
    renderWeek();
    renderSchedule();
}

// 日付（ズレ対策）
function getTodayLocal(){
    const d = new Date();
    return d.getFullYear() + "-" +
        String(d.getMonth()+1).padStart(2,"0") + "-" +
        String(d.getDate()).padStart(2,"0");
}

// 今日
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

// 次回
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

// 今週
function renderWeek(){

    const container = document.getElementById("weekEvents");
    container.innerHTML = "";

    const today = new Date();
    today.setHours(0,0,0,0);

    const end = new Date();
    end.setDate(today.getDate() + 7);

    events.forEach(e=>{

        const d = new Date(e.date + "T00:00:00");

        if(d >= today && d <= end){

            const div = document.createElement("div");
            div.className = "card";

            div.innerHTML = createCardHTML(e);

            container.appendChild(div);
        }
    });
}

// 一覧
function renderSchedule(){

    const container = document.getElementById("scheduleList");
    container.innerHTML = "";

    events.forEach(e=>{

        const div = document.createElement("div");
        div.className = "card";

        div.style.borderLeft = `6px solid ${getColor(e.category)}`;

        div.innerHTML = createCardHTML(e);

        container.appendChild(div);
    });
}

// アイコン
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

// 色
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

// カード
function createCardHTML(e){

    const d = new Date(e.date);

    const y = d.getFullYear();
    const m = d.getMonth()+1;
    const day = d.getDate();
    const w = ["日","月","火","水","木","金","土"][d.getDay()];

    return `
        <div style="border-left:6px solid ${getColor(e.category)};padding:16px;border-radius:16px;">
            <div>${y}年${m}月${day}日（${w}）</div>
            <div>🕒 ${e.startTime}</div>
            <div>${getIcon(e.category)} ${e.title}</div>
        </div>
    `;
}
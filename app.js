"use strict";

const WORKER_URL = "https://erina-manager.tomoya19980427goku.workers.dev";

let events = [];
let current = new Date();

document.addEventListener("DOMContentLoaded", async () => {
    await loadEvents();
    renderAll();
    renderCalendar();
});

async function loadEvents(){
    const res = await fetch(WORKER_URL + "?action=events&t=" + Date.now());
    events = await res.json();
}

function getTodayLocal(){
    const d = new Date();
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

// ================= 表示 =================
function renderAll(){
    renderToday();
    renderNext();
    renderWeek();
    renderSchedule();
}

// 今日
function renderToday(){
    const e = events.find(x=>x.date === getTodayLocal());
    document.getElementById("todayEvent").innerHTML =
        e ? createCard(e) : `<div class="card">今日のZoomはありません</div>`;
}

// 次回
function renderNext(){
    const today = getTodayLocal();

    const e = events
        .filter(x=>x.date >= today)
        .sort((a,b)=>a.date.localeCompare(b.date))[0];

    document.getElementById("nextEvent").innerHTML =
        e ? createCard(e) : `<div class="card">予定なし</div>`;
}

// 今週
function renderWeek(){
    const el = document.getElementById("weekEvents");
    el.innerHTML = "";

    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate()+7);

    events.forEach(e=>{
        const d = new Date(e.date);
        if(d >= today && d <= end){
            const div = document.createElement("div");
            div.className="card";
            div.innerHTML = createInner(e);
            el.appendChild(div);
        }
    });
}

// 一覧
function renderSchedule(){
    const el = document.getElementById("scheduleList");
    el.innerHTML = "";

    events.forEach(e=>{
        const div = document.createElement("div");
        div.className="card";
        div.innerHTML = createInner(e);
        el.appendChild(div);
    });
}

// ================= UI =================
function getIcon(c){
    switch(c){
        case "チェリーライブ": return "🍒";
        case "FMなまず": return "📻";
        case "サクラ咲く会": return "🌸";
        case "竹の子族": return "🎵";
        case "ワンコインダンス": return "💃";
        default: return "";
    }
}

function createInner(e){
    const d = new Date(e.date);
    const y = d.getFullYear();
    const m = d.getMonth()+1;
    const day = d.getDate();
    const w = ["日","月","火","水","木","金","土"][d.getDay()];

    return `
        <div><b>${y}年${m}月${day}日（${w}）</b></div>
        <div class="time">🕒 ${e.startTime}</div>
        <div class="title">${getIcon(e.category)} ${e.title}</div>
        ${e.zoomUrl ? `<a href="${e.zoomUrl}" target="_blank" class="zoom-btn">Zoomに参加</a>` : ""}
    `;
}

function createCard(e){
    return `<div class="card">${createInner(e)}</div>`;
}

// ================= カレンダー =================
function renderCalendar(){
    const el = document.getElementById("calendar");
    if(!el) return;

    el.innerHTML="";

    const y = current.getFullYear();
    const m = current.getMonth();

    document.getElementById("monthTitle").innerText = `${y}年 ${m+1}月`;

    const first = new Date(y,m,1);
    let start = first.getDay();
    start = start===0 ? 6 : start-1;

    const days = new Date(y,m+1,0).getDate();

    for(let i=0;i<start;i++) el.innerHTML+="<div></div>";

    for(let d=1; d<=days; d++){
        const dateStr = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const ev = events.filter(e=>e.date===dateStr);

        let html = `<div><b>${d}</b>`;
        ev.forEach(x=> html += `<br>${getIcon(x.category)}`);
        html += "</div>";

        el.innerHTML += html;
    }
}

// ================= 操作 =================
document.addEventListener("click", e=>{

    if(e.target.id==="prevMonth"){
        current.setMonth(current.getMonth()-1);
        renderCalendar();
    }

    if(e.target.id==="nextMonth"){
        current.setMonth(current.getMonth()+1);
        renderCalendar();
    }

    if(e.target.id==="showSchedule"){
        document.getElementById("scheduleSection").style.display="block";
        document.getElementById("calendarSection").style.display="none";
    }

    if(e.target.id==="showCalendar"){
        document.getElementById("scheduleSection").style.display="none";
        document.getElementById("calendarSection").style.display="block";
    }
});
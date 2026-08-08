"use strict";

const WORKER_URL = "https://erina-manager.tomoya19980427goku.workers.dev";

let events = [];
let current = new Date();

// ================= 初期 =================
document.addEventListener("DOMContentLoaded", async () => {
    await loadEvents();
    renderAll();
    renderCalendar();
});

// ================= データ =================
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

// ================= 日付 =================
function getTodayLocal(){
    const d = new Date();
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

// ================= 今日 =================
function renderToday(){
    const e = events.find(x=>x.date === getTodayLocal());
    document.getElementById("todayEvent").innerHTML =
        e ? createCard(e) : "本日のZoomはありません";
}

// ================= 次回 =================
function renderNext(){
    const today = getTodayLocal();

    const e = events
        .filter(x=>x.date >= today)
        .sort((a,b)=>a.date.localeCompare(b.date))[0];

    document.getElementById("nextEvent").innerHTML =
        e ? createCard(e) : "予定なし";
}

// ================= 今週 =================
function renderWeek(){

    const container = document.getElementById("weekEvents");
    container.innerHTML = "";

    const today = new Date();
    today.setHours(0,0,0,0);

    const end = new Date();
    end.setDate(today.getDate()+7);

    events.forEach(e=>{
        const d = new Date(e.date);

        if(d >= today && d <= end){
            const div = document.createElement("div");

            div.className="card";
        
            div.innerHTML = createInner(e);

            container.appendChild(div);
        }
    });
}

// ================= 一覧 =================
function renderSchedule(){

    const container = document.getElementById("scheduleList");
    container.innerHTML = "";

    events.forEach(e=>{
        const div = document.createElement("div");

        div.className="card";
        div.style.borderLeft = `6px solid ${getColor(e.category)}`;

        div.innerHTML = createInner(e);

        container.appendChild(div);
    });
}

// ================= アイコン =================
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

// ================= 色 =================
function getColor(c){
    switch(c){
        case "チェリーライブ": return "#e91e63";
        case "FMなまず": return "#4caf50";
        case "サクラ咲く会": return "#ff9800";
        case "竹の子族": return "#9c27b0";
        case "ワンコインダンス": return "#f44336";
        default: return "#2e7d32";
    }
}

// ================= カード中身 =================
function createInner(e){
    return `
        <div><b>${e.date}</b></div>

        <div class="time">🕒 ${e.startTime}</div>

        <div class="title">
            ${getIcon(e.category)} ${e.title}
        </div>

        ${e.zoomUrl ? `
            <a href="${e.zoomUrl}" target="_blank" class="zoom-btn">
                Zoomに参加
            </a>
        ` : ""}
    `;
}

// ================= カード =================
function createCard(e){
    return `
    <div class="card" style="border-left:6px solid ${getColor(e.category)};">
        ${createInner(e)}
    </div>
    `;
}

// ================= カレンダー =================
function renderCalendar(){

    const el = document.getElementById("calendar");
    if(!el) return;

    el.innerHTML = "";

    const y = current.getFullYear();
    const m = current.getMonth();

    document.getElementById("monthTitle").innerText = `${y}年 ${m+1}月`;

    const first = new Date(y,m,1);
    let start = first.getDay();
    start = start === 0 ? 6 : start-1;

    const days = new Date(y,m+1,0).getDate();

    for(let i=0;i<start;i++){
        el.innerHTML += "<div></div>";
    }

    for(let d=1; d<=days; d++){

        const dateStr = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const dayEvents = events.filter(e=>e.date===dateStr);

        let html = `<div><b>${d}</b>`;

        dayEvents.forEach(ev=>{
            html += `<br>${getIcon(ev.category)}`;
        });

        html += "</div>";

        el.innerHTML += html;
    }
}

// ================= カレンダー操作 =================
document.addEventListener("click", e=>{

    if(e.target.id === "prevMonth"){
        current.setMonth(current.getMonth()-1);
        renderCalendar();
    }

    if(e.target.id === "nextMonth"){
        current.setMonth(current.getMonth()+1);
        renderCalendar();
    }

    if(e.target.id === "showSchedule"){
        document.getElementById("scheduleSection").style.display="block";
        document.getElementById("calendarSection").style.display="none";
    }

    if(e.target.id === "showCalendar"){
        document.getElementById("scheduleSection").style.display="none";
        document.getElementById("calendarSection").style.display="block";
    }

});
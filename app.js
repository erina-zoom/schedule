const API = "https://erina-manager.tomoya19980427goku.workers.dev/?action=events";

let events = [];
let currentDate = new Date();

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch(API + "&t=" + Date.now());
        events = await res.json();
    } catch (e) {
        console.error("取得失敗", e);
        events = [];
    }

    renderAll();
    renderCalendar(currentDate);

    // 切り替え
    document.getElementById("showSchedule").onclick = () => {
        document.getElementById("scheduleSection").style.display = "block";
        document.getElementById("calendarSection").style.display = "none";
    };

    document.getElementById("showCalendar").onclick = () => {
        document.getElementById("scheduleSection").style.display = "none";
        document.getElementById("calendarSection").style.display = "block";
    };

    // 月移動
    document.getElementById("prevMonth").onclick = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    };

    document.getElementById("nextMonth").onclick = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    };
});

function renderAll(){
    renderToday();
    renderNext();
    renderWeek();
    renderSchedule();
}

/* =========================
   今日
========================= */
function renderToday(){
    const box = document.getElementById("todayEvent");
    box.innerHTML = "";

    const today = new Date().toISOString().slice(0,10);
    const todayEvents = events.filter(e => e.date === today);

    if(todayEvents.length === 0){
        box.innerHTML = "今日のZoomはありません";
        return;
    }

    todayEvents.forEach(e=>{
        box.appendChild(createEventCard(e));
    });
}

/* =========================
   次回
========================= */
function renderNext(){
    const box = document.getElementById("nextEvent");
    box.innerHTML = "";

    const now = new Date();

    const future = events
        .filter(e => new Date(e.date + "T" + e.startTime) > now)
        .sort((a,b)=> new Date(a.date + "T" + a.startTime) - new Date(b.date + "T" + b.startTime));

    if(future.length === 0){
        box.innerHTML = "次回のZoomはありません";
        return;
    }

    box.appendChild(createEventCard(future[0]));
}

/* =========================
   今週
========================= */
function renderWeek(){
    const box = document.getElementById("weekEvents");
    box.innerHTML = "";

    const now = new Date();
    const weekLater = new Date();
    weekLater.setDate(now.getDate()+7);

    const weekEvents = events.filter(e=>{
        const d = new Date(e.date);
        return d >= now && d <= weekLater;
    });

    weekEvents.forEach(e=>{
        box.appendChild(createEventCard(e));
    });
}

/* =========================
   全スケジュール
========================= */
function renderSchedule(){
    const box = document.getElementById("scheduleList");
    box.innerHTML = "";

    const sorted = [...events].sort((a,b)=> new Date(a.date) - new Date(b.date));

    sorted.forEach(e=>{
        box.appendChild(createEventCard(e));
    });
}

/* =========================
   カレンダー
========================= */
function renderCalendar(date){
    if(!date) date = currentDate;

    const year = date.getFullYear();
    const month = date.getMonth();

    document.getElementById("monthTitle").textContent =
        `${year}年${month+1}月`;

    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const startDay = (firstDay === 0 ? 6 : firstDay - 1);

    const totalDays = new Date(year, month + 1, 0).getDate();

    // 空白
    for(let i=0;i<startDay;i++){
        calendar.innerHTML += "<div></div>";
    }

    // 日付
    for(let d=1; d<=totalDays; d++){
        const cell = document.createElement("div");
        cell.className = "cell";

        const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

        cell.innerHTML = `<b>${d}</b>`;

        const dayEvents = events.filter(e => e.date === dateStr);

        dayEvents.forEach(ev=>{
            const div = document.createElement("div");
            div.className = "event";
            div.textContent = ev.startTime;
            cell.appendChild(div);
        });

        calendar.appendChild(cell);
    }
}

/* =========================
   共通カード
========================= */
function createEventCard(e){
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
        <div><b>${e.date}</b></div>
        <div>🕒 ${e.startTime}</div>
        <div>${e.title}</div>
        <a href="${e.zoomUrl}" target="_blank">▶ Zoomに参加</a>
    `;

    return div;
}
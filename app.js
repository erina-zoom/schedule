const DATA_URL =
"https://erina-manager.tomoya19980427goku.workers.dev/?action=events";

let events = [];
let currentDate = new Date();

// 初期化
async function init(){

    const res = await fetch(DATA_URL + "&t=" + Date.now());
    events = await res.json();

    renderAll();
}

init();

function renderAll(){
    renderToday();
    renderNext();
    renderWeek();
    renderCalendar();
}

// ================= 今日 =================
function renderToday(){

    const today = new Date().toISOString().slice(0,10);

    const e = events.find(e => e.date === today);

    const el = document.getElementById("todayEvent");

    if(!e){
        el.innerText = "今日のZoomはありません";
        return;
    }

    el.innerHTML = `
        <div class="event-card">
            <div>${e.date}</div>
            <div>${e.startTime}</div>
            <div>${e.title}</div>
        </div>
    `;
}

// ================= 次回 =================
function renderNext(){

    const now = new Date();

    const next = events
    .filter(e => new Date(e.date + "T" + e.startTime) > now)
    .sort((a,b)=>
        new Date(a.date + "T" + a.startTime) -
        new Date(b.date + "T" + b.startTime)
    )[0];

    document.getElementById("nextEvent").innerText =
    next ? `${next.title}` : "なし";
}

// ================= 今週 =================
function renderWeek(){

    const area = document.getElementById("weekEvents");
    area.innerHTML = "";

    const now = new Date();

    const week = events.filter(e=>{
        const d = new Date(e.date);
        const diff = (d - now)/(1000*60*60*24);
        return diff >= 0 && diff <= 7;
    });

    week.forEach(e=>{

        const d = new Date(e.date);
        const m = d.getMonth()+1;
        const day = d.getDate();

        const div = document.createElement("div");
        div.className = "event-card";

        div.innerHTML = `
            <div class="event-date">${m}/${day}</div>
            <div class="event-time">${e.startTime}</div>
            <div class="event-title">${e.title}</div>
        `;

        div.onclick = ()=> openModal(e);

        area.appendChild(div);
    });
}

// ================= カレンダー =================
function renderCalendar(){

    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById("monthTitle").innerText =
    `${year}年 ${month+1}月`;

    const firstDay = new Date(year,month,1).getDay();
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    const totalDays = new Date(year,month+1,0).getDate();

    // 空白
    for(let i=0;i<startDay;i++){
        calendar.appendChild(document.createElement("div"));
    }

    // 日付
    for(let day=1;day<=totalDays;day++){

        const div = document.createElement("div");
        div.className = "calendar-day";

        const dateStr =
        `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

        const dayEvents =
        events.filter(e=>e.date===dateStr);

        const today = new Date().toISOString().slice(0,10);
        if(dateStr === today){
            div.classList.add("today");
        }

        div.innerHTML = `<div>${day}</div>`;

        dayEvents.forEach(e=>{

            const ev = document.createElement("div");
            ev.className = "event-badge";

            ev.innerText = e.startTime;
            ev.style.background = e.color || "#2e7d32";

            div.appendChild(ev);
        });

        div.onclick = ()=>{
            if(dayEvents.length){
                openModal(dayEvents[0]);
            }
        };

        calendar.appendChild(div);
    }
}

// ================= モーダル =================
function openModal(e){

    const modal = document.getElementById("eventModal");
    modal.classList.remove("hidden");

    const imageHtml = e.image
    ? `<img src="${e.image}?t=${Date.now()}" class="event-image">`
    : "";

    document.getElementById("eventDetail").innerHTML = `
        ${imageHtml}
        <h3>${e.title}</h3>
        <p>${e.date} ${e.startTime}</p>

        <button onclick="window.open('${e.zoomUrl}','_blank')">
            Zoomに参加
        </button>
    `;
}

// 閉じる
document.getElementById("closeModal").onclick = ()=>{
    document.getElementById("eventModal").classList.add("hidden");
};

// 月移動
document.getElementById("prevMonth").onclick = ()=>{
    currentDate.setMonth(currentDate.getMonth()-1);
    renderCalendar();
};

document.getElementById("nextMonth").onclick = ()=>{
    currentDate.setMonth(currentDate.getMonth()+1);
    renderCalendar();
};
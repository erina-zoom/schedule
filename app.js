// ==========================
// API
// ==========================
const API = "https://erina-manager.tomoya19980427goku.workers.dev?action=events";

let events = [];
let current = new Date();

// ==========================
// 初期化
// ==========================
document.addEventListener("DOMContentLoaded", async ()=>{
    console.log("①JS読み込み成功");

    const res = await fetch(API + "&t=" + Date.now());
    events = await res.json();

    console.log("②データ取得", events);

    renderAll();
    renderCalendar();
});

// ==========================
// 今日
// ==========================
function renderToday(){
    const e = events.find(x=>x.date===getToday());

    document.getElementById("todayEvent").innerHTML =
        e ? createCard(e,"today",true)
          : `<div class="card">今日のZoomはありません</div>`;
}

// ==========================
// 次回
// ==========================
function renderNext(){
    const today = getToday();

    const e = events
        .filter(x=>x.date>=today)
        .sort((a,b)=>a.date.localeCompare(b.date))[0];

    document.getElementById("nextEvent").innerHTML =
        e ? createCard(e,"next",true)
          : `<div class="card">予定なし</div>`;
}

// ==========================
// 今週
// ==========================
function renderWeek(){
    const el = document.getElementById("weekEvents");
    el.innerHTML="";

    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate()+7);

    events.forEach(e=>{
        const d = new Date(e.date);
        if(d>=now && d<=end){
            const div = document.createElement("div");
            div.className="week-card";
            div.innerHTML=createInner(e,false);
            div.onclick=()=>openModal(e);
            el.appendChild(div);
        }
    });
}

// ==========================
// スケジュール
// ==========================
function renderSchedule(){
    const el = document.getElementById("scheduleList");
    el.innerHTML="";

    events.forEach(e=>{
        const div = document.createElement("div");
        div.className="card";
        div.innerHTML=createInner(e,false);
        div.onclick=()=>openModal(e);
        el.appendChild(div);
    });
}

// ==========================
// まとめ
// ==========================
function renderAll(){
    renderToday();
    renderNext();
    renderWeek();
    renderSchedule();
}

// ==========================
// UI
// ==========================
function createCard(e,type,showBtn){
    return `
    <div class="card ${type}">
        ${createInner(e,showBtn)}
    </div>`;
}

function createInner(e,showBtn){
    return `
        <div><b>${e.date}</b></div>
        <div>🕒 ${e.startTime}</div>
        <div>${getIcon(e.category)} ${e.title}</div>
        ${showBtn && e.zoomUrl ? `<a href="${e.zoomUrl}" target="_blank">Zoomに参加</a>` : ""}
    `;
}

function getIcon(c){
    switch(c){
        case "チェリーライブ": return "🍒";
        case "FMなまず": return "📻";
        case "サクラ咲く会": return "🌸";
        case "竹の子族": return "🎵";
        default: return "";
    }
}

// ==========================
// モーダル
// ==========================
function openModal(e){
    const box = document.getElementById("eventDetail");

    box.innerHTML = `
        <h3>${e.title}</h3>
        <p>📅 ${e.date}</p>
        <p>🕒 ${e.startTime}</p>
        ${e.image ? `<img src="${e.image}" style="width:100%;border-radius:10px;">` : ""}
        ${e.zoomUrl ? `<a href="${e.zoomUrl}" target="_blank">Zoomに参加</a>` : ""}
    `;

    document.getElementById("modal").classList.remove("hidden");
}

document.getElementById("closeModal").onclick=()=>{
    document.getElementById("modal").classList.add("hidden");
};

// ==========================
// カレンダー
// ==========================
function renderCalendar(){
    const el = document.getElementById("calendar");
    el.innerHTML="";

    const y=current.getFullYear();
    const m=current.getMonth();

    document.getElementById("monthTitle").innerText=`${y}年${m+1}月`;

    const first=new Date(y,m,1);
    let start=first.getDay();
    start=start===0?6:start-1;

    const days=new Date(y,m+1,0).getDate();

    for(let i=0;i<start;i++) el.innerHTML+="<div></div>";

    for(let d=1;d<=days;d++){
        const dateStr=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const ev=events.filter(e=>e.date===dateStr);

        let html=`<div class="cell"><b>${d}</b>`;
        ev.forEach(x=>{
            html+=`<div class="event">${x.startTime}</div>`;
        });
        html+="</div>";

        el.innerHTML+=html;
    }
}

// ==========================
// 操作
// ==========================
document.addEventListener("click",e=>{
    if(e.target.id==="prevMonth"){
        current.setMonth(current.getMonth()-1);
        renderCalendar();
    }

    if(e.target.id==="nextMonth"){
        current.setMonth(current.getMonth()+1);
        renderCalendar();
    }

    if(e.target.id==="showSchedule"){
        scheduleSection.style.display="block";
        calendarSection.style.display="none";
    }

    if(e.target.id==="showCalendar"){
        scheduleSection.style.display="none";
        calendarSection.style.display="block";
    }
});

// ==========================
// 日付
// ==========================
function getToday(){
    const d=new Date();
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
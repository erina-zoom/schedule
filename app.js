const DATA_URL =
"https://erina-manager.tomoya19980427goku.workers.dev/?action=events";

let events = [];
let currentDate = new Date();

async function init(){

    const res = await fetch(DATA_URL + "&t=" + Date.now());
    events = await res.json();

    renderAll();
}

init();

function renderAll(){
    renderCalendar();
    renderToday();
    renderNext();
    renderWeek();
}

// ================= カレンダー =================
function renderCalendar(){

    const calendar = document.getElementById("calendar");
    calendar.innerHTML="";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById("monthTitle").innerText =
    `${year}年 ${month+1}月`;

    const firstDay = new Date(year,month,1).getDay();
    const startDay = firstDay === 0 ? 6 : firstDay - 1;
    const totalDays = new Date(year,month+1,0).getDate();

    for(let i=0;i<startDay;i++){
        calendar.appendChild(document.createElement("div"));
    }

    for(let day=1;day<=totalDays;day++){

        const div = document.createElement("div");
        div.className="day";

        const dateStr =
        `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

        const dayEvents =
        events.filter(e=>e.date===dateStr);

        if(dayEvents.length){
            div.classList.add("has-event");
        }

        div.innerText = day;

        div.onclick=()=>{
            if(dayEvents.length){
                openModal(dayEvents[0]);
            }
        };

        calendar.appendChild(div);
    }
}

// ================= 今日 =================
function renderToday(){

    const today = new Date().toISOString().slice(0,10);

    const e = events.find(e=>e.date===today);

    const el = document.getElementById("todayEvent");

    if(!e){
        el.innerText="なし";
        return;
    }

    el.innerHTML = `
        ${e.title}<br>
        ${e.startTime}
    `;
}

// ================= 次回 =================
function renderNext(){

    const now = new Date();

    const next = events
    .filter(e=> new Date(e.date+"T"+e.startTime) > now)
    .sort((a,b)=> new Date(a.date+"T"+a.startTime) - new Date(b.date+"T"+b.startTime))[0];

    document.getElementById("nextEvent").innerText =
    next ? `${next.title}` : "なし";
}

// ================= 今週 =================
function renderWeek(){

    const area = document.getElementById("weekEvents");
    area.innerHTML="";

    const now = new Date();

    const week = events.filter(e=>{
        const d = new Date(e.date);
        const diff = (d - now)/(1000*60*60*24);
        return diff>=0 && diff<=7;
    });

    week.forEach(e=>{

        const div = document.createElement("div");

        div.innerHTML =
        `${e.date} ${e.title}`;

        div.onclick=()=>openModal(e);

        area.appendChild(div);
    });
}

// ================= モーダル =================
function openModal(event){

    const modal = document.getElementById("eventModal");
    modal.classList.remove("hidden");

    // 画像
    const imgArea = document.getElementById("eventImageArea");

    if(event.image){
        imgArea.innerHTML =
        `<img src="${event.image}" style="width:100%;border-radius:10px;">`;
    }else{
        imgArea.innerHTML = "";
    }

    // 詳細
    document.getElementById("eventDetail").innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.date} ${event.startTime}</p>

        <button onclick="window.open('${event.zoomUrl}','_blank')">
            Zoomに参加
        </button>

        <div>
        ${event.program.map(p=>`
            <p>${p.time} ${p.title}<br>${p.person||""}</p>
        `).join("")}
        </div>
    `;
}

document.getElementById("closeModal").onclick=()=>{
    document.getElementById("eventModal").classList.add("hidden");
};

// ================= 月移動 =================
document.getElementById("prevMonth").onclick=()=>{
    currentDate.setMonth(currentDate.getMonth()-1);
    renderCalendar();
};

document.getElementById("nextMonth").onclick=()=>{
    currentDate.setMonth(currentDate.getMonth()+1);
    renderCalendar();
};
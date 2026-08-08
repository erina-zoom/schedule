const DATA_URL =
"https://erina-manager.tomoya19980427goku.workers.dev/?action=events";

let events = [];
let currentDate = new Date();

// =========================
// 初期化
// =========================
async function init(){

    const res = await fetch(DATA_URL);
    events = await res.json();

    renderAll();
}

init();

// =========================
// 全描画
// =========================
function renderAll(){
    renderCalendar();
    renderToday();
    renderNext();
    renderWeek();
}

// =========================
// カレンダー
// =========================
function renderCalendar(){

    const calendar =
    document.getElementById("calendar");

    calendar.innerHTML="";

    const year =
    currentDate.getFullYear();

    const month =
    currentDate.getMonth();

    document.getElementById("monthTitle").innerText =
    `${year}年 ${month+1}月`;

    const firstDay =
    new Date(year,month,1).getDay();

    const startDay =
    firstDay === 0 ? 6 : firstDay - 1;

    const totalDays =
    new Date(year,month+1,0).getDate();

    for(let i=0;i<startDay;i++){
        calendar.appendChild(
            document.createElement("div")
        );
    }

    for(let day=1;day<=totalDays;day++){

        const div =
        document.createElement("div");

        div.className="day";

        const dateStr =
        `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

        const hasEvent =
        events.some(e=>e.date===dateStr);

        if(hasEvent){
            div.classList.add("has-event");
        }

        div.innerText = day;

        div.onclick=()=>{
            const event =
            events.find(e=>e.date===dateStr);

            if(event){
                openModal(event);
            }
        };

        calendar.appendChild(div);
    }
}

// =========================
// 今日
// =========================
function renderToday(){

    const today =
    new Date().toISOString().slice(0,10);

    const e =
    events.find(e=>e.date===today);

    document.getElementById("todayEvent").innerText =
    e ? e.title : "なし";
}

// =========================
// 次回
// =========================
function renderNext(){

    const now = new Date();

    const next =
    events.find(e=>{
        return new Date(e.date+"T"+e.startTime) > now;
    });

    document.getElementById("nextEvent").innerText =
    next ? next.title : "なし";
}

// =========================
// 今週
// =========================
function renderWeek(){

    const area =
    document.getElementById("weekEvents");

    area.innerHTML="";

    events.slice(0,7).forEach(e=>{

        const div =
        document.createElement("div");

        div.innerText =
        `${e.date} ${e.title}`;

        area.appendChild(div);
    });
}

// =========================
// モーダル
// =========================
function openModal(event){

    const modal =
    document.getElementById("eventModal");

    modal.classList.remove("hidden");

    document.getElementById("eventDetail").innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.date} ${event.startTime}</p>
    `;
}

document.getElementById("closeModal").onclick=()=>{
    document.getElementById("eventModal").classList.add("hidden");
};

// =========================
// 月移動
// =========================
document.getElementById("prevMonth").onclick=()=>{
    currentDate.setMonth(currentDate.getMonth()-1);
    renderCalendar();
};

document.getElementById("nextMonth").onclick=()=>{
    currentDate.setMonth(currentDate.getMonth()+1);
    renderCalendar();
};
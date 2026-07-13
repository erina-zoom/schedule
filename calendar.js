// ==========================================
// Zoomスケジュール Ver1.0
// Part1
// ==========================================

// カレンダー本体
const calendarBody = document.getElementById("calendarBody");
const monthTitle = document.getElementById("monthTitle");

// 今日・次回・今週
const todayEventBox = document.getElementById("todayEvent");
const nextEventBox = document.getElementById("nextEvent");
const weekEventsBox = document.getElementById("weekEvents");

// 年月
monthTitle.textContent = `${year}年${month}月`;

const today = new Date();

// 月初・月末
const firstDay = new Date(year, month - 1, 1);
const lastDay = new Date(year, month, 0);

// 月曜始まり
let startDay = firstDay.getDay();
startDay = startDay === 0 ? 6 : startDay - 1;

// 日数
const totalDays = lastDay.getDate();

// 初期化
calendarBody.innerHTML = "";

// 曜日
const weeks = ["月","火","水","木","金","土","日"];

// ==========================================
// 空白セル
// ==========================================

for(let i=0;i<startDay;i++){

    const empty=document.createElement("div");

    empty.className="day empty";

    calendarBody.appendChild(empty);

}

// ==========================================
// 日付作成
// ==========================================

for(let day=1;day<=totalDays;day++){

    const cell=document.createElement("div");

    cell.className="day";

    if(
        today.getFullYear()===year &&
        today.getMonth()+1===month &&
        today.getDate()===day
    ){
        cell.classList.add("today");
    }

    const number=document.createElement("div");

    number.className="day-number";

    const weekIndex=(startDay+day-1)%7;

    number.innerHTML=`
        ${day}
        <div style="font-size:12px;margin-top:3px;">
            (${weeks[weekIndex]})
        </div>
    `;

    cell.appendChild(number);

    calendarBody.appendChild(cell);

}// ==========================================
// イベント表示
// ==========================================

const cells = document.querySelectorAll(".day");

events.forEach(event => {

    const cell = cells[event.date + startDay - 1];

    if (!cell) return;

    const link = document.createElement("a");

    link.className = "event";

    if (event.url !== "") {

        link.href = event.url;
        link.target = "_blank";

    }

    link.style.background = event.color;

    link.innerHTML = `
        <div style="font-size:12px;">
            🕒 ${event.time}
        </div>

        <div style="margin-top:6px;">
            ${event.title}
        </div>
    `;

    if(event.url===""){

        link.style.opacity=".7";

        link.innerHTML+=`
            <div style="
                margin-top:6px;
                font-size:11px;
            ">
                🔒 URL準備中
            </div>
        `;

    }

    cell.appendChild(link);

});

// ==========================================
// 土日色変更
// ==========================================

document.querySelectorAll(".day").forEach((cell,index)=>{

    if(cell.classList.contains("empty")) return;

    const week=index%7;

    const number=cell.querySelector(".day-number");

    if(!number) return;

    if(week===5){

        number.style.color="#2563eb";

    }

    if(week===6){

        number.style.color="#dc2626";

    }

});

// ==========================================
// 今日までスクロール
// ==========================================

const todayCell=document.querySelector(".today");

if(todayCell){

    setTimeout(()=>{

        todayCell.scrollIntoView({

            behavior:"smooth",

            block:"center"

        });

    },300);

}// ==========================================
// 今日のZoom
// ==========================================

const todayEvents = events.filter(event => {

    return (
        event.date === today.getDate()
    );

});

if(todayEventBox){

    if(todayEvents.length===0){

        todayEventBox.innerHTML="本日の予定はありません";

    }else{

        todayEventBox.innerHTML="";

        todayEvents.forEach(event=>{

            const card=document.createElement("div");

            card.className="week-item";

            if(event.url){

                card.innerHTML=`
                    <div class="week-title">
                        ${event.title}
                    </div>

                    <div class="week-time">
                        🕒 ${event.time}
                    </div>

                    <br>

                    <a
                        class="event"
                        href="${event.url}"
                        target="_blank"
                        style="background:${event.color};display:inline-block;"
                    >
                        Zoomに参加
                    </a>
                `;

            }else{

                card.innerHTML=`
                    <div class="week-title">
                        ${event.title}
                    </div>

                    <div class="week-time">
                        🕒 ${event.time}
                    </div>

                    <br>

                    <span class="event"
                    style="
                    background:#999;
                    display:inline-block;
                    cursor:default;
                    ">
                    URL準備中
                    </span>
                `;

            }

            todayEventBox.appendChild(card);

        });

    }

}

// ==========================================
// 次回のZoom
// ==========================================

if(nextEventBox){

    const nextEvent=events.find(event=>event.date>today.getDate());

    if(nextEvent){

        nextEventBox.innerHTML=`

            <div class="week-item">

                <div class="week-date">
                    ${nextEvent.date}日
                </div>

                <div class="week-title">
                    ${nextEvent.title}
                </div>

                <div class="week-time">
                    🕒 ${nextEvent.time}
                </div>

            </div>

        `;

    }else{

        nextEventBox.innerHTML="次回の予定はありません";

    }

}

// ==========================================
// 今週の予定
// ==========================================

if(weekEventsBox){

    weekEventsBox.innerHTML="";

    events
        .filter(event=>event.date>=today.getDate())
        .slice(0,5)
        .forEach(event=>{

            const card=document.createElement("div");

            card.className="week-item";

            card.innerHTML=`

                <div class="week-date">
                    ${event.date}日
                </div>

                <div class="week-title">
                    ${event.title}
                </div>

                <div class="week-time">
                    🕒 ${event.time}
                </div>

            `;

            weekEventsBox.appendChild(card);

        });

}
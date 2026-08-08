const DATA_URL = "https://erina-manager.tomoya19980427goku.workers.dev/?action=events";

async function load(){

    const res = await fetch(DATA_URL + "&t=" + Date.now());
    const events = await res.json();

    const list = document.getElementById("scheduleList");
    const today = document.getElementById("todayEvent");
    const next = document.getElementById("nextEvent");
    const week = document.getElementById("weekEvents");

    list.innerHTML = "";
    today.innerHTML = "";
    next.innerHTML = "";
    week.innerHTML = "";

    const now = new Date();

    // 並び替え
    events.sort((a,b)=> new Date(a.date+" "+a.startTime) - new Date(b.date+" "+b.startTime));

    // 今日
    const todayStr = now.toISOString().split("T")[0];

    const todayEvents = events.filter(e=>e.date === todayStr);

    if(todayEvents.length === 0){
        today.innerHTML = "今日のZoomはありません";
    }else{
        todayEvents.forEach(e=>{
            today.innerHTML += `<div>${e.startTime} ${e.title}</div>`;
        });
    }

    // 次回
    const future = events.find(e=> new Date(e.date+" "+e.startTime) >= now);

    if(future){
        next.innerHTML = `${future.date} ${future.startTime} ${future.title}`;
    }else{
        next.innerHTML = "予定なし";
    }

    // 今週（7日）
    const weekEnd = new Date();
    weekEnd.setDate(now.getDate()+6);

    events.forEach(e=>{
        const d = new Date(e.date);
        if(d >= now && d <= weekEnd){
            week.innerHTML += `<div>${e.date} ${e.startTime} ${e.title}</div>`;
        }
    });

    // 全一覧
    events.forEach(e=>{
        list.innerHTML += `<div>${e.date} ${e.startTime} ${e.title}</div>`;
    });
}

load();
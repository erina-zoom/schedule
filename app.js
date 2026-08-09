const DATA_URL = "events.json";

let events = [];

async function load(){
    try{
        const res = await fetch(DATA_URL);
        events = await res.json();
        render();
    }catch(e){
        console.error("読み込み失敗", e);
    }
}

function render(){
    const todayBox = document.getElementById("today");
    const nextBox = document.getElementById("next");
    const weekBox = document.getElementById("week");

    todayBox.innerHTML = "";
    nextBox.innerHTML = "";
    weekBox.innerHTML = "";

    const today = new Date().toISOString().slice(0,10);

    // 今日
    const todayEvents = events.filter(e => e.date === today);
    todayEvents.forEach(e=>{
        todayBox.appendChild(createCard(e));
    });

    // 次回
    const future = events.filter(e => e.date >= today);
    if(future.length){
        const next = future[0];
        const card = createCard(next);
        card.classList.add("next");
        nextBox.appendChild(card);
    }

    // 今週
    events.slice(0,5).forEach(e=>{
        const div = createCard(e);
        weekBox.appendChild(div);
    });
}

function createCard(e){
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
        <div>${e.date}</div>
        <div>🕒 ${e.startTime}</div>
        <div>${e.title}</div>
    `;

    div.onclick = () => openModal(e);

    return div;
}

function openModal(e){
    const box = document.getElementById("eventDetail");

    box.innerHTML = `
        <h3>${e.title}</h3>
        <p>${e.date}</p>
        <p>${e.startTime}</p>
    `;

    document.getElementById("modal").classList.add("show");
}

function closeModal(){
    document.getElementById("modal").classList.remove("show");
}

load();
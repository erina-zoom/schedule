const API =
"https://erina-manager.tomoya19980427goku.workers.dev/?action=events";

let events = [];
let editingId = null;

// =====================
async function load(){

    const res = await fetch(API);
    events = await res.json();

    renderList();
}

load();

// =====================
function renderList(){

    const list =
    document.getElementById("eventList");

    list.innerHTML="";

    events.forEach(e=>{

        const div =
        document.createElement("div");

        div.className="event-item";

        div.innerHTML = `
        ${e.date} ${e.title}
        <button>編集</button>
        `;

        div.querySelector("button").onclick=()=>{
            edit(e);
        };

        list.appendChild(div);
    });
}

// =====================
function edit(e){

    editingId = e.id;

    title.value = e.title;
    eventDate.value = e.date;
    startTime.value = e.startTime;
    zoomUrl.value = e.zoomUrl;
}

// =====================
saveBtn.onclick = async ()=>{

    const data = {
        id: editingId || Date.now(),
        title: title.value,
        date: eventDate.value,
        startTime: startTime.value,
        zoomUrl: zoomUrl.value
    };

    await fetch(API,{
        method:"POST",
        body:JSON.stringify(data)
    });

    load();
};

// =====================
newBtn.onclick = ()=>{
    editingId=null;
    title.value="";
    eventDate.value="";
    startTime.value="";
    zoomUrl.value="";
};
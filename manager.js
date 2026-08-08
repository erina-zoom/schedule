const API =
"https://erina-manager.tomoya19980427goku.workers.dev/";

let events = [];
let editingId = null;

// =====================
// 読み込み
// =====================
async function load(){

    const res = await fetch(API + "?action=events&t=" + Date.now());
    events = await res.json();

    renderList();
}

load();

// =====================
// 一覧表示
// =====================
function renderList(){

    const list = document.getElementById("eventList");
    list.innerHTML="";

    events.forEach(e=>{

        const div = document.createElement("div");
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
// 編集
// =====================
function edit(e){

    editingId = e.id;

    title.value = e.title;
    eventDate.value = e.date;
    startTime.value = e.startTime;
    zoomUrl.value = e.zoomUrl;
    program.value = JSON.stringify(e.program || [], null, 2);
}

// =====================
// 画像アップロード
// =====================
async function uploadImage(file){

    const reader = new FileReader();

    return new Promise(resolve=>{

        reader.onload = async ()=>{

            const base64 =
            reader.result.split(",")[1];

            const res = await fetch(API,{
                method:"POST",
                body:JSON.stringify({
                    type:"image",
                    filename:"event-"+Date.now()+".jpg",
                    content:base64
                })
            });

            const data = await res.json();

            resolve(data.url);
        };

        reader.readAsDataURL(file);
    });
}

// =====================
// 保存
// =====================
saveBtn.onclick = async ()=>{

    let imageUrl = "";

    if(imageInput.files[0]){
        imageUrl =
        await uploadImage(imageInput.files[0]);
    }

    const data = {
        id: editingId || Date.now(),
        title: title.value,
        date: eventDate.value,
        startTime: startTime.value,
        zoomUrl: zoomUrl.value,
        image: imageUrl,
        program: JSON.parse(program.value || "[]")
    };

    const newEvents = editingId
    ? events.map(e=> e.id===editingId ? data : e)
    : [...events, data];

    await fetch(API,{
        method:"POST",
        body:JSON.stringify({
            action:"saveEvents",
            events:newEvents
        })
    });

    alert("保存完了");

    load();
};

// =====================
// 新規
// =====================
newBtn.onclick = ()=>{
    editingId=null;
    title.value="";
    eventDate.value="";
    startTime.value="";
    zoomUrl.value="";
    program.value="";
};
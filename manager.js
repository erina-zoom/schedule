// ==========================================
// ERINA Zoom Manager Ver5
// manager.js Part1
// ==========================================

"use strict";


// ==========================================
// 設定
// ==========================================

const WORKER_URL =
"https://erina-zoom.tomoya19980427goku.workers.dev";

const EVENTS_URL =
`${WORKER_URL}/api/admin/events`;


// ==========================================
// データ
// ==========================================

let events = [];

let editingEventId = null;

let selectedImageFile = null;

let removeCurrentImage = false;


// ==========================================
// DOM
// ==========================================

const statusMessage =
document.getElementById(
    "statusMessage"
);


const eventList =
document.getElementById(
    "eventList"
);


const editorPanel =
document.getElementById(
    "editorPanel"
);


const editorTitle =
document.getElementById(
    "editorTitle"
);


const eventIdInput =
document.getElementById(
    "eventId"
);


const titleInput =
document.getElementById(
    "title"
);


const shortTitleInput =
document.getElementById(
    "shortTitle"
);


const categoryInput =
document.getElementById(
    "category"
);


const eventDateInput =
document.getElementById(
    "eventDate"
);


const eventColorInput =
document.getElementById(
    "eventColor"
);


const startTimeInput =
document.getElementById(
    "startTime"
);


const endTimeInput =
document.getElementById(
    "endTime"
);


const zoomUrlInput =
document.getElementById(
    "zoomUrl"
);


const imageFileInput =
document.getElementById(
    "imageFile"
);


const currentImageInput =
document.getElementById(
    "currentImage"
);


const imagePreviewArea =
document.getElementById(
    "imagePreviewArea"
);


const programList =
document.getElementById(
    "programList"
);


const newEventButton =
document.getElementById(
    "newEventButton"
);


const reloadButton =
document.getElementById(
    "reloadButton"
);


const saveButton =
document.getElementById(
    "saveButton"
);


const deleteButton =
document.getElementById(
    "deleteButton"
);


const clearButton =
document.getElementById(
    "clearButton"
);


const imageButton =
document.getElementById(
    "removeImageButton"
);


const addProgramButton =
document.getElementById(
    "addProgramButton"
);


// ==========================================
// 初期化
// ==========================================

document.addEventListener(
"DOMContentLoaded",
initializeManager
);



async function initializeManager(){

    setupEventListeners();

    clearEditor();

    await loadEvents();

}


// ==========================================
// イベント設定
// ==========================================

function setupEventListeners(){


    if(newEventButton){

        newEventButton.onclick = ()=>{

            clearEditor();

            editorPanel.scrollIntoView({
                behavior:"smooth"
            });

        };

    }


    if(reloadButton){

        reloadButton.onclick =
        loadEvents;

    }


    if(saveButton){

        saveButton.onclick =
        saveEvent;

    }


    if(deleteButton){

        deleteButton.onclick =
        deleteCurrentEvent;

    }


    if(clearButton){

        clearButton.onclick =
        clearEditor;

    }


    if(imageButton){

        imageButton.onclick =
        removeImage;

    }


    if(imageFileInput){

        imageFileInput.onchange =
        handleImageSelection;

    }


    if(addProgramButton){

        addProgramButton.onclick =
        ()=>{

            addProgramEditor();

        };

    }

}



// ==========================================
// events.json取得
// ==========================================

async function loadEvents(){


    showStatus(
        "最新データ取得中...",
        "loading"
    );


    try{


        const res =
        await fetch(
            `${EVENTS_URL}?t=${Date.now()}`,
            {
                cache:"no-store"
            }
        );


        if(!res.ok){

            throw new Error(
                "events取得失敗"
            );

        }


        const data =
await res.json();


if(!data.success || !Array.isArray(data.events)){

    throw new Error(
        data.error ||
        "events形式エラー"
    );

}


events =
data.events
    .map(event => ({
        id: event.id,
        date: event.event_date || "",
        startTime: event.start_time || "",
        endTime: event.end_time || "",
        title: event.title || "",
        shortTitle: event.short_title || "",
        category: event.category || "",
        color: event.color || "#247447",
        image: event.image_url || "",
        zoomUrl: event.zoom_url || "",
        hasPassword: !!event.has_password,
        program: event.program || []
    }))
    .sort(
        compareEvents
    );


        renderEventList();


        showStatus(
            "読み込み完了",
            "success"
        );


        setTimeout(
            hideStatus,
            1500
        );


    }catch(error){


        console.error(error);


        showStatus(
            error.message,
            "error"
        );

    }

}



// ==========================================
// 一覧表示
// ==========================================

function renderEventList(){

    if(!eventList){
        return;
    }

    eventList.innerHTML="";

    events.forEach(event=>{

        const item =
        document.createElement("div");

        item.className =
        "event-list-item";

        item.innerHTML = `

        <div>

            <div class="event-list-title">
                ${escapeHTML(event.title)}
            </div>

            <div class="event-list-date">
                ${escapeHTML(event.date)}
                　
                ${escapeHTML(event.startTime)}
            </div>

        </div>

        <div class="event-list-buttons">

            <button
            class="button button-blue edit-btn">
                編集
            </button>

            <button
            class="button button-green duplicate-btn">
                複製
            </button>
<button
class="button button-danger delete-list-btn">
    削除
</button>
        </div>

        `;

        item
        .querySelector(".edit-btn")
        .onclick = ()=>{

            editEvent(event.id);

        };

        item
        .querySelector(".duplicate-btn")
        .onclick = ()=>{

            duplicateEvent(event.id);

        };
        item
.querySelector(".delete-list-btn")
.onclick = ()=>{

    deleteEventFromList(event.id);

};

        eventList.appendChild(item);

    });

}



// ==========================================
// 編集
// ==========================================

function editEvent(id){

    const event =
    events.find(
        item =>
        String(item.id) ===
        String(id)
    );

    if(!event){
        return;
    }

    editingEventId =
    event.id;

    eventIdInput.value =
    event.id || "";

    titleInput.value =
    event.title || "";

    shortTitleInput.value =
    event.shortTitle || "";

    categoryInput.value =
    event.category || "";

    eventDateInput.value =
    event.date || "";

    eventColorInput.value =
    event.color || "#247447";

    startTimeInput.value =
    event.startTime || "";

    endTimeInput.value =
    event.endTime || "";

    zoomUrlInput.value =
    event.zoomUrl || "";

    currentImageInput.value =
    event.image || "";

    selectedImageFile = null;
    removeCurrentImage = false;

    editorTitle.textContent =
    "✏️ 催事を編集";

    deleteButton.style.display =
    "inline-block";

    renderCurrentImage(
        event.image
    );

    renderProgramEditors(
        event.program || []
    );

    editorPanel.scrollIntoView({
    behavior:"smooth"
});

}


// ==========================================
// 複製
// ==========================================

function duplicateEvent(id){

    const event =
    events.find(
        item =>
        String(item.id) ===
        String(id)
    );

    if(!event){
        return;
    }

    editingEventId = null;

    eventIdInput.value = "";

    titleInput.value =
    event.title || "";

    shortTitleInput.value =
    event.shortTitle || "";

    categoryInput.value =
    event.category || "";

    eventDateInput.value = "";

    eventColorInput.value =
    event.color || "#247447";

    // 時間はコピーして残す
    startTimeInput.value =
    event.startTime || "";

    endTimeInput.value =
    event.endTime || "";

// Zoom・画像だけ空
zoomUrlInput.value = "";
currentImageInput.value = "";
imageFileInput.value = "";

selectedImageFile = null;
removeCurrentImage = false;

    renderCurrentImage("");

    renderProgramEditors(
        JSON.parse(
            JSON.stringify(
                event.program || []
            )
        )
    );

    editorTitle.textContent =
    "📄 催事を複製";

    deleteButton.style.display =
    "none";

    editorPanel.scrollIntoView({
    behavior:"smooth"
});

}


// ==========================================
// クリア
// ==========================================

function clearEditor(){


    editingEventId =
    null;


    selectedImageFile =
    null;


    removeCurrentImage =
    false;


    if(eventIdInput)
        eventIdInput.value="";


    titleInput.value="";


    shortTitleInput.value="";


    categoryInput.value="";


    eventDateInput.value="";


    eventColorInput.value=
    "#247447";


    startTimeInput.value="";


    endTimeInput.value="";


    zoomUrlInput.value="";


    currentImageInput.value="";


    imagePreviewArea.innerHTML="";


    programList.innerHTML="";


    editorTitle.textContent =
    "➕ 新しい催事を追加";


    deleteButton.style.display =
    "none";


}



// ==========================================
// Part2へ続く
// ==========================================
// ==========================================
// ERINA Zoom Manager Ver5
// manager.js Part2
// ==========================================


// ==========================================
// 保存
// ==========================================

async function saveEvent(){


    if(!titleInput.value.trim()){

        alert(
            "催事名を入力してください"
        );

        return;

    }


    if(!eventDateInput.value){

        alert(
            "開催日を入力してください"
        );

        return;

    }


    if(!startTimeInput.value){

        alert(
            "開始時間を入力してください"
        );

        return;

    }



    saveButton.disabled =
    true;



    try{


        showStatus(
            "保存準備中...",
            "loading"
        );



        let imagePath =
        currentImageInput.value || "";



        // ===========================
        // 画像アップロード
        // ===========================

        if(selectedImageFile){


            showStatus(
                "画像アップロード中...",
                "loading"
            );


            imagePath =
            await uploadImage(
                selectedImageFile
            );


        }



        if(removeCurrentImage){

            imagePath="";

        }



        const newEvent = {


            id:
            editingEventId ||
            createEventId(),


            date:
            eventDateInput.value,


            startTime:
            startTimeInput.value,


            endTime:
            endTimeInput.value,


            title:
            titleInput.value.trim(),


            shortTitle:
            shortTitleInput.value.trim(),


            category:
            categoryInput.value,


            color:
            eventColorInput.value,


            image:
            imagePath,


            zoomUrl:
            zoomUrlInput.value.trim(),


            program:
            collectProgram()


        };



        // ===========================
        // 配列更新
        // ===========================


        let saveEvents =
        [...events];



        const index =
        saveEvents.findIndex(
            item =>
            String(item.id) ===
            String(newEvent.id)
        );



        if(index >= 0){

            saveEvents[index] =
            newEvent;

        }
        else{

            saveEvents.push(
                newEvent
            );

        }



        saveEvents.sort(
            compareEvents
        );



        // ===========================
        // Worker保存
        // ===========================


        showStatus(
    "D1へ保存中...",
    "loading"
);

const response =
await fetch(
    `${WORKER_URL}/api/admin/events/save`,
    {
        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:
        JSON.stringify({

            event: {
                id: newEvent.id,
                event_date: newEvent.date,
                start_time: newEvent.startTime,
                end_time: newEvent.endTime,
                title: newEvent.title,
                short_title: newEvent.shortTitle,
                category: newEvent.category,
                color: newEvent.color,
                image_url: newEvent.image,
                zoom_url: newEvent.zoomUrl,
                description: newEvent.description || null,
                programs: newEvent.program || []
            }

        })

    }
);



        const result =
await response.json();


console.log(
    "Worker返答",
    result
);


if(
    !result.success
){

    throw new Error(
        result.error ||
        "保存失敗"
    );

}


        showStatus(
            "保存しました",
            "success"
        );



        await wait(
            1500
        );



        await loadEvents();



        const saved =
        events.find(
            item =>
            String(item.id) ===
            String(newEvent.id)
        );



        if(saved){

            editEvent(
                saved.id
            );

        }



    }

    catch(error){


        console.error(
            error
        );


        showStatus(
            "保存失敗："+error.message,
            "error"
        );


    }

    finally{


        saveButton.disabled =
        false;


    }


}



// ==========================================
// 画像アップロード
// ==========================================

async function uploadImage(
    file
){


    const base64 =
    await fileToBase64(
        file
    );



    const extension =
    getImageExtension(
        file
    );



    const filename =
    `event-${Date.now()}.${extension}`;



    const response =
await fetch(
    `${WORKER_URL}/api/admin/images/upload`,
    {

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:
        JSON.stringify({

            filename:
            filename,

            content:
            base64

        })

    }
);



    const result =
    await response.json();

console.log(
    "画像アップロード返答",
    result
);

    if(
        !result.success
    ){

        throw new Error(
            result.error ||
            "画像アップロード失敗"
        );

    }



    return result.url;


}



// ==========================================
// Base64変換
// ==========================================

function fileToBase64(
    file
){


    return new Promise(
        resolve=>{


            const reader =
            new FileReader();



            reader.onload =
            ()=>{


                const data =
                reader.result
                .split(",")[1];



                resolve(
                    data
                );


            };



            reader.readAsDataURL(
                file
            );


        }
    );


}



// ==========================================
// 拡張子
// ==========================================

function getImageExtension(
    file
){


    if(
        file.type ===
        "image/png"
    ){

        return "png";

    }


    if(
        file.type ===
        "image/webp"
    ){

        return "webp";

    }


    return "jpg";


}



// ==========================================
// プログラム取得
// ==========================================

function collectProgram(){


    const result=[];


    const items =
    programList.querySelectorAll(
        ".program-editor-item"
    );



    items.forEach(
    item=>{


        const time =
        item.querySelector(
            ".program-time-input"
        )?.value || "";



        const title =
        item.querySelector(
            ".program-title-input"
        )?.value || "";



        const person =
        item.querySelector(
            ".program-person-input"
        )?.value || "";



        if(
            time ||
            title ||
            person
        ){

            result.push({

                time,

                title,

                person

            });

        }


    });



    return result;


}



// ==========================================
// 画像選択
// ==========================================

function handleImageSelection(){


    selectedImageFile =
    imageFileInput.files[0] ||
    null;


}



// ==========================================
// 画像削除
// ==========================================

function removeImage(){


    selectedImageFile =
    null;


    removeCurrentImage =
    true;


    imagePreviewArea.innerHTML =
    "";


}



// ==========================================
// ID生成
// ==========================================

function createEventId(){


    return (
        eventDateInput.value
        .replaceAll("-","")
        +
        "-"
        +
        Math.random()
        .toString(36)
        .slice(2,8)
    );


}



// ==========================================
// 待機
// ==========================================

function wait(ms){

    return new Promise(
        resolve =>
        setTimeout(
            resolve,
            ms
        )
    );

}


// ==========================================
// ERINA Zoom Manager Ver5
// manager.js Part3
// ==========================================

async function deleteEventFromList(id){

    const target =
    events.find(
        item =>
        String(item.id) ===
        String(id)
    );

    if(!target){
        return;
    }

    const confirmDelete =
    confirm(
        `「${target.title}」を削除しますか？`
    );

    if(!confirmDelete){
        return;
    }

    try{

        showStatus(
            "削除中...",
            "loading"
        );

        const response =
        await fetch(
            `${WORKER_URL}/api/admin/events/${encodeURIComponent(id)}`,
            {
                method:"DELETE",
                headers:{
                    "Content-Type":
                    "application/json"
                }
            }
        );

        const result =
        await response.json();

        if(
            !response.ok ||
            !result.success
        ){
            throw new Error(
                result.error ||
                "削除失敗"
            );
        }

        showStatus(
            "削除しました",
            "success"
        );

        await wait(1000);

        await loadEvents();

    }
    catch(error){

        console.error(error);

        showStatus(
            "削除失敗："+error.message,
            "error"
        );

    }

}
// ==========================================
// 削除
// ==========================================

async function deleteCurrentEvent(){

    if(!editingEventId){

        return;

    }


    const target =
    events.find(
        item =>
        String(item.id) ===
        String(editingEventId)
    );


    if(!target){

        return;

    }


    const confirmDelete =
    confirm(
        `「${target.title}」を削除しますか？`
    );


    if(!confirmDelete){

        return;

    }


    try{

        showStatus(
            "削除中...",
            "loading"
        );


        const response =
        await fetch(
            `${WORKER_URL}/api/admin/events/${encodeURIComponent(editingEventId)}`,
            {

                method:"DELETE",

                headers:{
                    "Content-Type":
                    "application/json"
                }

            }
        );


        const result =
        await response.json();


        if(!response.ok || !result.success){

            throw new Error(
                result.error ||
                "削除失敗"
            );

        }


        showStatus(
            "削除しました",
            "success"
        );


        await wait(
            1000
        );


        clearEditor();


        await loadEvents();


    }
    catch(error){

        console.error(error);


        showStatus(
            "削除失敗："+error.message,
            "error"
        );

    }

}


// ==========================================
// 現在画像表示
// ==========================================

function renderCurrentImage(
    imagePath
){


    if(!imagePreviewArea){

        return;

    }


    imagePreviewArea.innerHTML="";


    if(!imagePath){

        return;

    }



    const img =
    document.createElement(
        "img"
    );


    img.className =
    "image-preview";


    img.src =
    `${imagePath}?v=${Date.now()}`;


    imagePreviewArea.appendChild(
        img
    );


}



// ==========================================
// プログラム編集表示
// ==========================================

function renderProgramEditors(
    program=[]
){


    if(!programList){

        return;

    }


    programList.innerHTML="";


    program.forEach(
        item=>{

            addProgramEditor(
                item
            );

        }
    );


}



// ==========================================
// プログラム追加
// ==========================================

function addProgramEditor(
    item={}
){


    const div =
    document.createElement(
        "div"
    );


    div.className =
    "program-editor-item";


    div.innerHTML = `

    <div class="program-row">


        <input
        type="time"
        class="program-time-input"
        value="${escapeAttribute(
            item.time || ""
        )}"
        >


        <input
        type="text"
        class="program-title-input"
        placeholder="項目"
        value="${escapeAttribute(
            item.title || ""
        )}"
        >


        <textarea
        class="program-person-input"
        placeholder="担当者">${escapeHTML(
            item.person || ""
        )}</textarea>


    </div>


    <button
    type="button"
    class="button button-danger remove-program">

    削除

    </button>

    `;



    div
    .querySelector(
        ".remove-program"
    )
    .onclick = ()=>{

        div.remove();

    };



    programList.appendChild(
        div
    );


}



// ==========================================
// ステータス
// ==========================================

function showStatus(
    message,
    type
){


    if(!statusMessage){

        return;

    }


    statusMessage.textContent =
    message;


    statusMessage.className =
    type;


}



function hideStatus(){


    if(!statusMessage){

        return;

    }


    statusMessage.textContent =
    "";


}



// ==========================================
// 並び替え
// ==========================================

function compareEvents(
    a,
    b
){


    const dateA =
    `${a.date || ""}T${a.startTime || ""}`;


    const dateB =
    `${b.date || ""}T${b.startTime || ""}`;


    return dateA.localeCompare(
        dateB
    );


}



// ==========================================
// HTMLエスケープ
// ==========================================

function escapeHTML(
    value
){


    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );


}



function escapeAttribute(
    value
){

    return escapeHTML(
        value
    );

}



// ==========================================
// 完成
// ==========================================
//
// ERINA Zoom Manager Ver5
//
// 対応:
//
// ✅ events.json取得
// ✅ Worker Ver5保存
// ✅ 催事追加
// ✅ 催事編集
// ✅ 催事削除
// ✅ 画像アップロード
// ✅ GitHub JSON更新
// ✅ 公開サイト反映
//
// ==========================================
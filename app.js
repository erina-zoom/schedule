// ===============================
// ERINA Zoom予定表 app.js
// Cloudflare Worker取得版
// ===============================


const DATA_URL =
"https://erina-manager.tomoya19980427goku.workers.dev/?action=events";



let events = [];



// ===============================
// 初回取得済みデータ保存
// ===============================

let lastEventsData =
localStorage.getItem(
    "erina_events_data"
);




// ===============================
// イベント取得
// ===============================

async function loadEvents(){


    try{


        const res =
        await fetch(
            DATA_URL + "&t=" + Date.now(),
            {
                cache:"no-store"
            }
        );



        const newEvents =
        await res.json();



        // ===============================
        // 更新チェック
        // ===============================

        checkUpdate(
            JSON.stringify(newEvents)
        );



        events =
        newEvents;



        // 日付順

        events.sort((a,b)=>{


            const da =
            `${a.date} ${a.startTime || "00:00"}`;


            const db =
            `${b.date} ${b.startTime || "00:00"}`;


            return da.localeCompare(db);


        });



        renderSchedule();



    }catch(error){


        console.error(
            "イベント取得エラー:",
            error
        );


    }


}





// ===============================
// 自動更新チェック
// ===============================

function checkUpdate(data){


    const oldData =
    localStorage.getItem(
        "erina_events_data"
    );



    console.log(
        "更新チェック",
        oldData !== data
    );



    if(
        oldData &&
        oldData !== data
    ){



        const box =
        document.getElementById(
            "updateNotice"
        );



        if(box){

    box.style.display = "block";

    box.innerHTML =
    "✅ 自動更新されました";


    box.classList.add(
        "show-update"
    );


    setTimeout(()=>{

        box.innerHTML = "";

        box.classList.remove(
            "show-update"
        );


    },5000);


}



    }



    localStorage.setItem(
        "erina_events_data",
        data
    );

}





// ===============================
// 日本時間
// ===============================

function getJapanDate(){


    const now =
    new Date();



    return new Date(

        now.toLocaleString(
            "ja-JP",
            {
                timeZone:"Asia/Tokyo"
            }
        )

    );


}




function formatDate(date){


    const y =
    date.getFullYear();


    const m =
    String(
        date.getMonth()+1
    )
    .padStart(2,"0");


    const d =
    String(
        date.getDate()
    )
    .padStart(2,"0");



    return `${y}-${m}-${d}`;


}// ===============================
// 予定表表示
// ===============================


function renderSchedule(){


    const todayBox =
    document.getElementById(
        "today"
    );


    const nextBox =
    document.getElementById(
        "next"
    );


    const weekBox =
    document.getElementById(
        "week"
    );


    const allBox =
    document.getElementById(
        "allSchedule"
    );



    if(todayBox)
        todayBox.innerHTML="";


    if(nextBox)
        nextBox.innerHTML="";


    if(weekBox)
        weekBox.innerHTML="";


    if(allBox)
        allBox.innerHTML="";



    const today =
    formatDate(
        getJapanDate()
    );




    // ===============================
    // 今日のZoom
    // ===============================


    const todayEvents =
    events.filter(e=>
        e.date === today
    );



    if(todayBox){


        if(todayEvents.length){


            todayEvents.forEach(e=>{


                todayBox.appendChild(
                    createCard(
                        e,
                        true
                    )
                );


            });


        }else{


            todayBox.innerHTML =
            `
            <p class="empty">
            今日のZoomはありません
            </p>
            `;


        }


    }




    // ===============================
    // 次回Zoom
    // ===============================


    const futureEvents =
    events.filter(e=>
        e.date >= today
    );



    if(
        nextBox &&
        futureEvents.length
    ){


        const card =
        createCard(
            futureEvents[0],
            true
        );


        card.classList.add(
            "next-card"
        );


        nextBox.appendChild(
            card
        );


    }




    // ===============================
    // 今週の予定
    // ===============================


    const start =
    getJapanDate();



    const end =
    new Date(start);



    end.setDate(
        end.getDate()+7
    );



    const weekEvents =
    events.filter(e=>{


        const d =
        new Date(
            e.date+"T00:00:00"
        );


        return(
            d >= start &&
            d < end
        );


    });




    if(weekBox){


        if(weekEvents.length){


            weekEvents.forEach(e=>{


                weekBox.appendChild(
                    createCard(
                        e,
                        false
                    )
                );


            });


        }else{


            weekBox.innerHTML =
            `
            <p class="empty">
            今週の予定はありません
            </p>
            `;


        }


    }





    // ===============================
    // 全スケジュール
    // ===============================


    if(allBox){


        events.forEach(e=>{


            allBox.appendChild(
                createCard(
                    e,
                    false
                )
            );


        });


    }



    renderCalendar();


}






// ===============================
// カード生成
// ===============================


function createCard(
    e,
    showZoom=false
){


    const div =
    document.createElement(
        "div"
    );



    div.className =
    "event-card";




    const dateObj =
    new Date(
        e.date+"T00:00:00"
    );



    const week =
    [
        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"
    ];



    const dateText =
    `${dateObj.getMonth()+1}/${dateObj.getDate()}(${week[dateObj.getDay()]})`;




    div.innerHTML =
    `

    <div class="event-header">


        <div class="event-date">

        ${dateText}

        </div>



        <div class="event-time">

        🕒 ${e.startTime || ""}

        </div>


    </div>



    <div class="event-title">

    ${e.title || ""}

    </div>



    ${
        showZoom && e.zoomUrl
        ?

        `
        <a
        href="${e.zoomUrl}"
        target="_blank"
        class="zoom-btn"
        onclick="event.stopPropagation()">

        Zoomに参加

        </a>
        `

        :

        ""

    }



    `;



    div.onclick = ()=>{


        openModal(e);


    };



    return div;


}// ===============================
// モーダル表示
// ===============================


function openModal(e){


    const modal =
    document.getElementById(
        "modal"
    );


    const detail =
    document.getElementById(
        "eventDetail"
    );



    if(
        !modal ||
        !detail
    ){

        return;

    }




    let html = "";




    // ===============================
    // 画像
    // ===============================


    if(e.image){


        html +=
        `
        <img
        src="${e.image}?v=${Date.now()}"
        class="modal-image">

        `;


    }




    // ===============================
    // タイトル・日時
    // ===============================


    html +=
    `

    <h2>
    ${e.title || ""}
    </h2>


    <p>
    📅 ${e.date || ""}
    </p>


    <p>
    🕒 ${e.startTime || ""}
    ${
        e.endTime
        ?
        `〜${e.endTime}`
        :
        ""
    }
    </p>


    `;





    // ===============================
    // 催事スケジュール
    // ===============================


    if(
        e.program &&
        Array.isArray(e.program) &&
        e.program.length
    ){


        html +=
        `

        <hr>


        <h3>
        📋 催事スケジュール
        </h3>


        <div class="program-list">

        `;



        e.program.forEach(item=>{

    html += `
    <div class="program-item">

        <div class="program-time">
            <b>
            ${item.time || ""}
            </b>
        </div>

        <div class="program-content">

            <div class="program-title">
                ${item.title || ""}
            </div>

            ${
                item.person
                ?
                `
                <div class="program-person">
                    👤 ${item.person}
                </div>
                `
                :
                ""
            }

        </div>

    </div>
    `;

});

html += `
</div>
`;


    }






    // ===============================
    // Zoomボタン
    // ===============================


    if(e.zoomUrl){


        html +=
        `

        <a
        href="${e.zoomUrl}"
        target="_blank"
        class="zoom-btn modal-zoom">


        Zoomに参加する


        </a>


        `;


    }





    detail.innerHTML =
    html;



    modal.classList.add(
        "show"
    );


}






// ===============================
// モーダル閉じる
// ===============================


function closeModal(){


    const modal =
    document.getElementById(
        "modal"
    );


    if(modal){


        modal.classList.remove(
            "show"
        );


    }


}





// ===============================
// ×ボタン
// ===============================


document.addEventListener(
"click",
(e)=>{


    if(
        e.target.id ===
        "closeModal"
    ){


        closeModal();


    }


});// ===============================
// カレンダー
// ===============================


let currentDate =
new Date();




function renderCalendar(){


    const calendar =
    document.getElementById(
        "calendar"
    );


    const monthTitle =
    document.getElementById(
        "monthTitle"
    );



    if(!calendar)
        return;



    calendar.innerHTML="";



    const year =
    currentDate.getFullYear();


    const month =
    currentDate.getMonth();



    if(monthTitle){

        monthTitle.innerText =
        `${year}年${month+1}月`;

    }



    // 月曜始まり

    let first =
    new Date(
        year,
        month,
        1
    ).getDay();


    first =
    first === 0
    ? 6
    : first - 1;



    const last =
    new Date(
        year,
        month+1,
        0
    ).getDate();




    // 空白

    for(
        let i=0;
        i<first;
        i++
    ){

        calendar.innerHTML +=
        `
        <div></div>
        `;

    }




    // 日付

    for(
        let d=1;
        d<=last;
        d++
    ){


        const dateStr =
        `${year}-${String(month+1)
        .padStart(2,"0")}-${String(d)
        .padStart(2,"0")}`;



        const dayEvents =
        events.filter(e=>
            e.date === dateStr
        );



        const day =
        document.createElement(
            "div"
        );


        day.className =
        "calendar-day";



        let eventHtml = "";



        dayEvents.forEach(e=>{


            eventHtml +=
            `
            <div
            class="calendar-event"
            style="background:${e.color || "#4caf50"}">

            ${e.shortTitle || e.title}

            </div>
            `;


        });



        day.innerHTML =
        `

        <div>
        ${d}
        </div>


        ${eventHtml}


        `;



        if(dayEvents.length){


            day.onclick = ()=>{


                openModal(
                    dayEvents[0]
                );


            };


        }



        calendar.appendChild(
            day
        );


    }


}







// ===============================
// 月移動
// ===============================


const prev =
document.getElementById(
"prevMonth"
);


const next =
document.getElementById(
"nextMonth"
);




if(prev){


    prev.onclick = ()=>{


        currentDate.setMonth(
            currentDate.getMonth()-1
        );


        renderCalendar();


    };


}





if(next){


    next.onclick = ()=>{


        currentDate.setMonth(
            currentDate.getMonth()+1
        );


        renderCalendar();


    };


}








// ===============================
// 表示切替
// ===============================


function showView(type){



    const schedule =
    document.getElementById(
        "scheduleView"
    );


    const calendar =
    document.getElementById(
        "calendarView"
    );



    if(type==="schedule"){


        schedule.style.display =
        "block";


        calendar.style.display =
        "none";


    }




    if(type==="calendar"){


        schedule.style.display =
        "none";


        calendar.style.display =
        "block";


        renderCalendar();


    }


}







// ===============================
// 起動
// ===============================


loadEvents();




// ===============================
// 30秒自動更新
// ===============================


setInterval(()=>{


    loadEvents();


},30000);
"use strict";

/* =========================
   基本設定
========================= */

const DATA_URL =
"https://erina-manager.tomoya19980427goku.workers.dev/?action=events";

let events = [];

/* =========================
   初期化
========================= */

document.addEventListener("DOMContentLoaded", async () => {

    await loadEvents();
    renderAll();

});

/* =========================
   データ取得
========================= */

async function loadEvents(){

    const res = await fetch(DATA_URL + "&t=" + Date.now());
    const data = await res.json();

    events = data || [];

}

/* =========================
   全描画
========================= */

function renderAll(){

    renderScheduleList();
    renderWeekEvents();

}

/* =========================
   スケジュール（←ここが元UI）
========================= */

function renderScheduleList(){

    const container = document.getElementById("scheduleList");
    if(!container) return;

    container.innerHTML = "";

    events.forEach(event => {

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <div style="border-left:6px solid ${event.color || "#247447"}; padding-left:12px;">
                
                <h3>${formatDate(event.date)}</h3>

                <p style="color:#2e7d32;font-weight:bold;">
                    🕒 ${event.startTime || ""}
                </p>

                <p style="font-size:18px;">
                    ${event.title || ""}
                </p>

            </div>
        `;

        container.appendChild(card);

    });

}

/* =========================
   今週の予定
========================= */

function renderWeekEvents(){

    const container =
    document.getElementById("weekEvents");

    if(!container) return;

    container.innerHTML = "";

    const today = new Date();

    const weekLater = new Date();
    weekLater.setDate(today.getDate()+6);

    const weekEvents = events.filter(e=>{

        const d = new Date(e.date);
        return d >= today && d <= weekLater;

    });

    weekEvents.forEach(e=>{

        const div = document.createElement("div");

        div.innerHTML = `
            ${formatShortDate(e.date)}<br>
            ${e.startTime}<br>
            ${e.title}
        `;

        container.appendChild(div);

    });

}

/* =========================
   日付フォーマット
========================= */

function formatDate(dateStr){

    const d = new Date(dateStr);

    const week = ["日","月","火","水","木","金","土"];

    return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${week[d.getDay()]}）`;

}

function formatShortDate(dateStr){

    const d = new Date(dateStr);

    const week = ["日","月","火","水","木","金","土"];

    return `${d.getMonth()+1}/${d.getDate()}（${week[d.getDay()]}）`;

}
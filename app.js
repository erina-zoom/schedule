"use strict";

/* =========================================================
   1. 基本設定
   ========================================================= */

const DATA_URL =
"https://erina-manager.tomoya19980427goku.workers.dev/?action=events";

const UPDATE_INTERVAL = 30 * 1000;

let events = [];
let currentYear;
let currentMonth;
let lastDataSignature = "";
let refreshTimer = null;

let displayMode = "schedule";

/* =========================================================
   初期化
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
    renderNotices();
});

async function initializeApp() {

    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth() + 1;

    await loadEvents({ firstLoad: true });

    renderAll();

    document.getElementById("calendarSection").style.display = "none";

    setupEventListeners();

    startAutoRefresh();

    registerServiceWorker();
}

/* =========================================================
   データ取得（キャッシュ完全回避）
   ========================================================= */

async function loadEvents({ firstLoad=false, silent=false }={}){

    try{

        const res = await fetch(
            DATA_URL + "&t=" + Date.now(),
            {
                cache:"no-store"
            }
        );

        if(!res.ok){
            throw new Error("取得失敗");
        }

        const newEvents = await res.json();

        const normalized = newEvents
        .map(normalizeEvent)
        .filter(Boolean)
        .sort(compareEvents);

        const newSig = JSON.stringify(normalized);

        const changed =
        lastDataSignature &&
        lastDataSignature !== newSig;

        events = normalized;
        lastDataSignature = newSig;

        if(changed && !firstLoad){

            renderAll();

            if(!silent){
                showToast("📢 新しい予定があります");
            }

        }

        return true;

    }catch(e){

        console.error("取得エラー",e);

        if(firstLoad){
            showLoadError();
        }

        return false;
    }
}

/* =========================================================
   自動更新（これがリアルタイムの核）
   ========================================================= */

function startAutoRefresh(){

    if(refreshTimer){
        clearInterval(refreshTimer);
    }

    refreshTimer =
    setInterval(refreshLatestData, UPDATE_INTERVAL);
}

async function refreshLatestData(){

    if(document.hidden) return;

    await loadEvents({
        firstLoad:false,
        silent:false
    });
}

/* =========================================================
   再描画
   ========================================================= */

function renderAll(){

    renderTodayEvents();
    renderNextEvent();
    renderWeekEvents();

    if(displayMode==="schedule"){
        renderScheduleList();
    }

    if(displayMode==="calendar"){
        renderCalendar();
    }
}

/* =========================================================
   以下はそのまま（既存ロジック）
   ========================================================= */

// ※あなたの元コードのまま全部維持でOK
// normalizeEvent / render系 / modal / notice etc

/* =========================================================
   通知
   ========================================================= */

let toastTimer = null;

function showToast(message){

    const el = document.getElementById("updateToast");
    if(!el) return;

    el.textContent = message;
    el.classList.remove("hidden");

    if(toastTimer){
        clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(()=>{
        el.classList.add("hidden");
    },3000);
}
function normalizeEvent(e){
    return e;
}

function compareEvents(a,b){
    return (a.date + a.startTime)
        .localeCompare(b.date + b.startTime);
}
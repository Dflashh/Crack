// ==UserScript==
// @name         Crack Alibi
// @namespace    https://github.com/Dflashh/Crack
// @version      1.0.3
// @description  선택한 기간의 크랙 사용 알리바이만 빠르게 조회합니다.
// @match        *://crack.wrtn.ai/*
// @author       깡통들과 나
// @connect      crack-api.wrtn.ai
// @icon         https://cdn.jsdelivr.net/gh/Dflashh/Crack@main/Icon/Alibi.webp
// @downloadURL  https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackAlibi.user.js
// @updateURL    https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackAlibi.user.js
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  const ALIBI_VERSION = "v1.0.3";
  const POINT = "#FE4532";
  const API = "https://crack-api.wrtn.ai/crack-cash/crackers/history";
  // 이 API는 실제로 한 페이지에 10개만 주는 것으로 보여서 limit은 10 유지.
  // 속도 개선은 limit을 올리는 게 아니라, 오래된 날짜 위치를 더 똑똑하게 찾는 방식으로 처리.
  const PAGE_LIMIT = 10;
  const MAX_PAGE = 20000;

  let currentAborter = null;
  let isSearching = false;
  let currentSpeed = "express";
  let lastRawRows = [];
  let lastSummaryRows = [];
  let lastRangeStart = "";
  let lastRangeEnd = "";
  let currentResultView = "summary";
  let currentCalendarMonth = "";
  let selectedCalendarDate = "";

  const SPEEDS = {
    safe: { label: "기본", jump: 25, delay: 220, desc: "최근 내역 조회시" },
    express: { label: "급행", jump: 80, delay: 90, desc: "기본 추천" },
    madness: { label: "광기", jump: 160, delay: 35, desc: "오래된 내역 조회시" },
  };

  function addStyles() {
    GM_addStyle(`
      .alibi-button {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-basis: 72px !important;
      }
      .alibi-button > button {
        height: 100%;
        width: 100%;
        padding: 0 10px;
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .alibi-button p {
        margin: 0;
        white-space: nowrap;
      }
      .ca-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 22px;
        background: rgba(0, 0, 0, 0.28);
        backdrop-filter: blur(14px) saturate(130%);
        -webkit-backdrop-filter: blur(14px) saturate(130%);
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Pretendard, system-ui, sans-serif;
      }
      .ca-sheet {
        width: min(760px, calc(100vw - 28px));
        max-height: min(860px, calc(100vh - 34px));
        overflow: hidden;
        border-radius: 30px;
        background: rgba(250, 250, 252, 0.92);
        color: #151515;
        box-shadow: 0 36px 110px rgba(0,0,0,.32), inset 0 0 0 1px rgba(255,255,255,.65);
        backdrop-filter: blur(26px) saturate(160%);
        -webkit-backdrop-filter: blur(26px) saturate(160%);
        display: flex;
        flex-direction: column;
      }
      body[data-theme="dark"] .ca-sheet {
        background: rgba(24, 24, 26, 0.88);
        color: #F7F7F8;
        box-shadow: 0 36px 110px rgba(0,0,0,.58), inset 0 0 0 1px rgba(255,255,255,.10);
      }
      .ca-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 22px 24px 16px;
      }
      .ca-brand {
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 0;
      }
      .ca-logo {
        width: 48px;
        height: 48px;
        border-radius: 16px;
        display: grid;
        place-items: center;
        background: linear-gradient(145deg, ${POINT}, #ff7d4b);
        color: white;
        font-size: 23px;
        box-shadow: 0 12px 28px rgba(254,69,50,.34);
        flex: 0 0 auto;
      }
      .ca-title {
        margin: 0;
        font-size: 24px;
        line-height: 1.05;
        letter-spacing: -0.045em;
        font-weight: 900;
      }
      .ca-subtitle {
        margin-top: 5px;
        color: rgba(30,30,32,.58);
        font-size: 13px;
        font-weight: 650;
        letter-spacing: -0.02em;
      }
      body[data-theme="dark"] .ca-subtitle { color: rgba(245,245,247,.52); }
      .ca-close {
        width: 36px;
        height: 36px;
        border-radius: 999px;
        border: 0;
        cursor: pointer;
        background: rgba(120,120,128,.14);
        color: inherit;
        font-size: 18px;
        font-weight: 900;
      }
      .ca-body {
        padding: 0 24px 24px;
        overflow: auto;
      }
      .ca-card {
        border-radius: 24px;
        background: rgba(255,255,255,.78);
        box-shadow: inset 0 0 0 1px rgba(0,0,0,.055);
        padding: 16px;
      }
      body[data-theme="dark"] .ca-card {
        background: rgba(255,255,255,.075);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.075);
      }
      .ca-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .ca-field label,
      .ca-speed-title {
        display: block;
        margin: 0 0 8px;
        color: rgba(30,30,32,.55);
        font-size: 12px;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      body[data-theme="dark"] .ca-field label,
      body[data-theme="dark"] .ca-speed-title { color: rgba(245,245,247,.50); }
      .ca-field { min-width: 0; }
      .ca-date {
        width: 100%;
        height: 46px;
        box-sizing: border-box;
        min-width: 0;
        max-width: 100%;
        border: 0;
        outline: none;
        border-radius: 16px;
        padding: 0 13px;
        background: rgba(118,118,128,.12);
        color: inherit;
        font-size: 15px;
        font-weight: 800;
        letter-spacing: -0.02em;
        appearance: none;
        -webkit-appearance: none;
      }
      .ca-date::-webkit-date-and-time-value {
        min-height: 1.2em;
        text-align: center;
      }
      .ca-date::-webkit-calendar-picker-indicator {
        margin: 0;
        padding: 0;
      }
      body[data-theme="dark"] .ca-date { background: rgba(255,255,255,.10); color-scheme: dark; }
      .ca-speed {
        margin-top: 14px;
      }
      .ca-speed-help {
        margin: -3px 0 9px;
        color: rgba(30,30,32,.42);
        font-size: 11px;
        font-weight: 750;
        letter-spacing: -0.02em;
      }
      body[data-theme="dark"] .ca-speed-help { color: rgba(245,245,247,.38); }
      .ca-segment {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        padding: 5px;
        border-radius: 18px;
        background: rgba(118,118,128,.13);
      }
      body[data-theme="dark"] .ca-segment { background: rgba(255,255,255,.08); }
      .ca-speed-btn {
        min-height: 46px;
        border: 0;
        border-radius: 12px;
        cursor: pointer;
        background: transparent;
        color: inherit;
        font-weight: 900;
        letter-spacing: -0.03em;
      }
      .ca-speed-btn small {
        display: block;
        margin-top: 2px;
        font-size: 10px;
        font-weight: 800;
        opacity: .48;
      }
      .ca-speed-btn.is-on {
        background: ${POINT};
        color: white;
        box-shadow: 0 10px 22px rgba(254,69,50,.28);
      }
      .ca-actions {
        display: flex;
        gap: 10px;
        margin-top: 14px;
      }
      .ca-primary,
      .ca-ghost {
        height: 42px;
        border: 0;
        border-radius: 15px;
        cursor: pointer;
        padding: 0 16px;
        font-size: 15px;
        font-weight: 900;
        letter-spacing: -0.03em;
      }
      .ca-primary {
        flex: 1;
        background: ${POINT};
        color: white;
        box-shadow: 0 14px 30px rgba(254,69,50,.32);
      }
      .ca-primary:disabled { opacity: .55; cursor: not-allowed; }
      .ca-ghost {
        background: rgba(118,118,128,.13);
        color: inherit;
      }
      body[data-theme="dark"] .ca-ghost { background: rgba(255,255,255,.10); }
      .ca-result {
        margin-top: 14px;
        min-height: 210px;
      }
      .ca-empty,
      .ca-loading {
        min-height: 210px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: rgba(30,30,32,.52);
        gap: 10px;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      body[data-theme="dark"] .ca-empty,
      body[data-theme="dark"] .ca-loading { color: rgba(245,245,247,.52); }
      .ca-spinner {
        width: 34px;
        height: 34px;
        border-radius: 999px;
        border: 3px solid rgba(254,69,50,.18);
        border-top-color: ${POINT};
        animation: caSpin .8s linear infinite;
      }
      @keyframes caSpin { to { transform: rotate(360deg); } }
      .ca-stat-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 12px;
      }
      .ca-stat {
        border-radius: 20px;
        padding: 14px;
        background: rgba(118,118,128,.10);
      }
      body[data-theme="dark"] .ca-stat { background: rgba(255,255,255,.075); }
      .ca-stat span {
        display: block;
        font-size: 11px;
        opacity: .55;
        font-weight: 850;
        letter-spacing: -0.02em;
      }
      .ca-stat strong {
        display: block;
        margin-top: 5px;
        font-size: 21px;
        font-weight: 950;
        letter-spacing: -0.045em;
        font-variant-numeric: tabular-nums;
      }
      .ca-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ca-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: center;
        border-radius: 18px;
        padding: 13px 14px;
        background: rgba(118,118,128,.10);
      }
      body[data-theme="dark"] .ca-row { background: rgba(255,255,255,.075); }
      .ca-row-title {
        min-width: 0;
        font-weight: 900;
        letter-spacing: -0.03em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ca-row-sub {
        margin-top: 3px;
        font-size: 12px;
        font-weight: 750;
        color: rgba(30,30,32,.50);
      }
      body[data-theme="dark"] .ca-row-sub { color: rgba(245,245,247,.50); }
      .ca-row-num {
        text-align: right;
        font-variant-numeric: tabular-nums;
        font-weight: 950;
        letter-spacing: -0.03em;
      }
      .ca-row-num .spent { color: ${POINT}; }
      .ca-row-num .gain { color: #2C9F60; margin-top: 3px; }
      .ca-result-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 12px;
      }
      .ca-result-head h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 950;
        letter-spacing: -0.045em;
      }
      .ca-download {
        border: 0;
        border-radius: 999px;
        padding: 9px 12px;
        cursor: pointer;
        background: rgba(254,69,50,.12);
        color: ${POINT};
        font-weight: 900;
      }
      .ca-toast {
        margin-top: 10px;
        font-size: 12px;
        color: rgba(30,30,32,.48);
        font-weight: 750;
        letter-spacing: -0.02em;
      }
      body[data-theme="dark"] .ca-toast { color: rgba(245,245,247,.45); }

      .ca-result .spent { color: ${POINT}; }
      .ca-result .gain { color: #2C9F60; }
      .ca-view-tabs {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 5px;
        padding: 4px;
        border-radius: 16px;
        background: rgba(118,118,128,.13);
        margin-bottom: 12px;
      }
      body[data-theme="dark"] .ca-view-tabs { background: rgba(255,255,255,.08); }
      .ca-view-tab {
        min-height: 34px;
        border: 0;
        border-radius: 14px;
        cursor: pointer;
        background: transparent;
        color: inherit;
        font-size: 14px;
        font-weight: 950;
        letter-spacing: -0.03em;
      }
      .ca-view-tab.is-on {
        background: ${POINT};
        color: white;
        box-shadow: 0 10px 22px rgba(254,69,50,.22);
      }
      .ca-view-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .ca-view-content .ca-empty { min-height: 140px; }
      .ca-calendar-stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .ca-calendar-nav {
        display: grid;
        grid-template-columns: 42px 1fr 42px;
        gap: 8px;
        align-items: center;
        border-radius: 20px;
        background: rgba(118,118,128,.10);
        padding: 8px;
      }
      body[data-theme="dark"] .ca-calendar-nav { background: rgba(255,255,255,.075); }
      .ca-month-nav {
        width: 42px;
        height: 42px;
        border: 0;
        border-radius: 15px;
        cursor: pointer;
        background: rgba(255,255,255,.72);
        color: inherit;
        font-size: 24px;
        font-weight: 950;
        line-height: 1;
      }
      body[data-theme="dark"] .ca-month-nav { background: rgba(255,255,255,.09); }
      .ca-month-nav:disabled {
        opacity: .28;
        cursor: not-allowed;
      }
      .ca-calendar-current {
        min-width: 0;
        text-align: center;
      }
      .ca-calendar-current strong {
        display: block;
        font-size: 17px;
        font-weight: 950;
        letter-spacing: -0.045em;
      }
      .ca-calendar-current span {
        display: block;
        margin-top: 2px;
        font-size: 11px;
        opacity: .50;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .ca-month-card,
      .ca-detail-card {
        border-radius: 20px;
        background: rgba(118,118,128,.10);
      }
      body[data-theme="dark"] .ca-month-card,
      body[data-theme="dark"] .ca-detail-card { background: rgba(255,255,255,.075); }
      .ca-month-card { padding: 12px; }
      .ca-month-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        font-weight: 950;
        letter-spacing: -0.04em;
      }
      .ca-month-sub {
        font-size: 12px;
        opacity: .52;
        font-weight: 800;
      }
      .ca-weekdays,
      .ca-calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 6px;
      }
      .ca-weekdays { margin-bottom: 6px; }
      .ca-weekday {
        text-align: center;
        font-size: 11px;
        opacity: .46;
        font-weight: 900;
      }
      .ca-day,
      .ca-day-placeholder {
        min-height: 78px;
        box-sizing: border-box;
        border-radius: 15px;
      }
      .ca-day {
        border: 0;
        padding: 8px;
        text-align: left;
        cursor: pointer;
        color: inherit;
        background: rgba(255,255,255,.70);
        box-shadow: inset 0 0 0 1px rgba(0,0,0,.035);
        font-variant-numeric: tabular-nums;
      }
      body[data-theme="dark"] .ca-day {
        background: rgba(255,255,255,.07);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.055);
      }
      .ca-day.is-out {
        opacity: .22;
        cursor: default;
      }
      .ca-day.is-empty:not(.is-out) { opacity: .72; }
      .ca-day.has-rows {
        background: rgba(255,255,255,.86);
      }
      body[data-theme="dark"] .ca-day.has-rows { background: rgba(255,255,255,.105); }
      .ca-day.is-selected {
        outline: 2px solid ${POINT};
        outline-offset: 0;
        background: rgba(254,69,50,.10);
      }
      .ca-day-top {
        display: flex;
        justify-content: space-between;
        gap: 4px;
        align-items: flex-start;
      }
      .ca-day-num {
        font-size: 14px;
        font-weight: 950;
        letter-spacing: -0.03em;
      }
      .ca-day-count {
        font-size: 10px;
        opacity: .50;
        font-weight: 900;
        white-space: nowrap;
      }
      .ca-day-money {
        min-height: 27px;
        margin-top: 7px;
        font-size: 11px;
        line-height: 1.18;
        font-weight: 950;
        letter-spacing: -0.03em;
      }
      .ca-day-money .gain { margin-top: 2px; }
      .ca-day-money .is-placeholder {
        visibility: hidden;
      }
      .ca-detail-card {
        padding: 14px;
      }
      .ca-detail-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 10px;
      }
      .ca-detail-title {
        font-size: 16px;
        font-weight: 950;
        letter-spacing: -0.045em;
      }
      .ca-detail-meta {
        margin-top: 3px;
        font-size: 12px;
        opacity: .52;
        font-weight: 800;
      }
      @media (max-width: 620px) {
        .ca-overlay {
          align-items: stretch;
          padding: 8px;
        }
        .ca-sheet {
          width: calc(100vw - 16px);
          max-height: calc(100vh - 16px);
          border-radius: 24px;
        }
        .ca-top { padding: 17px 17px 11px; }
        .ca-body { padding: 0 17px 17px; }
        .ca-card { padding: 14px; }
        .ca-field label { font-size: 11px; }
        .ca-speed-help {
          font-size: 10px;
          margin-bottom: 8px;
        }
        .ca-date {
          height: 42px;
          border-radius: 14px;
          padding: 0 10px;
          font-size: 13px;
          letter-spacing: -0.04em;
        }
        .ca-actions { margin-top: 12px; }
        .ca-primary,
        .ca-ghost {
          height: 40px;
          border-radius: 14px;
          font-size: 14px;
        }
        .ca-view-tabs {
          padding: 4px;
          border-radius: 15px;
          margin-bottom: 10px;
        }
        .ca-view-tab {
          min-height: 32px;
          border-radius: 11px;
          font-size: 13px;
        }

        .ca-title { font-size: 22px; }
        .ca-logo {
          width: 44px;
          height: 44px;
          border-radius: 15px;
        }
        .ca-result-head h3 { font-size: 17px; }
        .ca-download {
          padding: 9px 11px;
          white-space: nowrap;
        }
        .ca-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .ca-stat-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .ca-stat {
          min-height: 66px;
          border-radius: 18px;
          padding: 11px 8px;
        }
        .ca-stat span {
          font-size: 10px;
          white-space: nowrap;
        }
        .ca-stat strong {
          margin-top: 7px;
          font-size: 18px;
          letter-spacing: -0.055em;
        }
        .ca-calendar-stack { gap: 10px; }
        .ca-calendar-nav {
          grid-template-columns: 38px 1fr 38px;
          gap: 6px;
          border-radius: 18px;
          padding: 6px;
        }
        .ca-month-nav {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          font-size: 22px;
        }
        .ca-calendar-current strong { font-size: 16px; }
        .ca-calendar-current span { font-size: 10px; }
        .ca-month-card {
          padding: 9px 7px;
          border-radius: 18px;
        }
        .ca-weekdays,
        .ca-calendar-grid { gap: 4px; }
        .ca-weekday { font-size: 10px; }
        .ca-day,
        .ca-day-placeholder {
          min-height: 68px;
          border-radius: 13px;
        }
        .ca-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6px 2px;
          text-align: center;
        }
        .ca-day-top {
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }
        .ca-day-num { font-size: 15px; }
        .ca-day-count {
          display: none;
        }
        .ca-day.has-rows .ca-day-num::after {
          content: none;
          display: none;
        }
        .ca-day-money {
          display: block;
          width: 100%;
          min-height: 26px;
          margin-top: 4px;
          font-size: 9.5px;
          line-height: 1.18;
          font-weight: 950;
          letter-spacing: -0.055em;
          text-align: center;
          white-space: nowrap;
        }
        .ca-day-money .gain { margin-top: 1px; }
        .ca-day-money .ca-money-sign { display: none; }
        .ca-day-money .spent,
        .ca-day-money .gain {
          overflow: hidden;
          text-overflow: clip;
        }
        .ca-detail-card {
          border-radius: 18px;
          padding: 12px;
        }
        .ca-detail-title { font-size: 15px; }
        .ca-detail-meta { font-size: 11px; }
        .ca-row {
          border-radius: 16px;
          padding: 12px;
        }
        .ca-row-title { font-size: 14px; }
        .ca-row-sub { font-size: 11px; }
        .ca-row-num { font-size: 14px; }
      }

      @media (max-width: 380px) {
        .ca-body { padding: 0 12px 12px; }
        .ca-top { padding: 15px 12px 10px; }
        .ca-card { padding: 12px; }
        .ca-grid { gap: 7px; }
        .ca-date {
          height: 38px;
          border-radius: 12px;
          padding: 0 5px;
          font-size: 11.5px;
        }
        .ca-primary,
        .ca-ghost { height: 38px; }
        .ca-view-tab { min-height: 30px; }
        .ca-stat-grid { gap: 6px; }
        .ca-stat {
          min-height: 62px;
          padding: 10px 6px;
          border-radius: 16px;
        }
        .ca-stat span { font-size: 9px; }
        .ca-stat strong { font-size: 16px; }
        .ca-month-card { padding: 8px 6px; }
        .ca-weekdays,
        .ca-calendar-grid { gap: 3px; }
        .ca-day,
        .ca-day-placeholder {
          min-height: 62px;
          border-radius: 12px;
        }
        .ca-day-num { font-size: 14px; }
        .ca-day-money {
          min-height: 24px;
          font-size: 8.7px;
          letter-spacing: -0.065em;
        }
      }

      @media (max-width: 340px) {
        .ca-body { padding: 0 10px 10px; }
        .ca-top { padding: 13px 10px 9px; }
        .ca-card { padding: 10px; }
        .ca-date {
          height: 36px;
          font-size: 11px;
          padding: 0 4px;
        }
      }
    `);
  }

  function kstDateString(date) {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date instanceof Date ? date : new Date(date));
  }

  function safeKstDateString(date) {
    try {
      if (!date) return null;
      const parsed = date instanceof Date ? date : new Date(date);
      if (Number.isNaN(parsed.getTime())) return null;
      return kstDateString(parsed);
    } catch (_) {
      return null;
    }
  }

  function kstTimeString(iso) {
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function extractAccessToken() {
    return document.cookie
      .split(";")
      .map((v) => v.trim().split("="))
      .find(([k]) => k === "access_token")?.[1] || null;
  }

  function extractQuantity(row) {
    if (row.quantity != null) return Number(row.quantity) || 0;
    if (row.product === "cracker") return Number(row?.balance?.total) || 0;
    if (row.product === "superchat") return (Number(row?.balance?.total) || 0) * 35;
    return Number(row?.balance?.total) || 0;
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("ko-KR");
  }

  function csvEscape(value) {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
  }

  function setResultHTML(html) {
    const result = document.querySelector(".ca-result");
    if (result) result.innerHTML = html;
  }

  function setLoading(message = "알리바이 확인 중...", subMessage = "기록 금고 뒤지는 중") {
    setResultHTML(`
      <div class="ca-loading">
        <div class="ca-spinner"></div>
        <div id="ca-loading-main">${escapeHTML(message)}</div>
        <div id="ca-loading-sub" style="font-size:12px; opacity:.72;">${escapeHTML(subMessage)}</div>
      </div>
    `);
  }

  function setProgress(message, subMessage = "") {
    const main = document.querySelector("#ca-loading-main");
    const sub = document.querySelector("#ca-loading-sub");

    if (main) main.textContent = message;
    if (sub) sub.textContent = subMessage;
  }

  function setEmpty(message = "날짜를 고르고 검사하면 여기에 알리바이가 뜸") {
    setResultHTML(`
      <div class="ca-empty">
        <div style="font-size:34px; line-height:1;">🧾</div>
        <div>${message}</div>
      </div>
    `);
  }

  function getTargetRange() {
    const startInput = document.querySelector("#ca-start-date");
    const endInput = document.querySelector("#ca-end-date");
    let start = startInput?.value;
    let end = endInput?.value;

    if (!start || !end) throw new Error("시작일과 종료일을 둘 다 골라줘.");
    if (start > end) [start, end] = [end, start];
    return { start, end };
  }

  async function fetchPage(page, token, signal) {
    const url = `${API}?limit=${PAGE_LIMIT}&type=all&page=${page}`;
    let retry = 0;

    while (retry < 5) {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal,
        });

        const text = await res.text();
        let json = null;

        try {
          json = text ? JSON.parse(text) : null;
        } catch (_) {
          json = { rawText: text };
        }

        const rows = Array.isArray(json?.data) ? json.data : [];
        const dates = rows.map((r) => safeKstDateString(r.date)).filter(Boolean).sort();

        return {
          page,
          ok: res.ok,
          status: res.status,
          json,
          rows,
          newest: dates[dates.length - 1] || null,
          oldest: dates[0] || null,
        };
      } catch (error) {
        if (error.name === "AbortError") throw error;
        retry++;
        if (retry >= 5) throw error;
        await sleep(650);
      }
    }
  }

  function summarizeRows(rows) {
    const map = new Map();

    for (const row of rows) {
      const title = row.title || "제목 없음";
      const quantity = extractQuantity(row);
      const prev = map.get(title) || { title, consumed: 0, acquired: 0, count: 0 };

      if (row.isConsumed) prev.consumed += quantity;
      else prev.acquired += quantity;
      prev.count += 1;

      map.set(title, prev);
    }

    return [...map.values()].sort((a, b) => b.consumed - a.consumed || b.acquired - a.acquired || b.count - a.count);
  }


  function parseYMD(ymd) {
    const [year, month, day] = String(ymd || "").split("-").map(Number);
    return { year, month, day };
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function makeYMD(year, month, day) {
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  function getDayOfWeek(ymd) {
    const { year, month, day } = parseYMD(ymd);
    return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  }

  function getDateLabel(ymd) {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const { year, month, day } = parseYMD(ymd);
    return `${year}.${pad2(month)}.${pad2(day)} (${days[getDayOfWeek(ymd)]})`;
  }

  function getMonthsBetween(start, end) {
    const s = parseYMD(start);
    const e = parseYMD(end);
    const months = [];
    let year = s.year;
    let month = s.month;

    while (year < e.year || (year === e.year && month <= e.month)) {
      months.push({ year, month });
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    return months;
  }

  function makeMonthKey(year, month) {
    return `${year}-${pad2(month)}`;
  }

  function parseMonthKey(monthKey) {
    const [year, month] = String(monthKey || "").split("-").map(Number);
    return { year, month };
  }

  function addMonthsToKey(monthKey, delta) {
    const { year, month } = parseMonthKey(monthKey);
    const date = new Date(Date.UTC(year, month - 1 + delta, 1));
    return makeMonthKey(date.getUTCFullYear(), date.getUTCMonth() + 1);
  }

  function getRangeMonthKeys() {
    return getMonthsBetween(lastRangeStart, lastRangeEnd).map(({ year, month }) => makeMonthKey(year, month));
  }

  function clampMonthKey(monthKey) {
    const months = getRangeMonthKeys();
    if (!months.length) return monthKey;
    if (!monthKey) return months[months.length - 1];
    if (monthKey < months[0]) return months[0];
    if (monthKey > months[months.length - 1]) return months[months.length - 1];
    return monthKey;
  }

  function pickDefaultCalendarDate(monthKey, byDate) {
    const datesWithRows = [...byDate.keys()]
      .filter((date) => date >= lastRangeStart && date <= lastRangeEnd && date.startsWith(`${monthKey}-`))
      .sort((a, b) => b.localeCompare(a));

    if (datesWithRows[0]) return datesWithRows[0];

    const { year, month } = parseMonthKey(monthKey);
    const monthStart = makeYMD(year, month, 1);
    const monthEnd = makeYMD(year, month, daysInMonth(year, month));
    const start = monthStart < lastRangeStart ? lastRangeStart : monthStart;
    const end = monthEnd > lastRangeEnd ? lastRangeEnd : monthEnd;

    return start <= end ? start : monthStart;
  }

  function ensureCalendarState(byDate) {
    const months = getRangeMonthKeys();
    if (!months.length) {
      return { monthKey: "", selectedDate: lastRangeEnd };
    }

    if (!currentCalendarMonth) {
      const datesWithRows = [...byDate.keys()]
        .filter((date) => date >= lastRangeStart && date <= lastRangeEnd)
        .sort((a, b) => b.localeCompare(a));
      currentCalendarMonth = (datesWithRows[0] || lastRangeEnd || lastRangeStart).slice(0, 7);
    }

    currentCalendarMonth = clampMonthKey(currentCalendarMonth);

    if (
      !selectedCalendarDate ||
      !selectedCalendarDate.startsWith(`${currentCalendarMonth}-`) ||
      selectedCalendarDate < lastRangeStart ||
      selectedCalendarDate > lastRangeEnd
    ) {
      selectedCalendarDate = pickDefaultCalendarDate(currentCalendarMonth, byDate);
    }

    return { monthKey: currentCalendarMonth, selectedDate: selectedCalendarDate };
  }

  function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  function getRowsByDateMap(rows = lastRawRows) {
    const map = new Map();

    for (const row of rows) {
      const date = row.kstDate || safeKstDateString(row.date);
      if (!date) continue;
      if (!map.has(date)) map.set(date, []);
      map.get(date).push(row);
    }

    for (const list of map.values()) {
      list.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    }

    return map;
  }

  function sumRows(rows) {
    return rows.reduce((acc, row) => {
      const quantity = row.alibiQuantity != null ? Number(row.alibiQuantity) || 0 : extractQuantity(row);
      if (row.isConsumed) acc.consumed += quantity;
      else acc.acquired += quantity;
      acc.count += 1;
      return acc;
    }, { consumed: 0, acquired: 0, count: 0 });
  }

  function buildAmountHTML(consumed, acquired, zeroHTML = "<div>0</div>") {
    const spentHTML = consumed > 0
      ? `<div class="spent">-${formatNumber(consumed)}</div>`
      : "";
    const gainHTML = acquired > 0
      ? `<div class="gain">+${formatNumber(acquired)}</div>`
      : "";

    return spentHTML || gainHTML ? `${spentHTML}${gainHTML}` : zeroHTML;
  }

  function buildCompactAmountHTML(consumed, acquired) {
    if (!(consumed > 0) && !(acquired > 0)) return "";

    const spentHTML = consumed > 0
      ? `<div class="spent"><span class="ca-money-sign">-</span>${formatNumber(consumed)}</div>`
      : `<div class="spent is-placeholder">0</div>`;
    const gainHTML = acquired > 0
      ? `<div class="gain"><span class="ca-money-sign">+</span>${formatNumber(acquired)}</div>`
      : `<div class="gain is-placeholder">0</div>`;

    return `<div class="ca-day-money">${spentHTML}${gainHTML}</div>`;
  }

  function buildSummaryRowsHTML(summaryRows) {
    if (!summaryRows.length) {
      return `
        <div class="ca-empty">
          <div style="font-size:30px; line-height:1;">🧾</div>
          <div>내역 없음</div>
        </div>
      `;
    }

    const rowsHTML = summaryRows.map((row) => `
      <div class="ca-row" title="${escapeHTML(row.title)}">
        <div>
          <div class="ca-row-title">${escapeHTML(row.title)}</div>
          <div class="ca-row-sub">내역 ${formatNumber(row.count)}개</div>
        </div>
        <div class="ca-row-num">${buildAmountHTML(row.consumed, row.acquired)}</div>
      </div>
    `).join("");

    return `<div class="ca-list">${rowsHTML}</div>`;
  }

  function buildDayDetailHTML(date, rows) {
    const totals = sumRows(rows);
    const summaryRows = summarizeRows(rows);
    const amountHTML = buildAmountHTML(totals.consumed, totals.acquired, "<div>0</div>");

    return `
      <div class="ca-detail-card">
        <div class="ca-detail-head">
          <div>
            <div class="ca-detail-title">${escapeHTML(getDateLabel(date))}</div>
            <div class="ca-detail-meta">내역 ${formatNumber(totals.count)}개</div>
          </div>
          <div class="ca-row-num">${amountHTML}</div>
        </div>
        ${buildSummaryRowsHTML(summaryRows)}
      </div>
    `;
  }

  function buildSummaryViewHTML() {
    return buildSummaryRowsHTML(lastSummaryRows);
  }

  function buildCalendarMonthHTML(year, month, byDate, selectedDate) {
    const firstYMD = makeYMD(year, month, 1);
    const firstDow = getDayOfWeek(firstYMD);
    const totalDays = daysInMonth(year, month);
    const cells = [];

    for (let i = 0; i < firstDow; i++) {
      cells.push(`<div class="ca-day-placeholder"></div>`);
    }

    for (let day = 1; day <= totalDays; day++) {
      const ymd = makeYMD(year, month, day);
      const rows = byDate.get(ymd) || [];
      const totals = sumRows(rows);
      const inRange = ymd >= lastRangeStart && ymd <= lastRangeEnd;
      const hasRows = rows.length > 0;
      const selected = ymd === selectedDate;
      const className = [
        "ca-day",
        inRange ? "" : "is-out",
        hasRows ? "has-rows" : "is-empty",
        selected ? "is-selected" : "",
      ].filter(Boolean).join(" ");

      const innerHTML = `
        <div class="ca-day-top">
          <div class="ca-day-num">${day}</div>
          ${hasRows ? `<div class="ca-day-count">${formatNumber(rows.length)}개</div>` : ""}
        </div>
        ${buildCompactAmountHTML(totals.consumed, totals.acquired)}
      `;

      if (inRange) {
        cells.push(`<button type="button" class="${className}" data-date="${ymd}">${innerHTML}</button>`);
      } else {
        cells.push(`<div class="${className}">${innerHTML}</div>`);
      }
    }

    return `
      <div class="ca-month-card">
        <div class="ca-weekdays">
          ${["일", "월", "화", "수", "목", "금", "토"].map((day) => `<div class="ca-weekday">${day}</div>`).join("")}
        </div>
        <div class="ca-calendar-grid">${cells.join("")}</div>
      </div>
    `;
  }

  function buildCalendarViewHTML() {
    const byDate = getRowsByDateMap();
    const state = ensureCalendarState(byDate);
    const monthKey = state.monthKey;
    const selectedDate = state.selectedDate;
    const { year, month } = parseMonthKey(monthKey);
    const months = getRangeMonthKeys();
    const firstMonth = months[0];
    const lastMonth = months[months.length - 1];
    const prevMonth = addMonthsToKey(monthKey, -1);
    const nextMonth = addMonthsToKey(monthKey, 1);
    const canPrev = prevMonth >= firstMonth;
    const canNext = nextMonth <= lastMonth;
    const monthRows = [...byDate.entries()]
      .filter(([date]) => date.startsWith(`${year}-${pad2(month)}-`))
      .flatMap(([, rows]) => rows);
    const monthTotals = sumRows(monthRows);

    return `
      <div class="ca-calendar-stack">
        <div class="ca-calendar-nav">
          <button type="button" class="ca-month-nav" id="ca-calendar-prev" aria-label="이전 달" ${canPrev ? "" : "disabled"}>‹</button>
          <div class="ca-calendar-current">
            <strong>${year}년 ${month}월</strong>
            <span>이번 달 이용내역 ${formatNumber(monthTotals.count)}개</span>
          </div>
          <button type="button" class="ca-month-nav" id="ca-calendar-next" aria-label="다음 달" ${canNext ? "" : "disabled"}>›</button>
        </div>
        ${buildCalendarMonthHTML(year, month, byDate, selectedDate)}
        <div id="ca-calendar-detail">${buildDayDetailHTML(selectedDate, byDate.get(selectedDate) || [])}</div>
      </div>
    `;
  }


  function renderViewContent(view = currentResultView) {
    currentResultView = view;

    document.querySelectorAll(".ca-view-tab").forEach((button) => {
      button.classList.toggle("is-on", button.dataset.view === view);
    });

    const content = document.querySelector("#ca-view-content");
    if (!content) return;

    if (view === "calendar") {
      content.innerHTML = buildCalendarViewHTML();
      bindCalendarEvents();
      return;
    }


    content.innerHTML = buildSummaryViewHTML();
  }

  function bindResultTabs() {
    document.querySelectorAll(".ca-view-tab").forEach((button) => {
      button.addEventListener("click", () => renderViewContent(button.dataset.view));
    });
  }

  function bindCalendarEvents() {
    const byDate = getRowsByDateMap();
    const detail = document.querySelector("#ca-calendar-detail");

    document.querySelector("#ca-calendar-prev")?.addEventListener("click", () => {
      currentCalendarMonth = addMonthsToKey(currentCalendarMonth, -1);
      selectedCalendarDate = "";
      renderViewContent("calendar");
    });

    document.querySelector("#ca-calendar-next")?.addEventListener("click", () => {
      currentCalendarMonth = addMonthsToKey(currentCalendarMonth, 1);
      selectedCalendarDate = "";
      renderViewContent("calendar");
    });

    document.querySelectorAll(".ca-day[data-date]").forEach((button) => {
      button.addEventListener("click", () => {
        const date = button.dataset.date;
        selectedCalendarDate = date;
        document.querySelectorAll(".ca-day.is-selected").forEach((el) => el.classList.remove("is-selected"));
        button.classList.add("is-selected");
        if (detail) detail.innerHTML = buildDayDetailHTML(date, byDate.get(date) || []);
      });
    });
  }


  async function searchAlibi({ start, end, speedKey, signal }) {
    const token = extractAccessToken();
    if (!token) throw new Error("access_token을 못 찾음. 크랙에 다시 로그인하거나 새로고침해줘.");

    const speed = SPEEDS[speedKey] || SPEEDS.express;
    const cache = new Map();
    let requestCount = 0;

    async function getPage(pageNumber, mainMessage = "페이지 확인 중", subMessage = "") {
      if (cache.has(pageNumber)) return cache.get(pageNumber);

      if (requestCount > 0 && speed.delay > 0) await sleep(speed.delay);
      requestCount++;

      setProgress(
        mainMessage,
        subMessage || `page ${pageNumber} 확인 중 · 요청 ${formatNumber(requestCount)}회`
      );

      const page = await fetchPage(pageNumber, token, signal);

      if (!page.ok) {
        throw new Error(`API 오류 ${page.status}: ${JSON.stringify(page.json).slice(0, 180)}`);
      }

      cache.set(pageNumber, page);
      return page;
    }

    function pageHasRows(page) {
      return Array.isArray(page?.rows) && page.rows.length > 0;
    }

    // 1) 선택한 종료일(end) 근처까지 빠르게 이동.
    //    예전 코드는 jump로 대충 이동한 뒤 그 다음부터 1페이지씩 걸어갔음.
    //    이 버전은 jump로 큰 범위를 잡고, 그 안에서 이진 탐색으로 첫 후보 페이지를 찾음.
    async function findFirstCandidatePage() {
      const first = await getPage(1, "범위 위치 찾는 중", `${end} 근처를 찾는 중 · page 1`);

      if (!pageHasRows(first)) return null;
      if (first.oldest <= end) return 1;
      if (first.newest < start) return null;

      let low = 1; // 여기는 아직 전부 end보다 최신인 페이지
      let high = null; // 여기는 end에 닿았거나, 기록이 끝난 페이지
      let step = speed.jump;

      while (low < MAX_PAGE) {
        const candidate = Math.min(MAX_PAGE, low + step);
        const page = await getPage(
          candidate,
          "범위 위치 찾는 중",
          `${end} 근처를 점프 탐색 중 · page ${formatNumber(candidate)}`
        );

        if (!pageHasRows(page) || page.oldest <= end || page.newest < start) {
          high = candidate;
          break;
        }

        low = candidate;
        step = Math.min(step * 2, speed.jump * 8);
      }

      if (high == null) return null;

      let left = low + 1;
      let right = high;

      while (left < right) {
        const mid = Math.floor((left + right) / 2);
        const page = await getPage(
          mid,
          "범위 좁히는 중",
          `${end} 근처를 이진 탐색 중 · page ${formatNumber(mid)}`
        );

        if (!pageHasRows(page) || page.oldest <= end || page.newest < start) {
          right = mid;
        } else {
          left = mid + 1;
        }
      }

      const candidatePage = await getPage(left, "범위 확인 중", `첫 후보 page ${formatNumber(left)} 확인 중`);
      if (!pageHasRows(candidatePage)) return null;

      return left;
    }

    // 2) 선택한 시작일(start)을 지나치기 전 마지막 후보 페이지를 찾음.
    //    기간이 넓으면 어차피 그 기간의 모든 페이지를 읽어야 해서 시간이 걸림.
    //    그래도 기간 앞뒤의 쓸데없는 페이지는 최대한 안 읽게 함.
    async function findLastCandidatePage(firstPageNumber) {
      const first = await getPage(
        firstPageNumber,
        "범위 끝 찾는 중",
        `첫 후보 page ${formatNumber(firstPageNumber)} 확인 중`
      );

      if (!pageHasRows(first)) return firstPageNumber - 1;
      if (first.newest < start) return firstPageNumber - 1;

      let low = firstPageNumber; // 아직 start보다 오래되지 않은 페이지
      let high = null; // start보다 오래됐거나, 기록이 끝난 페이지
      let step = speed.jump;

      while (low < MAX_PAGE) {
        const candidate = Math.min(MAX_PAGE, low + step);
        const page = await getPage(
          candidate,
          "범위 끝 찾는 중",
          `${start} 이전으로 넘어가는 지점 탐색 중 · page ${formatNumber(candidate)}`
        );

        if (!pageHasRows(page) || page.newest < start) {
          high = candidate;
          break;
        }

        low = candidate;
        step = Math.min(step * 2, speed.jump * 8);
      }

      if (high == null) return low;

      let left = low;
      let right = high;

      while (left + 1 < right) {
        const mid = Math.floor((left + right) / 2);
        const page = await getPage(
          mid,
          "범위 끝 좁히는 중",
          `${start} 이전으로 넘어가는 지점 이진 탐색 중 · page ${formatNumber(mid)}`
        );

        if (pageHasRows(page) && page.newest >= start) {
          left = mid;
        } else {
          right = mid;
        }
      }

      return left;
    }

    setProgress("범위 찾는 중", `${start} ~ ${end} 기록 위치 계산 중`);

    const firstPage = await findFirstCandidatePage();
    if (!firstPage) return [];

    const lastPage = await findLastCandidatePage(firstPage);
    if (lastPage < firstPage) return [];

    const found = [];
    const totalPages = lastPage - firstPage + 1;

    for (let pageNumber = firstPage; pageNumber <= lastPage; pageNumber++) {
      const current = pageNumber - firstPage + 1;
      const page = await getPage(
        pageNumber,
        "내역 수집 중",
        `${formatNumber(current)} / ${formatNumber(totalPages)}페이지 읽는 중 · 실제 page ${formatNumber(pageNumber)}`
      );

      if (!pageHasRows(page)) break;
      if (page.newest < start) break;

      for (const row of page.rows) {
        const kstDate = safeKstDateString(row.date);
        if (!kstDate) continue;
        if (kstDate < start || kstDate > end) continue;

        found.push({
          ...row,
          kstDate,
          kstTime: kstTimeString(row.date),
          alibiQuantity: extractQuantity(row),
        });
      }
    }

    return found;
  }

  function renderResults(rawRows, start, end) {
    lastRawRows = rawRows;
    lastSummaryRows = summarizeRows(rawRows);
    lastRangeStart = start;
    lastRangeEnd = end;
    currentResultView = "summary";
    currentCalendarMonth = "";
    selectedCalendarDate = "";

    const totals = sumRows(rawRows);
    const period = start === end ? start : `${start} ~ ${end}`;

    if (rawRows.length === 0) {
      setEmpty(`${period} 알리바이 없음`);
      return;
    }

    setResultHTML(`
      <div class="ca-result-head">
        <h3>${period}</h3>
        <button type="button" class="ca-download" id="ca-download-csv">CSV 저장</button>
      </div>
      <div class="ca-view-tabs" role="tablist" aria-label="결과 보기 방식">
        <button type="button" class="ca-view-tab is-on" data-view="summary" role="tab">전체</button>
        <button type="button" class="ca-view-tab" data-view="calendar" role="tab">달력</button>
      </div>
      <div class="ca-stat-grid">
        <div class="ca-stat"><span>총 사용량</span><strong class="spent">-${formatNumber(totals.consumed)}</strong></div>
        <div class="ca-stat"><span>총 획득량</span><strong class="gain">+${formatNumber(totals.acquired)}</strong></div>
        <div class="ca-stat"><span>내역 수</span><strong>${formatNumber(rawRows.length)}</strong></div>
      </div>
      <div id="ca-view-content" class="ca-view-content"></div>
      <div class="ca-toast">KST 기준. 슈퍼챗은 붉은약 계산식처럼 35배 환산.</div>
    `);

    bindResultTabs();
    renderViewContent("summary");
    document.querySelector("#ca-download-csv")?.addEventListener("click", downloadCSV);
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function downloadCSV() {
    const header = ["KST Date", "KST Time", "Title", "IsConsumed", "Quantity", "Product", "ConsumedType", "OriginalDate"];
    const lines = [header.map(csvEscape).join(",")];

    for (const row of lastRawRows) {
      lines.push([
        row.kstDate,
        row.kstTime,
        row.title || "",
        row.isConsumed,
        row.alibiQuantity,
        row.product || "",
        row.consumedType || "",
        row.date || "",
      ].map(csvEscape).join(","));
    }

    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `crack_alibi_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function setSearchingUI(searching) {
    isSearching = searching;
    const run = document.querySelector("#ca-run");
    const stop = document.querySelector("#ca-stop");
    const speedButtons = document.querySelectorAll(".ca-speed-btn");
    const dates = document.querySelectorAll(".ca-date");

    if (run) {
      run.disabled = searching;
      run.textContent = searching ? "검사 중..." : "검사";
    }
    if (stop) stop.style.display = searching ? "inline-block" : "none";
    speedButtons.forEach((b) => b.disabled = searching);
    dates.forEach((d) => d.disabled = searching);
  }

  async function runSearch() {
    if (isSearching) return;

    let range;
    try {
      range = getTargetRange();
    } catch (error) {
      setEmpty(error.message);
      return;
    }

    currentAborter = new AbortController();
    setSearchingUI(true);
    setLoading();

    try {
      const rows = await searchAlibi({
        start: range.start,
        end: range.end,
        speedKey: currentSpeed,
        signal: currentAborter.signal,
      });
      renderResults(rows, range.start, range.end);
    } catch (error) {
      if (error.name === "AbortError") {
        setEmpty("검사 중지됨");
      } else {
        setEmpty(`오류: ${escapeHTML(error.message)}`);
        console.error("[Crack Alibi]", error);
      }
    } finally {
      setSearchingUI(false);
      currentAborter = null;
    }
  }

  function stopSearch() {
    if (currentAborter) currentAborter.abort();
  }

  function openAlibi() {
    document.querySelector(".ca-overlay")?.remove();

    const today = kstDateString(new Date());
    const overlay = document.createElement("div");
    overlay.className = "ca-overlay";
    overlay.innerHTML = `
      <div class="ca-sheet" role="dialog" aria-modal="true">
        <div class="ca-top">
          <div class="ca-brand">
            <div class="ca-logo">🧾</div>
            <div>
              <h2 class="ca-title">Alibi</h2>
              <div class="ca-subtitle">${ALIBI_VERSION}</div>
            </div>
          </div>
          <button type="button" class="ca-close" aria-label="닫기">×</button>
        </div>
        <div class="ca-body">
          <div class="ca-card">
            <div class="ca-grid">
              <div class="ca-field">
                <label for="ca-start-date">시작일</label>
                <input id="ca-start-date" class="ca-date" type="date" value="${today}">
              </div>
              <div class="ca-field">
                <label for="ca-end-date">종료일</label>
                <input id="ca-end-date" class="ca-date" type="date" value="${today}">
              </div>
            </div>
            <div class="ca-speed">
              <div class="ca-speed-title">조회 속도</div>
              <div class="ca-segment">
                ${Object.entries(SPEEDS).map(([key, speed]) => `
                  <button type="button" class="ca-speed-btn ${key === currentSpeed ? "is-on" : ""}" data-speed="${key}">
                    ${speed.label}<small>${speed.desc}</small>
                  </button>
                `).join("")}
              </div>
            </div>
            <div class="ca-actions">
              <button type="button" class="ca-primary" id="ca-run">검사</button>
              <button type="button" class="ca-ghost" id="ca-stop" style="display:none;">중지</button>
            </div>
          </div>
          <div class="ca-result ca-card"></div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    setEmpty();

    overlay.querySelector(".ca-close")?.addEventListener("click", () => {
      stopSearch();
      overlay.remove();
    });

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        stopSearch();
        overlay.remove();
      }
    });

    overlay.querySelectorAll(".ca-speed-btn").forEach((button) => {
      button.addEventListener("click", () => {
        currentSpeed = button.dataset.speed;
        overlay.querySelectorAll(".ca-speed-btn").forEach((b) => b.classList.remove("is-on"));
        button.classList.add("is-on");
      });
    });

    overlay.querySelector("#ca-run")?.addEventListener("click", runSearch);
    overlay.querySelector("#ca-stop")?.addEventListener("click", stopSearch);
  }

  function isPurchaseTablist(tablist) {
    if (!tablist || tablist.getAttribute("role") !== "tablist") return false;
    const text = tablist.innerText || "";
    return text.includes("일반 구매") && text.includes("자동 구매") && text.includes("무료로 받기");
  }

  function insertButton() {
    const tablists = [...document.querySelectorAll('div[role="tablist"]')];
    const target = tablists.find(isPurchaseTablist);

    if (!target) return;
    if (target.querySelector(".alibi-button")) return;

    target.style.maxWidth = "900px";

    const base = target.querySelector("button[role='tab']");
    const wrapper = document.createElement("div");
    wrapper.className = `alibi-button ${base?.className || ""}`.trim();
    wrapper.setAttribute("display", "flex");
    wrapper.style.flexBasis = "72px";
    wrapper.innerHTML = `
      <button type="button" aria-label="알리바이 열기">
        <p color="text_secondary">🧾 알리바이</p>
      </button>
    `;
    wrapper.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openAlibi();
    });

    target.appendChild(wrapper);
  }

  function setupObserver() {
    let pending = false;
    const tick = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        insertButton();
      });
    };

    tick();

    new MutationObserver(tick).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    const pushState = history.pushState;
    history.pushState = function (...args) {
      const result = pushState.apply(this, args);
      setTimeout(tick, 80);
      return result;
    };

    window.addEventListener("popstate", () => setTimeout(tick, 80));
  }

  addStyles();
  setupObserver();
})();

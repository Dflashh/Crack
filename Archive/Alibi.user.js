// ==UserScript==
// @name         Crack Alibi
// @namespace    https://github.com/Dflashh/Crack
// @version      1.3.3
// @description  선택한 기간의 크랙 사용 알리바이만 빠르게 조회합니다.
// @match        *://crack.wrtn.ai/*
// @author       깡통들과 나
// @connect      crack-api.wrtn.ai
// @icon         https://cdn.jsdelivr.net/gh/Dflashh/Crack@main/Icon/Alibi.webp
// @downloadURL  https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackAlibi.user.js
// @updateURL    https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackAlibi.user.js
// @require      https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js#sha256-lfTRy/CZ9XFhtmS8BIQm7D35JjeAGkx5EW6DMVqnh+c=
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  const ALIBI_VERSION = "v1.3.3";
  const POINT = "#FE4532";
  const API = "https://crack-api.wrtn.ai/crack-cash/crackers/history";
  const PAGE_LIMIT = 10;
  const MAX_PAGE = 20000;
  const LOOKBACK_YEARS = 1;
  const CACHE_DB_NAME = "CrackAlibiCache";
  const CACHE_DB_VERSION = 1;
  const CACHE_STORE = "cache";
  const LEGACY_CACHE_KEY = "main";
  const ACCOUNT_CACHE_PREFIX = "account:";
  const BACKUP_FORMAT = "CrackAlibiBackup";
  const BACKUP_VERSION = 2;
  const REDPILL_HISTORY_KEY = "chasmRedpillHistory";
  const REDPILL_COMPRESSION_KEY = "chasmRedpillCompressionStatus";
  const REDPILL_DB_NAME = "chasmRedpillDB";
  const REDPILL_DB_STORE = "keyValue";
  const REDPILL_DB_HISTORY_KEY = "redpillHistory";

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
  let lastResultNotice = "";
  let lastEmptyMessage = "";
  let activeSearchRange = null;
  let currentProgressMain = "알리바이 확인 중...";
  let currentProgressSub = "기록 금고 뒤지는 중";

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
      .ca-subtitle .ca-version {
        font-weight: 900;
      }
      .ca-subtitle .ca-limit-copy {
        margin-left: 7px;
        opacity: .86;
      }
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
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 82px;
        gap: 12px;
        align-items: end;
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
      .ca-record-btn {
        flex: 0 0 88px;
        width: 88px;
        height: 42px;
        border: 0;
        border-radius: 15px;
        cursor: pointer;
        padding: 0 14px;
        background: rgba(254,69,50,.12);
        color: ${POINT};
        font-size: 14px;
        font-weight: 950;
        letter-spacing: -0.03em;
      }
      .ca-record-btn:hover { background: rgba(254,69,50,.17); }
      .ca-record-btn:disabled { opacity: .48; cursor: not-allowed; }
      body[data-theme="dark"] .ca-record-btn { background: rgba(254,69,50,.16); }
      .ca-record-panel {
        margin-top: 12px;
        min-height: 0;
      }
      .ca-record-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }
      .ca-record-title {
        font-size: 17px;
        font-weight: 950;
        letter-spacing: -0.04em;
      }
      .ca-record-desc {
        margin-top: 4px;
        color: rgba(30,30,32,.50);
        font-size: 11px;
        line-height: 1.45;
        font-weight: 750;
      }
      body[data-theme="dark"] .ca-record-desc { color: rgba(245,245,247,.48); }
      .ca-record-close {
        width: 30px;
        height: 30px;
        border: 0;
        border-radius: 999px;
        cursor: pointer;
        background: rgba(118,118,128,.12);
        color: inherit;
        font-size: 15px;
        font-weight: 950;
        flex: 0 0 auto;
      }
      .ca-record-meta {
        display: grid;
        grid-template-columns: repeat(3, minmax(0,1fr));
        gap: 8px;
        margin-bottom: 10px;
      }
      .ca-record-stat {
        border-radius: 15px;
        padding: 10px;
        background: rgba(118,118,128,.10);
      }
      body[data-theme="dark"] .ca-record-stat { background: rgba(255,255,255,.075); }
      .ca-record-stat span {
        display: block;
        font-size: 10px;
        opacity: .52;
        font-weight: 850;
      }
      .ca-record-stat strong {
        display: block;
        margin-top: 4px;
        font-size: 14px;
        font-weight: 950;
        letter-spacing: -0.035em;
      }
      .ca-record-list {
        max-height: 230px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .ca-record-section-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 5px 2px 1px;
        color: rgba(30,30,32,.50);
        font-size: 10.5px;
        font-weight: 900;
        letter-spacing: -0.02em;
      }
      body[data-theme="dark"] .ca-record-section-label { color: rgba(245,245,247,.48); }
      .ca-record-range {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        box-sizing: border-box;
        border: 2px solid transparent;
        border-radius: 14px;
        padding: 9px 11px;
        background: rgba(118,118,128,.09);
        color: inherit;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
        font-size: 12px;
        font-weight: 850;
        transition: background .14s ease, border-color .14s ease, transform .14s ease;
      }
      .ca-record-range:hover { background: rgba(118,118,128,.14); }
      .ca-record-range:active { transform: scale(.995); }
      .ca-record-range.is-selected {
        border-color: ${POINT};
        background: rgba(254,69,50,.10);
      }
      .ca-record-range.is-redpill {
        background: rgba(254,69,50,.055);
      }
      .ca-record-range.is-redpill:hover {
        background: rgba(254,69,50,.095);
      }
      .ca-record-range.is-redpill.is-selected {
        background: rgba(254,69,50,.13);
      }
      body[data-theme="dark"] .ca-record-range { background: rgba(255,255,255,.065); }
      body[data-theme="dark"] .ca-record-range:hover { background: rgba(255,255,255,.10); }
      body[data-theme="dark"] .ca-record-range.is-selected { background: rgba(254,69,50,.15); }
      body[data-theme="dark"] .ca-record-range.is-redpill { background: rgba(254,69,50,.10); }
      body[data-theme="dark"] .ca-record-range.is-redpill:hover { background: rgba(254,69,50,.15); }
      .ca-record-range-main {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .ca-record-source-badge {
        display: inline-flex;
        align-items: center;
        min-height: 18px;
        border-radius: 999px;
        padding: 0 6px;
        flex: 0 0 auto;
        background: rgba(118,118,128,.13);
        color: rgba(30,30,32,.58);
        font-size: 9px;
        font-weight: 950;
      }
      .ca-record-source-badge.is-redpill {
        background: rgba(254,69,50,.12);
        color: ${POINT};
      }
      body[data-theme="dark"] .ca-record-source-badge {
        background: rgba(255,255,255,.09);
        color: rgba(245,245,247,.58);
      }
      body[data-theme="dark"] .ca-record-source-badge.is-redpill {
        background: rgba(254,69,50,.16);
        color: #ff7a6d;
      }
      .ca-record-range-side {
        display: flex;
        align-items: center;
        gap: 7px;
        flex: 0 0 auto;
      }
      .ca-record-range small { opacity: .50; font-weight: 800; white-space: nowrap; }
      .ca-record-check {
        width: 18px;
        height: 18px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        background: rgba(118,118,128,.14);
        color: transparent;
        font-size: 11px;
        font-weight: 950;
      }
      .ca-record-range.is-selected .ca-record-check {
        background: ${POINT};
        color: white;
      }
      .ca-record-empty {
        padding: 15px 8px;
        text-align: center;
        color: rgba(30,30,32,.48);
        font-size: 12px;
        font-weight: 800;
      }
      body[data-theme="dark"] .ca-record-empty { color: rgba(245,245,247,.46); }
      .ca-record-delete-box {
        display: none;
        margin-top: 10px;
        padding: 10px;
        border-radius: 15px;
        background: rgba(118,118,128,.08);
      }
      .ca-record-delete-box.is-on { display: block; }
      body[data-theme="dark"] .ca-record-delete-box { background: rgba(255,255,255,.06); }
      .ca-record-delete-title {
        margin-bottom: 7px;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: -0.02em;
      }
      .ca-record-delete-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px;
      }
      .ca-record-delete-field label {
        display: block;
        margin: 0 0 5px;
        font-size: 9px;
        opacity: .52;
        font-weight: 850;
      }
      .ca-record-delete-date {
        width: 100%;
        height: 34px;
        box-sizing: border-box;
        min-width: 0;
        border: 0;
        outline: none;
        border-radius: 11px;
        padding: 0 8px;
        background: rgba(255,255,255,.72);
        color: inherit;
        font-family: inherit;
        font-size: 11px;
        font-weight: 850;
        color-scheme: light;
      }
      body[data-theme="dark"] .ca-record-delete-date {
        background: rgba(255,255,255,.09);
        color-scheme: dark;
      }
      .ca-record-delete-hint {
        margin-top: 7px;
        font-size: 10px;
        line-height: 1.35;
        opacity: .50;
        font-weight: 750;
      }
      .ca-record-transfer,
      .ca-record-actions {
        display: flex;
        gap: 8px;
        margin-top: 10px;
      }
      .ca-record-transfer {
        padding-top: 10px;
        border-top: 1px solid rgba(118,118,128,.12);
      }
      body[data-theme="dark"] .ca-record-transfer {
        border-top-color: rgba(255,255,255,.08);
      }
      .ca-record-action {
        flex: 1;
        height: 36px;
        border: 0;
        border-radius: 13px;
        cursor: pointer;
        padding: 0 10px;
        background: rgba(118,118,128,.12);
        color: inherit;
        font-size: 12px;
        font-weight: 900;
      }
      .ca-record-legacy {
        margin-top: 12px;
        border-radius: 16px;
        padding: 12px;
        background: rgba(254,69,50,.10);
        color: ${POINT};
        font-size: 12px;
        font-weight: 800;
        line-height: 1.45;
      }
      .ca-record-legacy button {
        margin-top: 9px;
        min-height: 34px;
        border: 0;
        border-radius: 12px;
        padding: 0 12px;
        cursor: pointer;
        background: ${POINT};
        color: white;
        font-weight: 900;
      }
      body[data-theme="dark"] .ca-record-legacy { background: rgba(254,69,50,.14); }
      .ca-record-action.is-danger { color: ${POINT}; background: rgba(254,69,50,.10); }
      .ca-record-action:disabled { opacity: .45; cursor: not-allowed; }
      body[data-theme="dark"] .ca-record-action { background: rgba(255,255,255,.085); }
      body[data-theme="dark"] .ca-record-action.is-danger { background: rgba(254,69,50,.14); }
      .ca-record-redpill-info {
        margin-top: 10px;
        border-radius: 14px;
        padding: 9px 11px;
        background: rgba(254,69,50,.075);
        color: rgba(30,30,32,.66);
        font-size: 10.5px;
        line-height: 1.42;
        font-weight: 780;
      }
      body[data-theme="dark"] .ca-record-redpill-info {
        background: rgba(254,69,50,.11);
        color: rgba(245,245,247,.66);
      }
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
        box-shadow: 0 4px 10px rgba(254,69,50,.18);
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
        box-shadow: 0 5px 12px rgba(254,69,50,.20);
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
      .ca-limit-notice {
        margin: -2px 0 12px;
        border-radius: 16px;
        padding: 11px 12px;
        background: rgba(254,69,50,.10);
        color: ${POINT};
        font-size: 12px;
        font-weight: 850;
        letter-spacing: -0.02em;
        line-height: 1.38;
      }
      body[data-theme="dark"] .ca-limit-notice {
        background: rgba(254,69,50,.14);
      }
      .ca-result-notice {
        margin: 10px 0 0;
      }

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
        box-shadow: 0 4px 10px rgba(254,69,50,.16);
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
        .ca-record-btn { flex-basis: 82px; width: 82px; height: 40px; border-radius: 14px; }
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
        .ca-subtitle .ca-limit-copy {
          display: block;
          margin-left: 0;
          margin-top: 2px;
        }
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
        .ca-record-field { grid-column: 1 / -1; }
        .ca-record-meta { grid-template-columns: repeat(3, minmax(0, 1fr)); }
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
        .ca-record-btn { flex-basis: 74px; width: 74px; height: 38px; border-radius: 12px; padding: 0 10px; }
        .ca-record-meta { gap: 6px; }
        .ca-record-stat { padding: 9px 6px; }
        .ca-record-stat strong { font-size: 12px; }
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

  function decodeJwtPayload(token) {
    try {
      const decodedToken = decodeURIComponent(String(token || ""));
      const parts = decodedToken.split(".");
      if (parts.length !== 3) return null;

      let part = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      part += "=".repeat((4 - (part.length % 4)) % 4);

      const binary = atob(part);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (_) {
      return null;
    }
  }

  async function sha256Hex(value) {
    const bytes = new TextEncoder().encode(String(value));
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(hash)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("");
  }

  async function getCurrentAccountIdentity() {
    const token = extractAccessToken();
    if (!token) throw new Error("access_token을 못 찾음. 크랙에 다시 로그인하거나 새로고침해줘.");

    const payload = decodeJwtPayload(token);
    const rawId = payload?.id;
    if (rawId == null || rawId === "") {
      throw new Error("로그인 토큰에서 계정 id를 찾지 못함. 다시 로그인한 뒤 시도해줘.");
    }

    // raw id 자체는 저장하지 않고 해시만 계정 구분키로 사용.
    const hash = await sha256Hex(`CrackAlibiAccount:${String(rawId)}`);
    return {
      key: `${ACCOUNT_CACHE_PREFIX}${hash}`,
      hash,
      fingerprint: hash.slice(0, 12),
      idField: "id",
    };
  }

  function createEmptyCacheRecord(key = "") {
    return { key, ranges: [], rows: [], updatedAt: null };
  }

  function openCacheDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CACHE_DB_NAME, CACHE_DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          db.createObjectStore(CACHE_STORE, { keyPath: "key" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("기록 DB를 열 수 없음"));
    });
  }

  async function loadCacheByKey(key) {
    const db = await openCacheDB();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(CACHE_STORE, "readonly");
        const request = tx.objectStore(CACHE_STORE).get(key);
        request.onsuccess = () => resolve(request.result || createEmptyCacheRecord(key));
        request.onerror = () => reject(request.error || new Error("기록을 읽을 수 없음"));
      });
    } finally {
      db.close();
    }
  }

  async function loadCacheData(accountKey = "") {
    const key = accountKey || (await getCurrentAccountIdentity()).key;
    return loadCacheByKey(key);
  }

  async function saveCacheData(cache, accountKey = "") {
    const key = accountKey || (await getCurrentAccountIdentity()).key;
    const db = await openCacheDB();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(CACHE_STORE, "readwrite");
        tx.objectStore(CACHE_STORE).put({
          ...cache,
          key,
          updatedAt: new Date().toISOString(),
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error("기록을 저장할 수 없음"));
        tx.onabort = () => reject(tx.error || new Error("기록 저장이 취소됨"));
      });
    } finally {
      db.close();
    }
  }

  async function deleteCacheByKey(key) {
    const db = await openCacheDB();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(CACHE_STORE, "readwrite");
        tx.objectStore(CACHE_STORE).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error("기록을 삭제할 수 없음"));
      });
    } finally {
      db.close();
    }
  }

  async function clearCacheData(accountKey = "") {
    const key = accountKey || (await getCurrentAccountIdentity()).key;
    await deleteCacheByKey(key);
  }

  function normalizeRedpillHistoryList(value) {
    return Array.isArray(value) ? value.filter((item) => item && item.date) : [];
  }

  function makeRedpillHistoryKey(item) {
    if (!item) return "";
    const id = item.id || item.historyId || item.uuid || item.logId || "";
    if (id) return `id:${id}`;
    return [
      item.date || "",
      item.title || "",
      item.product || "",
      item.isConsumed === undefined ? "" : String(item.isConsumed),
      item.consumedType || "",
      item.quantity ?? item.balance?.total ?? "",
      item.type || "",
      item.reason || "",
      item.source || "",
    ].join("|");
  }

  function mergeRedpillHistoryRows(...lists) {
    const map = new Map();
    lists.flat().forEach((item) => {
      if (!item || !item.date) return;
      const key = makeRedpillHistoryKey(item);
      if (!key || map.has(key)) return;
      map.set(key, item);
    });
    return [...map.values()].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }

  async function getRedpillLocalStorageHistory() {
    const raw = localStorage.getItem(REDPILL_HISTORY_KEY);
    if (!raw) return [];

    let text = raw;
    if (localStorage.getItem(REDPILL_COMPRESSION_KEY)) {
      if (typeof LZString === "undefined" || typeof LZString.decompress !== "function") {
        throw new Error("빨간약 압축 캐시를 풀 LZString을 불러오지 못했어.");
      }
      text = LZString.decompress(raw);
      if (typeof text !== "string") throw new Error("빨간약 localStorage 압축 캐시를 풀지 못했어.");
    }

    try {
      return normalizeRedpillHistoryList(JSON.parse(text));
    } catch (_) {
      throw new Error("빨간약 localStorage 캐시 JSON이 손상되어 있어.");
    }
  }

  function openExistingRedpillDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        resolve(null);
        return;
      }

      let created = false;
      const request = indexedDB.open(REDPILL_DB_NAME);
      request.onupgradeneeded = () => {
        // DB가 없는데 가져오기 버튼만 눌렀다고 새 빨간약 DB를 만들지는 않는다.
        created = true;
        try { request.transaction?.abort(); } catch (_) {}
      };
      request.onsuccess = () => resolve(created ? null : request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    });
  }

  async function getRedpillIndexedDBHistory() {
    const db = await openExistingRedpillDB();
    if (!db) return [];
    try {
      if (!db.objectStoreNames.contains(REDPILL_DB_STORE)) return [];
      return await new Promise((resolve) => {
        const tx = db.transaction(REDPILL_DB_STORE, "readonly");
        const request = tx.objectStore(REDPILL_DB_STORE).get(REDPILL_DB_HISTORY_KEY);
        request.onsuccess = () => resolve(normalizeRedpillHistoryList(request.result));
        request.onerror = () => resolve([]);
      });
    } finally {
      db.close();
    }
  }

  async function getRedpillBrowserCache() {
    const [localRows, indexedRows] = await Promise.all([
      getRedpillLocalStorageHistory(),
      getRedpillIndexedDBHistory(),
    ]);
    return {
      rows: mergeRedpillHistoryRows(indexedRows, localRows),
      localCount: localRows.length,
      indexedCount: indexedRows.length,
    };
  }

  function makeRowFallbackMatchKey(row) {
    const date = String(row?.date || "");
    const title = String(row?.title || "제목 없음");
    const consumed = String(Boolean(row?.isConsumed));
    const quantity = String(extractQuantity(row));
    return `${date}|${title}|${consumed}|${quantity}`;
  }

  function getRowMatchKeys(row) {
    const keys = [makeRowFallbackMatchKey(row)];
    const id = row?.id || row?.historyId || row?.uuid || row?.logId || "";
    if (id) keys.unshift(`id:${id}`);
    return keys;
  }

  function rowsHaveAnyMatch(leftRows, rightRows) {
    const keys = new Set(rightRows.flatMap(getRowMatchKeys));
    return leftRows.some((row) => getRowMatchKeys(row).some((key) => keys.has(key)));
  }

  async function verifyRedpillCacheAccount(redpillRows) {
    const cutoff = getLookupCutoffDate();
    const today = kstDateString(new Date());
    const byDate = new Map();

    for (const row of redpillRows) {
      const date = safeKstDateString(row?.date);
      if (!date || date < cutoff || date > today) continue;
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date).push(row);
    }

    const candidateDates = [...byDate.keys()].sort((a, b) => b.localeCompare(a)).slice(0, 3);
    if (!candidateDates.length) {
      return { status: "unknown", reason: "빨간약 캐시가 전부 API 최근 1년 범위 밖이라 계정을 자동 대조할 수 없음" };
    }

    for (const date of candidateDates) {
      try {
        const aborter = new AbortController();
        const apiRows = await searchAlibi({
          start: date,
          end: date,
          speedKey: "express",
          signal: aborter.signal,
        });
        if (!apiRows.length) continue;

        const sourceRows = byDate.get(date) || [];
        if (rowsHaveAnyMatch(sourceRows, apiRows)) {
          return { status: "verified", date };
        }

        return {
          status: "mismatch",
          date,
          reason: `${date} 빨간약 캐시와 현재 계정 API 내역이 서로 맞지 않음`,
        };
      } catch (error) {
        console.warn("[Crack Alibi] 빨간약 계정 대조 실패", error);
      }
    }

    return { status: "unknown", reason: "현재 계정 API에서 대조할 수 있는 같은 날짜 내역을 찾지 못함" };
  }

  function makeAlibiRowKey(row) {
    return makeRowFallbackMatchKey(row);
  }

  // 빨간약에서 실제 내역이 존재하는 날짜는 캐시 완료 날짜로 취급한다.
  // v1.3.2 이하에서 이미 가져온 빨간약 row도 이 함수가 자동으로 완료 범위에 승격한다.
  function promoteRedpillDatesToCoverage(cache) {
    const base = normalizeBackupCache(cache || createEmptyCacheRecord());
    const redpillRows = (base.rows || []).filter((row) => row?.cacheSource === "redpill");
    const redpillRanges = getPresenceRangesFromRows(redpillRows);
    const ranges = mergeCoverageRanges([...(base.ranges || []), ...redpillRanges]);
    return {
      key: cache?.key || base.key || "",
      ranges,
      rows: base.rows || [],
      updatedAt: base.updatedAt || null,
    };
  }

  function mergeRedpillIntoCache(currentCache, redpillRows) {
    const current = normalizeBackupCache(currentCache || createEmptyCacheRecord());
    const ranges = mergeCoverageRanges(current.ranges || []);
    const nextRows = [...(current.rows || [])];
    const existingKeys = new Set(nextRows.map(makeAlibiRowKey));
    const importedDates = new Set();
    let importedRows = 0;
    let skippedCoveredRows = 0;
    let skippedDuplicateRows = 0;
    let invalidRows = 0;

    for (const sourceRow of redpillRows) {
      const date = String(sourceRow?.date || "");
      const kstDate = safeKstDateString(date);
      if (!kstDate || !isValidYMD(kstDate)) {
        invalidRows++;
        continue;
      }

      // Alibi가 API 조회 완료라고 확정한 날짜는 현재 금고가 무조건 우선.
      if (dateInRanges(kstDate, ranges)) {
        skippedCoveredRows++;
        continue;
      }

      let kstTime = "";
      try { kstTime = kstTimeString(date); } catch (_) {}
      const converted = {
        date,
        kstDate,
        kstTime,
        title: String(sourceRow.title || "제목 없음"),
        isConsumed: Boolean(sourceRow.isConsumed),
        alibiQuantity: extractQuantity(sourceRow),
        cacheSource: "redpill",
      };
      const key = makeAlibiRowKey(converted);
      if (existingKeys.has(key)) {
        skippedDuplicateRows++;
        continue;
      }

      existingKeys.add(key);
      nextRows.push(converted);
      importedDates.add(kstDate);
      importedRows++;
    }

    const sortedDates = [...importedDates].sort();
    const redpillCoverage = getPresenceRangesFromRows(
      nextRows.filter((row) => row?.cacheSource === "redpill")
    );
    const completedRanges = mergeCoverageRanges([...ranges, ...redpillCoverage]);
    return {
      cache: {
        key: currentCache?.key || "",
        ranges: completedRanges,
        rows: nextRows,
        updatedAt: current.updatedAt || null,
      },
      importedRows,
      importedDates: importedDates.size,
      firstDate: sortedDates[0] || "",
      lastDate: sortedDates[sortedDates.length - 1] || "",
      skippedCoveredRows,
      skippedDuplicateRows,
      invalidRows,
    };
  }

  function hasCacheData(cache) {
    return Boolean(
      (Array.isArray(cache?.ranges) && cache.ranges.length > 0) ||
      (Array.isArray(cache?.rows) && cache.rows.length > 0)
    );
  }

  function isValidYMD(value) {
    const text = String(value || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
    const { year, month, day } = parseYMD(text);
    if (!year || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return false;
    return makeYMD(year, month, day) === text;
  }

  function normalizeBackupCache(rawCache) {
    if (!rawCache || typeof rawCache !== "object") {
      throw new Error("백업 안에 기록 데이터가 없음");
    }

    const rawRanges = Array.isArray(rawCache.ranges) ? rawCache.ranges : [];
    const ranges = mergeCoverageRanges(rawRanges.map((range) => {
      let start = String(range?.start || "");
      let end = String(range?.end || "");
      if (!isValidYMD(start) || !isValidYMD(end)) return null;
      if (start > end) [start, end] = [end, start];
      return { start, end };
    }).filter(Boolean));

    const rawRows = Array.isArray(rawCache.rows) ? rawCache.rows : [];
    const rows = rawRows.map((row) => {
      if (!row || typeof row !== "object") return null;
      const date = String(row.date || "");
      const kstDate = String(row.kstDate || safeKstDateString(date) || "");
      if (!isValidYMD(kstDate)) return null;

      let kstTime = String(row.kstTime || "");
      if (!kstTime && date) {
        try { kstTime = kstTimeString(date); } catch (_) { kstTime = ""; }
      }

      const quantity = row.alibiQuantity != null
        ? Number(row.alibiQuantity) || 0
        : extractQuantity(row);

      return {
        date,
        kstDate,
        kstTime,
        title: String(row.title || "제목 없음"),
        isConsumed: Boolean(row.isConsumed),
        alibiQuantity: quantity,
        ...(row.cacheSource === "redpill" ? { cacheSource: "redpill" } : {}),
      };
    }).filter(Boolean);

    return {
      key: String(rawCache.key || ""),
      ranges,
      rows,
      updatedAt: typeof rawCache.updatedAt === "string" ? rawCache.updatedAt : null,
    };
  }

  function buildBackupPayload(cache, identity) {
    const normalized = normalizeBackupCache(cache || createEmptyCacheRecord(identity?.key || ""));
    return {
      format: BACKUP_FORMAT,
      formatVersion: BACKUP_VERSION,
      appVersion: ALIBI_VERSION,
      exportedAt: new Date().toISOString(),
      account: {
        key: identity.key,
        fingerprint: identity.fingerprint,
        idField: identity.idField,
      },
      cache: {
        ranges: normalized.ranges,
        rows: normalized.rows,
        updatedAt: normalized.updatedAt,
      },
    };
  }

  async function downloadCacheBackup() {
    const identity = await getCurrentAccountIdentity();
    const cache = await loadCacheData(identity.key);
    const payload = buildBackupPayload(cache, identity);
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `crack_alibi_backup_${identity.fingerprint}_${kstDateString(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function readCacheBackupFile(file) {
    if (!file) throw new Error("복원할 백업 파일을 골라줘.");

    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch (_) {
      throw new Error("JSON 백업 파일을 읽을 수 없음");
    }

    let rawCache = null;
    let accountKey = null;
    let accountFingerprint = null;
    let legacy = false;

    if (parsed?.format === BACKUP_FORMAT) {
      const version = Number(parsed.formatVersion);
      if (version !== 1 && version !== BACKUP_VERSION) {
        throw new Error(`지원하지 않는 백업 버전임: ${parsed.formatVersion ?? "알 수 없음"}`);
      }

      rawCache = parsed.cache;
      if (version >= 2) {
        accountKey = typeof parsed?.account?.key === "string" ? parsed.account.key : null;
        accountFingerprint = typeof parsed?.account?.fingerprint === "string"
          ? parsed.account.fingerprint
          : accountKey?.startsWith(ACCOUNT_CACHE_PREFIX)
            ? accountKey.slice(ACCOUNT_CACHE_PREFIX.length, ACCOUNT_CACHE_PREFIX.length + 12)
            : null;
        if (!accountKey?.startsWith(ACCOUNT_CACHE_PREFIX)) {
          throw new Error("백업의 계정 식별 정보가 손상됨");
        }
      } else {
        legacy = true;
      }
    } else if (Array.isArray(parsed?.ranges) && Array.isArray(parsed?.rows)) {
      // v1.1.6 이전에 cache 객체 자체를 저장한 수동 백업도 읽을 수는 있음.
      rawCache = parsed;
      legacy = true;
    } else {
      throw new Error("Crack Alibi 기록 백업 파일이 아님");
    }

    return {
      cache: normalizeBackupCache(rawCache),
      accountKey,
      accountFingerprint,
      legacy,
    };
  }

  function extractAccessToken() {
    return document.cookie
      .split(";")
      .map((v) => v.trim().split("="))
      .find(([k]) => k === "access_token")?.[1] || null;
  }

  function extractQuantity(row) {
    if (row.alibiQuantity != null) return Number(row.alibiQuantity) || 0;
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

  function setResultNotice(message = "") {
    const notice = document.querySelector("#ca-result-notice");
    if (!notice) return;

    if (!message) {
      notice.style.display = "none";
      notice.innerHTML = "";
      return;
    }

    notice.innerHTML = formatMessageHTML(message);
    notice.style.display = "block";
  }

  function setLoading(message = "알리바이 확인 중...", subMessage = "기록 금고 뒤지는 중") {
    currentProgressMain = message;
    currentProgressSub = subMessage;
    setResultHTML(`
      <div class="ca-loading">
        <div class="ca-spinner"></div>
        <div id="ca-loading-main">${escapeHTML(message)}</div>
        <div id="ca-loading-sub" style="font-size:12px; opacity:.72;">${escapeHTML(subMessage)}</div>
      </div>
    `);
  }

  function setProgress(message, subMessage = "") {
    currentProgressMain = message;
    currentProgressSub = subMessage;
    const main = document.querySelector("#ca-loading-main");
    const sub = document.querySelector("#ca-loading-sub");

    if (main) main.textContent = message;
    if (sub) sub.textContent = subMessage;
  }

  function formatMessageHTML(message) {
    return escapeHTML(message).replace(/\n/g, "<br>");
  }

  function setEmpty(message = "날짜를 고르고 검사하면 여기에 알리바이가 뜸") {
    setResultHTML(`
      <div class="ca-empty">
        <div style="font-size:34px; line-height:1;">🧾</div>
        <div>${formatMessageHTML(message)}</div>
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

  function addDaysToYMD(ymd, delta) {
    const { year, month, day } = parseYMD(ymd);
    const date = new Date(Date.UTC(year, month - 1, day + delta));
    return makeYMD(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  }

  function countDaysInclusive(start, end) {
    const s = parseYMD(start);
    const e = parseYMD(end);
    const startMs = Date.UTC(s.year, s.month - 1, s.day);
    const endMs = Date.UTC(e.year, e.month - 1, e.day);
    return Math.max(0, Math.floor((endMs - startMs) / 86400000) + 1);
  }

  function getPresenceRangesFromRows(rows = []) {
    const dates = [...new Set(
      (Array.isArray(rows) ? rows : [])
        .map((row) => row?.kstDate || safeKstDateString(row?.date))
        .filter((date) => date && isValidYMD(date))
    )].sort();

    const ranges = [];
    for (const date of dates) {
      const last = ranges[ranges.length - 1];
      if (last && date === addDaysToYMD(last.end, 1)) {
        last.end = date;
      } else {
        ranges.push({ start: date, end: date });
      }
    }

    return ranges;
  }

  function mergeCoverageRanges(ranges = []) {
    const sorted = ranges
      .filter((range) => range?.start && range?.end && range.start <= range.end)
      .map((range) => ({ start: range.start, end: range.end }))
      .sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
    const merged = [];

    for (const range of sorted) {
      const last = merged[merged.length - 1];
      if (!last || range.start > addDaysToYMD(last.end, 1)) {
        merged.push({ ...range });
      } else if (range.end > last.end) {
        last.end = range.end;
      }
    }

    return merged;
  }

  function subtractCoverage(start, end, ranges = []) {
    const covered = mergeCoverageRanges(ranges);
    const missing = [];
    let cursor = start;

    for (const range of covered) {
      if (range.end < cursor) continue;
      if (range.start > end) break;

      if (range.start > cursor) {
        missing.push({ start: cursor, end: addDaysToYMD(range.start, -1) });
      }

      if (range.end >= cursor) cursor = addDaysToYMD(range.end, 1);
      if (cursor > end) break;
    }

    if (cursor <= end) missing.push({ start: cursor, end });
    return missing;
  }

  function removeCoverage(ranges, start, end) {
    const next = [];

    for (const range of mergeCoverageRanges(ranges)) {
      if (range.end < start || range.start > end) {
        next.push(range);
        continue;
      }

      if (range.start < start) {
        next.push({ start: range.start, end: addDaysToYMD(start, -1) });
      }
      if (range.end > end) {
        next.push({ start: addDaysToYMD(end, 1), end: range.end });
      }
    }

    return mergeCoverageRanges(next);
  }

  function toCacheRow(row) {
    const date = String(row.date || "");
    return {
      date,
      kstDate: row.kstDate || safeKstDateString(date),
      kstTime: row.kstTime || (date ? kstTimeString(date) : ""),
      title: row.title || "제목 없음",
      isConsumed: Boolean(row.isConsumed),
      alibiQuantity: extractQuantity(row),
      ...(row.cacheSource === "redpill" ? { cacheSource: "redpill" } : {}),
    };
  }

  function getCachedRowsInRange(cache, start, end) {
    return (Array.isArray(cache?.rows) ? cache.rows : []).filter((row) => {
      const date = row.kstDate || safeKstDateString(row.date);
      return date && date >= start && date <= end;
    });
  }

  function applyFetchedRangeToCache(cache, start, end, rows) {
    const base = cache || createEmptyCacheRecord();
    const remainingRows = (Array.isArray(base.rows) ? base.rows : []).filter((row) => {
      const date = row.kstDate || safeKstDateString(row.date);
      return !date || date < start || date > end;
    });
    const nextRows = remainingRows.concat(rows.map(toCacheRow));
    const today = kstDateString(new Date());
    const stableEnd = end >= today ? addDaysToYMD(today, -1) : end;
    const nextRanges = start <= stableEnd
      ? mergeCoverageRanges([...(base.ranges || []), { start, end: stableEnd }])
      : mergeCoverageRanges(base.ranges || []);

    return {
      key: base.key || "",
      ranges: nextRanges,
      rows: nextRows,
      updatedAt: base.updatedAt || null,
    };
  }

  function deleteCacheRange(cache, start, end) {
    return {
      key: cache?.key || "",
      ranges: removeCoverage(cache?.ranges || [], start, end),
      rows: (cache?.rows || []).filter((row) => {
        const date = row.kstDate || safeKstDateString(row.date);
        return !date || date < start || date > end;
      }),
      updatedAt: cache?.updatedAt || null,
    };
  }

  function deleteRedpillRowsRange(cache, start, end) {
    return {
      key: cache?.key || "",
      // 빨간약 날짜는 캐시 완료 취급이므로 row 삭제 시 완료 범위도 같이 해제한다.
      // 이후 같은 기간을 검사하면 API에서 다시 조회된다.
      ranges: removeCoverage(cache?.ranges || [], start, end),
      rows: (cache?.rows || []).filter((row) => {
        if (row?.cacheSource !== "redpill") return true;
        const date = row.kstDate || safeKstDateString(row.date);
        return !date || date < start || date > end;
      }),
      updatedAt: cache?.updatedAt || null,
    };
  }

  function dateInRanges(date, ranges = []) {
    return ranges.some((range) => date >= range.start && date <= range.end);
  }

  function mergeRestoredCache(currentCache, backupCache) {
    const current = normalizeBackupCache(currentCache || createEmptyCacheRecord());
    const backup = normalizeBackupCache(backupCache || createEmptyCacheRecord());
    let mergedRanges = mergeCoverageRanges(current.ranges || []);
    const importRanges = [];

    for (const backupRange of mergeCoverageRanges(backup.ranges || [])) {
      const missing = subtractCoverage(backupRange.start, backupRange.end, mergedRanges);
      if (!missing.length) continue;
      importRanges.push(...missing);
      mergedRanges = mergeCoverageRanges([...mergedRanges, ...missing]);
    }

    // 이미 완료 기록인 날짜는 현재 금고가 우선. 없는 날짜만 백업에서 통째로 가져온다.
    // 미완료 날짜에 남아 있던 임시 row가 있으면 백업의 완성된 날짜 데이터로 교체한다.
    const keptCurrentRows = (current.rows || []).filter((row) => {
      const date = row.kstDate || safeKstDateString(row.date);
      return !date || !dateInRanges(date, importRanges);
    });
    const importedRows = (backup.rows || []).filter((row) => {
      const date = row.kstDate || safeKstDateString(row.date);
      return Boolean(date && dateInRanges(date, importRanges));
    });

    const backupDays = (backup.ranges || []).reduce(
      (sum, range) => sum + countDaysInclusive(range.start, range.end),
      0
    );
    const importedDays = importRanges.reduce(
      (sum, range) => sum + countDaysInclusive(range.start, range.end),
      0
    );

    return {
      cache: {
        key: currentCache?.key || "",
        ranges: mergedRanges,
        rows: keptCurrentRows.concat(importedRows),
        updatedAt: current.updatedAt || null,
      },
      importRanges: mergeCoverageRanges(importRanges),
      importedDays,
      skippedDays: Math.max(0, backupDays - importedDays),
      importedRows: importedRows.length,
    };
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function formatCacheUpdatedAt(value) {
    if (!value) return "없음";
    try {
      return new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(value));
    } catch (_) {
      return "알 수 없음";
    }
  }

  function addYearsToYMD(ymd, delta) {
    const { year, month, day } = parseYMD(ymd);
    const nextYear = year + delta;
    const nextDay = Math.min(day, daysInMonth(nextYear, month));
    return makeYMD(nextYear, month, nextDay);
  }

  function getLookupCutoffDate() {
    return addYearsToYMD(kstDateString(new Date()), -LOOKBACK_YEARS);
  }

  function resolveLookupRange(start, end) {
    const cutoff = getLookupCutoffDate();

    if (end < cutoff) {
      return {
        ok: false,
        cutoff,
        start,
        end,
        message: `현재 크랙 API에서는 최근 1년 내역만 조회할 수 있어요.\n${cutoff} 이전 내역은 사이트에서 제공되지 않아 Alibi로 확인할 수 없습니다.`,
      };
    }

    if (start < cutoff) {
      return {
        ok: true,
        clipped: true,
        cutoff,
        originalStart: start,
        originalEnd: end,
        start: cutoff,
        end,
        notice: `선택한 기간 중 ${cutoff} 이전 내역은 조회할 수 없어, ${cutoff} 이후 내역만 보여줘요.`,
      };
    }

    return {
      ok: true,
      clipped: false,
      cutoff,
      originalStart: start,
      originalEnd: end,
      start,
      end,
      notice: "",
    };
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

  function renderResults(rawRows, start, end, notice = "", emptyMessage = "") {
    lastRawRows = rawRows;
    lastSummaryRows = summarizeRows(rawRows);
    lastRangeStart = start;
    lastRangeEnd = end;
    lastResultNotice = notice;
    lastEmptyMessage = emptyMessage;
    currentResultView = "summary";
    currentCalendarMonth = "";
    selectedCalendarDate = "";

    const totals = sumRows(rawRows);
    const period = start === end ? start : `${start} ~ ${end}`;

    // 조회/기록 안내는 결과 카드 안이 아니라 검사 버튼과 결과 카드 사이에 표시.
    setResultNotice(notice);

    if (rawRows.length === 0) {
      setEmpty(emptyMessage || `${period} 알리바이 없음`);
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

  function sortRowsForCSV(rows) {
    return [...rows].sort((a, b) => {
      const ad = String(a.date || "");
      const bd = String(b.date || "");
      return ad.localeCompare(bd);
    });
  }

  function pushCsvSection(lines, title, quantityLabel, rows) {
    const header = ["KST Date(날짜)", "KST Time(시간)", "Title(항목)", quantityLabel];
    const sortedRows = sortRowsForCSV(rows);
    const total = sortedRows.reduce((sum, row) => {
      const quantity = row.alibiQuantity != null ? Number(row.alibiQuantity) || 0 : extractQuantity(row);
      return sum + quantity;
    }, 0);

    lines.push([title].map(csvEscape).join(","));
    lines.push(header.map(csvEscape).join(","));

    for (const row of sortedRows) {
      const quantity = row.alibiQuantity != null ? Number(row.alibiQuantity) || 0 : extractQuantity(row);
      lines.push([
        row.kstDate || safeKstDateString(row.date) || "",
        row.kstTime || kstTimeString(row.date),
        row.title || "제목 없음",
        quantity,
      ].map(csvEscape).join(","));
    }

    lines.push(["", "", "총합", total].map(csvEscape).join(","));
  }

  function downloadCSV() {
    const consumedRows = lastRawRows.filter((row) => row.isConsumed);
    const acquiredRows = lastRawRows.filter((row) => !row.isConsumed);
    const lines = [];

    pushCsvSection(lines, "소비 내역", "Quantity(소비 크래커)", consumedRows);
    lines.push("");
    pushCsvSection(lines, "획득 내역", "Quantity(획득 크래커)", acquiredRows);

    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const period = lastRangeStart && lastRangeEnd ? `${lastRangeStart}_${lastRangeEnd}` : Date.now();
    a.download = `crack_alibi_${period}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function renderRecordPanel() {
    const panel = document.querySelector("#ca-record-panel");
    if (!panel) return;

    panel.style.display = "block";
    panel.innerHTML = `<div class="ca-record-empty">기록 확인 중...</div>`;

    try {
      const identity = await getCurrentAccountIdentity();
      const loadedCache = await loadCacheData(identity.key);
      const beforeRangesJSON = JSON.stringify(mergeCoverageRanges(loadedCache.ranges || []));
      const cache = promoteRedpillDatesToCoverage(loadedCache);
      if (JSON.stringify(cache.ranges) !== beforeRangesJSON) {
        await saveCacheData(cache, identity.key);
      }
      const legacyCache = await loadCacheByKey(LEGACY_CACHE_KEY);
      const hasLegacy = hasCacheData(legacyCache);
      const ranges = mergeCoverageRanges(cache.ranges || []);
      const rows = Array.isArray(cache.rows) ? cache.rows : [];
      const redpillRows = rows.filter((row) => row?.cacheSource === "redpill");
      const redpillRanges = getPresenceRangesFromRows(redpillRows);
      let alibiRanges = [...ranges];
      for (const redpillRange of redpillRanges) {
        alibiRanges = removeCoverage(alibiRanges, redpillRange.start, redpillRange.end);
      }
      const coveredDays = ranges.reduce((sum, range) => sum + countDaysInclusive(range.start, range.end), 0);
      const alibiDays = alibiRanges.reduce((sum, range) => sum + countDaysInclusive(range.start, range.end), 0);
      const redpillDays = redpillRanges.reduce((sum, range) => sum + countDaysInclusive(range.start, range.end), 0);
      const visibleStoredDays = coveredDays;
      const approxBytes = new Blob([JSON.stringify(cache)]).size;

      const completedRangesHTML = alibiRanges.length
        ? `
          <div class="ca-record-section-label"><span>Alibi 조회 완료</span><span>${formatNumber(alibiDays)}일</span></div>
          ${alibiRanges.map((range) => `
            <button type="button" class="ca-record-range" data-kind="coverage" data-start="${escapeHTML(range.start)}" data-end="${escapeHTML(range.end)}" aria-pressed="false">
              <span class="ca-record-range-main">
                <span class="ca-record-source-badge">완료</span>
                <span>${escapeHTML(range.start)} ~ ${escapeHTML(range.end)}</span>
              </span>
              <span class="ca-record-range-side">
                <small>${formatNumber(countDaysInclusive(range.start, range.end))}일</small>
                <span class="ca-record-check">✓</span>
              </span>
            </button>
          `).join("")}
        `
        : "";

      const redpillRangesHTML = redpillRanges.length
        ? `
          <div class="ca-record-section-label"><span>빨간약 캐시 완료</span><span>${formatNumber(redpillDays)}일</span></div>
          ${redpillRanges.map((range) => `
            <button type="button" class="ca-record-range is-redpill" data-kind="redpill" data-start="${escapeHTML(range.start)}" data-end="${escapeHTML(range.end)}" aria-pressed="false">
              <span class="ca-record-range-main">
                <span class="ca-record-source-badge is-redpill">빨간약</span>
                <span>${escapeHTML(range.start)}${range.start === range.end ? "" : ` ~ ${escapeHTML(range.end)}`}</span>
              </span>
              <span class="ca-record-range-side">
                <small>${formatNumber(countDaysInclusive(range.start, range.end))}일</small>
                <span class="ca-record-check">✓</span>
              </span>
            </button>
          `).join("")}
        `
        : "";

      const rangesHTML = completedRangesHTML || redpillRangesHTML
        ? `${completedRangesHTML}${redpillRangesHTML}`
        : `<div class="ca-record-empty">아직 저장된 기록 없음<br>검사하거나 빨간약 캐시를 가져오면 여기에 날짜가 표시됨</div>`;

      panel.innerHTML = `
        <div class="ca-record-head">
          <div>
            <div class="ca-record-title">기록 금고</div>
            <div class="ca-record-desc">현재 계정 ${escapeHTML(identity.fingerprint)} · 완료된 과거 날짜는 계정별로 따로 저장. JSON 백업도 같은 계정끼리만 자동 병합함.</div>
          </div>
          <button type="button" class="ca-record-close" id="ca-record-close" aria-label="기록 닫기">×</button>
        </div>
        <div class="ca-record-meta">
          <div class="ca-record-stat"><span>보유 날짜</span><strong>${formatNumber(visibleStoredDays)}일</strong><span>Alibi ${formatNumber(alibiDays)}일${redpillDays ? ` · 빨간약 ${formatNumber(redpillDays)}일` : ""}</span></div>
          <div class="ca-record-stat"><span>저장 내역</span><strong>${formatNumber(rows.length)}개</strong>${redpillRows.length ? `<span>빨간약 ${formatNumber(redpillRows.length)}개</span>` : ""}</div>
          <div class="ca-record-stat"><span>용량 / 갱신</span><strong>${formatBytes(approxBytes)}</strong><span>${escapeHTML(formatCacheUpdatedAt(cache.updatedAt))}</span></div>
        </div>
        ${hasLegacy ? `
          <div class="ca-record-legacy">
            이전 버전의 계정 미분류 기록이 남아 있음. 어느 계정 기록인지 자동 판별할 수 없어서 현재 금고에는 아직 넣지 않았어.
            <button type="button" id="ca-record-claim-legacy">현재 계정으로 가져오기</button>
          </div>
        ` : ""}
        <div class="ca-record-list">${rangesHTML}</div>
        <div class="ca-record-delete-box" id="ca-record-delete-box">
          <div class="ca-record-delete-title">선택한 기록에서 삭제할 날짜만 지정</div>
          <div class="ca-record-delete-grid">
            <div class="ca-record-delete-field">
              <label for="ca-record-delete-start">삭제 시작일</label>
              <input type="date" class="ca-record-delete-date" id="ca-record-delete-start">
            </div>
            <div class="ca-record-delete-field">
              <label for="ca-record-delete-end">삭제 종료일</label>
              <input type="date" class="ca-record-delete-date" id="ca-record-delete-end">
            </div>
          </div>
          <div class="ca-record-delete-hint">구간 전체를 지우려면 그대로 두고, 일부만 지우려면 원하는 날짜로 좁혀서 삭제하면 됨.</div>
        </div>
        <div class="ca-record-transfer">
          <button type="button" class="ca-record-action" id="ca-record-import-redpill">빨간약 가져오기</button>
          <button type="button" class="ca-record-action" id="ca-record-backup">백업</button>
          <button type="button" class="ca-record-action" id="ca-record-restore">복원</button>
          <input type="file" id="ca-record-restore-file" accept=".json,application/json" hidden>
        </div>
        <div class="ca-record-actions">
          <button type="button" class="ca-record-action" id="ca-record-delete-range" disabled>지정 기간 삭제</button>
          <button type="button" class="ca-record-action is-danger" id="ca-record-clear">전체 기록 삭제</button>
        </div>
      `;

      panel.querySelector("#ca-record-close")?.addEventListener("click", () => {
        panel.style.display = "none";
      });

      let selectedRecordRange = null;
      const deleteRangeButton = panel.querySelector("#ca-record-delete-range");
      const deleteBox = panel.querySelector("#ca-record-delete-box");
      const deleteStartInput = panel.querySelector("#ca-record-delete-start");
      const deleteEndInput = panel.querySelector("#ca-record-delete-end");
      const rangeButtons = [...panel.querySelectorAll(".ca-record-range[data-start][data-end]")];

      function syncDeleteRangeUI() {
        const hasSelection = Boolean(selectedRecordRange);
        deleteBox?.classList.toggle("is-on", hasSelection);
        if (deleteRangeButton) deleteRangeButton.disabled = !hasSelection;

        if (!hasSelection) {
          if (deleteStartInput) {
            deleteStartInput.value = "";
            deleteStartInput.removeAttribute("min");
            deleteStartInput.removeAttribute("max");
          }
          if (deleteEndInput) {
            deleteEndInput.value = "";
            deleteEndInput.removeAttribute("min");
            deleteEndInput.removeAttribute("max");
          }
          return;
        }

        const { start, end } = selectedRecordRange;
        if (deleteStartInput) {
          deleteStartInput.min = start;
          deleteStartInput.max = end;
          deleteStartInput.value = start;
        }
        if (deleteEndInput) {
          deleteEndInput.min = start;
          deleteEndInput.max = end;
          deleteEndInput.value = end;
        }
      }

      rangeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const start = button.dataset.start;
          const end = button.dataset.end;
          const alreadySelected = button.classList.contains("is-selected");

          rangeButtons.forEach((item) => {
            item.classList.remove("is-selected");
            item.setAttribute("aria-pressed", "false");
          });

          if (alreadySelected) {
            selectedRecordRange = null;
          } else {
            button.classList.add("is-selected");
            button.setAttribute("aria-pressed", "true");
            selectedRecordRange = { start, end, kind: button.dataset.kind || "coverage" };
          }

          syncDeleteRangeUI();
        });
      });

      deleteRangeButton?.addEventListener("click", async () => {
        if (!selectedRecordRange) return;

        let start = deleteStartInput?.value || "";
        let end = deleteEndInput?.value || "";
        if (!start || !end) {
          alert("삭제 시작일과 종료일을 둘 다 골라줘.");
          return;
        }
        if (start > end) [start, end] = [end, start];

        if (start < selectedRecordRange.start || end > selectedRecordRange.end) {
          alert(`선택한 기록 구간(${selectedRecordRange.start} ~ ${selectedRecordRange.end}) 안에서만 삭제할 수 있어.`);
          return;
        }

        const isRedpillSelection = selectedRecordRange.kind === "redpill";
        const confirmMessage = isRedpillSelection
          ? `${start} ~ ${end} 빨간약 캐시 내역을 삭제할까?\n이 날짜의 캐시 완료 표시도 같이 풀려서 다음 검사 때 API로 다시 조회돼.`
          : `${start} ~ ${end} 저장 기록만 삭제할까?\n나머지 날짜 기록은 그대로 남아.`;
        if (!confirm(confirmMessage)) return;

        const latest = await loadCacheData(identity.key);
        const nextCache = isRedpillSelection
          ? deleteRedpillRowsRange(latest, start, end)
          : deleteCacheRange(latest, start, end);
        await saveCacheData(nextCache, identity.key);
        await renderRecordPanel();
      });

      panel.querySelector("#ca-record-import-redpill")?.addEventListener("click", async (event) => {
        const button = event.currentTarget;
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "빨간약 읽는 중...";

        try {
          const source = await getRedpillBrowserCache();
          if (!source.rows.length) {
            alert("이 브라우저에서 빨간약 저장 캐시를 찾지 못했어.");
            return;
          }

          button.textContent = "계정 확인 중...";
          const currentIdentity = await getCurrentAccountIdentity();
          const verification = await verifyRedpillCacheAccount(source.rows);

          if (verification.status === "mismatch") {
            throw new Error(
              `현재 로그인 계정과 빨간약 캐시가 다른 계정으로 보여서 가져오기를 막았어.\n` +
              `대조 날짜: ${verification.date}\n\n` +
              `빨간약 캐시는 계정별 저장소가 아니라서, 다른 계정 기록을 가져오면 금고가 섞일 수 있어.`
            );
          }

          if (verification.status === "unknown") {
            const proceed = confirm(
              `빨간약 캐시 ${formatNumber(source.rows.length)}개를 찾았지만 현재 계정인지 자동 확인하지 못했어.\n\n` +
              `${verification.reason}\n\n` +
              `이 빨간약 캐시가 현재 로그인 계정(${currentIdentity.fingerprint}) 기록이 확실하면 [확인]을 눌러줘.\n` +
              `다른 계정 기록일 가능성이 있으면 취소해.`
            );
            if (!proceed) return;
          }

          const current = await loadCacheData(currentIdentity.key);
          const merged = mergeRedpillIntoCache(current, source.rows);

          if (merged.importedRows === 0) {
            alert(
              `새로 가져올 빨간약 내역이 없어.\n\n` +
              `빨간약 캐시: ${formatNumber(source.rows.length)}개\n` +
              `이미 Alibi 완료 날짜라 제외: ${formatNumber(merged.skippedCoveredRows)}개\n` +
              `이미 같은 내역이 있어 제외: ${formatNumber(merged.skippedDuplicateRows)}개`
            );
            return;
          }

          const verificationText = verification.status === "verified"
            ? `계정 자동 확인 완료 (${verification.date} 내역 일치)`
            : "계정 자동 확인 불가 · 사용자 확인으로 진행";
          const rangeText = merged.firstDate === merged.lastDate
            ? merged.firstDate
            : `${merged.firstDate} ~ ${merged.lastDate}`;

          const ok = confirm(
            `빨간약 브라우저 캐시를 현재 Alibi 금고로 가져올까?\n\n` +
            `${verificationText}\n` +
            `빨간약 원본: ${formatNumber(source.rows.length)}개 (localStorage ${formatNumber(source.localCount)} / IndexedDB ${formatNumber(source.indexedCount)})\n` +
            `새로 추가: ${formatNumber(merged.importedRows)}개 · ${formatNumber(merged.importedDates)}일\n` +
            `추가 범위: ${rangeText}\n` +
            `Alibi 완료 날짜라 건너뜀: ${formatNumber(merged.skippedCoveredRows)}개\n` +
            `중복이라 건너뜀: ${formatNumber(merged.skippedDuplicateRows)}개\n\n` +
            `빨간약에서 실제 내역이 존재하는 날짜는 Alibi에서도 캐시 완료로 취급해.\n` +
            `이 날짜는 이후 검사 때 API를 다시 조회하지 않고 금고에서 바로 불러와. 다시 조회하려면 기록에서 해당 날짜를 삭제하면 됨.`
          );
          if (!ok) return;

          await saveCacheData(merged.cache, currentIdentity.key);
          await renderRecordPanel();
          alert(
            `빨간약 캐시 가져오기 완료.\n` +
            `${formatNumber(merged.importedRows)}개 내역 / ${formatNumber(merged.importedDates)}일 추가했어.`
          );
        } catch (error) {
          alert(`빨간약 캐시 가져오기 실패: ${error.message}`);
          console.error("[Crack Alibi RedPill Import]", error);
        } finally {
          if (button?.isConnected) {
            button.disabled = false;
            button.textContent = originalText;
          }
        }
      });

      panel.querySelector("#ca-record-backup")?.addEventListener("click", async () => {
        try {
          await downloadCacheBackup();
        } catch (error) {
          alert(`백업 실패: ${error.message}`);
          console.error("[Crack Alibi Backup]", error);
        }
      });

      const restoreButton = panel.querySelector("#ca-record-restore");
      const restoreInput = panel.querySelector("#ca-record-restore-file");

      restoreButton?.addEventListener("click", () => {
        if (!restoreInput) return;
        restoreInput.value = "";
        restoreInput.click();
      });

      restoreInput?.addEventListener("change", async () => {
        const file = restoreInput.files?.[0];
        if (!file) return;

        try {
          const restoredPackage = await readCacheBackupFile(file);
          const currentIdentity = await getCurrentAccountIdentity();

          if (restoredPackage.accountKey && restoredPackage.accountKey !== currentIdentity.key) {
            throw new Error(
              `다른 계정 백업이라 복원을 막았어.\n` +
              `현재 계정: ${currentIdentity.fingerprint}\n` +
              `백업 계정: ${restoredPackage.accountFingerprint || "알 수 없음"}`
            );
          }

          if (restoredPackage.legacy) {
            const legacyOk = confirm(
              `이 백업은 계정 구분 기능이 생기기 전 버전이라 어느 계정 기록인지 확인할 수 없어.\n\n` +
              `현재 계정(${currentIdentity.fingerprint}) 기록으로 취급해서 병합할까?\n` +
              `확실하지 않으면 취소해.`
            );
            if (!legacyOk) return;
          }

          const current = await loadCacheData(currentIdentity.key);
          const merged = mergeRestoredCache(current, restoredPackage.cache);
          const backupRanges = mergeCoverageRanges(restoredPackage.cache.ranges || []);
          const backupDays = backupRanges.reduce((sum, range) => sum + countDaysInclusive(range.start, range.end), 0);
          const backupRows = Array.isArray(restoredPackage.cache.rows) ? restoredPackage.cache.rows.length : 0;

          if (merged.importedDays === 0) {
            alert(
              `복원할 새 날짜가 없음.\n` +
              `백업 ${formatNumber(backupDays)}일이 전부 현재 기록과 겹쳐서 기존 기록을 그대로 유지했어.`
            );
            return;
          }

          const importText = merged.importRanges
            .map((range) => range.start === range.end ? range.start : `${range.start} ~ ${range.end}`)
            .join(", ");

          const ok = confirm(
            `현재 계정 기록에 없는 날짜만 자동으로 합칠까?\n\n` +
            `백업 전체: ${formatNumber(backupDays)}일 · ${formatNumber(backupRows)}개 내역\n` +
            `새로 복원: ${formatNumber(merged.importedDays)}일 · ${formatNumber(merged.importedRows)}개 내역\n` +
            `겹쳐서 유지: ${formatNumber(merged.skippedDays)}일\n\n` +
            `추가되는 구간: ${importText}\n\n` +
            `겹치는 날짜는 현재 기록을 절대 덮어쓰지 않아.`
          );
          if (!ok) return;

          await saveCacheData(merged.cache, currentIdentity.key);
          await renderRecordPanel();
          alert(
            `복원 완료 · 새 날짜 ${formatNumber(merged.importedDays)}일 / ${formatNumber(merged.importedRows)}개 내역 추가\n` +
            `겹친 ${formatNumber(merged.skippedDays)}일은 기존 기록 유지`
          );
        } catch (error) {
          alert(`복원 실패: ${error.message}`);
          console.error("[Crack Alibi Restore]", error);
        }
      });

      panel.querySelector("#ca-record-claim-legacy")?.addEventListener("click", async () => {
        const latestLegacy = await loadCacheByKey(LEGACY_CACHE_KEY);
        if (!hasCacheData(latestLegacy)) {
          await renderRecordPanel();
          return;
        }

        const legacyRanges = mergeCoverageRanges(latestLegacy.ranges || []);
        const legacyDays = legacyRanges.reduce((sum, range) => sum + countDaysInclusive(range.start, range.end), 0);
        const legacyRows = Array.isArray(latestLegacy.rows) ? latestLegacy.rows.length : 0;
        const ok = confirm(
          `이전 버전 기록은 계정 정보가 없어서 자동 판별이 불가능해.\n\n` +
          `${formatNumber(legacyDays)}일 · ${formatNumber(legacyRows)}개 내역을\n` +
          `현재 계정(${identity.fingerprint}) 기록으로 취급해서 가져올까?\n\n` +
          `예전에 두 계정을 섞어서 검사했다면 취소하는 게 안전해.`
        );
        if (!ok) return;

        const latestCurrent = await loadCacheData(identity.key);
        const merged = mergeRestoredCache(latestCurrent, latestLegacy);
        await saveCacheData(merged.cache, identity.key);
        await deleteCacheByKey(LEGACY_CACHE_KEY);
        await renderRecordPanel();
        alert(`이전 기록 가져오기 완료 · ${formatNumber(merged.importedDays)}일 추가`);
      });

      panel.querySelector("#ca-record-clear")?.addEventListener("click", async () => {
        if (!confirm("저장된 알리바이 기록을 전부 삭제할까?")) return;
        await clearCacheData(identity.key);
        await renderRecordPanel();
      });
    } catch (error) {
      panel.innerHTML = `
        <div class="ca-record-head">
          <div>
            <div class="ca-record-title">기록 금고</div>
            <div class="ca-record-desc">기록 저장소를 열지 못했음.</div>
          </div>
          <button type="button" class="ca-record-close" id="ca-record-close">×</button>
        </div>
        <div class="ca-record-empty">${escapeHTML(error.message)}</div>
      `;
      panel.querySelector("#ca-record-close")?.addEventListener("click", () => panel.style.display = "none");
      console.error("[Crack Alibi Cache]", error);
    }
  }

  function toggleRecordPanel() {
    const panel = document.querySelector("#ca-record-panel");
    if (!panel) return;
    if (panel.style.display !== "none") {
      panel.style.display = "none";
      return;
    }
    renderRecordPanel();
  }

  function setSearchingUI(searching) {
    isSearching = searching;
    const run = document.querySelector("#ca-run");
    const stop = document.querySelector("#ca-stop");
    const record = document.querySelector("#ca-record");
    const speedButtons = document.querySelectorAll(".ca-speed-btn");
    const dates = document.querySelectorAll(".ca-date");
    const recordActions = document.querySelectorAll(".ca-record-action");

    if (run) {
      run.disabled = searching;
      run.textContent = searching ? "검사 중..." : "검사";
    }
    if (stop) stop.style.display = searching ? "inline-block" : "none";
    if (record) record.disabled = searching;
    speedButtons.forEach((b) => b.disabled = searching);
    dates.forEach((d) => d.disabled = searching);
    recordActions.forEach((b) => b.disabled = searching);
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

    const today = kstDateString(new Date());
    if (range.end > today) range.end = today;
    if (range.start > range.end) range.start = range.end;

    currentAborter = new AbortController();
    activeSearchRange = { start: range.start, end: range.end, notice: "" };
    setResultNotice("");
    setSearchingUI(true);
    const recordPanel = document.querySelector("#ca-record-panel");
    if (recordPanel) recordPanel.style.display = "none";
    setLoading("저장된 기록 확인 중...", `${range.start} ~ ${range.end}`);

    try {
      const searchIdentity = await getCurrentAccountIdentity();
      let cache = await loadCacheData(searchIdentity.key);
      const beforeRangesJSON = JSON.stringify(mergeCoverageRanges(cache.ranges || []));
      cache = promoteRedpillDatesToCoverage(cache);
      if (JSON.stringify(cache.ranges) !== beforeRangesJSON) {
        await saveCacheData(cache, searchIdentity.key);
      }
      const missingRanges = subtractCoverage(range.start, range.end, cache.ranges);
      const cutoff = getLookupCutoffDate();
      const fetchRanges = [];
      const unavailableRanges = [];

      for (const missing of missingRanges) {
        if (missing.end < cutoff) {
          unavailableRanges.push(missing);
          continue;
        }
        if (missing.start < cutoff) {
          unavailableRanges.push({ start: missing.start, end: addDaysToYMD(cutoff, -1) });
          fetchRanges.push({ start: cutoff, end: missing.end });
        } else {
          fetchRanges.push(missing);
        }
      }

      if (missingRanges.length === 0) {
        setProgress("저장된 기록 불러오는 중", "이 기간은 API 조회 없이 바로 불러옴");
      }

      for (let i = 0; i < fetchRanges.length; i++) {
        const fetchRange = fetchRanges[i];
        setProgress(
          `미기록 구간 ${i + 1} / ${fetchRanges.length} 조회 중`,
          `${fetchRange.start} ~ ${fetchRange.end}`
        );
        const rows = await searchAlibi({
          start: fetchRange.start,
          end: fetchRange.end,
          speedKey: currentSpeed,
          signal: currentAborter.signal,
        });

        cache = applyFetchedRangeToCache(cache, fetchRange.start, fetchRange.end, rows);
        await saveCacheData(cache, searchIdentity.key);
      }

      const rows = getCachedRowsInRange(cache, range.start, range.end);
      const redpillResultRows = rows.filter((row) => row?.cacheSource === "redpill").length;
      const noticeParts = [];
      const coveredBefore = countDaysInclusive(range.start, range.end) - missingRanges.reduce((sum, r) => sum + countDaysInclusive(r.start, r.end), 0);

      if (missingRanges.length === 0) {
        noticeParts.push("전부 저장된 기록이라 API 조회 없이 불러왔어요.");
      } else if (coveredBefore > 0) {
        noticeParts.push(`기존 기록 ${formatNumber(coveredBefore)}일은 건너뛰고 미기록 구간만 조회했어요.`);
      } else if (fetchRanges.length > 0) {
        noticeParts.push("조회한 과거 날짜는 자동 기록했어요. 다음번 같은 기간 검사는 더 빨라져요.");
      }

      if (range.end === today && !dateInRanges(today, cache.ranges)) {
        noticeParts.push("오늘 기록은 새 내역이 생길 수 있어서 다음 검사 때 다시 확인해요.");
      }

      if (redpillResultRows > 0) {
        noticeParts.push(`빨간약 캐시 ${formatNumber(redpillResultRows)}개 내역을 금고에서 불러왔어요. 빨간약 날짜도 캐시 완료 취급이라 API를 다시 조회하지 않아요.`);
      }

      if (unavailableRanges.length > 0) {
        const unavailableText = unavailableRanges
          .map((r) => r.start === r.end ? r.start : `${r.start} ~ ${r.end}`)
          .join(", ");
        noticeParts.push(`API 최근 1년 제한 때문에 아직 기록되지 않은 ${unavailableText} 구간은 확인할 수 없어요.`);
      }

      const notice = noticeParts.join("\n");
      const emptyMessage = unavailableRanges.length > 0 && rows.length === 0
        ? "저장된 내역 없음"
        : "";
      renderResults(rows, range.start, range.end, notice, emptyMessage);
    } catch (error) {
      if (error.name === "AbortError") {
        setEmpty("검사 중지됨\n완료된 구간까지의 기록은 저장되어 있음");
      } else {
        setEmpty(`오류: ${error.message}`);
        console.error("[Crack Alibi]", error);
      }
    } finally {
      setSearchingUI(false);
      currentAborter = null;
      activeSearchRange = null;
    }
  }

  function stopSearch() {
    if (currentAborter) currentAborter.abort();
  }

  function openAlibi() {
    document.querySelector(".ca-overlay")?.remove();

    const today = kstDateString(new Date());
    const displayStart = activeSearchRange?.start || lastRangeStart || today;
    const displayEnd = activeSearchRange?.end || lastRangeEnd || today;
    const overlay = document.createElement("div");
    overlay.className = "ca-overlay";
    overlay.innerHTML = `
      <div class="ca-sheet" role="dialog" aria-modal="true">
        <div class="ca-top">
          <div class="ca-brand">
            <div class="ca-logo">🧾</div>
            <div>
              <h2 class="ca-title">Alibi</h2>
              <div class="ca-subtitle"><span class="ca-version">${ALIBI_VERSION}</span><span class="ca-limit-copy">API 최근 1년 · 저장 기록은 계속 보관</span></div>
            </div>
          </div>
          <button type="button" class="ca-close" aria-label="닫기">×</button>
        </div>
        <div class="ca-body">
          <div class="ca-card">
            <div class="ca-grid">
              <div class="ca-field">
                <label for="ca-start-date">시작일</label>
                <input id="ca-start-date" class="ca-date" type="date" value="${displayStart}" max="${today}">
              </div>
              <div class="ca-field">
                <label for="ca-end-date">종료일</label>
                <input id="ca-end-date" class="ca-date" type="date" value="${displayEnd}" max="${today}">
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
              <button type="button" class="ca-record-btn" id="ca-record">기록</button>
              <button type="button" class="ca-primary" id="ca-run">검사</button>
              <button type="button" class="ca-ghost" id="ca-stop" style="display:none;">중지</button>
            </div>
          </div>
          <div class="ca-limit-notice ca-result-notice" id="ca-result-notice" style="display:none;"></div>
          <div class="ca-record-panel ca-card" id="ca-record-panel" style="display:none;"></div>
          <div class="ca-result ca-card"></div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    if (isSearching) {
      setLoading(currentProgressMain, currentProgressSub);
      setSearchingUI(true);
    } else if (lastRangeStart && lastRangeEnd) {
      renderResults(lastRawRows, lastRangeStart, lastRangeEnd, lastResultNotice, lastEmptyMessage);
    } else {
      setEmpty();
    }

    // X 버튼은 창만 닫는다. 실행 중인 조회는 계속 진행된다.
    overlay.querySelector(".ca-close")?.addEventListener("click", () => {
      overlay.remove();
    });

    // 배경(빈 공간)을 눌러도 창이 닫히지 않도록 별도 핸들러를 두지 않는다.

    overlay.querySelectorAll(".ca-speed-btn").forEach((button) => {
      button.addEventListener("click", () => {
        currentSpeed = button.dataset.speed;
        overlay.querySelectorAll(".ca-speed-btn").forEach((b) => b.classList.remove("is-on"));
        button.classList.add("is-on");
      });
    });

    overlay.querySelector("#ca-run")?.addEventListener("click", runSearch);
    overlay.querySelector("#ca-stop")?.addEventListener("click", stopSearch);
    overlay.querySelector("#ca-record")?.addEventListener("click", toggleRecordPanel);
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

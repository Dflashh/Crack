// ==UserScript==
// @name         Crack UI Plus
// @namespace    https://github.com/Dflashh/Crack
// @version      1.1.2
// @description  Crack을 더 가볍고 편하게
// @match        *://crack.wrtn.ai/*
// @author       깡통들과 나
// @run-at       document-start
// @grant        GM_addStyle
// @icon         https://cdn.jsdelivr.net/gh/Dflashh/Crack@main/icon.webp
// @downloadURL  https://raw.githubusercontent.com/Dflashh/Crack/main/CrackUI.user.js
// @updateURL    https://raw.githubusercontent.com/Dflashh/Crack/main/CrackUI.user.js
// ==/UserScript==

(() => {
  'use strict';

  const ID = {
    zone: 'crack-ui-reveal-zone',
    handle: 'crack-ui-mobile-handle',
    panel: 'crack-ui-settings-panel',
    gearDesktop: 'crack-ui-gear-desktop',
    gearMobile: 'crack-ui-gear-mobile',
    toggleHeader: 'crack-ui-toggle-header',
    toggleLineBreak: 'crack-ui-toggle-line-break',
    toggleAnimatedThumbs: 'crack-ui-toggle-animated-thumbs',
    toggleStatBar: 'crack-ui-toggle-stat-bar',
    imageSlider: 'crack-ui-image-size-slider',
    imageValue: 'crack-ui-image-size-value',
    chatWidthSlider: 'crack-ui-chat-width-slider',
    chatWidthValue: 'crack-ui-chat-width-value',
  };

  const LS = {
    autoHideHeader: 'crack_ui_auto_hide_header',
    imageConfig: 'wrtn_img_resizer_config',
    lineBreakOptimize: 'crack_ui_line_break_optimize',
    pauseAnimatedThumbs: 'crack_ui_pause_animated_thumbs',
    hideStatBar: 'crack_ui_hide_stat_bar',
    chatWidthPercent: 'crack_ui_chat_width_percent_v2',
    sectionDisplayOpen: 'crack_ui_section_display_open',
    sectionChatOpen: 'crack_ui_section_chat_open',
  };

  const CLS = {
    autoHide: 'crack-ui-autohide-header',
    reveal: 'crack-ui-header-reveal',
    panelOpen: 'crack-ui-panel-open',
    lineBreak: 'crack-ui-line-break-optimize',
    pauseAnimatedThumbs: 'crack-ui-pause-animated-thumbs',
    hideStatBar: 'crack-ui-hide-stat-bar',
    chatWidthCustom: 'crack-ui-chat-width-custom',
    widthDragging: 'crack-ui-width-dragging',
  };

  function clampImageSize(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 100;
    return Math.min(100, Math.max(20, Math.round(n)));
  }

  function clampChatWidthPercent(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.min(100, Math.max(-50, Math.round(n)));
  }

  function getCssWidthFromPercent(percent) {
    const p = clampChatWidthPercent(percent);
    if (p === 0) return '768px';
    if (p > 0) return `calc(768px + (95vw - 768px) * (${p} / 100))`;
    return `calc(768px * (1 + (${p} / 100)))`;
  }

  function getCssHalfWidthFromPercent(percent) {
    const p = clampChatWidthPercent(percent);
    if (p === 0) return '384px';
    if (p > 0) return `calc(384px + (95vw - 768px) * (${p} / 200))`;
    return `calc(384px * (1 + (${p} / 100)))`;
  }

  function getCssScrollButtonOffsetFromPercent(percent) {
    return `calc(${getCssHalfWidthFromPercent(percent)} + 44px)`;
  }

  function formatImageSizeDisplay(value) {
    const n = clampImageSize(value);
    return n === 100 ? '기본' : `${n}%`;
  }

  function formatChatWidthDisplay(percent) {
    const p = clampChatWidthPercent(percent);
    if (p > 0) return `+${p}%`;
    if (p === 0) return '기본';
    return `${p}%`;
  }

  function readStorage(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      // 저장소 접근이 막혀도 UI 기능은 계속 동작하게 둠
    }
  }

  function writeJsonStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 저장소 접근이 막혀도 UI 기능은 계속 동작하게 둠
    }
  }

  function loadImageSize() {
    try {
      const raw = readStorage(LS.imageConfig);
      if (!raw) return 100;
      const parsed = JSON.parse(raw);
      return clampImageSize(parsed.imageSize);
    } catch {
      return 100;
    }
  }

  function loadLineBreakOptimize() {
    const raw = readStorage(LS.lineBreakOptimize);
    if (raw == null) return true;
    return raw === '1';
  }

  function loadPauseAnimatedThumbs() {
    const raw = readStorage(LS.pauseAnimatedThumbs);
    if (raw == null) return false;
    return raw === '1';
  }

  function loadHideStatBar() {
    const raw = readStorage(LS.hideStatBar);
    if (raw == null) return false;
    return raw === '1';
  }

  function loadChatWidthPercent() {
    const raw = readStorage(LS.chatWidthPercent);
    if (raw != null) return clampChatWidthPercent(raw);
    return 0;
  }

  function loadSectionOpen(key, fallback = true) {
    const raw = readStorage(key);
    if (raw == null) return fallback;
    return raw === '1';
  }

  let autoHideHeader = readStorage(LS.autoHideHeader) === '1';
  let imageSize = loadImageSize();
  let lineBreakOptimize = loadLineBreakOptimize();
  let pauseAnimatedThumbs = loadPauseAnimatedThumbs();
  let hideStatBar = loadHideStatBar();
  let chatWidthPercent = loadChatWidthPercent();
  let displaySectionOpen = loadSectionOpen(LS.sectionDisplayOpen, true);
  let chatSectionOpen = loadSectionOpen(LS.sectionChatOpen, true);

  let panelOpen = false;
  let pointerOnZone = false;
  let pointerOnHeader = false;
  let mobileReveal = false;
  let mobileHideTimer = null;
  let rafPending = false;
  let cleanedOnce = false;
  let imageSizeSaveTimer = null;
  let chatWidthSaveTimer = null;
  let isChatWidthDragging = false;
  let animatedThumbRafPending = false;
  let animatedThumbUrlMap = null;
  let animatedThumbStillUrlStatus = new Map();
  let animatedThumbStillCandidateCache = new Map();

  if (autoHideHeader) {
    document.documentElement.classList.add(CLS.autoHide);
  }

  if (lineBreakOptimize) {
    document.documentElement.classList.add(CLS.lineBreak);
  }

  if (pauseAnimatedThumbs) {
    document.documentElement.classList.add(CLS.pauseAnimatedThumbs);
  }

  if (hideStatBar) {
    document.documentElement.classList.add(CLS.hideStatBar);
  }

  applyImageSize();
  applyChatWidth();

  const gearSvg = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
      </path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z">
      </path>
    </svg>
  `;

  function addStyle() {
    const css = `
      :root {
        --crack-ui-z-zone: 2147482997;
        --crack-ui-z-header: 2147482998;
        --crack-ui-z-panel: 2147482999;
        --crack-ui-img-size: ${imageSize}%;
        --crack-ui-chat-width: ${getCssWidthFromPercent(chatWidthPercent)};
        --crack-ui-scroll-button-offset: ${getCssScrollButtonOffsetFromPercent(chatWidthPercent)};
      }

      #${ID.zone} {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 16px;
        z-index: var(--crack-ui-z-zone);
        pointer-events: none;
        background: transparent;
      }

      html.${CLS.autoHide} #${ID.zone} {
        pointer-events: auto;
      }

      #${ID.handle} {
        display: none;
      }

      html.${CLS.autoHide} body {
        padding-top: 0 !important;
        margin-top: 0 !important;
      }

      html.${CLS.autoHide} body div[height="100dvh"],
      html.${CLS.autoHide} body div[height="100%"] {
        padding-top: 0 !important;
        margin-top: 0 !important;
      }

      html.${CLS.autoHide} body .pt-\\[88px\\] {
        padding-top: 0 !important;
      }

      html.${CLS.autoHide} body .css-swctim {
        flex-grow: 1 !important;
      }

      html.${CLS.autoHide} #wrtn-custom-global-header,
      html.${CLS.autoHide} [data-crack-ui-header="1"] {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        z-index: var(--crack-ui-z-header) !important;
        transform: translateY(-110%) !important;
        transition:
          transform 190ms cubic-bezier(.2,.8,.2,1),
          box-shadow 190ms ease !important;
        will-change: transform !important;
      }

      html.${CLS.autoHide}.${CLS.reveal} #wrtn-custom-global-header,
      html.${CLS.autoHide}.${CLS.reveal} [data-crack-ui-header="1"],
      html.${CLS.autoHide}.${CLS.panelOpen} #wrtn-custom-global-header,
      html.${CLS.autoHide}.${CLS.panelOpen} [data-crack-ui-header="1"] {
        transform: translateY(0) !important;
        box-shadow: 0 12px 34px rgba(0, 0, 0, .24) !important;
      }

      .wrtn-markdown img,
      [class*="wrtn-markdown"] img,
      .markdown-body img {
        display: block !important;
        width: var(--crack-ui-img-size, 50%) !important;
        max-width: 100% !important;
        height: auto !important;
        margin: 10px auto !important;
        border-radius: 8px !important;
      }

      .wrtn-markdown a:has(> img),
      [class*="wrtn-markdown"] a:has(> img),
      .markdown-body a:has(> img) {
        display: block !important;
        width: 100% !important;
      }

      html.${CLS.lineBreak} div.break-all {
        word-break: keep-all !important;
      }

      html.${CLS.lineBreak} .wrtn-markdown,
      html.${CLS.lineBreak} .wrtn-markdown *,
      html.${CLS.lineBreak} .wrtn-markdown p,
      html.${CLS.lineBreak} .wrtn-markdown em,
      html.${CLS.lineBreak} .wrtn-markdown strong,
      html.${CLS.lineBreak} .wrtn-markdown span,
      html.${CLS.lineBreak} [class*="wrtn-markdown"],
      html.${CLS.lineBreak} [class*="wrtn-markdown"] * {
        max-width: 100% !important;
        text-align: left !important;
        word-break: keep-all !important;
        overflow-wrap: break-word !important;
        white-space: pre-wrap !important;
      }

      /*
       * 대화창 폭 조절
       * - 데스크탑(PC) 환경에서만 작동하도록 미디어 쿼리로 격리
       * - 모바일(767px 이하)에서는 타 확장프로그램(턴수, 라존데) 레이아웃 붕괴 방지를 위해 순정 폭 유지
       */
      @media (min-width: 768px) {
        html.${CLS.chatWidthCustom} div[class*="max-w-screen-md"],
        html.${CLS.chatWidthCustom} div[class*="max-w-[768px]"],
        html.${CLS.chatWidthCustom} div[class*="max-w-[850px]"],
        html.${CLS.chatWidthCustom} div[class*="max-w-3xl"],
        html.${CLS.chatWidthCustom} div[class*="max-w-4xl"],
        html.${CLS.chatWidthCustom} div[class*="max-w-5xl"],
        html.${CLS.chatWidthCustom} div[class*="bottom-0"] div[class*="max-w-"] {
          max-width: var(--crack-ui-chat-width, 768px) !important;
          width: 100% !important;
          margin-left: auto !important;
          margin-right: auto !important;
          transition: max-width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        html.${CLS.chatWidthCustom}.${CLS.widthDragging} div[class*="max-w-screen-md"],
        html.${CLS.chatWidthCustom}.${CLS.widthDragging} div[class*="max-w-[768px]"],
        html.${CLS.chatWidthCustom}.${CLS.widthDragging} div[class*="max-w-[850px]"],
        html.${CLS.chatWidthCustom}.${CLS.widthDragging} div[class*="max-w-3xl"],
        html.${CLS.chatWidthCustom}.${CLS.widthDragging} div[class*="max-w-4xl"],
        html.${CLS.chatWidthCustom}.${CLS.widthDragging} div[class*="max-w-5xl"],
        html.${CLS.chatWidthCustom}.${CLS.widthDragging} div[class*="bottom-0"] div[class*="max-w-"] {
          transition: none !important;
        }

        html.${CLS.chatWidthCustom} div[class*="max-w-[640px]"] {
          max-width: 100% !important;
        }

        html.${CLS.chatWidthCustom} div[class*="absolute"][class*="bottom-[145px]"][class*="gap-3"][class*="min-w-[34px]"][class*="flex-col"][class*="pointer-events-none"] {
          right: max(20px, calc(50% - var(--crack-ui-scroll-button-offset, 428px))) !important;
          transition: right 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        html.${CLS.chatWidthCustom}.${CLS.widthDragging} div[class*="absolute"][class*="bottom-[145px]"][class*="gap-3"][class*="min-w-[34px]"][class*="flex-col"][class*="pointer-events-none"] {
          transition: none !important;
        }
      }

      .crack-ui-search-cluster {
        display: flex !important;
        align-items: center !important;
        gap: 7px !important;
        min-width: 0 !important;
      }

      .crack-ui-searchbox {
        min-width: 0 !important;
      }

      .crack-ui-gear {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 24px !important;
        height: 24px !important;
        min-width: 24px !important;
        border: 0 !important;
        border-radius: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        outline: none !important;
        color: var(--icon_primary, var(--text_primary, #111111)) !important;
        cursor: pointer !important;
        transform: none !important;
        transition: opacity 120ms ease !important;
      }

      .crack-ui-gear:hover {
        opacity: .72 !important;
        background: transparent !important;
        color: var(--icon_primary, var(--text_primary, #111111)) !important;
      }

      .crack-ui-gear:active {
        transform: none !important;
        opacity: .72 !important;
      }

      .crack-ui-gear:focus,
      .crack-ui-gear:focus-visible {
        outline: none !important;
        box-shadow: none !important;
      }

      .crack-ui-gear svg {
        pointer-events: none !important;
      }

      #${ID.panel} {
        position: fixed;
        z-index: var(--crack-ui-z-panel);
        width: 318px;
        max-width: calc(100vw - 16px);
        max-height: calc(100dvh - 16px);
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior: contain;
        display: none;
        box-sizing: border-box;
        padding: 8px;
        border: 1px solid rgba(255, 255, 255, .11);
        border-radius: 22px;
        background: rgba(28, 28, 30, .74);
        color: rgba(255, 255, 255, .94);
        box-shadow:
          0 18px 46px rgba(0, 0, 0, .30),
          inset 0 1px 0 rgba(255, 255, 255, .07);
        backdrop-filter: blur(24px) saturate(1.18);
        -webkit-backdrop-filter: blur(24px) saturate(1.18);
        font-family: inherit;
        animation: crackUiPop .14s ease-out;
      }

      #${ID.panel}[data-open="1"] {
        display: block;
      }

      @keyframes crackUiPop {
        from {
          opacity: 0;
          transform: translateY(-6px) scale(.985);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .crack-ui-panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2px 7px;
        min-height: 26px;
      }

      .crack-ui-title-wrap {
        display: flex;
        flex-direction: column;
        gap: 0;
        min-width: 0;
      }

      .crack-ui-panel-title {
        font-size: 13px;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -.02em;
      }

      .crack-ui-panel-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .crack-ui-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 6px;
        border-radius: 20px;
        background: rgba(255, 255, 255, .035);
        border: 1px solid rgba(255, 255, 255, .055);
        overflow: hidden;
      }

      .crack-ui-section-head {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        min-height: 28px;
        padding: 3px 7px 4px;
        box-sizing: border-box;
        border: 0;
        border-radius: 14px;
        background: transparent;
        color: rgba(255, 255, 255, .92);
        cursor: pointer;
        font-family: inherit;
        transform: none !important;
        transition: background-color 130ms ease;
      }

      .crack-ui-section-head:hover {
        background: rgba(255, 255, 255, .055);
      }

      .crack-ui-section-head:active {
        transform: none !important;
      }

      .crack-ui-section-head:focus,
      .crack-ui-section-head:focus-visible {
        outline: none !important;
        box-shadow: none !important;
      }

      .crack-ui-section-title {
        font-size: 12px;
        font-weight: 900;
        line-height: 1;
        letter-spacing: -.02em;
        color: rgba(255, 255, 255, .94);
      }


      .crack-ui-section-chevron {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 999px;
        color: rgba(255, 255, 255, .54);
        font-size: 14px;
        line-height: 1;
        transform: rotate(90deg);
        transition:
          transform 150ms ease,
          background-color 130ms ease,
          color 130ms ease;
      }

      .crack-ui-section-head:hover .crack-ui-section-chevron {
        background: rgba(255, 255, 255, .07);
        color: rgba(255, 255, 255, .80);
      }

      .crack-ui-section[data-open="0"] .crack-ui-section-chevron {
        transform: rotate(0deg);
      }

      .crack-ui-section-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .crack-ui-section[data-open="0"] .crack-ui-section-body {
        display: none;
      }

      .crack-ui-panel-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        min-width: 24px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, .07);
        color: rgba(255, 255, 255, .62);
        cursor: pointer;
        font-size: 17px;
        line-height: 1;
        transform: none !important;
        transition:
          background-color 130ms ease,
          color 130ms ease;
      }

      .crack-ui-panel-close:hover {
        background: rgba(255, 255, 255, .12);
        color: rgba(255, 255, 255, .90);
      }

      .crack-ui-panel-close:active {
        transform: none !important;
      }

      .crack-ui-row,
      .crack-ui-range-row {
        width: 100%;
        box-sizing: border-box;
        padding: 12px;
        border-radius: 18px;
        background: rgba(0, 0, 0, .42);
        border: 1px solid rgba(255, 255, 255, .07);
        user-select: none;
        overflow: hidden;
        transition:
          background-color 130ms ease,
          border-color 130ms ease;
      }

      .crack-ui-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 35px;
        align-items: center;
        column-gap: 10px;
        cursor: pointer;
      }

      .crack-ui-range-row {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .crack-ui-row:hover,
      .crack-ui-range-row:hover {
        background: rgba(0, 0, 0, .48);
        border-color: rgba(255, 255, 255, .12);
      }

      .crack-ui-row-text {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
        overflow: hidden;
      }

      .crack-ui-row-name {
        font-size: 13px;
        font-weight: 800;
        line-height: 1.1;
        color: rgba(255, 255, 255, .96);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .crack-ui-row-desc {
        font-size: 11px;
        line-height: 1.42;
        color: rgba(255, 255, 255, .58);
        word-break: keep-all;
      }

      .crack-ui-range-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .crack-ui-range-value {
        font-size: 12px;
        font-weight: 800;
        color: rgba(255, 255, 255, .72);
        font-variant-numeric: tabular-nums;
      }

      .crack-ui-range {
        width: 100%;
        height: 18px;
        margin: 0;
        padding: 0;
        appearance: none;
        -webkit-appearance: none;
        background: transparent;
        cursor: pointer;
      }

      .crack-ui-range::-webkit-slider-runnable-track {
        height: 4px;
        border-radius: 999px;
        background: rgba(120, 120, 128, .44);
      }

      .crack-ui-range::-webkit-slider-thumb {
        appearance: none;
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        margin-top: -7px;
        border-radius: 999px;
        border: 0;
        background: #fff;
        box-shadow:
          0 2px 7px rgba(0, 0, 0, .32),
          0 0 1px rgba(0, 0, 0, .20);
      }

      .crack-ui-range::-moz-range-track {
        height: 4px;
        border-radius: 999px;
        background: rgba(120, 120, 128, .44);
      }

      .crack-ui-range::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        border: 0;
        background: #fff;
        box-shadow:
          0 2px 7px rgba(0, 0, 0, .32),
          0 0 1px rgba(0, 0, 0, .20);
      }

      html.${CLS.hideStatBar} [data-crack-ui-stat-bar="1"],
      html.${CLS.hideStatBar} div[role="button"]:has([data-stat-index]) {
        display: none !important;
      }

      .crack-ui-toggle {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      .crack-ui-switch {
        justify-self: end;
        position: relative;
        display: block;
        width: 35px;
        height: 20px;
        min-width: 35px;
        max-width: 35px;
        border-radius: 999px;
        background: rgba(120, 120, 128, .40);
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, .07),
          inset 0 1px 2px rgba(0, 0, 0, .22);
        transition:
          background-color 180ms ease,
          box-shadow 180ms ease;
      }

      .crack-ui-switch::after {
        content: "";
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: #fff;
        box-shadow:
          0 1px 4px rgba(0, 0, 0, .32),
          0 0 1px rgba(0, 0, 0, .18);
        transition: transform 170ms cubic-bezier(.28, 1.25, .35, 1);
      }

      .crack-ui-toggle:checked + .crack-ui-switch {
        background: #34C759;
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, .08),
          inset 0 1px 2px rgba(0, 0, 0, .08);
      }

      .crack-ui-toggle:checked + .crack-ui-switch::after {
        transform: translateX(15px);
      }

      @media (max-width: 767px), (hover: none), (pointer: coarse) {
        #${ID.zone} {
          height: 30px;
          pointer-events: none !important;
        }

        html.${CLS.autoHide} #${ID.zone} {
          pointer-events: none !important;
        }

        html.${CLS.autoHide} #${ID.handle} {
          display: block;
          position: absolute;
          top: max(4px, env(safe-area-inset-top));
          left: 50%;
          width: 52px;
          height: 18px;
          transform: translateX(-50%);
          pointer-events: auto !important;
          z-index: calc(var(--crack-ui-z-header) + 2);
          touch-action: none;
        }

        html.${CLS.autoHide} #${ID.handle}::after {
          content: "";
          position: absolute;
          top: 7px;
          left: 50%;
          width: 36px;
          height: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, .28);
          box-shadow: 0 1px 6px rgba(0, 0, 0, .22);
          transform: translateX(-50%);
        }

        html.${CLS.autoHide}.${CLS.reveal} #${ID.handle},
        html.${CLS.autoHide}.${CLS.panelOpen} #${ID.handle} {
          pointer-events: none !important;
        }

        html.${CLS.autoHide}.${CLS.reveal} #${ID.handle}::after,
        html.${CLS.autoHide}.${CLS.panelOpen} #${ID.handle}::after {
          opacity: 0;
        }

        #${ID.panel} {
          width: min(318px, calc(100vw - 16px));
          border-radius: 21px;
          padding: 8px;
        }

        .crack-ui-gear {
          width: 26px !important;
          height: 26px !important;
          min-width: 26px !important;
        }
      }
    `;
    if (typeof GM_addStyle === 'function') {
      GM_addStyle(css);
    } else {
      const style = document.createElement('style');
      style.textContent = css;
      document.documentElement.appendChild(style);
    }
  }

  addStyle();

  function ready(fn) {
    if (document.body) fn();
    else requestAnimationFrame(() => ready(fn));
  }

  function isTouchLikeDevice() {
    return window.matchMedia('(max-width: 767px), (hover: none), (pointer: coarse)').matches;
  }

  function normalizeUrl(url) {
    try {
      return new URL(String(url || ''), location.href).href;
    } catch {
      return String(url || '');
    }
  }

  function isAnimatedImageUrl(url) {
    const value = String(url || '');
    return (
      /_gif\d*(?=\.[a-z0-9]+(?:[?#]|$))/i.test(value) ||
      /\.gif(?:[?#]|$)/i.test(value)
    );
  }

  function collectAnimatedThumbUrlMap() {
    if (animatedThumbUrlMap) return animatedThumbUrlMap;

    const map = new Map();
    const addPair = (animatedUrl, stillUrl) => {
      if (!animatedUrl || !stillUrl) return;
      if (!isAnimatedImageUrl(animatedUrl)) return;
      map.set(String(animatedUrl), String(stillUrl));
      map.set(normalizeUrl(animatedUrl), normalizeUrl(stillUrl));
    };

    const walk = (value, depth = 0) => {
      if (!value || depth > 14) return;
      if (Array.isArray(value)) {
        value.forEach((item) => walk(item, depth + 1));
        return;
      }

      if (typeof value !== 'object') return;
      if (typeof value.gif600 === 'string' && typeof value.w600 === 'string') {
        addPair(value.gif600, value.w600);
      }

      if (typeof value.gif === 'string' && typeof value.image === 'string') {
        addPair(value.gif, value.image);
      }

      if (typeof value.animated === 'string' && typeof value.thumbnail === 'string') {
        addPair(value.animated, value.thumbnail);
      }

      Object.values(value).forEach((item) => walk(item, depth + 1));
    };

    const nextData = document.getElementById('__NEXT_DATA__');
    if (nextData?.textContent) {
      try {
        walk(JSON.parse(nextData.textContent));
        animatedThumbUrlMap = map;
      } catch {
        animatedThumbUrlMap = map;
      }
    }

    animatedThumbUrlMap = map;
    return map;
  }

  function addUniqueUrl(list, url) {
    if (!url) return;
    const value = String(url);
    if (!value || isAnimatedImageUrl(value)) return;

    const key = normalizeUrl(value);
    if (!list.some((item) => normalizeUrl(item) === key)) {
      list.push(value);
    }
  }

  function getAnimatedImageSrc(img) {
    if (!img) return '';

    const saved = img.dataset?.crackUiAnimatedThumbSrc || '';
    if (saved && isAnimatedImageUrl(saved)) return saved;

    const srcAttr = img.getAttribute('src') || '';
    if (isAnimatedImageUrl(srcAttr)) return srcAttr;
    const currentSrc = img.currentSrc || img.src || '';
    if (isAnimatedImageUrl(currentSrc)) return currentSrc;

    const srcset = img.getAttribute('srcset') || '';
    const srcsetMatch = srcset.match(/https?:[^\s,]+(?:_gif\d*\.[a-z0-9]+|\.gif)(?:[?#][^\s,]*)?/i);
    if (srcsetMatch?.[0]) return srcsetMatch[0];

    return '';
  }

  function getSiblingStillCandidates(img) {
    const result = [];
    const root = img?.parentElement;
    if (!root) return result;
    root.querySelectorAll('img').forEach((other) => {
      if (other === img) return;
      if (other.getAttribute('alt') === 'crack original') return;
      if (/\/crack\/original\//i.test(other.getAttribute('src') || other.src || '')) return;

      const src = other.getAttribute('src') || other.currentSrc || other.src || '';
      if (!src || isAnimatedImageUrl(src)) return;
      if (!/\.(webp|png|jpe?g)(?:[?#]|$)/i.test(src)) return;

      addUniqueUrl(result, src);
    });
    return result;
  }

  function getBaseStillThumbCandidates(animatedUrl) {
    if (!animatedUrl) return [];

    const raw = String(animatedUrl);
    const cacheKey = normalizeUrl(raw);
    const cached = animatedThumbStillCandidateCache.get(cacheKey);
    if (cached) return cached.slice();

    const candidates = [];
    const map = collectAnimatedThumbUrlMap();
    const normalized = normalizeUrl(raw);
    const mapped = map.get(raw) || map.get(normalized);

    addUniqueUrl(candidates, mapped);

    // Crack CDN 썸네일 규칙 후보들.
    // 1) _q70_q70_gif600.webp -> _w600.webp
    // 2) _q70_q70_gif600.webp -> _q70_q70_w600.webp
    // 3) _q70_gif600.webp -> _w600.webp
    // 4) _q70_gif600.webp -> _q70_w600.webp
    const suffixMatch = raw.match(/_gif(\d+)(\.[a-z0-9]+)(?=([?#]|$))/i);
    const size = suffixMatch?.[1] || '600';
    const ext = suffixMatch?.[2] || '.webp';
    if (suffixMatch) {
      addUniqueUrl(candidates, raw.replace(new RegExp(`(?:_q\\d+)+_gif${size}${ext.replace('.', '\\.')}(?=([?#]|$))`, 'i'), `_w${size}${ext}`));
      addUniqueUrl(candidates, raw.replace(new RegExp(`_gif${size}${ext.replace('.', '\\.')}(?=([?#]|$))`, 'i'), `_w${size}${ext}`));
      addUniqueUrl(candidates, raw.replace(new RegExp(`_q\\d+_gif${size}${ext.replace('.', '\\.')}(?=([?#]|$))`, 'i'), `_w${size}${ext}`));
    }

    // 일반 gif 파일은 같은 이름의 webp/png/jpg가 있으면 후보로 검사한다.
    addUniqueUrl(candidates, raw.replace(/\.gif(?=([?#]|$))/i, '.webp'));
    addUniqueUrl(candidates, raw.replace(/\.gif(?=([?#]|$))/i, '.png'));
    addUniqueUrl(candidates, raw.replace(/\.gif(?=([?#]|$))/i, '.jpg'));

    if (!animatedThumbStillCandidateCache.has(cacheKey) && animatedThumbStillCandidateCache.size > 400) {
      animatedThumbStillCandidateCache.clear();
    }

    animatedThumbStillCandidateCache.set(cacheKey, candidates.slice());
    return candidates;
  }

  function getStillThumbCandidates(animatedUrl, img = null) {
    if (!animatedUrl) return [];
    const candidates = [];

    // 같은 카드 안에 이미 정지 이미지가 있으면 매번 다시 확인한다.
    // 카드 DOM은 라우팅/지연 로딩에 따라 달라질 수 있어서 URL 캐시에 넣지 않는다.
    getSiblingStillCandidates(img).forEach((url) => addUniqueUrl(candidates, url));
    getBaseStillThumbCandidates(animatedUrl).forEach((url) => addUniqueUrl(candidates, url));

    return candidates;
  }

  function bindAnimatedThumbErrorFallback(img) {
    if (!img || img.dataset.crackUiErrorFallbackBound === '1') return;
    img.dataset.crackUiErrorFallbackBound = '1';

    img.addEventListener('error', () => {
      const current = img.getAttribute('src') || img.currentSrc || img.src || '';

      if (
        img.dataset.crackUiAnimatedThumb === '1' &&
        img.dataset.crackUiAnimatedThumbSrc &&
        current &&
        !isAnimatedImageUrl(current)
      ) {
        animatedThumbStillUrlStatus.set(normalizeUrl(current), 'bad');
        restoreAnimatedThumbImage(img);
      }
    },
    true);
  }

  function setStillThumbImage(img, stillUrl) {
    if (!pauseAnimatedThumbs || !img || !img.isConnected || !stillUrl) return;
    const src = img.getAttribute('src') || img.src || '';
    const srcset = img.getAttribute('srcset') || '';
    const animatedSrc = getAnimatedImageSrc(img);
    if (animatedSrc && img.dataset.crackUiAnimatedThumbSrc !== animatedSrc) {
      img.dataset.crackUiAnimatedThumbSrc = animatedSrc;
    }

    if (srcset && isAnimatedImageUrl(srcset) && img.dataset.crackUiAnimatedThumbSrcset !== srcset) {
      img.dataset.crackUiAnimatedThumbSrcset = srcset;
    }

    bindAnimatedThumbErrorFallback(img);

    img.dataset.crackUiAnimatedThumb = '1';

    if (stillUrl !== src) {
      img.setAttribute('src', stillUrl);
    }

    if (srcset && isAnimatedImageUrl(srcset)) {
      img.removeAttribute('srcset');
    }
  }

  function applyFirstLoadableStillThumb(img, candidates, index = 0) {
    if (!pauseAnimatedThumbs || !img || !img.isConnected || !candidates?.length) return;
    if (index >= candidates.length) {
      img.dataset.crackUiAnimatedThumbNoStill = '1';
      return;
    }

    const stillUrl = candidates[index];
    const key = normalizeUrl(stillUrl);
    const status = animatedThumbStillUrlStatus.get(key);
    if (status === 'ok') {
      setStillThumbImage(img, stillUrl);
      return;
    }

    if (status === 'bad') {
      applyFirstLoadableStillThumb(img, candidates, index + 1);
      return;
    }

    if (status === 'loading') return;

    animatedThumbStillUrlStatus.set(key, 'loading');

    const probe = new Image();
    probe.onload = () => {
      animatedThumbStillUrlStatus.set(key, 'ok');
      scheduleAnimatedThumbState();
    };
    probe.onerror = () => {
      animatedThumbStillUrlStatus.set(key, 'bad');
      scheduleAnimatedThumbState();
    };

    probe.src = stillUrl;
  }

  function isAnimatedThumbTarget(img) {
    if (!img || img.tagName !== 'IMG') return false;
    if (img.dataset.crackUiAnimatedThumb === '1') return true;

    const animatedSrc = getAnimatedImageSrc(img);
    if (!animatedSrc) return false;

    // 배지/로고 같은 UI 이미지는 제외한다.
    const alt = img.getAttribute('alt') || '';
    const src = img.getAttribute('src') || img.currentSrc || img.src || '';
    if (alt === 'crack original') return false;
    if (/\/crack\/original\//i.test(src)) return false;
    if (/\/asset\/badge\//i.test(src)) return false;
    // 홈/목록 썸네일은 대부분 data-nimg가 있고 object-cover/object-contain을 가진다.
    // 그래도 사용자가 원한 건 “움짤이면 멈춤”이므로 animated URL이면 기본적으로 대상에 포함한다.
    return true;
  }

  function pauseAnimatedThumbImage(img) {
    if (!isAnimatedThumbTarget(img)) return;

    const animatedSrc = getAnimatedImageSrc(img);
    if (!animatedSrc) return;
    if (img.dataset.crackUiAnimatedThumbSrc !== animatedSrc) {
      img.dataset.crackUiAnimatedThumbSrc = animatedSrc;
      delete img.dataset.crackUiAnimatedThumbNoStill;
    }

    const srcset = img.getAttribute('srcset') || '';
    if (srcset && isAnimatedImageUrl(srcset) && img.dataset.crackUiAnimatedThumbSrcset !== srcset) {
      img.dataset.crackUiAnimatedThumbSrcset = srcset;
    }

    const candidates = getStillThumbCandidates(animatedSrc, img);
    if (!candidates.length) {
      img.dataset.crackUiAnimatedThumbNoStill = '1';
      return;
    }

    applyFirstLoadableStillThumb(img, candidates);
  }

  function restoreAnimatedThumbImage(img) {
    if (!img?.dataset?.crackUiAnimatedThumb && !img?.dataset?.crackUiAnimatedThumbSrc) return;
    if (img.dataset.crackUiAnimatedThumbSrc) {
      img.setAttribute('src', img.dataset.crackUiAnimatedThumbSrc);
    }

    if (img.dataset.crackUiAnimatedThumbSrcset) {
      img.setAttribute('srcset', img.dataset.crackUiAnimatedThumbSrcset);
    } else {
      img.removeAttribute('srcset');
    }

    delete img.dataset.crackUiAnimatedThumb;
    delete img.dataset.crackUiAnimatedThumbSrc;
    delete img.dataset.crackUiAnimatedThumbSrcset;
    delete img.dataset.crackUiAnimatedThumbNoStill;
  }

  function applyAnimatedThumbState() {
    const selector = [
      'img[src*="_gif"]',
      'img[srcset*="_gif"]',
      'img[src$=".gif"]',
      'img[src*=".gif?"]',
      'img[src*=".gif#"]',
      'img[data-crack-ui-animated-thumb="1"]',
      'img[data-crack-ui-animated-thumb-src]',
    ].join(',');
    document.querySelectorAll(selector).forEach((img) => {
      if (pauseAnimatedThumbs) pauseAnimatedThumbImage(img);
      else restoreAnimatedThumbImage(img);
    });
  }

  function scheduleAnimatedThumbState() {
    if (animatedThumbRafPending) return;
    animatedThumbRafPending = true;
    requestAnimationFrame(() => {
      animatedThumbRafPending = false;
      applyAnimatedThumbState();
    });
  }

  function applyImageSize() {
    document.documentElement.style.setProperty('--crack-ui-img-size', `${imageSize}%`);
  }

  function applyChatWidth() {
    const customWidth = clampChatWidthPercent(chatWidthPercent) !== 0;
    document.documentElement.classList.toggle(CLS.chatWidthCustom, customWidth);
    document.documentElement.style.setProperty('--crack-ui-chat-width', getCssWidthFromPercent(chatWidthPercent));
    document.documentElement.style.setProperty('--crack-ui-scroll-button-offset', getCssScrollButtonOffsetFromPercent(chatWidthPercent));
  }

  function saveImageSizeSoon() {
    clearTimeout(imageSizeSaveTimer);
    imageSizeSaveTimer = setTimeout(() => {
      writeJsonStorage(LS.imageConfig, { imageSize });
      imageSizeSaveTimer = null;
    }, 120);
  }

  function flushImageSizeSave() {
    if (imageSizeSaveTimer) {
      clearTimeout(imageSizeSaveTimer);
      imageSizeSaveTimer = null;
    }

    writeJsonStorage(LS.imageConfig, { imageSize });
  }

  function saveChatWidthSoon() {
    clearTimeout(chatWidthSaveTimer);
    chatWidthSaveTimer = setTimeout(() => {
      writeStorage(LS.chatWidthPercent, chatWidthPercent);
      chatWidthSaveTimer = null;
    }, 120);
  }

  function flushChatWidthSave() {
    if (chatWidthSaveTimer) {
      clearTimeout(chatWidthSaveTimer);
      chatWidthSaveTimer = null;
    }

    writeStorage(LS.chatWidthPercent, chatWidthPercent);
  }

  function updateImageSizeUi() {
    const slider = document.getElementById(ID.imageSlider);
    const value = document.getElementById(ID.imageValue);

    if (slider) slider.value = String(imageSize);
    if (value) value.textContent = formatImageSizeDisplay(imageSize);
  }

  function updateChatWidthUi() {
    const slider = document.getElementById(ID.chatWidthSlider);
    const value = document.getElementById(ID.chatWidthValue);
    if (slider) slider.value = String(chatWidthPercent);
    if (value) value.textContent = formatChatWidthDisplay(chatWidthPercent);
  }

  function setImageSize(nextValue) {
    imageSize = clampImageSize(nextValue);
    applyImageSize();
    updateImageSizeUi();
    saveImageSizeSoon();
  }

  function setChatWidthPercent(nextValue) {
    chatWidthPercent = clampChatWidthPercent(nextValue);
    applyChatWidth();
    updateChatWidthUi();
    saveChatWidthSoon();
  }

  function startChatWidthDrag() {
    isChatWidthDragging = true;
    document.documentElement.classList.add(CLS.widthDragging);
  }

  function stopChatWidthDrag() {
    if (!isChatWidthDragging) return;

    isChatWidthDragging = false;
    document.documentElement.classList.remove(CLS.widthDragging);
    flushChatWidthSave();
  }

  function clearMobileHideTimer() {
    if (mobileHideTimer) {
      clearTimeout(mobileHideTimer);
      mobileHideTimer = null;
    }
  }

  function scheduleMobileHide(delay = 3500) {
    clearMobileHideTimer();
    mobileHideTimer = setTimeout(() => {
      if (!panelOpen) {
        mobileReveal = false;
        updateReveal();
      }
    }, delay);
  }

  function revealHeaderOnMobile() {
    if (!autoHideHeader || !isTouchLikeDevice()) return;

    mobileReveal = true;
    updateReveal();
    scheduleMobileHide(3500);
  }

  function cleanupOldStuffOnce() {
    if (cleanedOnce) return;
    cleanedOnce = true;
    document.querySelectorAll(
      '#wrtn-settings-desktop, #wrtn-settings-mobile, #crack-wrtn-ui-settings-panel, #crack-wrtn-ui-reveal-zone, #wrtn-custom-settings-panel, #wrtn-img-resizer-btn, #wrtn-img-resizer-btn-mobile'
    ).forEach((el) => el.remove());
    document.querySelectorAll('.crack-ui-search-cluster').forEach((cluster) => {
      const searchBox = cluster.querySelector('.crack-ui-searchbox');
      if (searchBox && cluster.parentElement) {
        cluster.parentElement.insertBefore(searchBox, cluster);
      }
      cluster.remove();
    });
    document.querySelectorAll(`#${ID.gearDesktop}, #${ID.gearMobile}, #${ID.panel}, #${ID.zone}, #${ID.handle}`)
      .forEach((el) => el.remove());
    document.documentElement.classList.remove(
      'crack-wrtn-ui-autohide',
      'crack-wrtn-ui-header-visible',
      'crack-wrtn-ui-panel-open'
    );
  }

  function markStatBars() {
    document.querySelectorAll('[data-stat-index]').forEach((statItem) => {
      const bar = statItem.closest('[role="button"]');
      if (!bar) return;

      const wrap = bar.parentElement;
      const wrapClass = String(wrap?.className || '');
      const root =
        wrap &&
        wrapClass.includes('transition-transform') &&
        wrapClass.includes('mt-12')
          ? wrap
          : bar;

      if (root.dataset.crackUiStatBar !== '1') {
        root.dataset.crackUiStatBar = '1';
      }
    });
  }

  function findHeader() {
    const byId = document.querySelector('#wrtn-custom-global-header');
    if (byId) return byId;

    const byHeight = document.querySelector('div[height="56"][width="100%"]');
    if (byHeight) {
      byHeight.dataset.crackUiHeader = '1';
      return byHeight;
    }

    const found = [...document.querySelectorAll('div')].find((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top > 90) return false;
      if (rect.height < 45 || rect.height > 75) return false;

      const hasLogo = !!el.querySelector('a[href="/"]');
      const hasSearch = !!el.querySelector('input[placeholder*="검색"]');
      const hasButtons = el.querySelectorAll('button').length >= 2;

      return hasLogo && hasButtons && hasSearch;
    });
    if (found) found.dataset.crackUiHeader = '1';
    return found || null;
  }

  function makeGear(id) {
    const btn = document.createElement('button');
    btn.id = id;
    btn.type = 'button';
    btn.className = 'crack-ui-gear';
    btn.title = 'UI 설정';
    btn.setAttribute('aria-label', 'UI 설정');
    btn.innerHTML = gearSvg;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearMobileHideTimer();
      togglePanel(btn);
    });
    return btn;
  }

  function ensureDesktopGear(header) {
    const input = header.querySelector('input[placeholder*="검색"]');
    if (!input) return;
    const inputWrap =
      input.closest('span.relative, span[class*="relative"]') ||
      input.parentElement;

    const searchBox = inputWrap?.parentElement;
    if (!searchBox) return;
    let cluster = searchBox.closest('.crack-ui-search-cluster');

    if (!cluster) {
      cluster = document.createElement('div');
      cluster.className = 'crack-ui-search-cluster';

      searchBox.classList.add('crack-ui-searchbox');
      searchBox.parentElement.insertBefore(cluster, searchBox);
      cluster.appendChild(searchBox);
    }

    let gear = document.getElementById(ID.gearDesktop);
    if (!gear) gear = makeGear(ID.gearDesktop);
    if (gear.parentElement !== cluster) {
      cluster.insertBefore(gear, cluster.firstChild);
    }

    gear.className = 'crack-ui-gear';
  }

  function ensureMobileGear(header) {
    const mobileArea = [...header.querySelectorAll('div')].find((el) => {
      const cls = String(el.className || '');
      return cls.includes('md:hidden') && cls.includes('justify-end') && cls.includes('items-center');
    });
    if (!mobileArea) return;

    let gear = document.getElementById(ID.gearMobile);
    if (!gear) gear = makeGear(ID.gearMobile);
    const searchButton = [...mobileArea.querySelectorAll('button')].find((btn) => {
      if (btn.id === ID.gearMobile) return false;
      return !!btn.querySelector('svg path[fill-rule="evenodd"], svg path[clip-rule="evenodd"]');
    });
    if (searchButton && gear.parentElement !== mobileArea) {
      mobileArea.insertBefore(gear, searchButton);
    } else if (!searchButton && gear.parentElement !== mobileArea) {
      mobileArea.insertBefore(gear, mobileArea.firstChild);
    }
  }

  function ensureGearButtons(header) {
    if (!header) return;
    ensureDesktopGear(header);
    ensureMobileGear(header);
  }

  function bindMobileHandle(handle) {
    if (!handle || handle.dataset.crackUiBound === '1') return;
    handle.dataset.crackUiBound = '1';
    const openFromHandle = (e) => {
      if (!isTouchLikeDevice()) return;

      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }

      revealHeaderOnMobile();
    };

    handle.addEventListener('pointerdown', openFromHandle, { passive: false });
    handle.addEventListener('touchstart', openFromHandle, { passive: false });
    handle.addEventListener('click', openFromHandle, { passive: false });
  }

  function ensureRevealZone() {
    let zone = document.getElementById(ID.zone);
    if (!zone) {
      zone = document.createElement('div');
      zone.id = ID.zone;
      zone.addEventListener('mouseenter', () => {
        if (isTouchLikeDevice()) return;
        pointerOnZone = true;
        updateReveal();
      });
      zone.addEventListener('mouseleave', () => {
        if (isTouchLikeDevice()) return;
        pointerOnZone = false;
        setTimeout(updateReveal, 80);
      });
      document.body.appendChild(zone);
    }

    let handle = document.getElementById(ID.handle);

    if (!handle) {
      handle = document.createElement('div');
      handle.id = ID.handle;
      handle.setAttribute('role', 'button');
      handle.setAttribute('aria-label', '상단바 열기');
      zone.appendChild(handle);
    } else if (handle.parentElement !== zone) {
      zone.appendChild(handle);
    }

    bindMobileHandle(handle);
  }

  function setPanelSectionOpen(sectionName, isOpen) {
    const section = document.querySelector(`[data-crack-ui-section="${sectionName}"]`);
    if (!section) return;

    const button = section.querySelector(`[data-crack-ui-section-toggle="${sectionName}"]`);
    const body = section.querySelector(`[data-crack-ui-section-body="${sectionName}"]`);

    section.dataset.open = isOpen ? '1' : '0';
    if (button) {
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    if (body) {
      body.hidden = !isOpen;
    }
  }

  function syncPanelSections() {
    setPanelSectionOpen('display', displaySectionOpen);
    setPanelSectionOpen('chat', chatSectionOpen);
  }

  function setSavedPanelSectionOpen(sectionName, isOpen) {
    if (sectionName === 'display') {
      displaySectionOpen = isOpen;
      writeStorage(LS.sectionDisplayOpen, isOpen ? '1' : '0');
    } else if (sectionName === 'chat') {
      chatSectionOpen = isOpen;
      writeStorage(LS.sectionChatOpen, isOpen ? '1' : '0');
    }

    setPanelSectionOpen(sectionName, isOpen);
    if (panelOpen) {
      requestAnimationFrame(() => {
        const anchor = document.getElementById(ID.gearDesktop) || document.getElementById(ID.gearMobile);
        positionPanel(anchor);
      });
    }
  }

  function bindPanelSections(panel) {
    panel.querySelectorAll('[data-crack-ui-section-toggle]').forEach((button) => {
      if (button.dataset.crackUiBound === '1') return;
      button.dataset.crackUiBound = '1';

      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const sectionName = button.dataset.crackUiSectionToggle;
        const section = panel.querySelector(`[data-crack-ui-section="${sectionName}"]`);
        const isOpen = section?.dataset.open !== '0';

        setSavedPanelSectionOpen(sectionName, !isOpen);
      });
    });
  }

  function bindCheckbox(panel, id, checked, onChange) {
    const input = panel.querySelector(`#${id}`);
    if (!input) return null;
    input.checked = checked;
    input.addEventListener('change', () => {
      onChange(input.checked, input);
    });

    return input;
  }

  function bindRangeInput(panel, id, onInput, onCommit = null) {
    const input = panel.querySelector(`#${id}`);
    if (!input) return null;

    input.addEventListener('input', (e) => {
      onInput(e.target.value, e);
    });
    if (onCommit) {
      input.addEventListener('change', onCommit);
      input.addEventListener('blur', onCommit);
    }

    return input;
  }

  function syncCheckbox(id, checked) {
    const input = document.getElementById(id);
    if (input) input.checked = checked;
  }

  function ensurePanel() {
    if (document.getElementById(ID.panel)) return;

    const panel = document.createElement('div');
    panel.id = ID.panel;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Crack UI Plus 설정');

    panel.innerHTML = `
      <div class="crack-ui-panel-head">
        <div class="crack-ui-title-wrap">
          <div class="crack-ui-panel-title">Crack UI Plus</div>
        </div>
        <button type="button" class="crack-ui-panel-close" aria-label="닫기">×</button>
      </div>

      <div class="crack-ui-panel-body">
        <div class="crack-ui-section" data-crack-ui-section="display" data-open="${displaySectionOpen ? '1' : '0'}">
          <button
            type="button"
            class="crack-ui-section-head"
            data-crack-ui-section-toggle="display"
            aria-expanded="${displaySectionOpen ? 'true' : 'false'}"
          >
            <span>
              <span class="crack-ui-section-title">화면</span>
            </span>
            <span class="crack-ui-section-chevron" aria-hidden="true">›</span>
          </button>

          <div class="crack-ui-section-body" data-crack-ui-section-body="display">
            <label class="crack-ui-row">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">상단바 자동 숨기기</span>
                <span class="crack-ui-row-desc">
                  PC는 맨 위에 마우스, 모바일은 위쪽 손잡이를 탭하면 다시 보여줌
                </span>
              </span>

              <span>
                <input id="${ID.toggleHeader}" class="crack-ui-toggle" type="checkbox">
                <span class="crack-ui-switch" aria-hidden="true"></span>
              </span>
            </label>

            <label class="crack-ui-row">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">썸네일 움짤 정지</span>
                <span class="crack-ui-row-desc">
                  움직이는 썸네일을 정지 이미지로 바꿔 렉을 줄임
                </span>
              </span>

              <span>
                <input id="${ID.toggleAnimatedThumbs}" class="crack-ui-toggle" type="checkbox">
                <span class="crack-ui-switch" aria-hidden="true"></span>
              </span>
            </label>
          </div>
        </div>

        <div class="crack-ui-section" data-crack-ui-section="chat" data-open="${chatSectionOpen ? '1' : '0'}">
          <button
            type="button"
            class="crack-ui-section-head"
            data-crack-ui-section-toggle="chat"
            aria-expanded="${chatSectionOpen ? 'true' : 'false'}"
          >
            <span>
              <span class="crack-ui-section-title">채팅</span>
            </span>
            <span class="crack-ui-section-chevron" aria-hidden="true">›</span>
          </button>

          <div class="crack-ui-section-body" data-crack-ui-section-body="chat">
            <label class="crack-ui-row">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">스탯창 끄기</span>
                <span class="crack-ui-row-desc">
                  활성화 시 상단 스탯바를 숨김
                </span>
              </span>

              <span>
                <input id="${ID.toggleStatBar}" class="crack-ui-toggle" type="checkbox">
                <span class="crack-ui-switch" aria-hidden="true"></span>
              </span>
            </label>

            <label class="crack-ui-row">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">줄바꿈 최적화</span>
                <span class="crack-ui-row-desc">
                  로그 줄바꿈이 단어 단위로 끊기게 최적화
                </span>
              </span>

              <span>
                <input id="${ID.toggleLineBreak}" class="crack-ui-toggle" type="checkbox">
                <span class="crack-ui-switch" aria-hidden="true"></span>
              </span>
            </label>

            <div class="crack-ui-range-row">
              <div class="crack-ui-range-head">
                <span class="crack-ui-row-name">대화창 폭 조절</span>
                <span id="${ID.chatWidthValue}" class="crack-ui-range-value">${formatChatWidthDisplay(chatWidthPercent)}</span>
              </div>

              <input
                id="${ID.chatWidthSlider}"
                class="crack-ui-range"
                type="range"
                min="-50"
                max="100"
                step="1"
                value="${chatWidthPercent}"
                aria-label="대화창 폭 조절"
              >
            </div>

            <div class="crack-ui-range-row">
              <div class="crack-ui-range-head">
                <span class="crack-ui-row-name">채팅 이미지 크기</span>
                <span id="${ID.imageValue}" class="crack-ui-range-value">${formatImageSizeDisplay(imageSize)}</span>
              </div>

              <input
                id="${ID.imageSlider}"
                class="crack-ui-range"
                type="range"
                min="20"
                max="100"
                step="1"
                value="${imageSize}"
                aria-label="채팅 이미지 크기"
              >
            </div>
          </div>
        </div>
      </div>
    `;
    panel.addEventListener('click', (e) => e.stopPropagation());
    panel.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    panel.querySelector('.crack-ui-panel-close')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closePanel();
    });
    document.body.appendChild(panel);

    bindPanelSections(panel);
    syncPanelSections();

    bindCheckbox(panel, ID.toggleHeader, autoHideHeader, (checked) => {
      autoHideHeader = checked;
      writeStorage(LS.autoHideHeader, autoHideHeader ? '1' : '0');

      if (!autoHideHeader) {
        mobileReveal = false;
        clearMobileHideTimer();
      }

      applyState();
    });
    bindCheckbox(panel, ID.toggleAnimatedThumbs, pauseAnimatedThumbs, (checked) => {
      pauseAnimatedThumbs = checked;
      writeStorage(LS.pauseAnimatedThumbs, pauseAnimatedThumbs ? '1' : '0');
      applyState();
      applyAnimatedThumbState();
    });
    bindCheckbox(panel, ID.toggleStatBar, hideStatBar, (checked) => {
      hideStatBar = checked;
      writeStorage(LS.hideStatBar, hideStatBar ? '1' : '0');
      applyState();
    });
    bindCheckbox(panel, ID.toggleLineBreak, lineBreakOptimize, (checked) => {
      lineBreakOptimize = checked;
      writeStorage(LS.lineBreakOptimize, lineBreakOptimize ? '1' : '0');
      applyState();
    });
    bindRangeInput(panel, ID.imageSlider, setImageSize, flushImageSizeSave);

    const chatWidthSlider = bindRangeInput(panel, ID.chatWidthSlider, setChatWidthPercent);

    if (chatWidthSlider) {
      chatWidthSlider.addEventListener('pointerdown', startChatWidthDrag);
      chatWidthSlider.addEventListener('touchstart', startChatWidthDrag, { passive: true });
      chatWidthSlider.addEventListener('mousedown', startChatWidthDrag);
      chatWidthSlider.addEventListener('pointerup', stopChatWidthDrag);
      chatWidthSlider.addEventListener('pointercancel', stopChatWidthDrag);
      chatWidthSlider.addEventListener('touchend', stopChatWidthDrag, { passive: true });
      chatWidthSlider.addEventListener('touchcancel', stopChatWidthDrag, { passive: true });
      chatWidthSlider.addEventListener('mouseup', stopChatWidthDrag);
      chatWidthSlider.addEventListener('change', stopChatWidthDrag);
      chatWidthSlider.addEventListener('blur', stopChatWidthDrag);
    }

    updateImageSizeUi();
    updateChatWidthUi();
  }

  function positionPanel(anchor) {
    const panel = document.getElementById(ID.panel);
    if (!panel) return;

    anchor ||= document.getElementById(ID.gearDesktop) || document.getElementById(ID.gearMobile);
    const panelWidth = Math.min(318, window.innerWidth - 16);
    panel.style.width = `${panelWidth}px`;

    const rect = anchor?.getBoundingClientRect();
    const panelHeight = panel.offsetHeight || 330;
    let left = rect ? rect.left : window.innerWidth - panelWidth - 8;
    let top = rect ? rect.bottom + 10 : 64;

    left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - panelHeight - 8));

    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }

  function openPanel(anchor) {
    const panel = document.getElementById(ID.panel);
    if (!panel) return;

    panelOpen = true;
    panel.dataset.open = '1';
    panel.style.visibility = 'hidden';

    clearMobileHideTimer();

    syncCheckbox(ID.toggleHeader, autoHideHeader);
    syncCheckbox(ID.toggleAnimatedThumbs, pauseAnimatedThumbs);
    syncCheckbox(ID.toggleStatBar, hideStatBar);
    syncCheckbox(ID.toggleLineBreak, lineBreakOptimize);

    syncPanelSections();
    updateImageSizeUi();
    updateChatWidthUi();
    applyState();
    requestAnimationFrame(() => {
      positionPanel(anchor);
      panel.style.visibility = '';
    });
  }

  function closePanel() {
    const panel = document.getElementById(ID.panel);
    if (!panel) return;

    panelOpen = false;
    panel.dataset.open = '0';
    isChatWidthDragging = false;
    document.documentElement.classList.remove(CLS.widthDragging);
    flushImageSizeSave();
    flushChatWidthSave();

    if (isTouchLikeDevice() && autoHideHeader) {
      scheduleMobileHide(1200);
    }

    applyState();
  }

  function togglePanel(anchor) {
    if (panelOpen) closePanel();
    else openPanel(anchor);
  }

  function bindHeaderHover(header) {
    if (!header || header.dataset.crackUiHoverBound === '1') return;

    header.dataset.crackUiHoverBound = '1';
    header.addEventListener('mouseenter', () => {
      if (isTouchLikeDevice()) return;
      pointerOnHeader = true;
      updateReveal();
    });
    header.addEventListener('mouseleave', () => {
      if (isTouchLikeDevice()) return;
      pointerOnHeader = false;
      setTimeout(updateReveal, 80);
    });
    header.addEventListener('touchstart', () => {
      if (!isTouchLikeDevice()) return;
      clearMobileHideTimer();
      scheduleMobileHide(3500);
    }, { passive: true });
  }

  function updateReveal() {
    const shouldReveal =
      autoHideHeader &&
      (pointerOnZone || pointerOnHeader || panelOpen || mobileReveal);
    document.documentElement.classList.toggle(CLS.reveal, shouldReveal);
    document.documentElement.classList.toggle(CLS.panelOpen, panelOpen);
  }

  function applyState() {
    document.documentElement.classList.toggle(CLS.autoHide, autoHideHeader);
    document.documentElement.classList.toggle(CLS.lineBreak, lineBreakOptimize);
    document.documentElement.classList.toggle(CLS.pauseAnimatedThumbs, pauseAnimatedThumbs);
    document.documentElement.classList.toggle(CLS.hideStatBar, hideStatBar);
    applyChatWidth();
    updateReveal();
  }

  function bindGlobal() {
    if (document.documentElement.dataset.crackUiGlobalBound === '1') return;
    document.documentElement.dataset.crackUiGlobalBound = '1';
    document.addEventListener('click', (e) => {
      if (!panelOpen) return;

      const panel = document.getElementById(ID.panel);
      const gear = e.target.closest(`#${ID.gearDesktop}, #${ID.gearMobile}`);

      if (panel && !panel.contains(e.target) && !gear) {
        closePanel();
      }
    }, true);
    document.addEventListener('touchstart', (e) => {
      if (!isTouchLikeDevice()) return;
      if (!autoHideHeader || !mobileReveal || panelOpen) return;

      const touchedSafeArea = e.target.closest(`
        #${ID.zone},
        #${ID.handle},
        #${ID.panel},
        #${ID.gearDesktop},
        #${ID.gearMobile},
        #wrtn-custom-global-header,
        [data-crack-ui-header="1"]
      `);

      if (!touchedSafeArea) {
        scheduleMobileHide(250);
      }
    }, { passive: true });
    window.addEventListener('scroll', () => {
      if (!isTouchLikeDevice()) return;
      if (!autoHideHeader || !mobileReveal || panelOpen) return;

      scheduleMobileHide(250);
    }, { passive: true });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePanel();
    });
    window.addEventListener('resize', () => {
      if (!panelOpen) return;
      const anchor = document.getElementById(ID.gearDesktop) || document.getElementById(ID.gearMobile);
      positionPanel(anchor);
    });
    window.addEventListener('pointerup', stopChatWidthDrag);
    window.addEventListener('pointercancel', stopChatWidthDrag);
    window.addEventListener('mouseup', stopChatWidthDrag);
    window.addEventListener('touchend', stopChatWidthDrag, { passive: true });
    window.addEventListener('touchcancel', stopChatWidthDrag, { passive: true });
    window.addEventListener('pagehide', () => {
      flushImageSizeSave();
      flushChatWidthSave();
    });
  }

  function init() {
    cleanupOldStuffOnce();
    ensureRevealZone();
    ensurePanel();
    markStatBars();
    bindGlobal();

    const header = findHeader();
    if (header) {
      bindHeaderHover(header);
      ensureGearButtons(header);
    }

    applyImageSize();
    applyChatWidth();
    applyState();
    scheduleAnimatedThumbState();
  }

  function observe() {
    const mo = new MutationObserver((mutations) => {
      const onlyImageSrcChanges =
        mutations.length > 0 &&
        mutations.every((mutation) =>
          mutation.type === 'attributes' &&
          mutation.target?.tagName === 'IMG' &&
          (mutation.attributeName === 'src' || mutation.attributeName === 'srcset')
        );

      if (onlyImageSrcChanges) {
        scheduleAnimatedThumbState();
        return;
      }

      if (rafPending) return;
      rafPending = true;

      requestAnimationFrame(() => {
        rafPending = false;
        init();
      });
    });
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset'],
    });
  }

  ready(() => {
    init();
    observe();
  });
})();

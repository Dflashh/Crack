// ==UserScript==
// @name         Crack UI Plus
// @namespace    https://github.com/Dflashh/Crack
// @version      1.2.9
// @description  Crack을 더 가볍고 편하게
// @match        *://crack.wrtn.ai/*
// @author       깡통들과 나
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      crack-api.wrtn.ai
// @icon         https://cdn.jsdelivr.net/gh/Dflashh/Crack@main/Icon/UI.webp
// @downloadURL  https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackUI.user.js
// @updateURL    https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackUI.user.js
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
    themeModeValue: 'crack-ui-theme-mode-value',
    episodeUiModeValue: 'crack-ui-episode-ui-mode-value',
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
    themeMode: 'crack_ui_theme_mode',
    episodeUiMode: 'crack_ui_episode_ui_mode',
    pendingThemeMode: 'crack_ui_pending_theme_mode',
    pendingEpisodeUiMode: 'crack_ui_pending_episode_ui_mode',
    lastEpisodeUiError: 'crack_ui_last_episode_ui_error',
    sectionDisplayOpen: 'crack_ui_section_display_open',
    sectionThemeOpen: 'crack_ui_section_theme_open',
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

  const THEME_MODE_LABEL = {
    light: '라이트 모드',
    dark: '다크 모드',
  };

  const EPISODE_UI_MODE_LABEL = {
    novel: '소설형 UI',
    chat: '채팅형 UI',
  };

  const CRACK_API = {
    episodeUiSetting: 'https://crack-api.wrtn.ai/crack-api/profiles/ui-setting',
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

  function getCurrentThemeModeFallback() {
    const bodyTheme = document.body?.dataset?.theme;
    if (bodyTheme === 'light' || bodyTheme === 'dark') return bodyTheme;

    const rootTheme = document.documentElement.dataset.theme;
    if (rootTheme === 'light' || rootTheme === 'dark') return rootTheme;

    if (document.documentElement.classList.contains('dark')) return 'dark';
    if (document.documentElement.classList.contains('light')) return 'light';

    const colorScheme = String(document.documentElement.style.colorScheme || '').toLowerCase();
    if (colorScheme.includes('dark')) return 'dark';
    if (colorScheme.includes('light')) return 'light';

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function normalizeThemeMode(value) {
    const mode = String(value || '').toLowerCase();
    if (mode === 'light' || mode === 'dark') return mode;
    return getCurrentThemeModeFallback();
  }

  function normalizeEpisodeUiMode(value) {
    const mode = String(value || '').toLowerCase();
    return Object.prototype.hasOwnProperty.call(EPISODE_UI_MODE_LABEL, mode) ? mode : 'novel';
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

  function formatThemeModeDisplay(mode) {
    return THEME_MODE_LABEL[normalizeThemeMode(mode)] || THEME_MODE_LABEL.dark;
  }

  function formatEpisodeUiModeDisplay(mode) {
    return EPISODE_UI_MODE_LABEL[normalizeEpisodeUiMode(mode)] || EPISODE_UI_MODE_LABEL.novel;
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
    }
  }

  function removeStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch {
    }
  }

  function writeJsonStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
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

  function loadThemeMode() {
    const saved = readStorage(LS.themeMode);
    if (saved === 'light' || saved === 'dark') return saved;

    const appTheme = readStorage('theme');
    if (appTheme === 'light' || appTheme === 'dark') return appTheme;

    return getCurrentThemeModeFallback();
  }

  function loadEpisodeUiMode() {
    const saved = readStorage(LS.episodeUiMode);
    if (saved != null) return normalizeEpisodeUiMode(saved);
    return 'novel';
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
  let themeMode = loadThemeMode();
  let episodeUiMode = loadEpisodeUiMode();
  let displaySectionOpen = loadSectionOpen(LS.sectionDisplayOpen, true);
  let themeSectionOpen = loadSectionOpen(LS.sectionThemeOpen, true);
  let chatSectionOpen = loadSectionOpen(LS.sectionChatOpen, true);

  let panelOpen = false;
  let pointerOnZone = false;
  let pointerOnHeader = false;
  let mobileReveal = false;
  let mobileHideTimer = null;
  let cleanedOnce = false;
  let imageSizeSaveTimer = null;
  let chatWidthSaveTimer = null;
  let episodeUiSaveRequestSeq = 0;
  let episodeUiReloadTimer = null;
  let isChatWidthDragging = false;
  let animatedThumbRafPending = false;
  let animatedThumbUrlMap = null;
  let animatedThumbStillUrlStatus = new Map();
  let animatedThumbStillCandidateCache = new Map();
  let cachedHeader = null;
  let initScheduled = false;
  let lastInitRun = 0;
  let initThrottleTimer = null;
  let pendingThemeApplied = false;

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
  applyThemeModeHint();

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

      .crack-ui-range-row[data-disabled="1"] {
        opacity: .52;
        filter: grayscale(.35);
      }

      .crack-ui-range-row[data-disabled="1"],
      .crack-ui-range-row[data-disabled="1"] * {
        cursor: not-allowed !important;
      }

      .crack-ui-range-row[data-disabled="1"]:hover {
        background: rgba(0, 0, 0, .42);
        border-color: rgba(255, 255, 255, .07);
      }

      .crack-ui-range:disabled {
        opacity: .42;
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

      .crack-ui-choice-group {
        display: flex;
        flex-direction: column;
        gap: 7px;
        padding: 12px;
        border-radius: 18px;
        background: rgba(0, 0, 0, .42);
        border: 1px solid rgba(255, 255, 255, .07);
      }

      .crack-ui-choice-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .crack-ui-choice-title {
        font-size: 13px;
        font-weight: 800;
        line-height: 1.1;
        color: rgba(255, 255, 255, .96);
      }

      .crack-ui-choice-value {
        font-size: 12px;
        font-weight: 800;
        color: rgba(255, 255, 255, .72);
        white-space: nowrap;
      }

      .crack-ui-choice-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .crack-ui-choice-row {
        display: grid;
        grid-template-columns: 18px minmax(0, 1fr);
        align-items: center;
        gap: 9px;
        width: 100%;
        min-height: 38px;
        box-sizing: border-box;
        padding: 9px 10px;
        border: 1px solid rgba(255, 255, 255, .065);
        border-radius: 14px;
        background: rgba(255, 255, 255, .035);
        color: rgba(255, 255, 255, .88);
        font-family: inherit;
        text-align: left;
        cursor: pointer;
        transform: none !important;
        transition:
          background-color 130ms ease,
          border-color 130ms ease;
      }

      .crack-ui-choice-row:hover {
        background: rgba(255, 255, 255, .06);
        border-color: rgba(255, 255, 255, .12);
      }

      .crack-ui-choice-row:active {
        transform: none !important;
      }

      .crack-ui-choice-row:focus,
      .crack-ui-choice-row:focus-visible {
        outline: none !important;
        box-shadow: none !important;
      }

      .crack-ui-choice-row[data-selected="1"] {
        background: rgba(52, 199, 89, .14);
        border-color: rgba(52, 199, 89, .46);
        color: rgba(255, 255, 255, .96);
      }

      .crack-ui-choice-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border-radius: 5px;
        border: 1px solid rgba(255, 255, 255, .22);
        background: rgba(120, 120, 128, .34);
        box-sizing: border-box;
        color: #fff;
        font-size: 12px;
        font-weight: 900;
        line-height: 1;
      }

      .crack-ui-choice-row[data-selected="1"] .crack-ui-choice-mark {
        border-color: #34C759;
        background: #34C759;
      }

      .crack-ui-choice-row[data-selected="1"] .crack-ui-choice-mark::after {
        content: "✓";
      }

      .crack-ui-choice-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        font-weight: 750;
        line-height: 1.1;
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


      body[data-theme="light"] #${ID.panel},
      html[data-theme="light"] #${ID.panel} {
        border-color: rgba(17, 24, 39, .10);
        background: rgba(255, 255, 255, .82);
        color: rgba(17, 24, 39, .94);
        box-shadow:
          0 18px 46px rgba(15, 23, 42, .14),
          inset 0 1px 0 rgba(255, 255, 255, .72);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-panel-title,
      html[data-theme="light"] #${ID.panel} .crack-ui-panel-title,
      body[data-theme="light"] #${ID.panel} .crack-ui-section-title,
      html[data-theme="light"] #${ID.panel} .crack-ui-section-title,
      body[data-theme="light"] #${ID.panel} .crack-ui-row-name,
      html[data-theme="light"] #${ID.panel} .crack-ui-row-name,
      body[data-theme="light"] #${ID.panel} .crack-ui-choice-title,
      html[data-theme="light"] #${ID.panel} .crack-ui-choice-title {
        color: rgba(17, 24, 39, .94);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-row-desc,
      html[data-theme="light"] #${ID.panel} .crack-ui-row-desc {
        color: rgba(75, 85, 99, .72);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-range-value,
      html[data-theme="light"] #${ID.panel} .crack-ui-range-value,
      body[data-theme="light"] #${ID.panel} .crack-ui-choice-value,
      html[data-theme="light"] #${ID.panel} .crack-ui-choice-value {
        color: rgba(75, 85, 99, .86);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-section,
      html[data-theme="light"] #${ID.panel} .crack-ui-section {
        background: rgba(17, 24, 39, .035);
        border-color: rgba(17, 24, 39, .065);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-section-head,
      html[data-theme="light"] #${ID.panel} .crack-ui-section-head {
        color: rgba(17, 24, 39, .92);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-section-head:hover,
      html[data-theme="light"] #${ID.panel} .crack-ui-section-head:hover {
        background: rgba(17, 24, 39, .055);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-section-chevron,
      html[data-theme="light"] #${ID.panel} .crack-ui-section-chevron {
        color: rgba(75, 85, 99, .62);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-section-head:hover .crack-ui-section-chevron,
      html[data-theme="light"] #${ID.panel} .crack-ui-section-head:hover .crack-ui-section-chevron {
        background: rgba(17, 24, 39, .07);
        color: rgba(17, 24, 39, .82);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-panel-close,
      html[data-theme="light"] #${ID.panel} .crack-ui-panel-close {
        background: rgba(17, 24, 39, .06);
        color: rgba(75, 85, 99, .78);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-panel-close:hover,
      html[data-theme="light"] #${ID.panel} .crack-ui-panel-close:hover {
        background: rgba(17, 24, 39, .10);
        color: rgba(17, 24, 39, .92);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-row,
      html[data-theme="light"] #${ID.panel} .crack-ui-row,
      body[data-theme="light"] #${ID.panel} .crack-ui-range-row,
      html[data-theme="light"] #${ID.panel} .crack-ui-range-row,
      body[data-theme="light"] #${ID.panel} .crack-ui-choice-group,
      html[data-theme="light"] #${ID.panel} .crack-ui-choice-group {
        background: rgba(255, 255, 255, .72);
        border-color: rgba(17, 24, 39, .075);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-row:hover,
      html[data-theme="light"] #${ID.panel} .crack-ui-row:hover,
      body[data-theme="light"] #${ID.panel} .crack-ui-range-row:hover,
      html[data-theme="light"] #${ID.panel} .crack-ui-range-row:hover {
        background: rgba(255, 255, 255, .88);
        border-color: rgba(17, 24, 39, .12);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-range-row[data-disabled="1"]:hover,
      html[data-theme="light"] #${ID.panel} .crack-ui-range-row[data-disabled="1"]:hover {
        background: rgba(255, 255, 255, .72);
        border-color: rgba(17, 24, 39, .075);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-choice-row,
      html[data-theme="light"] #${ID.panel} .crack-ui-choice-row {
        background: rgba(17, 24, 39, .035);
        border-color: rgba(17, 24, 39, .075);
        color: rgba(17, 24, 39, .88);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-choice-row:hover,
      html[data-theme="light"] #${ID.panel} .crack-ui-choice-row:hover {
        background: rgba(17, 24, 39, .055);
        border-color: rgba(17, 24, 39, .12);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-choice-row[data-selected="1"],
      html[data-theme="light"] #${ID.panel} .crack-ui-choice-row[data-selected="1"] {
        background: rgba(52, 199, 89, .16);
        border-color: rgba(52, 199, 89, .48);
        color: rgba(17, 24, 39, .96);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-choice-mark,
      html[data-theme="light"] #${ID.panel} .crack-ui-choice-mark {
        border-color: rgba(17, 24, 39, .18);
        background: rgba(120, 120, 128, .18);
        color: #fff;
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-switch,
      html[data-theme="light"] #${ID.panel} .crack-ui-switch {
        background: rgba(120, 120, 128, .28);
        box-shadow:
          inset 0 0 0 1px rgba(17, 24, 39, .07),
          inset 0 1px 2px rgba(0, 0, 0, .08);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-toggle:checked + .crack-ui-switch,
      html[data-theme="light"] #${ID.panel} .crack-ui-toggle:checked + .crack-ui-switch {
        background: #34C759;
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, .08),
          inset 0 1px 2px rgba(0, 0, 0, .08);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-choice-row[data-selected="1"] .crack-ui-choice-mark,
      html[data-theme="light"] #${ID.panel} .crack-ui-choice-row[data-selected="1"] .crack-ui-choice-mark {
        border-color: #34C759;
        background: #34C759;
        color: #fff;
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-range::-webkit-slider-runnable-track,
      html[data-theme="light"] #${ID.panel} .crack-ui-range::-webkit-slider-runnable-track {
        background: rgba(120, 120, 128, .34);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-range::-moz-range-track,
      html[data-theme="light"] #${ID.panel} .crack-ui-range::-moz-range-track {
        background: rgba(120, 120, 128, .34);
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

  function isChatWidthSupportedViewport() {
    return window.matchMedia('(min-width: 768px)').matches;
  }

  function getResolvedThemeMode(mode = themeMode) {
    return normalizeThemeMode(mode);
  }

  function applyThemeModeHint() {
    const resolved = getResolvedThemeMode(themeMode);
    const root = document.documentElement;
    const body = document.body;

    root.classList.toggle('dark', resolved === 'dark');
    root.classList.toggle('light', resolved === 'light');
    root.dataset.theme = resolved;
    root.dataset.crackUiThemeMode = resolved;
    root.style.colorScheme = resolved;

    if (body) {
      body.dataset.theme = resolved;
      body.style.colorScheme = resolved;
    }
  }

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function findOriginalSettingRow(label) {
    const panel = document.getElementById(ID.panel);
    const target = normalizeText(label);
    const candidates = document.querySelectorAll('span, button, div, label');

    for (const node of candidates) {
      if (panel?.contains(node)) continue;
      if (normalizeText(node.textContent) !== target) continue;

      const row = node.closest('[role="checkbox"], button, label, .cursor-pointer');
      if (!row || panel?.contains(row)) continue;
      return row;
    }

    return null;
  }

  function isOriginalSettingChecked(label) {
    const row = findOriginalSettingRow(label);
    if (!row) return null;

    const control = row.matches('[role="checkbox"]')
      ? row
      : row.querySelector('[role="checkbox"]');

    if (!control) return null;
    const state = control.getAttribute('data-state');
    const checked = control.getAttribute('aria-checked');

    return state === 'checked' || checked === 'true';
  }

  function dispatchSyntheticClick(target) {
    if (!target) return false;

    const pointerOptions = {
      bubbles: true,
      cancelable: true,
      view: window,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
      buttons: 1,
    };
    const mouseOptions = {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      buttons: 1,
    };

    try {
      target.dispatchEvent(new PointerEvent('pointerdown', pointerOptions));
      target.dispatchEvent(new MouseEvent('mousedown', mouseOptions));
      target.dispatchEvent(new PointerEvent('pointerup', { ...pointerOptions, buttons: 0 }));
      target.dispatchEvent(new MouseEvent('mouseup', { ...mouseOptions, buttons: 0 }));
      target.dispatchEvent(new MouseEvent('click', { ...mouseOptions, buttons: 0 }));
      if (typeof target.click === 'function') target.click();
      return true;
    } catch {
      try {
        target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        if (typeof target.click === 'function') target.click();
        return true;
      } catch {
        return false;
      }
    }
  }

  function clickOriginalSettingRow(label) {
    const row = findOriginalSettingRow(label);
    if (!row) return false;

    const control = row.matches('[role="checkbox"]')
      ? row
      : row.querySelector('[role="checkbox"]');

    const clickedControl = dispatchSyntheticClick(control);
    const clickedRow = dispatchSyntheticClick(row);
    return clickedControl || clickedRow;
  }

  function applyOriginalSettingChoice(mode, labels, pendingKey) {
    const label = labels[mode];
    if (!label) return false;

    const checked = isOriginalSettingChecked(label);
    if (checked === true) {
      removeStorage(pendingKey);
      return true;
    }

    if (clickOriginalSettingRow(label)) {
      removeStorage(pendingKey);
      return true;
    }

    writeStorage(pendingKey, mode);
    return false;
  }

  function getEpisodeUiPayload(mode) {
    return {
      isEpisodeBubbleEnabled: normalizeEpisodeUiMode(mode) === 'chat',
    };
  }

  function scheduleEpisodeUiReload(delay = 450) {
    clearTimeout(episodeUiReloadTimer);
    episodeUiReloadTimer = setTimeout(() => {
      episodeUiReloadTimer = null;
      flushImageSizeSave();
      flushChatWidthSave();

      try {
        window.location.reload();
      } catch {
        try {
          window.location.href = window.location.href;
        } catch {
        }
      }
    }, delay);
  }

  function parseEpisodeUiResponseText(text) {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  function readCookie(name) {
    try {
      const prefix = `${encodeURIComponent(name)}=`;
      const found = String(document.cookie || '')
        .split(';')
        .map((item) => item.trim())
        .find((item) => item.startsWith(prefix));
      if (!found) return '';
      return decodeURIComponent(found.slice(prefix.length));
    } catch {
      return '';
    }
  }

  function getCrackAccessToken() {
    const fromCookie = readCookie('access_token');
    if (fromCookie) return fromCookie;

    const storageKeys = [
      'access_token',
      'accessToken',
      'crack_access_token',
      'wrtn_access_token',
    ];

    for (const key of storageKeys) {
      const value = readStorage(key);
      if (value && /^eyJ|^Bearer\s+/i.test(value)) return value;
    }

    return '';
  }

  function makeBearerToken(value) {
    const token = String(value || '').trim();
    if (!token) return '';
    return /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`;
  }

  function getCrackUiSettingHeaders() {
    const headers = {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      platform: 'web',
      'wrtn-locale': 'ko-KR',
    };

    const bearer = makeBearerToken(getCrackAccessToken());
    if (bearer) headers.Authorization = bearer;

    const wrtnId = readCookie('__w_id');
    if (wrtnId) headers['x-wrtn-id'] = wrtnId;

    const mixpanelDistinctId = readCookie('Mixpanel-Distinct-Id');
    if (mixpanelDistinctId) headers['mixpanel-distinct-id'] = mixpanelDistinctId;

    return headers;
  }

  async function requestEpisodeUiModeWithFetch(payload) {
    const response = await fetch(CRACK_API.episodeUiSetting, {
      method: 'PATCH',
      mode: 'cors',
      credentials: 'include',
      cache: 'no-store',
      headers: getCrackUiSettingHeaders(),
      body: JSON.stringify(payload),
    });

    const text = await response.text().catch(() => '');
    const result = parseEpisodeUiResponseText(text);

    if (!response.ok) {
      const error = new Error(`fetch ui-setting ${response.status}`);
      error.status = response.status;
      error.result = result;
      throw error;
    }

    return result;
  }

  function requestEpisodeUiModeWithGm(payload) {
    const gmRequest = typeof GM_xmlhttpRequest === 'function' ? GM_xmlhttpRequest : null;
    if (!gmRequest) {
      return Promise.reject(new Error('GM_xmlhttpRequest unavailable'));
    }

    return new Promise((resolve, reject) => {
      gmRequest({
        method: 'PATCH',
        url: CRACK_API.episodeUiSetting,
        headers: getCrackUiSettingHeaders(),
        data: JSON.stringify(payload),
        withCredentials: true,
        anonymous: false,
        timeout: 10000,
        onload: (response) => {
          const result = parseEpisodeUiResponseText(response.responseText || '');
          if (response.status >= 200 && response.status < 300) {
            resolve(result);
            return;
          }

          const error = new Error(`GM ui-setting ${response.status}`);
          error.status = response.status;
          error.result = result;
          reject(error);
        },
        onerror: () => reject(new Error('GM ui-setting network error')),
        ontimeout: () => reject(new Error('GM ui-setting timeout')),
        onabort: () => reject(new Error('GM ui-setting aborted')),
      });
    });
  }

  function describeEpisodeUiError(error) {
    const status = error?.status ? `status ${error.status}` : '';
    const result = error?.result ? ` / ${typeof error.result === 'string' ? error.result : JSON.stringify(error.result)}` : '';
    return `${error?.message || String(error)}${status ? ` (${status})` : ''}${result}`;
  }

  function showEpisodeUiSaveError(mode, error) {
    const label = EPISODE_UI_MODE_LABEL[normalizeEpisodeUiMode(mode)] || '작품 UI';
    const tokenHint = getCrackAccessToken()
      ? 'access_token 감지됨'
      : 'access_token 쿠키를 못 찾음';
    const message = `Crack UI Plus: ${label} 저장 실패\n${describeEpisodeUiError(error)}\n${tokenHint}\n\n원본 설정에서는 되는 상태면 이 문구를 그대로 보내줘.`;
    writeStorage(LS.lastEpisodeUiError, message);
    console.warn('[Crack UI Plus] episode UI setting save failed', error);
    try {
      window.alert(message);
    } catch {
    }
  }

  async function saveEpisodeUiModeToCrack(mode, options = {}) {
    const nextMode = normalizeEpisodeUiMode(mode);
    const payload = getEpisodeUiPayload(nextMode);
    const requestSeq = ++episodeUiSaveRequestSeq;
    const reload = options.reload !== false;
    const errors = [];

    let result = null;

    try {
      result = await requestEpisodeUiModeWithFetch(payload);
    } catch (error) {
      errors.push(error);
      try {
        result = await requestEpisodeUiModeWithGm(payload);
      } catch (gmError) {
        errors.push(gmError);
        const combined = new Error(errors.map(describeEpisodeUiError).join(' | '));
        combined.errors = errors;
        throw combined;
      }
    }

    if (requestSeq !== episodeUiSaveRequestSeq) return result;

    removeStorage(LS.pendingEpisodeUiMode);
    removeStorage(LS.lastEpisodeUiError);
    writeStorage(LS.episodeUiMode, nextMode);
    episodeUiMode = nextMode;
    updateThemeUi();

    window.dispatchEvent(new CustomEvent('crack-ui-episode-ui-mode-change', {
      detail: {
        mode: nextMode,
        isEpisodeBubbleEnabled: nextMode === 'chat',
        payload,
        result,
      },
    }));

    if (reload) scheduleEpisodeUiReload(450);
    return result;
  }

  function syncThemeStateFromOriginalSettings() {
    for (const [mode, label] of Object.entries(THEME_MODE_LABEL)) {
      if (isOriginalSettingChecked(label) === true && themeMode !== mode) {
        themeMode = normalizeThemeMode(mode);
        writeStorage(LS.themeMode, themeMode);
        applyThemeModeHint();
        break;
      }
    }

    for (const [mode, label] of Object.entries(EPISODE_UI_MODE_LABEL)) {
      if (isOriginalSettingChecked(label) === true && episodeUiMode !== mode) {
        episodeUiMode = normalizeEpisodeUiMode(mode);
        writeStorage(LS.episodeUiMode, episodeUiMode);
        break;
      }
    }
  }

  function applyPendingThemeChoices() {
    const rawPendingTheme = readStorage(LS.pendingThemeMode);
    if (rawPendingTheme === 'light' || rawPendingTheme === 'dark') {
      applyOriginalSettingChoice(rawPendingTheme, THEME_MODE_LABEL, LS.pendingThemeMode);
    } else if (rawPendingTheme != null) {
      removeStorage(LS.pendingThemeMode);
    }

    const rawPendingEpisode = readStorage(LS.pendingEpisodeUiMode);
    if (rawPendingEpisode != null) {
      const pendingEpisode = normalizeEpisodeUiMode(rawPendingEpisode);
      saveEpisodeUiModeToCrack(pendingEpisode, { reload: false }).catch(() => {
        applyOriginalSettingChoice(pendingEpisode, EPISODE_UI_MODE_LABEL, LS.pendingEpisodeUiMode);
      });
    }
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

    const suffixMatch = raw.match(/_gif(\d+)(\.[a-z0-9]+)(?=([?#]|$))/i);
    const size = suffixMatch?.[1] || '600';
    const ext = suffixMatch?.[2] || '.webp';
    if (suffixMatch) {
      addUniqueUrl(candidates, raw.replace(new RegExp(`(?:_q\\d+)+_gif${size}${ext.replace('.', '\\.')}(?=([?#]|$))`, 'i'), `_w${size}${ext}`));
      addUniqueUrl(candidates, raw.replace(new RegExp(`_gif${size}${ext.replace('.', '\\.')}(?=([?#]|$))`, 'i'), `_w${size}${ext}`));
      addUniqueUrl(candidates, raw.replace(new RegExp(`_q\\d+_gif${size}${ext.replace('.', '\\.')}(?=([?#]|$))`, 'i'), `_w${size}${ext}`));
    }

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

    const alt = img.getAttribute('alt') || '';
    const src = img.getAttribute('src') || img.currentSrc || img.src || '';
    if (alt === 'crack original') return false;
    if (/\/crack\/original\//i.test(src)) return false;
    if (/\/asset\/badge\//i.test(src)) return false;
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
    const supported = isChatWidthSupportedViewport();

    document.documentElement.classList.toggle(CLS.chatWidthCustom, customWidth && supported);

    if (!supported) {
      isChatWidthDragging = false;
      document.documentElement.classList.remove(CLS.widthDragging);
    }

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
    const row = slider?.closest('[data-crack-ui-chat-width-row]');
    const supported = isChatWidthSupportedViewport();

    if (row) {
      row.dataset.disabled = supported ? '0' : '1';
      row.setAttribute('aria-disabled', supported ? 'false' : 'true');
    }

    if (slider) {
      slider.value = String(chatWidthPercent);
      slider.disabled = !supported;
      slider.title = supported ? '' : 'PC/태블릿 전용';
    }

    if (value) {
      value.textContent = supported ? formatChatWidthDisplay(chatWidthPercent) : 'PC/태블릿 전용';
    }
  }

  function updateThemeUi() {
    document.querySelectorAll('[data-crack-ui-theme-mode]').forEach((button) => {
      const selected = normalizeThemeMode(button.dataset.crackUiThemeMode) === themeMode;
      button.dataset.selected = selected ? '1' : '0';
      button.setAttribute('aria-checked', selected ? 'true' : 'false');
    });

    document.querySelectorAll('[data-crack-ui-episode-ui-mode]').forEach((button) => {
      const selected = normalizeEpisodeUiMode(button.dataset.crackUiEpisodeUiMode) === episodeUiMode;
      button.dataset.selected = selected ? '1' : '0';
      button.setAttribute('aria-checked', selected ? 'true' : 'false');
    });

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

  function setThemeMode(nextMode) {
    themeMode = normalizeThemeMode(nextMode);
    writeStorage(LS.themeMode, themeMode);
    writeStorage('theme', themeMode);
    applyThemeModeHint();
    updateThemeUi();
    applyOriginalSettingChoice(themeMode, THEME_MODE_LABEL, LS.pendingThemeMode);
  }

  function setEpisodeUiMode(nextMode) {
    episodeUiMode = normalizeEpisodeUiMode(nextMode);
    writeStorage(LS.episodeUiMode, episodeUiMode);
    writeStorage(LS.pendingEpisodeUiMode, episodeUiMode);
    updateThemeUi();

    applyOriginalSettingChoice(episodeUiMode, EPISODE_UI_MODE_LABEL, LS.pendingEpisodeUiMode);
    saveEpisodeUiModeToCrack(episodeUiMode, { reload: true }).catch((error) => {
      writeStorage(LS.pendingEpisodeUiMode, episodeUiMode);
      updateThemeUi();
      showEpisodeUiSaveError(episodeUiMode, error);
    });
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
    if (cachedHeader && cachedHeader.isConnected) return cachedHeader;
    cachedHeader = null;

    const byId = document.querySelector('#wrtn-custom-global-header');
    if (byId) {
      cachedHeader = byId;
      return byId;
    }

    const byHeight = document.querySelector('div[height="56"][width="100%"]');
    if (byHeight) {
      byHeight.dataset.crackUiHeader = '1';
      cachedHeader = byHeight;
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
    if (found) {
      found.dataset.crackUiHeader = '1';
      cachedHeader = found;
    }
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
    setPanelSectionOpen('theme', themeSectionOpen);
    setPanelSectionOpen('chat', chatSectionOpen);
  }

  function setSavedPanelSectionOpen(sectionName, isOpen) {
    if (sectionName === 'display') {
      displaySectionOpen = isOpen;
      writeStorage(LS.sectionDisplayOpen, isOpen ? '1' : '0');
    } else if (sectionName === 'theme') {
      themeSectionOpen = isOpen;
      writeStorage(LS.sectionThemeOpen, isOpen ? '1' : '0');
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

  function bindChoiceButtons(panel) {
    panel.querySelectorAll('[data-crack-ui-theme-mode]').forEach((button) => {
      if (button.dataset.crackUiBound === '1') return;
      button.dataset.crackUiBound = '1';
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setThemeMode(button.dataset.crackUiThemeMode);
      });
    });

    panel.querySelectorAll('[data-crack-ui-episode-ui-mode]').forEach((button) => {
      if (button.dataset.crackUiBound === '1') return;
      button.dataset.crackUiBound = '1';
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setEpisodeUiMode(button.dataset.crackUiEpisodeUiMode);
      });
    });
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

        <div class="crack-ui-section" data-crack-ui-section="theme" data-open="${themeSectionOpen ? '1' : '0'}">
          <button
            type="button"
            class="crack-ui-section-head"
            data-crack-ui-section-toggle="theme"
            aria-expanded="${themeSectionOpen ? 'true' : 'false'}"
          >
            <span>
              <span class="crack-ui-section-title">테마</span>
            </span>
            <span class="crack-ui-section-chevron" aria-hidden="true">›</span>
          </button>

          <div class="crack-ui-section-body" data-crack-ui-section-body="theme">
            <div class="crack-ui-choice-group">
              <div class="crack-ui-choice-head">
                <span class="crack-ui-choice-title">색상</span>
              </div>
              <div class="crack-ui-choice-list">
                <button type="button" role="checkbox" class="crack-ui-choice-row" data-crack-ui-theme-mode="light" data-selected="${themeMode === 'light' ? '1' : '0'}" aria-checked="${themeMode === 'light' ? 'true' : 'false'}">
                  <span class="crack-ui-choice-mark" aria-hidden="true"></span>
                  <span class="crack-ui-choice-name">라이트 모드</span>
                </button>
                <button type="button" role="checkbox" class="crack-ui-choice-row" data-crack-ui-theme-mode="dark" data-selected="${themeMode === 'dark' ? '1' : '0'}" aria-checked="${themeMode === 'dark' ? 'true' : 'false'}">
                  <span class="crack-ui-choice-mark" aria-hidden="true"></span>
                  <span class="crack-ui-choice-name">다크 모드</span>
                </button>
              </div>
            </div>

            <div class="crack-ui-choice-group">
              <div class="crack-ui-choice-head">
                <span class="crack-ui-choice-title">작품</span>
              </div>
              <div class="crack-ui-choice-list">
                <button type="button" role="checkbox" class="crack-ui-choice-row" data-crack-ui-episode-ui-mode="novel" data-selected="${episodeUiMode === 'novel' ? '1' : '0'}" aria-checked="${episodeUiMode === 'novel' ? 'true' : 'false'}">
                  <span class="crack-ui-choice-mark" aria-hidden="true"></span>
                  <span class="crack-ui-choice-name">소설형 UI</span>
                </button>
                <button type="button" role="checkbox" class="crack-ui-choice-row" data-crack-ui-episode-ui-mode="chat" data-selected="${episodeUiMode === 'chat' ? '1' : '0'}" aria-checked="${episodeUiMode === 'chat' ? 'true' : 'false'}">
                  <span class="crack-ui-choice-mark" aria-hidden="true"></span>
                  <span class="crack-ui-choice-name">채팅형 UI</span>
                </button>
              </div>
            </div>
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

            <div class="crack-ui-range-row" data-crack-ui-chat-width-row data-disabled="${isChatWidthSupportedViewport() ? '0' : '1'}" aria-disabled="${isChatWidthSupportedViewport() ? 'false' : 'true'}">
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
    bindChoiceButtons(panel);
    syncPanelSections();
    updateThemeUi();

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

    syncThemeStateFromOriginalSettings();
    syncPanelSections();
    updateThemeUi();
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
    applyThemeModeHint();
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
      applyChatWidth();
      updateChatWidthUi();

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

  function shouldEnforceThemeMode() {
    const saved = readStorage(LS.themeMode);
    return saved === 'light' || saved === 'dark';
  }

  function syncOrRestoreBodyTheme() {
    const actual = document.body?.dataset?.theme;
    if (actual !== 'light' && actual !== 'dark') {
      applyThemeModeHint();
      return;
    }

    if (shouldEnforceThemeMode()) {
      if (actual !== themeMode) applyThemeModeHint();
      return;
    }

    if (actual !== themeMode) {
      themeMode = actual;
      updateThemeUi();
    }
  }

  const INIT_THROTTLE_MS = 300;

  function runInit() {
    lastInitRun = performance.now();
    init();
  }

  function scheduleInit() {
    if (initScheduled) return;
    initScheduled = true;

    const elapsed = performance.now() - lastInitRun;
    const delay = elapsed >= INIT_THROTTLE_MS ? 0 : INIT_THROTTLE_MS - elapsed;

    clearTimeout(initThrottleTimer);
    initThrottleTimer = setTimeout(() => {
      initThrottleTimer = null;
      requestAnimationFrame(() => {
        initScheduled = false;
        runInit();
      });
    }, delay);
  }

  function init() {
    cleanupOldStuffOnce();
    ensureRevealZone();
    ensurePanel();
    markStatBars();
    if (!pendingThemeApplied) {
      pendingThemeApplied = true;
      syncThemeStateFromOriginalSettings();
      applyPendingThemeChoices();
    }
    updateThemeUi();
    bindGlobal();

    const header = findHeader();
    if (header) {
      bindHeaderHover(header);
      ensureGearButtons(header);
    }

    applyImageSize();
    applyThemeModeHint();
    applyChatWidth();
    applyState();
    scheduleAnimatedThumbState();
  }

  function observeThemeDomGuard() {
    if (!document.body || document.body.dataset.crackUiThemeGuardBound === '1') return;
    document.body.dataset.crackUiThemeGuardBound = '1';

    const themeMo = new MutationObserver(() => {
      requestAnimationFrame(syncOrRestoreBodyTheme);
    });

    themeMo.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
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
        if (pauseAnimatedThumbs) scheduleAnimatedThumbState();
        return;
      }

      scheduleInit();
    });
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset'],
    });
  }

  ready(() => {
    runInit();
    observeThemeDomGuard();
    observe();
  });
})();

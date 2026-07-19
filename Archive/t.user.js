// ==UserScript==
// @name         Crack UI Plus
// @namespace    https://github.com/Dflashh/Crack
// @version      2.5.5
// @description  Crack을 더 가볍고 편하게
// @match        *://crack.wrtn.ai/*
// @author       깡통들과 나
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      crack-api.wrtn.ai
// @icon         https://cdn.jsdelivr.net/gh/Dflashh/Crack@main/Icon/UI.webp
// @downloadURL  https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackUI.user.js
// @updateURL    https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackUI.user.js
// ==/UserScript==

(() => {
  'use strict';

  const CRACK_UI_VERSION = '2.5.5';

  function getCrackUiPublicWindow() {
    try {
      if (typeof unsafeWindow !== 'undefined' && unsafeWindow) return unsafeWindow;
    } catch {
    }

    return window;
  }

  function exposeCrackUiPublicApi(api) {
    try {
      const publicWindow = getCrackUiPublicWindow();
      publicWindow.CrackUIPlus = Object.assign(publicWindow.CrackUIPlus || {}, api);
      return true;
    } catch {
    }

    try {
      window.CrackUIPlus = Object.assign(window.CrackUIPlus || {}, api);
      return true;
    } catch {
      return false;
    }
  }

  // =====================================================
  // Core: constants / storage / state
  // =====================================================

  const ID = {
    zone: 'crack-ui-reveal-zone',
    handle: 'crack-ui-mobile-handle',
    panel: 'crack-ui-settings-panel',
    panelBackdrop: 'crack-ui-settings-backdrop',
    panelRoot: 'crack-ui-settings-root',
    gearDesktop: 'crack-ui-gear-desktop',
    gearMobile: 'crack-ui-gear-mobile',
    toggleHeader: 'crack-ui-toggle-header',
    toggleLineBreak: 'crack-ui-toggle-line-break',
    toggleAnimatedThumbs: 'crack-ui-toggle-animated-thumbs',
    toggleStatBar: 'crack-ui-toggle-stat-bar',
    toggleBottomModelPicker: 'crack-ui-toggle-bottom-model-picker',
    toggleEmptySendGuard: 'crack-ui-toggle-empty-send-guard',
    toggleHideSituationImage: 'crack-ui-toggle-hide-situation-image',
    toggleNovelModelIndicator: 'crack-ui-toggle-novel-model-indicator',
    imageSlider: 'crack-ui-image-size-slider',
    imageValue: 'crack-ui-image-size-value',
    chatWidthSlider: 'crack-ui-chat-width-slider',
    chatWidthValue: 'crack-ui-chat-width-value',
    bottomModelButton: 'crack-ui-bottom-model-button',
    bottomModelPopup: 'crack-ui-bottom-model-popup',
    visibleModelDisclosure: 'crack-ui-visible-model-disclosure',
    visibleModelPanel: 'crack-ui-visible-model-panel',
    officialModelVisibilityStyle: 'crack-ui-official-model-visibility-style',
    roomMenuZone: 'crack-ui-room-menu-zone',
    roomMenuHandle: 'crack-ui-room-menu-handle',
    toggleRoomMenuHandle: 'crack-ui-toggle-room-menu-handle',
    roomMenuModeButton: 'crack-ui-room-menu-mode-button',
    roomMenuModePanel: 'crack-ui-room-menu-mode-panel',
    chatListZone: 'crack-ui-chat-list-zone',
    chatListHandle: 'crack-ui-chat-list-handle',
    toggleChatListAutoHide: 'crack-ui-toggle-chat-list-auto-hide',
    chatListModeButton: 'crack-ui-chat-list-mode-button',
    chatListModePanel: 'crack-ui-chat-list-mode-panel',
    menuSwipeZone: 'crack-ui-menu-swipe-zone',
    toggleFullscreenButton: 'crack-ui-toggle-fullscreen-button',
    fullscreenButton: 'fullscreen-toolbar-btn',
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
    panelActiveSection: 'crack_ui_panel_active_section',
    bottomModelPicker: 'crack_ui_bottom_model_picker',
    emptySendGuard: 'crack_ui_empty_send_guard',
    hideSituationImage: 'crack_ui_hide_situation_image',
    novelModelIndicator: 'crack_ui_novel_model_indicator',
    novelModelMessageCache: 'crack_ui_novel_model_message_cache_v1',
    novelModelManualMap: 'crack_ui_novel_model_manual_map_v1',
    novelModelCatalog: 'crack_ui_novel_model_catalog_v1',
    bottomModelVisibleModels: 'crack_ui_bottom_model_visible_models',
    bottomModelRegistry: 'crack_ui_bottom_model_registry_v2',
    bottomModelVisibleModelsOpen: 'crack_ui_bottom_model_visible_models_open',
    roomMenuHandle: 'crack_ui_room_menu_handle',
    roomMenuAssistMode: 'crack_ui_room_menu_assist_mode',
    chatListAutoHide: 'crack_ui_chat_list_auto_hide',
    chatListAssistMode: 'crack_ui_chat_list_assist_mode',
    fullscreenButton: 'crack_ui_fullscreen_button',
  };

  const CLS = {
    autoHide: 'crack-ui-autohide-header',
    reveal: 'crack-ui-header-reveal',
    panelOpen: 'crack-ui-panel-open',
    lineBreak: 'crack-ui-line-break-optimize',
    pauseAnimatedThumbs: 'crack-ui-pause-animated-thumbs',
    hideStatBar: 'crack-ui-hide-stat-bar',
    hideSituationImage: 'crack-ui-hide-situation-image',
    chatWidthCustom: 'crack-ui-chat-width-custom',
    widthDragging: 'crack-ui-width-dragging',
    rangePreview: 'crack-ui-range-preview',
    roomMenuEnabled: 'crack-ui-room-menu-enabled',
    roomMenuReveal: 'crack-ui-room-menu-reveal',
    chatListEnabled: 'crack-ui-chat-list-enabled',
    chatListMobilePopoverOpen: 'crack-ui-chat-list-mobile-popover-open',
    chatListMobileHeaderGapCompensated: 'crack-ui-chat-list-mobile-header-gap-compensated',
    roomTopBarHidden: 'crack-ui-room-top-bar-hidden',
    phoneViewport: 'crack-ui-phone-viewport',
    tabletViewport: 'crack-ui-tablet-viewport',
    androidFirefox: 'crack-ui-android-firefox',
  };

  const THEME_MODE_LABEL = {
    light: '라이트 모드',
    dark: '다크 모드',
  };

  const EPISODE_UI_MODE_LABEL = {
    novel: '소설형 UI',
    chat: '채팅형 UI',
  };

  const MENU_ASSIST_MODE_LABEL = Object.freeze({
    handle: '핸들',
    swipe: '슬라이더',
    both: '둘 다',
  });

  const MENU_SWIPE = Object.freeze({
    minDx: 48,
    maxDy: 40,
    ratio: 2,
    maxMs: 600,
    cooldownMs: 600,
    topOffset: 36,
  });

  let cachedAndroidFirefoxBrowser = null;
  let cachedIosDevice = null;

  function normalizeMenuAssistMode(value) {
    const mode = String(value || '').toLowerCase();
    return Object.prototype.hasOwnProperty.call(MENU_ASSIST_MODE_LABEL, mode) ? mode : 'handle';
  }

  function menuAssistModeHasHandle(mode) {
    const normalized = normalizeMenuAssistMode(mode);
    return normalized === 'handle' || normalized === 'both';
  }

  function menuAssistModeHasSwipe(mode) {
    const normalized = normalizeMenuAssistMode(mode);
    return normalized === 'swipe' || normalized === 'both';
  }

  const CRACK_API = {
    episodeUiSetting: 'https://crack-api.wrtn.ai/crack-api/profiles/ui-setting',
  };

  const EPISODE_UI_REQUEST_TIMEOUT_MS = 10000;

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

  function loadBottomModelPicker() {
    const raw = readStorage(LS.bottomModelPicker);
    if (raw == null) return false;
    return raw === '1';
  }

  function loadEmptySendGuard() {
    const raw = readStorage(LS.emptySendGuard);
    if (raw == null) return true;
    return raw === '1';
  }

  function loadHideSituationImage() {
    const raw = readStorage(LS.hideSituationImage);
    if (raw == null) return false;
    return raw === '1';
  }

  function loadNovelModelIndicator() {
    const raw = readStorage(LS.novelModelIndicator);
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

  let autoHideHeader = readStorage(LS.autoHideHeader) === '1';
  let imageSize = loadImageSize();
  let lineBreakOptimize = loadLineBreakOptimize();
  let pauseAnimatedThumbs = loadPauseAnimatedThumbs();
  let hideStatBar = loadHideStatBar();
  let bottomModelPicker = loadBottomModelPicker();
  let emptySendGuard = loadEmptySendGuard();
  let hideSituationImage = loadHideSituationImage();
  let novelModelIndicator = loadNovelModelIndicator();
  let roomMenuHandle = readStorage(LS.roomMenuHandle) === '1';
  let roomMenuAssistMode = normalizeMenuAssistMode(readStorage(LS.roomMenuAssistMode, 'handle'));
  let chatListAutoHide = readStorage(LS.chatListAutoHide) === '1';
  let chatListAssistMode = normalizeMenuAssistMode(readStorage(LS.chatListAssistMode, 'handle'));
  let fullscreenButtonEnabled = !isIosDevice() && readStorage(LS.fullscreenButton) === '1';

  if (isIosDevice()) {
    writeStorage(LS.fullscreenButton, '0');
  }
  let chatWidthPercent = loadChatWidthPercent();
  let themeMode = loadThemeMode();
  let episodeUiMode = loadEpisodeUiMode();
  let activePanelSection = ['display', 'chat'].includes(readStorage(LS.panelActiveSection))
    ? readStorage(LS.panelActiveSection)
    : 'chat';

  let panelOpen = false;
  let pointerOnZone = false;
  let pointerOnHeader = false;
  let mobileReveal = false;
  let mobileHideTimer = null;
  let roomMenuReveal = false;
  let roomMenuForceReveal = false;
  let roomMenuForceRevealTimer = null;
  let lastRoomMenuHandleOpenAt = 0;
  let lastRoomMenuNativeButtonClickAt = 0;
  let lastMenuSwipeAt = 0;
  let menuSwipePositionRaf = 0;
  let chatListCloseTimer = null;
  let lastChatListClickAt = 0;
  let lastChatListHandleOpenAt = 0;
  let lastChatListBootCloseHref = '';
  let cleanedOnce = false;
  let imageSizeSaveTimer = null;
  let chatWidthSaveTimer = null;
  let episodeUiSaveRequestSeq = 0;
  let episodeUiReloadTimer = null;
  let isChatWidthDragging = false;
  let activePanelRangePreviewInput = null;
  let animatedThumbRafPending = false;
  let animatedThumbUrlMap = null;
  let animatedThumbStillUrlStatus = new Map();
  let animatedThumbStillCandidateCache = new Map();
  let cachedHeader = null;
  let initScheduled = false;
  let lastInitRun = 0;
  let initThrottleTimer = null;
  let pendingThemeApplied = false;
  let cachedBottomSendButton = null;
  let cachedComposerEditable = null;
  let emptySendGuardUiRaf = 0;
  let cachedOriginalModelButton = null;
  let cachedRoomMenuButton = null;
  let cachedChatListPanel = null;
  let cachedChatListToggle = null;
  let cachedMobileChatListToggle = null;
  let mobileChatListCleanupPending = true;
  let cachedRoomPanel = null;
  let cachedRoomPanelToggle = null;
  let situationImageMarkTimer = null;
  let situationImageMarkRaf = 0;
  let situationImageLastScanAt = 0;
  let cachedRoomTopBar = null;
  let cachedRoomStatBar = null;
  let lastRoomTopBarInputInteractionAt = 0;
  let roomPanelCloseTimer = null;
  let lastRoomPanelClickAt = 0;
  let roomPanelTouchOpenGuardUntil = 0;
  let lastRoomPanelToggleAttempt = null;
  let roomPanelToggleRequestSeq = 0;
  let roomPanelToggleVerifyTimer = null;
  let lastRoomPanelBootCloseHref = '';
  let novelModelIndicatorScanTimer = null;
  let novelModelIndicatorScanRaf = 0;
  let novelModelIndicatorLastScanAt = 0;
  let novelModelIndicatorCleanupPending = true;
  let pendingNovelModelCapture = null;
  let pendingNovelModelObserver = null;
  let pendingNovelModelExpiryTimer = null;
  let novelModelNetworkCaptureInstalled = false;
  let novelModelNetworkPayloadCount = 0;
  let novelModelNetworkLastUrl = '';
  let novelModelNetworkLastMatchCount = 0;
  let novelModelNetworkMessageRevision = 0;
  let novelModelStaticScanRoomKey = '';
  let novelModelStaticScanCount = 0;
  const novelModelNetworkCandidates = new Map();
  const novelModelNetworkMessages = new Map();
  const novelModelFingerprintIndex = new Map();
  const novelModelNetworkInfoByName = new Map();
  let lastCrackUiError = null;

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

  // =====================================================
  // Core: style injection
  // =====================================================

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

      #${ID.chatListZone} {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        width: 24px;
        z-index: calc(var(--crack-ui-z-header) + 3);
        display: none;
        pointer-events: none;
        background: transparent;
      }

      html.${CLS.chatListEnabled} #${ID.chatListZone} {
        display: block;
        pointer-events: auto;
      }

      #${ID.chatListHandle} {
        display: none !important;
      }

      html.${CLS.chatListEnabled}:not(.${CLS.phoneViewport}) #${ID.chatListHandle} {
        display: none !important;
      }

      html.${CLS.chatListEnabled}:not(.${CLS.phoneViewport}) #${ID.chatListZone} {
        width: 22px;
      }

      html.${CLS.chatListEnabled}:not(.${CLS.phoneViewport}) [data-crack-ui-chat-list-panel="1"][data-crack-ui-chat-list-forced="closed"] {
        width: 0 !important;
        min-width: 0 !important;
        max-width: 0 !important;
        flex-basis: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
        border-right-width: 0 !important;
      }

      html.${CLS.chatListEnabled}:not(.${CLS.phoneViewport}) [data-crack-ui-chat-list-panel="1"][data-crack-ui-chat-list-forced="open"] {
        width: 260px !important;
        min-width: 260px !important;
        max-width: 260px !important;
        flex-basis: 260px !important;
        overflow: hidden !important;
        pointer-events: auto !important;
      }

      #${ID.roomMenuZone} {
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        width: 24px;
        z-index: calc(var(--crack-ui-z-header) + 3);
        display: none;
        pointer-events: none;
        background: transparent;
      }

      html.${CLS.roomMenuEnabled} #${ID.roomMenuZone} {
        display: block;
        pointer-events: auto;
      }

      #${ID.roomMenuHandle} {
        display: none !important;
      }

      html.${CLS.chatListEnabled}.${CLS.phoneViewport} #${ID.chatListZone} {
        display: block;
        top: 0;
        bottom: 0;
        left: 0;
        width: 26px;
        height: auto;
        transform: none;
        pointer-events: auto !important;
      }

      html.${CLS.chatListEnabled}.${CLS.phoneViewport} #${ID.chatListHandle} {
        display: block !important;
        position: fixed;
        top: 50%;
        left: max(0px, env(safe-area-inset-left));
        width: 22px;
        height: 64px;
        transform: translateY(-50%);
        pointer-events: auto !important;
        z-index: calc(var(--crack-ui-z-header) + 6);
        touch-action: none;
        -webkit-tap-highlight-color: transparent;
      }

      html.${CLS.chatListEnabled}.${CLS.phoneViewport} #${ID.chatListHandle}::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 5px;
        width: 3px;
        height: 30px;
        border-radius: 999px;
        background: rgba(165, 165, 175, .62);
        box-shadow: none;
        transform: translateY(-50%);
      }

      html[data-theme="light"].${CLS.chatListEnabled}.${CLS.phoneViewport} #${ID.chatListHandle}::after,
      body[data-theme="light"] #${ID.chatListHandle}::after {
        background: rgba(120, 120, 128, .44);
        box-shadow: none;
      }

      html.${CLS.chatListMobilePopoverOpen} #${ID.chatListZone},
      html.${CLS.chatListMobilePopoverOpen} #${ID.chatListHandle} {
        pointer-events: none !important;
        opacity: 0 !important;
      }

      /* Mobile chat list popover is native Crack UI. Crack UI Plus only proxies the hidden hamburger button on phones.
         When the global header is hidden, Crack's popover can keep the native height calc(100dvh - 56px)
         while starting at y=0, which leaves a header-sized blank area at the bottom. Only compensate height. */
      html.${CLS.autoHide}.${CLS.phoneViewport} [data-radix-popper-content-wrapper] [role="dialog"][data-state="open"].md\:hidden:has([role="tablist"]),
      html.${CLS.autoHide}.${CLS.phoneViewport} [data-radix-popper-content-wrapper] [role="dialog"][data-state="open"].md\:hidden:has([data-testid="virtuoso-scroller"]),
      html.${CLS.autoHide}.${CLS.phoneViewport} [data-radix-popper-content-wrapper] [role="dialog"][data-state="open"].md\:hidden:has([data-virtuoso-scroller="true"]) {
        height: 100dvh !important;
        max-height: 100dvh !important;
      }

      html.${CLS.roomTopBarHidden} [data-crack-ui-room-top-bar="1"] {
        opacity: 0 !important;
        pointer-events: none !important;
        transform: translateY(-4px) !important;
        transition:
          opacity 160ms ease,
          transform 160ms ease !important;
      }

      html.${CLS.roomTopBarHidden} [data-crack-ui-room-stat-bar="1"] {
        transform: translateY(-3rem) !important;
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

      html.${CLS.autoHide} body .pt-\[120px\],
      html.${CLS.autoHide} body .md\:pt-\[56px\],
      html.${CLS.autoHide} body [class*="pt-[120px]"],
      html.${CLS.autoHide} body [class*="md:pt-[56px]"] {
        padding-top: 0 !important;
      }

      html.${CLS.autoHide} body [class*="min-h-[100dvh]"][class*="pt-[120px]"],
      html.${CLS.autoHide} body [class*="h-[100dvh]"][class*="pt-[120px]"] {
        padding-top: 0 !important;
      }

      /* Crack DOM 2026-06: the app shell now uses pt-[56px] / pt-[120px] to reserve header space.
         When Crack UI Plus hides the global header, remove that reserved padding too.
         Keep these as attribute selectors only; raw Tailwind bracket class selectors can invalidate a selector list. */
      html.${CLS.autoHide} body [class*="pt-[56px]"],
      html.${CLS.autoHide} body [class*="pt-[120px]"],
      html.${CLS.autoHide} body [class*="md:pt-[56px]"],
      html.${CLS.autoHide} body [class*="h-[100dvh]"][class*="pt-[56px]"],
      html.${CLS.autoHide} body [class*="min-h-[100dvh]"][class*="pt-[56px]"],
      html.${CLS.autoHide} body [class*="h-[100dvh]"][class*="pt-[120px]"],
      html.${CLS.autoHide} body [class*="min-h-[100dvh]"][class*="pt-[120px]"] {
        padding-top: 0 !important;
      }

      html.${CLS.autoHide} body [class*="bg-bg_screen"][class*="h-[100dvh]"],
      html.${CLS.autoHide} body [class*="bg-bg_screen"][class*="min-h-[100dvh]"] {
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

      .crack-ui-title-wrap {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        gap: 6px;
        min-width: 0;
      }

      .crack-ui-panel-title {
        font-size: 13px;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -.02em;
      }

      .crack-ui-panel-version {
        flex: 0 0 auto;
        font-size: 10px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: -.01em;
        color: rgba(255, 255, 255, .42);
        user-select: none;
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

      .crack-ui-row[data-disabled="1"],
      .crack-ui-range-row[data-disabled="1"] {
        opacity: .58;
        filter: grayscale(.70);
      }

      .crack-ui-row[data-disabled="1"],
      .crack-ui-row[data-disabled="1"] *,
      .crack-ui-range-row[data-disabled="1"],
      .crack-ui-range-row[data-disabled="1"] * {
        cursor: not-allowed !important;
      }

      .crack-ui-row[data-disabled="1"]:hover,
      .crack-ui-range-row[data-disabled="1"]:hover {
        background: rgba(0, 0, 0, .42);
        border-color: rgba(255, 255, 255, .07);
      }

      .crack-ui-row[data-disabled="1"] .crack-ui-row-name,
      .crack-ui-range-row[data-disabled="1"] .crack-ui-row-name,
      .crack-ui-range-row[data-disabled="1"] .crack-ui-range-value {
        color: rgba(255, 255, 255, .48) !important;
      }

      .crack-ui-range:disabled {
        opacity: .46;
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
        background: rgba(254, 69, 50, .14);
        border-color: rgba(254, 69, 50, .46);
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
        border-color: #FE4532;
        background: #FE4532;
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

      .crack-ui-model-settings-card {
        width: 100%;
        box-sizing: border-box;
        border-radius: 18px;
        background: rgba(0, 0, 0, .42);
        border: 1px solid rgba(255, 255, 255, .07);
        overflow: hidden;
        user-select: none;
        transition:
          background-color 130ms ease,
          border-color 130ms ease;
      }

      .crack-ui-model-settings-card:hover {
        background: rgba(0, 0, 0, .48);
        border-color: rgba(255, 255, 255, .12);
      }

      .crack-ui-model-settings-card .crack-ui-row {
        min-height: 34px !important;
        padding: 9px 12px !important;
        background: transparent !important;
        border: 0 !important;
        border-radius: 0 !important;
        text-align: left !important;
      }

      .crack-ui-model-settings-card .crack-ui-row-text {
        gap: 0 !important;
        align-items: flex-start !important;
        text-align: left !important;
        width: 100% !important;
      }

      .crack-ui-model-settings-card .crack-ui-row-desc {
        display: none !important;
      }

      .crack-ui-model-settings-card .crack-ui-row:hover {
        background: rgba(255, 255, 255, .045) !important;
      }

      .crack-ui-model-settings-card .crack-ui-model-toggle-row {
        border-bottom: 1px solid rgba(255, 255, 255, .065) !important;
      }

      .crack-ui-visible-model-disclosure {
        width: 100%;
        grid-template-columns: minmax(0, 1fr) 18px;
        justify-items: start;
        text-align: left !important;
      }

      .crack-ui-visible-model-disclosure .crack-ui-row-text,
      .crack-ui-visible-model-disclosure .crack-ui-row-name {
        justify-self: start;
        text-align: left !important;
      }

      .crack-ui-visible-model-chevron {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        justify-self: end;
        width: 18px;
        height: 18px;
        border-radius: 0;
        color: rgba(255, 255, 255, .62);
        font-size: 10px;
        font-weight: 900;
        line-height: 1;
        transform: rotate(-90deg);
        transition:
          transform 140ms ease,
          color 140ms ease;
      }

      .crack-ui-visible-model-disclosure[data-open="1"] .crack-ui-visible-model-chevron {
        transform: rotate(0deg);
        color: #FE4532;
        background: transparent;
      }

      .crack-ui-visible-model-panel {
        display: none;
        padding: 0 8px 8px;
        border-top: 1px solid rgba(255, 255, 255, .065);
      }

      .crack-ui-visible-model-panel[data-open="1"] {
        display: block;
      }

      .crack-ui-visible-model-group {
        margin-top: -2px;
      }

      .crack-ui-visible-model-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 5px;
        padding-top: 8px;
      }

      .crack-ui-visible-model-row {
        grid-template-columns: 15px 16px minmax(0, 1fr);
        gap: 6px;
        min-height: 32px;
        padding: 7px 8px;
        border-radius: 12px;
      }

      .crack-ui-visible-model-row .crack-ui-choice-mark {
        width: 14px;
        height: 14px;
        border-radius: 4px;
        font-size: 10px;
      }

      .crack-ui-visible-model-icon {
        width: 16px !important;
        height: 16px !important;
        border-radius: 5px !important;
        object-fit: cover !important;
      }

      .crack-ui-visible-model-row .crack-ui-choice-name {
        font-size: 11px;
        font-weight: 800;
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


      .crack-ui-novel-model-indicator {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 20px !important;
        height: 20px !important;
        min-width: 20px !important;
        flex: 0 0 20px !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 6px !important;
        background: transparent !important;
        color: var(--text_secondary, #9ca3af) !important;
        overflow: hidden !important;
        vertical-align: middle !important;
        font-family: inherit !important;
        font-size: 13px !important;
        font-weight: 800 !important;
        line-height: 1 !important;
        cursor: pointer !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      .crack-ui-novel-model-indicator:hover {
        opacity: .78 !important;
      }

      .crack-ui-novel-model-indicator:focus-visible {
        outline: 2px solid var(--focus, rgba(254, 69, 50, .72)) !important;
        outline-offset: 2px !important;
      }

      .crack-ui-novel-model-indicator > img {
        display: block !important;
        width: 20px !important;
        height: 20px !important;
        min-width: 20px !important;
        object-fit: cover !important;
        border-radius: 6px !important;
        pointer-events: none !important;
      }

      .crack-ui-novel-model-menu-backdrop {
        position: fixed !important;
        inset: 0 !important;
        z-index: 2147483645 !important;
        background: transparent !important;
      }

      .crack-ui-novel-model-menu {
        position: fixed !important;
        z-index: 2147483646 !important;
        width: min(232px, calc(100vw - 16px)) !important;
        max-height: min(420px, calc(100dvh - 16px)) !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        overscroll-behavior: contain !important;
        padding: 6px !important;
        border: 1px solid rgba(255, 255, 255, .11) !important;
        border-radius: 16px !important;
        background-color: rgb(28, 28, 30) !important;
        background-image: none !important;
        color: rgba(255, 255, 255, .94) !important;
        box-shadow:
          0 18px 46px rgba(0, 0, 0, .30),
          inset 0 1px 0 rgba(255, 255, 255, .07) !important;
        box-sizing: border-box !important;
        opacity: 1 !important;
        isolation: isolate !important;
        filter: none !important;
        mix-blend-mode: normal !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        font-family: inherit !important;
        scrollbar-width: thin !important;
        scrollbar-color: rgba(255, 255, 255, .34) transparent !important;
      }

      .crack-ui-novel-model-menu[data-crack-ui-theme="light"] {
        border-color: rgba(17, 24, 39, .10) !important;
        background-color: rgb(255, 255, 255) !important;
        color: rgba(17, 24, 39, .94) !important;
        box-shadow:
          0 18px 46px rgba(15, 23, 42, .16),
          inset 0 1px 0 rgba(255, 255, 255, .92) !important;
        scrollbar-color: rgba(75, 85, 99, .34) transparent !important;
      }

      .crack-ui-novel-model-menu::-webkit-scrollbar {
        width: 8px !important;
      }

      .crack-ui-novel-model-menu::-webkit-scrollbar-track {
        background: transparent !important;
      }

      .crack-ui-novel-model-menu::-webkit-scrollbar-thumb {
        border: 2px solid transparent !important;
        border-radius: 999px !important;
        background: rgba(255, 255, 255, .30) !important;
        background-clip: padding-box !important;
      }

      .crack-ui-novel-model-menu[data-crack-ui-theme="light"]::-webkit-scrollbar-thumb {
        background: rgba(75, 85, 99, .28) !important;
        background-clip: padding-box !important;
      }

      .crack-ui-novel-model-menu-item,
      .crack-ui-novel-model-menu-clear {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        width: 100% !important;
        min-height: 36px !important;
        padding: 8px 9px !important;
        border: 1px solid transparent !important;
        border-radius: 10px !important;
        background: transparent !important;
        color: inherit !important;
        font-family: inherit !important;
        font-size: 13px !important;
        line-height: 1.2 !important;
        text-align: left !important;
        cursor: pointer !important;
        transform: none !important;
      }

      .crack-ui-novel-model-menu-item:hover,
      .crack-ui-novel-model-menu-item:focus-visible,
      .crack-ui-novel-model-menu-clear:hover,
      .crack-ui-novel-model-menu-clear:focus-visible {
        border-color: rgba(255, 255, 255, .08) !important;
        background: rgba(255, 255, 255, .07) !important;
        outline: none !important;
      }

      .crack-ui-novel-model-menu[data-crack-ui-theme="light"] .crack-ui-novel-model-menu-item:hover,
      .crack-ui-novel-model-menu[data-crack-ui-theme="light"] .crack-ui-novel-model-menu-item:focus-visible,
      .crack-ui-novel-model-menu[data-crack-ui-theme="light"] .crack-ui-novel-model-menu-clear:hover,
      .crack-ui-novel-model-menu[data-crack-ui-theme="light"] .crack-ui-novel-model-menu-clear:focus-visible {
        border-color: rgba(17, 24, 39, .07) !important;
        background: rgba(17, 24, 39, .055) !important;
      }

      .crack-ui-novel-model-menu-item > img {
        width: 18px !important;
        height: 18px !important;
        flex: 0 0 18px !important;
        object-fit: contain !important;
        border-radius: 5px !important;
      }

      .crack-ui-novel-model-menu-label {
        min-width: 0 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .crack-ui-novel-model-menu-item[data-retired="1"] .crack-ui-novel-model-menu-label {
        opacity: .76 !important;
      }

      .crack-ui-novel-model-menu-clear {
        margin-top: 4px !important;
        padding-top: 9px !important;
        border-top-color: rgba(255, 255, 255, .10) !important;
        border-radius: 8px !important;
        color: rgba(255, 255, 255, .62) !important;
      }

      .crack-ui-novel-model-menu[data-crack-ui-theme="light"] .crack-ui-novel-model-menu-clear {
        border-top-color: rgba(17, 24, 39, .10) !important;
        color: rgba(75, 85, 99, .78) !important;
      }

      #${ID.fullscreenButton} {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 28px !important;
        height: 28px !important;
        min-width: 28px !important;
        padding: 0 !important;
        border-radius: 999px !important;
        cursor: pointer !important;
        line-height: 1 !important;
        flex: 0 0 auto !important;
      }

      #${ID.fullscreenButton} > span {
        position: absolute !important;
        inset: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
        height: 100% !important;
        line-height: 0 !important;
        pointer-events: none !important;
      }

      #${ID.fullscreenButton} svg {
        display: block !important;
        width: 19px !important;
        height: 20px !important;
        margin: 0 !important;
        overflow: visible !important;
        pointer-events: none !important;
      }

      #${ID.bottomModelButton} {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0 !important;
        width: 28px !important;
        height: 28px !important;
        min-width: 28px !important;
        max-width: 28px !important;
        box-sizing: border-box !important;
        padding: 0 !important;
        margin-left: 0 !important;
        margin-right: 8px !important;
        border-radius: 999px !important;
        border: 1px solid var(--border, rgba(120, 120, 128, .28)) !important;
        background: var(--card, rgba(255, 255, 255, .78)) !important;
        color: var(--foreground, var(--text_primary, #111111)) !important;
        font-family: inherit !important;
        font-size: 13px !important;
        font-weight: 800 !important;
        line-height: 1 !important;
        cursor: pointer !important;
        user-select: none !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        transform: none !important;
        transition:
          background-color 130ms ease,
          border-color 130ms ease,
          opacity 130ms ease !important;
      }


      #${ID.bottomModelButton}[data-crack-ui-placement="cooperative-group"] {
        margin-left: 0 !important;
        margin-right: 0 !important;
        flex: 0 0 auto !important;
      }

      #${ID.bottomModelButton}[data-crack-ui-placement="send-sibling"] {
        margin-left: 0 !important;
        margin-right: 8px !important;
        flex: 0 0 auto !important;
      }

      /* Bottom composer row can be justify-between. If our model button is inserted as a
         separate sibling before the send button, justify-between may spread it into the
         middle of the composer. Keep the native left toolbar on the left and pack our
         model button + send button on the right without wrapping/moving the send button. */
      [data-crack-ui-bottom-model-group="1"] {
        justify-content: flex-start !important;
        gap: 0 !important;
      }

      [data-crack-ui-bottom-model-group="1"] > :first-child:not(#${ID.bottomModelButton}) {
        margin-right: auto !important;
      }

      [data-crack-ui-bottom-model-group="1"] > #${ID.bottomModelButton}[data-crack-ui-placement="send-sibling"] {
        margin-left: 0 !important;
        margin-right: 8px !important;
      }

      [data-crack-ui-bottom-model-group="1"] > #crack-pure-send-left-group[data-crack-ui-pure-group-right="1"] {
        margin-left: 0 !important;
      }

      #${ID.bottomModelButton}:hover {
        background: var(--secondary, var(--accent, rgba(120, 120, 128, .16))) !important;
      }

      #${ID.bottomModelButton}:active {
        opacity: .72 !important;
        transform: none !important;
      }

      #${ID.bottomModelButton}:focus,
      #${ID.bottomModelButton}:focus-visible {
        outline: none !important;
        box-shadow: 0 0 0 2px hsl(var(--focus, 222 84% 60%) / .30) !important;
      }

      .crack-ui-empty-send-blocked {
        opacity: .50 !important;
        cursor: not-allowed !important;
        filter: grayscale(.22) !important;
      }

      .crack-ui-empty-send-blocked svg {
        pointer-events: none !important;
      }

      .crack-ui-bottom-model-icon-wrap {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 16px !important;
        height: 16px !important;
        line-height: 1 !important;
      }

      #${ID.bottomModelButton} img {
        width: 14px !important;
        height: 14px !important;
        min-width: 14px !important;
        border-radius: 4px !important;
        object-fit: cover !important;
      }

      .crack-ui-bottom-model-name {
        display: none !important;
        min-width: 0 !important;
        max-width: 78px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .crack-ui-bottom-model-caret {
        display: none !important;
        align-items: center !important;
        justify-content: center !important;
        width: 10px !important;
        min-width: 10px !important;
        color: currentColor !important;
        opacity: .72 !important;
        font-size: 10px !important;
        line-height: 1 !important;
      }

      #${ID.bottomModelPopup} {
        position: fixed;
        z-index: calc(var(--crack-ui-z-panel) + 4);
        width: 120px;
        max-width: calc(100vw - 16px);
        max-height: min(360px, calc(100dvh - 88px));
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior: contain;
        display: none;
        box-sizing: border-box;
        padding: 4px;
        border: 1px solid rgba(255, 255, 255, .11);
        border-radius: 16px;
        background: rgba(28, 28, 30, .80);
        color: rgba(255, 255, 255, .94);
        box-shadow:
          0 18px 46px rgba(0, 0, 0, .30),
          inset 0 1px 0 rgba(255, 255, 255, .07);
        backdrop-filter: blur(24px) saturate(1.18);
        -webkit-backdrop-filter: blur(24px) saturate(1.18);
        font-family: inherit;
        animation: crackUiPop .14s ease-out;
      }

      #${ID.bottomModelPopup}[data-open="1"] {
        display: block;
      }

      .crack-ui-model-list {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .crack-ui-model-option {
        display: grid;
        grid-template-columns: 15px minmax(0, 1fr) 12px;
        align-items: center;
        gap: 4px;
        width: 100%;
        min-height: 30px;
        box-sizing: border-box;
        padding: 5px 5px;
        border: 1px solid transparent;
        border-radius: 10px;
        background: transparent;
        color: rgba(255, 255, 255, .90);
        font-family: inherit;
        text-align: left;
        cursor: pointer;
        transform: none !important;
        transition:
          background-color 130ms ease,
          border-color 130ms ease;
      }

      .crack-ui-model-option:hover {
        background: rgba(255, 255, 255, .07);
        border-color: rgba(255, 255, 255, .08);
      }

      .crack-ui-model-option[data-selected="1"] {
        background: rgba(254, 69, 50, .14);
        border-color: rgba(254, 69, 50, .42);
      }

      .crack-ui-model-option:focus,
      .crack-ui-model-option:focus-visible {
        outline: none !important;
        box-shadow: 0 0 0 2px rgba(254, 69, 50, .28) !important;
      }

      .crack-ui-model-option-icon {
        width: 14px !important;
        height: 14px !important;
        border-radius: 4px !important;
        object-fit: cover !important;
      }

      [role="menuitem"][data-crack-ui-official-model-hidden="1"] {
        display: none !important;
      }

      /* Crack 원본 모델 메뉴의 모델별 설명문은 UI+ 활성화 시 항상 숨김. */
      [data-radix-popper-content-wrapper] [role="menu"] [role="menuitem"]:has(img[src*="model-icon"]) > div:first-child > div[class*="text-text_secondary"] {
        display: none !important;
      }

      .crack-ui-model-option-main {
        display: flex;
        align-items: center;
        min-width: 0;
      }

      .crack-ui-model-option-top {
        display: flex;
        align-items: center;
        min-width: 0;
      }

      .crack-ui-model-option-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11px;
        font-weight: 850;
        line-height: 1.1;
        color: rgba(255, 255, 255, .96);
      }

      .crack-ui-model-option-check {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 12px;
        height: 16px;
        color: #FE4532;
        font-size: 12px;
        font-weight: 900;
        opacity: 0;
      }

      .crack-ui-model-option[data-selected="1"] .crack-ui-model-option-check {
        opacity: 1;
      }

      body[data-theme="light"] #${ID.bottomModelPopup},
      html[data-theme="light"] #${ID.bottomModelPopup} {
        border-color: rgba(17, 24, 39, .10);
        background: rgba(255, 255, 255, .88);
        color: rgba(17, 24, 39, .94);
        box-shadow:
          0 18px 46px rgba(15, 23, 42, .14),
          inset 0 1px 0 rgba(255, 255, 255, .72);
      }

      body[data-theme="light"] #${ID.bottomModelPopup} .crack-ui-model-popup-title,
      html[data-theme="light"] #${ID.bottomModelPopup} .crack-ui-model-popup-title,
      body[data-theme="light"] #${ID.bottomModelPopup} .crack-ui-model-option-name,
      html[data-theme="light"] #${ID.bottomModelPopup} .crack-ui-model-option-name {
        color: rgba(17, 24, 39, .94);
      }

      body[data-theme="light"] #${ID.bottomModelPopup} .crack-ui-model-option,
      html[data-theme="light"] #${ID.bottomModelPopup} .crack-ui-model-option {
        color: rgba(17, 24, 39, .88);
      }

      body[data-theme="light"] #${ID.bottomModelPopup} .crack-ui-model-option:hover,
      html[data-theme="light"] #${ID.bottomModelPopup} .crack-ui-model-option:hover {
        background: rgba(17, 24, 39, .055);
        border-color: rgba(17, 24, 39, .08);
      }

      body[data-theme="light"] #${ID.bottomModelPopup} .crack-ui-model-option[data-selected="1"],
      html[data-theme="light"] #${ID.bottomModelPopup} .crack-ui-model-option[data-selected="1"] {
        background: rgba(254, 69, 50, .16);
        border-color: rgba(254, 69, 50, .46);
      }

      html.${CLS.hideStatBar} [data-crack-ui-stat-bar="1"],
      html.${CLS.hideStatBar} div[role="button"]:has([data-stat-index]) {
        display: none !important;
      }

      html.${CLS.hideSituationImage} [data-crack-ui-situation-image-button="1"] {
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
        background: #FE4532;
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, .08),
          inset 0 1px 2px rgba(0, 0, 0, .08);
      }

      .crack-ui-toggle:checked + .crack-ui-switch::after {
        transform: translateX(15px);
      }

      .crack-ui-row[data-disabled="1"] .crack-ui-switch,
      .crack-ui-row[data-disabled="1"] .crack-ui-toggle:checked + .crack-ui-switch,
      .crack-ui-row[data-disabled="1"] .crack-ui-toggle:disabled:checked + .crack-ui-switch {
        background: rgba(120, 120, 128, .34) !important;
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, .07),
          inset 0 1px 2px rgba(0, 0, 0, .18) !important;
      }

      .crack-ui-row[data-disabled="1"] .crack-ui-switch::after {
        background: rgba(245, 245, 247, .92) !important;
        box-shadow:
          0 1px 3px rgba(0, 0, 0, .24),
          0 0 1px rgba(0, 0, 0, .12) !important;
      }

      .crack-ui-menu-assist-row {
        grid-template-columns: minmax(0, 1fr) 66px 35px;
        column-gap: 8px;
        cursor: default;
      }

      .crack-ui-menu-toggle-wrap {
        display: block;
        justify-self: end;
        cursor: pointer;
      }

      .crack-ui-menu-mode-button {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 66px;
        height: 28px;
        box-sizing: border-box;
        padding: 0 7px;
        border: 1px solid rgba(255, 255, 255, .10);
        border-radius: 10px;
        background: rgba(255, 255, 255, .055);
        color: rgba(255, 255, 255, .76);
        font-family: inherit;
        font-size: 10px;
        font-weight: 800;
        line-height: 1;
        white-space: nowrap;
        cursor: pointer;
        transform: none !important;
      }

      .crack-ui-menu-mode-button:hover,
      .crack-ui-menu-mode-button[aria-expanded="true"] {
        background: rgba(255, 255, 255, .09);
        border-color: rgba(255, 255, 255, .16);
        color: rgba(255, 255, 255, .94);
      }

      .crack-ui-menu-mode-popover {
        position: fixed !important;
        z-index: 2147483646 !important;
        display: block !important;
        width: 180px !important;
        box-sizing: border-box !important;
        padding: 6px !important;
        border: 1px solid rgba(255, 255, 255, .12) !important;
        border-radius: 16px !important;
        background: rgba(32, 32, 35, .97) !important;
        color: rgba(255, 255, 255, .94) !important;
        box-shadow:
          0 16px 42px rgba(0, 0, 0, .34),
          inset 0 1px 0 rgba(255, 255, 255, .06) !important;
        backdrop-filter: blur(20px) saturate(1.16) !important;
        -webkit-backdrop-filter: blur(20px) saturate(1.16) !important;
        pointer-events: auto !important;
        visibility: visible !important;
        opacity: 1 !important;
        transform: translateY(0) scale(1) !important;
        transform-origin: top right;
        animation: crackUiMenuModePopoverIn 130ms ease-out;
      }

      @keyframes crackUiMenuModePopoverIn {
        from {
          opacity: 0;
          transform: translateY(-7px) scale(.985);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .crack-ui-menu-mode-choice {
        appearance: none;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 20px;
        align-items: center;
        width: 100%;
        min-height: 40px;
        box-sizing: border-box;
        padding: 0 10px 0 12px;
        border: 0;
        border-radius: 11px;
        background: transparent;
        color: rgba(255, 255, 255, .82);
        font-family: inherit;
        font-size: 12px;
        font-weight: 760;
        line-height: 1.2;
        text-align: left;
        cursor: pointer;
        transform: none !important;
      }

      .crack-ui-menu-mode-choice:hover,
      .crack-ui-menu-mode-choice:active {
        background: rgba(255, 255, 255, .075);
        color: rgba(255, 255, 255, .98);
      }

      .crack-ui-menu-mode-choice::after {
        content: "";
        justify-self: end;
        width: 7px;
        height: 12px;
        box-sizing: border-box;
        border-right: 2px solid transparent;
        border-bottom: 2px solid transparent;
        transform: rotate(45deg) translateY(-1px);
      }

      .crack-ui-menu-mode-choice[data-selected="1"] {
        color: #ff5b49;
        background: rgba(254, 69, 50, .10);
      }

      .crack-ui-menu-mode-choice[data-selected="1"]::after {
        border-right-color: currentColor;
        border-bottom-color: currentColor;
      }

      .crack-ui-row[data-disabled="1"] .crack-ui-menu-mode-button {
        opacity: .62;
        pointer-events: none;
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-menu-mode-button,
      html[data-theme="light"] #${ID.panel} .crack-ui-menu-mode-button {
        border-color: rgba(17, 24, 39, .09);
        background: rgba(15, 23, 42, .045);
        color: rgba(17, 24, 39, .66);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-menu-mode-button:hover,
      html[data-theme="light"] #${ID.panel} .crack-ui-menu-mode-button:hover,
      body[data-theme="light"] #${ID.panel} .crack-ui-menu-mode-button[aria-expanded="true"],
      html[data-theme="light"] #${ID.panel} .crack-ui-menu-mode-button[aria-expanded="true"] {
        background: rgba(15, 23, 42, .08);
        color: rgba(17, 24, 39, .92);
      }

      body[data-theme="light"] .crack-ui-menu-mode-popover,
      html[data-theme="light"] .crack-ui-menu-mode-popover {
        border-color: rgba(17, 24, 39, .10) !important;
        background: rgba(250, 250, 252, .97) !important;
        color: rgba(17, 24, 39, .94) !important;
        box-shadow:
          0 16px 42px rgba(15, 23, 42, .18),
          inset 0 1px 0 rgba(255, 255, 255, .86) !important;
      }

      body[data-theme="light"] .crack-ui-menu-mode-choice,
      html[data-theme="light"] .crack-ui-menu-mode-choice {
        color: rgba(17, 24, 39, .80);
      }

      body[data-theme="light"] .crack-ui-menu-mode-choice:hover,
      html[data-theme="light"] .crack-ui-menu-mode-choice:hover,
      body[data-theme="light"] .crack-ui-menu-mode-choice:active,
      html[data-theme="light"] .crack-ui-menu-mode-choice:active {
        background: rgba(15, 23, 42, .06);
        color: rgba(17, 24, 39, .96);
      }

      body[data-theme="light"] .crack-ui-menu-mode-choice[data-selected="1"],
      html[data-theme="light"] .crack-ui-menu-mode-choice[data-selected="1"] {
        background: rgba(254, 69, 50, .10);
        color: #e43e2d;
      }

      html:not(.${CLS.phoneViewport}):not(.${CLS.tabletViewport}) .crack-ui-menu-assist-row {
        grid-template-columns: minmax(0, 1fr) 35px !important;
      }

      html:not(.${CLS.phoneViewport}):not(.${CLS.tabletViewport}) .crack-ui-menu-mode-button {
        display: none !important;
      }

      html.${CLS.tabletViewport} [data-crack-ui-menu-assist-row="chat-list"] {
        grid-template-columns: minmax(0, 1fr) 35px !important;
      }

      html.${CLS.tabletViewport} #${ID.chatListModeButton} {
        display: none !important;
      }

      @media (prefers-reduced-motion: reduce) {
        .crack-ui-menu-mode-popover {
          animation: none !important;
        }
      }

      #${ID.menuSwipeZone} {
        position: fixed !important;
        left: max(24px, env(safe-area-inset-left)) !important;
        right: max(24px, env(safe-area-inset-right)) !important;
        top: auto !important;
        bottom: calc(98px + env(safe-area-inset-bottom)) !important;
        height: 48px !important;
        z-index: calc(var(--crack-ui-z-header) + 5) !important;
        display: block !important;
        pointer-events: none !important;
        background: transparent !important;
        border: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        opacity: 1 !important;
        touch-action: pan-y !important;
        -webkit-tap-highlight-color: transparent !important;
        user-select: none !important;
      }

      .crack-ui-range-row[data-disabled="1"] .crack-ui-range::-webkit-slider-runnable-track {
        background: rgba(120, 120, 128, .24) !important;
      }

      .crack-ui-range-row[data-disabled="1"] .crack-ui-range::-webkit-slider-thumb {
        background: rgba(245, 245, 247, .88) !important;
        box-shadow:
          0 1px 4px rgba(0, 0, 0, .22),
          0 0 1px rgba(0, 0, 0, .12) !important;
      }

      .crack-ui-range-row[data-disabled="1"] .crack-ui-range::-moz-range-track {
        background: rgba(120, 120, 128, .24) !important;
      }

      .crack-ui-range-row[data-disabled="1"] .crack-ui-range::-moz-range-thumb {
        background: rgba(245, 245, 247, .88) !important;
        box-shadow:
          0 1px 4px rgba(0, 0, 0, .22),
          0 0 1px rgba(0, 0, 0, .12) !important;
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
      body[data-theme="light"] #${ID.panel} .crack-ui-row-name,
      html[data-theme="light"] #${ID.panel} .crack-ui-row-name,
      body[data-theme="light"] #${ID.panel} .crack-ui-choice-title,
      html[data-theme="light"] #${ID.panel} .crack-ui-choice-title {
        color: rgba(17, 24, 39, .94);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-panel-version,
      html[data-theme="light"] #${ID.panel} .crack-ui-panel-version {
        color: rgba(75, 85, 99, .54);
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
      html[data-theme="light"] #${ID.panel} .crack-ui-choice-group,
      body[data-theme="light"] #${ID.panel} .crack-ui-model-settings-card,
      html[data-theme="light"] #${ID.panel} .crack-ui-model-settings-card {
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

      body[data-theme="light"] #${ID.panel} .crack-ui-model-settings-card .crack-ui-row,
      html[data-theme="light"] #${ID.panel} .crack-ui-model-settings-card .crack-ui-row {
        background: transparent !important;
        border-color: transparent !important;
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-model-settings-card .crack-ui-row:hover,
      html[data-theme="light"] #${ID.panel} .crack-ui-model-settings-card .crack-ui-row:hover {
        background: rgba(17, 24, 39, .045) !important;
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-model-settings-card .crack-ui-model-toggle-row,
      html[data-theme="light"] #${ID.panel} .crack-ui-model-settings-card .crack-ui-model-toggle-row,
      body[data-theme="light"] #${ID.panel} .crack-ui-visible-model-panel,
      html[data-theme="light"] #${ID.panel} .crack-ui-visible-model-panel {
        border-color: rgba(17, 24, 39, .075) !important;
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-visible-model-chevron,
      html[data-theme="light"] #${ID.panel} .crack-ui-visible-model-chevron {
        color: rgba(17, 24, 39, .58);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-visible-model-disclosure[data-open="1"] .crack-ui-visible-model-chevron,
      html[data-theme="light"] #${ID.panel} .crack-ui-visible-model-disclosure[data-open="1"] .crack-ui-visible-model-chevron {
        color: #FE4532;
        background: transparent;
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
        background: rgba(254, 69, 50, .16);
        border-color: rgba(254, 69, 50, .48);
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
        background: #FE4532;
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, .08),
          inset 0 1px 2px rgba(0, 0, 0, .08);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-row[data-disabled="1"] .crack-ui-switch,
      html[data-theme="light"] #${ID.panel} .crack-ui-row[data-disabled="1"] .crack-ui-switch,
      body[data-theme="light"] #${ID.panel} .crack-ui-row[data-disabled="1"] .crack-ui-toggle:checked + .crack-ui-switch,
      html[data-theme="light"] #${ID.panel} .crack-ui-row[data-disabled="1"] .crack-ui-toggle:checked + .crack-ui-switch,
      body[data-theme="light"] #${ID.panel} .crack-ui-row[data-disabled="1"] .crack-ui-toggle:disabled:checked + .crack-ui-switch,
      html[data-theme="light"] #${ID.panel} .crack-ui-row[data-disabled="1"] .crack-ui-toggle:disabled:checked + .crack-ui-switch {
        background: rgba(120, 120, 128, .30) !important;
        box-shadow:
          inset 0 0 0 1px rgba(17, 24, 39, .07),
          inset 0 1px 2px rgba(0, 0, 0, .06) !important;
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-row[data-disabled="1"] .crack-ui-row-name,
      html[data-theme="light"] #${ID.panel} .crack-ui-row[data-disabled="1"] .crack-ui-row-name,
      body[data-theme="light"] #${ID.panel} .crack-ui-range-row[data-disabled="1"] .crack-ui-row-name,
      html[data-theme="light"] #${ID.panel} .crack-ui-range-row[data-disabled="1"] .crack-ui-row-name,
      body[data-theme="light"] #${ID.panel} .crack-ui-range-row[data-disabled="1"] .crack-ui-range-value,
      html[data-theme="light"] #${ID.panel} .crack-ui-range-row[data-disabled="1"] .crack-ui-range-value {
        color: rgba(17, 24, 39, .40) !important;
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-choice-row[data-selected="1"] .crack-ui-choice-mark,
      html[data-theme="light"] #${ID.panel} .crack-ui-choice-row[data-selected="1"] .crack-ui-choice-mark {
        border-color: #FE4532;
        background: #FE4532;
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



        html.${CLS.chatListEnabled} #${ID.chatListZone} {
          display: block;
          top: 0;
          bottom: 0;
          left: 0;
          width: 22px;
          height: auto;
          transform: none;
          pointer-events: none !important;
        }

        html.${CLS.chatListEnabled}.${CLS.phoneViewport} #${ID.chatListZone} {
          width: 26px;
        }

        html.${CLS.chatListEnabled}.${CLS.phoneViewport} #${ID.chatListZone}[data-crack-ui-handle-enabled="0"] {
          width: 0 !important;
          pointer-events: none !important;
        }

        html.${CLS.chatListEnabled}.${CLS.phoneViewport} #${ID.chatListZone}[data-crack-ui-handle-enabled="0"] #${ID.chatListHandle} {
          display: none !important;
        }

        html.${CLS.chatListEnabled}.${CLS.phoneViewport} #${ID.chatListHandle} {
          display: block !important;
          position: fixed;
          top: 50%;
          left: max(0px, env(safe-area-inset-left));
          width: 22px;
          height: 64px;
          transform: translateY(-50%);
          pointer-events: auto !important;
          z-index: calc(var(--crack-ui-z-header) + 6);
          touch-action: pan-y;
          -webkit-tap-highlight-color: transparent;
        }

        html.${CLS.chatListEnabled}.${CLS.phoneViewport} #${ID.chatListHandle}::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 5px;
          width: 3px;
          height: 30px;
          border-radius: 999px;
          background: rgba(165, 165, 175, .62);
          box-shadow: none;
          transform: translateY(-50%);
        }

        html.${CLS.roomMenuEnabled} #${ID.roomMenuZone} {
          display: block;
          top: 0;
          bottom: 0;
          right: 0;
          width: 26px;
          height: auto;
          transform: none;
          pointer-events: none !important;
        }

        html.${CLS.roomMenuEnabled} #${ID.roomMenuZone}[data-crack-ui-handle-enabled="0"] {
          width: 0 !important;
          pointer-events: none !important;
        }

        html.${CLS.roomMenuEnabled} #${ID.roomMenuZone}[data-crack-ui-handle-enabled="0"] #${ID.roomMenuHandle} {
          display: none !important;
        }

        html.${CLS.roomMenuEnabled} #${ID.roomMenuHandle} {
          display: block !important;
          position: fixed;
          top: 50%;
          right: max(0px, env(safe-area-inset-right));
          width: 22px;
          height: 64px;
          transform: translateY(-50%);
          pointer-events: auto !important;
          z-index: calc(var(--crack-ui-z-header) + 4);
          touch-action: pan-y;
          -webkit-tap-highlight-color: transparent;
        }

        html.${CLS.roomMenuEnabled} #${ID.roomMenuHandle}::after {
          content: "";
          position: absolute;
          top: 50%;
          right: 5px;
          width: 3px;
          height: 30px;
          border-radius: 999px;
          background: rgba(165, 165, 175, .62);
          box-shadow: none;
          transform: translateY(-50%);
        }

        html[data-theme="light"].${CLS.roomMenuEnabled} #${ID.roomMenuHandle}::after,
        body[data-theme="light"] #${ID.roomMenuHandle}::after {
          background: rgba(120, 120, 128, .44);
          box-shadow: none;
        }

        html.${CLS.roomMenuEnabled} #${ID.roomMenuHandle}[data-has-dot="1"]::before {
          content: "";
          position: absolute;
          top: 11px;
          right: 5px;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #FE4532;
          box-shadow: none;
          z-index: 1;
        }

        #${ID.bottomModelButton} {
          max-width: 28px !important;
          width: 28px !important;
          padding: 0 !important;
          gap: 0 !important;
        }

        #${ID.bottomModelButton} .crack-ui-bottom-model-name,
        #${ID.bottomModelButton} .crack-ui-bottom-model-caret {
          display: none !important;
        }

        #${ID.bottomModelPopup} {
          width: min(120px, calc(100vw - 16px));
          border-radius: 16px;
        }


        .crack-ui-gear {
          width: 26px !important;
          height: 26px !important;
          min-width: 26px !important;
        }

      }

      /* Backdrop and settings surface share one isolated stacking context.
         This prevents Android Chromium from compositing the blur above the panel. */
      #${ID.panelRoot} {
        position: fixed;
        inset: 0;
        z-index: var(--crack-ui-z-panel);
        pointer-events: none;
      }

      /* Visual-only backdrop: local layer 0 always stays behind the panel. */
      #${ID.panelBackdrop} {
        position: absolute;
        inset: 0;
        z-index: 0;
        display: none;
        pointer-events: none;
        background: rgba(0, 0, 0, .16);
        backdrop-filter: blur(5px) saturate(.96);
        -webkit-backdrop-filter: blur(5px) saturate(.96);
      }

      html.${CLS.panelOpen} #${ID.panelBackdrop} {
        display: block;
      }

      body[data-theme="light"] #${ID.panelBackdrop},
      html[data-theme="light"] #${ID.panelBackdrop} {
        background: rgba(15, 23, 42, .10);
      }

      html.${CLS.androidFirefox} #${ID.panelBackdrop} {
        background: rgba(0, 0, 0, .08);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }

      /* =====================================================
         Settings workspace — final layout.
         Header auto-hide/reveal behavior is intentionally untouched.
         ===================================================== */
      #${ID.panel} {
        position: absolute;
        z-index: 1;
        pointer-events: auto;
        top: 50%;
        left: 50%;
        right: auto;
        bottom: auto;
        width: min(980px, calc(100vw - 32px));
        height: min(760px, calc(100dvh - 32px));
        max-width: calc(100vw - 32px);
        max-height: calc(100dvh - 32px);
        display: none;
        box-sizing: border-box;
        transform: translate(-50%, -50%);
        padding: 10px;
        overflow: hidden;
        overscroll-behavior: contain;
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
        animation: crackUiWorkspacePop .14s ease-out;
      }

      #${ID.panel}[data-open="1"] {
        display: flex;
        flex-direction: column;
      }

      @keyframes crackUiWorkspacePop {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      #${ID.panel} > .crack-ui-panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex: 0 0 auto;
        min-height: 38px;
        padding: 2px 6px 10px;
        margin: 0;
        position: relative;
        top: auto;
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }

      #${ID.panel} > .crack-ui-panel-shell {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        border: 0;
        border-radius: 0;
        background: transparent;
      }

      /* Theme stays visible above both pages. Only these compact controls get a surface. */
      #${ID.panel} .crack-ui-panel-theme-strip {
        display: flex;
        flex: 0 0 auto;
        align-items: stretch;
        gap: 8px;
        max-height: 160px;
        padding: 0 0 10px;
        min-width: 0;
        overflow: hidden;
        opacity: 1;
        transform: translateY(0);
        background: transparent;
        transition:
          max-height 160ms ease,
          padding-bottom 160ms ease,
          opacity 120ms ease,
          transform 160ms ease;
      }

      #${ID.panel}[data-crack-ui-theme-strip-hidden="1"] .crack-ui-panel-theme-strip {
        max-height: 0;
        padding-bottom: 0;
        opacity: 0;
        transform: translateY(-12px);
        pointer-events: none;
      }

      /* Returning the strip used to animate its height and push the scroller down.
         Restore the layout immediately at the absolute top, then only fade it in. */
      #${ID.panel}[data-crack-ui-theme-strip-restoring="1"] .crack-ui-panel-theme-strip {
        transition: opacity 110ms ease;
      }

      @media (prefers-reduced-motion: reduce) {
        #${ID.panel} .crack-ui-panel-theme-strip {
          transition: none;
        }
      }

      /* While any panel range slider is being adjusted, leave only that control visible.
         Removing the panel/backdrop surface lets the chat remain visible as a live preview. */
      html.${CLS.rangePreview} #${ID.panelBackdrop} {
        background: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      #${ID.panel}[data-crack-ui-range-preview="1"] {
        background: transparent !important;
        border-color: transparent !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      #${ID.panel}[data-crack-ui-range-preview="1"] > .crack-ui-panel-head,
      #${ID.panel}[data-crack-ui-range-preview="1"] .crack-ui-panel-theme-strip,
      #${ID.panel}[data-crack-ui-range-preview="1"] .crack-ui-panel-nav {
        opacity: 0 !important;
        pointer-events: none !important;
      }

      #${ID.panel}[data-crack-ui-range-preview="1"] > .crack-ui-panel-shell,
      #${ID.panel}[data-crack-ui-range-preview="1"] .crack-ui-panel-workspace,
      #${ID.panel}[data-crack-ui-range-preview="1"] .crack-ui-panel-content,
      #${ID.panel}[data-crack-ui-range-preview="1"] .crack-ui-panel-body,
      #${ID.panel}[data-crack-ui-range-preview="1"] .crack-ui-section,
      #${ID.panel}[data-crack-ui-range-preview="1"] .crack-ui-section-body {
        background: transparent !important;
        border-color: transparent !important;
        box-shadow: none !important;
      }

      #${ID.panel}[data-crack-ui-range-preview="1"] .crack-ui-section-body > :not([data-crack-ui-range-preview-active="1"]) {
        opacity: 0 !important;
        pointer-events: none !important;
      }

      #${ID.panel}[data-crack-ui-range-preview="1"] [data-crack-ui-range-preview-active="1"] {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }

      @media (prefers-reduced-motion: reduce) {
        #${ID.panel}[data-crack-ui-range-preview="1"] * {
          transition: none !important;
        }
      }

      #${ID.panel} .crack-ui-theme-strip-title {
        display: inline-flex;
        flex: 0 0 auto;
        align-items: center;
        padding: 0 2px;
        color: rgba(255, 255, 255, .90);
        font-size: 12px;
        font-weight: 900;
        line-height: 1;
        white-space: nowrap;
      }

      #${ID.panel} .crack-ui-theme-strip-group {
        display: flex;
        flex: 1 1 0;
        min-width: 0;
        align-items: center;
        gap: 9px;
        box-sizing: border-box;
        padding: 8px 10px;
        border: 1px solid rgba(255, 255, 255, .07);
        border-radius: 14px;
        background: rgba(0, 0, 0, .28);
      }

      #${ID.panel} .crack-ui-theme-strip-label {
        flex: 0 0 auto;
        min-width: 30px;
        color: rgba(255, 255, 255, .58);
        font-size: 11px;
        font-weight: 850;
        line-height: 1;
        white-space: nowrap;
      }

      #${ID.panel} .crack-ui-theme-strip-options {
        display: flex;
        flex: 1 1 auto;
        min-width: 0;
        gap: 5px;
      }

      #${ID.panel} .crack-ui-panel-theme-strip .crack-ui-choice-row {
        display: flex;
        flex: 1 1 0;
        width: auto;
        min-width: 0;
        min-height: 32px;
        padding: 0 9px;
        gap: 0;
        border-radius: 10px;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      #${ID.panel} .crack-ui-panel-theme-strip .crack-ui-choice-name {
        font-size: 11px;
        font-weight: 800;
      }

      #${ID.panel} .crack-ui-panel-workspace {
        display: grid;
        grid-template-columns: 112px minmax(0, 1fr);
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        border: 0;
        background: transparent;
      }

      #${ID.panel} .crack-ui-panel-nav {
        display: flex;
        flex-direction: column;
        width: auto;
        min-width: 0;
        padding: 4px 8px 4px 0;
        gap: 6px;
        overflow-x: hidden;
        overflow-y: auto;
        border-right: 1px solid rgba(255, 255, 255, .065);
        background: transparent;
      }

      #${ID.panel} .crack-ui-panel-nav-button {
        appearance: none;
        display: flex;
        flex: 0 0 auto;
        width: 100%;
        min-width: 0;
        min-height: 42px;
        align-items: center;
        justify-content: flex-start;
        box-sizing: border-box;
        padding: 0 11px;
        border: 1px solid transparent;
        border-radius: 12px;
        background: transparent;
        color: rgba(255, 255, 255, .68);
        font-family: inherit;
        font-size: 12px;
        font-weight: 850;
        line-height: 1;
        text-align: left;
        cursor: pointer;
        transform: none;
        transition: background-color 130ms ease, border-color 130ms ease, color 130ms ease;
      }

      #${ID.panel} .crack-ui-panel-nav-button:hover {
        background: rgba(255, 255, 255, .055);
        color: rgba(255, 255, 255, .92);
      }

      #${ID.panel} .crack-ui-panel-nav-button[data-active="1"] {
        background: rgba(254, 69, 50, .14);
        border-color: rgba(254, 69, 50, .38);
        color: rgba(255, 255, 255, .96);
      }

      #${ID.panel} .crack-ui-panel-content {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        background: transparent;
      }

      #${ID.panel} .crack-ui-panel-body {
        display: block;
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
        padding: 4px 10px 12px 14px;
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: rgba(120, 120, 128, .38) transparent;
        background: transparent;
      }

      #${ID.panel} .crack-ui-panel-body::-webkit-scrollbar,
      #${ID.panel} .crack-ui-panel-nav::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      #${ID.panel} .crack-ui-panel-body::-webkit-scrollbar-track,
      #${ID.panel} .crack-ui-panel-nav::-webkit-scrollbar-track {
        background: transparent;
      }

      #${ID.panel} .crack-ui-panel-body::-webkit-scrollbar-thumb,
      #${ID.panel} .crack-ui-panel-nav::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: rgba(120, 120, 128, .32);
        border: 2px solid transparent;
        background-clip: padding-box;
      }

      #${ID.panel} .crack-ui-section {
        display: flex;
        width: 100%;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        overflow: visible;
      }

      #${ID.panel} .crack-ui-section[hidden] {
        display: none;
      }

      #${ID.panel} .crack-ui-section-body {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 10px;
      }

      /* Keep the final three chat rows in a fixed, user-requested order on all layouts. */
      #${ID.panel} .crack-ui-chat-layout-grid > [data-crack-ui-chat-order="1"] { order: 10; }
      #${ID.panel} .crack-ui-chat-layout-grid > [data-crack-ui-chat-order="2"] { order: 11; }
      #${ID.panel} .crack-ui-chat-layout-grid > [data-crack-ui-chat-order="3"] { order: 12; }
      #${ID.panel} .crack-ui-chat-layout-grid > [data-crack-ui-chat-order="4"] { order: 13; }
      #${ID.panel} .crack-ui-chat-layout-grid > [data-crack-ui-chat-order="5"] { order: 14; }
      #${ID.panel} .crack-ui-chat-layout-grid > [data-crack-ui-chat-order="6"] { order: 15; }

      /* Chat page uses the wide workspace only on tablet/desktop.
         Phone layout intentionally remains the existing single column. */
      @media (min-width: 768px) {
        #${ID.panel} .crack-ui-section-body.crack-ui-chat-layout-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          align-items: stretch;
          gap: 10px;
        }

        #${ID.panel} .crack-ui-chat-layout-grid > .crack-ui-chat-layout-full {
          grid-column: 1 / -1;
          min-width: 0;
        }

        #${ID.panel} .crack-ui-chat-layout-grid > .crack-ui-chat-layout-half {
          min-width: 0;
          height: 100%;
        }

        #${ID.panel} .crack-ui-chat-layout-grid > label.crack-ui-chat-layout-half {
          align-self: stretch;
        }

        #${ID.panel} .crack-ui-chat-layout-grid .crack-ui-visible-model-list {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-theme-strip-title,
      html[data-theme="light"] #${ID.panel} .crack-ui-theme-strip-title {
        color: rgba(17, 24, 39, .94);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-theme-strip-group,
      html[data-theme="light"] #${ID.panel} .crack-ui-theme-strip-group {
        border-color: rgba(17, 24, 39, .075);
        background: rgba(255, 255, 255, .68);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-theme-strip-label,
      html[data-theme="light"] #${ID.panel} .crack-ui-theme-strip-label {
        color: rgba(75, 85, 99, .72);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-panel-nav,
      html[data-theme="light"] #${ID.panel} .crack-ui-panel-nav {
        border-right-color: rgba(17, 24, 39, .075);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-panel-nav-button,
      html[data-theme="light"] #${ID.panel} .crack-ui-panel-nav-button {
        color: rgba(75, 85, 99, .82);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-panel-nav-button:hover,
      html[data-theme="light"] #${ID.panel} .crack-ui-panel-nav-button:hover {
        background: rgba(17, 24, 39, .055);
        color: rgba(17, 24, 39, .94);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-panel-nav-button[data-active="1"],
      html[data-theme="light"] #${ID.panel} .crack-ui-panel-nav-button[data-active="1"] {
        background: rgba(254, 69, 50, .11);
        border-color: rgba(254, 69, 50, .34);
        color: rgba(17, 24, 39, .96);
      }

      @media (max-width: 767px) {
        /* Keep the same visual backdrop treatment as tablet/desktop on phones.
           The later reduced-motion rule still disables blur for accessibility. */
        #${ID.panelBackdrop},
        html.${CLS.androidFirefox} #${ID.panelBackdrop} {
          background: rgba(0, 0, 0, .16);
          backdrop-filter: blur(5px) saturate(.96);
          -webkit-backdrop-filter: blur(5px) saturate(.96);
        }

        body[data-theme="light"] #${ID.panelBackdrop},
        html[data-theme="light"] #${ID.panelBackdrop},
        body[data-theme="light"].${CLS.androidFirefox} #${ID.panelBackdrop},
        html[data-theme="light"].${CLS.androidFirefox} #${ID.panelBackdrop} {
          background: rgba(15, 23, 42, .10);
        }

        #${ID.panel} {
          /* Use a pure viewport-relative ratio for phone breathing room.
             This avoids fixed CSS-pixel caps making different phone sizes look alike. */
          top: max(8%, env(safe-area-inset-top));
          left: 6px;
          right: 6px;
          bottom: max(8%, env(safe-area-inset-bottom));
          z-index: 1;
          width: auto;
          height: auto;
          max-width: none;
          max-height: none;
          transform: translateZ(0);
          isolation: isolate;
          padding: 7px;
          background: rgba(28, 28, 30, .94);
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        body[data-theme="light"] #${ID.panel},
        html[data-theme="light"] #${ID.panel} {
          background: rgba(255, 255, 255, .94);
        }

        #${ID.panel} > .crack-ui-panel-head {
          min-height: 38px;
          padding: 2px 3px 8px;
        }

        #${ID.panel} .crack-ui-panel-theme-strip {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
          padding-bottom: 7px;
        }

        #${ID.panel} .crack-ui-theme-strip-title {
          grid-column: 1 / -1;
          padding: 0 2px 1px;
          font-size: 11px;
        }

        #${ID.panel} .crack-ui-theme-strip-group {
          flex-direction: column;
          align-items: stretch;
          gap: 6px;
          padding: 7px;
          border-radius: 13px;
        }

        #${ID.panel} .crack-ui-theme-strip-label {
          min-width: 0;
          padding-left: 2px;
          font-size: 10px;
        }

        #${ID.panel} .crack-ui-theme-strip-options {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 4px;
        }

        #${ID.panel} .crack-ui-panel-theme-strip .crack-ui-choice-row {
          grid-template-columns: minmax(0, 1fr);
          min-height: 34px;
          padding: 0 5px;
          gap: 0;
        }

        #${ID.panel} .crack-ui-panel-theme-strip .crack-ui-choice-name {
          font-size: 10px;
          text-align: center;
        }

        #${ID.panel} .crack-ui-panel-workspace {
          display: flex;
          flex-direction: column;
        }

        #${ID.panel} .crack-ui-panel-nav {
          flex: 0 0 auto;
          width: auto;
          flex-direction: row;
          gap: 6px;
          padding: 0 0 7px;
          border-right: 0;
          border-bottom: 1px solid rgba(255, 255, 255, .065);
          overflow-x: auto;
          overflow-y: hidden;
          background: transparent;
        }

        #${ID.panel} .crack-ui-panel-nav-button {
          flex: 1 1 0;
          width: auto;
          min-height: 38px;
          justify-content: center;
          padding: 0 10px;
          border-radius: 12px;
          font-size: 12px;
          text-align: center;
          white-space: nowrap;
        }

        #${ID.panel} .crack-ui-panel-body {
          padding: 9px 2px 12px;
        }

        body[data-theme="light"] #${ID.panel} .crack-ui-panel-nav,
        html[data-theme="light"] #${ID.panel} .crack-ui-panel-nav {
          border-bottom-color: rgba(17, 24, 39, .075);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #${ID.panel},
        #${ID.panel} *,
        #${ID.panelBackdrop} {
          animation: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          scroll-behavior: auto !important;
          transition-duration: .01ms !important;
          transition-delay: 0ms !important;
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

  function isAndroidFirefoxBrowser() {
    if (cachedAndroidFirefoxBrowser != null) return cachedAndroidFirefoxBrowser;
    const ua = String(navigator.userAgent || '');
    cachedAndroidFirefoxBrowser = /Android/i.test(ua) && /Firefox\//i.test(ua);
    return cachedAndroidFirefoxBrowser;
  }

  function isIosDevice() {
    if (cachedIosDevice != null) return cachedIosDevice;
    const ua = String(navigator.userAgent || '');
    cachedIosDevice = /iPad|iPhone|iPod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && Number(navigator.maxTouchPoints || 0) > 1);
    return cachedIosDevice;
  }

  function getCrackUiViewportWidth() {
    const values = [
      window.innerWidth,
      document.documentElement?.clientWidth,
      window.visualViewport?.width,
      window.screen?.width,
      window.screen?.availWidth,
    ]
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0);

    return values.length ? Math.min(...values) : window.innerWidth;
  }

  function isPhoneLikeViewport() {
    return getCrackUiViewportWidth() <= 767;
  }

  function isTabletLikeViewport() {
    const width = getCrackUiViewportWidth();
    return width > 767 && width <= 1180 && isTouchLikeDevice();
  }

  function updateDeviceViewportClasses() {
    document.documentElement.classList.toggle(CLS.phoneViewport, isPhoneLikeViewport());
    document.documentElement.classList.toggle(CLS.tabletViewport, isTabletLikeViewport());
    document.documentElement.classList.toggle(CLS.androidFirefox, isAndroidFirefoxBrowser());
  }

  updateDeviceViewportClasses();

  function isChatWidthSupportedViewport() {
    // Keep physical phones unsupported in landscape as well. Viewport width
    // alone can exceed 768px after rotation while getCrackUiViewportWidth()
    // still correctly identifies the device as phone-like.
    return !isPhoneLikeViewport();
  }

  function isDesktopChatListAutoHideViewport() {
    return window.matchMedia('(min-width: 768px)').matches && !isTouchLikeDevice();
  }

  function getChatListAutoHideMode() {
    if (!chatListAutoHide) return 'off';
    if (isPhoneLikeViewport()) return 'phone';
    if (isTabletLikeViewport()) return 'tablet-swipe';
    if (isDesktopChatListAutoHideViewport()) return 'desktop';
    return 'unsupported';
  }

  function isChatListAutoHideSupportedViewport() {
    return isPhoneLikeViewport() ||
      isTabletLikeViewport() ||
      isDesktopChatListAutoHideViewport();
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
    if (root.dataset.theme !== resolved) root.dataset.theme = resolved;
    if (root.dataset.crackUiThemeMode !== resolved) root.dataset.crackUiThemeMode = resolved;
    if (root.style.colorScheme !== resolved) root.style.colorScheme = resolved;

    if (body) {
      if (body.dataset.theme !== resolved) body.dataset.theme = resolved;
      if (body.style.colorScheme !== resolved) body.style.colorScheme = resolved;
    }
  }

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function isUsableElement(node) {
    return node instanceof HTMLElement && node.isConnected;
  }

  function getElementDebugInfo(node) {
    if (!isUsableElement(node)) return null;

    const rect = node.getBoundingClientRect();
    return {
      tag: node.tagName.toLowerCase(),
      id: node.id || '',
      role: node.getAttribute('role') || '',
      ariaLabel: node.getAttribute('aria-label') || '',
      ariaExpanded: node.getAttribute('aria-expanded') || '',
      dataState: node.getAttribute('data-state') || '',
      text: normalizeText(node.textContent).slice(0, 120),
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      visible: isVisibleElement(node),
    };
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
    return !!dispatchSingleClickOnly(target, 'synthetic-click');
  }

  function getActivationPoint(target) {
    try {
      const r = target?.getBoundingClientRect?.();
      if (!r) return { clientX: 0, clientY: 0 };
      return {
        clientX: Math.max(0, Math.round(r.left + r.width / 2)),
        clientY: Math.max(0, Math.round(r.top + r.height / 2)),
      };
    } catch {
      return { clientX: 0, clientY: 0 };
    }
  }

  function dispatchSingleClickOnly(target, methodLabel = 'single-click') {
    if (!target) return '';
    const point = getActivationPoint(target);

    try {
      if (typeof target.click === 'function') {
        target.click();
        return `${methodLabel}:native-click`;
      }
    } catch {
    }

    try {
      target.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 0,
        buttons: 0,
        ...point,
      }));
      return `${methodLabel}:mouse-click`;
    } catch {
      return '';
    }
  }

  function dispatchTouchLikeActivation(target, methodLabel = 'touch-activation') {
    if (!target) return '';
    const point = getActivationPoint(target);

    // iPad Safari can accept both a synthetic click and HTMLElement.click(), which can toggle Radix twice.
    // For touch-like devices, use exactly one activation first, then delayed fallback if the panel still did not open.
    const singleClick = dispatchSingleClickOnly(target, methodLabel);
    if (singleClick) return singleClick;

    try {
      const pointerOptions = {
        bubbles: true,
        cancelable: true,
        view: window,
        pointerId: 1,
        pointerType: 'touch',
        isPrimary: true,
        button: 0,
        buttons: 1,
        ...point,
      };
      target.dispatchEvent(new PointerEvent('pointerdown', pointerOptions));
      target.dispatchEvent(new PointerEvent('pointerup', { ...pointerOptions, buttons: 0 }));
      target.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 0,
        buttons: 0,
        ...point,
      }));
      return `${methodLabel}:touch-pointer-click`;
    } catch {
      return '';
    }
  }

  function dispatchRoomPanelToggleActivation(toggle, reason = '') {
    if (!toggle) return '';
    if (isTouchLikeDevice()) return dispatchTouchLikeActivation(toggle, reason || 'room-panel-touch');
    return dispatchSyntheticClick(toggle) ? (reason ? `${reason}:synthetic-click` : 'synthetic-click') : '';
  }

  function clickOriginalSettingRow(label) {
    const row = findOriginalSettingRow(label);
    if (!row) return false;

    const control = row.matches('[role="checkbox"]')
      ? row
      : row.querySelector('[role="checkbox"]');

    return dispatchSyntheticClick(control || row);
  }

  function applyOriginalSettingChoice(mode, labels, pendingKey) {
    const label = labels[mode];
    if (!label) return false;

    const checked = isOriginalSettingChecked(label);
    if (checked === true) {
      removeStorage(pendingKey);
      return true;
    }

    writeStorage(pendingKey, mode);

    if (clickOriginalSettingRow(label)) {
      setTimeout(() => {
        const checkedAfterClick = isOriginalSettingChecked(label);
        if (checkedAfterClick === true) removeStorage(pendingKey);
        else if (checkedAfterClick === false) writeStorage(pendingKey, mode);
      }, 180);
      return true;
    }
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
          window.location.replace(window.location.href);
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
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeoutId = controller
      ? window.setTimeout(() => controller.abort(), EPISODE_UI_REQUEST_TIMEOUT_MS)
      : null;

    try {
      const response = await fetch(CRACK_API.episodeUiSetting, {
        method: 'PATCH',
        mode: 'cors',
        credentials: 'include',
        cache: 'no-store',
        headers: getCrackUiSettingHeaders(),
        body: JSON.stringify(payload),
        ...(controller ? { signal: controller.signal } : {}),
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
    } catch (error) {
      if (controller?.signal.aborted) {
        const timeoutError = new Error('fetch ui-setting timeout');
        timeoutError.name = 'TimeoutError';
        throw timeoutError;
      }
      throw error;
    } finally {
      if (timeoutId != null) window.clearTimeout(timeoutId);
    }
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
        timeout: EPISODE_UI_REQUEST_TIMEOUT_MS,
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
    reportCrackUiError('episode-ui-save', error);
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

      // A newer selection supersedes this request. Do not start a second network
      // fallback for a value that is no longer current.
      if (requestSeq !== episodeUiSaveRequestSeq) return null;

      try {
        result = await requestEpisodeUiModeWithGm(payload);
      } catch (gmError) {
        errors.push(gmError);
        if (requestSeq !== episodeUiSaveRequestSeq) return null;

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

  function getAnimatedThumbSelector() {
    if (!pauseAnimatedThumbs) {
      return [
        'img[data-crack-ui-animated-thumb="1"]',
        'img[data-crack-ui-animated-thumb-src]',
      ].join(',');
    }

    return [
      'img[src*="_gif"]',
      'img[srcset*="_gif"]',
      'img[src$=".gif"]',
      'img[src*=".gif?"]',
      'img[src*=".gif#"]',
      'img[data-crack-ui-animated-thumb="1"]',
      'img[data-crack-ui-animated-thumb-src]',
    ].join(',');
  }

  function hasRestorableAnimatedThumbs() {
    return !!document.querySelector(
      'img[data-crack-ui-animated-thumb="1"], img[data-crack-ui-animated-thumb-src]'
    );
  }

  function applyAnimatedThumbState() {
    const selector = getAnimatedThumbSelector();
    if (!selector) return;

    document.querySelectorAll(selector).forEach((img) => {
      if (pauseAnimatedThumbs) pauseAnimatedThumbImage(img);
      else restoreAnimatedThumbImage(img);
    });
  }

  function scheduleAnimatedThumbState() {
    if (!pauseAnimatedThumbs && !hasRestorableAnimatedThumbs()) return;
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
    const nextText = formatImageSizeDisplay(imageSize);

    if (slider) slider.value = String(imageSize);
    if (value && value.textContent !== nextText) value.textContent = nextText;
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

    const nextText = supported ? formatChatWidthDisplay(chatWidthPercent) : 'PC/태블릿 전용';
    if (value && value.textContent !== nextText) value.textContent = nextText;
  }

  function updateChatListAutoHideUi() {
    const input = document.getElementById(ID.toggleChatListAutoHide);
    const row = input?.closest('[data-crack-ui-chat-list-auto-hide-row]');
    const tablet = isTabletLikeViewport();
    const supported = isChatListAutoHideSupportedViewport();

    if (row) {
      row.dataset.disabled = supported ? '0' : '1';
      row.setAttribute('aria-disabled', supported ? 'false' : 'true');
    }

    if (input) {
      input.disabled = !supported;
      input.title = supported
        ? (tablet ? '태블릿 채팅 목록 슬라이더 켜기/끄기' : '')
        : 'PC/모바일 전용';
    }

    const modeButton = document.getElementById(ID.chatListModeButton);
    if (modeButton) {
      modeButton.disabled = !supported;
      modeButton.title = supported
        ? (tablet ? '태블릿에서는 슬라이더 전용' : '모바일 동작 방식 선택')
        : 'PC/모바일 전용';
    }

    const label = row?.querySelector('.crack-ui-row-name');
    const nextLabel = tablet ? '채팅 목록 슬라이더' : '채팅 목록 자동 숨김';
    if (label && label.textContent !== nextLabel) label.textContent = nextLabel;
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

  function getPanelRangeInput(target) {
    if (!(target instanceof HTMLInputElement) || target.type !== 'range') return null;
    return target.closest?.(`#${ID.panel}`) ? target : null;
  }

  function startPanelRangePreview(input) {
    if (!input || input.disabled) return;

    const panel = input.closest?.(`#${ID.panel}`);
    const row = input.closest?.('.crack-ui-range-row');
    if (!panel || !row) return;

    activePanelRangePreviewInput = input;
    panel.querySelectorAll('[data-crack-ui-range-preview-active="1"]').forEach((element) => {
      if (element !== row) delete element.dataset.crackUiRangePreviewActive;
    });

    row.dataset.crackUiRangePreviewActive = '1';
    panel.dataset.crackUiRangePreview = '1';
    document.documentElement.classList.add(CLS.rangePreview);
  }

  function stopPanelRangePreview() {
    const panel = document.getElementById(ID.panel);
    panel?.querySelectorAll('[data-crack-ui-range-preview-active="1"]').forEach((element) => {
      delete element.dataset.crackUiRangePreviewActive;
    });

    if (panel) delete panel.dataset.crackUiRangePreview;
    activePanelRangePreviewInput = null;
    document.documentElement.classList.remove(CLS.rangePreview);
  }

  function startPanelRangeDrag(input) {
    if (!input || input.disabled) return;

    if (activePanelRangePreviewInput === input) {
      if (input.id === ID.chatWidthSlider && !isChatWidthDragging) {
        isChatWidthDragging = true;
        document.documentElement.classList.add(CLS.widthDragging);
      }
      return;
    }

    if (activePanelRangePreviewInput) stopPanelRangeDrag();

    startPanelRangePreview(input);

    // Chat width additionally disables its layout transition while dragging.
    // Every other current or future range input still gets the transparent preview automatically.
    if (input.id === ID.chatWidthSlider) {
      isChatWidthDragging = true;
      document.documentElement.classList.add(CLS.widthDragging);
    }
  }

  function stopPanelRangeDrag() {
    const input = activePanelRangePreviewInput;

    if (isChatWidthDragging) {
      isChatWidthDragging = false;
      document.documentElement.classList.remove(CLS.widthDragging);
      flushChatWidthSave();
    }

    if (input) stopPanelRangePreview();
  }

  function bindPanelRangeDragDelegation(panel) {
    if (!panel || panel.dataset.crackUiRangeDragBound === '1') return;
    panel.dataset.crackUiRangeDragBound = '1';

    const startFromEvent = (event) => {
      const input = getPanelRangeInput(event.target);
      if (input) startPanelRangeDrag(input);
    };

    const stopFromEvent = (event) => {
      const input = getPanelRangeInput(event.target);
      if (!input || input === activePanelRangePreviewInput) stopPanelRangeDrag();
    };

    // Event delegation means newly added range sliders are handled without extra binding code.
    panel.addEventListener('pointerdown', startFromEvent, { passive: true });
    panel.addEventListener('touchstart', startFromEvent, { passive: true });
    panel.addEventListener('mousedown', startFromEvent);
    panel.addEventListener('input', startFromEvent);
    panel.addEventListener('change', stopFromEvent);
    panel.addEventListener('blur', stopFromEvent, true);
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
    document.querySelectorAll(`#${ID.gearDesktop}, #${ID.gearMobile}, #${ID.panelRoot}, #${ID.panelBackdrop}, #${ID.panel}, #${ID.zone}, #${ID.handle}, #${ID.bottomModelButton}, #${ID.bottomModelPopup}, #${ID.roomMenuZone}, #${ID.roomMenuHandle}, #${ID.chatListZone}, #${ID.chatListHandle}, #${ID.menuSwipeZone}, .crack-ui-novel-model-indicator, .crack-ui-novel-model-menu, .crack-ui-novel-model-menu-backdrop`)
      .forEach((el) => el.remove());
    document.documentElement.classList.remove(
      'crack-wrtn-ui-autohide',
      'crack-wrtn-ui-header-visible',
      'crack-wrtn-ui-panel-open'
    );
  }

  function findStatBarRootFromButton(bar) {
    if (!(bar instanceof HTMLElement)) return null;

    let root = bar;
    let cur = bar.parentElement;
    for (let depth = 0; cur && cur !== document.body && depth < 5; depth += 1) {
      const cls = String(cur.className || '');
      if (cls.includes('transition-transform') && cls.includes('mt-12')) {
        root = cur;
        break;
      }
      cur = cur.parentElement;
    }

    return root;
  }

  function isLikelyStatCarousel(carousel) {
    if (!(carousel instanceof HTMLElement)) return false;
    if (carousel.getAttribute('aria-roledescription') !== 'carousel') return false;

    const bar = carousel.closest('[role="button"]');
    if (!(bar instanceof HTMLElement)) return false;

    const root = findStatBarRootFromButton(bar) || bar;
    const text = normalizeText(root.textContent || '');
    if (text.includes('턴 수')) return true;

    const slides = carousel.querySelectorAll('[aria-roledescription="slide"], [role="group"]').length;
    if (slides < 1) return false;

    const hasProgress = Array.from(root.querySelectorAll('div')).some((el) => {
      const cls = String(el.className || '');
      return cls.includes('w-20') && cls.includes('h-1.5') && cls.includes('bg-border');
    });

    const hasStatButton = Array.from(root.querySelectorAll('button')).some((button) => {
      const cls = String(button.className || '');
      return cls.includes('flex') && cls.includes('items-center') && cls.includes('px-4');
    });

    return hasProgress && hasStatButton;
  }

  function markStatBars() {
    document.querySelectorAll('[data-stat-index]').forEach((statItem) => {
      const bar = statItem.closest('[role="button"]');
      if (!bar) return;

      const root = findStatBarRootFromButton(bar) || bar;

      if (root.dataset.crackUiStatBar !== '1') {
        root.dataset.crackUiStatBar = '1';
      }
    });

    document.querySelectorAll('[aria-roledescription="carousel"]').forEach((carousel) => {
      if (!isLikelyStatCarousel(carousel)) return;

      const bar = carousel.closest('[role="button"]');
      const root = findStatBarRootFromButton(bar) || bar;
      if (!(root instanceof HTMLElement)) return;

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
      togglePanel();
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

  // =====================================================
  // Feature: header auto hide / settings panel
  // =====================================================

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

  const PANEL_SECTION_LABEL = Object.freeze({
    chat: '채팅',
    display: '화면',
  });

  function setActivePanelSection(sectionName, options = {}) {
    if (!Object.prototype.hasOwnProperty.call(PANEL_SECTION_LABEL, sectionName)) return;

    activePanelSection = sectionName;
    if (options.persist !== false) {
      writeStorage(LS.panelActiveSection, activePanelSection);
    }

    const panel = document.getElementById(ID.panel);
    if (!panel) return;

    panel.querySelectorAll('[data-crack-ui-section-nav]').forEach((button) => {
      const active = button.dataset.crackUiSectionNav === activePanelSection;
      button.dataset.active = active ? '1' : '0';
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.tabIndex = active ? 0 : -1;
    });

    panel.querySelectorAll('[data-crack-ui-section]').forEach((section) => {
      section.hidden = section.dataset.crackUiSection !== activePanelSection;
    });

    if (options.resetScroll !== false) {
      const scroller = panel.querySelector('.crack-ui-panel-body');
      if (scroller) scroller.scrollTop = 0;
      panel.dataset.crackUiThemeStripRestoring = '1';
      panel.dataset.crackUiThemeStripHidden = '0';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          delete panel.dataset.crackUiThemeStripRestoring;
        });
      });
    }
  }

  function syncPanelSections() {
    setActivePanelSection(activePanelSection, { persist: false, resetScroll: false });
  }

  function bindPanelSections(panel) {
    const sectionOrder = Object.keys(PANEL_SECTION_LABEL);
    const buttons = [...panel.querySelectorAll('[data-crack-ui-section-nav]')];

    buttons.forEach((button) => {
      if (button.dataset.crackUiBound === '1') return;
      button.dataset.crackUiBound = '1';

      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setActivePanelSection(button.dataset.crackUiSectionNav);
      });

      button.addEventListener('keydown', (e) => {
        const currentIndex = sectionOrder.indexOf(button.dataset.crackUiSectionNav);
        if (currentIndex < 0) return;

        let nextIndex = -1;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % sectionOrder.length;
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          nextIndex = (currentIndex - 1 + sectionOrder.length) % sectionOrder.length;
        } else if (e.key === 'Home') {
          nextIndex = 0;
        } else if (e.key === 'End') {
          nextIndex = sectionOrder.length - 1;
        }

        if (nextIndex < 0) return;
        e.preventDefault();
        e.stopPropagation();

        const nextSection = sectionOrder[nextIndex];
        setActivePanelSection(nextSection);
        panel.querySelector(`[data-crack-ui-section-nav="${nextSection}"]`)?.focus?.();
      });
    });
  }

  function bindPanelThemeStripScroll(panel) {
    const scroller = panel.querySelector('.crack-ui-panel-body');
    if (!scroller || scroller.dataset.crackUiThemeStripScrollBound === '1') return;

    scroller.dataset.crackUiThemeStripScrollBound = '1';
    let restoreCleanupRaf = 0;

    const clearRestoreMode = () => {
      if (restoreCleanupRaf) cancelAnimationFrame(restoreCleanupRaf);
      restoreCleanupRaf = requestAnimationFrame(() => {
        restoreCleanupRaf = requestAnimationFrame(() => {
          delete panel.dataset.crackUiThemeStripRestoring;
          restoreCleanupRaf = 0;
        });
      });
    };

    const updateThemeStripVisibility = () => {
      const scrollTop = Math.max(0, scroller.scrollTop);
      const hidden = panel.dataset.crackUiThemeStripHidden === '1';

      // Hysteresis prevents rapid hide/show changes around the boundary.
      if (!hidden && scrollTop > 12) {
        delete panel.dataset.crackUiThemeStripRestoring;
        panel.dataset.crackUiThemeStripHidden = '1';
        return;
      }

      // Restore only after the scroller has actually reached the top.
      // Height/padding return immediately, avoiding the upward "thud" effect.
      if (hidden && scrollTop <= 1) {
        panel.dataset.crackUiThemeStripRestoring = '1';
        panel.dataset.crackUiThemeStripHidden = '0';
        clearRestoreMode();
      }
    };

    scroller.addEventListener('scroll', updateThemeStripVisibility, { passive: true });
    updateThemeStripVisibility();
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

  function getMenuAssistModePopoverId(target) {
    return target === 'room' ? ID.roomMenuModePanel : ID.chatListModePanel;
  }

  function closeMenuAssistModePanels(panel = document.getElementById(ID.panel)) {
    document.querySelectorAll('[data-crack-ui-menu-mode-popover]').forEach((popover) => {
      popover.remove();
    });

    panel?.querySelectorAll('[data-crack-ui-menu-mode-toggle]').forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
    });
  }

  function syncMenuAssistModeUi(panel = document.getElementById(ID.panel)) {
    if (!panel) return;

    const values = {
      room: roomMenuAssistMode,
      'chat-list': chatListAssistMode,
    };

    Object.entries(values).forEach(([target, mode]) => {
      const normalized = target === 'chat-list' && isTabletLikeViewport()
        ? 'swipe'
        : normalizeMenuAssistMode(mode);
      const button = panel.querySelector(`[data-crack-ui-menu-mode-toggle="${target}"]`);
      const nextLabel = MENU_ASSIST_MODE_LABEL[normalized];
      if (button && button.textContent !== nextLabel) button.textContent = nextLabel;

      const popover = document.querySelector(`[data-crack-ui-menu-mode-popover="${target}"]`);
      popover?.querySelectorAll(`[data-crack-ui-menu-mode-target="${target}"]`).forEach((choice) => {
        const selected = choice.dataset.crackUiMenuModeChoice === normalized;
        choice.dataset.selected = selected ? '1' : '0';
        choice.setAttribute('aria-checked', selected ? 'true' : 'false');
      });
    });
  }

  function positionMenuAssistModePopover(button, popover) {
    if (!button || !popover) return;

    const rect = button.getBoundingClientRect();
    const viewport = window.visualViewport;
    const viewportLeft = Number(viewport?.offsetLeft || 0);
    const viewportTop = Number(viewport?.offsetTop || 0);
    const viewportWidth = Math.max(1, Number(viewport?.width || window.innerWidth || 1));
    const viewportHeight = Math.max(1, Number(viewport?.height || window.innerHeight || 1));
    const width = Math.min(180, viewportWidth - 20);

    popover.style.setProperty('width', `${width}px`, 'important');

    const measuredHeight = popover.getBoundingClientRect().height;
    const popoverHeight = measuredHeight > 20 ? measuredHeight : 132;
    const viewportRight = viewportLeft + viewportWidth;
    const viewportBottom = viewportTop + viewportHeight;

    const left = Math.max(
      viewportLeft + 10,
      Math.min(viewportRight - width - 10, viewportLeft + rect.right - width)
    );

    let top = viewportTop + rect.bottom + 8;

    if (top + popoverHeight > viewportBottom - 10) {
      top = Math.max(viewportTop + 10, viewportTop + rect.top - popoverHeight - 8);
      popover.style.transformOrigin = 'bottom right';
    } else {
      popover.style.transformOrigin = 'top right';
    }

    popover.style.setProperty('left', `${Math.round(left)}px`, 'important');
    popover.style.setProperty('top', `${Math.round(top)}px`, 'important');
  }

  function setMenuAssistMode(target, value) {
    const mode = target === 'chat-list' && isTabletLikeViewport()
      ? 'swipe'
      : normalizeMenuAssistMode(value);

    if (target === 'room') {
      roomMenuAssistMode = mode;
      writeStorage(LS.roomMenuAssistMode, mode);
      ensureRoomMenuHandle();
    } else if (target === 'chat-list') {
      chatListAssistMode = mode;
      writeStorage(LS.chatListAssistMode, mode);
      ensureChatListAutoHide();
    } else {
      return;
    }

    closeMenuAssistModePanels();
    applyState();
  }

  function openMenuAssistModePopover(target, button) {
    try {
      if (
        !button ||
        (!isPhoneLikeViewport() && !isTabletLikeViewport()) ||
        (target === 'chat-list' && isTabletLikeViewport())
      ) {
        closeMenuAssistModePanels();
        return;
      }

      const selector = `[data-crack-ui-menu-mode-popover="${target}"]`;
      const wasOpen = !!document.querySelector(selector);
      closeMenuAssistModePanels();
      if (wasOpen) return;

      const popover = document.createElement('div');
      popover.id = getMenuAssistModePopoverId(target);
      popover.className = 'crack-ui-menu-mode-popover';
      popover.dataset.crackUiMenuModePopover = target;
      popover.setAttribute('role', 'menu');
      popover.setAttribute('aria-label', '메뉴 열기 방식 선택');

      const choices = target === 'chat-list' && isTabletLikeViewport()
        ? [['swipe', '슬라이더']]
        : [
            ['handle', '핸들'],
            ['swipe', '슬라이더'],
            ['both', '핸들 + 슬라이더'],
          ];

      for (const [value, label] of choices) {
        const choice = document.createElement('button');
        choice.type = 'button';
        choice.className = 'crack-ui-menu-mode-choice';
        choice.dataset.crackUiMenuModeTarget = target;
        choice.dataset.crackUiMenuModeChoice = value;
        choice.setAttribute('role', 'menuitemradio');
        choice.textContent = label;
        popover.appendChild(choice);
      }

      popover.addEventListener('click', (event) => {
        const choice = event.target.closest?.('[data-crack-ui-menu-mode-choice]');
        if (!choice || !popover.contains(choice)) return;

        event.preventDefault();
        event.stopPropagation();

        setMenuAssistMode(
          choice.dataset.crackUiMenuModeTarget,
          choice.dataset.crackUiMenuModeChoice
        );
      });

      document.body.appendChild(popover);
      button.setAttribute('aria-expanded', 'true');
      syncMenuAssistModeUi();
      positionMenuAssistModePopover(button, popover);
    } catch (error) {
      reportCrackUiError('menu-mode-popover', error);
      closeMenuAssistModePanels();
    }
  }

  function bindMenuAssistModeControls(panel) {
    if (!panel || panel.dataset.crackUiMenuModeBound === '1') return;
    panel.dataset.crackUiMenuModeBound = '1';

    panel.querySelectorAll('[data-crack-ui-menu-mode-toggle]').forEach((button) => {
      if (button.dataset.crackUiMenuModeButtonBound === '1') return;
      button.dataset.crackUiMenuModeButtonBound = '1';

      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const target = button.dataset.crackUiMenuModeToggle || '';
        openMenuAssistModePopover(target, button);
      });
    });

    const root = document.documentElement;
    if (root.dataset.crackUiMenuModePopoverBound !== '1') {
      root.dataset.crackUiMenuModePopoverBound = '1';

      document.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.closest('[data-crack-ui-menu-mode-popover]')) return;
        if (target.closest('[data-crack-ui-menu-mode-toggle]')) return;
        closeMenuAssistModePanels();
      });

      document.addEventListener('scroll', () => {
        if (document.querySelector('[data-crack-ui-menu-mode-popover]')) {
          closeMenuAssistModePanels();
        }
      }, true);

      window.addEventListener('resize', () => {
        closeMenuAssistModePanels();
      }, { passive: true });

      window.visualViewport?.addEventListener?.('resize', () => {
        closeMenuAssistModePanels();
      }, { passive: true });
    }

    syncMenuAssistModeUi(panel);
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

    const visibleModelDisclosure = panel.querySelector(`#${ID.visibleModelDisclosure}`);
    if (visibleModelDisclosure && visibleModelDisclosure.dataset.crackUiBound !== '1') {
      visibleModelDisclosure.dataset.crackUiBound = '1';
      visibleModelDisclosure.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleVisibleModelListOpen();
      });
    }

    panel.querySelectorAll('[data-crack-ui-visible-model]').forEach((button) => {
      if (button.dataset.crackUiBound === '1') return;
      button.dataset.crackUiBound = '1';
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleVisibleChatModel(button.dataset.crackUiVisibleModel);
      });
    });
  }

  function syncCheckbox(id, checked) {
    const input = document.getElementById(id);
    if (input) input.checked = checked;
  }

  function ensurePanel() {
    let panelRoot = document.getElementById(ID.panelRoot);
    if (!panelRoot) {
      panelRoot = document.createElement('div');
      panelRoot.id = ID.panelRoot;
      document.body.appendChild(panelRoot);
    }

    let panelBackdrop = document.getElementById(ID.panelBackdrop);
    if (!panelBackdrop) {
      panelBackdrop = document.createElement('div');
      panelBackdrop.id = ID.panelBackdrop;
      panelBackdrop.setAttribute('aria-hidden', 'true');
    }
    if (panelBackdrop.parentElement !== panelRoot) panelRoot.appendChild(panelBackdrop);

    const existingPanel = document.getElementById(ID.panel);
    if (existingPanel) {
      if (existingPanel.parentElement !== panelRoot) panelRoot.appendChild(existingPanel);
      return;
    }

    const panel = document.createElement('div');
    panel.id = ID.panel;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Crack UI Plus 설정');

    panel.innerHTML = `
      <div class="crack-ui-panel-head">
        <div class="crack-ui-title-wrap">
          <div class="crack-ui-panel-title">Crack UI Plus</div>
          <div class="crack-ui-panel-version" aria-label="버전 ${CRACK_UI_VERSION}">v${CRACK_UI_VERSION}</div>
        </div>
        <button type="button" class="crack-ui-panel-close" aria-label="닫기">×</button>
      </div>

      <div class="crack-ui-panel-shell">
        <div class="crack-ui-panel-theme-strip" aria-label="빠른 테마 설정">
          <span class="crack-ui-theme-strip-title">테마</span>

          <div class="crack-ui-theme-strip-group">
            <span class="crack-ui-theme-strip-label">색상</span>
            <div class="crack-ui-theme-strip-options">
              <button type="button" role="checkbox" class="crack-ui-choice-row" data-crack-ui-theme-mode="light" data-selected="${themeMode === 'light' ? '1' : '0'}" aria-checked="${themeMode === 'light' ? 'true' : 'false'}">
                <span class="crack-ui-choice-name">라이트 모드</span>
              </button>
              <button type="button" role="checkbox" class="crack-ui-choice-row" data-crack-ui-theme-mode="dark" data-selected="${themeMode === 'dark' ? '1' : '0'}" aria-checked="${themeMode === 'dark' ? 'true' : 'false'}">
                <span class="crack-ui-choice-name">다크 모드</span>
              </button>
            </div>
          </div>

          <div class="crack-ui-theme-strip-group">
            <span class="crack-ui-theme-strip-label">작품</span>
            <div class="crack-ui-theme-strip-options">
              <button type="button" role="checkbox" class="crack-ui-choice-row" data-crack-ui-episode-ui-mode="novel" data-selected="${episodeUiMode === 'novel' ? '1' : '0'}" aria-checked="${episodeUiMode === 'novel' ? 'true' : 'false'}">
                <span class="crack-ui-choice-name">소설형 UI</span>
              </button>
              <button type="button" role="checkbox" class="crack-ui-choice-row" data-crack-ui-episode-ui-mode="chat" data-selected="${episodeUiMode === 'chat' ? '1' : '0'}" aria-checked="${episodeUiMode === 'chat' ? 'true' : 'false'}">
                <span class="crack-ui-choice-name">채팅형 UI</span>
              </button>
            </div>
          </div>
        </div>

        <div class="crack-ui-panel-workspace">
          <nav class="crack-ui-panel-nav" role="tablist" aria-label="설정 카테고리">
            <button type="button" class="crack-ui-panel-nav-button" role="tab" data-crack-ui-section-nav="chat" data-active="${activePanelSection === 'chat' ? '1' : '0'}" aria-selected="${activePanelSection === 'chat' ? 'true' : 'false'}">채팅</button>
            <button type="button" class="crack-ui-panel-nav-button" role="tab" data-crack-ui-section-nav="display" data-active="${activePanelSection === 'display' ? '1' : '0'}" aria-selected="${activePanelSection === 'display' ? 'true' : 'false'}">화면</button>
          </nav>

          <div class="crack-ui-panel-content">
            <div class="crack-ui-panel-body">
        <div class="crack-ui-section" data-crack-ui-section="chat">
          <div class="crack-ui-section-body crack-ui-chat-layout-grid" data-crack-ui-section-body="chat">
            <div class="crack-ui-range-row crack-ui-chat-layout-half" data-crack-ui-chat-width-row data-disabled="${isChatWidthSupportedViewport() ? '0' : '1'}" aria-disabled="${isChatWidthSupportedViewport() ? 'false' : 'true'}">
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

            <div class="crack-ui-range-row crack-ui-chat-layout-half">
              <div class="crack-ui-range-head">
                <span class="crack-ui-row-name">이미지 사이즈 조절</span>
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
                aria-label="이미지 사이즈 조절"
              >
            </div>

            <div class="crack-ui-model-settings-card crack-ui-chat-layout-full">
              <label class="crack-ui-row crack-ui-model-toggle-row">
                <span class="crack-ui-row-text">
                  <span class="crack-ui-row-name">입력창 모델 변경 버튼</span>
                  <span class="crack-ui-row-desc">전송 버튼 옆에 활성화됨</span>
                </span>

                <span>
                  <input id="${ID.toggleBottomModelPicker}" class="crack-ui-toggle" type="checkbox">
                  <span class="crack-ui-switch" aria-hidden="true"></span>
                </span>
              </label>

              <button
                type="button"
                id="${ID.visibleModelDisclosure}"
                class="crack-ui-row crack-ui-visible-model-disclosure"
                data-open="${visibleModelListOpen ? '1' : '0'}"
                aria-expanded="${visibleModelListOpen ? 'true' : 'false'}"
                aria-controls="${ID.visibleModelPanel}"
              >
                <span class="crack-ui-row-text">
                  <span class="crack-ui-row-name">표시할 모델</span>
                </span>
                <span class="crack-ui-visible-model-chevron" aria-hidden="true">▾</span>
              </button>

              <div
                id="${ID.visibleModelPanel}"
                class="crack-ui-visible-model-panel"
                data-open="${visibleModelListOpen ? '1' : '0'}"
                ${visibleModelListOpen ? '' : 'hidden'}
              >
                <div class="crack-ui-visible-model-list">
                  ${renderVisibleModelChoicesHtml()}
                </div>
              </div>
            </div>

            <div class="crack-ui-row crack-ui-menu-assist-row crack-ui-chat-layout-half" data-crack-ui-menu-assist-row="room" data-crack-ui-chat-order="1">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">채팅방 설정 자동 숨김</span>
              </span>

              <button id="${ID.roomMenuModeButton}" type="button" class="crack-ui-menu-mode-button" data-crack-ui-menu-mode-toggle="room" aria-haspopup="menu" aria-expanded="false">
                ${MENU_ASSIST_MODE_LABEL[roomMenuAssistMode]}
              </button>

              <label class="crack-ui-menu-toggle-wrap">
                <input id="${ID.toggleRoomMenuHandle}" class="crack-ui-toggle" type="checkbox">
                <span class="crack-ui-switch" aria-hidden="true"></span>
              </label>

            </div>

            <label class="crack-ui-row crack-ui-chat-layout-half" data-crack-ui-chat-order="2">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">스탯창 숨김</span>
              </span>

              <span>
                <input id="${ID.toggleStatBar}" class="crack-ui-toggle" type="checkbox">
                <span class="crack-ui-switch" aria-hidden="true"></span>
              </span>
            </label>

            <label class="crack-ui-row crack-ui-empty-send-guard-row crack-ui-chat-layout-half" data-crack-ui-chat-order="3">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">스토리 자동 재생 끄기</span>
                <span class="crack-ui-row-desc">입력창이 비어 있으면 전송을 막음</span>
              </span>

              <span>
                <input id="${ID.toggleEmptySendGuard}" class="crack-ui-toggle" type="checkbox">
                <span class="crack-ui-switch" aria-hidden="true"></span>
              </span>
            </label>

            <label class="crack-ui-row crack-ui-chat-layout-half" data-crack-ui-chat-order="4">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">상황 이미지 끄기</span>
                <span class="crack-ui-row-desc">
                  세이프티 작품 전용
                </span>
              </span>

              <span>
                <input id="${ID.toggleHideSituationImage}" class="crack-ui-toggle" type="checkbox">
                <span class="crack-ui-switch" aria-hidden="true"></span>
              </span>
            </label>

            <label class="crack-ui-row crack-ui-chat-layout-half" data-crack-ui-chat-order="5">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">소설형 UI 모델 표기</span>
              </span>

              <span>
                <input id="${ID.toggleNovelModelIndicator}" class="crack-ui-toggle" type="checkbox">
                <span class="crack-ui-switch" aria-hidden="true"></span>
              </span>
            </label>

            <label class="crack-ui-row crack-ui-chat-layout-half" data-crack-ui-chat-order="6">
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




          </div>
        </div>

        <div class="crack-ui-section" data-crack-ui-section="display">
          <div class="crack-ui-section-body" data-crack-ui-section-body="display">
            <label class="crack-ui-row">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">상단바 자동 숨김</span>
              </span>

              <span>
                <input id="${ID.toggleHeader}" class="crack-ui-toggle" type="checkbox">
                <span class="crack-ui-switch" aria-hidden="true"></span>
              </span>
            </label>

            <label class="crack-ui-row" data-disabled="${isIosDevice() ? '1' : '0'}" aria-disabled="${isIosDevice() ? 'true' : 'false'}">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">전체화면 버튼</span>
                ${isIosDevice() ? '<span class="crack-ui-row-desc">iOS 미지원</span>' : ''}
              </span>

              <span>
                <input id="${ID.toggleFullscreenButton}" class="crack-ui-toggle" type="checkbox" ${isIosDevice() ? 'disabled' : ''}>
                <span class="crack-ui-switch" aria-hidden="true"></span>
              </span>
            </label>

            <div class="crack-ui-row crack-ui-menu-assist-row" data-crack-ui-chat-list-auto-hide-row data-crack-ui-menu-assist-row="chat-list" data-disabled="${isChatListAutoHideSupportedViewport() ? '0' : '1'}" aria-disabled="${isChatListAutoHideSupportedViewport() ? 'false' : 'true'}">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">채팅 목록 자동 숨김</span>
              </span>

              <button id="${ID.chatListModeButton}" type="button" class="crack-ui-menu-mode-button" data-crack-ui-menu-mode-toggle="chat-list" aria-haspopup="menu" aria-expanded="false">
                ${MENU_ASSIST_MODE_LABEL[chatListAssistMode]}
              </button>

              <label class="crack-ui-menu-toggle-wrap">
                <input id="${ID.toggleChatListAutoHide}" class="crack-ui-toggle" type="checkbox">
                <span class="crack-ui-switch" aria-hidden="true"></span>
              </label>

            </div>

            <label class="crack-ui-row">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">썸네일 움짤 정지</span>
              </span>

              <span>
                <input id="${ID.toggleAnimatedThumbs}" class="crack-ui-toggle" type="checkbox">
                <span class="crack-ui-switch" aria-hidden="true"></span>
              </span>
            </label>
          </div>
        </div>
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
    panelRoot.appendChild(panel);

    bindPanelSections(panel);
    bindPanelThemeStripScroll(panel);
    bindChoiceButtons(panel);
    bindMenuAssistModeControls(panel);
    syncPanelSections();
    updateVisibleModelChoicesUi();
    syncVisibleModelListOpenUi();
    updateThemeUi();
    updateChatListAutoHideUi();

    bindCheckbox(panel, ID.toggleHeader, autoHideHeader, (checked) => {
      autoHideHeader = checked;
      writeStorage(LS.autoHideHeader, autoHideHeader ? '1' : '0');

      if (!autoHideHeader) {
        mobileReveal = false;
        roomMenuReveal = false;
        roomMenuForceReveal = false;
        clearMobileHideTimer();
        clearRoomMenuForceRevealTimer();
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
    bindCheckbox(panel, ID.toggleBottomModelPicker, bottomModelPicker, (checked) => {
      bottomModelPicker = checked;
      writeStorage(LS.bottomModelPicker, bottomModelPicker ? '1' : '0');
      ensureBottomModelPicker();
    });
    bindCheckbox(panel, ID.toggleEmptySendGuard, emptySendGuard, (checked) => {
      emptySendGuard = checked;
      writeStorage(LS.emptySendGuard, emptySendGuard ? '1' : '0');
      applyEmptySendGuardState();
    });

    bindCheckbox(panel, ID.toggleNovelModelIndicator, novelModelIndicator, (checked) => {
      novelModelIndicator = checked;
      writeStorage(LS.novelModelIndicator, novelModelIndicator ? '1' : '0');
      if (novelModelIndicator) {
        novelModelIndicatorCleanupPending = true;
        installNovelModelNetworkCapture();
        scheduleNovelModelIndicatorScan({ immediate: true });
      } else {
        disableNovelModelIndicatorUi();
      }
    });

    bindCheckbox(panel, ID.toggleHideSituationImage, hideSituationImage, (checked) => {
      hideSituationImage = checked;
      writeStorage(LS.hideSituationImage, hideSituationImage ? '1' : '0');
      applyState();
      // User activation should reflect immediately; routine init scans stay throttled.
      scheduleSituationImageButtonMark({ immediate: true });
    });
    bindCheckbox(panel, ID.toggleRoomMenuHandle, roomMenuHandle, (checked) => {
      roomMenuHandle = checked;
      writeStorage(LS.roomMenuHandle, roomMenuHandle ? '1' : '0');
      ensureRoomMenuHandle();
      applyState();
    });
    bindCheckbox(panel, ID.toggleFullscreenButton, fullscreenButtonEnabled, (checked, input) => {
      if (isIosDevice()) {
        fullscreenButtonEnabled = false;
        writeStorage(LS.fullscreenButton, '0');
        if (input) input.checked = false;
        removeFullscreenButton();
        return;
      }

      fullscreenButtonEnabled = checked;
      writeStorage(LS.fullscreenButton, fullscreenButtonEnabled ? '1' : '0');
      ensureFullscreenButton();
    });
    bindCheckbox(panel, ID.toggleChatListAutoHide, chatListAutoHide, (checked) => {
      if (checked && isTabletLikeViewport()) {
        chatListAssistMode = 'swipe';
        writeStorage(LS.chatListAssistMode, chatListAssistMode);
      }

      chatListAutoHide = checked;
      writeStorage(LS.chatListAutoHide, chatListAutoHide ? '1' : '0');
      ensureChatListAutoHide();
      applyState();

      if (checked && isDesktopChatListAutoHideViewport()) scheduleChatListClose(450);
    });
    bindRangeInput(panel, ID.imageSlider, setImageSize, flushImageSizeSave);
    bindRangeInput(panel, ID.chatWidthSlider, setChatWidthPercent);

    // One delegated handler covers every current and future range slider in the panel.
    bindPanelRangeDragDelegation(panel);

    updateImageSizeUi();
    updateChatWidthUi();
  }

  function openPanel() {
    const panel = document.getElementById(ID.panel);
    if (!panel) return;

    panelOpen = true;
    panel.dataset.open = '1';

    clearMobileHideTimer();

    syncCheckbox(ID.toggleHeader, autoHideHeader);
    syncCheckbox(ID.toggleAnimatedThumbs, pauseAnimatedThumbs);
    syncCheckbox(ID.toggleStatBar, hideStatBar);
    syncCheckbox(ID.toggleLineBreak, lineBreakOptimize);
    syncCheckbox(ID.toggleBottomModelPicker, bottomModelPicker);
    syncCheckbox(ID.toggleEmptySendGuard, emptySendGuard);
    syncCheckbox(ID.toggleHideSituationImage, hideSituationImage);
    syncCheckbox(ID.toggleNovelModelIndicator, novelModelIndicator);
    syncCheckbox(ID.toggleRoomMenuHandle, roomMenuHandle);
    syncCheckbox(ID.toggleChatListAutoHide, chatListAutoHide);
    syncCheckbox(ID.toggleFullscreenButton, fullscreenButtonEnabled);
    closeMenuAssistModePanels(panel);
    updateVisibleModelChoicesUi();
    syncVisibleModelListOpenUi();

    syncThemeStateFromOriginalSettings();
    syncPanelSections();
    updateThemeUi();
    updateImageSizeUi();
    updateChatWidthUi();
    applyState();
  }

  function closePanel() {
    const panel = document.getElementById(ID.panel);
    if (!panel) return;

    panelOpen = false;
    panel.dataset.open = '0';
    closeMenuAssistModePanels(panel);
    stopPanelRangeDrag();
    isChatWidthDragging = false;
    document.documentElement.classList.remove(CLS.widthDragging);
    flushImageSizeSave();
    flushChatWidthSave();

    if (isTouchLikeDevice() && autoHideHeader) {
      scheduleMobileHide(1200);
    }

    applyState();
  }

  function togglePanel() {
    if (panelOpen) closePanel();
    else openPanel();
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
      (pointerOnZone || pointerOnHeader || panelOpen || mobileReveal || roomMenuForceReveal);
    document.documentElement.classList.toggle(CLS.reveal, shouldReveal);
    document.documentElement.classList.toggle(CLS.panelOpen, panelOpen);
  }

  function applyState() {
    updateDeviceViewportClasses();
    if (hideStatBar) markStatBars();
    // init can run repeatedly while the chat DOM is streaming. Keep later full
    // button scans on the existing throttle, while preserving an immediate first scan.
    scheduleSituationImageButtonMark({
      immediate: hideSituationImage && situationImageLastScanAt === 0,
    });
    document.documentElement.classList.toggle(CLS.autoHide, autoHideHeader);
    document.documentElement.classList.toggle(CLS.lineBreak, lineBreakOptimize);
    document.documentElement.classList.toggle(CLS.pauseAnimatedThumbs, pauseAnimatedThumbs);
    document.documentElement.classList.toggle(CLS.hideStatBar, hideStatBar);
    document.documentElement.classList.toggle(CLS.hideSituationImage, hideSituationImage);
    document.documentElement.classList.toggle(CLS.roomMenuEnabled, roomMenuHandle && crackUiIsChatRoute());
    document.documentElement.classList.toggle(CLS.chatListEnabled, chatListAutoHide && isChatListAutoHideSupportedViewport());
    markMobileChatListOpenState();
    updateChatListAutoHideUi();
    syncMenuAssistModeUi();
    ensureMenuSwipeZone();
    updateRoomMenuRevealClass();
    applyEmptySendGuardState();
    applyThemeModeHint();
    applyChatWidth();
    updateReveal();
  }



  function isMobileMenuSwipeViewport() {
    return (isPhoneLikeViewport() || isTabletLikeViewport()) && isTouchLikeDevice();
  }

  function isLeftMenuSwipeEnabled() {
    const swipeModeEnabled = isTabletLikeViewport() || menuAssistModeHasSwipe(chatListAssistMode);
    return chatListAutoHide &&
      swipeModeEnabled &&
      isMobileMenuSwipeViewport() &&
      crackUiIsChatRoute();
  }

  function isRightMenuSwipeEnabled() {
    return roomMenuHandle &&
      menuAssistModeHasSwipe(roomMenuAssistMode) &&
      isMobileMenuSwipeViewport() &&
      crackUiIsChatRoute();
  }

  function isMenuSwipeZoneActive() {
    return !panelOpen && (isLeftMenuSwipeEnabled() || isRightMenuSwipeEnabled());
  }

  function findMenuSwipeComposerShell(editable = DOM.composerEditable()) {
    if (!editable) return null;
    return editable.closest?.('form') ||
      editable.closest?.('div.flex.flex-col.rounded-lg.border, div.rounded-lg.border.bg-background, div[class*="rounded"][class*="border"]') ||
      editable.parentElement;
  }

  function positionMenuSwipeZone() {
    const zone = document.getElementById(ID.menuSwipeZone);
    if (!zone || !isMenuSwipeZoneActive()) return;

    const shell = findMenuSwipeComposerShell();
    let top = NaN;

    try {
      const rect = shell?.getBoundingClientRect?.();
      if (rect && rect.width > 40 && rect.height > 20 && rect.top > 0) {
        top = Math.max(54, Math.round(rect.top - MENU_SWIPE.topOffset));
      }
    } catch (error) {
      reportCrackUiError('menu-swipe-position', error);
    }

    if (Number.isFinite(top)) {
      zone.style.setProperty('top', `${top}px`, 'important');
      zone.style.setProperty('bottom', 'auto', 'important');
    } else {
      zone.style.removeProperty('top');
      zone.style.setProperty('bottom', 'calc(98px + env(safe-area-inset-bottom))', 'important');
    }
  }

  function scheduleMenuSwipeZonePosition() {
    if (menuSwipePositionRaf) return;
    menuSwipePositionRaf = requestAnimationFrame(() => {
      menuSwipePositionRaf = 0;
      positionMenuSwipeZone();
    });
  }

  function pointInMenuSwipeZone(event) {
    if (!isMenuSwipeZoneActive()) return false;
    const zone = document.getElementById(ID.menuSwipeZone);
    if (!zone) return false;

    let rect = null;
    try {
      rect = zone.getBoundingClientRect();
    } catch (error) {
      reportCrackUiError('menu-swipe-hit-test', error);
      return false;
    }

    if (!rect || rect.width < 20 || rect.height < 12) return false;
    const x = Number(event?.clientX);
    const y = Number(event?.clientY);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function menuSwipeEventTargetBlocked(target) {
    if (!(target instanceof Element)) return false;
    return !!target.closest?.(
      `#${ID.panel}, #${ID.bottomModelPopup}, #${ID.roomMenuZone}, #${ID.chatListZone}, input, textarea, select, [contenteditable="true"]`
    );
  }

  function bindMenuSwipeGesture() {
    const root = document.documentElement;
    if (root.dataset.crackUiMenuSwipeBound === '1') return;
    root.dataset.crackUiMenuSwipeBound = '1';

    let tracking = null;
    let suppressClickUntil = 0;
    let suppressClickX = 0;
    let suppressClickY = 0;

    const cancel = () => {
      tracking = null;
    };

    document.addEventListener('click', (event) => {
      if (Date.now() > suppressClickUntil) return;
      const x = Number(event.clientX || 0);
      const y = Number(event.clientY || 0);
      if (Math.abs(x - suppressClickX) > 18 || Math.abs(y - suppressClickY) > 18) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
    }, true);

    document.addEventListener('pointerdown', (event) => {
      if (!isMenuSwipeZoneActive()) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (event.isPrimary === false) return;
      if (tracking) {
        cancel();
        return;
      }

      scheduleMenuSwipeZonePosition();
      if (!pointInMenuSwipeZone(event)) return;
      if (menuSwipeEventTargetBlocked(event.target)) return;

      tracking = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        at: Date.now(),
      };
    }, { capture: true, passive: true });

    document.addEventListener('pointercancel', (event) => {
      if (!tracking || event.pointerId !== tracking.id) return;
      cancel();
    }, { capture: true, passive: true });

    document.addEventListener('pointerup', (event) => {
      if (!tracking || event.pointerId !== tracking.id) return;
      const data = tracking;
      cancel();

      if (!isMenuSwipeZoneActive()) return;

      const dx = Number(event.clientX) - data.x;
      const dy = Number(event.clientY) - data.y;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      const elapsed = Date.now() - data.at;

      if (
        elapsed > MENU_SWIPE.maxMs ||
        ax < MENU_SWIPE.minDx ||
        ay > MENU_SWIPE.maxDy ||
        ax <= ay * MENU_SWIPE.ratio ||
        Date.now() - lastMenuSwipeAt < MENU_SWIPE.cooldownMs
      ) {
        return;
      }

      let handled = false;

      if (dx > 0 && isLeftMenuSwipeEnabled()) {
        if (!DOM.mobileChatListPopover()) {
          handled = clickMobileChatListNativeButton('swipe');
        }
      } else if (dx < 0 && isRightMenuSwipeEnabled()) {
        const panel = DOM.roomPanel();
        if (!panel || !isRoomPanelOpen(panel)) {
          roomMenuReveal = true;
          updateRoomMenuRevealClass();
          setRoomTopBarHidden(false);
          handled = clickRoomPanelToggle(true, 'swipe');
        }
      }

      if (!handled) return;

      lastMenuSwipeAt = Date.now();
      suppressClickUntil = Date.now() + 450;
      suppressClickX = Number(event.clientX || 0);
      suppressClickY = Number(event.clientY || 0);
      event.preventDefault();
    }, { capture: true, passive: false });
  }

  function ensureMenuSwipeZone() {
    let zone = document.getElementById(ID.menuSwipeZone);

    if (!isMenuSwipeZoneActive()) {
      zone?.remove();
      return;
    }

    if (!zone) {
      zone = document.createElement('div');
      zone.id = ID.menuSwipeZone;
      zone.setAttribute('aria-hidden', 'true');
      document.body?.appendChild(zone);
    }

    scheduleMenuSwipeZonePosition();
  }

  // =====================================================
  // Feature: situation image button hide
  // =====================================================

  function getSvgPathText(root) {
    if (!root?.querySelectorAll) return '';
    return [...root.querySelectorAll('path')]
      .map((path) => String(path.getAttribute('d') || ''))
      .join(' ')
      .replace(/\s+/g, ' ');
  }

  function scoreSituationImageButton(button) {
    if (!button || !button.isConnected) return -1;
    if (button.id && button.id.startsWith('crack-ui-')) return -1;
    if (button.closest?.(`#${ID.panel}, #${ID.bottomModelPopup}, #${ID.roomMenuZone}, #${ID.chatListZone}`)) return -1;

    const r = crackUiEdgeRect(button);
    if (!r || r.width < 20 || r.width > 48 || r.height < 20 || r.height > 48) return -1;

    const pathText = getSvgPathText(button);
    if (!pathText) return -1;

    let score = 0;
    if (pathText.includes('m17.01 2.2') && pathText.includes('M18.63 1.44')) score += 28;
    if (pathText.includes('clip-rule') || pathText.includes('m13.8 2.58')) score += 4;

    const classes = `${String(button.className || '')} ${String(button.parentElement?.className || '')} ${String(button.parentElement?.parentElement?.className || '')}`;
    if (classes.includes('size-7')) score += 4;
    if (classes.includes('bg-secondary')) score += 3;
    if (classes.includes('space-x-3')) score += 3;
    if (classes.includes('justify-between')) score += 2;
    if (classes.includes('mt-2')) score += 2;

    const actionRow = button.closest?.('div.flex.items-center.justify-between');
    if (actionRow) {
      const rowRect = crackUiEdgeRect(actionRow);
      if (rowRect && rowRect.top > 40 && rowRect.bottom <= (window.innerHeight || 0) + 120) score += 2;
      if (actionRow.querySelector('button[aria-label="메시지 옵션"]')) score += 8;
      if (actionRow.textContent && actionRow.textContent.length < 80) score += 1;
    }

    return score;
  }

  function findSituationImageButtons() {
    const result = [];
    for (const button of document.querySelectorAll('button')) {
      if (scoreSituationImageButton(button) >= 30) result.push(button);
    }
    return result;
  }

  function clearSituationImageButtonMarks() {
    for (const old of document.querySelectorAll('[data-crack-ui-situation-image-button="1"]')) {
      old.removeAttribute('data-crack-ui-situation-image-button');
      old.removeAttribute('aria-hidden');
      old.removeAttribute('tabindex');
    }
  }

  function markSituationImageButtons() {
    situationImageLastScanAt = performance.now();
    clearSituationImageButtonMarks();

    if (!hideSituationImage) return;

    for (const button of findSituationImageButtons()) {
      button.dataset.crackUiSituationImageButton = '1';
      button.setAttribute('aria-hidden', 'true');
      button.tabIndex = -1;
    }
  }

  function scheduleSituationImageButtonMark({ immediate = false } = {}) {
    if (!hideSituationImage && !document.querySelector('[data-crack-ui-situation-image-button="1"]')) return;

    if (immediate) {
      clearTimeout(situationImageMarkTimer);
      situationImageMarkTimer = null;
      if (situationImageMarkRaf) cancelAnimationFrame(situationImageMarkRaf);
      situationImageMarkRaf = requestAnimationFrame(() => {
        situationImageMarkRaf = 0;
        markSituationImageButtons();
      });
      return;
    }

    if (situationImageMarkTimer || situationImageMarkRaf) return;

    const elapsed = performance.now() - situationImageLastScanAt;
    const delay = Math.max(120, 500 - elapsed);
    situationImageMarkTimer = setTimeout(() => {
      situationImageMarkTimer = null;
      situationImageMarkRaf = requestAnimationFrame(() => {
        situationImageMarkRaf = 0;
        markSituationImageButtons();
      });
    }, delay);
  }

  // =====================================================
  // Feature: empty composer send guard
  // =====================================================

  function normalizeComposerText(text) {
    return String(text || '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\u00a0/g, ' ')
      .trim();
  }

  function getEditableText(editable) {
    if (!editable) return '';
    const tag = String(editable.tagName || '').toLowerCase();
    if (tag === 'textarea' || tag === 'input') return editable.value || '';
    if (editable.isContentEditable || editable.getAttribute('contenteditable') === 'true') {
      return editable.innerText || editable.textContent || '';
    }
    return editable.value || editable.innerText || editable.textContent || '';
  }

  function isComposerEditableCandidate(editable, sendButton = DOM.sendButton()) {
    if (!editable || !editable.isConnected) return false;
    if (editable.closest?.(`#${ID.panel}, #${ID.bottomModelPopup}, #${ID.roomMenuZone}, #${ID.roomMenuHandle}, #${ID.chatListZone}, #${ID.chatListHandle}`)) return false;
    if (editable.closest?.('[data-crack-ui-room-panel="1"], [data-crack-ui-chat-list-panel="1"], [data-crack-ui-room-top-bar="1"]')) return false;

    const tag = String(editable.tagName || '').toLowerCase();
    if (tag === 'input') {
      const type = String(editable.type || '').toLowerCase();
      if (type && !['text', 'search'].includes(type)) return false;
      const placeholder = String(editable.getAttribute('placeholder') || '');
      if (/검색|search/i.test(placeholder)) return false;
    }

    const rect = editable.getBoundingClientRect();
    if (rect.width <= 40 || rect.height <= 8) return false;
    if (rect.top < Math.max(220, window.innerHeight * 0.35)) return false;

    if (sendButton?.isConnected) {
      const sendRect = sendButton.getBoundingClientRect();
      const verticalDistance = Math.abs((rect.top + rect.height / 2) - (sendRect.top + sendRect.height / 2));
      const horizontalDistance = Math.abs((rect.right + rect.left) / 2 - (sendRect.right + sendRect.left) / 2);
      if (verticalDistance > 120 && horizontalDistance > 280) return false;
    }

    return true;
  }

  function isDirectChatComposerEditable(editable) {
    if (!editable?.isConnected || !crackUiIsChatRoute()) return false;
    if (editable.matches?.('.__chat_input_textarea[contenteditable="true"]')) return true;

    const placeholder = normalizeText(
      editable.getAttribute?.('data-placeholder') || editable.getAttribute?.('placeholder') || ''
    );
    return placeholder === '메시지 보내기' &&
      !!editable.matches?.('textarea, [contenteditable="true"], [role="textbox"]');
  }

  function findChatComposerEditable() {
    if (!crackUiIsChatRoute()) {
      cachedComposerEditable = null;
      return null;
    }

    const sendButton = DOM.sendButton();

    if (cachedComposerEditable?.isConnected) {
      if (isDirectChatComposerEditable(cachedComposerEditable)) return cachedComposerEditable;
      if (isComposerEditableCandidate(cachedComposerEditable, sendButton)) return cachedComposerEditable;
    }
    cachedComposerEditable = null;

    const direct = document.querySelector(
      '.__chat_input_textarea[contenteditable="true"], [contenteditable="true"][data-placeholder="메시지 보내기"], textarea[placeholder="메시지 보내기"]'
    );
    if (direct && isComposerEditableCandidate(direct, sendButton)) {
      cachedComposerEditable = direct;
      return direct;
    }

    const roots = [];
    let node = sendButton?.parentElement || null;
    for (let i = 0; node && i < 7; i += 1) {
      roots.push(node);
      node = node.parentElement;
    }
    roots.push(document.body);

    const selector = 'textarea, input, [contenteditable="true"], [role="textbox"]';
    const seen = new Set();
    const candidates = [];

    roots.forEach((root, rootIndex) => {
      if (!root?.querySelectorAll) return;
      root.querySelectorAll(selector).forEach((editable) => {
        if (seen.has(editable)) return;
        seen.add(editable);
        if (!isComposerEditableCandidate(editable, sendButton)) return;

        const rect = editable.getBoundingClientRect();
        const sendRect = sendButton?.getBoundingClientRect?.();
        let score = 0;
        score += Math.max(0, 20 - rootIndex * 2);
        score += rect.width >= 180 ? 12 : 0;
        score += rect.bottom > window.innerHeight * 0.62 ? 10 : 0;
        if (sendRect) {
          const verticalDistance = Math.abs((rect.top + rect.height / 2) - (sendRect.top + sendRect.height / 2));
          score += Math.max(0, 22 - verticalDistance / 4);
          if (rect.left <= sendRect.left && rect.right <= sendRect.right + 80) score += 8;
        }
        if (editable.matches?.('textarea, [contenteditable="true"], [role="textbox"]')) score += 6;
        candidates.push({ editable, score });
      });
    });

    candidates.sort((a, b) => b.score - a.score);
    cachedComposerEditable = candidates[0]?.editable || null;
    return cachedComposerEditable;
  }

  function isComposerEmptyForSend() {
    const editable = DOM.composerEditable();
    if (!editable) return false;
    return normalizeComposerText(getEditableText(editable)).length === 0;
  }

  function shouldBlockEmptyComposerSend() {
    return emptySendGuard && crackUiIsChatRoute() && isComposerEmptyForSend();
  }

  function isEmptySendGuardEventTarget(target) {
    const el = target?.nodeType === 1 ? target : target?.parentElement;
    const button = el?.closest?.('button');
    if (!button) return false;

    const sendButton = DOM.sendButton();
    if (sendButton && button === sendButton) return true;
    return isChatComposerSendButton(button);
  }

  function stopEmptySendEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
  }

  const EMPTY_SEND_ABSENT_ATTRIBUTE = '__crack_ui_absent__';

  function preserveEmptySendButtonState(sendButton) {
    if (!sendButton) return;

    if (!Object.prototype.hasOwnProperty.call(sendButton.dataset, 'crackUiOriginalTitle')) {
      sendButton.dataset.crackUiOriginalTitle = sendButton.hasAttribute('title')
        ? sendButton.getAttribute('title') || ''
        : EMPTY_SEND_ABSENT_ATTRIBUTE;
    }

    if (!Object.prototype.hasOwnProperty.call(sendButton.dataset, 'crackUiOriginalAriaDisabled')) {
      sendButton.dataset.crackUiOriginalAriaDisabled = sendButton.hasAttribute('aria-disabled')
        ? sendButton.getAttribute('aria-disabled') || ''
        : EMPTY_SEND_ABSENT_ATTRIBUTE;
    }
  }

  function restoreEmptySendButtonState(sendButton) {
    if (!sendButton) return;

    const originalTitle = sendButton.dataset.crackUiOriginalTitle;
    if (originalTitle != null) {
      if (originalTitle === EMPTY_SEND_ABSENT_ATTRIBUTE) sendButton.removeAttribute('title');
      else sendButton.setAttribute('title', originalTitle);
      delete sendButton.dataset.crackUiOriginalTitle;
    }

    const originalAriaDisabled = sendButton.dataset.crackUiOriginalAriaDisabled;
    if (originalAriaDisabled != null) {
      if (originalAriaDisabled === EMPTY_SEND_ABSENT_ATTRIBUTE) sendButton.removeAttribute('aria-disabled');
      else sendButton.setAttribute('aria-disabled', originalAriaDisabled);
      delete sendButton.dataset.crackUiOriginalAriaDisabled;
    }
  }

  function guardEmptyComposerSendEvent(e) {
    if (!emptySendGuard || !crackUiIsChatRoute()) return;
    if (!isEmptySendGuardEventTarget(e.target)) return;
    if (!shouldBlockEmptyComposerSend()) return;

    const sendButton = DOM.sendButton();
    if (sendButton) {
      preserveEmptySendButtonState(sendButton);
      sendButton.classList.add('crack-ui-empty-send-blocked');
      sendButton.dataset.crackUiEmptySendBlocked = '1';
      sendButton.title = '입력창이 비어 있어 자동 재생 전송을 막음';
    }

    stopEmptySendEvent(e);
  }

  function getFocusedComposerEditableForEnterEvent(e) {
    const editable = DOM.composerEditable();
    if (!editable?.isConnected) return null;

    const target = e.target?.nodeType === 1 ? e.target : e.target?.parentElement;
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
    const eventFromComposer = target === editable || editable.contains?.(target) || path.includes(editable);
    if (!eventFromComposer) return null;

    const active = document.activeElement;
    const composerFocused = active === editable || editable.contains?.(active);
    return composerFocused ? editable : null;
  }

  function guardEmptyComposerEnterEvent(e) {
    if (!emptySendGuard || !crackUiIsChatRoute()) return;
    if (e.key !== 'Enter' || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.isComposing) return;

    const editable = getFocusedComposerEditableForEnterEvent(e);
    if (!editable) return;
    if (normalizeComposerText(getEditableText(editable)).length !== 0) return;

    stopEmptySendEvent(e);
  }

  function applyEmptySendGuardState() {
    const sendButton = DOM.sendButton();
    if (!sendButton) return;

    const blocked = shouldBlockEmptyComposerSend();
    sendButton.classList.toggle('crack-ui-empty-send-blocked', blocked);
    sendButton.dataset.crackUiEmptySendGuard = emptySendGuard ? '1' : '0';
    sendButton.dataset.crackUiEmptySendBlocked = blocked ? '1' : '0';

    if (blocked) {
      preserveEmptySendButtonState(sendButton);
      sendButton.title = '입력창이 비어 있어 자동 재생 전송을 막음';
      sendButton.setAttribute('aria-disabled', 'true');
    } else {
      restoreEmptySendButtonState(sendButton);
    }
  }

  function scheduleEmptySendGuardUiUpdate() {
    if (emptySendGuardUiRaf) return;
    emptySendGuardUiRaf = requestAnimationFrame(() => {
      emptySendGuardUiRaf = 0;
      applyEmptySendGuardState();
    });
  }


  // =====================================================
  // Feature: bottom model picker
  // =====================================================

  const NOVEL_MODEL_LEGACY_INFO = Object.freeze({
    '슈퍼챗 1.5': {
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/superchat1_5.webp',
      retired: true,
    },
    '프로챗 2.0': {
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/prochat2_0.webp',
      retired: true,
    },
    '일반챗': {
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/normalchat.webp',
      retired: true,
    },
  });

  const DEFAULT_CHAT_MODEL_ID_NAME = Object.freeze({
    '6a2bde2b2d1852a9f41bc3df': '페이블챗 1.0',
    '6a4ddff0c7931348699337b4': '페이블챗 1.0',
    '6a2bda2f992c05d50c2ba7d3': '하이퍼챗 2.0',
    '6a2bdd4cce9304265a32c6b8': '하이퍼챗 2.0',
    '69e0f46a9530f9bfbde683a9': '하이퍼챗 1.5',
    '69485e1b9d2a7cdc6ebf95bf': '하이퍼챗 1.0',
    '6a441a058aa1c16926050ab4': '슈퍼챗 3.0',
    '6994ad1b2510c2af8007cca5': '슈퍼챗 2.5',
    '69485e1b9d2a7cdc6ebf95c0': '슈퍼챗 2.0',
    '69485e1b9d2a7cdc6ebf95c1': '슈퍼챗 1.5',
    '699877c92d18b3f5dec84f49': '프로챗 2.5',
    '69485e1b9d2a7cdc6ebf95c2': '프로챗 2.0',
    '69485e1c9d2a7cdc6ebf95c3': '프로챗 1.0',
    '69485e1c9d2a7cdc6ebf95c4': '파워챗',
    '69485e1c9d2a7cdc6ebf95c5': '일반챗',
  });

  const DEFAULT_CRACKER_MODEL_NAME = Object.freeze({
    fablechat_1_0: '페이블챗 1.0',
    hyperchat_2_0: '하이퍼챗 2.0',
    hyperchat_1_5: '하이퍼챗 1.5',
    hyperchat: '하이퍼챗 1.0',
    superchat_3_0: '슈퍼챗 3.0',
    superchat_2_5: '슈퍼챗 2.5',
    superchat_2_0: '슈퍼챗 2.0',
    superchat_1_5: '슈퍼챗 1.5',
    prochat_2_5: '프로챗 2.5',
    prochat_2_0: '프로챗 2.0',
    prochat_1_0: '프로챗 1.0',
    powerchat: '파워챗',
    normalchat: '일반챗',
  });

  let CHAT_MODEL_ID_NAME = { ...DEFAULT_CHAT_MODEL_ID_NAME };

  const DEFAULT_CHAT_MODEL_INFO = {
    '페이블챗 1.0': {
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/fablechat1_0.webp',
    },
    '하이퍼챗 2.0': {
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/hyperchat2_0.webp',
    },
    '하이퍼챗 1.5': {
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/hyperchat1_5.webp',
    },
    '하이퍼챗 1.0': {
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/hyperchat.webp',
    },
    '슈퍼챗 3.0': {
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/superchat3_0.webp',
    },
    '슈퍼챗 2.5': {
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/superchat2_5.webp',
    },
    '슈퍼챗 2.0': {
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/superchat2_0.webp',
    },
    '프로챗 2.5': {
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/prochat2_5.webp',
    },
    '프로챗 1.0': {
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/prochat1_0.webp',
    },
    '파워챗': {
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/powerchat.webp',
    },
  };

  // Crack 모델 목록 API가 제공하는 현재 선택 가능 모델 순서의 기본값.
  // 실제 원본 모델 메뉴 또는 모델 목록 API가 잡히면 해당 순서로 즉시 갱신한다.
  const DEFAULT_CHAT_MODEL_ORDER = Object.freeze([
    '페이블챗 1.0',
    '하이퍼챗 2.0',
    '하이퍼챗 1.5',
    '하이퍼챗 1.0',
    '슈퍼챗 3.0',
    '슈퍼챗 2.5',
    '슈퍼챗 2.0',
    '프로챗 2.5',
    '프로챗 1.0',
    '파워챗',
  ]);

  function cloneDefaultChatModelInfo() {
    return Object.fromEntries(
      Object.entries(DEFAULT_CHAT_MODEL_INFO).map(([name, info]) => [name, { ...info }])
    );
  }

  function getModelIconFileFromUrl(value) {
    let text = String(value || '').trim();
    if (!text) return '';

    // Next 이미지 최적화 URL처럼 원본 model-icon 경로가 쿼리 안에 들어간 경우도 복원한다.
    for (let i = 0; i < 2; i += 1) {
      try {
        const decoded = decodeURIComponent(text);
        if (decoded === text) break;
        text = decoded;
      } catch {
        break;
      }
    }

    const nested = text.match(/model-icon\/([^/?#"'<>\s]+\.(?:webp|png|svg|avif))/i);
    if (nested?.[1]) return nested[1];

    return text.split(/[?#]/)[0].split('/').pop() || '';
  }

  function buildChatModelIconMap(infoMap) {
    const map = {};
    for (const [name, info] of Object.entries(infoMap || {})) {
      const file = getModelIconFileFromUrl(info?.image);
      if (file) map[file] = name;
    }
    return map;
  }

  let chatModelRegistryCleanupNeeded = false;

  function isNovelOnlyRetiredModelRegistryEntry(name) {
    const normalized = normalizeText(name);
    if (!normalized) return false;

    // 소설형 메시지 수동 선택 메뉴를 원본 모델 메뉴로 오인했던 구버전에서
    // `표시할 모델` 저장소로 들어간 종료 모델/표시 문구를 제거한다.
    if (/\s*·\s*서비스\s*종료\s*$/.test(normalized)) return true;
    return Object.prototype.hasOwnProperty.call(NOVEL_MODEL_LEGACY_INFO, normalized);
  }

  let chatModelRegistryLoadedFromStorage = false;

  function loadChatModelRegistry() {
    const raw = readStorage(LS.bottomModelRegistry);
    if (!raw) return cloneDefaultChatModelInfo();

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return cloneDefaultChatModelInfo();

      const next = {};
      for (const entry of parsed) {
        const name = normalizeText(entry?.name);
        const image = String(entry?.image || '').trim();
        if (!name || !image.includes('model-icon')) continue;
        if (isNovelOnlyRetiredModelRegistryEntry(name)) {
          chatModelRegistryCleanupNeeded = true;
          continue;
        }
        if (!Object.prototype.hasOwnProperty.call(next, name)) next[name] = { image };
      }

      if (Object.keys(next).length) {
        chatModelRegistryLoadedFromStorage = true;
        return next;
      }
      return cloneDefaultChatModelInfo();
    } catch {
      return cloneDefaultChatModelInfo();
    }
  }

  let CHAT_MODEL_INFO = loadChatModelRegistry();
  let CHAT_MODEL_ORDER = chatModelRegistryLoadedFromStorage
    ? Object.keys(CHAT_MODEL_INFO)
    : [
      ...DEFAULT_CHAT_MODEL_ORDER.filter((name) => Object.prototype.hasOwnProperty.call(CHAT_MODEL_INFO, name)),
      ...Object.keys(CHAT_MODEL_INFO).filter((name) => !DEFAULT_CHAT_MODEL_ORDER.includes(name)),
    ];
  let CHAT_MODEL_ICON_MAP = buildChatModelIconMap(CHAT_MODEL_INFO);

  function saveChatModelRegistry() {
    writeJsonStorage(
      LS.bottomModelRegistry,
      CHAT_MODEL_ORDER.map((name) => ({
        name,
        image: String(CHAT_MODEL_INFO[name]?.image || ''),
      }))
    );
  }

  if (chatModelRegistryCleanupNeeded) saveChatModelRegistry();

  function escapeModelHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch] || ch));
  }

  function loadVisibleChatModelNames() {
    const raw = readStorage(LS.bottomModelVisibleModels);
    if (!raw) return [...CHAT_MODEL_ORDER];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [...CHAT_MODEL_ORDER];

      const next = CHAT_MODEL_ORDER.filter((name) => parsed.includes(name));
      return next.length ? next : [...CHAT_MODEL_ORDER];
    } catch {
      return [...CHAT_MODEL_ORDER];
    }
  }

  function saveVisibleChatModelNames() {
    writeJsonStorage(LS.bottomModelVisibleModels, visibleChatModelNames);
  }

  let visibleChatModelNames = loadVisibleChatModelNames();
  if (chatModelRegistryCleanupNeeded) saveVisibleChatModelNames();

  function loadVisibleModelListOpen() {
    return readStorage(LS.bottomModelVisibleModelsOpen) === '1';
  }

  let visibleModelListOpen = loadVisibleModelListOpen();

  function saveVisibleModelListOpen() {
    writeStorage(LS.bottomModelVisibleModelsOpen, visibleModelListOpen ? '1' : '0');
  }

  function syncVisibleModelListOpenUi() {
    const disclosure = document.getElementById(ID.visibleModelDisclosure);
    const panel = document.getElementById(ID.visibleModelPanel);

    if (disclosure) {
      disclosure.dataset.open = visibleModelListOpen ? '1' : '0';
      disclosure.setAttribute('aria-expanded', visibleModelListOpen ? 'true' : 'false');
    }

    if (panel) {
      panel.dataset.open = visibleModelListOpen ? '1' : '0';
      panel.hidden = !visibleModelListOpen;
    }
  }

  function toggleVisibleModelListOpen() {
    visibleModelListOpen = !visibleModelListOpen;
    saveVisibleModelListOpen();
    syncVisibleModelListOpenUi();
  }

  function getVisibleChatModelNames() {
    const next = CHAT_MODEL_ORDER.filter((name) => visibleChatModelNames.includes(name));
    if (next.length) return next;

    visibleChatModelNames = [...CHAT_MODEL_ORDER];
    saveVisibleChatModelNames();
    return [...CHAT_MODEL_ORDER];
  }


  function renderVisibleModelChoicesHtml() {
    const visible = new Set(getVisibleChatModelNames());
    return CHAT_MODEL_ORDER.map((name) => {
      const selected = visible.has(name);
      const image = CHAT_MODEL_INFO[name]?.image || '';
      const safeName = escapeModelHtml(name);
      const safeImage = escapeModelHtml(image);
      return `
                <button
                  type="button"
                  role="checkbox"
                  class="crack-ui-choice-row crack-ui-visible-model-row"
                  data-crack-ui-visible-model="${safeName}"
                  data-selected="${selected ? '1' : '0'}"
                  aria-checked="${selected ? 'true' : 'false'}"
                >
                  <span class="crack-ui-choice-mark" aria-hidden="true"></span>
                  <img class="crack-ui-visible-model-icon" src="${safeImage}" alt="">
                  <span class="crack-ui-choice-name">${safeName}</span>
                </button>
      `;
    }).join('');
  }

  function updateVisibleModelChoicesUi() {
    const visible = new Set(getVisibleChatModelNames());

    document.querySelectorAll('[data-crack-ui-visible-model]').forEach((button) => {
      const name = button.dataset.crackUiVisibleModel;
      const selected = visible.has(name);
      button.dataset.selected = selected ? '1' : '0';
      button.setAttribute('aria-checked', selected ? 'true' : 'false');
    });

  }

  function refreshVisibleModelChoicesPanel() {
    const panel = document.getElementById(ID.panel);
    const list = panel?.querySelector?.('.crack-ui-visible-model-list');
    if (!list) return;

    const signature = CHAT_MODEL_ORDER
      .map((name) => `${name}|${String(CHAT_MODEL_INFO[name]?.image || '')}`)
      .join('\n');

    if (list.dataset.crackUiModelRegistrySignature !== signature) {
      list.innerHTML = renderVisibleModelChoicesHtml();
      list.dataset.crackUiModelRegistrySignature = signature;
      bindChoiceButtons(panel);
    }

    updateVisibleModelChoicesUi();
  }

  function toggleVisibleChatModel(name) {
    if (!CHAT_MODEL_ORDER.includes(name)) return;

    const visible = getVisibleChatModelNames();
    const isOn = visible.includes(name);

    if (isOn && visible.length <= 1) {
      updateVisibleModelChoicesUi();
      return;
    }

    visibleChatModelNames = isOn
      ? CHAT_MODEL_ORDER.filter((model) => model !== name && visible.includes(model))
      : CHAT_MODEL_ORDER.filter((model) => model === name || visible.includes(model));

    saveVisibleChatModelNames();
    updateVisibleModelChoicesUi();
    syncOfficialModelVisibility();

    if (isBottomModelPopupOpen()) {
      renderBottomModelPopup(document.getElementById(ID.bottomModelButton), getStaticModelList());
    }
  }

  let syncingOfficialModelInfo = false;
  let lastOfficialModelVisibilityHiddenCount = 0;
  let lastOfficialModelRegistryAdded = [];
  let lastOfficialModelRegistryRemoved = [];
  let lastOfficialModelRegistryCount = CHAT_MODEL_ORDER.length;
  let lastOfficialModelRegistrySignature = '';
  let pendingOfficialModelRegistryRemovalSignature = '';
  let officialModelRegistryRemovalConfirmTimer = null;
  let officialModelRegistryScanTimers = [];

  const MODEL_REGISTRY_REMOVAL_CONFIRM_MS = 500;

  function modelSleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function isKnownChatModelName(value) {
    return Object.prototype.hasOwnProperty.call(CHAT_MODEL_INFO, normalizeText(value));
  }

  function isVisibleElement(el) {
    if (!el || !el.isConnected) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function getModelIconSourceFromNode(node) {
    if (!node) return '';
    const icon = node.matches?.('img[src*="model-icon"], img[srcset*="model-icon"]')
      ? node
      : node.querySelector?.('img[src*="model-icon"], img[srcset*="model-icon"]');
    if (!icon) return '';

    const src = String(icon.currentSrc || icon.getAttribute?.('src') || icon.src || '').trim();
    if (src) return src;

    const srcset = String(icon.getAttribute?.('srcset') || '').trim();
    return srcset.split(',')[0]?.trim().split(/\s+/)[0] || '';
  }

  function getRawModelNameFromNode(node) {
    if (!node) return '';

    const icon = node.matches?.('img[src*="model-icon"], img[srcset*="model-icon"], img[alt]')
      ? node
      : node.querySelector?.('img[src*="model-icon"], img[srcset*="model-icon"], img[alt]');

    const imgAlt = normalizeText(icon?.getAttribute?.('alt'));
    if (imgAlt) return imgAlt;

    const src = getModelIconSourceFromNode(node);
    const fromSrc = CHAT_MODEL_ICON_MAP[getModelIconFileFromUrl(src)];
    if (fromSrc) return fromSrc;

    const row = icon?.closest?.('.flex.items-center, [class*="items-center"]') || node;
    const spanText = [...(row.querySelectorAll?.('span') || [])]
      .map((span) => normalizeText(span.textContent))
      .find((text) => text && text.length <= 40 && !/변경\s*예정|권장|\d+\s*개/.test(text));
    if (spanText) return spanText;

    const text = normalizeText(node.textContent);
    return CHAT_MODEL_ORDER.find((model) => text.includes(model)) || '';
  }

  function getModelNameFromNode(node) {
    return getRawModelNameFromNode(node);
  }

  function getDisplayModelInfo(modelName) {
    const name = normalizeText(modelName);
    if (isKnownChatModelName(name)) {
      return {
        name,
        ...CHAT_MODEL_INFO[name],
      };
    }

    return { name: name || '모델', image: '' };
  }

  function getCurrentModelName() {
    const officialButton = DOM.modelButton();
    const buttonName = getModelNameFromNode(officialButton);
    if (buttonName) return buttonName;

    const icons = [...document.querySelectorAll('img[src*="model-icon"], img[srcset*="model-icon"]')];
    for (const icon of icons) {
      if (icon.closest(`#${ID.bottomModelButton}, #${ID.bottomModelPopup}, #${ID.panel}, [role="menuitem"], [role="dialog"]`)) continue;

      const alt = normalizeText(icon.getAttribute('alt'));
      if (alt) return alt;

      const src = String(icon.getAttribute('src') || icon.src || '');
      const fromSrc = CHAT_MODEL_ICON_MAP[getModelIconFileFromUrl(src)];
      if (fromSrc) return fromSrc;
    }

    return '';
  }

  function getCurrentModelInfo() {
    const officialButton = DOM.modelButton();
    const name = getCurrentModelName();
    if (isKnownChatModelName(name)) return getDisplayModelInfo(name);
    return {
      name: name || '모델',
      image: getModelIconSourceFromNode(officialButton),
    };
  }

  function isOriginalModelButtonCandidate(button, panel = document.getElementById(ID.panel), popup = document.getElementById(ID.bottomModelPopup)) {
    if (!button || button.id === ID.bottomModelButton || !button.isConnected) return false;
    if (panel?.contains(button) || popup?.contains(button)) return false;
    const icon = button.querySelector('img[src*="model-icon"], img[srcset*="model-icon"]');
    if (!icon) return false;

    return !!getRawModelNameFromNode(button) || !!getModelIconSourceFromNode(button);
  }

  function findOriginalModelButton() {
    const popup = document.getElementById(ID.bottomModelPopup);
    const panel = document.getElementById(ID.panel);

    if (isOriginalModelButtonCandidate(cachedOriginalModelButton, panel, popup)) {
      return cachedOriginalModelButton;
    }

    const found = [...document.querySelectorAll('button[aria-haspopup="menu"], button[id^="radix-"]')]
      .find((button) => isOriginalModelButtonCandidate(button, panel, popup)) || null;

    cachedOriginalModelButton = found;
    return found;
  }

  function getOfficialModelMenu() {
    const popup = document.getElementById(ID.bottomModelPopup);
    return [...document.querySelectorAll('[role="menu"]')].find((menu) => {
      if (popup?.contains(menu) || menu.closest?.(`#${ID.panel}`)) return false;
      if (
        menu.classList?.contains('crack-ui-novel-model-menu') ||
        menu.dataset?.crackUiMenuOwner === 'novel-model-indicator'
      ) {
        return false;
      }
      const modelItems = [...menu.querySelectorAll('[role="menuitem"]')]
        .filter((item) => item.querySelector('img[src*="model-icon"], img[srcset*="model-icon"]'));
      return modelItems.length >= 2;
    }) || null;
  }

  function scanOfficialModelMenuEntries(menu = DOM.modelMenu()) {
    if (!menu) return [];
    if (
      menu.classList?.contains('crack-ui-novel-model-menu') ||
      menu.dataset?.crackUiMenuOwner === 'novel-model-indicator'
    ) {
      return [];
    }

    const modelItems = [...menu.querySelectorAll('[role="menuitem"]')]
      .filter((item) => item.querySelector('img[src*="model-icon"], img[srcset*="model-icon"]'));
    if (modelItems.length < 2) return [];

    const entries = [];
    const seenNames = new Set();

    for (const item of modelItems) {
      const image = getModelIconSourceFromNode(item);
      const name = normalizeText(getRawModelNameFromNode(item));
      const iconFile = getModelIconFileFromUrl(image);
      if (!name || !image || !iconFile || seenNames.has(name)) continue;
      seenNames.add(name);
      entries.push({ name, image });
    }

    // 메뉴가 덜 렌더된 순간의 부분 스캔으로 기존 모델을 대량 삭제하지 않게 한다.
    if (entries.length !== modelItems.length) return [];
    return entries;
  }

  function syncVisibleChatModelsToRegistry(previousOrder, nextOrder) {
    const raw = readStorage(LS.bottomModelVisibleModels);
    if (!raw) {
      visibleChatModelNames = [...nextOrder];
      saveVisibleChatModelNames();
      return;
    }

    let storedVisible = [];
    try {
      const parsed = JSON.parse(raw);
      storedVisible = Array.isArray(parsed) ? parsed.map(normalizeText).filter(Boolean) : [];
    } catch {
      storedVisible = [];
    }

    const previousKnown = new Set(previousOrder);
    const visibleSet = new Set(storedVisible);
    let nextVisible = nextOrder.filter((name) => visibleSet.has(name) || !previousKnown.has(name));

    // 모든 기존 선택 모델이 사이트에서 제거된 경우에도 새 모델은 최소 1개 이상 보이게 한다.
    if (!nextVisible.length) nextVisible = [...nextOrder];
    visibleChatModelNames = nextVisible;
    saveVisibleChatModelNames();
  }


  function getActiveChatModelEntriesFromApiList(models) {
    if (!Array.isArray(models)) return [];

    const entries = [];
    const seenNames = new Set();
    let storyModelLikeCount = 0;

    for (const item of models) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
      if (item.serviceType && item.serviceType !== 'story') continue;

      const image = normalizeNovelModelIconUrl(
        item.assets?.icon?.default || item.icon?.default || item.modelIcon || item.iconUrl
      );
      const name = normalizeText(item.name || item.displayName || item.modelName);
      const id = String(item._id || item.id || '').trim();
      if (!name || !image || !/^[a-f0-9]{24}$/i.test(id)) continue;

      storyModelLikeCount += 1;
      if (item.deletedAt || item.isBlock === true || seenNames.has(name)) continue;
      seenNames.add(name);
      entries.push({ name, image });
    }

    // 메시지 배열을 모델 목록으로 오인하지 않고, 충분히 완성된 모델 목록 응답만 사용한다.
    if (storyModelLikeCount < 4 || entries.length < 2) return [];
    return entries;
  }

  function syncChatModelRegistryFromApiModelList(models) {
    const entries = getActiveChatModelEntriesFromApiList(models);
    if (!entries.length) return false;

    const previousOrder = [...CHAT_MODEL_ORDER];
    const previousInfo = CHAT_MODEL_INFO;
    const previousNames = new Set(previousOrder);
    const nextOrder = entries.map((entry) => entry.name);
    const nextNames = new Set(nextOrder);
    const nextInfo = Object.fromEntries(entries.map((entry) => [entry.name, { image: entry.image }]));
    const signature = entries.map((entry) => `${entry.name}|${entry.image}`).join('\n');
    const registryChanged =
      previousOrder.length !== nextOrder.length ||
      previousOrder.some((name, index) => name !== nextOrder[index]) ||
      nextOrder.some((name) => String(previousInfo[name]?.image || '') !== String(nextInfo[name]?.image || ''));

    lastOfficialModelRegistrySignature = signature;
    lastOfficialModelRegistryAdded = nextOrder.filter((name) => !previousNames.has(name));
    lastOfficialModelRegistryRemoved = previousOrder.filter((name) => !nextNames.has(name));
    lastOfficialModelRegistryCount = nextOrder.length;
    clearPendingOfficialModelRegistryRemoval();

    if (!registryChanged) return false;

    CHAT_MODEL_INFO = nextInfo;
    CHAT_MODEL_ORDER = nextOrder;
    CHAT_MODEL_ICON_MAP = buildChatModelIconMap(CHAT_MODEL_INFO);
    saveChatModelRegistry();
    syncVisibleChatModelsToRegistry(previousOrder, nextOrder);
    refreshVisibleModelChoicesPanel();
    syncOfficialModelVisibilityStyle(getHiddenChatModelNames());

    if (isBottomModelPopupOpen()) {
      renderBottomModelPopup(document.getElementById(ID.bottomModelButton), getStaticModelList());
    }

    return true;
  }

  function clearPendingOfficialModelRegistryRemoval() {
    pendingOfficialModelRegistryRemovalSignature = '';
    if (officialModelRegistryRemovalConfirmTimer) {
      clearTimeout(officialModelRegistryRemovalConfirmTimer);
      officialModelRegistryRemovalConfirmTimer = null;
    }
  }

  function scheduleOfficialModelRegistryRemovalConfirmation(signature) {
    if (
      pendingOfficialModelRegistryRemovalSignature === signature &&
      officialModelRegistryRemovalConfirmTimer
    ) {
      return;
    }

    clearPendingOfficialModelRegistryRemoval();
    pendingOfficialModelRegistryRemovalSignature = signature;
    officialModelRegistryRemovalConfirmTimer = setTimeout(() => {
      officialModelRegistryRemovalConfirmTimer = null;
      if (pendingOfficialModelRegistryRemovalSignature !== signature) return;

      const menu = DOM.modelMenu();
      if (menu) syncChatModelRegistryFromOfficialMenu(menu, { confirmRemovalSignature: signature });
    }, MODEL_REGISTRY_REMOVAL_CONFIRM_MS);
  }

  function syncChatModelRegistryFromOfficialMenu(menu = DOM.modelMenu(), options = {}) {
    const entries = scanOfficialModelMenuEntries(menu);
    if (!entries.length) return false;

    const signature = entries.map((entry) => `${entry.name}|${entry.image}`).join('\n');
    if (signature === lastOfficialModelRegistrySignature) {
      clearPendingOfficialModelRegistryRemoval();
      return false;
    }

    const previousOrder = [...CHAT_MODEL_ORDER];
    const previousInfo = CHAT_MODEL_INFO;
    const previousNames = new Set(previousOrder);
    const nextOrder = entries.map((entry) => entry.name);
    const nextNames = new Set(nextOrder);
    const nextInfo = Object.fromEntries(entries.map((entry) => [entry.name, { image: entry.image }]));
    const added = nextOrder.filter((name) => !previousNames.has(name));
    const removed = previousOrder.filter((name) => !nextNames.has(name));

    // 메뉴가 열리는 중 잠깐 일부 항목만 렌더되는 순간을 실제 삭제로 오인하면,
    // 사용자가 숨겨둔 모델이 다시 켜질 수 있다. 삭제/이름변경은 같은 결과를 한 번 더 확인한다.
    if (removed.length && options.confirmRemovalSignature !== signature) {
      scheduleOfficialModelRegistryRemovalConfirmation(signature);
      return false;
    }

    clearPendingOfficialModelRegistryRemoval();

    const registryChanged =
      previousOrder.length !== nextOrder.length ||
      previousOrder.some((name, index) => name !== nextOrder[index]) ||
      nextOrder.some((name) => String(previousInfo[name]?.image || '') !== String(nextInfo[name]?.image || ''));

    lastOfficialModelRegistrySignature = signature;
    lastOfficialModelRegistryAdded = added;
    lastOfficialModelRegistryRemoved = removed;
    lastOfficialModelRegistryCount = nextOrder.length;

    if (!registryChanged) return false;

    CHAT_MODEL_INFO = nextInfo;
    CHAT_MODEL_ORDER = nextOrder;
    CHAT_MODEL_ICON_MAP = buildChatModelIconMap(CHAT_MODEL_INFO);
    saveChatModelRegistry();
    syncVisibleChatModelsToRegistry(previousOrder, nextOrder);
    refreshVisibleModelChoicesPanel();

    syncOfficialModelVisibilityStyle(getHiddenChatModelNames());
    applyOfficialModelMenuVisibility(menu);

    if (isBottomModelPopupOpen()) {
      renderBottomModelPopup(document.getElementById(ID.bottomModelButton), getStaticModelList());
    }

    return true;
  }

  function clearOfficialModelRegistryScanTimers() {
    officialModelRegistryScanTimers.forEach((timer) => clearTimeout(timer));
    officialModelRegistryScanTimers = [];
  }

  function scheduleOfficialModelRegistryScanBurst() {
    clearOfficialModelRegistryScanTimers();
    officialModelRegistryScanTimers = [80, 220, 520].map((delay) => setTimeout(() => {
      const menu = DOM.modelMenu();
      if (menu) syncChatModelRegistryFromOfficialMenu(menu);
    }, delay));
  }

  function bindOfficialModelRegistryScan(button = DOM.modelButton()) {
    if (!button || button.dataset.crackUiModelRegistryBound === '1') return;
    button.dataset.crackUiModelRegistryBound = '1';
    button.addEventListener('click', scheduleOfficialModelRegistryScanBurst, { passive: true });
  }

  function getHiddenChatModelNames() {
    const visible = new Set(getVisibleChatModelNames());
    return CHAT_MODEL_ORDER.filter((name) => !visible.has(name));
  }

  function getChatModelIconFile(name) {
    return getModelIconFileFromUrl(CHAT_MODEL_INFO[name]?.image);
  }

  function syncOfficialModelVisibilityStyle(hiddenNames = getHiddenChatModelNames()) {
    let style = document.getElementById(ID.officialModelVisibilityStyle);

    if (!hiddenNames.length) {
      style?.remove();
      return;
    }

    const selectors = hiddenNames.flatMap((name) => {
      const file = getChatModelIconFile(name);
      const escapedName = String(name).replaceAll('\\', '\\\\').replaceAll('\"', '\\"');
      const next = [
        `[data-radix-popper-content-wrapper] [role="menu"] [role="menuitem"]:has(img[alt="${escapedName}"])`,
      ];

      if (file) {
        const escapedFile = String(file).replaceAll('\\', '\\\\').replaceAll('\"', '\\"');
        next.push(`[data-radix-popper-content-wrapper] [role="menu"] [role="menuitem"]:has(img[src*="${escapedFile}"])`);
      }

      return next;
    });

    if (!style) {
      style = document.createElement('style');
      style.id = ID.officialModelVisibilityStyle;
      (document.head || document.documentElement).appendChild(style);
    }

    const nextCss = `${selectors.join(',\n')} {\n  display: none !important;\n}`;
    if (style.textContent !== nextCss) style.textContent = nextCss;
  }

  function applyOfficialModelMenuVisibility(menu = DOM.modelMenu()) {
    if (!menu) {
      lastOfficialModelVisibilityHiddenCount = 0;
      return 0;
    }

    const visible = new Set(getVisibleChatModelNames());
    let hiddenCount = 0;

    menu.querySelectorAll('[role="menuitem"]').forEach((item) => {
      const name = getModelNameFromNode(item);
      if (!isKnownChatModelName(name)) {
        delete item.dataset.crackUiOfficialModelHidden;
        return;
      }

      const shouldHide = !visible.has(name);
      item.dataset.crackUiOfficialModelHidden = shouldHide ? '1' : '0';
      if (shouldHide) hiddenCount += 1;
    });

    lastOfficialModelVisibilityHiddenCount = hiddenCount;
    return hiddenCount;
  }

  function syncOfficialModelVisibility() {
    const hiddenNames = getHiddenChatModelNames();
    syncOfficialModelVisibilityStyle(hiddenNames);
    if (!hiddenNames.length) {
      lastOfficialModelVisibilityHiddenCount = 0;
      return;
    }
    applyOfficialModelMenuVisibility();
  }

  function createModelMenuAutoHider() {
    const hiddenWrappers = new Map();

    const hideWrapper = (wrapper) => {
      if (!(wrapper instanceof HTMLElement)) return;
      if (document.getElementById(ID.bottomModelPopup)?.contains(wrapper)) return;

      const menu = wrapper.querySelector('[role="menu"]');
      if (!menu) return;

      const hasModelText = CHAT_MODEL_ORDER.some((model) => normalizeText(wrapper.textContent).includes(model));
      if (!hasModelText) return;

      if (!hiddenWrappers.has(wrapper)) {
        hiddenWrappers.set(wrapper, {
          visibility: wrapper.style.visibility,
          opacity: wrapper.style.opacity,
          pointerEvents: wrapper.style.pointerEvents,
        });
      }

      wrapper.style.visibility = 'hidden';
      wrapper.style.opacity = '0';
      wrapper.style.pointerEvents = 'none';
    };

    document.querySelectorAll('[data-radix-popper-content-wrapper]').forEach(hideWrapper);

    const menuObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches?.('[data-radix-popper-content-wrapper]')) hideWrapper(node);
          node.querySelectorAll?.('[data-radix-popper-content-wrapper]').forEach(hideWrapper);
        }
      }
    });

    if (document.body) {
      menuObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      menuObserver.disconnect();
      for (const [wrapper, oldStyle] of hiddenWrappers.entries()) {
        wrapper.style.visibility = oldStyle.visibility;
        wrapper.style.opacity = oldStyle.opacity;
        wrapper.style.pointerEvents = oldStyle.pointerEvents;
      }
    };
  }

  function fireModelClickSequence(el) {
    if (!el) return false;

    try {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    } catch {
    }

    try {
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    } catch {
    }

    try {
      el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    } catch {
    }

    try {
      if (typeof el.click === 'function') {
        el.click();
      } else {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
      return true;
    } catch {
      try {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return true;
      } catch {
        return false;
      }
    }
  }

  async function waitForOfficialModelMenu(timeout = 900) {
    const start = performance.now();
    while (performance.now() - start < timeout) {
      const menu = DOM.modelMenu();
      if (menu) return menu;
      await modelSleep(35);
    }
    return null;
  }

  function closeOfficialModelMenuIfOpen() {
    const trigger = DOM.modelButton();
    const expanded = trigger?.getAttribute('aria-expanded') === 'true' || trigger?.dataset?.state === 'open';
    if (!expanded) return;

    try {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true,
      }));
    } catch {
    }
  }


  function takeHeaderRevealSnapshotForModelPicker() {
    return {
      reveal: document.documentElement.classList.contains(CLS.reveal),
      pointerOnZone,
      pointerOnHeader,
      mobileReveal,
    };
  }

  function blurInvisibleModelPickerFocus() {
    const officialBtn = DOM.modelButton();
    const active = document.activeElement;

    try {
      officialBtn?.blur?.();
    } catch {
    }

    if (!(active instanceof HTMLElement)) return;

    const shouldBlur =
      active === officialBtn ||
      officialBtn?.contains?.(active) ||
      !!active.closest?.('[data-radix-popper-content-wrapper], [role="menu"], [role="menuitem"]');

    if (shouldBlur) {
      try {
        active.blur();
      } catch {
      }
    }
  }

  function restoreHeaderRevealAfterInvisibleModelSelect(snapshot) {
    if (!snapshot || snapshot.reveal) return;

    const restore = () => {
      blurInvisibleModelPickerFocus();
      pointerOnZone = false;
      pointerOnHeader = false;

      if (!snapshot.mobileReveal) {
        mobileReveal = false;
        clearMobileHideTimer();
      }

      updateReveal();

      if (!panelOpen) {
        document.documentElement.classList.remove(CLS.reveal);
      }
    };

    restore();
    setTimeout(restore, 60);
    setTimeout(restore, 260);
  }

  async function selectModelInvisibly(targetModelName) {
    const targetName = normalizeText(targetModelName);
    if (!isKnownChatModelName(targetName)) return false;

    const headerRevealSnapshot = takeHeaderRevealSnapshotForModelPicker();
    const syncWaitTimeout = 6000;

    for (let waited = 0; waited < syncWaitTimeout; waited += 30) {
      if (!syncingOfficialModelInfo) break;
      await modelSleep(30);
    }

    if (syncingOfficialModelInfo) {
      const error = new Error(`official model sync wait timed out after ${syncWaitTimeout}ms`);
      reportCrackUiError('model-select-wait', error);
      restoreHeaderRevealAfterInvisibleModelSelect(headerRevealSnapshot);
      return false;
    }

    const officialBtn = DOM.modelButton();
    if (!officialBtn) {
      console.warn('[Crack UI Plus] 공식 모델 버튼을 못 찾음');
      return false;
    }

    const clickTargetFromOfficialMenu = async (useHider) => {
      const stopHidingModelMenu = useHider ? createModelMenuAutoHider() : () => {};

      try {
        if (officialBtn.getAttribute('aria-expanded') !== 'true' && officialBtn.dataset.state !== 'open') {
          fireModelClickSequence(officialBtn);
        }

        await modelSleep(90);

        const modelMenu = await waitForOfficialModelMenu(900);
        if (!modelMenu) {
          console.warn('[Crack UI Plus] 공식 모델 메뉴를 못 찾음');
          return false;
        }

        const targetItem = [...modelMenu.querySelectorAll('div[role="menuitem"], [role="menuitem"]')]
          .find((item) => {
            const itemName = getModelNameFromNode(item);
            return itemName === targetName || normalizeText(item.textContent).includes(targetName);
          });

        if (!targetItem) {
          console.warn(`[Crack UI Plus] 공식 메뉴에서 ${targetName} 항목을 못 찾음`);
          return false;
        }

        try {
          targetItem.focus?.();
        } catch {
        }

        fireModelClickSequence(targetItem);
        await modelSleep(260);

        return getCurrentModelName() === targetName;
      } finally {
        setTimeout(stopHidingModelMenu, 120);
      }
    };

    syncingOfficialModelInfo = true;

    try {
      let ok = await clickTargetFromOfficialMenu(true);
      if (ok) return true;

      closeOfficialModelMenuIfOpen();
      await modelSleep(120);

      ok = await clickTargetFromOfficialMenu(false);
      return ok || getCurrentModelName() === targetName;
    } finally {
      setTimeout(() => {
        closeOfficialModelMenuIfOpen();
        syncingOfficialModelInfo = false;
        restoreHeaderRevealAfterInvisibleModelSelect(headerRevealSnapshot);
      }, 180);
    }
  }

  function getStaticModelList() {
    const current = getCurrentModelName();
    return getVisibleChatModelNames().map((name) => {
      const info = getDisplayModelInfo(name);
      return {
        name,
        icon: info.image,
        selected: current === name,
      };
    });
  }

  function isChatComposerSendButton(button) {
    if (!button || button.id === ID.bottomModelButton || !isVisibleElement(button)) return false;

    const rect = button.getBoundingClientRect();
    if (rect.top < Math.max(240, window.innerHeight * 0.45)) return false;

    const widthOk = rect.width >= 22 && rect.width <= 44;
    const heightOk = rect.height >= 22 && rect.height <= 44;
    if (!widthOk || !heightOk) return false;

    if (button.closest('[aria-label*="보관함"], [data-testid="virtuoso-scroller"]')) return false;

    const hasSendPath = !!button.querySelector(
      'svg path[d^="M18.77 11.13"], svg path[d^="M18.77"], svg path[d*="10.27-5.93"], svg path[d*="11.86a1 1"], svg path[d^="M18.38 12.88"], svg path[d*="15.38"], svg path[d*="6.62 6.63"]'
    );
    if (!hasSendPath) return false;

    const cls = String(button.className || '');
    const style = button.getAttribute('style') || '';
    const looksPrimary =
      cls.includes('bg-primary') ||
      cls.includes('text-primary-foreground') ||
      /rgb\(255,\s*68,\s*50\)/i.test(style) ||
      /#FE4532/i.test(style);

    return looksPrimary;
  }

  function findBottomSendButton() {
    if (cachedBottomSendButton?.isConnected && isChatComposerSendButton(cachedBottomSendButton)) {
      return cachedBottomSendButton;
    }

    const candidates = [...document.querySelectorAll('button')]
      .filter(isChatComposerSendButton)
      .sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return (br.top - ar.top) || (br.left - ar.left);
      });

    cachedBottomSendButton = candidates[0] || null;
    return cachedBottomSendButton;
  }

  function createBottomModelButton() {
    const btn = document.createElement('button');
    btn.id = ID.bottomModelButton;
    btn.type = 'button';
    btn.title = '채팅 모델 변경';
    btn.setAttribute('aria-label', '채팅 모델 변경');
    btn.innerHTML = `
      <span class="crack-ui-bottom-model-icon-wrap" aria-hidden="true">✦</span>
      <span class="crack-ui-bottom-model-name">모델</span>
      <span class="crack-ui-bottom-model-caret" aria-hidden="true">▾</span>
    `;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      toggleBottomModelPopup(btn);
    }, true);

    return btn;
  }

  function syncBottomModelButton() {
    const btn = document.getElementById(ID.bottomModelButton);
    if (!btn) return;

    const info = getCurrentModelInfo();
    const iconWrap = btn.querySelector('.crack-ui-bottom-model-icon-wrap');
    const nameEl = btn.querySelector('.crack-ui-bottom-model-name');

    if (iconWrap) {
      const currentImg = iconWrap.querySelector('img');
      if (info.image) {
        const iconAlreadyMatches =
          currentImg?.getAttribute('src') === info.image &&
          iconWrap.children.length === 1;

        if (!iconAlreadyMatches) {
          const img = document.createElement('img');
          img.src = info.image;
          img.alt = '';
          iconWrap.replaceChildren(img);
        }
      } else if (iconWrap.textContent !== '🔥' || iconWrap.children.length > 0) {
        iconWrap.textContent = '🔥';
      }
    }

    if (nameEl && nameEl.textContent !== info.name) nameEl.textContent = info.name;

    const label = `채팅 모델 변경: ${info.name}`;
    if (btn.title !== label) btn.title = label;
    if (btn.getAttribute('aria-label') !== label) btn.setAttribute('aria-label', label);
  }

  function isNodeBeforeInSameParent(node, target) {
    if (!node || !target || node.parentElement !== target.parentElement) return false;
    let cur = node;
    while ((cur = cur.nextElementSibling)) {
      if (cur === target) return true;
    }
    return false;
  }

  function findBottomModelCooperativeGroup(sendButton) {
    const parent = sendButton?.parentElement;
    if (!parent) return null;

    // Crack Muse Writer / 자동메모장 계열은 이 그룹을 전송 버튼 바로 앞으로
    // 계속 되돌리므로, 우리 모델 버튼은 형제 자리를 다투지 않고 이 그룹 안으로 합류한다.
    const pureGroup = document.getElementById('crack-pure-send-left-group');
    if (pureGroup?.isConnected && pureGroup.parentElement === parent) return pureGroup;

    return null;
  }

  function placeBottomModelButton(btn, sendButton) {
    const parent = sendButton?.parentElement;
    if (!btn || !parent) return false;

    const cooperativeGroup = findBottomModelCooperativeGroup(sendButton);

    if (cooperativeGroup) {
      if (btn.parentElement !== cooperativeGroup) {
        cooperativeGroup.appendChild(btn);
      }
      btn.dataset.crackUiPlacement = 'cooperative-group';
      cooperativeGroup.dataset.crackUiPureGroupRight = '1';
      parent.dataset.crackUiBottomModelGroup = '1';
      parent.dataset.crackUiBottomModelCooperative = '1';
      return true;
    }

    if (btn.parentElement !== parent || !isNodeBeforeInSameParent(btn, sendButton)) {
      parent.insertBefore(btn, sendButton);
    }

    btn.dataset.crackUiPlacement = 'send-sibling';
    parent.dataset.crackUiBottomModelGroup = '1';
    delete parent.dataset.crackUiBottomModelCooperative;
    return true;
  }

  function ensureBottomModelButton() {
    const sendButton = DOM.sendButton();
    let btn = document.getElementById(ID.bottomModelButton);

    if (!sendButton?.parentElement) {
      if (btn) btn.remove();
      closeBottomModelPopup();
      cachedBottomSendButton = null;
      cachedOriginalModelButton = null;
      return;
    }

    if (!btn) btn = createBottomModelButton();

    placeBottomModelButton(btn, sendButton);
    syncBottomModelButton();
  }

  function ensureBottomModelPopup() {
    let popup = document.getElementById(ID.bottomModelPopup);
    if (popup) return popup;

    popup = document.createElement('div');
    popup.id = ID.bottomModelPopup;
    popup.dataset.open = '0';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-label', '채팅 모델 선택');
    popup.addEventListener('click', (e) => e.stopPropagation());
    popup.addEventListener('pointerdown', (e) => e.stopPropagation());
    document.body.appendChild(popup);
    return popup;
  }

  function positionBottomModelPopup(anchor) {
    const popup = document.getElementById(ID.bottomModelPopup);
    if (!popup) return;

    const width = Math.min(120, window.innerWidth - 16);
    popup.style.width = `${width}px`;

    const rect = anchor?.getBoundingClientRect();
    const popupHeight = popup.offsetHeight || 292;
    let left = rect ? rect.right - width : window.innerWidth - width - 8;
    let top = rect ? rect.top - popupHeight - 10 : window.innerHeight - popupHeight - 80;

    if (top < 8 && rect) top = rect.bottom + 10;

    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - popupHeight - 8));

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  }

  function closeBottomModelPopup(options = {}) {
    const popup = document.getElementById(ID.bottomModelPopup);
    if (popup) {
      popup.dataset.open = '0';
      popup.dataset.busy = '0';
      popup.innerHTML = '';
    }

    if (options.closeOriginal === true) {
      closeOfficialModelMenuIfOpen();
    }
  }

  function makeModelOption(model) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'crack-ui-model-option';
    button.dataset.modelName = model.name;
    button.dataset.selected = model.selected ? '1' : '0';
    button.setAttribute('role', 'menuitemradio');
    button.setAttribute('aria-checked', model.selected ? 'true' : 'false');

    const icon = document.createElement('img');
    icon.className = 'crack-ui-model-option-icon';
    icon.alt = '';
    icon.src = model.icon || CHAT_MODEL_INFO[model.name]?.image || '';

    const main = document.createElement('span');
    main.className = 'crack-ui-model-option-main';

    const top = document.createElement('span');
    top.className = 'crack-ui-model-option-top';

    const name = document.createElement('span');
    name.className = 'crack-ui-model-option-name';
    name.textContent = model.name;
    top.appendChild(name);


    main.appendChild(top);

    const check = document.createElement('span');
    check.className = 'crack-ui-model-option-check';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = '✓';

    button.appendChild(icon);
    button.appendChild(main);
    button.appendChild(check);

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await selectOriginalModelByName(model.name);
    });

    return button;
  }

  function renderBottomModelPopup(anchor, models = getStaticModelList()) {
    const popup = ensureBottomModelPopup();
    popup.innerHTML = '';

    const list = document.createElement('div');
    list.className = 'crack-ui-model-list';
    list.setAttribute('role', 'menu');

    models.forEach((model) => list.appendChild(makeModelOption(model)));
    popup.appendChild(list);

    popup.dataset.open = '1';
    popup.dataset.busy = '0';
    requestAnimationFrame(() => positionBottomModelPopup(anchor));
  }

  function openBottomModelPopup(anchor) {
    renderBottomModelPopup(anchor, getStaticModelList());
  }

  function isBottomModelPopupOpen() {
    return document.getElementById(ID.bottomModelPopup)?.dataset.open === '1';
  }

  function toggleBottomModelPopup(anchor) {
    if (isBottomModelPopupOpen()) {
      closeBottomModelPopup();
      return;
    }

    openBottomModelPopup(anchor);
  }

  async function selectOriginalModelByName(name) {
    const popup = document.getElementById(ID.bottomModelPopup);
    if (popup?.dataset.busy === '1') return false;

    if (popup) popup.dataset.busy = '1';

    const ok = await selectModelInvisibly(name);
    if (!ok) {
      if (popup) popup.dataset.busy = '0';
      renderBottomModelPopup(document.getElementById(ID.bottomModelButton), getStaticModelList());
      return false;
    }

    closeBottomModelPopup({ closeOriginal: false });

    setTimeout(() => {
      syncBottomModelButton();
      if (isBottomModelPopupOpen()) {
        renderBottomModelPopup(document.getElementById(ID.bottomModelButton), getStaticModelList());
      }
    }, 260);

    return true;
  }

  function ensureBottomModelPicker() {
    if (!bottomModelPicker) {
      closeBottomModelPopup({ closeOriginal: false });
      document.getElementById(ID.bottomModelButton)?.remove();
      document.getElementById(ID.bottomModelPopup)?.remove();
      cachedBottomSendButton = null;
      return;
    }

    ensureBottomModelButton();
    if (isBottomModelPopupOpen()) {
      positionBottomModelPopup(document.getElementById(ID.bottomModelButton));
    }
  }


  // =====================================================
  // Feature: novel UI model indicator
  // =====================================================

  const NOVEL_MODEL_CACHE_LIMIT = 1200;
  const NOVEL_MODEL_SCAN_THROTTLE_MS = 700;
  const NOVEL_MODEL_PENDING_MAX_AGE_MS = 120000;
  const NOVEL_MODEL_NETWORK_CANDIDATE_LIMIT = 2000;
  const NOVEL_MODEL_NETWORK_MESSAGE_LIMIT = 2000;
  const NOVEL_MODEL_NETWORK_MAX_BODY_CHARS = 8000000;
  const NOVEL_MODEL_AUTO_MATCH_MIN_SCORE = 250;
  const NOVEL_MODEL_AUTO_MATCH_AMBIGUITY_RATIO = 1.2;

  function isNovelModelIndicatorRoute() {
    return /^\/stories\/[^/]+/.test(location.pathname);
  }

  function getNovelModelRoomKey() {
    const path = String(location.pathname || '').replace(/\/+$/, '');
    const episodeMatch = path.match(/^\/stories\/([^/]+)\/episodes\/([^/]+)/);
    if (episodeMatch) return `stories:${episodeMatch[1]}:episodes:${episodeMatch[2]}`;

    const storyMatch = path.match(/^\/stories\/([^/]+)/);
    if (storyMatch) return `stories:${storyMatch[1]}`;

    return path || 'unknown';
  }


  const NOVEL_MODEL_CATALOG_LIMIT = 160;
  const NOVEL_MODEL_BUILTIN_CATALOG = Object.freeze([
    {
      id: '6a2bde2b2d1852a9f41bc3df',
      name: '페이블챗 1.0',
      crackerModel: 'fablechat_1_0',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/fablechat1_0.webp',
      retired: true,
      deletedAt: '2026-06-13T02:02:50.208Z',
      replacementChatModelId: '6a2bdd4cce9304265a32c6b8',
    },
    {
      id: '6a4ddff0c7931348699337b4',
      name: '페이블챗 1.0',
      crackerModel: 'fablechat_1_0',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/fablechat1_0.webp',
      retired: false,
    },
    {
      id: '6a2bda2f992c05d50c2ba7d3',
      name: '하이퍼챗 2.0',
      crackerModel: 'hyperchat_2_0',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/hyperchat2_0.webp',
      retired: true,
      deletedAt: '2026-06-12T10:06:59.107Z',
      replacementChatModelId: '69e0f46a9530f9bfbde683a9',
    },
    {
      id: '6a2bdd4cce9304265a32c6b8',
      name: '하이퍼챗 2.0',
      crackerModel: 'hyperchat_2_0',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/hyperchat2_0.webp',
      retired: false,
    },
    {
      id: '69e0f46a9530f9bfbde683a9',
      name: '하이퍼챗 1.5',
      crackerModel: 'hyperchat_1_5',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/hyperchat1_5.webp',
      retired: false,
    },
    {
      id: '69485e1b9d2a7cdc6ebf95bf',
      name: '하이퍼챗 1.0',
      crackerModel: 'hyperchat',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/hyperchat.webp',
      retired: false,
    },
    {
      id: '6a441a058aa1c16926050ab4',
      name: '슈퍼챗 3.0',
      crackerModel: 'superchat_3_0',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/superchat3_0.webp',
      retired: false,
    },
    {
      id: '6994ad1b2510c2af8007cca5',
      name: '슈퍼챗 2.5',
      crackerModel: 'superchat_2_5',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/superchat2_5.webp',
      retired: false,
    },
    {
      id: '69485e1b9d2a7cdc6ebf95c0',
      name: '슈퍼챗 2.0',
      crackerModel: 'superchat_2_0',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/superchat2_0.webp',
      retired: false,
    },
    {
      id: '69485e1b9d2a7cdc6ebf95c1',
      name: '슈퍼챗 1.5',
      crackerModel: 'superchat_1_5',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/superchat1_5.webp',
      retired: true,
      deletedAt: '2026-06-15T15:00:02.378Z',
      replacementChatModelId: '6994ad1b2510c2af8007cca5',
    },
    {
      id: '699877c92d18b3f5dec84f49',
      name: '프로챗 2.5',
      crackerModel: 'prochat_2_5',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/prochat2_5.webp',
      retired: false,
    },
    {
      id: '69485e1b9d2a7cdc6ebf95c2',
      name: '프로챗 2.0',
      crackerModel: 'prochat_2_0',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/prochat2_0.webp',
      retired: true,
      deletedAt: '2026-03-25T15:00:06.145Z',
      replacementChatModelId: '699877c92d18b3f5dec84f49',
    },
    {
      id: '69485e1c9d2a7cdc6ebf95c3',
      name: '프로챗 1.0',
      crackerModel: 'prochat_1_0',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/prochat1_0.webp',
      retired: false,
    },
    {
      id: '69485e1c9d2a7cdc6ebf95c4',
      name: '파워챗',
      crackerModel: 'powerchat',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/powerchat.webp',
      retired: false,
    },
    {
      id: '69485e1c9d2a7cdc6ebf95c5',
      name: '일반챗',
      crackerModel: 'normalchat',
      image: 'https://cdn-image.wrtn.ai/crack/graphics/model-icon/normalchat.webp',
      retired: true,
      deletedAt: '2026-04-16T15:00:04.531Z',
      replacementChatModelId: '69485e1c9d2a7cdc6ebf95c4',
    },
  ]);

  const NOVEL_MODEL_BUILTIN_NAME_ORDER = Object.freeze(
    [...new Set(NOVEL_MODEL_BUILTIN_CATALOG.map((entry) => entry.name))]
  );
  let novelModelCatalogNameOrder = [...NOVEL_MODEL_BUILTIN_NAME_ORDER];

  function rememberNovelModelCatalogOrderFromList(models) {
    if (!Array.isArray(models)) return false;

    const orderedNames = [];
    const seen = new Set();
    for (const item of models) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
      if (item.serviceType && item.serviceType !== 'story') continue;
      const name = normalizeText(item.name || item.displayName || item.modelName);
      const image = normalizeNovelModelIconUrl(
        item.assets?.icon?.default || item.icon?.default || item.modelIcon || item.iconUrl
      );
      if (!name || !image || seen.has(name)) continue;
      seen.add(name);
      orderedNames.push(name);
    }
    if (orderedNames.length < 2) return false;

    const next = [
      ...orderedNames,
      ...novelModelCatalogNameOrder.filter((name) => !seen.has(name)),
    ];
    const changed =
      next.length !== novelModelCatalogNameOrder.length ||
      next.some((name, index) => name !== novelModelCatalogNameOrder[index]);
    if (changed) novelModelCatalogNameOrder = next;
    return changed;
  }

  const novelModelCatalogById = new Map();
  const novelModelCatalogByName = new Map();
  const novelModelCatalogByCracker = new Map();
  let novelModelCatalogSaveTimer = null;
  let novelModelCatalogDirty = false;

  function normalizeNovelModelCatalogEntry(entry) {
    if (!entry || typeof entry !== 'object') return null;
    const id = String(entry.id || entry._id || '').trim();
    const name = normalizeText(entry.name || entry.displayName || entry.modelName).slice(0, 60);
    const crackerModel = String(entry.crackerModel || entry.cracker_model || '').trim().toLowerCase();
    const image = normalizeNovelModelIconUrl(
      entry.image || entry.assets?.icon?.default || entry.icon?.default || entry.modelIcon || entry.iconUrl
    );
    const deletedAt = String(entry.deletedAt || '').trim();
    const replacementChatModelId = String(entry.replacementChatModelId || '').trim();
    if (!id || !name || !image || !/^[a-f0-9]{24}$/i.test(id)) return null;

    return {
      id,
      name,
      crackerModel,
      image,
      retired: entry.retired === true || !!deletedAt,
      deletedAt,
      replacementChatModelId,
      updatedAt: Number(entry.updatedAt) || Date.now(),
    };
  }

  function choosePreferredNovelModelCatalogEntry(current, next) {
    if (!current) return next;
    if (current.id === next.id) return next;
    if (current.retired !== next.retired) return current.retired ? next : current;
    return next.updatedAt >= current.updatedAt ? next : current;
  }

  function scheduleNovelModelCatalogSave() {
    novelModelCatalogDirty = true;
    if (novelModelCatalogSaveTimer) return;
    novelModelCatalogSaveTimer = setTimeout(() => {
      novelModelCatalogSaveTimer = null;
      saveNovelModelCatalog();
    }, 250);
  }

  function saveNovelModelCatalog() {
    if (!novelModelCatalogDirty) return;
    novelModelCatalogDirty = false;
    const entries = [...novelModelCatalogById.values()]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, NOVEL_MODEL_CATALOG_LIMIT);
    writeJsonStorage(LS.novelModelCatalog, {
      version: 1,
      entries,
    });
  }

  function flushNovelModelCatalogSave() {
    if (novelModelCatalogSaveTimer) {
      clearTimeout(novelModelCatalogSaveTimer);
      novelModelCatalogSaveTimer = null;
    }
    saveNovelModelCatalog();
  }

  function registerNovelModelCatalogEntry(entry, { persist = false } = {}) {
    const incoming = normalizeNovelModelCatalogEntry(entry);
    if (!incoming) return false;

    const previousById = novelModelCatalogById.get(incoming.id);
    const normalized = previousById ? {
      ...previousById,
      ...incoming,
      retired: previousById.retired === true || incoming.retired === true,
      deletedAt: incoming.deletedAt || previousById.deletedAt || '',
      replacementChatModelId: incoming.replacementChatModelId || previousById.replacementChatModelId || '',
      updatedAt: Math.max(previousById.updatedAt || 0, incoming.updatedAt || 0),
    } : incoming;
    const changed = !previousById || (
      previousById.name !== normalized.name ||
      previousById.crackerModel !== normalized.crackerModel ||
      previousById.image !== normalized.image ||
      previousById.retired !== normalized.retired ||
      previousById.deletedAt !== normalized.deletedAt ||
      previousById.replacementChatModelId !== normalized.replacementChatModelId
    );

    if (!novelModelCatalogNameOrder.includes(normalized.name)) {
      novelModelCatalogNameOrder.push(normalized.name);
    }

    novelModelCatalogById.set(normalized.id, normalized);
    novelModelCatalogByName.set(
      normalized.name,
      choosePreferredNovelModelCatalogEntry(novelModelCatalogByName.get(normalized.name), normalized)
    );
    if (normalized.crackerModel) {
      novelModelCatalogByCracker.set(
        normalized.crackerModel,
        choosePreferredNovelModelCatalogEntry(novelModelCatalogByCracker.get(normalized.crackerModel), normalized)
      );
    }

    CHAT_MODEL_ID_NAME[normalized.id] = normalized.name;
    novelModelNetworkInfoByName.set(normalized.name, {
      image: normalized.image,
      retired: normalized.retired,
      deletedAt: normalized.deletedAt,
    });

    if (changed && persist) scheduleNovelModelCatalogSave();
    return changed;
  }

  function loadNovelModelCatalog() {
    for (const entry of NOVEL_MODEL_BUILTIN_CATALOG) {
      registerNovelModelCatalogEntry(entry);
    }

    const raw = readStorage(LS.novelModelCatalog);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const entries = Array.isArray(parsed) ? parsed : parsed?.entries;
      if (!Array.isArray(entries)) return;
      for (const entry of entries.slice(0, NOVEL_MODEL_CATALOG_LIMIT)) {
        registerNovelModelCatalogEntry(entry);
      }
    } catch {
    }
  }

  function toNovelModelInfo(entry) {
    if (!entry) return null;
    const image = normalizeNovelModelIconUrl(entry.image);
    const name = normalizeText(entry.name);
    if (!name || !image) return null;
    return {
      name,
      image,
      chatModelId: String(entry.id || entry.chatModelId || ''),
      crackerModel: String(entry.crackerModel || ''),
      retired: entry.retired === true,
      deletedAt: String(entry.deletedAt || ''),
      replacementChatModelId: String(entry.replacementChatModelId || ''),
    };
  }

  loadNovelModelCatalog();

  function getNovelModelInfoByName(name) {
    const normalized = normalizeText(name);
    if (!normalized) return null;

    const catalogInfo = novelModelCatalogByName.get(normalized);
    const info = CHAT_MODEL_INFO[normalized] || catalogInfo || novelModelNetworkInfoByName.get(normalized) || DEFAULT_CHAT_MODEL_INFO[normalized] || NOVEL_MODEL_LEGACY_INFO[normalized];
    const image = normalizeNovelModelIconUrl(info?.image);
    if (!image) return null;
    return {
      name: normalized,
      image,
      chatModelId: String(catalogInfo?.id || ''),
      crackerModel: String(catalogInfo?.crackerModel || ''),
      retired: catalogInfo?.retired === true || info?.retired === true,
      deletedAt: String(catalogInfo?.deletedAt || info?.deletedAt || ''),
      replacementChatModelId: String(catalogInfo?.replacementChatModelId || ''),
    };
  }

  function getNovelModelInfoByChatModelId(value) {
    const id = String(value || '').trim();
    if (!id) return null;
    return toNovelModelInfo(novelModelCatalogById.get(id)) || getNovelModelInfoByName(CHAT_MODEL_ID_NAME[id]);
  }

  function getNovelModelInfoByCrackerModel(value) {
    const code = String(value || '').trim().toLowerCase();
    if (!code) return null;
    return toNovelModelInfo(novelModelCatalogByCracker.get(code)) || getNovelModelInfoByName(DEFAULT_CRACKER_MODEL_NAME[code]);
  }

  function getNovelModelInfoByLooseToken(value) {
    const token = String(value || '').trim().toLowerCase().replace(/[\s.-]+/g, '_');
    if (!token) return null;
    const compact = token.replace(/_/g, '');
    const aliases = {
      fablechat10: '페이블챗 1.0',
      fable5: '페이블챗 1.0',
      hyperchat20: '하이퍼챗 2.0',
      opus48: '하이퍼챗 2.0',
      hyperchat15: '하이퍼챗 1.5',
      opus47: '하이퍼챗 1.5',
      hyperchat: '하이퍼챗 1.0',
      opus46: '하이퍼챗 1.0',
      superchat30: '슈퍼챗 3.0',
      sonnet50: '슈퍼챗 3.0',
      superchat25: '슈퍼챗 2.5',
      sonnet46: '슈퍼챗 2.5',
      superchat20: '슈퍼챗 2.0',
      sonnet45: '슈퍼챗 2.0',
      superchat15: '슈퍼챗 1.5',
      sonnet40: '슈퍼챗 1.5',
      prochat25: '프로챗 2.5',
      gemini31pro: '프로챗 2.5',
      gemini31: '프로챗 2.5',
      prochat20: '프로챗 2.0',
      gemini30pro: '프로챗 2.0',
      gemini30: '프로챗 2.0',
      prochat10: '프로챗 1.0',
      gemini25pro: '프로챗 1.0',
      gemini25: '프로챗 1.0',
      powerchat: '파워챗',
      normalchat: '일반챗',
    };
    return getNovelModelInfoByName(aliases[compact]);
  }

  function getNovelNetworkObjectIcon(value) {
    if (!value || typeof value !== 'object') return '';
    const candidates = [
      value.assets?.icon?.default,
      value.assets?.icon?.light,
      value.icon?.default,
      value.icon?.light,
      value.modelIcon,
      value.modelIconUrl,
      value.iconUrl,
      typeof value.icon === 'string' ? value.icon : '',
      typeof value.image === 'string' ? value.image : '',
    ];
    return candidates.map(normalizeNovelModelIconUrl).find(Boolean) || '';
  }

  function getNovelModelInfoFromNetworkObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

    const nestedCandidates = [
      value.chatModel,
      value.modelInfo,
      value.generationModel,
      value.generationInfo,
      value.metadata?.chatModel,
      value.metadata?.modelInfo,
      value.metadata?.generationModel,
      typeof value.model === 'object' ? value.model : null,
    ].filter((item) => item && typeof item === 'object' && !Array.isArray(item));

    const idCandidates = [
      value.chatModelId,
      value.chat_model_id,
      value.chatModelID,
      value.modelId,
      value.model_id,
      ...nestedCandidates.flatMap((item) => [item.chatModelId, item._id, item.id, item.modelId]),
    ];
    for (const id of idCandidates) {
      const info = getNovelModelInfoByChatModelId(id);
      if (info) return info;
    }

    for (const item of [value, ...nestedCandidates]) {
      const image = getNovelNetworkObjectIcon(item);
      if (!image) continue;

      const iconFile = getModelIconFileFromUrl(image);
      const name =
        CHAT_MODEL_ICON_MAP[iconFile] ||
        normalizeText(item.name || item.displayName || item.modelName) ||
        DEFAULT_CRACKER_MODEL_NAME[String(item.crackerModel || '').toLowerCase()] ||
        iconFile.replace(/\.(?:webp|png|svg|avif)$/i, '') ||
        '모델';
      const known = getNovelModelInfoByName(name);
      return known ? { ...known, image } : { name, image };
    }

    const directNames = [
      value.modelName,
      value.displayModelName,
      value.chatModelName,
      typeof value.model === 'string' ? value.model : '',
      ...nestedCandidates.flatMap((item) => [item.name, item.displayName, item.modelName]),
    ];
    for (const name of directNames) {
      const info = getNovelModelInfoByName(name) || getNovelModelInfoByLooseToken(name);
      if (info) return info;
    }

    const crackerCandidates = [
      value.crackerModel,
      value.cracker_model,
      ...nestedCandidates.map((item) => item.crackerModel),
    ];
    for (const code of crackerCandidates) {
      const info = getNovelModelInfoByCrackerModel(code);
      if (info) return info;
    }

    return null;
  }

  function getNovelNestedModelInfoForGroupObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

    const directChildren = [
      value.message,
      value.assistantMessage,
      value.botMessage,
      value.response,
      value.generation,
      value.lastMessage,
    ];
    for (const child of directChildren) {
      const info = getNovelModelInfoFromNetworkObject(child);
      if (info) return info;
    }

    const arrays = [value.messages, value.messageList, value.items, value.turns];
    for (const array of arrays) {
      if (!Array.isArray(array)) continue;
      for (let index = array.length - 1; index >= 0; index -= 1) {
        const info = getNovelModelInfoFromNetworkObject(array[index]);
        if (info) return info;
      }
    }

    return null;
  }

  function harvestNovelModelCatalogEntry(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const id = String(value._id || value.id || '').trim();
    const name = normalizeText(value.name || value.displayName || value.modelName);
    const image = getNovelNetworkObjectIcon(value);
    if (!id || !name || !image || !/^[a-f0-9]{24}$/i.test(id)) return false;
    if (value.serviceType && value.serviceType !== 'story') return false;

    return registerNovelModelCatalogEntry({
      id,
      name,
      crackerModel: value.crackerModel || value.cracker_model || '',
      image,
      retired: !!value.deletedAt,
      deletedAt: value.deletedAt || '',
      replacementChatModelId: value.replacementChatModelId || '',
      updatedAt: Date.now(),
    }, { persist: true });
  }

  function normalizeNovelModelMatchText(value) {
    return String(value || '')
      .replace(/\[\/\/\]: # \([^)]+\)/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/```/g, ' ')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/[“”"]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function compactNovelModelMatchText(value) {
    return normalizeNovelModelMatchText(value)
      .replace(/[^\p{L}\p{N}]/gu, '')
      .toLowerCase();
  }

  function hashNovelModelText(value) {
    const text = String(value || '');
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let index = 0; index < text.length; index += 1) {
      const code = text.charCodeAt(index);
      h1 = Math.imul(h1 ^ code, 2654435761);
      h2 = Math.imul(h2 ^ code, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  function makeNovelModelFingerprints(value) {
    const compact = compactNovelModelMatchText(value);
    if (compact.length < 30) return [];

    const positions = new Set([
      0,
      Math.floor(compact.length * 0.25),
      Math.floor(compact.length * 0.5),
      Math.floor(compact.length * 0.75),
      Math.max(0, compact.length - 80),
    ]);
    const fingerprints = [];
    for (const position of positions) {
      const chunk = compact.slice(position, position + 55);
      if (chunk.length >= 35) fingerprints.push(chunk);
    }
    return [...new Set(fingerprints)];
  }

  function getNovelNetworkMessageContent(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return '';

    const direct = [
      value.content,
      value.text,
      value.messageContent,
      value.message_content,
      value.output,
      value.answer,
      value.responseText,
      value.message?.content,
      value.message?.text,
      value.assistantMessage?.content,
      value.assistantMessage?.text,
      value.botMessage?.content,
      value.botMessage?.text,
      value.response?.content,
      value.response?.text,
      value.data?.content,
      value.payload?.content,
    ];
    for (const candidate of direct) {
      if (typeof candidate === 'string' && candidate.trim()) return candidate;
      if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
        const nestedText = candidate.text || candidate.content || candidate.value || '';
        if (typeof nestedText === 'string' && nestedText.trim()) return nestedText;
      }
      if (Array.isArray(candidate)) {
        const joined = candidate
          .map((item) => typeof item === 'string' ? item : item?.text || item?.content || item?.value || '')
          .filter(Boolean)
          .join('\n');
        if (joined.trim()) return joined;
      }
    }
    return '';
  }

  function getNovelNetworkCandidateIds(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
    const ids = new Set();
    const add = (candidate) => {
      const id = String(candidate || '').trim();
      if (id && id.length <= 120) ids.add(id);
    };

    add(value.messageGroupId);
    add(value.message_group_id);
    add(value.messageGroupID);
    add(value.groupId);
    add(value.group_id);
    add(value.messageId);
    add(value.message_id);
    add(value._id);
    add(value.id);
    add(value.messageGroup?._id);
    add(value.messageGroup?.id);
    add(value.group?._id);
    add(value.group?.id);

    return [...ids];
  }

  function isNovelNetworkAssistantMessage(value, content, modelInfo) {
    if (!content || !modelInfo) return false;
    const role = String(value?.role || value?.senderRole || value?.authorRole || value?.type || '').toLowerCase();
    if (/user|human|customer|member/.test(role)) return false;
    if (/assistant|bot|ai|model|character/.test(role)) return true;
    if (value?.story || value?.userNote || value?.title) return false;
    return content.length >= 30;
  }

  function hasNovelExplicitMessageIdentity(value) {
    if (!value || typeof value !== 'object') return false;
    return !!(
      value.messageGroupId || value.message_group_id || value.messageGroupID ||
      value.groupId || value.group_id || value.messageId || value.message_id ||
      /assistant|bot|ai|model|character/i.test(String(value.role || value.senderRole || value.type || ''))
    );
  }

  function deindexNovelModelNetworkRecord(recordKey, record) {
    for (const fingerprint of record?.fingerprints || []) {
      const keys = novelModelFingerprintIndex.get(fingerprint);
      if (!keys) continue;
      keys.delete(recordKey);
      if (!keys.size) novelModelFingerprintIndex.delete(fingerprint);
    }
  }

  function indexNovelModelNetworkRecord(recordKey, record) {
    for (const fingerprint of record.fingerprints) {
      let keys = novelModelFingerprintIndex.get(fingerprint);
      if (!keys) {
        keys = new Set();
        novelModelFingerprintIndex.set(fingerprint, keys);
      }
      keys.add(recordKey);
    }
  }

  function storeNovelModelNetworkCandidate(roomKey, messageGroupId, modelInfo, sourceUrl = '') {
    const id = String(messageGroupId || '').trim();
    const image = normalizeNovelModelIconUrl(modelInfo?.image);
    const name = normalizeText(modelInfo?.name) || '모델';
    if (!roomKey || !id || !image) return false;

    const key = makeNovelModelCacheKey(roomKey, id);
    if (novelModelNetworkCandidates.has(key)) novelModelNetworkCandidates.delete(key);
    novelModelNetworkCandidates.set(key, {
      roomKey,
      messageGroupId: id,
      name,
      image,
      chatModelId: String(modelInfo?.chatModelId || ''),
      crackerModel: String(modelInfo?.crackerModel || ''),
      retired: modelInfo?.retired === true,
      deletedAt: String(modelInfo?.deletedAt || ''),
      replacementChatModelId: String(modelInfo?.replacementChatModelId || ''),
      sourceUrl: String(sourceUrl || '').slice(0, 500),
      updatedAt: Date.now(),
    });

    while (novelModelNetworkCandidates.size > NOVEL_MODEL_NETWORK_CANDIDATE_LIMIT) {
      const oldestKey = novelModelNetworkCandidates.keys().next().value;
      if (!oldestKey) break;
      novelModelNetworkCandidates.delete(oldestKey);
    }
    return true;
  }

  function storeNovelModelNetworkMessage(roomKey, value, modelInfo, sourceUrl = '') {
    const content = getNovelNetworkMessageContent(value);
    if (!isNovelNetworkAssistantMessage(value, content, modelInfo)) return false;

    const compactContent = compactNovelModelMatchText(content);
    const fingerprints = makeNovelModelFingerprints(content);
    if (compactContent.length < 30 || !fingerprints.length) return false;

    const ids = getNovelNetworkCandidateIds(value);
    const primaryId = ids[0] || hashNovelModelText(`${compactContent.length}:${compactContent.slice(0, 120)}:${compactContent.slice(-120)}`);
    const recordKey = `${roomKey}::network::${primaryId}`;
    const normalizedModelInfo = {
      name: normalizeText(modelInfo.name) || '모델',
      image: normalizeNovelModelIconUrl(modelInfo.image),
      chatModelId: String(modelInfo.chatModelId || ''),
      crackerModel: String(modelInfo.crackerModel || ''),
      retired: modelInfo.retired === true,
      deletedAt: String(modelInfo.deletedAt || ''),
      replacementChatModelId: String(modelInfo.replacementChatModelId || ''),
    };
    if (!normalizedModelInfo.image) return false;

    for (const id of ids) storeNovelModelNetworkCandidate(roomKey, id, normalizedModelInfo, sourceUrl);

    const previous = novelModelNetworkMessages.get(recordKey);
    if (
      previous?.compactContent === compactContent &&
      previous?.modelInfo?.name === normalizedModelInfo.name &&
      previous?.modelInfo?.image === normalizedModelInfo.image &&
      previous?.modelInfo?.retired === normalizedModelInfo.retired
    ) {
      previous.updatedAt = Date.now();
      return false;
    }
    if (previous) deindexNovelModelNetworkRecord(recordKey, previous);

    const record = {
      roomKey,
      ids,
      modelInfo: normalizedModelInfo,
      compactContent,
      fingerprints,
      fingerprintSet: new Set(fingerprints),
      sourceUrl: String(sourceUrl || '').slice(0, 500),
      updatedAt: Date.now(),
    };

    if (novelModelNetworkMessages.has(recordKey)) novelModelNetworkMessages.delete(recordKey);
    novelModelNetworkMessages.set(recordKey, record);
    indexNovelModelNetworkRecord(recordKey, record);

    while (novelModelNetworkMessages.size > NOVEL_MODEL_NETWORK_MESSAGE_LIMIT) {
      const oldestKey = novelModelNetworkMessages.keys().next().value;
      if (!oldestKey) break;
      const oldest = novelModelNetworkMessages.get(oldestKey);
      deindexNovelModelNetworkRecord(oldestKey, oldest);
      novelModelNetworkMessages.delete(oldestKey);
    }

    novelModelNetworkMessageRevision += 1;
    return true;
  }

  function harvestNovelModelNetworkPayload(payload, sourceUrl = '', roomKey = getNovelModelRoomKey()) {
    if (!payload || !roomKey) return 0;

    const seen = new WeakSet();
    let visited = 0;
    let matches = 0;
    let catalogChanged = false;

    const visit = (value, depth = 0) => {
      if (visited >= 24000 || depth > 14 || !value || typeof value !== 'object') return;
      if (seen.has(value)) return;
      seen.add(value);
      visited += 1;

      if (Array.isArray(value)) {
        for (const item of value) visit(item, depth + 1);
        return;
      }

      if (Array.isArray(value.models)) {
        catalogChanged = rememberNovelModelCatalogOrderFromList(value.models) || catalogChanged;
        catalogChanged = syncChatModelRegistryFromApiModelList(value.models) || catalogChanged;
      }

      catalogChanged = harvestNovelModelCatalogEntry(value) || catalogChanged;
      const directModelInfo = getNovelModelInfoFromNetworkObject(value);
      const nestedModelInfo = directModelInfo || getNovelNestedModelInfoForGroupObject(value);
      if (nestedModelInfo && storeNovelModelNetworkMessage(roomKey, value, nestedModelInfo, sourceUrl)) {
        matches += 1;
      } else if (nestedModelInfo && hasNovelExplicitMessageIdentity(value)) {
        for (const id of getNovelNetworkCandidateIds(value)) {
          if (storeNovelModelNetworkCandidate(roomKey, id, nestedModelInfo, sourceUrl)) matches += 1;
        }
      }

      for (const child of Object.values(value)) visit(child, depth + 1);
    };

    visit(payload);
    novelModelNetworkPayloadCount += 1;
    novelModelNetworkLastUrl = String(sourceUrl || '').slice(0, 500);
    novelModelNetworkLastMatchCount = matches;

    if (matches || catalogChanged) scheduleNovelModelIndicatorScan({ immediate: true });
    return matches;
  }

  function shouldInspectNovelModelNetworkUrl(value) {
    if (!novelModelIndicator || !isNovelModelIndicatorRoute()) return false;
    try {
      const url = new URL(String(value || ''), location.href);
      return url.hostname === 'crack-api.wrtn.ai' || url.hostname.endsWith('.wrtn.ai');
    } catch {
      return false;
    }
  }

  function handleNovelModelPayloadText(text, sourceUrl = '', roomKey = getNovelModelRoomKey()) {
    if (!text || text.length > NOVEL_MODEL_NETWORK_MAX_BODY_CHARS) return 0;
    const trimmed = String(text).trim();
    if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) return 0;
    if (!/(?:chatModelId|crackerModel|modelIcon|messageGroupId|"role"|"content")/.test(trimmed)) return 0;
    try {
      return harvestNovelModelNetworkPayload(JSON.parse(trimmed), sourceUrl, roomKey);
    } catch {
      return 0;
    }
  }

  function inspectNovelModelFetchResponse(response, requestUrl = '') {
    if (!response || !shouldInspectNovelModelNetworkUrl(response.url || requestUrl)) return;
    const contentType = String(response.headers?.get?.('content-type') || '').toLowerCase();
    if (contentType && !contentType.includes('json') && !contentType.includes('text')) return;

    const roomKey = getNovelModelRoomKey();
    try {
      response.clone().text().then((text) => {
        if (!novelModelIndicator || roomKey !== getNovelModelRoomKey()) return;
        handleNovelModelPayloadText(text, response.url || requestUrl, roomKey);
      }).catch(() => {});
    } catch {
    }
  }

  function inspectNovelModelXhrResponse(xhr) {
    if (!xhr || !shouldInspectNovelModelNetworkUrl(xhr.responseURL)) return;
    const roomKey = getNovelModelRoomKey();
    try {
      if (xhr.responseType === 'json' && xhr.response) {
        harvestNovelModelNetworkPayload(xhr.response, xhr.responseURL, roomKey);
        return;
      }
      handleNovelModelPayloadText(String(xhr.responseText || ''), xhr.responseURL, roomKey);
    } catch {
    }
  }

  function installNovelModelNetworkCapture() {
    if (novelModelNetworkCaptureInstalled) return true;
    const publicWindow = getCrackUiPublicWindow();
    let installed = false;

    try {
      const originalFetch = publicWindow.fetch;
      if (typeof originalFetch === 'function') {
        if (originalFetch.__crackUiNovelModelWrapped === true) {
          installed = true;
        } else {
          const wrappedFetch = function (...args) {
            const requestUrl = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
            const result = originalFetch.apply(this, args);
            if (novelModelIndicator && isNovelModelIndicatorRoute()) {
              Promise.resolve(result).then((response) => inspectNovelModelFetchResponse(response, requestUrl)).catch(() => {});
            }
            return result;
          };
          wrappedFetch.__crackUiNovelModelWrapped = true;
          wrappedFetch.__crackUiNovelModelOriginal = originalFetch;
          publicWindow.fetch = wrappedFetch;
          installed = true;
        }
      }
    } catch {
    }

    try {
      const proto = publicWindow.XMLHttpRequest?.prototype;
      const originalSend = proto?.send;
      if (typeof originalSend === 'function') {
        if (originalSend.__crackUiNovelModelWrapped === true) {
          installed = true;
        } else {
          const wrappedSend = function (...args) {
            if (novelModelIndicator && isNovelModelIndicatorRoute() && !this.__crackUiNovelModelObserved) {
              this.__crackUiNovelModelObserved = true;
              this.addEventListener('loadend', () => inspectNovelModelXhrResponse(this), { once: true });
            }
            return originalSend.apply(this, args);
          };
          wrappedSend.__crackUiNovelModelWrapped = true;
          wrappedSend.__crackUiNovelModelOriginal = originalSend;
          proto.send = wrappedSend;
          installed = true;
        }
      }
    } catch {
    }

    novelModelNetworkCaptureInstalled = installed;
    return installed;
  }

  function scanNovelModelStaticData() {
    if (!novelModelIndicator || !isNovelModelIndicatorRoute() || !document.body) return;
    const roomKey = getNovelModelRoomKey();
    if (novelModelStaticScanRoomKey !== roomKey) {
      novelModelStaticScanRoomKey = roomKey;
      novelModelStaticScanCount = 0;
    }
    if (novelModelStaticScanCount >= 3) return;
    novelModelStaticScanCount += 1;

    try {
      const nextData = document.querySelector('#__NEXT_DATA__')?.textContent;
      if (nextData) handleNovelModelPayloadText(nextData, 'dom:__NEXT_DATA__', roomKey);
    } catch {
    }

    try {
      for (const script of document.querySelectorAll('script')) {
        const text = script.textContent || '';
        if (!text || text.length > NOVEL_MODEL_NETWORK_MAX_BODY_CHARS) continue;
        if (!/(?:crackerModel|chatModelId|messageGroupId)/.test(text)) continue;
        handleNovelModelPayloadText(text, 'dom:script', roomKey);
      }
    } catch {
    }

    try {
      for (const storage of [localStorage, sessionStorage]) {
        const count = Math.min(storage.length, 250);
        for (let index = 0; index < count; index += 1) {
          const key = storage.key(index);
          // UI+ caches are loaded by their dedicated loaders. Re-parsing them as
          // Crack bootstrap data only feeds captured results back into the scanner.
          if (key?.startsWith('crack_ui_') || key === 'wrtn_img_resizer_config') continue;
          const value = key ? storage.getItem(key) : '';
          if (!value || value.length > NOVEL_MODEL_NETWORK_MAX_BODY_CHARS) continue;
          if (!/(?:crackerModel|chatModelId|messageGroupId)/.test(value)) continue;
          handleNovelModelPayloadText(value, `storage:${key}`, roomKey);
        }
      }
    } catch {
    }
  }

  function normalizeNovelModelIconUrl(value) {
    let raw = String(value || '').trim();
    if (!raw) return '';

    for (let i = 0; i < 2; i += 1) {
      try {
        const decoded = decodeURIComponent(raw);
        if (decoded === raw) break;
        raw = decoded;
      } catch {
        break;
      }
    }

    const nestedUrl = raw.match(/https:\/\/[^\s"'<>]+\/model-icon\/[^\s"'<>?]+(?:\?[^\s"'<>]*)?/i)?.[0] || '';
    const candidate = nestedUrl || raw;

    try {
      const url = new URL(candidate, location.href);
      if (url.protocol !== 'https:') return '';
      if (/\/model-icon\//i.test(url.pathname)) return url.href;
    } catch {
    }

    const iconFile = getModelIconFileFromUrl(raw);
    const knownName = CHAT_MODEL_ICON_MAP[iconFile];
    const knownImage = knownName ? String(CHAT_MODEL_INFO[knownName]?.image || '') : '';
    if (!knownImage || knownImage === value) return '';

    try {
      const url = new URL(knownImage, location.href);
      return url.protocol === 'https:' && /\/model-icon\//i.test(url.pathname) ? url.href : '';
    } catch {
      return '';
    }
  }

  function normalizeNovelModelCacheEntry(entry) {
    const roomKey = String(entry?.roomKey || '').slice(0, 180);
    const messageGroupId = String(entry?.messageGroupId || '').slice(0, 100);
    const image = normalizeNovelModelIconUrl(entry?.image);
    const name = normalizeText(entry?.name).slice(0, 60) || '모델';
    const updatedAt = Number(entry?.updatedAt) || 0;
    const source = String(entry?.source || '').slice(0, 40);

    if (!roomKey || !messageGroupId || !image) return null;
    return { roomKey, messageGroupId, image, name, updatedAt, source };
  }

  function loadNovelModelMessageCache() {
    const raw = readStorage(LS.novelModelMessageCache);
    if (!raw) return {};

    try {
      const parsed = JSON.parse(raw);
      const sourceEntries = parsed?.entries && typeof parsed.entries === 'object'
        ? parsed.entries
        : parsed;
      if (!sourceEntries || typeof sourceEntries !== 'object' || Array.isArray(sourceEntries)) return {};

      const entries = {};
      for (const [key, value] of Object.entries(sourceEntries)) {
        const entry = normalizeNovelModelCacheEntry(value);
        if (!entry) continue;
        entries[String(key).slice(0, 320)] = entry;
      }
      return entries;
    } catch {
      return {};
    }
  }

  function loadNovelModelManualMap() {
    const raw = readStorage(LS.novelModelManualMap);
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      const result = {};
      for (const [key, value] of Object.entries(parsed)) {
        const name = normalizeText(value).slice(0, 60);
        if (name && getNovelModelInfoByName(name)) result[String(key).slice(0, 320)] = name;
      }
      return result;
    } catch {
      return {};
    }
  }

  let novelModelMessageCache = loadNovelModelMessageCache();
  let novelModelManualMap = loadNovelModelManualMap();

  function makeNovelModelCacheKey(roomKey, messageGroupId) {
    return `${String(roomKey || '')}::${String(messageGroupId || '')}`;
  }

  function getNovelModelManualKey(group, roomKey = getNovelModelRoomKey()) {
    const messageGroupId = getMessageGroupId(group);
    if (messageGroupId) return makeNovelModelCacheKey(roomKey, messageGroupId);
    const compact = compactNovelModelMatchText(findMessageMarkdown(group)?.textContent || '');
    return `${roomKey}::text::${compact.length}::${hashNovelModelText(compact.slice(0, 120) + compact.slice(-120))}`;
  }

  function saveNovelModelManualMap() {
    const keys = Object.keys(novelModelManualMap);
    if (keys.length > NOVEL_MODEL_CACHE_LIMIT) {
      keys.slice(0, keys.length - NOVEL_MODEL_CACHE_LIMIT).forEach((key) => delete novelModelManualMap[key]);
    }
    writeJsonStorage(LS.novelModelManualMap, novelModelManualMap);
  }

  function getManualNovelModelInfo(group, roomKey) {
    const name = novelModelManualMap[getNovelModelManualKey(group, roomKey)];
    const info = getNovelModelInfoByName(name);
    return info ? { ...info, manual: true, source: 'manual' } : null;
  }

  function setManualNovelModelInfo(group, modelName, roomKey = getNovelModelRoomKey()) {
    const key = getNovelModelManualKey(group, roomKey);
    const info = getNovelModelInfoByName(modelName);
    if (!info) return false;
    novelModelManualMap[key] = info.name;
    saveNovelModelManualMap();
    return true;
  }

  function clearManualNovelModelInfo(group, roomKey = getNovelModelRoomKey()) {
    const key = getNovelModelManualKey(group, roomKey);
    if (!Object.prototype.hasOwnProperty.call(novelModelManualMap, key)) return false;
    delete novelModelManualMap[key];
    saveNovelModelManualMap();
    return true;
  }

  function pruneNovelModelMessageCache() {
    const keys = Object.keys(novelModelMessageCache);
    if (keys.length <= NOVEL_MODEL_CACHE_LIMIT) return;

    keys
      .sort((a, b) => (novelModelMessageCache[b]?.updatedAt || 0) - (novelModelMessageCache[a]?.updatedAt || 0))
      .slice(NOVEL_MODEL_CACHE_LIMIT)
      .forEach((key) => delete novelModelMessageCache[key]);
  }

  function saveNovelModelMessageCache() {
    pruneNovelModelMessageCache();
    writeJsonStorage(LS.novelModelMessageCache, {
      version: 2,
      entries: novelModelMessageCache,
    });
  }

  function getCachedNovelModelInfo(roomKey, messageGroupId) {
    return novelModelMessageCache[makeNovelModelCacheKey(roomKey, messageGroupId)] || null;
  }

  function cacheNovelModelInfo(roomKey, messageGroupId, modelInfo, source = 'unknown') {
    const image = normalizeNovelModelIconUrl(modelInfo?.image);
    const name = normalizeText(modelInfo?.name).slice(0, 60) || '모델';
    if (!roomKey || !messageGroupId || !image) return false;

    const key = makeNovelModelCacheKey(roomKey, messageGroupId);
    const previous = novelModelMessageCache[key];
    const chatModelId = String(modelInfo?.chatModelId || '');
    const crackerModel = String(modelInfo?.crackerModel || '');
    const retired = modelInfo?.retired === true;
    const deletedAt = String(modelInfo?.deletedAt || '');
    const replacementChatModelId = String(modelInfo?.replacementChatModelId || '');
    if (
      previous?.image === image &&
      previous?.name === name &&
      previous?.source === source &&
      String(previous?.chatModelId || '') === chatModelId &&
      String(previous?.crackerModel || '') === crackerModel &&
      previous?.retired === retired &&
      String(previous?.deletedAt || '') === deletedAt &&
      String(previous?.replacementChatModelId || '') === replacementChatModelId
    ) return false;

    novelModelMessageCache[key] = {
      roomKey,
      messageGroupId,
      image,
      name,
      source,
      chatModelId,
      crackerModel,
      retired,
      deletedAt,
      replacementChatModelId,
      updatedAt: Date.now(),
    };
    return true;
  }

  function getMessageGroupId(group) {
    return String(group?.getAttribute?.('data-message-group-id') || '').trim();
  }

  function findMessageGroups() {
    if (!isNovelModelIndicatorRoute()) return [];
    return [...document.querySelectorAll('[data-message-group-id]')];
  }

  function isAssistantMessageGroup(group) {
    if (!(group instanceof HTMLElement)) return false;
    const shell = group.firstElementChild;
    if (!(shell instanceof HTMLElement) || !shell.classList.contains('items-start')) return false;
    return !!group.querySelector('.wrtn-markdown, [class*="wrtn-markdown"]');
  }

  function findAssistantMessageGroups() {
    return findMessageGroups().filter(isAssistantMessageGroup);
  }

  function findNovelAssistantMessageGroups() {
    return findAssistantMessageGroups().filter(isNovelAssistantMessageGroup);
  }

  function findMessageMarkdown(group) {
    return group?.querySelector?.('.wrtn-markdown, [class*="wrtn-markdown"]') || null;
  }

  function findMessageBubble(group) {
    const markdown = findMessageMarkdown(group);
    const bubble = markdown?.parentElement || null;
    return bubble instanceof HTMLElement ? bubble : null;
  }

  function isNovelAssistantMessageGroup(group) {
    if (!isAssistantMessageGroup(group)) return false;
    const bubble = findMessageBubble(group);
    if (!bubble) return false;

    const classes = bubble.classList;
    return (
      classes.contains('px-0') &&
      classes.contains('py-0') &&
      classes.contains('rounded-none') &&
      classes.contains('bg-transparent')
    );
  }

  function findNativeMessageModelIcon(group) {
    if (!(group instanceof HTMLElement)) return null;
    return [...group.querySelectorAll('img[src*="model-icon"], img[srcset*="model-icon"]')]
      .find((icon) => !icon.closest('.crack-ui-novel-model-indicator')) || null;
  }

  function getModelInfoFromIconElement(icon) {
    if (!(icon instanceof HTMLImageElement)) return null;
    const image = normalizeNovelModelIconUrl(getModelIconSourceFromNode(icon));
    if (!image) return null;

    const iconFile = getModelIconFileFromUrl(image);
    let name = CHAT_MODEL_ICON_MAP[iconFile] || '';
    if (!name) {
      const alt = normalizeText(icon.getAttribute('alt'));
      if (alt && alt.toLowerCase() !== 'model') name = alt;
    }
    if (!name) name = iconFile.replace(/\.(?:webp|png|svg|avif)$/i, '') || '모델';

    const known = getNovelModelInfoByName(name);
    return known ? { ...known, image } : { name, image };
  }

  function getCurrentSelectedModelInfoForNovelIndicator() {
    const candidates = [
      DOM.modelButton(),
      document.getElementById(ID.bottomModelButton),
    ].filter(Boolean);

    for (const candidate of candidates) {
      const image = normalizeNovelModelIconUrl(getModelIconSourceFromNode(candidate));
      if (!image) continue;

      const iconFile = getModelIconFileFromUrl(image);
      const mappedName = CHAT_MODEL_ICON_MAP[iconFile] || '';
      const rawName = normalizeText(getRawModelNameFromNode(candidate));
      const name = mappedName || (isKnownChatModelName(rawName) ? rawName : '') || '모델';
      return { name, image };
    }

    return null;
  }

  function findMessageActionFooter(group) {
    if (!(group instanceof HTMLElement)) return null;

    const candidates = [...group.querySelectorAll('div.flex.items-center.justify-between.mt-2')];
    return candidates.find((footer) => (
      footer.querySelector('button[aria-label="메시지 옵션"]') ||
      footer.querySelector('svg path[d^="M3.8 12"]')
    )) || null;
  }

  function findMessageActionFooterLeftSlot(group) {
    const footer = findMessageActionFooter(group);
    const left = footer?.firstElementChild || null;
    if (!(left instanceof HTMLElement)) return null;
    if (!left.classList.contains('flex') || !left.classList.contains('items-center')) return null;
    return left;
  }

  function removeNovelModelIndicatorFromGroup(group) {
    group?.querySelectorAll?.('.crack-ui-novel-model-indicator').forEach((element) => element.remove());
  }

  function closeNovelModelManualMenu() {
    document.querySelectorAll('.crack-ui-novel-model-menu, .crack-ui-novel-model-menu-backdrop').forEach((element) => element.remove());
  }

  function getNovelModelManualChoices() {
    const names = new Set([
      ...CHAT_MODEL_ORDER,
      ...novelModelCatalogNameOrder,
      ...Object.keys(DEFAULT_CHAT_MODEL_INFO),
      ...Object.keys(NOVEL_MODEL_LEGACY_INFO),
      ...novelModelCatalogByName.keys(),
    ]);
    const officialRank = new Map(CHAT_MODEL_ORDER.map((name, index) => [name, index]));
    const catalogRank = new Map(novelModelCatalogNameOrder.map((name, index) => [name, index]));
    const activeFallbackBase = CHAT_MODEL_ORDER.length + 1000;

    return [...names]
      .map((name) => getNovelModelInfoByName(name))
      .filter(Boolean)
      .sort((a, b) => {
        if (a.retired !== b.retired) return a.retired ? 1 : -1;

        if (!a.retired) {
          const aRank = officialRank.has(a.name)
            ? officialRank.get(a.name)
            : activeFallbackBase + (catalogRank.get(a.name) ?? 100000);
          const bRank = officialRank.has(b.name)
            ? officialRank.get(b.name)
            : activeFallbackBase + (catalogRank.get(b.name) ?? 100000);
          if (aRank !== bRank) return aRank - bRank;
        } else {
          const aRank = catalogRank.get(a.name) ?? 100000;
          const bRank = catalogRank.get(b.name) ?? 100000;
          if (aRank !== bRank) return aRank - bRank;
        }

        return a.name.localeCompare(b.name, 'ko');
      });
  }

  function openNovelModelManualMenu(anchor, group) {
    if (!(anchor instanceof HTMLElement) || !(group instanceof HTMLElement)) return;
    closeNovelModelManualMenu();

    const backdrop = document.createElement('div');
    backdrop.className = 'crack-ui-novel-model-menu-backdrop';
    backdrop.addEventListener('click', closeNovelModelManualMenu, { once: true });
    document.body.appendChild(backdrop);

    const menu = document.createElement('div');
    menu.className = 'crack-ui-novel-model-menu';
    menu.dataset.crackUiTheme = normalizeThemeMode(themeMode);
    menu.dataset.crackUiMenuOwner = 'novel-model-indicator';
    menu.setAttribute('role', 'menu');

    for (const info of getNovelModelManualChoices()) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'crack-ui-novel-model-menu-item';
      item.dataset.retired = info.retired ? '1' : '0';
      item.setAttribute('role', 'menuitem');

      const icon = document.createElement('img');
      icon.src = info.image;
      icon.alt = '';
      icon.setAttribute('aria-hidden', 'true');

      const label = document.createElement('span');
      label.className = 'crack-ui-novel-model-menu-label';
      label.textContent = `${info.name}${info.retired ? ' · 서비스 종료' : ''}`;

      item.append(icon, label);
      item.addEventListener('click', (event) => {
        event.stopPropagation();
        setManualNovelModelInfo(group, info.name);
        closeNovelModelManualMenu();
        scheduleNovelModelIndicatorScan({ immediate: true });
      });
      menu.appendChild(item);
    }

    const automatic = document.createElement('button');
    automatic.type = 'button';
    automatic.className = 'crack-ui-novel-model-menu-clear';
    automatic.textContent = '자동 판정 다시 사용';
    automatic.addEventListener('click', (event) => {
      event.stopPropagation();
      clearManualNovelModelInfo(group);
      closeNovelModelManualMenu();
      scheduleNovelModelIndicatorScan({ immediate: true });
    });
    menu.appendChild(automatic);
    document.body.appendChild(menu);

    const rect = anchor.getBoundingClientRect();
    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    const top = window.innerHeight - rect.bottom >= height + 12
      ? rect.bottom + 6
      : Math.max(8, rect.top - height - 6);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  function renderNovelModelIndicator(group, modelInfo = null) {
    const leftSlot = findMessageActionFooterLeftSlot(group);
    if (!leftSlot) {
      removeNovelModelIndicatorFromGroup(group);
      return false;
    }

    const duplicates = [...leftSlot.children]
      .filter((element) => element.classList?.contains('crack-ui-novel-model-indicator'));
    let indicator = duplicates.shift() || null;
    duplicates.forEach((element) => element.remove());

    if (!indicator) {
      indicator = document.createElement('button');
      indicator.type = 'button';
      indicator.className = 'crack-ui-novel-model-indicator';
      indicator.addEventListener('click', (event) => {
        event.stopPropagation();
        openNovelModelManualMenu(indicator, group);
      });
      leftSlot.prepend(indicator);
    }

    const image = normalizeNovelModelIconUrl(modelInfo?.image);
    const name = normalizeText(modelInfo?.name) || '';
    const source = String(modelInfo?.source || '');
    const manual = modelInfo?.manual === true || source === 'manual';
    const retired = modelInfo?.retired === true;
    const marker = `${image}|${name}|${source}|${manual ? '1' : '0'}|${retired ? '1' : '0'}`;
    const currentIcon = indicator.querySelector('img');
    const alreadyRendered = indicator.dataset.crackUiNovelModelMarker === marker && (
      image
        ? currentIcon?.getAttribute('src') === image
        : !currentIcon && indicator.textContent === '?'
    );
    if (alreadyRendered) return true;

    indicator.replaceChildren();
    indicator.dataset.crackUiNovelModelMarker = marker;
    indicator.dataset.crackUiNovelModelName = name;
    indicator.dataset.crackUiNovelModelImage = image;
    indicator.dataset.crackUiNovelModelSource = source;
    indicator.dataset.crackUiNovelModelRetired = retired ? '1' : '0';
    indicator.dataset.crackUiNovelModelUnresolved = image ? '0' : '1';

    if (image) {
      const icon = document.createElement('img');
      icon.src = image;
      icon.alt = '';
      icon.setAttribute('aria-hidden', 'true');
      indicator.appendChild(icon);
      const retiredLabel = retired ? ' · 서비스 종료' : '';
      indicator.title = `${name || '모델'}${retiredLabel}${manual ? ' · 수동 지정' : ''}`;
      indicator.setAttribute('aria-label', `응답 모델: ${name || '모델'}${retired ? ', 서비스 종료' : ''}${manual ? ', 수동 지정' : ''}`);
    } else {
      indicator.textContent = '?';
      indicator.title = '모델을 자동으로 확인하지 못함 · 눌러서 직접 선택';
      indicator.setAttribute('aria-label', '응답 모델 선택');
    }

    return true;
  }

  function removeAllNovelModelIndicators() {
    closeNovelModelManualMenu();
    document.querySelectorAll('.crack-ui-novel-model-indicator').forEach((element) => element.remove());
    novelModelIndicatorCleanupPending = false;
  }

  function clearNovelModelIndicatorScanSchedule() {
    if (novelModelIndicatorScanTimer) {
      clearTimeout(novelModelIndicatorScanTimer);
      novelModelIndicatorScanTimer = null;
    }
    if (novelModelIndicatorScanRaf) {
      cancelAnimationFrame(novelModelIndicatorScanRaf);
      novelModelIndicatorScanRaf = 0;
    }
  }

  function clearPendingNovelModelObserver() {
    if (!pendingNovelModelObserver) return;
    pendingNovelModelObserver.disconnect();
    pendingNovelModelObserver = null;
  }

  function clearPendingNovelModelCapture() {
    pendingNovelModelCapture = null;
    clearPendingNovelModelObserver();
    if (pendingNovelModelExpiryTimer) {
      clearTimeout(pendingNovelModelExpiryTimer);
      pendingNovelModelExpiryTimer = null;
    }
  }

  function bindPendingNovelModelObserver(targetGroup) {
    clearPendingNovelModelObserver();
    if (!(targetGroup instanceof HTMLElement)) return;

    pendingNovelModelObserver = new MutationObserver(() => {
      if (!pendingNovelModelCapture) {
        clearPendingNovelModelObserver();
        return;
      }
      scheduleNovelModelIndicatorScan();
    });
    pendingNovelModelObserver.observe(targetGroup, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  function disableNovelModelIndicatorUi() {
    clearNovelModelIndicatorScanSchedule();
    clearPendingNovelModelCapture();
    closeNovelModelManualMenu();
    if (novelModelIndicatorCleanupPending) removeAllNovelModelIndicators();
  }

  function getNovelMessageContentSignature(group) {
    const text = normalizeText(findMessageMarkdown(group)?.textContent || '');
    if (!text) return '';
    return `${text.length}:${text.slice(0, 80)}:${text.slice(-80)}`;
  }

  function chooseNewestAssistantGroup(groups) {
    if (!groups.length) return null;
    let best = groups[0];
    let bestTop = Number.NEGATIVE_INFINITY;

    for (const group of groups) {
      const top = Number(group.getBoundingClientRect?.().top);
      if (Number.isFinite(top) && top >= bestTop) {
        bestTop = top;
        best = group;
      }
    }
    return best;
  }

  function resolveNovelModelNetworkCandidates(groups, roomKey) {
    let changed = false;
    for (const group of groups) {
      if (!isAssistantMessageGroup(group)) continue;
      const messageGroupId = getMessageGroupId(group);
      if (!messageGroupId) continue;

      const key = makeNovelModelCacheKey(roomKey, messageGroupId);
      const candidate = novelModelNetworkCandidates.get(key);
      if (!candidate) continue;

      changed = cacheNovelModelInfo(roomKey, messageGroupId, candidate, 'network-id') || changed;
      novelModelNetworkCandidates.delete(key);
    }
    return changed;
  }

  function scoreNovelModelNetworkRecord(record, visibleCompact, visibleFingerprints, groupHtml) {
    if (!record || record.roomKey !== getNovelModelRoomKey()) return 0;
    if (record.ids.some((id) => id && groupHtml.includes(id))) return 100000;

    let score = 0;
    for (const fingerprint of visibleFingerprints) {
      if (record.fingerprintSet.has(fingerprint)) score += fingerprint.length * 10;
    }

    const head = visibleCompact.slice(0, 100);
    if (head.length >= 60 && record.compactContent.includes(head)) score += 1000;

    const tail = visibleCompact.slice(-100);
    if (tail.length >= 60 && record.compactContent.includes(tail)) score += 800;

    const lengthDifference = Math.abs(record.compactContent.length - visibleCompact.length);
    const lengthBase = Math.max(record.compactContent.length, visibleCompact.length, 1);
    if (lengthDifference / lengthBase <= 0.03) score += 300;
    else if (lengthDifference / lengthBase <= 0.1) score += 120;

    return score;
  }

  function findNovelModelByContent(group, roomKey) {
    const markdown = findMessageMarkdown(group);
    const visibleCompact = compactNovelModelMatchText(markdown?.textContent || '');
    if (visibleCompact.length < 30) return null;

    const visibleFingerprints = makeNovelModelFingerprints(visibleCompact);
    const candidateKeys = new Set();
    for (const fingerprint of visibleFingerprints) {
      const keys = novelModelFingerprintIndex.get(fingerprint);
      if (!keys) continue;
      for (const key of keys) candidateKeys.add(key);
    }

    if (!candidateKeys.size && novelModelNetworkMessages.size <= 240) {
      for (const [key, record] of novelModelNetworkMessages) {
        if (record.roomKey === roomKey) candidateKeys.add(key);
      }
    }
    if (!candidateKeys.size) return null;

    const html = group.outerHTML || '';
    let best = null;
    let second = null;
    for (const key of candidateKeys) {
      const record = novelModelNetworkMessages.get(key);
      if (!record || record.roomKey !== roomKey) continue;
      const score = scoreNovelModelNetworkRecord(record, visibleCompact, visibleFingerprints, html);
      const candidate = { record, score };
      if (!best || score > best.score) {
        second = best;
        best = candidate;
      } else if (!second || score > second.score) {
        second = candidate;
      }
    }

    if (!best || best.score < NOVEL_MODEL_AUTO_MATCH_MIN_SCORE) return null;
    if (second && second.score > 0 && best.score < second.score * NOVEL_MODEL_AUTO_MATCH_AMBIGUITY_RATIO) return null;
    return { ...best.record.modelInfo, source: 'network-content', matchScore: best.score };
  }

  function resolveNovelModelContentMatches(groups, roomKey) {
    let changed = false;
    for (const group of groups) {
      if (!isNovelAssistantMessageGroup(group)) continue;
      const messageGroupId = getMessageGroupId(group);
      if (!messageGroupId || getCachedNovelModelInfo(roomKey, messageGroupId)) continue;
      if (getManualNovelModelInfo(group, roomKey)) continue;

      const signature = `${getNovelMessageContentSignature(group)}|${novelModelNetworkMessageRevision}`;
      if (group.dataset.crackUiNovelModelMatchAttempt === signature) continue;
      group.dataset.crackUiNovelModelMatchAttempt = signature;

      const modelInfo = findNovelModelByContent(group, roomKey);
      if (!modelInfo) continue;
      changed = cacheNovelModelInfo(roomKey, messageGroupId, modelInfo, 'network-content') || changed;
    }
    return changed;
  }

  function resolvePendingNovelModelCapture(groups, roomKey) {
    const pending = pendingNovelModelCapture;
    if (!pending) return false;

    if (pending.roomKey !== roomKey || Date.now() - pending.createdAt > NOVEL_MODEL_PENDING_MAX_AGE_MS) {
      clearPendingNovelModelCapture();
      return false;
    }

    const assistantGroups = groups.filter(isAssistantMessageGroup);
    let candidate = null;

    if (pending.targetMessageGroupId) {
      const target = assistantGroups.find((group) => getMessageGroupId(group) === pending.targetMessageGroupId) || null;
      if (target) {
        const targetReplaced = target !== pending.targetElement;
        if (targetReplaced) {
          pending.targetElement = target;
          bindPendingNovelModelObserver(target);
        }
        const signature = getNovelMessageContentSignature(target);
        if (targetReplaced || (signature && signature !== pending.targetSignature)) candidate = target;
      }
    }

    if (!candidate) {
      const newGroups = assistantGroups.filter((group) => {
        const id = getMessageGroupId(group);
        return id && !pending.knownMessageGroupIds.has(id);
      });
      candidate = chooseNewestAssistantGroup(newGroups);
    }

    if (!candidate) return false;

    const messageGroupId = getMessageGroupId(candidate);
    if (!messageGroupId) return false;

    const isNovelMessage = isNovelAssistantMessageGroup(candidate);
    let modelInfo = pending.modelInfo;
    if (!isNovelMessage) {
      const nativeInfo = getModelInfoFromIconElement(findNativeMessageModelIcon(candidate));
      if (!nativeInfo) return false;
      modelInfo = nativeInfo;
    }

    const changed = cacheNovelModelInfo(
      roomKey,
      messageGroupId,
      modelInfo,
      isNovelMessage ? 'generation-trigger' : 'chat-ui'
    );
    clearPendingNovelModelCapture();
    return changed;
  }

  function scanNovelModelIndicators() {
    novelModelIndicatorLastScanAt = performance.now();
    if (!novelModelIndicator || !isNovelModelIndicatorRoute()) {
      disableNovelModelIndicatorUi();
      return;
    }

    novelModelIndicatorCleanupPending = true;
    const roomKey = getNovelModelRoomKey();
    const groups = findMessageGroups();
    let cacheChanged = false;

    for (const group of groups) {
      if (!isAssistantMessageGroup(group)) {
        removeNovelModelIndicatorFromGroup(group);
        continue;
      }

      if (isNovelAssistantMessageGroup(group)) continue;

      removeNovelModelIndicatorFromGroup(group);
      const messageGroupId = getMessageGroupId(group);
      const nativeIcon = findNativeMessageModelIcon(group);
      const modelInfo = getModelInfoFromIconElement(nativeIcon);
      if (!messageGroupId || !modelInfo) continue;

      const marker = `${modelInfo.image}|${modelInfo.name}`;
      if (group.dataset.crackUiNovelModelHarvested === marker) continue;
      group.dataset.crackUiNovelModelHarvested = marker;
      cacheChanged = cacheNovelModelInfo(roomKey, messageGroupId, modelInfo, 'chat-ui') || cacheChanged;
    }

    cacheChanged = resolvePendingNovelModelCapture(groups, roomKey) || cacheChanged;
    cacheChanged = resolveNovelModelNetworkCandidates(groups, roomKey) || cacheChanged;
    cacheChanged = resolveNovelModelContentMatches(groups, roomKey) || cacheChanged;
    if (cacheChanged) saveNovelModelMessageCache();

    for (const group of groups) {
      if (!isNovelAssistantMessageGroup(group)) continue;
      const messageGroupId = getMessageGroupId(group);
      const manualInfo = getManualNovelModelInfo(group, roomKey);
      const exactInfo = getCachedNovelModelInfo(roomKey, messageGroupId);
      renderNovelModelIndicator(group, manualInfo || exactInfo || null);
    }
  }

  function scheduleNovelModelIndicatorScan({ immediate = false } = {}) {
    if (!novelModelIndicator || !isNovelModelIndicatorRoute()) {
      disableNovelModelIndicatorUi();
      return;
    }

    const elapsed = performance.now() - novelModelIndicatorLastScanAt;
    const delay = immediate ? 0 : Math.max(0, NOVEL_MODEL_SCAN_THROTTLE_MS - elapsed);

    if (immediate && novelModelIndicatorScanTimer) {
      clearTimeout(novelModelIndicatorScanTimer);
      novelModelIndicatorScanTimer = null;
    }
    if (novelModelIndicatorScanTimer || novelModelIndicatorScanRaf) return;

    novelModelIndicatorScanTimer = setTimeout(() => {
      novelModelIndicatorScanTimer = null;
      novelModelIndicatorScanRaf = requestAnimationFrame(() => {
        novelModelIndicatorScanRaf = 0;
        scanNovelModelIndicators();
      });
    }, delay);
  }

  function ensureNovelModelIndicator() {
    if (!novelModelIndicator || !isNovelModelIndicatorRoute()) {
      disableNovelModelIndicatorUi();
      return;
    }

    installNovelModelNetworkCapture();
    scanNovelModelStaticData();
    scheduleNovelModelIndicatorScan({ immediate: novelModelIndicatorLastScanAt === 0 });
  }

  function beginNovelModelCapture(triggerElement, reason = 'generation') {
    if (!novelModelIndicator || !isNovelModelIndicatorRoute()) return false;

    const modelInfo = getCurrentSelectedModelInfoForNovelIndicator();
    if (!modelInfo?.image) return false;

    const assistantGroups = findAssistantMessageGroups();
    const targetGroup = triggerElement?.closest?.('[data-message-group-id]') || null;
    const targetMessageGroupId = isAssistantMessageGroup(targetGroup) ? getMessageGroupId(targetGroup) : '';

    clearPendingNovelModelCapture();
    pendingNovelModelCapture = {
      roomKey: getNovelModelRoomKey(),
      modelInfo,
      reason,
      targetMessageGroupId,
      targetElement: targetMessageGroupId ? targetGroup : null,
      targetSignature: targetMessageGroupId ? getNovelMessageContentSignature(targetGroup) : '',
      knownMessageGroupIds: new Set(assistantGroups.map(getMessageGroupId).filter(Boolean)),
      createdAt: Date.now(),
    };
    pendingNovelModelExpiryTimer = setTimeout(() => {
      clearPendingNovelModelCapture();
    }, NOVEL_MODEL_PENDING_MAX_AGE_MS);
    if (targetMessageGroupId) bindPendingNovelModelObserver(targetGroup);
    return true;
  }

  function getNovelModelGenerationButtonKind(button) {
    if (!(button instanceof HTMLButtonElement)) return '';
    if (button.closest(`#${ID.panel}, #${ID.bottomModelPopup}`)) return '';
    if (isChatComposerSendButton(button)) return 'send';

    const messageGroup = button.closest('[data-message-group-id]');
    if (!isAssistantMessageGroup(messageGroup)) return '';

    const label = normalizeText(`${button.getAttribute('aria-label') || ''} ${button.title || ''} ${button.textContent || ''}`);
    if (/이어서\s*생성/.test(label)) return 'continue';
    if (/재생성|다시\s*생성/.test(label)) return 'regenerate';
    if (button.querySelector('svg path[d^="M3.8 12"]')) return 'regenerate';

    return '';
  }

  function noteNovelModelGenerationTriggerFromClick(target) {
    if (!novelModelIndicator || !isNovelModelIndicatorRoute()) return;
    const element = target?.nodeType === 1 ? target : target?.parentElement;
    const button = element?.closest?.('button');
    const kind = getNovelModelGenerationButtonKind(button);
    if (!kind) return;
    if (kind === 'send' && shouldBlockEmptyComposerSend()) return;
    beginNovelModelCapture(button, kind);
  }

  function noteNovelModelGenerationTriggerFromEnter(event) {
    if (!novelModelIndicator || !isNovelModelIndicatorRoute()) return;
    if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    const editable = getFocusedComposerEditableForEnterEvent(event);
    if (!editable) return;
    if (emptySendGuard && normalizeComposerText(getEditableText(editable)).length === 0) return;
    beginNovelModelCapture(editable, 'send-enter');
  }

  // =====================================================
  // Feature: room settings auto hide
  // =====================================================

  function updateRoomMenuRevealClass() {
    const active = roomMenuHandle && crackUiIsChatRoute() && (roomMenuReveal || isTouchLikeDevice());
    document.documentElement.classList.toggle(CLS.roomMenuReveal, active);
  }

  function clearRoomMenuForceRevealTimer() {
    if (roomMenuForceRevealTimer) {
      clearTimeout(roomMenuForceRevealTimer);
      roomMenuForceRevealTimer = null;
    }
  }

  function releaseRoomMenuForceRevealSoon(delay = 4200) {
    clearRoomMenuForceRevealTimer();
    roomMenuForceRevealTimer = setTimeout(() => {
      roomMenuForceRevealTimer = null;
      const btn = DOM.chatRoomSettingsButton();
      const menuOpen = btn?.getAttribute('aria-expanded') === 'true' || btn?.dataset?.state === 'open';
      if (menuOpen) {
        releaseRoomMenuForceRevealSoon(1600);
        return;
      }
      roomMenuForceReveal = false;
      updateReveal();
    }, delay);
  }

  function isChatRoomSettingsButton(button) {
    if (!button || !button.isConnected) return false;
    if (button.id === ID.roomMenuHandle || button.id === ID.bottomModelButton) return false;
    if (document.getElementById(ID.panel)?.contains(button)) return false;
    if (document.getElementById(ID.bottomModelPopup)?.contains(button)) return false;
    if (document.getElementById(ID.roomMenuZone)?.contains(button)) return false;

    const hasRoomMenuIcon = !!button.querySelector(
      'svg path[d^="M11 11h2v2h-2"], svg path[d*="M1.99 12"], svg path[d*="S22.01 17.52 22.01 12"]'
    );
    if (!hasRoomMenuIcon) return false;

    if (button.getAttribute('aria-label')?.includes('보관함')) return false;
    if (button.getAttribute('aria-label')?.includes('채팅방 메뉴')) return false;
    if (button.closest('[data-testid="virtuoso-scroller"]')) return false;

    const header = DOM.header();
    if (header?.contains(button)) return true;

    const rect = button.getBoundingClientRect();
    return rect.top <= 120 && rect.right >= window.innerWidth - 180;
  }

  function findChatRoomSettingsButton() {
    if (isChatRoomSettingsButton(cachedRoomMenuButton)) return cachedRoomMenuButton;

    const header = DOM.header();
    const scope = header || document;
    const found = [...scope.querySelectorAll('button')].find(isChatRoomSettingsButton) || null;
    cachedRoomMenuButton = found;
    return found;
  }

  function syncRoomMenuHandleDot() {
    const handle = document.getElementById(ID.roomMenuHandle);
    if (!handle) return;
    const original = DOM.chatRoomSettingsButton();
    const hasDot = !!original?.querySelector('.bg-icon_brand, [class*="bg-icon_brand"]');
    handle.dataset.hasDot = hasDot ? '1' : '0';
  }

  function scoreRoomTopBar(el) {
    if (!el || el.tagName !== 'DIV') return -1;
    if (el.closest(`#${ID.panel}, #${ID.bottomModelPopup}, #${ID.roomMenuZone}, #${ID.chatListZone}`)) return -1;

    const r = crackUiEdgeRect(el);
    if (!r) return -1;

    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    if (r.top < -12 || r.top > 96) return -1;
    if (r.height < 38 || r.height > 62) return -1;
    if (r.width < Math.min(320, vw * 0.72)) return -1;
    if (r.left > 12) return -1;

    const cls = String(el.className || '');
    const txt = crackUiEdgeText(el).slice(0, 260);

    let score = 0;
    if (cls.includes('absolute')) score += 3;
    if (cls.includes('z-[5]') || cls.includes('z-\[5\]')) score += 2;
    if (cls.includes('left-0')) score += 2;
    if (cls.includes('w-full')) score += 2;
    if (cls.includes('h-12')) score += 2;
    if (cls.includes('px-5')) score += 1;
    if (cls.includes('justify-between')) score += 2;
    if (cls.includes('items-center')) score += 1;
    if (cls.includes('bg-bg_screen')) score += 2;
    if (cls.includes('border-b')) score += 1;
    if (cls.includes('transition-opacity')) score += 2;

    if (el.querySelector('button .line-clamp-1, button span[class*="line-clamp-1"]')) score += 3;
    if (DOM.chatRoomSettingsButton() && el.contains(DOM.chatRoomSettingsButton())) score += 5;
    if (el.querySelector('img[src*="model-icon"], img[alt*="챗"]')) score += 3;
    if (txt.includes('프로챗') || txt.includes('하이퍼챗') || txt.includes('슈퍼챗') || txt.includes('파워챗')) score += 3;
    if (txt.includes('Chasm Tools')) score += 1;
    if (el.querySelector('svg path[d*="M11 11h2v2h-2"]')) score += 4;

    return score;
  }

  function findRoomTopBar() {
    if (cachedRoomTopBar?.isConnected && scoreRoomTopBar(cachedRoomTopBar) >= 12) return cachedRoomTopBar;
    if (!crackUiIsChatRoute()) return null;

    const root = document.querySelector('main') || document;
    const candidates = [...root.querySelectorAll('div')];
    let best = null;
    let bestScore = -1;

    for (const el of candidates) {
      const score = scoreRoomTopBar(el);
      if (score > bestScore) {
        best = el;
        bestScore = score;
      }
    }

    cachedRoomTopBar = bestScore >= 12 ? best : null;
    if (cachedRoomTopBar) cachedRoomTopBar.dataset.crackUiRoomTopBar = '1';
    return cachedRoomTopBar;
  }

  function findRoomStatBar() {
    const topBar = findRoomTopBar();
    const group = topBar?.parentElement;
    if (!group) {
      cachedRoomStatBar = null;
      return null;
    }

    if (cachedRoomStatBar?.isConnected && cachedRoomStatBar.parentElement === group) {
      cachedRoomStatBar.dataset.crackUiRoomStatBar = '1';
      cachedRoomStatBar.dataset.crackUiStatBar = '1';
      return cachedRoomStatBar;
    }

    cachedRoomStatBar = null;

    for (const child of group.children) {
      if (!(child instanceof HTMLElement) || child === topBar) continue;
      const cls = String(child.className || '');
      if (!cls.includes('transition-transform') || !cls.includes('mt-12')) continue;
      if (!child.querySelector('[aria-roledescription="carousel"]')) continue;

      child.dataset.crackUiRoomStatBar = '1';
      child.dataset.crackUiStatBar = '1';
      cachedRoomStatBar = child;
      return child;
    }

    return null;
  }

  function releaseRoomTopBarHidden() {
    const bar = cachedRoomTopBar?.isConnected ? cachedRoomTopBar : DOM.roomTopBar();
    if (bar) delete bar.dataset.crackUiRoomTopBarHidden;
    document.documentElement.classList.remove(CLS.roomTopBarHidden);
  }

  function setRoomTopBarHidden(hidden) {
    const bar = DOM.roomTopBar();
    if (!bar) {
      releaseRoomTopBarHidden();
      return;
    }

    bar.dataset.crackUiRoomTopBar = '1';
    if (hidden && roomMenuHandle && crackUiIsChatRoute()) {
      bar.dataset.crackUiRoomTopBarHidden = '1';
      document.documentElement.classList.add(CLS.roomTopBarHidden);
    } else {
      releaseRoomTopBarHidden();
    }
  }

  function isChatComposerTarget(target) {
    const el = target?.nodeType === 1 ? target : target?.parentElement;
    if (!el) return false;
    if (el.closest?.(`#${ID.panel}, #${ID.bottomModelPopup}, #${ID.roomMenuZone}, #${ID.roomMenuHandle}`)) return false;

    const editable = el.closest?.('textarea, input, [contenteditable="true"], [role="textbox"]');
    if (!editable) return false;
    if (editable.closest?.('[data-crack-ui-room-panel="1"], [data-crack-ui-chat-list-panel="1"], [data-crack-ui-room-top-bar="1"]')) return false;
    if (isDirectChatComposerEditable(editable)) return true;

    const composer = DOM.composerEditable();
    return editable === composer || !!composer?.contains?.(editable) || !!editable.contains?.(composer);
  }

  function noteRoomTopBarInputInteraction(target) {
    if (!roomMenuHandle || !crackUiIsChatRoute()) return;
    if (!isChatComposerTarget(target)) return;

    lastRoomTopBarInputInteractionAt = Date.now();
    setRoomTopBarHidden(false);
  }

  function pulseRoomTopBarHidden() {
    if (Date.now() - lastRoomTopBarInputInteractionAt < 900) {
      setRoomTopBarHidden(false);
      return;
    }
    setRoomTopBarHidden(true);
  }

  function syncRoomTopBarVisibility() {
    const panel = DOM.roomPanel();
    if (roomMenuHandle && crackUiIsChatRoute() && panel && isRoomPanelOpen(panel)) {
      setRoomTopBarHidden(false);
    }
  }

  function scoreRoomPanel(el) {
    if (!el || el.tagName !== 'DIV') return -1;

    const r = crackUiEdgeRect(el);
    if (!r) return -1;

    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    if (r.height < 280) return -1;
    if (r.top < -16 || r.top > 120) return -1;
    if (r.right < vw - 12 && r.left < vw - 330) return -1;
    if (el.closest(`#${ID.panel}, #${ID.bottomModelPopup}`)) return -1;

    const cls = String(el.className || '');
    const txt = crackUiEdgeText(el).slice(0, 700);
    const cs = getComputedStyle(el);

    let score = 0;
    if (cls.includes('border-l')) score += 4;
    if (cls.includes('w-[260px]') || cls.includes('w-\[260px\]')) score += 5;
    if (cls.includes('right-0')) score += 3;
    if (cls.includes('transition-all')) score += 2;
    if (cs.position === 'absolute' || cs.position === 'fixed') score += 3;

    if (txt.includes('채팅방 설정')) score += 7;
    if (txt.includes('유저 노트')) score += 5;
    if (txt.includes('키보드 단축키')) score += 4;
    if (txt.includes('이미지 보관함')) score += 3;

    if (r.width >= 1 && r.width <= 300) score += 2;
    if (r.right >= vw - 6) score += 2;

    return score;
  }

  function findRoomPanel() {
    if (cachedRoomPanel?.isConnected && scoreRoomPanel(cachedRoomPanel) >= 12) return cachedRoomPanel;
    if (!crackUiIsChatRoute()) return null;

    const root = document.querySelector('main') || document;
    const candidates = [...root.querySelectorAll('div')];
    let best = null;
    let bestScore = -1;

    for (const el of candidates) {
      const score = scoreRoomPanel(el);
      if (score > bestScore) {
        best = el;
        bestScore = score;
      }
    }

    cachedRoomPanel = bestScore >= 12 ? best : null;
    return cachedRoomPanel;
  }

  function isRoomPanelOpen(panel = DOM.roomPanel()) {
    const r = crackUiEdgeRect(panel);
    if (!r) return false;

    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    return r.width > 120 && r.left < vw - 100;
  }

  function isTargetInsideRoomPanel(target) {
    const el = target?.nodeType === 1 ? target : target?.parentElement;
    if (!(el instanceof Element)) return false;

    const cached = cachedRoomPanel?.isConnected ? cachedRoomPanel : null;
    if (cached?.contains(el)) return true;

    // The panel locator can temporarily cache an inner shell while Crack is
    // animating/re-rendering the mobile drawer. Check the touched element's
    // ancestors too so a valid panel interaction is never treated as an
    // outside click and immediately auto-closed.
    for (let node = el; node && node !== document.body; node = node.parentElement) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.dataset.crackUiRoomPanel === '1' || scoreRoomPanel(node) >= 12) {
        cachedRoomPanel = node;
        node.dataset.crackUiRoomPanel = '1';
        return true;
      }
    }

    return false;
  }

  function findRoomPanelToggle() {
    if (cachedRoomPanelToggle?.isConnected) return cachedRoomPanelToggle;
    if (!crackUiIsChatRoute()) return null;

    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const root = document.querySelector('main') || document;
    const buttons = [...root.querySelectorAll('button, [role="button"]')];

    let best = null;
    let bestScore = -1;

    for (const btn of buttons) {
      if (btn.id === ID.roomMenuHandle || btn.id === ID.bottomModelButton) continue;
      if (document.getElementById(ID.panel)?.contains(btn)) continue;
      if (document.getElementById(ID.roomMenuZone)?.contains(btn)) continue;
      if (btn.closest('[data-testid="virtuoso-scroller"]')) continue;

      const r = crackUiEdgeRect(btn);
      if (!r) continue;
      if (r.width < 20 || r.width > 56 || r.height < 20 || r.height > 56) continue;
      if (r.top < -8 || r.top > 132) continue;
      if (r.right < vw - 110) continue;

      const cls = String(btn.className || '');
      const txt = crackUiEdgeText(btn);
      const parentText = crackUiEdgeText(btn.parentElement || btn).slice(0, 120);

      let score = 0;
      if (cls.includes('relative')) score += 1;
      if (cls.includes('inline-flex')) score += 2;
      if (cls.includes('justify-center')) score += 1;
      if (!txt) score += 2;
      if (r.right > vw - 10 && r.right < vw + 8) score += 4;
      if (r.right > vw - 60) score += 3;
      if (Math.abs(r.width - 30) <= 12) score += 2;
      if (btn.querySelector('svg')) score += 2;

      if (parentText.includes('프로챗') || parentText.includes('하이퍼챗') || parentText.includes('슈퍼챗') || parentText.includes('파워챗')) score += 3;
      if (parentText.includes('채팅방 설정')) score += 4;

      if (score > bestScore) {
        bestScore = score;
        best = btn;
      }
    }

    cachedRoomPanelToggle = bestScore >= 6 ? best : null;
    return cachedRoomPanelToggle;
  }

  function getRoomPanelToggleForActivation() {
    if (isTouchLikeDevice()) return DOM.chatRoomSettingsButton() || DOM.roomToggle();
    return DOM.roomToggle() || DOM.chatRoomSettingsButton();
  }

  function getRoomPanelToggleOpenState(toggle) {
    if (!toggle) return null;
    const expanded = toggle.getAttribute?.('aria-expanded');
    if (expanded === 'true') return true;
    if (expanded === 'false') return false;
    const state = String(toggle.dataset?.state || '').toLowerCase();
    if (state === 'open') return true;
    if (state === 'closed') return false;
    return null;
  }

  function clearRoomPanelToggleVerification({ invalidate = false } = {}) {
    if (invalidate) roomPanelToggleRequestSeq += 1;
    if (roomPanelToggleVerifyTimer) {
      clearTimeout(roomPanelToggleVerifyTimer);
      roomPanelToggleVerifyTimer = null;
    }
  }

  function clickRoomPanelToggle(want, reason = '') {
    clearRoomPanelToggleVerification({ invalidate: true });
    const requestSeq = roomPanelToggleRequestSeq;
    const panel = DOM.roomPanel();
    const open = panel ? isRoomPanelOpen(panel) : false;
    if (open === want) {
      lastRoomPanelToggleAttempt = {
        requestSeq,
        want,
        reason,
        skipped: 'already-matched',
        touchLike: isTouchLikeDevice(),
        at: Date.now(),
      };
      return true;
    }

    const now = Date.now();
    if (isTouchLikeDevice() && want) {
      // Ignore delayed/cascaded outside-click handlers while the native drawer
      // is mounting and sliding in. The mobile utility uses the same one-way
      // open approach instead of trying to toggle again during this window.
      roomPanelTouchOpenGuardUntil = Math.max(roomPanelTouchOpenGuardUntil, now + 900);
    }

    if (
      isTouchLikeDevice() &&
      !want &&
      (reason === 'auto-close' || reason === 'boot') &&
      now < roomPanelTouchOpenGuardUntil
    ) {
      lastRoomPanelToggleAttempt = {
        requestSeq,
        want,
        reason,
        skipped: 'touch-open-guard',
        touchLike: true,
        at: now,
      };
      return false;
    }

    if (now - lastRoomPanelClickAt < 180) {
      lastRoomPanelToggleAttempt = {
        requestSeq,
        want,
        reason,
        skipped: 'throttled',
        touchLike: isTouchLikeDevice(),
        at: now,
      };
      return false;
    }
    lastRoomPanelClickAt = now;

    const toggle = getRoomPanelToggleForActivation();
    if (!toggle) {
      lastRoomPanelToggleAttempt = {
        requestSeq,
        want,
        reason,
        error: 'toggle-not-found',
        touchLike: isTouchLikeDevice(),
        at: now,
      };
      return false;
    }

    if (want) setRoomTopBarHidden(false);

    try {
      const method = dispatchRoomPanelToggleActivation(toggle, reason || 'room-panel-toggle');
      lastRoomPanelToggleAttempt = {
        requestSeq,
        want,
        reason,
        method: method || 'failed',
        toggle: getElementDebugInfo(toggle),
        touchLike: isTouchLikeDevice(),
        openBefore: open,
        at: now,
      };

      if (!method && !isTouchLikeDevice() && typeof toggle.click === 'function') {
        toggle.click();
        lastRoomPanelToggleAttempt.method = 'native-click-fallback';
      }

      if (isTouchLikeDevice()) {
        roomPanelToggleVerifyTimer = setTimeout(() => {
          roomPanelToggleVerifyTimer = null;
          if (requestSeq !== roomPanelToggleRequestSeq) return;

          const afterPanel = DOM.roomPanel();
          const openAfter = afterPanel ? isRoomPanelOpen(afterPanel) : false;
          const toggleOpenAfter = getRoomPanelToggleOpenState(toggle);
          if (lastRoomPanelToggleAttempt?.requestSeq === requestSeq) {
            lastRoomPanelToggleAttempt.openAfter = openAfter;
            lastRoomPanelToggleAttempt.toggleOpenAfter = toggleOpenAfter;
          }

          // Mobile drawers may report stale geometry/aria state mid-animation.
          // Verification is diagnostic only: a second activation here can turn
          // a successfully opened native drawer straight back off.
        }, 300);
      }

      if (!want) setTimeout(() => pulseRoomTopBarHidden(), 180);
      return !!method || !isTouchLikeDevice();
    } catch (error) {
      lastRoomPanelToggleAttempt = {
        requestSeq,
        want,
        reason,
        error: String(error?.message || error || 'unknown'),
        touchLike: isTouchLikeDevice(),
        at: Date.now(),
      };
      return false;
    }
  }

  function clearRoomPanelCloseTimer() {
    if (roomPanelCloseTimer) {
      clearTimeout(roomPanelCloseTimer);
      roomPanelCloseTimer = null;
    }
  }

  function scheduleRoomPanelClose(delay = 150) {
    clearRoomPanelCloseTimer();
    roomPanelCloseTimer = setTimeout(() => {
      roomPanelCloseTimer = null;
      if (!roomMenuHandle || !crackUiIsChatRoute()) return;

      if (isTouchLikeDevice() && Date.now() - lastRoomMenuNativeButtonClickAt < 760) return;

      const panel = DOM.roomPanel();
      const zone = document.getElementById(ID.roomMenuZone);
      const hovered = panel?.matches?.(':hover') || zone?.matches?.(':hover');
      if (hovered && !isTouchLikeDevice()) return;
      if (isTouchLikeDevice() && Date.now() < roomPanelTouchOpenGuardUntil) return;

      roomMenuReveal = false;
      updateRoomMenuRevealClass();
      clickRoomPanelToggle(false, 'auto-close');
      setTimeout(() => pulseRoomTopBarHidden(), 220);
    }, delay);
  }

  function bindRoomPanelHover(panel) {
    if (!panel || panel.dataset.crackUiRoomPanelHoverBound === '1') return;
    panel.dataset.crackUiRoomPanelHoverBound = '1';

    panel.addEventListener('mouseenter', () => {
      if (!roomMenuHandle || isTouchLikeDevice()) return;
      roomMenuReveal = true;
      updateRoomMenuRevealClass();
      setRoomTopBarHidden(false);
      clearRoomPanelCloseTimer();
    }, { passive: true });

    panel.addEventListener('mouseleave', () => {
      if (!roomMenuHandle || isTouchLikeDevice()) return;
      scheduleRoomPanelClose(150);
    }, { passive: true });
  }

  function openChatRoomSettingsMenu(reason = 'handle') {
    roomMenuReveal = true;
    updateRoomMenuRevealClass();
    setRoomTopBarHidden(false);
    clearRoomPanelCloseTimer();
    return clickRoomPanelToggle(true, reason);
  }

  function bindRoomMenuHandle(handle) {
    if (!handle || handle.dataset.crackUiBound === '1') return;
    handle.dataset.crackUiBound = '1';

    const openFromHandle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();

      const now = Date.now();
      if (now - lastRoomMenuHandleOpenAt < 650) return;
      lastRoomMenuHandleOpenAt = now;

      openChatRoomSettingsMenu();
    };

    // A tap still produces click, while a vertical drag/scroll does not.
    // Opening on pointerdown made scrolling from the edge open the menu accidentally.
    handle.addEventListener('click', openFromHandle, { passive: false });
  }

  function ensureRoomMenuHandle() {
    let zone = document.getElementById(ID.roomMenuZone);

    if (!roomMenuHandle || !crackUiIsChatRoute()) {
      roomMenuReveal = false;
      clearRoomPanelCloseTimer();
      clearRoomPanelToggleVerification({ invalidate: true });
      updateRoomMenuRevealClass();
      zone?.remove();
      setRoomTopBarHidden(false);
      cachedRoomMenuButton = null;
      cachedRoomPanel = null;
      cachedRoomPanelToggle = null;
      cachedRoomTopBar = null;
      cachedRoomStatBar = null;
      return;
    }

    if (!zone) {
      zone = document.createElement('div');
      zone.id = ID.roomMenuZone;
      zone.addEventListener('mouseenter', () => {
        if (isTouchLikeDevice()) return;
        roomMenuReveal = true;
        updateRoomMenuRevealClass();
        clearRoomPanelCloseTimer();
        clickRoomPanelToggle(true, 'edge-enter');
        setTimeout(() => { const panel = DOM.roomPanel(); if (panel) bindRoomPanelHover(panel); }, 80);
      }, { passive: true });
      zone.addEventListener('mouseleave', () => {
        if (isTouchLikeDevice()) return;
        scheduleRoomPanelClose(150);
      }, { passive: true });
      document.body.appendChild(zone);
    }

    const handleEnabled = !isTouchLikeDevice() || menuAssistModeHasHandle(roomMenuAssistMode);
    zone.dataset.crackUiHandleEnabled = handleEnabled ? '1' : '0';

    let handle = document.getElementById(ID.roomMenuHandle);
    if (handleEnabled) {
      if (!handle) {
        handle = document.createElement('div');
        handle.id = ID.roomMenuHandle;
        handle.setAttribute('role', 'button');
        handle.setAttribute('aria-label', '채팅방 설정 열기');
        handle.title = '채팅방 설정 열기';
        zone.appendChild(handle);
      } else if (handle.parentElement !== zone) {
        zone.appendChild(handle);
      }
      bindRoomMenuHandle(handle);
      syncRoomMenuHandleDot();
    } else {
      handle?.remove();
    }

    const panel = DOM.roomPanel();
    if (panel) {
      panel.setAttribute('data-crack-ui-room-panel', '1');
      bindRoomPanelHover(panel);
    }

    DOM.roomTopBar();
    findRoomStatBar();
    syncRoomTopBarVisibility();

    if (lastRoomPanelBootCloseHref !== location.href) {
      lastRoomPanelBootCloseHref = location.href;
      setTimeout(() => {
        if (isTouchLikeDevice() && Date.now() - lastRoomMenuNativeButtonClickAt < 1000) return;
        if (roomMenuHandle && !document.getElementById(ID.roomMenuZone)?.matches(':hover')) {
          clickRoomPanelToggle(false, 'boot');
          setTimeout(() => pulseRoomTopBarHidden(), 220);
        }
      }, 260);
    }

    updateRoomMenuRevealClass();
  }


  function crackUiEdgeRect(el) {
    if (!el || !el.isConnected) return null;
    try {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    } catch {
      return null;
    }
  }

  function crackUiEdgeText(el) {
    return String(el?.innerText || el?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function crackUiIsChatRoute() {
    return /^\/stories\/[^/]+\/episodes\/[^/]+/.test(location.pathname);
  }

  function crackUiIsChatListAutoHideRoute() {
    const path = location.pathname;
    return (
      path === '/' ||
      /^\/stories\/[^/]+\/episodes\/[^/]+/.test(path) ||
      /^\/u\/[^/]+\/c\/[^/]+/.test(path) ||
      /^\/characters\/[^/]+\/chats\/[^/]+/.test(path)
    );
  }

  function findChatListPanel() {
    if (!isDesktopChatListAutoHideViewport()) return null;
    if (cachedChatListPanel?.isConnected && crackUiIsChatListPanel(cachedChatListPanel)) return cachedChatListPanel;
    if (!crackUiIsChatListAutoHideRoute()) return null;

    const candidates = [...document.querySelectorAll('main div, #__next div, body div')];
    let best = null;
    let bestScore = -1;

    for (const el of candidates) {
      const score = scoreChatListPanel(el);
      if (score > bestScore) {
        best = el;
        bestScore = score;
      }
    }

    cachedChatListPanel = bestScore >= 12 ? best : null;
    return cachedChatListPanel;
  }

  function crackUiIsChatListPanel(el) {
    return scoreChatListPanel(el) >= 10;
  }

  // =====================================================
  // Feature: chat list auto hide
  // =====================================================

  function scoreChatListPanel(el) {
    if (!el || el.tagName !== 'DIV') return -1;
    if (!isDesktopChatListAutoHideViewport() && !isTabletLikeViewport()) return -1;
    if (el.closest(`#${ID.panel}, #${ID.bottomModelPopup}, #${ID.roomMenuZone}, #${ID.chatListZone}`)) return -1;
    if (el.getAttribute('role') === 'dialog' || el.closest('[data-radix-popper-content-wrapper]')) return -1;

    const r = crackUiEdgeRect(el);
    if (!r) return -1;
    if (r.height < 280) return -1;
    if (r.top < -16 || r.top > 112) return -1;

    const txt = crackUiEdgeText(el).slice(0, 700);
    const cls = String(el.className || '');
    const hasVirtuoso = !!el.querySelector('[data-testid="virtuoso-scroller"], [data-virtuoso-scroller="true"]');
    const hasTabs = !!el.querySelector('button[role="tab"], [role="tablist"]');
    const hasEpisodeTabs = txt.includes('에피소드') && txt.includes('파티챗');
    const hasStorageList = txt.includes('보관함') && /\d+개/.test(txt);
    const hasWidthShellClass = cls.includes('transition-[width]') || cls.includes('bg-surface_tertiary') || cls.includes('md:block') || cls.includes('w-[260px]');
    const forcedPanel = el.dataset.crackUiChatListPanel === '1';
    const strongMarker = forcedPanel || hasWidthShellClass || hasVirtuoso || (hasTabs && hasEpisodeTabs) || (hasStorageList && hasEpisodeTabs);

    if (!strongMarker && (r.width < 210 || r.width > 292)) return -1;
    if (strongMarker && (r.width < 0 || r.width > 292)) return -1;

    const nearLeftEdge = r.left <= 80 && r.left >= -340;
    const collapsedAtLeftEdge = strongMarker && r.width <= 80 && r.left <= 32 && r.right <= 112 && r.right >= -16;
    if (!nearLeftEdge && !collapsedAtLeftEdge) return -1;

    let score = 0;
    if (txt.includes('보관함')) score += 4;
    if (txt.includes('파티챗')) score += 4;
    if (txt.includes('에피소드')) score += 3;
    if (hasVirtuoso) score += 8;
    if (hasTabs) score += 3;
    if (hasEpisodeTabs) score += 4;
    if (hasStorageList) score += 4;
    if (hasWidthShellClass) score += 10;
    if (forcedPanel) score += 12;
    if (strongMarker && r.width <= 80) score += 6;

    return score;
  }

  function scoreDesktopChatListToggle(button) {
    if (!button || (!isDesktopChatListAutoHideViewport() && !isTabletLikeViewport())) return -1;
    if (button.id === ID.chatListHandle || button.id === ID.gearDesktop || button.id === ID.gearMobile || button.id === ID.bottomModelButton) return -1;
    if (button.closest?.(`#${ID.panel}, #${ID.roomMenuZone}, #${ID.bottomModelPopup}, [data-testid="virtuoso-scroller"]`)) return -1;

    const r = crackUiEdgeRect(button);
    if (!r) return -1;
    if (r.width < 12 || r.width > 58 || r.height < 12 || r.height > 58) return -1;

    const hasCrackToggleIcon = !!button.querySelector('#toggle_bar, #toggle_open_arrow, #toggle_close_arrow');
    if (!hasCrackToggleIcon) return -1;

    const ariaLabel = String(button.getAttribute('aria-label') || '');
    const txt = crackUiEdgeText(button);
    if (/보관함|만들기|전체보기|메뉴|에피소드|파티챗/.test(`${ariaLabel} ${txt}`)) return -1;

    const cls = `${String(button.className || '')} ${String(button.parentElement?.className || '')}`;
    let score = 18;
    if (cls.includes('md:flex')) score += 5;
    if (cls.includes('absolute')) score += 4;
    if (cls.includes('transition-[left]')) score += 6;
    if (cls.includes('z-docked')) score += 3;
    if (r.left >= -16 && r.left <= 300) score += 6;
    if (r.top > 44 && r.top < window.innerHeight - 32) score += 2;
    return score;
  }

  function findChatListToggle() {
    if (!isDesktopChatListAutoHideViewport()) return null;
    if (cachedChatListToggle?.isConnected && scoreDesktopChatListToggle(cachedChatListToggle) >= 24) return cachedChatListToggle;

    let best = null;
    let bestScore = -1;
    for (const btn of document.querySelectorAll('button')) {
      const score = scoreDesktopChatListToggle(btn);
      if (score > bestScore) {
        best = btn;
        bestScore = score;
      }
    }

    cachedChatListToggle = bestScore >= 24 ? best : null;
    return cachedChatListToggle;
  }

  function findTabletChatListPanel() {
    if (!isTabletLikeViewport()) return null;
    if (cachedChatListPanel?.isConnected && crackUiIsChatListPanel(cachedChatListPanel)) return cachedChatListPanel;
    if (!crackUiIsChatListAutoHideRoute()) return null;

    let best = null;
    let bestScore = -1;
    for (const el of document.querySelectorAll('main div, #__next div, body div')) {
      const score = scoreChatListPanel(el);
      if (score > bestScore) {
        best = el;
        bestScore = score;
      }
    }

    cachedChatListPanel = bestScore >= 12 ? best : null;
    return cachedChatListPanel;
  }

  function findTabletChatListToggle() {
    if (!isTabletLikeViewport()) return null;
    if (cachedChatListToggle?.isConnected && scoreDesktopChatListToggle(cachedChatListToggle) >= 24) return cachedChatListToggle;

    let best = null;
    let bestScore = -1;
    for (const button of document.querySelectorAll('button')) {
      const score = scoreDesktopChatListToggle(button);
      if (score > bestScore) {
        best = button;
        bestScore = score;
      }
    }

    cachedChatListToggle = bestScore >= 24 ? best : null;
    return cachedChatListToggle;
  }

  function scoreMobileChatListToggle(button) {
    if (!button || !isPhoneLikeViewport()) return -1;
    if (button.id === ID.chatListHandle || button.id === ID.gearDesktop || button.id === ID.gearMobile || button.id === ID.bottomModelButton) return -1;
    if (button.closest?.(`#${ID.panel}, #${ID.chatListZone}, #${ID.roomMenuZone}, #${ID.bottomModelPopup}`)) return -1;

    const r = crackUiEdgeRect(button);
    if (!r) return -1;
    if (r.width < 28 || r.width > 58 || r.height < 28 || r.height > 58) return -1;

    const svg = button.querySelector('svg');
    if (!svg) return -1;

    const classes = `${String(button.className || '')} ${String(button.parentElement?.className || '')}`;
    const text = crackUiEdgeText(button);
    const pathText = [...button.querySelectorAll('path')]
      .map((path) => String(path.getAttribute('d') || ''))
      .join(' ')
      .replace(/\s+/g, ' ');

    let score = 0;
    if (classes.includes('md:hidden')) score += 9;
    if (classes.includes('size-10')) score += 4;
    if (classes.includes('inline-flex')) score += 2;
    if (!text) score += 1;
    if (r.left <= 92 && r.top <= 92) score += 7;
    if (r.left <= 140) score += 2;
    if (pathText.includes('M21 6.4H3V4.8h18') || (pathText.includes('M21 6.4') && pathText.includes('M3 19.4h18'))) score += 14;

    return score;
  }

  function findMobileChatListToggle() {
    if (!isPhoneLikeViewport()) return null;
    if (cachedMobileChatListToggle?.isConnected && scoreMobileChatListToggle(cachedMobileChatListToggle) >= 12) return cachedMobileChatListToggle;

    let best = null;
    let bestScore = -1;
    for (const button of document.querySelectorAll('button')) {
      const score = scoreMobileChatListToggle(button);
      if (score > bestScore) {
        best = button;
        bestScore = score;
      }
    }

    cachedMobileChatListToggle = bestScore >= 12 ? best : null;
    return cachedMobileChatListToggle;
  }

  function isFullscreenButtonRoute() {
    const path = String(window.location.pathname || '');
    return path.includes('/stories/') && path.includes('/episodes/') ||
      path.includes('/characters/') && path.includes('/chats/');
  }

  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function findFullscreenToolbar() {
    const originalToolbar = document.querySelector('.flex.items-center.space-x-2');
    if (originalToolbar) return originalToolbar;

    const externalAnchors = ['cap-toolbar-btn', 'txt-palette-toolbar-btn', 'hlp-toolbar-btn'];
    for (const id of externalAnchors) {
      const anchor = document.getElementById(id);
      if (anchor?.parentElement) return anchor.parentElement;
    }

    const recommendButton = [...document.querySelectorAll('button')].find((button) =>
      String(button.textContent || '').includes('추천답변')
    );
    if (recommendButton) {
      return recommendButton.closest('.flex.items-center.space-x-2') || recommendButton.parentElement;
    }

    return null;
  }

  function getFullscreenButtonIcon(active) {
    const stateMark = active
      ? '<path d="m8.4 12.4 3.6 3.6 3.6-3.6" stroke-width="1.85" />'
      : '<path d="m8.4 15.6 3.6-3.6 3.6 3.6" stroke-width="1.85" />';

    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3.25" y="3.5" width="17.5" height="17" rx="2.25" stroke-width="1.15" />
        <path d="M3.25 8.25h17.5" stroke-width="1.15" />
        ${stateMark}
      </svg>
    `;
  }

  function updateFullscreenButtonUi() {
    const button = document.getElementById(ID.fullscreenButton);
    if (!button) return;

    const active = !!getFullscreenElement();
    const nextState = active ? '1' : '0';
    const label = active ? '전체화면 종료' : '전체화면 시작';
    const span = button.querySelector('span');
    const stateChanged = button.dataset.active !== nextState;

    // Replacing innerHTML creates a childList mutation. Doing that on every init
    // feeds the global observer and can keep scheduleInit running indefinitely.
    if (span && (stateChanged || !span.firstElementChild)) {
      span.innerHTML = getFullscreenButtonIcon(active);
    }
    if (stateChanged) button.dataset.active = nextState;
    if (button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
    if (button.getAttribute('title') !== label) button.setAttribute('title', label);
  }

  async function toggleFullscreen() {
    try {
      const active = getFullscreenElement();
      if (active) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.webkitCancelFullScreen;
        if (typeof exit !== 'function') throw new Error('이 브라우저는 전체화면 종료를 지원하지 않습니다.');
        await exit.call(document);
      } else {
        const root = document.documentElement;
        const request = root.requestFullscreen || root.webkitRequestFullscreen || root.webkitRequestFullScreen;
        if (typeof request !== 'function') throw new Error('이 브라우저는 페이지 전체화면을 지원하지 않습니다.');

        if (request === root.requestFullscreen) {
          await request.call(root, { navigationUI: 'hide' });
        } else {
          await request.call(root);
        }
      }
    } catch (error) {
      reportCrackUiError('fullscreen-toggle', error);
    } finally {
      updateFullscreenButtonUi();
    }
  }

  function removeFullscreenButton() {
    document.getElementById(ID.fullscreenButton)?.remove();
  }

  function ensureFullscreenButton() {
    if (isIosDevice() || !fullscreenButtonEnabled || !isFullscreenButtonRoute()) {
      removeFullscreenButton();
      return;
    }

    const existingButton = document.getElementById(ID.fullscreenButton);
    if (existingButton?.isConnected) {
      updateFullscreenButtonUi();
      return;
    }

    const container = findFullscreenToolbar();
    if (!container) return;

    let button = existingButton;
    if (!button) {
      button = document.createElement('button');
      button.id = ID.fullscreenButton;
      button.type = 'button';
      button.className = 'relative inline-flex items-center gap-1 rounded-full text-sm font-medium transition-colors border border-border bg-card text-line-gray-1 hover:bg-secondary p-0 size-7 justify-center ml-1';
      button.innerHTML = `<span aria-hidden="true">${getFullscreenButtonIcon(false)}</span>`;
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFullscreen();
      });
    }

    if (button.parentElement !== container) {
      const externalButtons = ['cap-toolbar-btn', 'txt-palette-toolbar-btn', 'hlp-toolbar-btn']
        .map((id) => document.getElementById(id))
        .filter((element) => element?.parentElement === container);
      const recommendButton = [...container.querySelectorAll('button')]
        .find((element) => element !== button && String(element.textContent || '').includes('추천답변')) || null;

      if (externalButtons.length) {
        const lastExternalButton = externalButtons
          .sort((a, b) => [...container.children].indexOf(a) - [...container.children].indexOf(b))
          .at(-1);
        lastExternalButton.after(button);
      } else if (recommendButton) {
        container.insertBefore(button, recommendButton);
      } else {
        container.appendChild(button);
      }
    }

    updateFullscreenButtonUi();
  }

  // =====================================================
  // DOM: locator facade / debug snapshot / cache reset
  // =====================================================

  const DOM = {
    header: () => findHeader(),
    statBars: () => {
      const bars = [...document.querySelectorAll('[data-crack-ui-stat-bar="1"]')];
      const roomStatBar = findRoomStatBar();
      if (roomStatBar && !bars.includes(roomStatBar)) bars.push(roomStatBar);
      return bars;
    },
    modelButton: () => findOriginalModelButton(),
    modelMenu: () => getOfficialModelMenu(),
    sendButton: () => findBottomSendButton(),
    composerEditable: () => findChatComposerEditable(),
    chatRoomSettingsButton: () => findChatRoomSettingsButton(),
    roomTopBar: () => findRoomTopBar(),
    roomPanel: () => findRoomPanel(),
    roomToggle: () => findRoomPanelToggle(),
    chatListPanel: () => findChatListPanel(),
    chatListToggle: (panel) => findChatListToggle(panel),
    mobileChatListToggle: () => findMobileChatListToggle(),
    mobileChatListPopover: () => getMobileChatListPopover(),
    situationImageButtons: () => findSituationImageButtons(),
    messageGroups: () => findMessageGroups(),
    novelAssistantMessages: () => findNovelAssistantMessageGroups(),
    loreEntryButton: () => findLoreEntryButton(),
    loreRoomTopBar: () => findLoreRoomTopBar(),
    fullscreenToolbar: () => findFullscreenToolbar(),
    fullscreenButton: () => document.getElementById(ID.fullscreenButton),
  };

  const DOM_LOCATORS = {
    header: DOM.header,
    statBars: DOM.statBars,
    originalModelButton: DOM.modelButton,
    officialModelMenu: DOM.modelMenu,
    bottomSendButton: DOM.sendButton,
    chatComposerEditable: DOM.composerEditable,
    chatRoomSettingsButton: DOM.chatRoomSettingsButton,
    roomTopBar: DOM.roomTopBar,
    roomPanel: DOM.roomPanel,
    roomPanelToggle: DOM.roomToggle,
    chatListPanel: DOM.chatListPanel,
    chatListToggle: DOM.chatListToggle,
    mobileChatListToggle: DOM.mobileChatListToggle,
    mobileChatListPopover: DOM.mobileChatListPopover,
    situationImageButtons: DOM.situationImageButtons,
    messageGroups: DOM.messageGroups,
    novelAssistantMessages: DOM.novelAssistantMessages,
    loreEntryButton: DOM.loreEntryButton,
    loreRoomTopBar: DOM.loreRoomTopBar,
    fullscreenToolbar: DOM.fullscreenToolbar,
    fullscreenButton: DOM.fullscreenButton,
  };

  function getDomLocatorDebugSnapshot() {
    const snapshot = {};

    for (const [name, locate] of Object.entries(DOM_LOCATORS)) {
      try {
        const result = locate();
        if (Array.isArray(result)) {
          snapshot[name] = {
            found: result.length > 0,
            count: result.length,
            first: getElementDebugInfo(result[0]),
          };
        } else {
          snapshot[name] = {
            found: !!result,
            element: getElementDebugInfo(result),
          };
        }
      } catch (error) {
        snapshot[name] = {
          found: false,
          error: String(error?.message || error),
        };
      }
    }

    return snapshot;
  }

  function resetDomLocatorCache() {
    cachedHeader = null;
    cachedBottomSendButton = null;
    cachedComposerEditable = null;
    cachedOriginalModelButton = null;
    cachedRoomMenuButton = null;
    cachedChatListPanel = null;
    cachedChatListToggle = null;
    cachedMobileChatListToggle = null;
    cachedRoomPanel = null;
    cachedRoomPanelToggle = null;
    cachedRoomTopBar = null;
    cachedRoomStatBar = null;
  }

  function isCrackUiWidthControlledChatListPanel(panel) {
    if (!panel || !isDesktopChatListAutoHideViewport()) return false;
    if (panel.getAttribute('role') === 'dialog' || panel.closest('[data-radix-popper-content-wrapper]')) return false;
    const cls = String(panel.className || '');
    return (
      panel.dataset.crackUiChatListPanel === '1' ||
      cls.includes('transition-[width]') ||
      cls.includes('bg-surface_tertiary') ||
      cls.includes('w-[260px]')
    ) && !!panel.querySelector?.('[data-testid="virtuoso-scroller"], [role="tablist"]');
  }

  function setChatListPanelForcedOpen(panel, want) {
    if (!isDesktopChatListAutoHideViewport() || !panel) return false;
    if (panel.getAttribute('role') === 'dialog' || panel.closest('[data-radix-popper-content-wrapper]')) return false;

    panel.dataset.crackUiChatListPanel = '1';
    panel.dataset.crackUiChatListForced = want ? 'open' : 'closed';
    const width = want ? '260px' : '0px';

    try {
      panel.style.setProperty('width', width, 'important');
      panel.style.setProperty('min-width', width, 'important');
      panel.style.setProperty('max-width', width, 'important');
      panel.style.setProperty('flex-basis', width, 'important');
      panel.style.setProperty('overflow', 'hidden', 'important');
      panel.style.setProperty('pointer-events', want ? 'auto' : 'none', 'important');
      if (!want) panel.style.setProperty('border-right-width', '0px', 'important');
      else panel.style.removeProperty('border-right-width');
    } catch {
    }

    return true;
  }

  function releaseChatListPanelForcedOpen(panel = cachedChatListPanel) {
    if (!panel) return false;
    try {
      delete panel.dataset.crackUiChatListForced;
      panel.style.removeProperty('width');
      panel.style.removeProperty('min-width');
      panel.style.removeProperty('max-width');
      panel.style.removeProperty('flex-basis');
      panel.style.removeProperty('overflow');
      panel.style.removeProperty('pointer-events');
      panel.style.removeProperty('border-right-width');
    } catch {
    }
    return true;
  }



  function getMobileChatListPopover() {
    if (!isPhoneLikeViewport()) return null;

    const candidates = document.querySelectorAll('[data-radix-popper-content-wrapper] [role="dialog"], [role="dialog"][data-state], [data-side][data-state]');
    for (const panel of candidates) {
      if (!(panel instanceof HTMLElement)) continue;
      const dataState = String(panel.getAttribute('data-state') || '');
      const cls = String(panel.className || '');
      const txt = crackUiEdgeText(panel).slice(0, 500);
      const hasList = !!panel.querySelector?.('[data-testid="virtuoso-scroller"], [data-virtuoso-scroller="true"], [role="tablist"]');
      const looksLikeMobileChatList =
        panel.getAttribute('role') === 'dialog' &&
        dataState === 'open' &&
        (cls.includes('md:hidden') || !!panel.closest('[data-radix-popper-content-wrapper]')) &&
        hasList &&
        txt.includes('에피소드') &&
        (txt.includes('보관함') || txt.includes('파티챗'));
      if (looksLikeMobileChatList) return panel;
    }

    return null;
  }

  function forceMobileChatListPopoverLayout() {
    // Phone chat list is native Crack UI. Do not touch width, overflow, pointer-events, or auto-close.
    // Only compensate the header-sized bottom gap caused by hidden global header + native 100dvh - 56px height.
    if (!isPhoneLikeViewport() || !autoHideHeader) {
      document.documentElement.classList.remove(CLS.chatListMobileHeaderGapCompensated);
      return false;
    }

    const panel = DOM.mobileChatListPopover();
    if (!panel) {
      document.documentElement.classList.remove(CLS.chatListMobileHeaderGapCompensated);
      return false;
    }

    try {
      const top = Math.max(0, Math.round(panel.getBoundingClientRect().top || 0));
      const viewportHeight = Math.round(window.innerHeight || document.documentElement.clientHeight || 0);
      const targetHeight = viewportHeight ? Math.max(320, viewportHeight - top) : 0;

      if (targetHeight) {
        panel.style.setProperty('height', `${targetHeight}px`, 'important');
        panel.style.setProperty('max-height', `${targetHeight}px`, 'important');
      } else {
        panel.style.setProperty('height', '100dvh', 'important');
        panel.style.setProperty('max-height', '100dvh', 'important');
      }

      mobileChatListCleanupPending = true;
      document.documentElement.classList.add(CLS.chatListMobileHeaderGapCompensated);
      return true;
    } catch {
      return false;
    }
  }

  function scheduleMobileChatListPopoverLayoutSettle() {
    // Keep phone popover native; only settle the height compensation right after the proxy click.
    if (!isPhoneLikeViewport()) return;
    for (const delay of [0, 16, 48, 120, 260, 520]) {
      setTimeout(() => {
        markMobileChatListOpenState();
        forceMobileChatListPopoverLayout();
      }, delay);
    }
  }


  function markMobileChatListOpenState() {
    const root = document.documentElement;

    // The proxy feature is the only reason to inspect the native mobile list dialog.
    // When it is off, clear our state without repeatedly scanning every open dialog.
    if (!chatListAutoHide || !isPhoneLikeViewport()) {
      root.classList.remove(CLS.chatListMobilePopoverOpen);
      root.classList.remove(CLS.chatListMobileHeaderGapCompensated);
      return false;
    }

    const open = !!DOM.mobileChatListPopover();
    root.classList.toggle(CLS.chatListMobilePopoverOpen, open);
    if (open) mobileChatListCleanupPending = true;
    else root.classList.remove(CLS.chatListMobileHeaderGapCompensated);
    return open;
  }

  function releaseMobileChatListPopoverForcedStyles() {
    const root = document.documentElement;
    const hasManagedState =
      root.classList.contains(CLS.chatListMobilePopoverOpen) ||
      root.classList.contains(CLS.chatListMobileHeaderGapCompensated);

    // Run once at boot for legacy cleanup, and again only after this feature has
    // actually managed a mobile popover. Avoid a full dialog/text scan every init.
    if (!mobileChatListCleanupPending && !hasManagedState) return false;

    const mobilePopover = DOM.mobileChatListPopover();
    root.classList.toggle(CLS.chatListMobilePopoverOpen, !!mobilePopover);
    if (!mobilePopover) root.classList.remove(CLS.chatListMobileHeaderGapCompensated);
    // Cleanup stale markers/styles from 2.0.20~2.0.24 without changing native Crack popover layout.
    for (const panel of document.querySelectorAll('[data-crack-ui-mobile-chat-list-popover="1"], [data-crack-ui-chat-list-panel="1"][role="dialog"]')) {
      if (!(panel instanceof HTMLElement)) continue;
      try {
        delete panel.dataset.crackUiMobileChatListPopover;
        delete panel.dataset.crackUiChatListPanel;
        delete panel.dataset.crackUiChatListForced;
        panel.style.removeProperty('width');
        panel.style.removeProperty('min-width');
        panel.style.removeProperty('max-width');
        panel.style.removeProperty('flex-basis');
        panel.style.removeProperty('overflow');
        panel.style.removeProperty('pointer-events');
        panel.style.removeProperty('height');
        panel.style.removeProperty('min-height');
        panel.style.removeProperty('max-height');
        panel.style.removeProperty('touch-action');
      } catch {
      }
    }

    mobileChatListCleanupPending = false;
    return true;
  }

  function isChatListOpen(panel = DOM.chatListPanel()) {
    if (!isDesktopChatListAutoHideViewport()) return false;
    const r = crackUiEdgeRect(panel);
    if (!r) return false;
    if (isCrackUiWidthControlledChatListPanel(panel)) return r.width > 80;
    return r.left > -70 && r.right > 170;
  }

  function isTabletChatListOpen(panel = findTabletChatListPanel()) {
    if (!isTabletLikeViewport() || !panel) return false;
    const rect = crackUiEdgeRect(panel);
    if (!rect) return false;
    return rect.width > 80 && rect.left > -70 && rect.right > 170;
  }

  function setTabletChatListOpen(wantOpen, reason = 'tablet') {
    if (!isTabletLikeViewport() || !chatListAutoHide) return false;

    const panel = findTabletChatListPanel();
    const currentlyOpen = panel ? isTabletChatListOpen(panel) : false;
    if (currentlyOpen === wantOpen) return true;

    const now = Date.now();
    if (now - lastChatListClickAt < 240) return false;

    resetDomLocatorCache();
    const toggle = findTabletChatListToggle();
    if (!toggle) return false;

    lastChatListClickAt = now;

    try {
      toggle.click();
      return true;
    } catch (error) {
      try {
        toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return true;
      } catch (fallbackError) {
        reportCrackUiError(`tablet-chat-list-${reason}`, fallbackError || error);
        return false;
      }
    }
  }

  function clickTabletChatListNativeButton(reason = 'swipe') {
    return setTabletChatListOpen(true, reason);
  }

  function isTabletChatListOutsideCloseSafeTarget(target, panel, toggle) {
    if (!(target instanceof Element)) return true;
    if (panel?.contains(target)) return true;
    if (toggle?.contains(target)) return true;

    return !!target.closest?.(`
      #${ID.panel},
      #${ID.gearDesktop},
      #${ID.gearMobile},
      #${ID.bottomModelPopup},
      #${ID.roomMenuZone},
      #${ID.roomMenuHandle},
      [data-crack-ui-menu-mode-popover],
      [data-radix-popper-content-wrapper],
      [role="dialog"]
    `);
  }

  function closeTabletChatListFromOutsideClick(target) {
    if (
      !chatListAutoHide ||
      !isTabletLikeViewport() ||
      getChatListAutoHideMode() !== 'tablet-swipe'
    ) {
      return false;
    }

    const panel = findTabletChatListPanel();
    if (!panel || !isTabletChatListOpen(panel)) return false;

    const toggle = findTabletChatListToggle();
    if (isTabletChatListOutsideCloseSafeTarget(target, panel, toggle)) return false;

    return setTabletChatListOpen(false, 'outside-click');
  }

  function clickMobileChatListNativeButton(reason = 'handle') {
    if (isTabletLikeViewport()) return clickTabletChatListNativeButton(reason);
    if (!isPhoneLikeViewport()) return false;

    const now = Date.now();
    if (now - lastChatListClickAt < 240) return false;
    lastChatListClickAt = now;

    releaseMobileChatListPopoverForcedStyles();
    resetDomLocatorCache();
    const toggle = DOM.mobileChatListToggle();
    if (!toggle) return false;

    try {
      toggle.click();
    } catch {
      try {
        toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      } catch {
        return false;
      }
    }

    scheduleMobileChatListPopoverLayoutSettle();
    return true;
  }

  function clickChatListToggle(want) {
    if (!isDesktopChatListAutoHideViewport()) return false;
    const panel = DOM.chatListPanel();
    const open = panel ? isChatListOpen(panel) : false;
    if (open === want) return true;

    const now = Date.now();
    if (now - lastChatListClickAt < 220) return false;
    lastChatListClickAt = now;

    const toggle = DOM.chatListToggle(panel);
    if (toggle) {
      releaseChatListPanelForcedOpen(panel);
      try {
        toggle.click();
        return true;
      } catch {
        try {
          toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return true;
        } catch {
        }
      }
    }

    if (panel && isCrackUiWidthControlledChatListPanel(panel)) return setChatListPanelForcedOpen(panel, want);
    return false;
  }

  function clearChatListCloseTimer() {
    if (!chatListCloseTimer) return;
    clearTimeout(chatListCloseTimer);
    chatListCloseTimer = null;
  }

  function scheduleChatListClose(delay = 180) {
    if (!isDesktopChatListAutoHideViewport()) return;
    clearChatListCloseTimer();
    chatListCloseTimer = setTimeout(() => {
      chatListCloseTimer = null;
      if (!chatListAutoHide || !isDesktopChatListAutoHideViewport()) return;
      const panel = DOM.chatListPanel();
      const zone = document.getElementById(ID.chatListZone);
      const hovered = panel?.matches?.(':hover') || zone?.matches?.(':hover');
      if (hovered) return;
      clickChatListToggle(false, 'auto-close');
    }, delay);
  }

  function openChatListFromHandle() {
    if (isPhoneLikeViewport()) return clickMobileChatListNativeButton('phone-handle');
    if (isDesktopChatListAutoHideViewport()) return clickChatListToggle(true, 'desktop-handle');
    return false;
  }

  function bindChatListHandle(handle) {
    if (!handle || handle.dataset.crackUiBound === '1') return;
    handle.dataset.crackUiBound = '1';

    const openFromHandle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();

      const now = Date.now();
      if (now - lastChatListHandleOpenAt < 360) return;
      lastChatListHandleOpenAt = now;

      openChatListFromHandle();
    };

    // Match the room-menu handle: vertical edge drags scroll, taps open.
    handle.addEventListener('click', openFromHandle, { passive: false });
  }

  function bindChatListPanelHover(panel) {
    if (!panel || !isDesktopChatListAutoHideViewport() || panel.dataset.crackUiHoverBound === '1') return;
    panel.dataset.crackUiHoverBound = '1';
    panel.addEventListener('mouseenter', () => clearChatListCloseTimer(), { passive: true });
    panel.addEventListener('mouseleave', () => scheduleChatListClose(180), { passive: true });
  }

  function ensureChatListAutoHide() {
    let zone = document.getElementById(ID.chatListZone);
    const mode = getChatListAutoHideMode();
    const supported = mode === 'desktop' || mode === 'phone' || mode === 'tablet-swipe';

    updateChatListAutoHideUi();

    if (!supported) {
      clearChatListCloseTimer();
      releaseMobileChatListPopoverForcedStyles();
      releaseChatListPanelForcedOpen(cachedChatListPanel?.isConnected ? cachedChatListPanel : null);
      zone?.remove();
      cachedChatListPanel = null;
      cachedChatListToggle = null;
      cachedMobileChatListToggle = null;
      document.documentElement.classList.remove(CLS.chatListMobilePopoverOpen);
      return;
    }

    if (mode === 'tablet-swipe') {
      clearChatListCloseTimer();
      releaseMobileChatListPopoverForcedStyles();
      releaseChatListPanelForcedOpen(cachedChatListPanel?.isConnected ? cachedChatListPanel : null);
      zone?.remove();
      document.getElementById(ID.chatListHandle)?.remove();
      return;
    }

    if (!zone) {
      zone = document.createElement('div');
      zone.id = ID.chatListZone;
      zone.title = mode === 'phone' ? '채팅 목록 열기' : '채팅 목록 자동 열기';
      document.body.appendChild(zone);
    }

    if (mode === 'phone') {
      zone.onmouseenter = null;
      zone.onmouseleave = null;
      const handleEnabled = menuAssistModeHasHandle(chatListAssistMode);
      zone.dataset.crackUiHandleEnabled = handleEnabled ? '1' : '0';

      let handle = document.getElementById(ID.chatListHandle);
      if (handleEnabled) {
        if (!handle) {
          handle = document.createElement('div');
          handle.id = ID.chatListHandle;
          handle.setAttribute('role', 'button');
          handle.setAttribute('aria-label', '채팅 목록 열기');
          handle.title = '채팅 목록 열기';
          zone.appendChild(handle);
        } else if (handle.parentElement !== zone) {
          zone.appendChild(handle);
        }
        bindChatListHandle(handle);
      } else {
        handle?.remove();
      }

      releaseChatListPanelForcedOpen(cachedChatListPanel?.isConnected ? cachedChatListPanel : null);
      cachedChatListPanel = null;
      cachedChatListToggle = null;
      markMobileChatListOpenState();
      forceMobileChatListPopoverLayout();
      return;
    }

    // Desktop only: proximity hover opens, mouse leave closes. No phone/tablet behavior here.
    document.getElementById(ID.chatListHandle)?.remove();
    releaseMobileChatListPopoverForcedStyles();

    if (zone.dataset.crackUiDesktopBound !== '1') {
      zone.dataset.crackUiDesktopBound = '1';
      zone.addEventListener('mouseenter', () => {
        if (!isDesktopChatListAutoHideViewport()) return;
        clearChatListCloseTimer();
        clickChatListToggle(true, 'edge-enter');
        setTimeout(() => { const panel = DOM.chatListPanel(); if (panel) bindChatListPanelHover(panel); }, 80);
      }, { passive: true });
      zone.addEventListener('mouseleave', () => {
        if (!isDesktopChatListAutoHideViewport()) return;
        scheduleChatListClose(180);
      }, { passive: true });
    }

    const panel = DOM.chatListPanel();
    if (panel) {
      panel.setAttribute('data-crack-ui-chat-list-panel', '1');
      bindChatListPanelHover(panel);
      if (isCrackUiWidthControlledChatListPanel(panel) && !DOM.chatListToggle(panel)) {
        const zoneHovered = zone.matches(':hover');
        if (!zoneHovered && !panel.matches(':hover')) setChatListPanelForcedOpen(panel, false);
      }
    }

    if (lastChatListBootCloseHref !== location.href) {
      lastChatListBootCloseHref = location.href;
      setTimeout(() => {
        if (chatListAutoHide && getChatListAutoHideMode() === 'desktop' && !document.getElementById(ID.chatListZone)?.matches(':hover')) {
          clickChatListToggle(false, 'boot-delay-2000');
        }
      }, 2000);
    }
  }

  // =====================================================
  // Boot: global events / init / observer
  // =====================================================

  function bindGlobal() {
    if (document.documentElement.dataset.crackUiGlobalBound === '1') return;
    document.documentElement.dataset.crackUiGlobalBound = '1';
    bindMenuSwipeGesture();
    document.addEventListener('pointerdown', (e) => {
      if (roomMenuHandle && isTouchLikeDevice()) {
        const roomButton = e.target.closest?.('button, [role="button"]');
        if (isChatRoomSettingsButton(roomButton)) {
          lastRoomMenuNativeButtonClickAt = Date.now();
          clearRoomPanelCloseTimer();
          clearRoomPanelToggleVerification({ invalidate: true });
        }
      }
      noteRoomTopBarInputInteraction(e.target);
    }, true);
    document.addEventListener('pointerdown', guardEmptyComposerSendEvent, true);
    document.addEventListener('mousedown', guardEmptyComposerSendEvent, true);
    document.addEventListener('focusin', (e) => noteRoomTopBarInputInteraction(e.target), true);
    document.addEventListener('click', (e) => {
      guardEmptyComposerSendEvent(e);
      if (e.defaultPrevented) return;
      noteNovelModelGenerationTriggerFromClick(e.target);

      const modelPopup = document.getElementById(ID.bottomModelPopup);
      const modelButton = e.target.closest?.(`#${ID.bottomModelButton}`);

      if (isBottomModelPopupOpen() && modelPopup && !modelPopup.contains(e.target) && !modelButton) {
        closeBottomModelPopup();
      }

      if (roomMenuForceReveal && !e.target.closest?.(`#${ID.roomMenuZone}, #${ID.roomMenuHandle}`)) {
        releaseRoomMenuForceRevealSoon(900);
      }

      if (roomMenuHandle && isTouchLikeDevice()) {
        const roomButton = e.target.closest?.('button, [role="button"]');
        if (isChatRoomSettingsButton(roomButton)) {
          lastRoomMenuNativeButtonClickAt = Date.now();
          clearRoomPanelCloseTimer();
          roomMenuReveal = true;
          updateRoomMenuRevealClass();
          setRoomTopBarHidden(false);
          setTimeout(() => {
            const panel = DOM.roomPanel();
            if (panel) bindRoomPanelHover(panel);
          }, 120);
        } else {
          const roomPanel = DOM.roomPanel();
          const safeRoomPanel =
            e.target.closest?.(`#${ID.roomMenuZone}, #${ID.roomMenuHandle}`) ||
            roomPanel?.contains(e.target) ||
            isTargetInsideRoomPanel(e.target);
          if (!safeRoomPanel) scheduleRoomPanelClose(160);
        }
      }

      if (chatListAutoHide) {
        markMobileChatListOpenState();

        if (isTabletLikeViewport()) {
          closeTabletChatListFromOutsideClick(e.target);
        } else if (isDesktopChatListAutoHideViewport()) {
          const chatListPanel = DOM.chatListPanel();
          const safeChatList = e.target.closest?.(`#${ID.chatListZone}`) || chatListPanel?.contains(e.target);
          if (!safeChatList) scheduleChatListClose(120);
        }
      }

      if (!panelOpen) return;

      const panel = document.getElementById(ID.panel);
      const gear = e.target.closest(`#${ID.gearDesktop}, #${ID.gearMobile}`);
      const menuModePopover = e.target.closest?.('[data-crack-ui-menu-mode-popover]');

      if (panel && !panel.contains(e.target) && !gear && !menuModePopover) {
        closePanel();
      }
    }, true);
    document.addEventListener('input', (e) => {
      if (isChatComposerTarget(e.target)) scheduleEmptySendGuardUiUpdate();
    }, true);
    document.addEventListener('keyup', (e) => {
      if (isChatComposerTarget(e.target)) scheduleEmptySendGuardUiUpdate();
    }, true);
    document.addEventListener('touchstart', (e) => {
      if (!isTouchLikeDevice()) return;
      if (!autoHideHeader || !mobileReveal || panelOpen) return;

      const touchedSafeArea = e.target.closest(`
        #${ID.zone},
        #${ID.handle},
        #${ID.roomMenuZone},
        #${ID.roomMenuHandle},
        #${ID.chatListZone},
        #${ID.chatListHandle},
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
    // Capture the composer Enter before Crack/ProseMirror handles it.
    // A global Enter with no focused composer is still allowed to focus the chat input;
    // only the next Enter from the focused, empty composer is blocked.
    document.addEventListener('keydown', (e) => {
      guardEmptyComposerEnterEvent(e);
      if (!e.defaultPrevented) noteNovelModelGenerationTriggerFromEnter(e);
    }, true);

    document.addEventListener('keydown', (e) => {
      if (e.defaultPrevented) return;

      if (e.key === 'Escape') {
        closeBottomModelPopup({ closeOriginal: false });
        closePanel();
      }
    });
    document.addEventListener('fullscreenchange', updateFullscreenButtonUi);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtonUi);
    window.addEventListener('resize', () => {
      updateDeviceViewportClasses();
      applyChatWidth();
      updateChatWidthUi();
      scheduleMenuSwipeZonePosition();

      if (isBottomModelPopupOpen()) {
        positionBottomModelPopup(document.getElementById(ID.bottomModelButton));
      }

    });

    window.visualViewport?.addEventListener?.('resize', () => {
      updateDeviceViewportClasses();
      scheduleMenuSwipeZonePosition();
    }, { passive: true });
    window.addEventListener('pointerup', stopPanelRangeDrag);
    window.addEventListener('pointercancel', stopPanelRangeDrag);
    window.addEventListener('mouseup', stopPanelRangeDrag);
    window.addEventListener('touchend', stopPanelRangeDrag, { passive: true });
    window.addEventListener('touchcancel', stopPanelRangeDrag, { passive: true });
    window.addEventListener('pagehide', () => {
      flushImageSizeSave();
      flushChatWidthSave();
      flushNovelModelCatalogSave();
      if (novelModelIndicator) saveNovelModelMessageCache();
    });
  }

  function reportCrackUiError(source, error) {
    lastCrackUiError = {
      source,
      message: String(error?.message || error),
      stack: String(error?.stack || ''),
      time: new Date().toISOString(),
      url: window.location.href,
    };

    try {
      console.error(`[Crack UI Plus] ${source} failed`, error);
    } catch {
    }
  }

  function getCrackUiDebugSnapshot() {
    return {
      version: CRACK_UI_VERSION,
      url: window.location.href,
      route: window.location.pathname,
      viewport: {
        width: Math.round(getCrackUiViewportWidth()),
        innerWidth: Math.round(window.innerWidth || 0),
        phone: isPhoneLikeViewport(),
        tablet: isTabletLikeViewport(),
        touchLike: isTouchLikeDevice(),
      },
      state: {
        autoHideHeader,
        imageSize,
        lineBreakOptimize,
        pauseAnimatedThumbs,
        hideStatBar,
        hideSituationImage,
        novelModelIndicator,
        novelModelIndicatorCacheCount: Object.keys(novelModelMessageCache).length,
        novelModelIndicatorCatalogCount: novelModelCatalogById.size,
        novelModelIndicatorRetiredCatalogCount: [...novelModelCatalogById.values()].filter((entry) => entry.retired).length,
        novelModelIndicatorRenderedCount: document.querySelectorAll('.crack-ui-novel-model-indicator').length,
        novelModelIndicatorScanScheduled: !!novelModelIndicatorScanTimer || !!novelModelIndicatorScanRaf,
        novelModelIndicatorTemporaryObserver: !!pendingNovelModelObserver,
        novelModelIndicatorNetworkCaptureInstalled: novelModelNetworkCaptureInstalled,
        novelModelIndicatorNetworkCandidateCount: novelModelNetworkCandidates.size,
        novelModelIndicatorNetworkMessageCount: novelModelNetworkMessages.size,
        novelModelIndicatorFingerprintCount: novelModelFingerprintIndex.size,
        novelModelIndicatorNetworkMessageRevision: novelModelNetworkMessageRevision,
        novelModelIndicatorStaticScanCount: novelModelStaticScanCount,
        novelModelIndicatorNetworkPayloadCount: novelModelNetworkPayloadCount,
        novelModelIndicatorNetworkLastUrl: novelModelNetworkLastUrl,
        novelModelIndicatorNetworkLastMatchCount: novelModelNetworkLastMatchCount,
        novelModelIndicatorManualCount: Object.keys(novelModelManualMap).length,
        novelModelIndicatorUnresolvedRenderedCount: document.querySelectorAll('.crack-ui-novel-model-indicator[data-crack-ui-novel-model-unresolved="1"]').length,
        novelModelIndicatorPending: pendingNovelModelCapture ? {
          roomKey: pendingNovelModelCapture.roomKey,
          reason: pendingNovelModelCapture.reason,
          targetMessageGroupId: pendingNovelModelCapture.targetMessageGroupId,
          modelName: pendingNovelModelCapture.modelInfo?.name || '',
          ageMs: Date.now() - pendingNovelModelCapture.createdAt,
        } : null,
        situationImageMarkScheduled: !!situationImageMarkTimer || !!situationImageMarkRaf,
        chatWidthPercent,
        themeMode,
        episodeUiMode,
        bottomModelPicker,
        visibleChatModels: getVisibleChatModelNames(),
        hiddenOfficialChatModels: getHiddenChatModelNames(),
        modelRegistryCount: lastOfficialModelRegistryCount,
        modelRegistryAdded: [...lastOfficialModelRegistryAdded],
        modelRegistryRemoved: [...lastOfficialModelRegistryRemoved],
        officialModelMenuHiddenCount: lastOfficialModelVisibilityHiddenCount,
        bottomModelPlacement: document.getElementById(ID.bottomModelButton)?.dataset?.crackUiPlacement || 'none',
        bottomModelCooperativeGroup: document.getElementById(ID.bottomModelButton)?.dataset?.crackUiPlacement === 'cooperative-group',
        loreEntryButtonPlacement: getLoreEntryButtonPlacementState(),
        emptySendGuard,
        roomMenuHandle,
        roomMenuAssistMode,
        chatListAutoHide,
        chatListAssistMode,
        menuSwipeLeftEnabled: isLeftMenuSwipeEnabled(),
        menuSwipeRightEnabled: isRightMenuSwipeEnabled(),
        menuSwipeZone: !!document.getElementById(ID.menuSwipeZone),
        fullscreenButtonEnabled,
        fullscreenActive: !!getFullscreenElement(),
        chatListAutoHideMode: getChatListAutoHideMode(),
        chatListAutoHideActive: chatListAutoHide && isChatListAutoHideSupportedViewport(),
        chatListAutoHidePhone: chatListAutoHide && isPhoneLikeViewport(),
        chatListAutoHideTabletSwipe: chatListAutoHide && isTabletLikeViewport(),
        chatListMobileProxyOnly: chatListAutoHide && isPhoneLikeViewport(),
        chatListTabletProxyOnly: chatListAutoHide && isTabletLikeViewport(),
        chatListMobilePopoverOpen: !!DOM.mobileChatListPopover(),
        chatListMobileHeaderGapCompensation: document.documentElement.classList.contains(CLS.chatListMobileHeaderGapCompensated),
        panelOpen,
        mobileReveal,
        roomMenuReveal,
        roomPanelToggleAttempt: lastRoomPanelToggleAttempt,
      },
      locators: getDomLocatorDebugSnapshot(),
      lastError: lastCrackUiError,
    };
  }

  function installCrackUiDebugApi() {
    const api = {
      version: CRACK_UI_VERSION,
      debug: getCrackUiDebugSnapshot,
      locators: DOM_LOCATORS,
      resetCache() {
        resetDomLocatorCache();
        scheduleInit();
        return true;
      },
    };

    try {
      exposeCrackUiPublicApi(api);
    } catch {
    }
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

    try {
      init();
    } catch (error) {
      reportCrackUiError('init', error);
    }
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

  // === Lore(에리로어) 진입 버튼 위치 보호 ===
  // UI+가 글로벌 헤더를 접으면 로어가 자리를 못 찾고 버튼을 하단 입력창에 붙이는 문제 방지.
  // 로어 버튼의 원래 집은 헤더 한 칸 아래 '채팅방 상단바'(모델명·방설정 버튼 줄)다.
  // 외부 확프 호환용 보정도 DOM facade / locator에 등록해서 debug로 위치를 확인할 수 있게 둔다.
  function findLoreEntryButton() {
    return document.getElementById('lore-inj-entry-button');
  }

  function findLoreRoomTopBar() {
    let seed = document.querySelector('svg path[d^="M11 11h2v2h-2"]')?.closest('button') || null;

    if (!seed) {
      for (const img of document.querySelectorAll('img[src*="model-icon"]')) {
        if (img.closest(`#${ID.bottomModelButton}, #${ID.bottomModelPopup}, #${ID.panel}`)) continue;
        seed = img.closest('button');
        if (seed) break;
      }
    }
    if (!seed) return null;

    let node = seed.parentElement;
    for (let i = 0; node && i < 6; i += 1) {
      const cls = String(node.className || '');
      if (
        cls.includes('h-12') &&
        cls.includes('justify-between') &&
        (cls.includes('bg-bg_screen') || cls.includes('border-b'))
      ) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function getLoreStableSiblingState(loreButton) {
    if (!loreButton?.parentElement) return 'found-unplaced';

    const siblings = [...loreButton.parentElement.children];
    const next = loreButton.nextElementSibling;
    const afterNext = next?.nextElementSibling || null;
    const settingsButton = siblings.find((el) => el.id === 'crack-pure-settings-btn') || null;

    if (
      next?.id === 'crack-pure-settings-btn' &&
      afterNext?.getAttribute?.('aria-haspopup') === 'menu'
    ) {
      return 'before-ai-settings';
    }

    if (
      !settingsButton &&
      next?.getAttribute?.('aria-haspopup') === 'menu'
    ) {
      return 'before-model';
    }

    return loreButton.dataset.crackUiLorePlaced || 'found-unplaced';
  }

  function getLoreEntryButtonPlacementState() {
    const loreButton = DOM.loreEntryButton?.() || null;
    if (!loreButton) return 'none';
    return getLoreStableSiblingState(loreButton);
  }

  function ensureLoreEntryButtonInRoomTopBar() {
    const loreButton = DOM.loreEntryButton();
    if (!loreButton) return;

    // 외부 확프(문장 다듬기)는 #crack-pure-settings-btn을 모델 버튼 바로 앞에 고정한다.
    // Lore를 모델 버튼 바로 앞에 고정하면 두 확프가 서로 insertBefore를 반복하므로,
    // AI 설정 버튼이 있으면 Lore는 그 왼쪽으로 양보한다: [Lore][AI 설정][모델].
    const currentState = getLoreStableSiblingState(loreButton);
    if (currentState === 'before-ai-settings' || currentState === 'before-model') return;

    const topBar = DOM.loreRoomTopBar();
    if (!topBar) return;

    // 모델 표시 버튼(프로챗 2.5 …)을 찾아 그 주변의 안정 슬롯을 고른다.
    const modelButton =
      topBar.querySelector('button[aria-haspopup="menu"]') ||
      topBar.querySelector('img[src*="model-icon"]')?.closest('button');

    if (!modelButton?.parentElement) return;

    const siblingSettingsButton = [...modelButton.parentElement.children]
      .find((el) => el.id === 'crack-pure-settings-btn') || null;
    const topBarSettingsButton = topBar.querySelector('#crack-pure-settings-btn');
    const settingsButton =
      siblingSettingsButton ||
      (topBarSettingsButton?.parentElement === modelButton.parentElement ? topBarSettingsButton : null);
    const anchor = settingsButton || modelButton;

    if (anchor.previousElementSibling !== loreButton) {
      anchor.parentElement.insertBefore(loreButton, anchor);
    }

    loreButton.dataset.crackUiLorePlaced = settingsButton ? 'before-ai-settings' : 'before-model';
  }

  function init() {
    cleanupOldStuffOnce();
    ensureRevealZone();
    ensurePanel();
    if (!pendingThemeApplied) {
      pendingThemeApplied = true;
      syncThemeStateFromOriginalSettings();
      applyPendingThemeChoices();
    }
    updateThemeUi();
    bindGlobal();

    const header = DOM.header();
    if (header) {
      bindHeaderHover(header);
      ensureGearButtons(header);
    }
    ensureLoreEntryButtonInRoomTopBar();
    ensureFullscreenButton();

    bindOfficialModelRegistryScan();
    syncChatModelRegistryFromOfficialMenu();
    ensureBottomModelPicker();
    syncOfficialModelVisibility();
    ensureNovelModelIndicator();
    ensureRoomMenuHandle();
    ensureChatListAutoHide();

    applyImageSize();
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

      const composer = cachedComposerEditable?.isConnected ? cachedComposerEditable : null;
      const onlyComposerChildChanges =
        !!composer &&
        mutations.length > 0 &&
        mutations.every((mutation) =>
          mutation.type === 'childList' &&
          (mutation.target === composer || composer.contains(mutation.target))
        );

      if (onlyComposerChildChanges) {
        if (emptySendGuard) scheduleEmptySendGuardUiUpdate();
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

  if (novelModelIndicator) installNovelModelNetworkCapture();

  ready(() => {
    installCrackUiDebugApi();
    runInit();
    observeThemeDomGuard();
    observe();
  });
})();

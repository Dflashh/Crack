// ==UserScript==
// @name         Crack UI Max
// @namespace    https://github.com/Dflashh/Crack
// @version      2.7.06
// @description  Crack을 더 가볍고 편하게
// @match        *://crack.wrtn.ai/*
// @author       깡통들과 나
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      crack-api.wrtn.ai
// @connect      *
// @icon         https://cdn.jsdelivr.net/gh/Dflashh/Crack@main/Icon/UI.webp
// @downloadURL  https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackUI.user.js
// @updateURL    https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackUI.user.js
// ==/UserScript==

(() => {
  'use strict';

  const CRACK_UI_VERSION = '2.7.06';

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
    panelPreviewButton: 'crack-ui-panel-preview-button',
    fontCustomStyle: 'crack-ui-custom-font-style',
    toggleFontMaster: 'crack-ui-toggle-font-master',
    toggleFontShadow: 'crack-ui-toggle-font-shadow',
    toggleFontBase: 'crack-ui-toggle-font-base',
    toggleFontDialogue: 'crack-ui-toggle-font-dialogue',
    toggleFontThought: 'crack-ui-toggle-font-thought',
    toggleFontItalic: 'crack-ui-toggle-font-italic',
    toggleFontItalicStyle: 'crack-ui-toggle-font-italic-style',
    toggleFontStrong: 'crack-ui-toggle-font-strong',
    toggleFontCodeBlock: 'crack-ui-toggle-font-code-block',
    toggleChatBackground: 'crack-ui-toggle-chat-background',
    toggleChatBackgroundImage: 'crack-ui-toggle-chat-background-image',
    toggleNovelBackdrop: 'crack-ui-toggle-novel-backdrop',
    chatBackgroundLayer: 'crack-ui-chat-background-layer',
    novelBackdropWeatherLayer: 'crack-ui-novel-backdrop-weather-layer',
    chatBackgroundImageButton: 'crack-ui-chat-background-image-button',
    chatBackgroundImageInput: 'crack-ui-chat-background-image-input',
    chatBackgroundImageRemove: 'crack-ui-chat-background-image-remove',
    fontSourceInput: 'crack-ui-font-source-input',
    fontBodySelect: 'crack-ui-font-body-select',
    fontCodeSelect: 'crack-ui-font-code-select',
    fontTitleSelect: 'crack-ui-font-title-select',
    fontSavedList: 'crack-ui-font-saved-list',
    fontSaveButton: 'crack-ui-font-save-button',
    fontFileButton: 'crack-ui-font-file-button',
    fontFileInput: 'crack-ui-font-file-input',
    fontResetButton: 'crack-ui-font-reset-button',
    fontTypographyResetButton: 'crack-ui-font-typography-reset-button',
    fontResolveStatus: 'crack-ui-font-resolve-status',
    fontPresetDock: 'crack-ui-font-preset-dock',
    fontPresetToggleButton: 'crack-ui-font-preset-toggle-button',
    fontPresetPopover: 'crack-ui-font-preset-popover',
    fontPresetCount: 'crack-ui-font-preset-count',
    fontPresetNameInput: 'crack-ui-font-preset-name-input',
    fontPresetSaveButton: 'crack-ui-font-preset-save-button',
    fontPresetList: 'crack-ui-font-preset-list',
    fontPresetStatus: 'crack-ui-font-preset-status',
    fontColorPickerPopover: 'crack-ui-font-color-picker-popover',
    fontColorPickerTitle: 'crack-ui-font-color-picker-title',
    fontColorPickerSv: 'crack-ui-font-color-picker-sv',
    fontColorPickerCursor: 'crack-ui-font-color-picker-cursor',
    fontColorPickerHue: 'crack-ui-font-color-picker-hue',
    fontColorPickerPrevious: 'crack-ui-font-color-picker-previous',
    fontColorPickerCurrent: 'crack-ui-font-color-picker-current',
    fontColorPickerHex: 'crack-ui-font-color-picker-hex',
    fontColorPickerRecent: 'crack-ui-font-color-picker-recent',
    fontColorPickerDone: 'crack-ui-font-color-picker-done',
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
    fontSettings: 'crack_ui_font_settings_v2',
    fontPresets: 'crack_ui_font_presets_v1',
    fontRecentColors: 'crack_ui_font_recent_colors_v1',
    chatBackgroundSettings: 'crack_ui_chat_background_settings_v1',
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
  const FONT_FILE_DB_NAME = 'crack-ui-plus-font-files';
  const FONT_FILE_DB_VERSION = 1;
  const FONT_FILE_DB_STORE = 'files';
  const FONT_FILE_MAX_BYTES = 40 * 1024 * 1024;
  const CHAT_BACKGROUND_IMAGE_DB_NAME = 'crack-ui-plus-background-images';
  const CHAT_BACKGROUND_IMAGE_DB_VERSION = 1;
  const CHAT_BACKGROUND_IMAGE_DB_STORE = 'images';
  const CHAT_BACKGROUND_IMAGE_MAX_BYTES = 24 * 1024 * 1024;
  const FONT_LIBRARY_MAX_RECORDS = 24;
  const FONT_PRESET_NAME_MAX_LENGTH = 24;

  const FONT_SETTINGS_DEFAULT = Object.freeze({
    nativeResetVersion: 2,
    accentToggleVersion: 2,
    masterEnabled: false,
    textShadowEnabled: false,
    baseBgEnabled: false,
    dialogueBgEnabled: false,
    thoughtBgEnabled: false,
    italicBgEnabled: false,
    italicStyleEnabled: false,
    strongBgEnabled: false,
    codeBlockBgEnabled: false,

    // Highlight colors are opt-in. The selected color is preserved while the switch is off.
    baseAccentEnabled: false,
    dialogueAccentEnabled: false,
    thoughtAccentEnabled: false,
    italicAccentEnabled: false,
    strongAccentEnabled: false,
    codeAccentEnabled: false,

    // Dialogue detection uses user-editable opening/closing character pairs.
    dialogueQuotePairsVersion: 2,
    dialogueQuotePairs: [['"', '"'], ['「', '」'], ['❝', '❞'], ['『', '』'], ['“', '”']],

    // These values are only editor fallbacks. Reset buttons disable the corresponding
    // override, so Crack's own computed style remains the actual source of truth.
    baseTextColor: '#09090b',
    codeTextColor: '#e1e4e8',

    // Web/file font library. File binaries live in IndexedDB; this settings object stores
    // only metadata and the independent bodyFontId / codeFontId / titleFontId assignments.
    fontLibraryVersion: 3,
    savedFonts: [],
    bodyFontId: '',
    codeFontId: '',
    titleFontId: '',
    customFontSource: '',
    textScale: 1.00,
    codeTextScale: 1.00,
    fontWeight: 400,
    lineHeight: 1.50,
    letterSpacing: 0,
    paragraphSpacing: 1.25,
    textShadowTone: 'dark',

    baseTextColorCustom: false,
    codeTextColorCustom: false,
    dialogueTextColorCustom: false,
    thoughtTextColorCustom: false,
    italicTextColorCustom: false,
    strongBgTextColorCustom: false,
    textScaleCustom: false,
    codeTextScaleCustom: false,
    fontWeightCustom: false,
    lineHeightCustom: false,
    letterSpacingCustom: false,
    paragraphSpacingCustom: false,

    baseBg: '#e8e0e4',
    dialogueBg: '#b29aa6',
    dialogueTextColor: '#09090b',
    thoughtBg: '#a89aa6',
    thoughtTextColor: '#09090b',
    italicBg: '#e8e0e4',
    italicTextColor: '#85837d',
    strongBg: '#f0e0e8',
    strongBgTextColor: '#09090b',
    codeAccent: '#c8a6b6',
  });

  // Crack native colors measured from the rendered UI for every theme / episode UI combination.
  // These values intentionally drive auto text colors directly instead of measuring a DOM
  // that may still be rendering the previous theme for a few frames.
  const FONT_KNOWN_NATIVE_COLORS = Object.freeze({
    novel: Object.freeze({
      light: Object.freeze({
        textColor: '#09090b',
        emColor: '#85837d',
        strongColor: '#09090b',
        codeTextColor: '#e1e4e8',
      }),
      dark: Object.freeze({
        textColor: '#fafafa',
        emColor: '#85837d',
        strongColor: '#fafafa',
        codeTextColor: '#e1e4e8',
      }),
    }),
    chat: Object.freeze({
      light: Object.freeze({
        textColor: '#09090b',
        emColor: '#85837d',
        strongColor: '#09090b',
        codeTextColor: '#e1e4e8',
      }),
      dark: Object.freeze({
        textColor: '#fafafa',
        emColor: '#85837d',
        strongColor: '#fafafa',
        codeTextColor: '#e1e4e8',
      }),
    }),
  });

  const FONT_THEME_AUTO_TEXT_COLOR_KEYS = Object.freeze([
    'baseTextColor',
    'dialogueTextColor',
    'thoughtTextColor',
    'italicTextColor',
    'strongBgTextColor',
    'codeTextColor',
  ]);

  const FONT_SETTING_RANGE = Object.freeze({
    textScale: { min: 0.20, max: 3.00, step: 0.01, label: '글씨 크기', pointMin: 8, pointMax: 16, pointStep: 0.1 },
    codeTextScale: { min: 0.70, max: 1.20, step: 0.01, label: '코드블록 글씨 크기' },
    fontWeight: { min: 300, max: 900, step: 100, label: '폰트 두께' },
    lineHeight: { min: 1.35, max: 2.10, step: 0.01, label: '행간' },
    letterSpacing: { min: -0.03, max: 0.08, step: 0.01, label: '자간' },
    paragraphSpacing: { min: 0, max: 1.60, step: 0.01, label: '문단 간격' },
  });

  const FONT_TOGGLE_KEYS = Object.freeze([
    'masterEnabled',
    'textShadowEnabled',
    'baseBgEnabled',
    'dialogueBgEnabled',
    'thoughtBgEnabled',
    'italicBgEnabled',
    'italicStyleEnabled',
    'strongBgEnabled',
    'codeBlockBgEnabled',
  ]);

  const FONT_ACCENT_TOGGLE_KEYS = Object.freeze([
    'baseAccentEnabled',
    'dialogueAccentEnabled',
    'thoughtAccentEnabled',
    'italicAccentEnabled',
    'strongAccentEnabled',
    'codeAccentEnabled',
  ]);

  const FONT_ACCENT_COLOR_TOGGLE = Object.freeze({
    baseBg: 'baseAccentEnabled',
    dialogueBg: 'dialogueAccentEnabled',
    thoughtBg: 'thoughtAccentEnabled',
    italicBg: 'italicAccentEnabled',
    strongBg: 'strongAccentEnabled',
    codeAccent: 'codeAccentEnabled',
  });

  const FONT_COLOR_KEYS = Object.freeze([
    'baseBg',
    'baseTextColor',
    'codeTextColor',
    'dialogueBg',
    'dialogueTextColor',
    'thoughtBg',
    'thoughtTextColor',
    'italicBg',
    'italicTextColor',
    'strongBg',
    'strongBgTextColor',
    'codeAccent',
  ]);

  const CHAT_BACKGROUND_COLOR_PICKER_KEY = 'chatBackground';
  const NOVEL_BACKDROP_COLOR_PICKER_KEY = 'novelBackdrop';

  function isCrackUiBackgroundColorPickerKey(key) {
    return key === CHAT_BACKGROUND_COLOR_PICKER_KEY || key === NOVEL_BACKDROP_COLOR_PICKER_KEY;
  }

  function isCrackUiColorPickerKey(key) {
    return FONT_COLOR_KEYS.includes(key) || isCrackUiBackgroundColorPickerKey(key);
  }

  const FONT_NATIVE_OVERRIDE_FLAG = Object.freeze({
    baseTextColor: 'baseTextColorCustom',
    codeTextColor: 'codeTextColorCustom',
    dialogueTextColor: 'dialogueTextColorCustom',
    thoughtTextColor: 'thoughtTextColorCustom',
    italicTextColor: 'italicTextColorCustom',
    strongBgTextColor: 'strongBgTextColorCustom',
    textScale: 'textScaleCustom',
    codeTextScale: 'codeTextScaleCustom',
    fontWeight: 'fontWeightCustom',
    lineHeight: 'lineHeightCustom',
    letterSpacing: 'letterSpacingCustom',
    paragraphSpacing: 'paragraphSpacingCustom',
  });


  // The font master is a pure runtime gate. Child settings remain in fontSettings unchanged
  // while it is OFF, so turning it back ON reapplies the exact previous configuration.


  const FONT_RUNTIME_ATTRIBUTES = Object.freeze([
    'data-crack-ui-font-code-text-color',
    'data-crack-ui-font-webfont',
    'data-crack-ui-font-body-font',
    'data-crack-ui-font-code-font',
    'data-crack-ui-font-title-font',
    'data-crack-ui-font-typography',
    'data-crack-ui-font-size',
    'data-crack-ui-font-code-size',
    'data-crack-ui-font-weight',
    'data-crack-ui-font-line-height',
    'data-crack-ui-font-letter-spacing',
    'data-crack-ui-font-paragraph-spacing',
    'data-crack-ui-font-shadow',
    'data-crack-ui-font-shadow-tone',
    'data-crack-ui-font-base',
    'data-crack-ui-font-base-accent',
    'data-crack-ui-font-dialogue',
    'data-crack-ui-font-dialogue-accent',
    'data-crack-ui-font-thought',
    'data-crack-ui-font-thought-accent',
    'data-crack-ui-font-italic',
    'data-crack-ui-font-italic-text-color',
    'data-crack-ui-font-italic-style',
    'data-crack-ui-font-italic-accent',
    'data-crack-ui-font-strong-bg',
    'data-crack-ui-font-strong-accent',
    'data-crack-ui-font-code-bg',
  ]);

  const FONT_RUNTIME_VARIABLES = Object.freeze([
    '--crack-ui-font-code-text',
    '--crack-ui-font-text-scale',
    '--crack-ui-font-code-scale',
    '--crack-ui-font-weight',
    '--crack-ui-font-strong-weight',
    '--crack-ui-font-line-height',
    '--crack-ui-font-letter-spacing',
    '--crack-ui-font-paragraph-spacing',
    '--crack-ui-font-base-rgb',
    '--crack-ui-font-base-text',
    '--crack-ui-font-dialogue-rgb',
    '--crack-ui-font-dialogue-text',
    '--crack-ui-font-thought-rgb',
    '--crack-ui-font-thought-text',
    '--crack-ui-font-italic-rgb',
    '--crack-ui-font-italic-text',
    '--crack-ui-font-strong-rgb',
    '--crack-ui-font-strong-highlight-text',
    '--crack-ui-font-code-rgb',
    '--crack-ui-custom-font-stack',
    '--crack-ui-body-font-stack',
    '--crack-ui-code-font-stack',
    '--crack-ui-title-font-stack',
  ]);

  const FONT_DIALOGUE_QUOTE_PAIRS_DEFAULT = Object.freeze([
    Object.freeze(['"', '"']),
    Object.freeze(['「', '」']),
    Object.freeze(['❝', '❞']),
    Object.freeze(['『', '』']),
    Object.freeze(['“', '”']),
  ]);
  const FONT_DIALOGUE_QUOTE_PAIR_LIMIT = 16;
  const FONT_SINGLE_OPEN = new Set(["'"]);
  const FONT_SINGLE_CLOSE = new Set(["'"]);
  let fontDialogueQuoteMatcherCache = null;

  function normalizeCrackUiDialogueQuoteCharacter(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    const codePoint = raw.codePointAt(0);
    return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : '';
  }

  function normalizeCrackUiDialogueQuotePairs(rawPairs, useDefaultsWhenMissing = false) {
    const source = Array.isArray(rawPairs)
      ? rawPairs
      : (useDefaultsWhenMissing ? FONT_DIALOGUE_QUOTE_PAIRS_DEFAULT : []);
    const pairs = [];
    const seen = new Set();

    for (const item of source) {
      if (pairs.length >= FONT_DIALOGUE_QUOTE_PAIR_LIMIT) break;
      const open = normalizeCrackUiDialogueQuoteCharacter(Array.isArray(item) ? item[0] : item?.open);
      const close = normalizeCrackUiDialogueQuoteCharacter(Array.isArray(item) ? item[1] : item?.close);
      if (!open || !close) continue;
      const key = `${open}\u0000${close}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push([open, close]);
    }

    return pairs;
  }

  function getCrackUiDialogueQuoteMatcher() {
    // The cache is explicitly invalidated whenever the editable quote-pair list changes.
    // Avoid normalizing and serializing the same list during every quote-tree pass.
    if (fontDialogueQuoteMatcherCache) return fontDialogueQuoteMatcherCache;

    const pairs = normalizeCrackUiDialogueQuotePairs(fontSettings?.dialogueQuotePairs);

    const closeByOpen = new Map();
    const allCharacters = new Set();
    pairs.forEach(([open, close]) => {
      if (!closeByOpen.has(open)) closeByOpen.set(open, new Set());
      closeByOpen.get(open).add(close);
      allCharacters.add(open);
      allCharacters.add(close);
    });

    fontDialogueQuoteMatcherCache = {
      pairs,
      closeByOpen,
      hasCandidate(value) {
        for (const char of String(value || '')) {
          if (allCharacters.has(char)) return true;
        }
        return false;
      },
    };
    return fontDialogueQuoteMatcherCache;
  }

  function clampCrackUiFontNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, number));
  }

  function normalizeCrackUiFontHex(value, fallback) {
    const raw = String(value || '').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase();
    const short = raw.match(/^#([0-9a-fA-F]{3})$/);
    if (short) return `#${short[1].split('').map((char) => char + char).join('')}`.toLowerCase();
    return fallback;
  }

  function crackUiFontHexToRgb(value, fallback = '255,255,255') {
    const normalized = normalizeCrackUiFontHex(value, null);
    if (!normalized) return fallback;
    return [
      parseInt(normalized.slice(1, 3), 16),
      parseInt(normalized.slice(3, 5), 16),
      parseInt(normalized.slice(5, 7), 16),
    ].join(',');
  }

  function crackUiFontComputedColorToHex(value, fallback = '#09090b') {
    const normalized = normalizeCrackUiFontHex(value, null);
    if (normalized) return normalized;
    const match = String(value || '').match(/rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)/i);
    if (!match) return fallback;
    const channel = (part) => Math.max(0, Math.min(255, Math.round(Number(part) || 0))).toString(16).padStart(2, '0');
    return `#${channel(match[1])}${channel(match[2])}${channel(match[3])}`;
  }

  function crackUiFontHexToHsv(value) {
    const normalized = normalizeCrackUiFontHex(value, '#000000');
    const red = parseInt(normalized.slice(1, 3), 16) / 255;
    const green = parseInt(normalized.slice(3, 5), 16) / 255;
    const blue = parseInt(normalized.slice(5, 7), 16) / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    let hue = 0;
    if (delta > 0) {
      if (max === red) hue = 60 * (((green - blue) / delta) % 6);
      else if (max === green) hue = 60 * (((blue - red) / delta) + 2);
      else hue = 60 * (((red - green) / delta) + 4);
    }
    if (hue < 0) hue += 360;
    return {
      h: hue,
      s: max === 0 ? 0 : delta / max,
      v: max,
    };
  }

  function crackUiFontHsvToHex(hue, saturation, value) {
    const h = ((Number(hue) % 360) + 360) % 360;
    const s = Math.max(0, Math.min(1, Number(saturation) || 0));
    const v = Math.max(0, Math.min(1, Number(value) || 0));
    const chroma = v * s;
    const segment = h / 60;
    const x = chroma * (1 - Math.abs((segment % 2) - 1));
    let red = 0;
    let green = 0;
    let blue = 0;
    if (segment < 1) [red, green, blue] = [chroma, x, 0];
    else if (segment < 2) [red, green, blue] = [x, chroma, 0];
    else if (segment < 3) [red, green, blue] = [0, chroma, x];
    else if (segment < 4) [red, green, blue] = [0, x, chroma];
    else if (segment < 5) [red, green, blue] = [x, 0, chroma];
    else [red, green, blue] = [chroma, 0, x];
    const match = v - chroma;
    const channel = (part) => Math.round((part + match) * 255).toString(16).padStart(2, '0');
    return `#${channel(red)}${channel(green)}${channel(blue)}`;
  }

  function loadCrackUiFontRecentColors() {
    try {
      const parsed = JSON.parse(readStorage(LS.fontRecentColors, '[]'));
      if (!Array.isArray(parsed)) return [];
      return [...new Set(parsed
        .map((value) => normalizeCrackUiFontHex(value, null))
        .filter(Boolean))].slice(0, 8);
    } catch {
      return [];
    }
  }

  function persistCrackUiFontRecentColors() {
    writeStorage(LS.fontRecentColors, JSON.stringify(fontRecentColors.slice(0, 8)));
  }

  function rememberCrackUiFontRecentColor(value) {
    const normalized = normalizeCrackUiFontHex(value, null);
    if (!normalized) return;
    fontRecentColors = [normalized, ...fontRecentColors.filter((item) => item !== normalized)].slice(0, 8);
    persistCrackUiFontRecentColors();
  }

  const CHAT_BACKGROUND_SETTINGS_DEFAULT = Object.freeze({
    enabled: false,
    color: '#ffffff',
    imageEnabled: false,
    imageFileKey: '',
    imageFilename: '',
    imageMime: '',
    imageSize: 0,
    novelBackdropEnabled: false,
    novelBackdropColor: '#ffffff',
    novelBackdropOpacity: 34,
  });

  function normalizeCrackUiChatBackgroundSettings(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const imageFileKeyRaw = String(source.imageFileKey || '').trim();
    const imageFileKey = /^[a-z0-9][a-z0-9._-]{0,95}$/i.test(imageFileKeyRaw) ? imageFileKeyRaw : '';
    const imageFilename = String(source.imageFilename || '')
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);
    const imageMime = String(source.imageMime || '').trim().slice(0, 80);
    const imageSize = Math.max(0, Math.round(Number(source.imageSize) || 0));
    return {
      enabled: source.enabled === true,
      color: normalizeCrackUiFontHex(source.color, CHAT_BACKGROUND_SETTINGS_DEFAULT.color),
      imageEnabled: source.imageEnabled === true
        || (source.imageEnabled == null && !!imageFileKey && source.enabled === true),
      imageFileKey,
      imageFilename,
      imageMime,
      imageSize,
      novelBackdropEnabled: source.novelBackdropEnabled === true,
      novelBackdropColor: normalizeCrackUiFontHex(
        source.novelBackdropColor,
        CHAT_BACKGROUND_SETTINGS_DEFAULT.novelBackdropColor
      ),
      novelBackdropOpacity: Math.max(5, Math.min(100, Math.round(
        Number.isFinite(Number(source.novelBackdropOpacity))
          ? Number(source.novelBackdropOpacity)
          : CHAT_BACKGROUND_SETTINGS_DEFAULT.novelBackdropOpacity
      ))),
    };
  }

  function loadCrackUiChatBackgroundSettings() {
    try {
      const raw = readStorage(LS.chatBackgroundSettings);
      return normalizeCrackUiChatBackgroundSettings(raw ? JSON.parse(raw) : {});
    } catch {
      return normalizeCrackUiChatBackgroundSettings({});
    }
  }

  function persistCrackUiChatBackgroundSettings() {
    writeJsonStorage(LS.chatBackgroundSettings, normalizeCrackUiChatBackgroundSettings(chatBackgroundSettings));
  }

  function normalizeCrackUiChatBackgroundImageFileKey(value) {
    const normalized = String(value || '').trim();
    return /^[a-z0-9][a-z0-9._-]{0,95}$/i.test(normalized) ? normalized : '';
  }

  function normalizeCrackUiChatBackgroundImageFilename(value) {
    return String(value || '')
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);
  }

  function crackUiChatBackgroundFormatBytes(value) {
    const bytes = Math.max(0, Number(value) || 0);
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    const precision = size >= 100 || unitIndex === 0 ? 0 : (size >= 10 ? 1 : 2);
    return `${size.toFixed(precision)}${units[unitIndex]}`;
  }

  function getCrackUiChatBackgroundImageMetaText(settings = chatBackgroundSettings) {
    const name = normalizeCrackUiChatBackgroundImageFilename(settings?.imageFilename);
    if (!name) return '저장된 이미지 없음';
    const sizeText = crackUiChatBackgroundFormatBytes(settings?.imageSize);
    return sizeText ? `${name} · ${sizeText}` : name;
  }

  function crackUiChatBackgroundIsSupportedImageFile(file) {
    if (!file || typeof file.arrayBuffer !== 'function') return false;
    if (String(file.type || '').startsWith('image/')) return true;
    return /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(String(file.name || ''));
  }

  function crackUiChatBackgroundCreateImageFileKey(file) {
    const label = String(file?.name || 'background')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'background';
    return `bg-${Date.now().toString(36)}-${label}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function crackUiChatBackgroundEscapeCssUrl(value) {
    const source = String(value || '').replace(/["\\\n\r\f]/g, '\\$&');
    return source ? `url("${source}")` : 'none';
  }

  function setCrackUiChatBackgroundImageObjectUrl(nextUrl) {
    const normalized = String(nextUrl || '');
    if (chatBackgroundImageObjectUrl && chatBackgroundImageObjectUrl !== normalized) {
      try {
        URL.revokeObjectURL(chatBackgroundImageObjectUrl);
      } catch {
      }
    }
    chatBackgroundImageObjectUrl = normalized;
  }

  function crackUiChatBackgroundOpenImageDb() {
    if (chatBackgroundImageDbPromise) return chatBackgroundImageDbPromise;
    chatBackgroundImageDbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('이 브라우저는 배경 이미지 저장을 지원하지 않습니다'));
        return;
      }
      const request = indexedDB.open(CHAT_BACKGROUND_IMAGE_DB_NAME, CHAT_BACKGROUND_IMAGE_DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(CHAT_BACKGROUND_IMAGE_DB_STORE)) {
          db.createObjectStore(CHAT_BACKGROUND_IMAGE_DB_STORE, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          chatBackgroundImageDbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () => {
        chatBackgroundImageDbPromise = null;
        reject(request.error || new Error('배경 이미지 저장소를 열지 못했습니다'));
      };
      request.onblocked = () => {
        chatBackgroundImageDbPromise = null;
        reject(new Error('다른 탭에서 배경 이미지 저장소를 사용 중입니다'));
      };
    });
    return chatBackgroundImageDbPromise;
  }

  async function crackUiChatBackgroundPutImageData(record, file) {
    const db = await crackUiChatBackgroundOpenImageDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CHAT_BACKGROUND_IMAGE_DB_STORE, 'readwrite');
      transaction.objectStore(CHAT_BACKGROUND_IMAGE_DB_STORE).put({
        key: record.key,
        blob: file,
        filename: record.filename,
        mime: record.mime,
        size: record.size,
        savedAt: Date.now(),
      });
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error || new Error('배경 이미지를 저장하지 못했습니다'));
      transaction.onabort = () => reject(transaction.error || new Error('배경 이미지 저장이 취소되었습니다'));
    });
  }

  async function crackUiChatBackgroundGetImageData(fileKey) {
    const db = await crackUiChatBackgroundOpenImageDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CHAT_BACKGROUND_IMAGE_DB_STORE, 'readonly');
      const request = transaction.objectStore(CHAT_BACKGROUND_IMAGE_DB_STORE).get(String(fileKey || ''));
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('배경 이미지를 읽지 못했습니다'));
    });
  }

  async function crackUiChatBackgroundDeleteImageData(fileKey) {
    if (!fileKey) return false;
    const db = await crackUiChatBackgroundOpenImageDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CHAT_BACKGROUND_IMAGE_DB_STORE, 'readwrite');
      transaction.objectStore(CHAT_BACKGROUND_IMAGE_DB_STORE).delete(String(fileKey || ''));
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error || new Error('배경 이미지를 삭제하지 못했습니다'));
      transaction.onabort = () => reject(transaction.error || new Error('배경 이미지 삭제가 취소되었습니다'));
    });
  }

  async function hydrateCrackUiChatBackgroundImage() {
    const sequence = ++chatBackgroundImageHydrationSeq;
    const fileKey = normalizeCrackUiChatBackgroundImageFileKey(chatBackgroundSettings.imageFileKey);
    if (!fileKey) {
      setCrackUiChatBackgroundImageObjectUrl('');
      applyCrackUiChatBackground();
      syncCrackUiChatBackgroundUi(document.getElementById(ID.panel));
      return false;
    }

    try {
      const record = await crackUiChatBackgroundGetImageData(fileKey);
      if (sequence !== chatBackgroundImageHydrationSeq) return false;
      if (!record?.blob) {
        chatBackgroundSettings.enabled = false;
        chatBackgroundSettings.imageEnabled = false;
        chatBackgroundSettings.imageFileKey = '';
        chatBackgroundSettings.imageFilename = '';
        chatBackgroundSettings.imageMime = '';
        chatBackgroundSettings.imageSize = 0;
        setCrackUiChatBackgroundImageObjectUrl('');
        persistCrackUiChatBackgroundSettings();
        applyCrackUiChatBackground();
        syncCrackUiChatBackgroundUi(document.getElementById(ID.panel));
        return false;
      }

      if (!chatBackgroundSettings.imageFilename && record.filename) {
        chatBackgroundSettings.imageFilename = normalizeCrackUiChatBackgroundImageFilename(record.filename);
      }
      if (!chatBackgroundSettings.imageMime && record.mime) {
        chatBackgroundSettings.imageMime = String(record.mime || '').trim().slice(0, 80);
      }
      if (!chatBackgroundSettings.imageSize && record.size) {
        chatBackgroundSettings.imageSize = Math.max(0, Math.round(Number(record.size) || 0));
      }

      setCrackUiChatBackgroundImageObjectUrl(URL.createObjectURL(record.blob));
      persistCrackUiChatBackgroundSettings();
      applyCrackUiChatBackground();
      syncCrackUiChatBackgroundUi(document.getElementById(ID.panel));
      return true;
    } catch (error) {
      console.warn('[Crack UI Max] background image hydration failed', error);
      setCrackUiChatBackgroundImageObjectUrl('');
      applyCrackUiChatBackground();
      syncCrackUiChatBackgroundUi(document.getElementById(ID.panel));
      return false;
    }
  }

  async function updateCrackUiChatBackgroundImageFromFile(file) {
    if (!crackUiChatBackgroundIsSupportedImageFile(file)) {
      throw new Error('이미지 파일만 배경으로 넣을 수 있습니다');
    }
    if (file.size > CHAT_BACKGROUND_IMAGE_MAX_BYTES) {
      throw new Error('배경 이미지는 24MB 이하만 저장할 수 있습니다');
    }

    const previousKey = normalizeCrackUiChatBackgroundImageFileKey(chatBackgroundSettings.imageFileKey);
    const nextKey = crackUiChatBackgroundCreateImageFileKey(file);
    const nextFilename = normalizeCrackUiChatBackgroundImageFilename(file.name || 'background-image');
    const nextMime = String(file.type || '').trim().slice(0, 80);
    const nextSize = Math.max(0, Math.round(Number(file.size) || 0));

    await crackUiChatBackgroundPutImageData({
      key: nextKey,
      filename: nextFilename,
      mime: nextMime,
      size: nextSize,
    }, file);

    chatBackgroundSettings.enabled = true;
    chatBackgroundSettings.imageEnabled = true;
    chatBackgroundSettings.imageFileKey = nextKey;
    chatBackgroundSettings.imageFilename = nextFilename;
    chatBackgroundSettings.imageMime = nextMime;
    chatBackgroundSettings.imageSize = nextSize;

    setCrackUiChatBackgroundImageObjectUrl(URL.createObjectURL(file));
    persistCrackUiChatBackgroundSettings();
    applyCrackUiChatBackground();
    syncCrackUiChatBackgroundUi(document.getElementById(ID.panel));

    if (previousKey && previousKey !== nextKey) {
      crackUiChatBackgroundDeleteImageData(previousKey).catch((error) => {
        console.warn('[Crack UI Max] failed to delete previous background image', error);
      });
    }
    return true;
  }

  async function clearCrackUiChatBackgroundImage() {
    const previousKey = normalizeCrackUiChatBackgroundImageFileKey(chatBackgroundSettings.imageFileKey);
    if (chatBackgroundSettings.imageEnabled === true) chatBackgroundSettings.enabled = false;
    chatBackgroundSettings.imageEnabled = false;
    chatBackgroundSettings.imageFileKey = '';
    chatBackgroundSettings.imageFilename = '';
    chatBackgroundSettings.imageMime = '';
    chatBackgroundSettings.imageSize = 0;
    setCrackUiChatBackgroundImageObjectUrl('');
    persistCrackUiChatBackgroundSettings();
    applyCrackUiChatBackground();
    syncCrackUiChatBackgroundUi(document.getElementById(ID.panel));
    if (previousKey) {
      try {
        await crackUiChatBackgroundDeleteImageData(previousKey);
      } catch (error) {
        console.warn('[Crack UI Max] failed to delete background image', error);
      }
    }
    return true;
  }

  function isCrackUiFontSettingCustom(key, settings = fontSettings) {
    const flag = FONT_NATIVE_OVERRIDE_FLAG[key];
    return !!(flag && settings?.[flag] === true);
  }

  function normalizeCrackUiFontFamily(value) {
    return String(value || '')
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .replace(/[;{}<>]/g, '')
      .trim()
      .slice(0, 160);
  }

  function crackUiFontHashValue(value) {
    let hash = 2166136261;
    const input = String(value || '');
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function crackUiFontDeriveResourceName(value) {
    const source = String(value || '').trim();
    if (!source) return '';
    try {
      const parsed = new URL(source);
      const filename = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || '')
        .replace(/\.(?:woff2?|ttf|otf|css)$/i, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (filename) return normalizeCrackUiFontFamily(filename);
      const host = parsed.hostname.replace(/^www\./i, '').split('.')[0] || '';
      return normalizeCrackUiFontFamily(host.replace(/[-_]+/g, ' '));
    } catch {
      return '';
    }
  }

  function crackUiFontCreateSavedId(source, family = '') {
    const sourceKey = String(source || '');
    const familyKey = normalizeCrackUiFontFamily(family).toLowerCase();
    return `font-${crackUiFontHashValue(`${sourceKey}\n${familyKey}`)}`;
  }

  function crackUiFontNormalizeSavedId(value) {
    const id = String(value || '').trim();
    return /^font-[a-z0-9_-]{1,80}$/i.test(id) ? id : '';
  }

  function crackUiFontIsFileRecord(record) {
    return !!record && (record.kind === 'file' || !!record.fileKey);
  }

  function normalizeCrackUiSavedFontRecord(raw = {}) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

    if (crackUiFontIsFileRecord(raw)) {
      const filename = String(raw.filename || '').replace(/[\\/<>:"|?*]/g, '').trim().slice(0, 180);
      const family = normalizeCrackUiFontFamily(raw.family || crackUiFontDeriveFileFamily(filename));
      if (!family) return null;

      const seed = `${filename}\n${Number(raw.size || 0)}\n${Number(raw.lastModified || 0)}\n${family}`;
      const id = crackUiFontNormalizeSavedId(raw.id) || `font-file-${crackUiFontHashValue(seed)}`;
      const fileKeyRaw = String(raw.fileKey || id).trim();
      const fileKey = /^[a-z0-9_-]{1,100}$/i.test(fileKeyRaw) ? fileKeyRaw : id;

      return {
        id,
        family,
        source: '',
        css: '',
        kind: 'file',
        fileKey,
        filename: filename || `${family}.${crackUiFontNormalizeFileFormat(raw.format) || 'ttf'}`,
        format: crackUiFontNormalizeFileFormat(raw.format || filename),
        size: Math.max(0, Math.round(Number(raw.size) || 0)),
        lastModified: Math.max(0, Math.round(Number(raw.lastModified) || 0)),
      };
    }

    const source = normalizeCrackUiFontSource(raw.source || '');
    if (!source) return null;

    const cssBase = /^https?:\/\//i.test(source) ? source : '';
    const css = normalizeCrackUiFontFaceCss(raw.css || (source.startsWith('@font-face') ? source : ''), cssBase).slice(0, 40000);
    const family = normalizeCrackUiFontFamily(
      raw.family ||
      crackUiFontExtractFamilies(css)[0] ||
      crackUiFontExtractFamilies(source)[0] ||
      crackUiFontInferFamily(source) ||
      crackUiFontDeriveResourceName(source)
    );
    if (!family) return null;

    return {
      // Keep an existing valid ID so upgrading does not break a selected legacy font.
      // New entries use source + family, which allows several families from one CSS source.
      id: crackUiFontNormalizeSavedId(raw.id) || crackUiFontCreateSavedId(source, family),
      family,
      source,
      css,
      kind: 'web',
    };
  }

  function normalizeCrackUiSavedFonts(value) {
    const records = [];
    const seen = new Set();
    (Array.isArray(value) ? value : []).slice(0, FONT_LIBRARY_MAX_RECORDS).forEach((item) => {
      const record = normalizeCrackUiSavedFontRecord(item);
      if (!record || seen.has(record.id)) return;
      seen.add(record.id);
      records.push(record);
    });
    return records;
  }

  function getCrackUiSavedFontById(id, settings = fontSettings) {
    const key = String(id || '');
    if (!key) return null;
    return (Array.isArray(settings?.savedFonts) ? settings.savedFonts : [])
      .find((record) => record?.id === key) || null;
  }

  function getCrackUiSavedFontAlias(record) {
    if (!record?.id) return '';
    return `Crack UI ${record.id.replace(/[^a-z0-9_-]/gi, '')}`;
  }

  function crackUiFontCanAliasSavedRecord(record) {
    return !!(
      record && (
        crackUiFontIsFileRecord(record) ||
        record.css ||
        String(record.source || '').startsWith('@font-face') ||
        crackUiFontIsDirectResource(record.source)
      )
    );
  }

  function getCrackUiSavedFontRuntimeFamily(record) {
    if (!record) return '';
    return crackUiFontCanAliasSavedRecord(record)
      ? getCrackUiSavedFontAlias(record)
      : normalizeCrackUiFontFamily(record.family);
  }

  function crackUiFontAliasFaceCss(cssText, sourceFamily, aliasFamily) {
    const sourceKey = normalizeCrackUiFontFamily(sourceFamily).toLowerCase();
    if (!sourceKey || !aliasFamily) return String(cssText || '');
    return String(cssText || '').replace(
      /font-family\s*:\s*(['"])([^'"]+)\1\s*;?/gi,
      (match, quote, family) => normalizeCrackUiFontFamily(family).toLowerCase() === sourceKey
        ? `font-family:"${crackUiFontCssString(aliasFamily)}";`
        : match
    );
  }

  function buildCrackUiSavedFontCss(record) {
    if (!record || crackUiFontIsFileRecord(record)) return { importCss: '', faceCss: '' };
    const source = normalizeCrackUiFontSource(record.source);
    if (!source) return { importCss: '', faceCss: '' };

    const alias = getCrackUiSavedFontAlias(record);
    const storedCss = normalizeCrackUiFontFaceCss(
      record.css || (source.startsWith('@font-face') ? source : ''),
      /^https?:\/\//i.test(source) ? source : ''
    );
    if (storedCss) {
      return {
        importCss: '',
        faceCss: crackUiFontAliasFaceCss(storedCss, record.family, alias),
      };
    }

    if (crackUiFontIsDirectResource(source)) {
      return {
        importCss: '',
        faceCss: `@font-face{font-family:"${crackUiFontCssString(alias)}";src:url("${crackUiFontCssString(source)}") format("${crackUiFontNormalizeFormat('', source)}");font-weight:100 900;font-style:normal;font-display:swap;}`,
      };
    }

    return {
      importCss: `@import url("${crackUiFontCssString(source)}");`,
      faceCss: '',
    };
  }

  function normalizeCrackUiFontSettings(raw = {}) {
    // 2.6.26 briefly stored a duplicate suspended snapshot. Merge it once while the master is
    // OFF so no setting can be lost during upgrade, then return a clean snapshot-free object.
    if (
      raw && typeof raw === 'object' && !Array.isArray(raw) &&
      raw.masterEnabled !== true &&
      raw.masterSuspendedState && typeof raw.masterSuspendedState === 'object' &&
      !Array.isArray(raw.masterSuspendedState)
    ) {
      raw = { ...raw, ...raw.masterSuspendedState, masterEnabled: false };
    }

    const defaults = FONT_SETTINGS_DEFAULT;
    const settings = {};

    FONT_TOGGLE_KEYS.forEach((key) => {
      settings[key] = raw[key] === true;
    });

    const hasIosAccentSwitchSchema = Number(raw.accentToggleVersion) >= 2;
    FONT_ACCENT_TOGGLE_KEYS.forEach((key) => {
      // 2.6.20 starts every accent-color switch from OFF once. Choices made after
      // this migration are preserved normally through accentToggleVersion 2.
      settings[key] = hasIosAccentSwitchSchema ? raw[key] === true : false;
    });
    settings.accentToggleVersion = 2;

    let dialogueQuotePairs = normalizeCrackUiDialogueQuotePairs(
      raw.dialogueQuotePairs,
      !Array.isArray(raw.dialogueQuotePairs)
    );
    if (Number(raw.dialogueQuotePairsVersion) < 2) {
      // Add the two new defaults once for existing users. After migration, users may
      // remove either pair without it being restored on every reload.
      dialogueQuotePairs = normalizeCrackUiDialogueQuotePairs([
        ...dialogueQuotePairs,
        ['『', '』'],
        ['“', '”'],
      ]);
    }
    settings.dialogueQuotePairs = dialogueQuotePairs;
    settings.dialogueQuotePairsVersion = 2;

    FONT_COLOR_KEYS.forEach((key) => {
      settings[key] = normalizeCrackUiFontHex(raw[key], defaults[key]);
    });

    Object.entries(FONT_SETTING_RANGE).forEach(([key, def]) => {
      let value = clampCrackUiFontNumber(raw[key], def.min, def.max, defaults[key]);
      if (key === 'fontWeight') value = Math.round(value / 100) * 100;
      settings[key] = value;
    });

    const nativeResetVersion = Number(raw.nativeResetVersion) || 0;
    const hasNativeResetSchema = nativeResetVersion >= 1;
    const legacyStoredSettings = !hasNativeResetSchema && raw && typeof raw === 'object' && Object.keys(raw).length > 0;
    const legacyHighlightTextDefaults = Object.freeze({
      dialogueTextColor: '#fdfbfc',
      thoughtTextColor: '#f4eef1',
      italicTextColor: '#d4cbd2',
      strongBgTextColor: '#ffffff',
    });
    Object.entries(FONT_NATIVE_OVERRIDE_FLAG).forEach(([key, flag]) => {
      // 2.6.23 keeps every highlight text color native/theme/UI-aware after reset. Preserve an
      // actually customized legacy color, while old untouched editor defaults migrate to auto.
      if (nativeResetVersion >= 2) {
        settings[flag] = raw[flag] === true;
      } else if (Object.prototype.hasOwnProperty.call(legacyHighlightTextDefaults, key)) {
        const hadStoredValue = Object.prototype.hasOwnProperty.call(raw, key);
        const storedValue = normalizeCrackUiFontHex(raw[key], legacyHighlightTextDefaults[key]);
        settings[flag] = hadStoredValue && storedValue !== legacyHighlightTextDefaults[key];
      } else {
        // 2.6.10 and older always applied every range/color value. Keep that appearance
        // during migration; pressing reset switches the individual property to Crack native.
        settings[flag] = hasNativeResetSchema ? raw[flag] === true : legacyStoredSettings;
      }
    });
    settings.nativeResetVersion = 2;

    const hasFontLibrarySchema = Number(raw.fontLibraryVersion) >= 1;
    let savedFonts = normalizeCrackUiSavedFonts(raw.savedFonts);
    let migratedFontId = '';

    // Migrate the single legacy webfont into the new library once. Since the old font applied
    // to both prose and code, select it for both so an update does not change appearance.
    if (!hasFontLibrarySchema && raw.customFontSource) {
      const legacySource = normalizeCrackUiFontSource(raw.customFontSource);
      const legacyFamily = normalizeCrackUiFontFamily(raw.customFontFamily) ||
        crackUiFontExtractFamilies(legacySource)[0] ||
        crackUiFontInferFamily(legacySource) ||
        crackUiFontDeriveResourceName(legacySource);
      const migrated = normalizeCrackUiSavedFontRecord({
        source: legacySource,
        family: legacyFamily,
        css: legacySource.startsWith('@font-face') ? legacySource : '',
      });
      if (migrated) {
        migratedFontId = migrated.id;
        if (!savedFonts.some((record) => record.id === migrated.id)) savedFonts.unshift(migrated);
      }
    }

    const savedIds = new Set(savedFonts.map((record) => record.id));
    settings.savedFonts = savedFonts;
    settings.bodyFontId = savedIds.has(String(raw.bodyFontId || ''))
      ? String(raw.bodyFontId)
      : migratedFontId;
    settings.codeFontId = savedIds.has(String(raw.codeFontId || ''))
      ? String(raw.codeFontId)
      : migratedFontId;
    settings.titleFontId = savedIds.has(String(raw.titleFontId || ''))
      ? String(raw.titleFontId)
      : '';
    settings.fontLibraryVersion = 3;
    settings.customFontSource = hasFontLibrarySchema
      ? String(raw.customFontSource || '').trim().slice(0, 20000)
      : '';
    settings.textShadowTone = String(raw.textShadowTone || '').toLowerCase() === 'light' ? 'light' : 'dark';

    return settings;
  }

  function loadCrackUiFontSettings() {
    try {
      const raw = readStorage(LS.fontSettings);
      return normalizeCrackUiFontSettings(raw ? JSON.parse(raw) : {});
    } catch {
      return normalizeCrackUiFontSettings({});
    }
  }

  function normalizeCrackUiFontPresetName(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, FONT_PRESET_NAME_MAX_LENGTH);
  }

  function createCrackUiFontPresetId() {
    return `font-preset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function createCrackUiFontPresetSnapshot(source = fontSettings) {
    const rawSource = source && typeof source === 'object' ? source : {};
    const activeLibrary = typeof fontSettings === 'object' && fontSettings
      ? normalizeCrackUiSavedFonts(fontSettings.savedFonts)
      : [];
    const normalized = normalizeCrackUiFontSettings({
      ...rawSource,
      fontLibraryVersion: 3,
      savedFonts: Array.isArray(rawSource.savedFonts)
        ? rawSource.savedFonts
        : activeLibrary,
    });
    const snapshot = {
      nativeResetVersion: 2,
      accentToggleVersion: 2,
      dialogueQuotePairsVersion: 2,
      fontLibraryVersion: 3,
      dialogueQuotePairs: normalizeCrackUiDialogueQuotePairs(normalized.dialogueQuotePairs),
      bodyFontId: String(normalized.bodyFontId || ''),
      codeFontId: String(normalized.codeFontId || ''),
      titleFontId: String(normalized.titleFontId || ''),
      textShadowTone: normalized.textShadowTone === 'light' ? 'light' : 'dark',
    };

    [...FONT_TOGGLE_KEYS, ...FONT_ACCENT_TOGGLE_KEYS].forEach((key) => {
      snapshot[key] = normalized[key] === true;
    });
    FONT_COLOR_KEYS.forEach((key) => {
      snapshot[key] = normalized[key];
    });
    Object.keys(FONT_SETTING_RANGE).forEach((key) => {
      snapshot[key] = normalized[key];
    });
    [...new Set(Object.values(FONT_NATIVE_OVERRIDE_FLAG))].forEach((key) => {
      snapshot[key] = normalized[key] === true;
    });

    return snapshot;
  }

  function normalizeCrackUiFontPresetRecord(raw, index = 0) {
    if (!raw || typeof raw !== 'object') return null;
    const name = normalizeCrackUiFontPresetName(raw.name);
    if (!name) return null;
    const id = /^font-preset-[a-z0-9-]+$/i.test(String(raw.id || ''))
      ? String(raw.id)
      : `font-preset-legacy-${index}-${Math.abs(name.split('').reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) | 0, 7)).toString(36)}`;
    const settings = createCrackUiFontPresetSnapshot(raw.settings || raw.snapshot || {});
    const updatedAt = Number.isFinite(Number(raw.updatedAt)) ? Number(raw.updatedAt) : 0;
    return { id, name, settings, updatedAt };
  }

  function normalizeCrackUiFontPresets(raw) {
    if (!Array.isArray(raw)) return [];
    const result = [];
    const usedIds = new Set();
    const usedNames = new Set();
    raw.forEach((item, index) => {
      const record = normalizeCrackUiFontPresetRecord(item, index);
      if (!record) return;
      const nameKey = record.name.toLocaleLowerCase();
      if (usedIds.has(record.id) || usedNames.has(nameKey)) return;
      usedIds.add(record.id);
      usedNames.add(nameKey);
      result.push(record);
    });
    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  function loadCrackUiFontPresets() {
    try {
      const raw = readStorage(LS.fontPresets);
      return normalizeCrackUiFontPresets(raw ? JSON.parse(raw) : []);
    } catch {
      return [];
    }
  }

  function persistCrackUiFontPresets() {
    fontPresets = normalizeCrackUiFontPresets(fontPresets);
    writeJsonStorage(LS.fontPresets, fontPresets);
  }

  function getCrackUiFontVisibleElement(selectors) {
    for (const selector of selectors) {
      for (const element of document.querySelectorAll(selector)) {
        if (!(element instanceof HTMLElement)) continue;
        if (element.closest(`#${ID.panelRoot}, #${ID.panel}, #${ID.bottomModelPopup}`)) continue;
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) return element;
      }
    }
    return null;
  }

  function getCrackUiFontNativeSnapshotCacheKey() {
    const actualTheme = document.body?.dataset?.theme || document.documentElement.dataset.theme || '';
    return [
      normalizeThemeMode(themeMode),
      actualTheme,
      episodeUiMode || '',
      window.location.pathname,
    ].join('|');
  }

  function getCrackUiFontKnownNativeFallback() {
    // Always key auto colors from the UI Plus selections. Crack's rendered DOM can retain the
    // previous theme briefly during the original setting transition, which made auto colors
    // appear stuck until a reload. The user supplied all four native combinations, so no DOM
    // guess is needed for these colors.
    const currentTheme = normalizeThemeMode(themeMode);
    const currentEpisodeUi = normalizeEpisodeUiMode(episodeUiMode);
    const colors = FONT_KNOWN_NATIVE_COLORS[currentEpisodeUi]?.[currentTheme]
      || FONT_KNOWN_NATIVE_COLORS.novel.light;

    return {
      ...colors,
      textPx: 16,
      codePx: 14,
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0,
      paragraphSpacing: 1.25,
      measuredText: false,
      measuredCode: false,
    };
  }

  function withCrackUiFontRuntimeSuspended(callback) {
    const root = document.documentElement;
    const attributes = FONT_RUNTIME_ATTRIBUTES.map((name) => [name, root.getAttribute(name)]);
    const variables = FONT_RUNTIME_VARIABLES.map((name) => [
      name,
      root.style.getPropertyValue(name),
      root.style.getPropertyPriority(name),
    ]);

    FONT_RUNTIME_ATTRIBUTES.forEach((name) => root.removeAttribute(name));
    FONT_RUNTIME_VARIABLES.forEach((name) => root.style.removeProperty(name));

    try {
      return callback();
    } finally {
      attributes.forEach(([name, value]) => {
        if (value == null) root.removeAttribute(name);
        else root.setAttribute(name, value);
      });
      variables.forEach(([name, value, priority]) => {
        if (value) root.style.setProperty(name, value, priority);
        else root.style.removeProperty(name);
      });
    }
  }

  function parseCrackUiFontComputedLineHeight(style, fallback = 1.5) {
    const fontPx = parseFloat(style?.fontSize);
    const linePx = parseFloat(style?.lineHeight);
    if (!Number.isFinite(fontPx) || fontPx <= 0 || !Number.isFinite(linePx) || linePx <= 0) return fallback;
    return Math.max(0.8, Math.min(3, linePx / fontPx));
  }

  function parseCrackUiFontComputedLetterSpacing(style, fallback = 0) {
    if (!style || style.letterSpacing === 'normal') return 0;
    const fontPx = parseFloat(style.fontSize);
    const spacingPx = parseFloat(style.letterSpacing);
    if (!Number.isFinite(fontPx) || fontPx <= 0 || !Number.isFinite(spacingPx)) return fallback;
    return Math.max(-0.3, Math.min(0.5, spacingPx / fontPx));
  }

  function measureCrackUiFontNativeSnapshot(options = {}) {
    const now = performance.now();
    const cacheKey = getCrackUiFontNativeSnapshotCacheKey();
    const fallback = getCrackUiFontKnownNativeFallback();

    // Native measurement temporarily removes every UI Plus font override. Repeating that while
    // the font tab is not visible can make Crack's virtual scroller recalculate its height and
    // fight the user's current scroll position. Cache a successful measurement for the full
    // route/theme/UI-mode lifetime, and suspend runtime styles only from the visible font tab.
    if (
      !options.force &&
      crackUiFontNativeSnapshotKey === cacheKey &&
      (crackUiFontNativeSnapshot.measuredText || crackUiFontNativeSnapshot.measuredCode)
    ) return crackUiFontNativeSnapshot;

    if (!options.force && (!panelOpen || activePanelSection !== 'font')) {
      if (crackUiFontNativeSnapshotKey === cacheKey) return crackUiFontNativeSnapshot;
      crackUiFontNativeSnapshot = fallback;
      crackUiFontNativeSnapshotKey = cacheKey;
      crackUiFontNativeMeasuredAt = now;
      crackUiFontBaseTextPx = fallback.textPx;
      crackUiFontBaseCodePx = fallback.codePx;
      crackUiFontBaseTextMeasured = false;
      crackUiFontBaseCodeMeasured = false;
      crackUiFontBaseMeasuredAt = crackUiFontNativeMeasuredAt;
      return crackUiFontNativeSnapshot;
    }

    const measured = withCrackUiFontRuntimeSuspended(() => {
      const markdown = getCrackUiFontVisibleElement([
        'main [data-message-group-id] .wrtn-markdown',
        'main .wrtn-markdown',
      ]);
      const paragraph = getCrackUiFontVisibleElement([
        'main [data-message-group-id] .wrtn-markdown p',
        'main [data-message-group-id] .wrtn-markdown li',
        'main .wrtn-markdown p',
        'main .wrtn-markdown li',
        'main .wrtn-markdown blockquote',
      ]);
      const code = getCrackUiFontVisibleElement([
        'main [data-message-group-id] .wrtn-markdown pre code',
        'main [data-message-group-id] .wrtn-codeblock code',
        'main .wrtn-markdown pre code',
        'main .wrtn-codeblock code',
        'main .wrtn-markdown :not(pre) > code',
      ]);
      const emphasis = getCrackUiFontVisibleElement([
        'main [data-message-group-id] .wrtn-markdown em',
        'main .wrtn-markdown em',
      ]);
      const strong = getCrackUiFontVisibleElement([
        'main [data-message-group-id] .wrtn-markdown strong',
        'main .wrtn-markdown strong',
      ]);

      const textTarget = paragraph || markdown;
      const textStyle = textTarget ? getComputedStyle(textTarget) : null;
      const markdownStyle = markdown ? getComputedStyle(markdown) : textStyle;
      const emphasisStyle = emphasis ? getComputedStyle(emphasis) : null;
      const strongStyle = strong ? getComputedStyle(strong) : null;
      const codeStyle = code ? getComputedStyle(code) : null;
      const rootFontPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const textPx = parseFloat(textStyle?.fontSize);
      const codePx = parseFloat(codeStyle?.fontSize);
      const marginBottomPx = parseFloat(textStyle?.marginBottom);

      const nativeTextColor = crackUiFontComputedColorToHex(
        markdownStyle?.color || textStyle?.color,
        fallback.textColor
      );

      return {
        textColor: nativeTextColor,
        emColor: crackUiFontComputedColorToHex(emphasisStyle?.color, fallback.emColor),
        strongColor: crackUiFontComputedColorToHex(strongStyle?.color, nativeTextColor || fallback.strongColor),
        codeTextColor: crackUiFontComputedColorToHex(codeStyle?.color, nativeTextColor || fallback.codeTextColor),
        textPx: Number.isFinite(textPx) && textPx >= 8 && textPx <= 40 ? textPx : fallback.textPx,
        codePx: Number.isFinite(codePx) && codePx >= 7 && codePx <= 32 ? codePx : fallback.codePx,
        fontWeight: Math.max(100, Math.min(1000, Number.parseInt(textStyle?.fontWeight, 10) || fallback.fontWeight)),
        lineHeight: parseCrackUiFontComputedLineHeight(textStyle, fallback.lineHeight),
        letterSpacing: parseCrackUiFontComputedLetterSpacing(textStyle, fallback.letterSpacing),
        paragraphSpacing: Number.isFinite(marginBottomPx)
          ? Math.max(0, Math.min(4, marginBottomPx / rootFontPx))
          : fallback.paragraphSpacing,
        measuredText: !!textTarget,
        measuredCode: !!code,
      };
    });

    crackUiFontNativeSnapshot = measured;
    crackUiFontNativeSnapshotKey = cacheKey;
    if (measured.measuredText || measured.measuredCode) crackUiFontNativeMeasuredAt = now;

    crackUiFontBaseTextPx = measured.textPx;
    crackUiFontBaseCodePx = measured.codePx;
    crackUiFontBaseTextMeasured = measured.measuredText;
    crackUiFontBaseCodeMeasured = measured.measuredCode;
    crackUiFontBaseMeasuredAt = crackUiFontNativeMeasuredAt;
    return crackUiFontNativeSnapshot;
  }

  function measureCrackUiFontBaseSizes(options = {}) {
    measureCrackUiFontNativeSnapshot(options);
  }

  function getCrackUiFontNativeSettingValue(key) {
    // Auto text colors must change immediately with the selected theme/UI. Do not read them
    // back from a DOM that may still be painted with the previous selection.
    const known = getCrackUiFontKnownNativeFallback();
    if (key === 'baseTextColor' || key === 'dialogueTextColor' || key === 'thoughtTextColor') return known.textColor;
    if (key === 'italicTextColor') return known.emColor;
    if (key === 'strongBgTextColor') return known.strongColor;
    if (key === 'codeTextColor') return known.codeTextColor;

    const native = measureCrackUiFontNativeSnapshot();
    if (key === 'textScale' || key === 'codeTextScale') return 1;
    if (key === 'fontWeight') return native.fontWeight;
    if (key === 'lineHeight') return native.lineHeight;
    if (key === 'letterSpacing') return native.letterSpacing;
    if (key === 'paragraphSpacing') return native.paragraphSpacing;
    if (FONT_COLOR_KEYS.includes(key)) return native[key] || FONT_SETTINGS_DEFAULT[key];
    return FONT_SETTINGS_DEFAULT[key];
  }

  function getCrackUiFontEffectiveSettingValue(key) {
    const customFlag = FONT_NATIVE_OVERRIDE_FLAG[key];
    if (!customFlag) return fontSettings[key];
    return fontSettings[customFlag] === true
      ? fontSettings[key]
      : getCrackUiFontNativeSettingValue(key);
  }

  function invalidateCrackUiFontNativeSnapshot() {
    crackUiFontNativeSnapshotKey = '';
    crackUiFontNativeMeasuredAt = -Infinity;
    crackUiFontBaseMeasuredAt = -Infinity;
    crackUiFontBaseTextMeasured = false;
    crackUiFontBaseCodeMeasured = false;
  }

  function getCrackUiFontThemeDefaultSignature() {
    const actualTheme = document.body?.dataset?.theme || document.documentElement.dataset.theme || '';
    return [
      normalizeThemeMode(themeMode),
      normalizeEpisodeUiMode(episodeUiMode),
      actualTheme,
      window.location.pathname,
    ].join('|');
  }

  function applyCrackUiFontThemeTextVariables() {
    if (!fontSettings.masterEnabled) return;
    const root = document.documentElement;
    root.style.setProperty('--crack-ui-font-base-text', getCrackUiFontEffectiveSettingValue('baseTextColor'));
    root.style.setProperty('--crack-ui-font-dialogue-text', getCrackUiFontEffectiveSettingValue('dialogueTextColor'));
    root.style.setProperty('--crack-ui-font-thought-text', getCrackUiFontEffectiveSettingValue('thoughtTextColor'));
    root.style.setProperty('--crack-ui-font-italic-text', getCrackUiFontEffectiveSettingValue('italicTextColor'));
    root.style.setProperty('--crack-ui-font-strong-highlight-text', getCrackUiFontEffectiveSettingValue('strongBgTextColor'));
    if (isCrackUiFontSettingCustom('codeTextColor')) {
      root.style.setProperty('--crack-ui-font-code-text', fontSettings.codeTextColor);
    } else {
      root.style.removeProperty('--crack-ui-font-code-text');
    }
  }

  function syncCrackUiFontThemeTextColorUi(panel = document.getElementById(ID.panel)) {
    if (!panel || !panelOpen || panel.dataset.open !== '1' || activePanelSection !== 'font') return;
    FONT_THEME_AUTO_TEXT_COLOR_KEYS.forEach((key) => {
      if (isCrackUiFontSettingCustom(key)) return;
      const value = getCrackUiFontNativeSettingValue(key);
      const picker = panel.querySelector(`[data-crack-ui-font-color-picker="${key}"]`);
      const code = panel.querySelector(`[data-crack-ui-font-color-code="${key}"]`);
      if (picker) picker.style.setProperty('--crack-ui-font-swatch', value);
      if (code && document.activeElement !== code) code.value = value;
      if (fontColorPickerOpen && fontColorPickerKey === key) syncCrackUiFontColorPickerFromValue(value);
    });
  }

  function refreshCrackUiFontThemeDefaults(options = {}) {
    const signature = getCrackUiFontThemeDefaultSignature();
    if (!options.force && crackUiFontThemeDefaultSignature === signature) return false;
    crackUiFontThemeDefaultSignature = signature;
    invalidateCrackUiFontNativeSnapshot();
    // Only color variables need an immediate refresh. Avoid a full native-style suspension,
    // which previously could disturb Crack's virtual scroll while the panel was open.
    applyCrackUiFontThemeTextVariables();
    syncCrackUiFontThemeTextColorUi(document.getElementById(ID.panel));
    return true;
  }

  function formatCrackUiFontPointSize(px) {
    const point = Number(px) * 0.75;
    if (!Number.isFinite(point)) return '';
    const rounded = Math.round(point * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}pt`;
  }

  function getCrackUiFontBasePointSize(key) {
    measureCrackUiFontBaseSizes();
    const basePx = key === 'textScale' ? crackUiFontBaseTextPx : crackUiFontBaseCodePx;
    const point = Number(basePx) * 0.75;
    return Number.isFinite(point) && point > 0 ? point : (key === 'textScale' ? 12 : 10.5);
  }

  function getCrackUiFontRangeInputConfig(key, value = getCrackUiFontEffectiveSettingValue(key)) {
    const def = FONT_SETTING_RANGE[key];
    if (!def) return null;
    const effectiveValue = isCrackUiFontSettingCustom(key) ? value : getCrackUiFontNativeSettingValue(key);
    if (key === 'textScale') {
      const basePoint = getCrackUiFontBasePointSize(key);
      const pointValue = clampCrackUiFontNumber(
        basePoint * Number(effectiveValue),
        def.pointMin,
        def.pointMax,
        basePoint
      );
      return {
        min: def.pointMin,
        max: def.pointMax,
        step: def.pointStep,
        value: Math.round(pointValue * 10) / 10,
      };
    }
    return { min: def.min, max: def.max, step: def.step, value: effectiveValue };
  }

  function convertCrackUiFontRangeInputValue(key, value) {
    const def = FONT_SETTING_RANGE[key];
    if (!def) return value;
    if (key === 'textScale') {
      const basePoint = getCrackUiFontBasePointSize(key);
      const pointValue = clampCrackUiFontNumber(value, def.pointMin, def.pointMax, basePoint);
      return pointValue / basePoint;
    }
    return value;
  }

  function clampCrackUiFontTextScaleToPointRange(settings) {
    if (!settings.textScaleCustom) return settings;
    const def = FONT_SETTING_RANGE.textScale;
    const basePoint = getCrackUiFontBasePointSize('textScale');
    settings.textScale = clampCrackUiFontNumber(
      settings.textScale,
      def.pointMin / basePoint,
      def.pointMax / basePoint,
      FONT_SETTINGS_DEFAULT.textScale
    );
    return settings;
  }

  function formatCrackUiFontSettingValue(key, value = getCrackUiFontEffectiveSettingValue(key)) {
    const custom = isCrackUiFontSettingCustom(key);
    const effectiveValue = custom ? value : getCrackUiFontNativeSettingValue(key);
    const number = Number(effectiveValue);
    if (!Number.isFinite(number)) return custom ? '' : '기본';
    let formatted = '';
    if (key === 'textScale' || key === 'codeTextScale') {
      measureCrackUiFontBaseSizes();
      const basePx = key === 'textScale' ? crackUiFontBaseTextPx : crackUiFontBaseCodePx;
      formatted = formatCrackUiFontPointSize(basePx * number);
    } else if (key === 'fontWeight') {
      formatted = String(Math.round(number));
    } else if (key === 'lineHeight') {
      formatted = `${number.toFixed(2)}배`;
    } else if (key === 'letterSpacing') {
      formatted = `${number.toFixed(2)}em`;
    } else if (key === 'paragraphSpacing') {
      formatted = `${number.toFixed(2)}rem`;
    } else {
      formatted = String(number);
    }
    return custom ? formatted : `기본 · ${formatted}`;
  }

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
  let fontSettings = loadCrackUiFontSettings();
  let fontPresets = loadCrackUiFontPresets();
  let fontPresetStatusText = '';
  let fontPresetMenuOpen = false;
  let fontDialogueQuoteMenuOpen = false;
  let fontRecentColors = loadCrackUiFontRecentColors();
  let chatBackgroundSettings = loadCrackUiChatBackgroundSettings();
  let fontColorPickerOpen = false;
  let fontColorPickerKey = '';
  let fontColorPickerTrigger = null;
  let fontColorPickerPrevious = '#000000';
  let fontColorPickerSnapshot = null;
  let fontColorPickerHue = 0;
  let fontColorPickerSaturation = 0;
  let fontColorPickerValue = 0;
  let fontColorPickerPendingHex = '';
  let fontColorPickerApplyRaf = 0;
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
  let activePanelSection = ['display', 'chat', 'font', 'background'].includes(readStorage(LS.panelActiveSection))
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
  let activeCrackUiFontRangeScroller = null;
  let activeCrackUiFontRangeScrollTop = 0;
  let activeCrackUiFontRangeScrollLeft = 0;
  let panelHoldPreviewActive = false;
  let animatedThumbRafPending = false;
  let animatedThumbUrlMap = null;
  let animatedThumbStillUrlStatus = new Map();
  let animatedThumbStillCandidateCache = new Map();
  let cachedHeader = null;
  let cachedChatBackgroundViewport = null;
  let cachedChatBackgroundComposerShell = null;
  let appliedChatBackgroundTarget = null;
  let appliedNovelBackdropTarget = null;
  let appliedChatBackgroundComposerShell = null;
  let appliedChatBackgroundWeatherLayer = null;
  let appliedNovelBackdropWeatherLayer = null;
  let chatBackgroundApplyRaf = 0;
  let chatBackgroundCompatibilityObserver = null;
  let chatBackgroundWeatherRootObserver = null;
  let observedChatBackgroundWeatherRoot = null;
  let chatContentRefreshTimer = null;
  let chatContentRefreshRaf = 0;
  let chatContentRefreshLastAt = 0;
  let viewportRefreshRaf = 0;
  let cachedCrackUiViewportWidth = null;
  let cachedTouchLikeDevice = null;
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
  let lastRoomPanelToggleAttempt = null;
  let roomPanelToggleRequestSeq = 0;
  let roomPanelToggleVerifyTimer = null;
  let roomPanelToggleFinalVerifyTimer = null;
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
  let fontSettingsSaveTimer = null;
  let fontQuoteScanTimer = null;
  let fontQuoteScanRaf = 0;
  let fontQuoteLastScanAt = 0;
  let fontQuoteMutationObserver = null;
  const fontQuoteDirtyRoots = new Set();
  let fontQuoteFullScanPending = true;
  let fontQuoteWrapSeq = 0;
  const fontQuoteWraps = new Map();
  let fontResolveSource = '';
  let fontResolveStatus = 'idle';
  let fontResolvedFamily = '';
  let fontResolvedFamilies = [];
  let fontResolveLastError = '';
  let fontSaveStatusText = '';
  let fontSaveOperationSeq = 0;
  let fontFileOperationActive = false;
  let fontFileDbPromise = null;
  let chatBackgroundImageDbPromise = null;
  let chatBackgroundImageObjectUrl = '';
  let chatBackgroundImageHydrationSeq = 0;
  const fontLocalFaceState = new Map();
  const fontSavedHydrationPending = new Set();
  const fontSavedHydrationAttempted = new Set();
  let crackUiFontBaseTextPx = 16;
  let crackUiFontBaseCodePx = 13;
  let crackUiFontBaseMeasuredAt = -Infinity;
  let crackUiFontBaseTextMeasured = false;
  let crackUiFontBaseCodeMeasured = false;
  let crackUiFontNativeSnapshotKey = '';
  let crackUiFontNativeMeasuredAt = -Infinity;
  let crackUiFontNativeSnapshot = getCrackUiFontKnownNativeFallback();
  let crackUiFontThemeDefaultSignature = '';
  let crackUiFontRuntimeSignature = '';
  let crackUiFontRuntimeStateKnown = false;
  let crackUiFontRuntimeActive = false;
  let crackUiFontScrollRestoreRaf = 0;
  let crackUiFontScrollRestoreTimers = [];
  let crackUiPanelLifecycleToken = 0;

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
        --crack-ui-chat-half-width: ${getCssHalfWidthFromPercent(chatWidthPercent)};
        --crack-ui-scroll-button-offset: ${getCssScrollButtonOffsetFromPercent(chatWidthPercent)};
        --crack-ui-font-code-text: ${fontSettings.codeTextColor};
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

      /* Mobile chat list popover is native Crack UI. Crack UI Max only proxies the hidden hamburger button on phones.
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
         When Crack UI Max hides the global header, remove that reserved padding too.
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

      .crack-ui-panel-head-actions {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex: 0 0 auto;
      }

      .crack-ui-panel-preview,
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
        line-height: 1;
        transform: none !important;
        transition:
          background-color 130ms ease,
          color 130ms ease,
          opacity 130ms ease;
        -webkit-tap-highlight-color: transparent;
        touch-action: none;
      }

      .crack-ui-panel-preview {
        font-size: 0;
      }

      .crack-ui-panel-preview svg {
        width: 15px;
        height: 15px;
        pointer-events: none;
      }

      .crack-ui-panel-close {
        font-size: 17px;
      }

      .crack-ui-panel-preview:hover,
      .crack-ui-panel-close:hover {
        background: rgba(255, 255, 255, .12);
        color: rgba(255, 255, 255, .90);
      }

      .crack-ui-panel-preview:active,
      .crack-ui-panel-preview[data-pressed="1"],
      .crack-ui-panel-close:active {
        transform: none !important;
        background: rgba(255, 255, 255, .16);
        color: rgba(255, 255, 255, .98);
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

      #${ID.panel} [data-crack-ui-font-range],
      #${ID.panel} [data-crack-ui-novel-backdrop-opacity] {
        touch-action: none;
        -webkit-user-select: none;
        user-select: none;
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

      .crack-ui-row[data-disabled="1"] .crack-ui-switch {
        background: rgba(120, 120, 128, .34) !important;
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, .07),
          inset 0 1px 2px rgba(0, 0, 0, .18) !important;
      }

      .crack-ui-row[data-disabled="1"] .crack-ui-toggle:checked + .crack-ui-switch,
      .crack-ui-row[data-disabled="1"] .crack-ui-toggle:disabled:checked + .crack-ui-switch {
        background: rgba(254, 69, 50, .36) !important;
        box-shadow:
          inset 0 0 0 1px rgba(254, 69, 50, .16),
          inset 0 1px 2px rgba(0, 0, 0, .14) !important;
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

      /* Font tab controls */
      #${ID.panel} .crack-ui-font-section-body {
        gap: 10px;
      }

      #${ID.panel} .crack-ui-font-card {
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, .07);
        border-radius: 18px;
        background: rgba(0, 0, 0, .42);
      }

      #${ID.panel} .crack-ui-font-master-card {
        border-color: rgba(254, 69, 50, .24);
        background: rgba(254, 69, 50, .06);
      }

      #${ID.panel} .crack-ui-font-section-body[data-crack-ui-font-master="off"]
        > :not(.crack-ui-font-master-card) {
        opacity: .48;
      }

      #${ID.panel} .crack-ui-font-section-body[data-crack-ui-font-master="off"]
        > .crack-ui-font-master-card {
        opacity: 1;
      }

      #${ID.panel} .crack-ui-font-card > .crack-ui-row {
        min-height: 46px;
        padding: 11px 12px;
        border: 0;
        border-radius: 0;
        background: transparent;
      }

      #${ID.panel} .crack-ui-font-card > .crack-ui-row:hover {
        background: rgba(255, 255, 255, .045);
      }

      #${ID.panel} .crack-ui-font-color-grid,
      #${ID.panel} .crack-ui-font-field-stack,
      #${ID.panel} .crack-ui-font-range-grid,
      #${ID.panel} .crack-ui-font-choice-row {
        border-top: 1px solid rgba(255, 255, 255, .065);
      }

      #${ID.panel} .crack-ui-font-color-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px;
        padding: 9px;
      }

      #${ID.panel} .crack-ui-font-color-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
        padding: 8px;
        border: 1px solid rgba(255, 255, 255, .06);
        border-radius: 13px;
        background: rgba(255, 255, 255, .025);
      }

      #${ID.panel} .crack-ui-font-control-label {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, .68);
        font-size: 10px;
        font-weight: 800;
        line-height: 1.2;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #${ID.panel} .crack-ui-font-color-inputs {
        display: grid;
        grid-template-columns: 32px minmax(0, 1fr) 34px;
        align-items: center;
        gap: 6px;
      }

      #${ID.panel} .crack-ui-font-accent-switch {
        position: relative;
        display: inline-block;
        width: 34px;
        min-width: 34px;
        height: 20px;
        box-sizing: border-box;
        padding: 0;
        border: 0;
        border-radius: 999px;
        outline: none;
        background: rgba(120, 120, 128, .42);
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, .07),
          inset 0 1px 2px rgba(0, 0, 0, .18);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: background-color 170ms ease, box-shadow 170ms ease, opacity 170ms ease;
      }

      #${ID.panel} .crack-ui-font-accent-switch::after {
        content: "";
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, .30), 0 0 1px rgba(0, 0, 0, .15);
        transform: translateX(0);
        transition: transform 170ms cubic-bezier(.28, 1.25, .35, 1);
      }

      #${ID.panel} .crack-ui-font-accent-switch[data-checked="1"] {
        background: #FE4532;
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, .08),
          inset 0 1px 2px rgba(0, 0, 0, .06);
      }

      #${ID.panel} .crack-ui-font-accent-switch[data-checked="1"]::after {
        transform: translateX(14px);
      }

      #${ID.panel} .crack-ui-font-accent-switch:focus-visible {
        box-shadow:
          0 0 0 3px rgba(254, 69, 50, .18),
          inset 0 0 0 1px rgba(255, 255, 255, .08);
      }

      #${ID.panel} .crack-ui-font-accent-switch:disabled {
        cursor: default;
        opacity: .42;
      }

      /* A highlight card can preserve its child color/switch values while the parent
         feature is off. In that state, desaturate the whole editor so an internally
         saved ON switch does not look actively applied. */
      #${ID.panel} .crack-ui-font-highlight-card[data-feature-enabled="0"] .crack-ui-font-color-grid {
        opacity: .62;
        filter: grayscale(1) saturate(0);
        transition: opacity 170ms ease, filter 170ms ease;
      }

      #${ID.panel} .crack-ui-font-highlight-card[data-feature-enabled="1"] .crack-ui-font-color-grid {
        opacity: 1;
        filter: none;
        transition: opacity 170ms ease, filter 170ms ease;
      }

      #${ID.panel} .crack-ui-font-highlight-card[data-feature-enabled="0"] .crack-ui-font-accent-switch:disabled {
        opacity: .76;
      }

      #${ID.panel} .crack-ui-font-highlight-card[data-feature-enabled="0"] .crack-ui-font-accent-switch[data-checked="1"] {
        background: rgba(120, 120, 128, .42);
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, .07),
          inset 0 1px 2px rgba(0, 0, 0, .18);
      }

      #${ID.panel} .crack-ui-font-color-swatch {
        position: relative;
        width: 32px;
        min-width: 32px;
        height: 30px;
        box-sizing: border-box;
        padding: 3px;
        border: 1px solid rgba(255, 255, 255, .12);
        border-radius: 9px;
        outline: none;
        background: rgba(255, 255, 255, .05);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      #${ID.panel} .crack-ui-font-color-swatch::before {
        content: "";
        position: absolute;
        inset: 3px;
        border-radius: 6px;
        background: var(--crack-ui-font-swatch, #ffffff);
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .16);
      }

      #${ID.panel} .crack-ui-font-color-swatch:hover:not(:disabled),
      #${ID.panel} .crack-ui-font-color-swatch[aria-expanded="true"] {
        border-color: rgba(254, 69, 50, .58);
        box-shadow: 0 0 0 2px rgba(254, 69, 50, .10);
      }

      #${ID.panel} .crack-ui-font-color-swatch:focus-visible {
        border-color: rgba(254, 69, 50, .72);
        box-shadow: 0 0 0 3px rgba(254, 69, 50, .14);
      }

      #${ID.panel} .crack-ui-font-color-swatch:disabled {
        cursor: default;
        opacity: .42;
      }

      #${ID.fontColorPickerPopover} {
        position: fixed;
        z-index: 3;
        width: min(292px, calc(100vw - 20px));
        box-sizing: border-box;
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, .13);
        border-radius: 17px;
        background: rgba(24, 24, 27, .96);
        color: rgba(255, 255, 255, .94);
        box-shadow: 0 18px 42px rgba(0, 0, 0, .36), inset 0 1px 0 rgba(255, 255, 255, .06);
        backdrop-filter: blur(18px) saturate(1.08);
        -webkit-backdrop-filter: blur(18px) saturate(1.08);
        pointer-events: auto;
        font-family: inherit;
      }

      #${ID.fontColorPickerPopover}[hidden] {
        display: none !important;
      }

      #${ID.fontColorPickerPopover} .crack-ui-font-color-picker-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 10px;
      }

      #${ID.fontColorPickerPopover} .crack-ui-font-color-picker-title {
        min-width: 0;
        overflow: hidden;
        font-size: 12px;
        font-weight: 850;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #${ID.fontColorPickerPopover} .crack-ui-font-color-picker-done {
        min-width: 48px;
        height: 28px;
        padding: 0 10px;
        border: 1px solid rgba(254, 69, 50, .44);
        border-radius: 9px;
        background: rgba(254, 69, 50, .12);
        color: inherit;
        font: inherit;
        font-size: 11px;
        font-weight: 800;
        cursor: pointer;
      }

      #${ID.fontColorPickerSv} {
        position: relative;
        width: 100%;
        height: 154px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, .12);
        border-radius: 12px;
        background:
          linear-gradient(to top, #000, transparent),
          linear-gradient(to right, #fff, transparent),
          hsl(var(--crack-ui-font-picker-hue, 0) 100% 50%);
        cursor: crosshair;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
      }

      #${ID.fontColorPickerCursor} {
        position: absolute;
        left: 0;
        top: 100%;
        width: 14px;
        height: 14px;
        box-sizing: border-box;
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, .66), 0 1px 4px rgba(0, 0, 0, .38);
        transform: translate(-50%, -50%);
        pointer-events: none;
      }

      #${ID.fontColorPickerHue} {
        width: 100%;
        height: 22px;
        margin: 10px 0 8px;
        padding: 0;
        border: 0;
        outline: none;
        background: transparent;
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
      }

      #${ID.fontColorPickerHue}::-webkit-slider-runnable-track {
        height: 12px;
        border-radius: 999px;
        background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .16);
      }

      #${ID.fontColorPickerHue}::-moz-range-track {
        height: 12px;
        border: 0;
        border-radius: 999px;
        background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .16);
      }

      #${ID.fontColorPickerHue}::-webkit-slider-thumb {
        width: 19px;
        height: 19px;
        margin-top: -3.5px;
        border: 2px solid #fff;
        border-radius: 50%;
        background: hsl(var(--crack-ui-font-picker-hue, 0) 100% 50%);
        box-shadow: 0 0 0 1px rgba(0, 0, 0, .55), 0 1px 4px rgba(0, 0, 0, .30);
        appearance: none;
        -webkit-appearance: none;
      }

      #${ID.fontColorPickerHue}::-moz-range-thumb {
        width: 15px;
        height: 15px;
        border: 2px solid #fff;
        border-radius: 50%;
        background: hsl(var(--crack-ui-font-picker-hue, 0) 100% 50%);
        box-shadow: 0 0 0 1px rgba(0, 0, 0, .55), 0 1px 4px rgba(0, 0, 0, .30);
      }

      #${ID.fontColorPickerPopover} .crack-ui-font-color-picker-value-row {
        display: grid;
        grid-template-columns: 34px 34px minmax(0, 1fr);
        align-items: center;
        gap: 7px;
      }

      #${ID.fontColorPickerPrevious},
      #${ID.fontColorPickerCurrent} {
        position: relative;
        width: 34px;
        height: 32px;
        box-sizing: border-box;
        padding: 0;
        border: 1px solid rgba(255, 255, 255, .12);
        border-radius: 9px;
        background: var(--crack-ui-font-picker-swatch, #ffffff);
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .16);
      }

      #${ID.fontColorPickerPrevious} {
        cursor: pointer;
      }

      #${ID.fontColorPickerPrevious}::after,
      #${ID.fontColorPickerCurrent}::after {
        position: absolute;
        right: 3px;
        bottom: 2px;
        padding: 1px 3px;
        border-radius: 4px;
        background: rgba(0, 0, 0, .42);
        color: #fff;
        font-size: 7px;
        font-weight: 900;
        line-height: 1.2;
      }

      #${ID.fontColorPickerPrevious}::after { content: "전"; }
      #${ID.fontColorPickerCurrent}::after { content: "현"; }

      #${ID.fontColorPickerHex} {
        width: 100%;
        height: 32px;
        box-sizing: border-box;
        padding: 0 10px;
        border: 1px solid rgba(255, 255, 255, .12);
        border-radius: 9px;
        outline: none;
        background: rgba(255, 255, 255, .055);
        color: inherit;
        font: inherit;
        font-size: 12px;
        font-weight: 750;
        text-transform: lowercase;
      }

      #${ID.fontColorPickerHex}:focus {
        border-color: rgba(254, 69, 50, .56);
        box-shadow: 0 0 0 2px rgba(254, 69, 50, .11);
      }

      #${ID.fontColorPickerPopover} .crack-ui-font-color-picker-recent-label {
        display: block;
        margin: 10px 0 6px;
        color: rgba(255, 255, 255, .56);
        font-size: 9px;
        font-weight: 800;
      }

      #${ID.fontColorPickerRecent} {
        display: grid;
        grid-template-columns: repeat(8, minmax(0, 1fr));
        gap: 5px;
        min-height: 24px;
      }

      #${ID.fontColorPickerRecent} .crack-ui-font-color-recent {
        width: 100%;
        min-width: 0;
        aspect-ratio: 1;
        box-sizing: border-box;
        padding: 0;
        border: 1px solid rgba(255, 255, 255, .13);
        border-radius: 7px;
        background: var(--crack-ui-font-recent-color, transparent);
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .14);
        cursor: pointer;
      }

      #${ID.fontColorPickerRecent} .crack-ui-font-color-recent:hover,
      #${ID.fontColorPickerRecent} .crack-ui-font-color-recent:focus-visible {
        border-color: rgba(254, 69, 50, .72);
        outline: none;
      }

      #${ID.fontColorPickerRecent} .crack-ui-font-color-recent-empty {
        grid-column: 1 / -1;
        color: rgba(255, 255, 255, .38);
        font-size: 9px;
        line-height: 24px;
      }

      #${ID.panel} .crack-ui-font-color-inputs input[type="text"],
      #${ID.panel} .crack-ui-font-field input,
      #${ID.panel} .crack-ui-font-field textarea {
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        border: 1px solid rgba(255, 255, 255, .09);
        border-radius: 10px;
        outline: none;
        background: rgba(255, 255, 255, .045);
        color: rgba(255, 255, 255, .90);
        font: inherit;
        font-size: 11px;
      }

      #${ID.panel} .crack-ui-font-color-inputs input[type="text"],
      #${ID.panel} .crack-ui-font-field input {
        height: 30px;
        padding: 0 8px;
      }

      #${ID.panel} .crack-ui-font-field textarea {
        min-height: 68px;
        padding: 8px;
        resize: vertical;
        line-height: 1.45;
      }

      #${ID.panel} .crack-ui-font-color-inputs input:focus,
      #${ID.panel} .crack-ui-font-field input:focus,
      #${ID.panel} .crack-ui-font-field textarea:focus {
        border-color: rgba(254, 69, 50, .48);
        box-shadow: 0 0 0 2px rgba(254, 69, 50, .10);
      }

      #${ID.panel} .crack-ui-font-field-stack {
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) minmax(150px, .8fr);
        gap: 8px;
        padding: 9px;
      }

      #${ID.panel} .crack-ui-font-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }

      #${ID.panel} .crack-ui-font-webfont-card .crack-ui-font-field-stack {
        grid-template-columns: minmax(0, 1fr);
      }

      #${ID.panel} .crack-ui-font-register-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.55fr) minmax(150px, .7fr);
        gap: 8px;
        min-width: 0;
      }

      #${ID.panel} .crack-ui-font-webfont-card textarea {
        min-height: 48px;
        max-height: 120px;
        resize: vertical;
      }

      #${ID.panel} .crack-ui-font-file-field {
        justify-content: flex-start;
      }

      #${ID.panel} .crack-ui-font-file-button {
        width: 100%;
        height: 34px;
        margin: 0;
      }

      #${ID.panel} .crack-ui-font-file-hint {
        display: block;
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, .42);
        font-size: 9px;
        line-height: 1.35;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #${ID.panel} .crack-ui-font-file-input {
        display: none !important;
      }

      #${ID.panel} .crack-ui-font-select-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        padding: 9px;
        border-top: 1px solid rgba(255, 255, 255, .065);
      }

      #${ID.panel} .crack-ui-font-select-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }


      #${ID.panel} .crack-ui-font-select-field select {
        width: 100%;
        height: 34px;
        min-width: 0;
        box-sizing: border-box;
        padding: 0 32px 0 10px;
        border: 1px solid rgba(255, 255, 255, .09);
        border-radius: 11px;
        outline: none;
        background: rgba(255, 255, 255, .045);
        color: rgba(255, 255, 255, .90);
        font: inherit;
        font-size: 11px;
        font-weight: 700;
      }

      #${ID.panel} .crack-ui-font-preview {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 2px;
        min-height: 54px;
        box-sizing: border-box;
        padding: 8px 10px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, .075);
        border-radius: 11px;
        background: rgba(255, 255, 255, .032);
        color: rgba(255, 255, 255, .86);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.38;
        letter-spacing: normal;
        transition: opacity 130ms ease, border-color 130ms ease, background-color 130ms ease;
      }

      #${ID.panel} .crack-ui-font-preview[data-crack-ui-font-preview="body"] {
        font-family: var(--crack-ui-body-font-stack, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif);
      }

      #${ID.panel} .crack-ui-font-preview[data-crack-ui-font-preview="code"] {
        font-family: var(--crack-ui-code-font-stack, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace);
        font-size: 12px;
        white-space: nowrap;
      }

      #${ID.panel} .crack-ui-font-preview[data-crack-ui-font-preview="title"] {
        font-family: var(--crack-ui-title-font-stack, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif);
        font-size: 13px;
        font-weight: 600;
      }

      #${ID.panel} .crack-ui-font-preview-line {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #${ID.panel} .crack-ui-font-select-field select:disabled + .crack-ui-font-preview {
        opacity: .38;
      }

      #${ID.panel} .crack-ui-font-saved-list {
        display: flex;
        grid-column: 1 / -1;
        flex-wrap: wrap;
        gap: 6px;
        min-height: 26px;
      }

      #${ID.panel} .crack-ui-font-saved-empty {
        display: inline-flex;
        align-items: center;
        min-height: 26px;
        color: rgba(255, 255, 255, .40);
        font-size: 10px;
      }

      #${ID.panel} .crack-ui-font-saved-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        max-width: 100%;
        min-height: 26px;
        box-sizing: border-box;
        padding: 0 4px 0 9px;
        border: 1px solid rgba(255, 255, 255, .08);
        border-radius: 999px;
        background: rgba(255, 255, 255, .045);
      }

      #${ID.panel} .crack-ui-font-saved-name {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, .82);
        font-size: 10px;
        font-weight: 800;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #${ID.panel} .crack-ui-font-saved-type {
        flex: 0 0 auto;
        padding: 2px 5px;
        border-radius: 999px;
        background: rgba(255, 255, 255, .07);
        color: rgba(255, 255, 255, .46);
        font-size: 8px;
        font-weight: 800;
        line-height: 1;
      }

      #${ID.panel} .crack-ui-font-saved-remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        padding: 0;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: rgba(255, 255, 255, .42);
        font-size: 15px;
        line-height: 1;
        cursor: pointer;
      }

      #${ID.panel} .crack-ui-font-saved-remove:hover {
        background: rgba(255, 255, 255, .08);
        color: rgba(255, 255, 255, .92);
      }

      #${ID.panel} .crack-ui-font-action-row {
        display: flex;
        grid-column: 1 / -1;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      #${ID.panel} .crack-ui-font-status {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, .52);
        font-size: 10px;
        line-height: 1.35;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #${ID.panel} .crack-ui-font-action-button,
      #${ID.panel} .crack-ui-font-reset-button,
      #${ID.panel} .crack-ui-font-card-reset-button,
      #${ID.panel} .crack-ui-font-range-reset-button,
      #${ID.panel} .crack-ui-font-choice-button {
        border: 1px solid rgba(255, 255, 255, .09);
        border-radius: 11px;
        background: rgba(255, 255, 255, .05);
        color: rgba(255, 255, 255, .82);
        font-family: inherit;
        font-weight: 800;
        cursor: pointer;
        transform: none !important;
      }

      #${ID.panel} .crack-ui-font-action-button {
        flex: 0 0 auto;
        min-width: 58px;
        height: 30px;
        padding: 0 11px;
        font-size: 11px;
      }

      #${ID.panel} .crack-ui-font-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 46px;
        box-sizing: border-box;
        padding: 11px 12px;
      }

      #${ID.panel} .crack-ui-font-card-reset-button {
        flex: 0 0 auto;
        min-width: 58px;
        height: 30px;
        padding: 0 11px;
        font-size: 11px;
      }

      #${ID.panel} .crack-ui-font-range-actions {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 7px;
        min-width: 0;
      }

      #${ID.panel} .crack-ui-font-range-reset-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        width: 28px;
        height: 28px;
        padding: 0;
        font-size: 17px;
        line-height: 1;
      }

      #${ID.panel} .crack-ui-font-action-button:disabled,
      #${ID.panel} .crack-ui-font-card-reset-button:disabled,
      #${ID.panel} .crack-ui-font-range-reset-button:disabled {
        opacity: .42;
        cursor: not-allowed;
        pointer-events: none;
      }

      #${ID.panel} .crack-ui-font-action-button:hover,
      #${ID.panel} .crack-ui-font-reset-button:hover,
      #${ID.panel} .crack-ui-font-card-reset-button:hover,
      #${ID.panel} .crack-ui-font-range-reset-button:hover,
      #${ID.panel} .crack-ui-font-choice-button:hover {
        border-color: rgba(254, 69, 50, .34);
        background: rgba(254, 69, 50, .10);
        color: rgba(255, 255, 255, .96);
      }

      #${ID.panel} .crack-ui-font-range-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        padding: 9px;
      }

      #${ID.panel} .crack-ui-font-range-grid .crack-ui-range-row {
        padding: 10px;
        border-radius: 14px;
        background: rgba(255, 255, 255, .025);
      }

      #${ID.panel} .crack-ui-font-choice-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px;
        padding: 9px;
      }

      #${ID.panel} .crack-ui-font-choice-button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        min-height: 34px;
        padding: 0 34px 0 12px;
        font-size: 11px;
      }

      #${ID.panel} .crack-ui-font-choice-button::before {
        content: '';
        flex: 0 0 auto;
        width: 12px;
        height: 12px;
        box-sizing: border-box;
        border: 1px solid rgba(255, 255, 255, .28);
        border-radius: 999px;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, .18);
      }

      #${ID.panel} .crack-ui-font-choice-button[data-crack-ui-font-shadow-tone="dark"]::before {
        background: #111214;
      }

      #${ID.panel} .crack-ui-font-choice-button[data-crack-ui-font-shadow-tone="light"]::before {
        border-color: rgba(17, 24, 39, .24);
        background: #ffffff;
      }

      #${ID.panel} .crack-ui-font-choice-button::after {
        content: '✓';
        position: absolute;
        top: 50%;
        right: 11px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 17px;
        height: 17px;
        border-radius: 999px;
        background: rgba(254, 69, 50, .14);
        color: #fe4532;
        font-size: 11px;
        font-weight: 1000;
        line-height: 1;
        opacity: 0;
        transform: translateY(-50%) scale(.72);
        transition: opacity .14s ease, transform .14s ease;
      }

      #${ID.panel} .crack-ui-font-choice-button[data-selected="1"] {
        border-color: rgba(254, 69, 50, .70);
        background: rgba(254, 69, 50, .15);
        color: rgba(255, 255, 255, .98);
        box-shadow: inset 0 0 0 1px rgba(254, 69, 50, .18);
      }

      #${ID.panel} .crack-ui-font-choice-button[data-selected="1"]::after {
        opacity: 1;
        transform: translateY(-50%) scale(1);
      }

      #${ID.panel} .crack-ui-font-choice-row[data-feature-enabled="0"] {
        opacity: .56;
        filter: grayscale(1) saturate(0);
        transition: opacity 170ms ease, filter 170ms ease;
      }

      #${ID.panel} .crack-ui-font-choice-row[data-feature-enabled="0"] .crack-ui-font-choice-button {
        cursor: default;
        pointer-events: none;
        transition: none !important;
      }

      #${ID.panel} .crack-ui-font-choice-row[data-feature-enabled="0"] .crack-ui-font-choice-button:hover,
      #${ID.panel} .crack-ui-font-choice-row[data-feature-enabled="0"] .crack-ui-font-choice-button:active,
      #${ID.panel} .crack-ui-font-choice-row[data-feature-enabled="0"] .crack-ui-font-choice-button:focus-visible {
        transform: none !important;
      }

      #${ID.panel} .crack-ui-font-highlight-grid {
        display: grid;
        grid-template-columns: repeat(10, minmax(0, 1fr));
        gap: 10px;
      }

      #${ID.panel} .crack-ui-font-highlight-card-half {
        grid-column: span 5;
      }

      #${ID.panel} .crack-ui-font-italic-card {
        position: relative;
      }

      #${ID.panel} .crack-ui-font-italic-card > .crack-ui-font-toggle-row > .crack-ui-row-text {
        box-sizing: border-box;
        padding-right: 82px;
      }

      #${ID.panel} .crack-ui-font-italic-style-control {
        position: absolute;
        z-index: 4;
        top: 17px;
        right: 58px;
        display: inline-flex;
        min-height: 24px;
        align-items: center;
        gap: 6px;
        color: rgba(255, 255, 255, .72);
        font-size: 10px;
        font-weight: 800;
        line-height: 1;
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
        transition: opacity 140ms ease, color 140ms ease;
      }

      #${ID.panel} .crack-ui-font-italic-style-control input {
        width: 14px;
        height: 14px;
        margin: 0;
        accent-color: #fe4532;
        cursor: pointer;
      }

      #${ID.panel} .crack-ui-font-italic-style-control[data-disabled="1"] {
        opacity: .42;
        cursor: default;
      }

      #${ID.panel} .crack-ui-font-italic-style-control[data-disabled="1"] input {
        cursor: default;
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-italic-style-control,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-italic-style-control {
        color: rgba(17, 24, 39, .68);
      }

      /* Dialogue quote pairs are edited only when requested. Keeping this editor in an
         overlay prevents the taller dialogue card from stretching the shorter base card. */
      #${ID.panel} .crack-ui-font-dialogue-card {
        position: relative;
        overflow: visible;
        z-index: 3;
      }

      #${ID.panel} .crack-ui-font-dialogue-card > .crack-ui-font-toggle-row {
        /* Keep the normal switch at the far right. Only the text column reserves room
           for the quote button, so the visible order is quote button -> switch. */
        padding-right: 12px;
        border-radius: 17px 17px 0 0;
      }

      #${ID.panel} .crack-ui-font-dialogue-card > .crack-ui-font-toggle-row > .crack-ui-row-text {
        box-sizing: border-box;
        padding-right: 126px;
      }

      #${ID.panel} .crack-ui-font-dialogue-card > .crack-ui-font-color-grid {
        border-radius: 0 0 17px 17px;
      }

      #${ID.panel} .crack-ui-font-quote-tools {
        position: absolute;
        z-index: 18;
        top: 15px;
        right: 58px;
        left: 12px;
        display: flex;
        justify-content: flex-end;
        pointer-events: none;
      }

      #${ID.panel} .crack-ui-font-quote-toggle {
        display: inline-flex;
        height: 28px;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 0 10px;
        border: 1px solid rgba(255, 255, 255, .09);
        border-radius: 999px;
        outline: none;
        background: rgba(255, 255, 255, .045);
        color: rgba(255, 255, 255, .72);
        font: inherit;
        font-size: 10px;
        font-weight: 800;
        line-height: 1;
        white-space: nowrap;
        cursor: pointer;
        pointer-events: auto;
        transition: border-color 140ms ease, background 140ms ease, color 140ms ease;
      }

      #${ID.panel} .crack-ui-font-quote-toggle:hover:not(:disabled),
      #${ID.panel} .crack-ui-font-quote-tools[data-open="1"] .crack-ui-font-quote-toggle {
        border-color: rgba(254, 69, 50, .42);
        background: rgba(254, 69, 50, .10);
        color: rgba(255, 255, 255, .94);
      }

      #${ID.panel} .crack-ui-font-quote-toggle:focus-visible {
        box-shadow: 0 0 0 3px rgba(254, 69, 50, .14);
      }

      #${ID.panel} .crack-ui-font-quote-toggle:disabled {
        cursor: default;
        opacity: .42;
      }

      #${ID.panel} .crack-ui-font-quote-toggle-arrow {
        display: inline-block;
        font-size: 9px;
        transform: rotate(0deg);
        transition: transform 150ms ease;
      }

      #${ID.panel} .crack-ui-font-quote-tools[data-open="1"] .crack-ui-font-quote-toggle-arrow {
        transform: rotate(180deg);
      }

      #${ID.panel} .crack-ui-font-quote-popover {
        position: absolute;
        z-index: 22;
        top: 34px;
        right: -46px;
        left: 0;
        width: auto;
        box-sizing: border-box;
        overflow: hidden;
        pointer-events: auto;
        border: 1px solid rgba(255, 255, 255, .10);
        border-radius: 15px;
        background: rgba(27, 27, 29, .98);
        box-shadow: 0 16px 42px rgba(0, 0, 0, .34);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
      }

      #${ID.panel} .crack-ui-font-quote-popover[hidden] {
        display: none !important;
      }

      #${ID.panel} .crack-ui-font-quote-popover-head {
        display: flex;
        min-height: 34px;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 0 10px;
        border-bottom: 1px solid rgba(255, 255, 255, .07);
      }

      #${ID.panel} .crack-ui-font-quote-popover-title {
        color: rgba(255, 255, 255, .88);
        font-size: 11px;
        font-weight: 850;
      }

      #${ID.panel} .crack-ui-font-quote-popover-note {
        color: rgba(255, 255, 255, .38);
        font-size: 9px;
        font-weight: 700;
      }

      #${ID.panel} .crack-ui-font-quote-editor {
        display: grid;
        gap: 8px;
        padding: 10px;
        transition: opacity 170ms ease, filter 170ms ease;
      }

      #${ID.panel} .crack-ui-font-highlight-card[data-feature-enabled="0"] .crack-ui-font-quote-tools {
        opacity: .62;
        filter: grayscale(1) saturate(0);
      }

      #${ID.panel} .crack-ui-font-quote-chip-list {
        display: flex;
        min-height: 27px;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
      }

      #${ID.panel} .crack-ui-font-quote-chip {
        display: inline-flex;
        min-height: 27px;
        align-items: center;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, .085);
        border-radius: 999px;
        background: rgba(255, 255, 255, .045);
      }

      #${ID.panel} .crack-ui-font-quote-chip-text {
        padding: 0 6px 0 10px;
        color: rgba(255, 255, 255, .88);
        font-size: 12px;
        font-weight: 800;
        line-height: 1;
      }

      #${ID.panel} .crack-ui-font-quote-chip-remove {
        width: 25px;
        min-width: 25px;
        height: 25px;
        padding: 0;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: rgba(255, 255, 255, .48);
        font: inherit;
        font-size: 17px;
        line-height: 1;
        cursor: pointer;
      }

      #${ID.panel} .crack-ui-font-quote-chip-remove:hover {
        background: rgba(255, 255, 255, .07);
        color: rgba(255, 255, 255, .90);
      }

      #${ID.panel} .crack-ui-font-quote-empty {
        color: rgba(255, 255, 255, .38);
        font-size: 10px;
        font-weight: 700;
      }

      #${ID.panel} .crack-ui-font-quote-add-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 16px minmax(0, 1fr) 48px;
        align-items: center;
        gap: 6px;
      }

      #${ID.panel} .crack-ui-font-quote-add-row input {
        width: 100%;
        min-width: 0;
        height: 32px;
        box-sizing: border-box;
        padding: 0 9px;
        border: 1px solid rgba(255, 255, 255, .09);
        border-radius: 11px;
        outline: none;
        background: rgba(255, 255, 255, .045);
        color: rgba(255, 255, 255, .92);
        font: inherit;
        font-size: 12px;
        font-weight: 750;
        text-align: center;
      }

      #${ID.panel} .crack-ui-font-quote-add-row input:focus {
        border-color: rgba(254, 69, 50, .58);
        box-shadow: 0 0 0 3px rgba(254, 69, 50, .10);
      }

      #${ID.panel} .crack-ui-font-quote-arrow {
        color: rgba(255, 255, 255, .34);
        font-size: 12px;
        text-align: center;
      }

      #${ID.panel} .crack-ui-font-quote-add-button {
        height: 32px;
        padding: 0 8px;
        border: 0;
        border-radius: 11px;
        background: #FE4532;
        color: #fff;
        font: inherit;
        font-size: 10px;
        font-weight: 850;
        cursor: pointer;
        transition: opacity 150ms ease, transform 150ms ease;
      }

      #${ID.panel} .crack-ui-font-quote-add-button:active:not(:disabled) {
        transform: scale(.96);
      }

      #${ID.panel} .crack-ui-font-quote-add-button:disabled,
      #${ID.panel} .crack-ui-font-quote-chip-remove:disabled,
      #${ID.panel} .crack-ui-font-quote-add-row input:disabled {
        cursor: default;
        opacity: .42;
      }

      #${ID.panel} .crack-ui-font-reset-button {
        width: 100%;
        min-height: 38px;
        padding: 0 12px;
        font-size: 11px;
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-control-label,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-control-label {
        color: rgba(55, 65, 81, .72);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-card,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-card {
        border-color: rgba(17, 24, 39, .075);
        background: rgba(255, 255, 255, .70);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-color-grid,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-color-grid,
      body[data-theme="light"] #${ID.panel} .crack-ui-font-field-stack,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-field-stack,
      body[data-theme="light"] #${ID.panel} .crack-ui-font-range-grid,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-range-grid,
      body[data-theme="light"] #${ID.panel} .crack-ui-font-choice-row,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-choice-row,
      body[data-theme="light"] #${ID.panel} .crack-ui-font-select-grid,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-select-grid {
        border-top-color: rgba(17, 24, 39, .075);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-color-row,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-color-row,
      body[data-theme="light"] #${ID.panel} .crack-ui-font-range-grid .crack-ui-range-row,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-range-grid .crack-ui-range-row {
        border-color: rgba(17, 24, 39, .065);
        background: rgba(17, 24, 39, .025);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-accent-switch,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-accent-switch {
        background: rgba(120, 120, 128, .28);
        box-shadow:
          inset 0 0 0 1px rgba(17, 24, 39, .07),
          inset 0 1px 2px rgba(0, 0, 0, .07);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-accent-switch[data-checked="1"],
      html[data-theme="light"] #${ID.panel} .crack-ui-font-accent-switch[data-checked="1"] {
        background: #FE4532;
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, .08),
          inset 0 1px 2px rgba(0, 0, 0, .05);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-highlight-card[data-feature-enabled="0"] .crack-ui-font-accent-switch[data-checked="1"],
      html[data-theme="light"] #${ID.panel} .crack-ui-font-highlight-card[data-feature-enabled="0"] .crack-ui-font-accent-switch[data-checked="1"] {
        background: rgba(120, 120, 128, .28);
        box-shadow:
          inset 0 0 0 1px rgba(17, 24, 39, .07),
          inset 0 1px 2px rgba(0, 0, 0, .07);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-color-inputs input[type="text"],
      html[data-theme="light"] #${ID.panel} .crack-ui-font-color-inputs input[type="text"],
      body[data-theme="light"] #${ID.panel} .crack-ui-font-field input,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-field input,
      body[data-theme="light"] #${ID.panel} .crack-ui-font-field textarea,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-field textarea {
        border-color: rgba(17, 24, 39, .09);
        background: rgba(17, 24, 39, .035);
        color: rgba(17, 24, 39, .90);
      }

      body[data-theme="light"] #${ID.fontColorPickerPopover},
      html[data-theme="light"] #${ID.fontColorPickerPopover} {
        border-color: rgba(17, 24, 39, .11);
        background: rgba(255, 255, 255, .97);
        color: rgba(17, 24, 39, .94);
        box-shadow: 0 18px 42px rgba(15, 23, 42, .18), inset 0 1px 0 rgba(255, 255, 255, .82);
      }

      body[data-theme="light"] #${ID.fontColorPickerHex},
      html[data-theme="light"] #${ID.fontColorPickerHex} {
        border-color: rgba(17, 24, 39, .11);
        background: rgba(17, 24, 39, .04);
        color: rgba(17, 24, 39, .92);
      }

      body[data-theme="light"] #${ID.fontColorPickerPopover} .crack-ui-font-color-picker-recent-label,
      html[data-theme="light"] #${ID.fontColorPickerPopover} .crack-ui-font-color-picker-recent-label {
        color: rgba(17, 24, 39, .58);
      }

      body[data-theme="light"] #${ID.fontColorPickerRecent} .crack-ui-font-color-recent-empty,
      html[data-theme="light"] #${ID.fontColorPickerRecent} .crack-ui-font-color-recent-empty {
        color: rgba(17, 24, 39, .42);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-quote-toggle,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-quote-toggle {
        border-color: rgba(17, 24, 39, .09);
        background: rgba(17, 24, 39, .035);
        color: rgba(17, 24, 39, .70);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-quote-toggle:hover:not(:disabled),
      html[data-theme="light"] #${ID.panel} .crack-ui-font-quote-toggle:hover:not(:disabled),
      body[data-theme="light"] #${ID.panel} .crack-ui-font-quote-tools[data-open="1"] .crack-ui-font-quote-toggle,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-quote-tools[data-open="1"] .crack-ui-font-quote-toggle {
        border-color: rgba(254, 69, 50, .45);
        background: rgba(254, 69, 50, .09);
        color: rgba(17, 24, 39, .92);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-quote-popover,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-quote-popover {
        border-color: rgba(17, 24, 39, .10);
        background: rgba(255, 255, 255, .98);
        box-shadow: 0 16px 42px rgba(17, 24, 39, .16);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-quote-popover-head,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-quote-popover-head {
        border-bottom-color: rgba(17, 24, 39, .075);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-quote-popover-title,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-quote-popover-title {
        color: rgba(17, 24, 39, .88);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-quote-popover-note,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-quote-popover-note {
        color: rgba(17, 24, 39, .44);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-quote-chip,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-quote-chip {
        border-color: rgba(17, 24, 39, .08);
        background: rgba(17, 24, 39, .035);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-quote-chip-text,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-quote-chip-text {
        color: rgba(17, 24, 39, .84);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-quote-chip-remove,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-quote-chip-remove {
        color: rgba(17, 24, 39, .40);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-quote-chip-remove:hover,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-quote-chip-remove:hover {
        background: rgba(17, 24, 39, .055);
        color: rgba(17, 24, 39, .82);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-quote-empty,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-quote-empty,
      body[data-theme="light"] #${ID.panel} .crack-ui-font-quote-arrow,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-quote-arrow {
        color: rgba(17, 24, 39, .38);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-quote-add-row input,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-quote-add-row input {
        border-color: rgba(17, 24, 39, .09);
        background: rgba(17, 24, 39, .035);
        color: rgba(17, 24, 39, .90);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-select-field select,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-select-field select {
        border-color: rgba(17, 24, 39, .09);
        background: rgba(17, 24, 39, .035);
        color: rgba(17, 24, 39, .90);
      }


      body[data-theme="light"] #${ID.panel} .crack-ui-font-preview,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-preview {
        border-color: rgba(17, 24, 39, .075);
        background: rgba(17, 24, 39, .025);
        color: rgba(17, 24, 39, .86);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-saved-empty,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-saved-empty {
        color: rgba(17, 24, 39, .42);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-saved-chip,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-saved-chip {
        border-color: rgba(17, 24, 39, .08);
        background: rgba(17, 24, 39, .035);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-saved-name,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-saved-name {
        color: rgba(17, 24, 39, .82);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-saved-type,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-saved-type {
        background: rgba(17, 24, 39, .055);
        color: rgba(17, 24, 39, .48);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-file-hint,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-file-hint {
        color: rgba(75, 85, 99, .58);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-saved-remove,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-saved-remove {
        color: rgba(17, 24, 39, .42);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-status,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-status {
        color: rgba(75, 85, 99, .62);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-action-button,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-action-button,
      body[data-theme="light"] #${ID.panel} .crack-ui-font-reset-button,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-reset-button,
      body[data-theme="light"] #${ID.panel} .crack-ui-font-card-reset-button,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-card-reset-button,
      body[data-theme="light"] #${ID.panel} .crack-ui-font-range-reset-button,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-range-reset-button,
      body[data-theme="light"] #${ID.panel} .crack-ui-font-choice-button,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-choice-button {
        border-color: rgba(17, 24, 39, .09);
        background: rgba(17, 24, 39, .035);
        color: rgba(17, 24, 39, .82);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-choice-button[data-selected="1"],
      html[data-theme="light"] #${ID.panel} .crack-ui-font-choice-button[data-selected="1"] {
        border-color: rgba(254, 69, 50, .72);
        background: rgba(254, 69, 50, .12);
        color: rgba(17, 24, 39, .94);
        box-shadow: inset 0 0 0 1px rgba(254, 69, 50, .16);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-choice-button::before,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-choice-button::before {
        box-shadow: 0 0 0 1px rgba(17, 24, 39, .10);
      }

      @media (max-width: 767px) {
        #${ID.fontColorPickerPopover} {
          width: min(304px, calc(100vw - 16px));
          padding: 11px;
          border-radius: 15px;
        }

        #${ID.fontColorPickerSv} {
          height: 148px;
        }

        #${ID.fontColorPickerRecent} {
          gap: 4px;
        }

        #${ID.panel} .crack-ui-font-color-grid,
        #${ID.panel} .crack-ui-font-field-stack,
        #${ID.panel} .crack-ui-font-range-grid,
        #${ID.panel} .crack-ui-font-highlight-grid,
        #${ID.panel} .crack-ui-font-select-grid,
        #${ID.panel} .crack-ui-font-register-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        #${ID.panel} .crack-ui-font-highlight-card-half {
          grid-column: 1;
        }

        #${ID.panel} .crack-ui-font-dialogue-card > .crack-ui-font-toggle-row {
          padding-right: 12px;
        }

        #${ID.panel} .crack-ui-font-dialogue-card > .crack-ui-font-toggle-row > .crack-ui-row-text {
          padding-right: 116px;
        }

        #${ID.panel} .crack-ui-font-quote-tools {
          right: 58px;
          left: 12px;
        }

        #${ID.panel} .crack-ui-font-quote-popover {
          right: -46px;
          left: 0;
          width: auto;
        }
      }

      html[data-crack-ui-chat-background="viewport"] body [data-crack-ui-chat-background-target="1"] {
        background-color: var(--crack-ui-chat-background-color, #ffffff) !important;
        background-image: var(--crack-ui-chat-background-image, none) !important;
        background-position: center center !important;
        background-repeat: no-repeat !important;
        background-size: cover !important;
      }

      /* The bottom composer shell has its own bg-bg_screen paint. Make only that
         outer shell transparent so the selected color/weather underlay continues
         behind it; the bordered input card keeps its native background. */
      html[data-crack-ui-chat-background="viewport"] body [data-crack-ui-chat-background-composer-shell="1"],
      html[data-crack-ui-chat-background="weather-underlay"] body [data-crack-ui-chat-background-composer-shell="1"],
      html[data-crack-ui-novel-backdrop="on"] body [data-crack-ui-chat-background-composer-shell="1"] {
        background-color: transparent !important;
      }

      /* Weather FX masks/fades its time layer toward the bottom. Keep the Max color
         inside CAWF's isolated root at z-index:-1, so transparent weather pixels reveal
         the selected color instead of Crack's native white/dark frame. */
      #${ID.chatBackgroundLayer} {
        position: absolute !important;
        inset: 0 !important;
        z-index: -1 !important;
        display: block !important;
        pointer-events: none !important;
        background-color: var(--crack-ui-chat-background-color, #ffffff) !important;
        background-image: var(--crack-ui-chat-background-image, none) !important;
        background-position: center center !important;
        background-repeat: no-repeat !important;
        background-size: cover !important;
      }

      /* Novel layout only: keep the tint solid from top to bottom and fade only
         across the left/right edges. The tint itself stays transparent so an active
         CAWF weather/time layer remains visible underneath. */
      html[data-crack-ui-novel-backdrop="on"] body [data-crack-ui-novel-backdrop-target="1"],
      #${ID.novelBackdropWeatherLayer} {
        --crack-ui-novel-backdrop-edge: clamp(32px, 4vw, 64px);
        --crack-ui-novel-backdrop-guard: clamp(9px, 1vw, 15px);
        --crack-ui-novel-backdrop-half: min(
          calc(var(--crack-ui-chat-half-width, 384px) + var(--crack-ui-novel-backdrop-guard)),
          calc(50% - var(--crack-ui-novel-backdrop-edge) - 8px)
        );
        --crack-ui-novel-backdrop-gradient: linear-gradient(90deg,
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), 0) 0%,
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), 0)
            calc(50% - var(--crack-ui-novel-backdrop-half) - var(--crack-ui-novel-backdrop-edge)),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .028))
            calc(50% - var(--crack-ui-novel-backdrop-half) - var(--crack-ui-novel-backdrop-edge) * .90),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .104))
            calc(50% - var(--crack-ui-novel-backdrop-half) - var(--crack-ui-novel-backdrop-edge) * .80),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .216))
            calc(50% - var(--crack-ui-novel-backdrop-half) - var(--crack-ui-novel-backdrop-edge) * .70),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .352))
            calc(50% - var(--crack-ui-novel-backdrop-half) - var(--crack-ui-novel-backdrop-edge) * .60),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .50))
            calc(50% - var(--crack-ui-novel-backdrop-half) - var(--crack-ui-novel-backdrop-edge) * .50),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .648))
            calc(50% - var(--crack-ui-novel-backdrop-half) - var(--crack-ui-novel-backdrop-edge) * .40),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .784))
            calc(50% - var(--crack-ui-novel-backdrop-half) - var(--crack-ui-novel-backdrop-edge) * .30),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .896))
            calc(50% - var(--crack-ui-novel-backdrop-half) - var(--crack-ui-novel-backdrop-edge) * .20),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .972))
            calc(50% - var(--crack-ui-novel-backdrop-half) - var(--crack-ui-novel-backdrop-edge) * .10),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), var(--crack-ui-novel-backdrop-alpha, .34))
            calc(50% - var(--crack-ui-novel-backdrop-half)),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), var(--crack-ui-novel-backdrop-alpha, .34))
            calc(50% + var(--crack-ui-novel-backdrop-half)),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .972))
            calc(50% + var(--crack-ui-novel-backdrop-half) + var(--crack-ui-novel-backdrop-edge) * .10),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .896))
            calc(50% + var(--crack-ui-novel-backdrop-half) + var(--crack-ui-novel-backdrop-edge) * .20),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .784))
            calc(50% + var(--crack-ui-novel-backdrop-half) + var(--crack-ui-novel-backdrop-edge) * .30),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .648))
            calc(50% + var(--crack-ui-novel-backdrop-half) + var(--crack-ui-novel-backdrop-edge) * .40),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .50))
            calc(50% + var(--crack-ui-novel-backdrop-half) + var(--crack-ui-novel-backdrop-edge) * .50),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .352))
            calc(50% + var(--crack-ui-novel-backdrop-half) + var(--crack-ui-novel-backdrop-edge) * .60),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .216))
            calc(50% + var(--crack-ui-novel-backdrop-half) + var(--crack-ui-novel-backdrop-edge) * .70),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .104))
            calc(50% + var(--crack-ui-novel-backdrop-half) + var(--crack-ui-novel-backdrop-edge) * .80),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), calc(var(--crack-ui-novel-backdrop-alpha, .34) * .028))
            calc(50% + var(--crack-ui-novel-backdrop-half) + var(--crack-ui-novel-backdrop-edge) * .90),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), 0)
            calc(50% + var(--crack-ui-novel-backdrop-half) + var(--crack-ui-novel-backdrop-edge)),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), 0) 100%);
        background-color: transparent !important;
        background-image: var(--crack-ui-novel-backdrop-gradient) !important;
        background-repeat: no-repeat !important;
        background-position: center center !important;
        background-size: 100% 100% !important;
      }

      /* Without CAWF, combine the novel tint with Max's selected color/image. */
      html[data-crack-ui-chat-background="viewport"][data-crack-ui-novel-backdrop="on"] body [data-crack-ui-novel-backdrop-target="1"] {
        background-color: var(--crack-ui-chat-background-color, #ffffff) !important;
        background-image:
          var(--crack-ui-novel-backdrop-gradient),
          var(--crack-ui-chat-background-image, none) !important;
        background-repeat: no-repeat, no-repeat !important;
        background-position: center center, center center !important;
        background-size: 100% 100%, cover !important;
      }

      /* With CAWF, the novel tint lives inside the Weather root between its time
         background and its screen-effect layers. The viewport itself stays clear. */
      html[data-crack-ui-chat-background="weather-underlay"] body [data-crack-ui-novel-backdrop-target="1"] {
        background-color: transparent !important;
        background-image: none !important;
      }

      #${ID.novelBackdropWeatherLayer} {
        position: absolute !important;
        inset: 0 !important;
        z-index: 1 !important;
        display: block !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }

      /* CAWF child order is time layer -> rain/ambient/underwater/particles. Pin the
         time palette below the novel tint and only the actual screen effects above it. */
      html[data-crack-ui-novel-backdrop-weather="on"] #cawf-root #cawf-time-layer {
        z-index: 0 !important;
      }

      html[data-crack-ui-novel-backdrop-weather="on"] #cawf-root::before,
      html[data-crack-ui-novel-backdrop-weather="on"] #cawf-root #cawf-rain-canvas,
      html[data-crack-ui-novel-backdrop-weather="on"] #cawf-root #cawf-ambient-layer,
      html[data-crack-ui-novel-backdrop-weather="on"] #cawf-root #cawf-underwater-layer,
      html[data-crack-ui-novel-backdrop-weather="on"] #cawf-root #cawf-particles {
        z-index: 2 !important;
      }

      /* Phone only: the narrow portrait canvas does not need the desktop/tablet
         side fade. Fill the complete chat/weather viewport with one uniform tint;
         the existing opacity slider still controls the alpha. */
      html.${CLS.phoneViewport}[data-crack-ui-novel-backdrop="on"] body [data-crack-ui-novel-backdrop-target="1"],
      html.${CLS.phoneViewport} #${ID.novelBackdropWeatherLayer} {
        --crack-ui-novel-backdrop-gradient: linear-gradient(
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), var(--crack-ui-novel-backdrop-alpha, .34)),
          rgba(var(--crack-ui-novel-backdrop-rgb, 255, 255, 255), var(--crack-ui-novel-backdrop-alpha, .34))
        );
      }

      #${ID.panel} .crack-ui-background-feature-grid {
        align-items: start;
      }

      #${ID.panel} .crack-ui-background-feature-card {
        grid-column: 1 / -1;
      }

      #${ID.panel} .crack-ui-background-feature-card .crack-ui-font-color-grid {
        align-items: stretch;
      }

      #${ID.panel} .crack-ui-background-color-row-wide {
        grid-column: 1 / -1;
      }

      #${ID.panel} .crack-ui-background-color-inputs {
        grid-template-columns: 32px minmax(0, 1fr);
      }

      #${ID.panel} .crack-ui-background-opacity-control {
        justify-content: space-between;
      }

      #${ID.panel} .crack-ui-background-opacity-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 30px;
      }

      #${ID.panel} .crack-ui-background-opacity-control > .crack-ui-range {
        width: 100%;
        margin: 2px 0 0;
      }

      #${ID.panel} .crack-ui-background-image-row {
        grid-column: 1 / -1;
        align-items: start;
      }

      #${ID.panel} .crack-ui-background-image-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 8px;
      }

      #${ID.panel} .crack-ui-background-image-input {
        display: none;
      }

      #${ID.panel} .crack-ui-background-image-meta {
        grid-column: 1 / -1;
        margin-top: -2px;
        font-size: 12px;
        line-height: 1.5;
        color: inherit;
        opacity: .72;
        word-break: break-all;
      }

      #${ID.panel} .crack-ui-background-image-remove {
        min-width: auto;
      }

      #${ID.panel} .crack-ui-background-title-row {
        min-height: 54px;
        padding: 11px 14px;
      }

      /* Use the same inner two-cell layout as the novel backdrop card. */
      #${ID.panel} .crack-ui-background-mode-grid {
        align-items: stretch;
      }

      #${ID.panel} .crack-ui-background-mode-block {
        gap: 8px;
      }

      #${ID.panel} .crack-ui-background-mode-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 28px;
      }

      #${ID.panel} .crack-ui-background-mode-control {
        display: flex;
        align-items: center;
        min-width: 0;
        min-height: 38px;
      }

      #${ID.panel} .crack-ui-background-mode-control .crack-ui-background-color-inputs {
        width: 100%;
      }

      #${ID.panel} .crack-ui-background-image-inline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        width: 100%;
        min-width: 0;
      }

      #${ID.panel} .crack-ui-background-image-inline .crack-ui-background-image-meta {
        flex: 1 1 auto;
        min-width: 0;
        margin: 0;
        padding: 0 2px;
        overflow: hidden;
        font-size: 12px;
        line-height: 1.45;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-break: normal;
      }

      #${ID.panel} .crack-ui-background-image-inline .crack-ui-background-image-actions {
        flex: 0 0 auto;
        justify-content: flex-end;
        flex-wrap: nowrap;
      }

      /* Background mode blocks manage their own enabled appearance. Keep them
         independent from the font highlight card's grayscale state so a newly
         enabled color/image mode immediately shows its real color. */
      #${ID.panel} .crack-ui-background-mode-block[data-feature-enabled="0"] .crack-ui-background-mode-control {
        opacity: .52;
        filter: grayscale(1) saturate(0);
        transition: opacity 170ms ease, filter 170ms ease;
      }

      #${ID.panel} .crack-ui-background-mode-block[data-feature-enabled="1"] .crack-ui-background-mode-control {
        opacity: 1;
        filter: none;
        transition: opacity 170ms ease, filter 170ms ease;
      }

      #${ID.panel} .crack-ui-background-mode-block[data-feature-enabled="0"]:not([data-crack-ui-background-mode="image"]) .crack-ui-background-mode-control {
        pointer-events: none;
      }

      #${ID.panel} .crack-ui-novel-backdrop-controls[data-feature-enabled="0"] .crack-ui-font-color-grid {
        pointer-events: none;
      }

      #${ID.panel} .crack-ui-novel-backdrop-controls[data-crack-ui-novel-layout-enabled="0"] > .crack-ui-row {
        opacity: .52;
        filter: grayscale(1) saturate(0);
        cursor: default;
      }

      #${ID.panel} .crack-ui-novel-backdrop-controls[data-crack-ui-novel-layout-enabled="0"] .crack-ui-font-color-grid {
        opacity: .48;
        filter: grayscale(1) saturate(0);
        pointer-events: none;
      }

      /* Code text color belongs to the code-block highlight feature. Resetting it
         removes only this override, so Crack's native syntax colors remain authoritative. */
      html[data-crack-ui-font-code-text-color="on"] body main .wrtn-codeblock pre,
      html[data-crack-ui-font-code-text-color="on"] body main .wrtn-codeblock pre *,
      html[data-crack-ui-font-code-text-color="on"] body main .wrtn-codeblock code,
      html[data-crack-ui-font-code-text-color="on"] body main .wrtn-codeblock code *,
      html[data-crack-ui-font-code-text-color="on"] body main .wrtn-markdown pre,
      html[data-crack-ui-font-code-text-color="on"] body main .wrtn-markdown pre * {
        color: var(--crack-ui-font-code-text) !important;
        -webkit-text-fill-color: var(--crack-ui-font-code-text) !important;
      }

      html[data-crack-ui-font-body-font="on"] body main .wrtn-markdown,
      html[data-crack-ui-font-body-font="on"] body main .wrtn-markdown :is(p, li, blockquote, h1, h2, h3, h4, h5, h6, em, strong, a) {
        font-family: var(--crack-ui-body-font-stack), 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif !important;
      }

      html[data-crack-ui-font-code-font="on"] body main .wrtn-codeblock,
      html[data-crack-ui-font-code-font="on"] body main .wrtn-codeblock *,
      html[data-crack-ui-font-code-font="on"] body main .wrtn-markdown pre,
      html[data-crack-ui-font-code-font="on"] body main .wrtn-markdown pre * {
        font-family: var(--crack-ui-code-font-stack), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace !important;
      }

      html[data-crack-ui-font-title-font="on"] body [data-crack-ui-room-top-bar="1"] > button:first-child > span:first-child {
        font-family: var(--crack-ui-title-font-stack), 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif !important;
      }

      html[data-crack-ui-font-size="on"] body main .wrtn-markdown :is(p, li, blockquote, h1, h2, h3, h4, h5, h6) {
        font-size: calc(1em * var(--crack-ui-font-text-scale)) !important;
      }

      html[data-crack-ui-font-size="on"] body main .wrtn-markdown :is(p, li, blockquote, h1, h2, h3, h4, h5, h6) :is(span, em, strong, a, code) {
        font-size: inherit !important;
      }

      html[data-crack-ui-font-line-height="on"] body main .wrtn-markdown :is(p, li, blockquote, h1, h2, h3, h4, h5, h6) {
        line-height: var(--crack-ui-font-line-height) !important;
      }

      html[data-crack-ui-font-line-height="on"] body main .wrtn-markdown :is(p, li, blockquote, h1, h2, h3, h4, h5, h6) :is(span, em, strong, a, code) {
        line-height: inherit !important;
      }

      html[data-crack-ui-font-letter-spacing="on"] body main .wrtn-markdown :is(p, li, blockquote, h1, h2, h3, h4, h5, h6) {
        letter-spacing: var(--crack-ui-font-letter-spacing) !important;
      }

      html[data-crack-ui-font-letter-spacing="on"] body main .wrtn-markdown :is(p, li, blockquote, h1, h2, h3, h4, h5, h6) :is(span, em, strong, a, code) {
        letter-spacing: inherit !important;
      }

      /* Crack gives inline Markdown nodes such as <em> their own font-weight.
         Apply the selected weight to every text-bearing descendant so dialogue,
         narration (*em*), **strong**, links and code all move together. */
      html[data-crack-ui-font-weight="on"] body main .wrtn-markdown,
      html[data-crack-ui-font-weight="on"] body main .wrtn-markdown :is(
        p, li, blockquote, h1, h2, h3, h4, h5, h6,
        span, em, i, strong, b, a, code, pre, del, s, mark,
        kbd, samp, small, sub, sup, th, td
      ),
      html[data-crack-ui-font-weight="on"] body main .wrtn-codeblock,
      html[data-crack-ui-font-weight="on"] body main .wrtn-codeblock * {
        font-weight: var(--crack-ui-font-weight) !important;
      }

      html[data-crack-ui-font-paragraph-spacing="on"] body main .wrtn-markdown :is(p, blockquote) {
        margin-top: 0 !important;
        margin-bottom: var(--crack-ui-font-paragraph-spacing) !important;
      }

      html[data-crack-ui-font-paragraph-spacing="on"] body main .wrtn-markdown :is(p, blockquote):last-child {
        margin-bottom: 0 !important;
      }

      html[data-crack-ui-font-paragraph-spacing="on"] body main .wrtn-markdown li {
        margin-top: calc(var(--crack-ui-font-paragraph-spacing) * .25) !important;
        margin-bottom: calc(var(--crack-ui-font-paragraph-spacing) * .25) !important;
      }

      html[data-crack-ui-font-code-size="on"] body main .wrtn-codeblock,
      html[data-crack-ui-font-code-size="on"] body main .wrtn-markdown pre {
        --crack-ui-font-code-size: calc(14px * var(--crack-ui-font-code-scale));
      }

      html[data-crack-ui-font-code-size="on"] body main .wrtn-codeblock :is(pre, code, span, div),
      html[data-crack-ui-font-code-size="on"] body main .wrtn-markdown pre,
      html[data-crack-ui-font-code-size="on"] body main .wrtn-markdown pre * {
        font-size: var(--crack-ui-font-code-size) !important;
      }

      /* Keep the shadow soft enough to separate text from busy backgrounds,
         but limit the blur radius and outer opacity so it does not look foggy. */
      html[data-crack-ui-font-shadow="on"][data-crack-ui-font-shadow-tone="dark"] body main .wrtn-markdown {
        filter: none !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, .62), 0 0 4px rgba(0, 0, 0, .18) !important;
      }

      html[data-crack-ui-font-shadow="on"][data-crack-ui-font-shadow-tone="light"] body main .wrtn-markdown {
        filter: none !important;
        text-shadow: 0 1px 2px rgba(255, 255, 255, .66), 0 0 4px rgba(255, 255, 255, .20) !important;
      }

      html[data-crack-ui-font-base="on"] body main [data-crack-ui-font-base="1"] {
        color: var(--crack-ui-font-base-text, inherit) !important;
      }

      html[data-crack-ui-font-dialogue="on"] body main [data-crack-ui-font-quote="double"] {
        color: var(--crack-ui-font-dialogue-text, inherit) !important;
      }

      html[data-crack-ui-font-thought="on"] body main [data-crack-ui-font-quote="single"] {
        color: var(--crack-ui-font-thought-text, inherit) !important;
      }

      html[data-crack-ui-font-italic="on"] body main .wrtn-markdown em {
        font-style: normal !important;
      }

      html[data-crack-ui-font-italic="on"][data-crack-ui-font-italic-text-color="on"] body main .wrtn-markdown em {
        color: var(--crack-ui-font-italic-text, #85837d) !important;
      }

      html[data-crack-ui-font-italic="on"][data-crack-ui-font-italic-style="on"] body main .wrtn-markdown em {
        font-style: italic !important;
      }

      html[data-crack-ui-font-strong-bg="on"] body main .wrtn-markdown strong {
        color: var(--crack-ui-font-strong-highlight-text, inherit) !important;
      }

      html[data-crack-ui-font-base="on"][data-crack-ui-font-base-accent="on"] body main [data-crack-ui-font-base="1"],
      html[data-crack-ui-font-dialogue="on"][data-crack-ui-font-dialogue-accent="on"] body main [data-crack-ui-font-quote="double"],
      html[data-crack-ui-font-thought="on"][data-crack-ui-font-thought-accent="on"] body main [data-crack-ui-font-quote="single"],
      html[data-crack-ui-font-italic="on"][data-crack-ui-font-italic-accent="on"] body main .wrtn-markdown em,
      html[data-crack-ui-font-strong-bg="on"][data-crack-ui-font-strong-accent="on"] body main .wrtn-markdown strong {
        -webkit-box-decoration-break: clone;
        box-decoration-break: clone;
        border-radius: 6px;
        padding: 0 .16em .03em;
        background-position: 0 .08em;
        background-size: 100% calc(100% - .18em);
        background-repeat: no-repeat;
      }

      html[data-crack-ui-font-base="on"][data-crack-ui-font-base-accent="on"] body main [data-crack-ui-font-base="1"] {
        background-image: linear-gradient(
          rgba(var(--crack-ui-font-base-rgb, 232,224,228), .18),
          rgba(var(--crack-ui-font-base-rgb, 232,224,228), .18)
        );
      }

      html[data-crack-ui-font-dialogue="on"][data-crack-ui-font-dialogue-accent="on"] body main [data-crack-ui-font-quote="double"] {
        background-image: linear-gradient(
          rgba(var(--crack-ui-font-dialogue-rgb, 178,154,166), .34),
          rgba(var(--crack-ui-font-dialogue-rgb, 178,154,166), .34)
        );
      }

      html[data-crack-ui-font-thought="on"][data-crack-ui-font-thought-accent="on"] body main [data-crack-ui-font-quote="single"] {
        background-image: linear-gradient(
          rgba(var(--crack-ui-font-thought-rgb, 168,154,166), .28),
          rgba(var(--crack-ui-font-thought-rgb, 168,154,166), .28)
        );
      }

      html[data-crack-ui-font-italic="on"][data-crack-ui-font-italic-accent="on"] body main .wrtn-markdown em {
        background-image: linear-gradient(
          rgba(var(--crack-ui-font-italic-rgb, 232,224,228), .18),
          rgba(var(--crack-ui-font-italic-rgb, 232,224,228), .18)
        );
      }

      html[data-crack-ui-font-strong-bg="on"][data-crack-ui-font-strong-accent="on"] body main .wrtn-markdown strong {
        background-image: linear-gradient(
          rgba(var(--crack-ui-font-strong-rgb, 240,224,232), .22),
          rgba(var(--crack-ui-font-strong-rgb, 240,224,232), .22)
        );
      }

      html[data-crack-ui-font-code-bg="on"] body main .wrtn-codeblock,
      html[data-crack-ui-font-code-bg="on"] body main .wrtn-markdown pre {
        overflow: hidden;
        border: 1px solid rgba(var(--crack-ui-font-code-rgb, 200,166,182), .30) !important;
        border-radius: 14px !important;
        background: rgba(var(--crack-ui-font-code-rgb, 200,166,182), .10) !important;
        box-shadow: none !important;
      }

      html[data-crack-ui-font-code-bg="on"] body main .wrtn-codeblock > :first-child {
        border-bottom: 0 !important;
        background: rgba(var(--crack-ui-font-code-rgb, 200,166,182), .16) !important;
      }

      html[data-crack-ui-font-code-bg="on"] body main .wrtn-codeblock > :nth-child(2),
      html[data-crack-ui-font-code-bg="on"] body main .wrtn-codeblock > :nth-child(2) > pre {
        border-top: 0 !important;
        border-block-start: 0 !important;
        border-top-left-radius: 0 !important;
        border-top-right-radius: 0 !important;
        border-start-start-radius: 0 !important;
        border-start-end-radius: 0 !important;
        margin-top: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
      }

      html[data-crack-ui-font-code-bg="on"] body main .wrtn-codeblock > :nth-child(2) > pre {
        border-left: 0 !important;
        border-right: 0 !important;
        border-bottom: 0 !important;
        border-radius: 0 !important;
      }

      html[data-crack-ui-font-code-bg="on"] body main .wrtn-codeblock :is(pre, code),
      html[data-crack-ui-font-code-bg="on"] body main .wrtn-codeblock :is(pre, code) *,
      html[data-crack-ui-font-code-bg="on"] body main .wrtn-markdown pre code,
      html[data-crack-ui-font-code-bg="on"] body main .wrtn-markdown pre code * {
        background-color: transparent !important;
        background-image: none !important;
        box-shadow: none !important;
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

      body[data-theme="light"] #${ID.panel} .crack-ui-panel-preview,
      html[data-theme="light"] #${ID.panel} .crack-ui-panel-preview,
      body[data-theme="light"] #${ID.panel} .crack-ui-panel-close,
      html[data-theme="light"] #${ID.panel} .crack-ui-panel-close {
        background: rgba(17, 24, 39, .06);
        color: rgba(75, 85, 99, .78);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-panel-preview:hover,
      html[data-theme="light"] #${ID.panel} .crack-ui-panel-preview:hover,
      body[data-theme="light"] #${ID.panel} .crack-ui-panel-preview[data-pressed="1"],
      html[data-theme="light"] #${ID.panel} .crack-ui-panel-preview[data-pressed="1"],
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
      html[data-theme="light"] #${ID.panel} .crack-ui-row[data-disabled="1"] .crack-ui-switch {
        background: rgba(120, 120, 128, .30) !important;
        box-shadow:
          inset 0 0 0 1px rgba(17, 24, 39, .07),
          inset 0 1px 2px rgba(0, 0, 0, .06) !important;
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-row[data-disabled="1"] .crack-ui-toggle:checked + .crack-ui-switch,
      html[data-theme="light"] #${ID.panel} .crack-ui-row[data-disabled="1"] .crack-ui-toggle:checked + .crack-ui-switch,
      body[data-theme="light"] #${ID.panel} .crack-ui-row[data-disabled="1"] .crack-ui-toggle:disabled:checked + .crack-ui-switch,
      html[data-theme="light"] #${ID.panel} .crack-ui-row[data-disabled="1"] .crack-ui-toggle:disabled:checked + .crack-ui-switch {
        background: rgba(254, 69, 50, .30) !important;
        box-shadow:
          inset 0 0 0 1px rgba(254, 69, 50, .13),
          inset 0 1px 2px rgba(0, 0, 0, .05) !important;
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
        overflow: clip;
        overflow-anchor: none;
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
        overflow-anchor: none;
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

      /* Mobile browsers may interpret a vertical finger drift on a native range as panel
         scrolling. Lock only the font panel scroller for the duration of that gesture. */
      #${ID.panel}[data-crack-ui-font-range-touch-lock="1"] .crack-ui-panel-body {
        overflow-y: hidden !important;
        overscroll-behavior: none !important;
        touch-action: none !important;
      }


      #${ID.panel}[data-crack-ui-range-preview="1"] > .crack-ui-panel-head:not([data-crack-ui-range-preview-path="1"]),
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

      #${ID.panel}[data-crack-ui-range-preview="1"] .crack-ui-section-body > :not([data-crack-ui-range-preview-active="1"]):not([data-crack-ui-range-preview-path="1"]) {
        opacity: 0 !important;
        pointer-events: none !important;
      }

      /* Font controls are nested inside a card/grid, unlike the original image/chat-width
         sliders. Keep only the ancestor chain that leads to the active range row, then make
         every sibling on that chain disappear. This gives every range the same live-preview UI. */
      #${ID.panel}[data-crack-ui-range-preview="1"] [data-crack-ui-range-preview-path="1"] {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        background: transparent !important;
        border-color: transparent !important;
        box-shadow: none !important;
      }

      #${ID.panel}[data-crack-ui-range-preview="1"] [data-crack-ui-range-preview-path="1"] > :not([data-crack-ui-range-preview-path="1"]):not([data-crack-ui-range-preview-active="1"]) {
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
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        width: auto;
        min-width: 0;
        padding: 4px 8px 4px 0;
        gap: 6px;
        overflow: visible;
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

      #${ID.panel} .crack-ui-font-preset-dock {
        position: relative;
        display: inline-flex;
        flex: 0 0 auto;
        width: 24px;
        height: 24px;
        min-width: 24px;
        align-items: center;
        justify-content: center;
      }

      #${ID.panel} .crack-ui-font-preset-dock[hidden] {
        display: none !important;
      }

      #${ID.panel} .crack-ui-panel-preset {
        appearance: none;
        display: inline-flex;
        width: 24px;
        height: 24px;
        min-width: 24px;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, .07);
        color: rgba(255, 255, 255, .62);
        font-family: inherit;
        font-size: 0;
        line-height: 1;
        cursor: pointer;
        transform: none !important;
        transition: background-color 130ms ease, color 130ms ease;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }

      #${ID.panel} .crack-ui-panel-preset svg {
        display: block;
        width: 15px;
        height: 15px;
        pointer-events: none;
      }

      #${ID.panel} .crack-ui-panel-preset:hover,
      #${ID.panel} .crack-ui-font-preset-dock[data-open="1"] .crack-ui-panel-preset {
        background: rgba(255, 255, 255, .12);
        color: rgba(255, 255, 255, .90);
      }

      #${ID.panel} .crack-ui-panel-preset:active {
        transform: none !important;
        background: rgba(255, 255, 255, .16);
        color: rgba(255, 255, 255, .98);
      }

      #${ID.panel} .crack-ui-font-preset-popover {
        position: absolute;
        z-index: 60;
        top: calc(100% + 8px);
        right: -30px;
        display: flex;
        width: 300px;
        max-width: min(300px, calc(100vw - 28px));
        max-height: min(430px, calc(100vh - 92px));
        flex-direction: column;
        box-sizing: border-box;
        padding: 10px;
        gap: 9px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, .10);
        border-radius: 14px;
        background: rgb(27, 28, 31);
        box-shadow: 0 18px 44px rgba(0, 0, 0, .34), 0 2px 10px rgba(0, 0, 0, .22);
        contain: layout paint;
      }

      #${ID.panel} .crack-ui-font-preset-popover[hidden] {
        display: none !important;
      }

      #${ID.panel} .crack-ui-font-preset-head {
        display: flex;
        min-width: 0;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 0 1px;
      }

      #${ID.panel} .crack-ui-font-preset-title {
        color: rgba(255, 255, 255, .91);
        font-size: 12px;
        font-weight: 900;
        line-height: 1.2;
      }

      #${ID.panel} .crack-ui-font-preset-head-note {
        color: rgba(255, 255, 255, .40);
        font-size: 9px;
        font-weight: 750;
        line-height: 1;
      }

      #${ID.panel} .crack-ui-font-preset-list {
        display: flex;
        min-width: 0;
        max-height: 246px;
        flex-direction: column;
        gap: 2px;
        overflow-x: hidden;
        overflow-y: auto;
        padding: 2px 0;
        overscroll-behavior: contain;
      }

      #${ID.panel} .crack-ui-font-preset-empty {
        display: flex;
        min-height: 64px;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 12px;
        border: 1px dashed rgba(255, 255, 255, .10);
        border-radius: 10px;
        color: rgba(255, 255, 255, .38);
        font-size: 10px;
        font-weight: 700;
        line-height: 1.35;
        text-align: center;
      }

      #${ID.panel} .crack-ui-font-preset-item {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 30px;
        min-width: 0;
        align-items: stretch;
        border-bottom: 1px solid rgba(255, 255, 255, .055);
      }

      #${ID.panel} .crack-ui-font-preset-item:last-child {
        border-bottom: 0;
      }

      #${ID.panel} .crack-ui-font-preset-load,
      #${ID.panel} .crack-ui-font-preset-remove,
      #${ID.panel} .crack-ui-font-preset-save {
        appearance: none;
        border: 0;
        font-family: inherit;
        cursor: pointer;
      }

      #${ID.panel} .crack-ui-font-preset-load {
        display: flex;
        min-width: 0;
        min-height: 38px;
        align-items: center;
        justify-content: flex-start;
        padding: 0 8px;
        border-radius: 8px;
        background: transparent;
        color: rgba(255, 255, 255, .78);
        font-size: 10px;
        font-weight: 800;
        text-align: left;
        transition: none;
      }

      #${ID.panel} .crack-ui-font-preset-load:hover {
        background: rgba(255, 255, 255, .055);
        color: rgba(255, 255, 255, .98);
      }

      #${ID.panel} .crack-ui-font-preset-load-name {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #${ID.panel} .crack-ui-font-preset-remove {
        display: inline-flex;
        width: 30px;
        min-width: 30px;
        min-height: 38px;
        align-items: center;
        justify-content: center;
        padding: 0;
        border-radius: 8px;
        background: transparent;
        color: rgba(255, 255, 255, .34);
        font-size: 15px;
        line-height: 1;
        transition: none;
      }

      #${ID.panel} .crack-ui-font-preset-remove:hover {
        background: rgba(254, 69, 50, .10);
        color: rgba(254, 100, 86, .92);
      }

      #${ID.panel} .crack-ui-font-preset-create {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 6px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, .07);
      }

      #${ID.panel} .crack-ui-font-preset-name {
        appearance: none;
        width: 100%;
        min-width: 0;
        height: 34px;
        box-sizing: border-box;
        padding: 0 10px;
        border: 1px solid rgba(255, 255, 255, .10);
        border-radius: 9px;
        outline: none;
        background: rgba(0, 0, 0, .18);
        color: rgba(255, 255, 255, .92);
        font-family: inherit;
        font-size: 10px;
        font-weight: 700;
      }

      #${ID.panel} .crack-ui-font-preset-name:focus {
        border-color: rgba(254, 69, 50, .52);
        box-shadow: 0 0 0 2px rgba(254, 69, 50, .09);
      }

      #${ID.panel} .crack-ui-font-preset-save {
        min-height: 34px;
        padding: 0 11px;
        border-radius: 9px;
        background: rgba(254, 69, 50, .14);
        color: rgba(255, 255, 255, .92);
        font-size: 10px;
        font-weight: 900;
        white-space: nowrap;
        transition: none;
      }

      #${ID.panel} .crack-ui-font-preset-save:hover {
        background: rgba(254, 69, 50, .23);
      }

      #${ID.panel} .crack-ui-font-preset-status {
        min-height: 12px;
        color: rgba(255, 255, 255, .42);
        font-size: 9px;
        font-weight: 700;
        line-height: 1.3;
        overflow-wrap: anywhere;
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
        overflow-anchor: none;
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

      body[data-theme="light"] #${ID.panel} .crack-ui-panel-preset,
      html[data-theme="light"] #${ID.panel} .crack-ui-panel-preset {
        background: rgba(17, 24, 39, .06);
        color: rgba(75, 85, 99, .78);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-panel-preset:hover,
      html[data-theme="light"] #${ID.panel} .crack-ui-panel-preset:hover,
      body[data-theme="light"] #${ID.panel} .crack-ui-font-preset-dock[data-open="1"] .crack-ui-panel-preset,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-preset-dock[data-open="1"] .crack-ui-panel-preset {
        background: rgba(17, 24, 39, .10);
        color: rgba(17, 24, 39, .92);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-preset-popover,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-preset-popover {
        border-color: rgba(17, 24, 39, .09);
        background: rgb(255, 255, 255);
        box-shadow: 0 18px 44px rgba(17, 24, 39, .15), 0 2px 10px rgba(17, 24, 39, .08);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-preset-title,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-preset-title {
        color: rgba(17, 24, 39, .92);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-preset-head-note,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-preset-head-note,
      body[data-theme="light"] #${ID.panel} .crack-ui-font-preset-status,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-preset-status {
        color: rgba(75, 85, 99, .55);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-preset-empty,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-preset-empty {
        border-color: rgba(17, 24, 39, .10);
        color: rgba(75, 85, 99, .54);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-preset-item,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-preset-item,
      body[data-theme="light"] #${ID.panel} .crack-ui-font-preset-create,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-preset-create {
        border-color: rgba(17, 24, 39, .07);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-preset-load,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-preset-load {
        color: rgba(55, 65, 81, .84);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-preset-load:hover,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-preset-load:hover {
        background: rgba(17, 24, 39, .045);
        color: rgba(17, 24, 39, .98);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-preset-remove,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-preset-remove {
        color: rgba(75, 85, 99, .38);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-preset-name,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-preset-name {
        border-color: rgba(17, 24, 39, .10);
        background: rgba(17, 24, 39, .025);
        color: rgba(17, 24, 39, .92);
      }

      body[data-theme="light"] #${ID.panel} .crack-ui-font-preset-save,
      html[data-theme="light"] #${ID.panel} .crack-ui-font-preset-save {
        color: rgba(96, 28, 20, .94);
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

        #${ID.panel} .crack-ui-panel-nav {
          flex-wrap: wrap;
          overflow-x: hidden;
          overflow-y: visible;
        }

        #${ID.panel} .crack-ui-font-preset-popover {
          right: -30px;
          width: min(300px, calc(100vw - 28px));
          max-width: min(300px, calc(100vw - 28px));
          max-height: min(390px, calc(100vh - 82px));
        }

        #${ID.panel} .crack-ui-font-preset-list {
          max-height: 206px;
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

  function invalidateCrackUiViewportMetrics() {
    cachedCrackUiViewportWidth = null;
    cachedTouchLikeDevice = null;
  }

  function isTouchLikeDevice() {
    if (cachedTouchLikeDevice != null) return cachedTouchLikeDevice;
    cachedTouchLikeDevice = window.matchMedia('(max-width: 767px), (hover: none), (pointer: coarse)').matches;
    return cachedTouchLikeDevice;
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
    if (Number.isFinite(cachedCrackUiViewportWidth) && cachedCrackUiViewportWidth > 0) {
      return cachedCrackUiViewportWidth;
    }

    const values = [
      window.innerWidth,
      document.documentElement?.clientWidth,
      window.visualViewport?.width,
      window.screen?.width,
      window.screen?.availWidth,
    ]
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0);

    cachedCrackUiViewportWidth = values.length ? Math.min(...values) : window.innerWidth;
    return cachedCrackUiViewportWidth;
  }

  function isPhoneLikeViewport() {
    return getCrackUiViewportWidth() <= 767;
  }

  function isTabletLikeViewport() {
    const width = getCrackUiViewportWidth();
    return width > 767 && width <= 1180 && isTouchLikeDevice();
  }

  function updateDeviceViewportClasses() {
    const width = getCrackUiViewportWidth();
    const phone = width <= 767;
    const tablet = !phone && width <= 1180 && isTouchLikeDevice();
    const root = document.documentElement;
    root.classList.toggle(CLS.phoneViewport, phone);
    root.classList.toggle(CLS.tabletViewport, tablet);
    root.classList.toggle(CLS.androidFirefox, isAndroidFirefoxBrowser());
  }

  function runCrackUiViewportRefresh() {
    viewportRefreshRaf = 0;
    invalidateCrackUiViewportMetrics();
    updateDeviceViewportClasses();
    applyChatWidth();
    updateChatWidthUi();
    scheduleMenuSwipeZonePosition();
    scheduleCrackUiChatBackgroundApply();

    if (isBottomModelPopupOpen()) {
      positionBottomModelPopup(document.getElementById(ID.bottomModelButton));
    }
  }

  function scheduleCrackUiViewportRefresh() {
    invalidateCrackUiViewportMetrics();
    if (viewportRefreshRaf) return;
    viewportRefreshRaf = requestAnimationFrame(runCrackUiViewportRefresh);
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
    const message = `Crack UI Max: ${label} 저장 실패\n${describeEpisodeUiError(error)}\n${tokenHint}\n\n원본 설정에서는 되는 상태면 이 문구를 그대로 보내줘.`;
    writeStorage(LS.lastEpisodeUiError, message);
    reportCrackUiError('episode-ui-save', error);
    console.warn('[Crack UI Max] episode UI setting save failed', error);
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
    applyCrackUiChatBackground();
    refreshCrackUiFontThemeDefaults({ force: true });

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
    let defaultsChanged = false;
    for (const [mode, label] of Object.entries(THEME_MODE_LABEL)) {
      if (isOriginalSettingChecked(label) === true && themeMode !== mode) {
        themeMode = normalizeThemeMode(mode);
        writeStorage(LS.themeMode, themeMode);
        applyThemeModeHint();
        defaultsChanged = true;
        break;
      }
    }

    for (const [mode, label] of Object.entries(EPISODE_UI_MODE_LABEL)) {
      if (isOriginalSettingChecked(label) === true && episodeUiMode !== mode) {
        episodeUiMode = normalizeEpisodeUiMode(mode);
        writeStorage(LS.episodeUiMode, episodeUiMode);
        defaultsChanged = true;
        break;
      }
    }
    if (defaultsChanged) refreshCrackUiFontThemeDefaults({ force: true });
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
    document.documentElement.style.setProperty('--crack-ui-chat-half-width', getCssHalfWidthFromPercent(chatWidthPercent));
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

    syncCrackUiChatBackgroundUi(document.getElementById(ID.panel));
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
    refreshCrackUiFontThemeDefaults({ force: true });
    applyOriginalSettingChoice(themeMode, THEME_MODE_LABEL, LS.pendingThemeMode);
    // Crack may commit the original setting asynchronously. Reconfirm after that transition,
    // while the signature guard prevents unnecessary repeated work.
    requestAnimationFrame(() => refreshCrackUiFontThemeDefaults());
    setTimeout(() => refreshCrackUiFontThemeDefaults(), 180);
  }

  function setEpisodeUiMode(nextMode) {
    episodeUiMode = normalizeEpisodeUiMode(nextMode);
    writeStorage(LS.episodeUiMode, episodeUiMode);
    writeStorage(LS.pendingEpisodeUiMode, episodeUiMode);
    updateThemeUi();
    refreshCrackUiFontThemeDefaults({ force: true });
    applyCrackUiChatBackground();

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
    const row = input.closest?.('.crack-ui-range-row, [data-crack-ui-range-preview-row="1"]');
    if (!panel || !row) return;

    activePanelRangePreviewInput = input;
    panel.querySelectorAll('[data-crack-ui-range-preview-active="1"]').forEach((element) => {
      if (element !== row) delete element.dataset.crackUiRangePreviewActive;
    });
    panel.querySelectorAll('[data-crack-ui-range-preview-path="1"]').forEach((element) => {
      delete element.dataset.crackUiRangePreviewPath;
    });

    row.dataset.crackUiRangePreviewActive = '1';

    if (input.matches?.('[data-crack-ui-font-range], [data-crack-ui-novel-backdrop-opacity]')) {
      const scroller = panel.querySelector('.crack-ui-panel-body');
      activeCrackUiFontRangeScroller = scroller || null;
      activeCrackUiFontRangeScrollTop = scroller?.scrollTop || 0;
      activeCrackUiFontRangeScrollLeft = scroller?.scrollLeft || 0;
      panel.dataset.crackUiFontRangeTouchLock = '1';
    } else {
      activeCrackUiFontRangeScroller = null;
      activeCrackUiFontRangeScrollTop = 0;
      activeCrackUiFontRangeScrollLeft = 0;
      delete panel.dataset.crackUiFontRangeTouchLock;
    }

    // Original image/chat-width sliders sit directly in the section body, while font ranges
    // are nested in a font card and a two-column grid. Mark the full ancestor path so CSS can
    // hide every sibling but still leave the dragged font slider visible.
    const sectionBody = row.closest('.crack-ui-section-body');
    let ancestor = row.parentElement;
    while (ancestor && ancestor !== sectionBody && ancestor !== panel) {
      ancestor.dataset.crackUiRangePreviewPath = '1';
      ancestor = ancestor.parentElement;
    }

    panel.dataset.crackUiRangePreview = '1';
    document.documentElement.classList.add(CLS.rangePreview);
  }

  function stopPanelRangePreview() {
    const panel = document.getElementById(ID.panel);
    panel?.querySelectorAll('[data-crack-ui-range-preview-active="1"]').forEach((element) => {
      delete element.dataset.crackUiRangePreviewActive;
    });
    panel?.querySelectorAll('[data-crack-ui-range-preview-path="1"]').forEach((element) => {
      delete element.dataset.crackUiRangePreviewPath;
    });

    if (panel) {
      delete panel.dataset.crackUiRangePreview;
      delete panel.dataset.crackUiFontRangeTouchLock;
    }
    activePanelRangePreviewInput = null;
    activeCrackUiFontRangeScroller = null;
    activeCrackUiFontRangeScrollTop = 0;
    activeCrackUiFontRangeScrollLeft = 0;
    document.documentElement.classList.remove(CLS.rangePreview);
  }

  function startPanelHoldPreview() {
    const panel = document.getElementById(ID.panel);
    const button = panel?.querySelector?.(`#${ID.panelPreviewButton}`);
    if (!panel || !button || !panelOpen || panelHoldPreviewActive) return;

    // Use exactly the same preview state and ancestor markers as range dragging.
    // The eye remains visible, while the backdrop and every other panel element disappear.
    stopPanelRangeDrag();
    stopPanelRangePreview();

    panelHoldPreviewActive = true;
    button.dataset.pressed = '1';
    button.setAttribute('aria-pressed', 'true');
    button.dataset.crackUiRangePreviewActive = '1';

    let ancestor = button.parentElement;
    while (ancestor && ancestor !== panel) {
      ancestor.dataset.crackUiRangePreviewPath = '1';
      ancestor = ancestor.parentElement;
    }

    panel.dataset.crackUiRangePreview = '1';
    document.documentElement.classList.add(CLS.rangePreview);
  }

  function stopPanelHoldPreview() {
    const panel = document.getElementById(ID.panel);
    const button = panel?.querySelector?.(`#${ID.panelPreviewButton}`);
    const wasActive = panelHoldPreviewActive || button?.dataset?.crackUiRangePreviewActive === '1';
    if (!wasActive) return;

    panelHoldPreviewActive = false;
    if (button) {
      delete button.dataset.pressed;
      button.setAttribute('aria-pressed', 'false');
    }

    if (!activePanelRangePreviewInput) stopPanelRangePreview();
  }

  function startPanelRangeDrag(input) {
    if (!input || input.disabled) return;

    // A delayed scroll restore from a previous control action must never run while a range
    // thumb is being dragged. Stale restores were fighting the user's current scroll position
    // and could make the font panel jump up/down forever during a long drag.
    cancelCrackUiFontScrollRestore();

    // Every range input, including all font controls, uses the same live-preview behavior.
    // The active slider remains visible while the rest of the settings UI disappears.
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
    // The eye button shares the range-preview state. Its own release handler owns cleanup.
    if (panelHoldPreviewActive && !activePanelRangePreviewInput) return;

    const panel = document.getElementById(ID.panel);
    const stalePreview =
      !!activePanelRangePreviewInput ||
      panel?.dataset?.crackUiRangePreview === '1';

    if (isChatWidthDragging) {
      isChatWidthDragging = false;
      document.documentElement.classList.remove(CLS.widthDragging);
      flushChatWidthSave();
    }

    if (stalePreview) stopPanelRangePreview();
  }

  function bindPanelRangeDragDelegation(panel) {
    if (!panel || panel.dataset.crackUiRangeDragBound === '1') return;
    panel.dataset.crackUiRangeDragBound = '1';

    const startFromEvent = (event) => {
      const input = getPanelRangeInput(event.target);
      if (!input) return;
      if (Number.isInteger(event.pointerId)) {
        input.__crackUiPointerId = event.pointerId;
        try { input.setPointerCapture?.(event.pointerId); } catch {
        }
      }
      startPanelRangeDrag(input);
    };

    const stopFromEvent = (event) => {
      const input = getPanelRangeInput(event.target);
      if (input && Number.isInteger(input.__crackUiPointerId)) {
        try {
          if (input.hasPointerCapture?.(input.__crackUiPointerId)) {
            input.releasePointerCapture(input.__crackUiPointerId);
          }
        } catch {
        }
        delete input.__crackUiPointerId;
      }
      if (!input || input === activePanelRangePreviewInput) stopPanelRangeDrag();
    };

    const lockFontRangeScroll = () => {
      if (!activePanelRangePreviewInput?.matches?.('[data-crack-ui-font-range], [data-crack-ui-novel-backdrop-opacity]')) return;
      const scroller = activeCrackUiFontRangeScroller;
      if (!scroller?.isConnected) return;
      if (scroller.scrollTop !== activeCrackUiFontRangeScrollTop) {
        scroller.scrollTop = activeCrackUiFontRangeScrollTop;
      }
      if (scroller.scrollLeft !== activeCrackUiFontRangeScrollLeft) {
        scroller.scrollLeft = activeCrackUiFontRangeScrollLeft;
      }
    };

    // Event delegation means newly added range sliders are handled without extra binding code.
    panel.addEventListener('pointerdown', startFromEvent, { passive: true });
    panel.addEventListener('touchstart', startFromEvent, { passive: true });
    panel.addEventListener('mousedown', startFromEvent);
    panel.addEventListener('input', startFromEvent);
    panel.addEventListener('pointerup', stopFromEvent);
    panel.addEventListener('pointercancel', stopFromEvent);
    panel.addEventListener('touchend', stopFromEvent, { passive: true });
    panel.addEventListener('touchcancel', stopFromEvent, { passive: true });
    panel.addEventListener('change', stopFromEvent);
    panel.addEventListener('blur', stopFromEvent, true);
    panel.querySelector('.crack-ui-panel-body')?.addEventListener('scroll', lockFontRangeScroll, { passive: true });
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
    document.querySelectorAll('span[data-crack-ui-font-quote]').forEach((span) => {
      try {
        span.replaceWith(...Array.from(span.childNodes));
      } catch {
      }
    });
    document.querySelectorAll(`#${ID.gearDesktop}, #${ID.gearMobile}, #${ID.panelRoot}, #${ID.panelBackdrop}, #${ID.panel}, #${ID.zone}, #${ID.handle}, #${ID.bottomModelButton}, #${ID.bottomModelPopup}, #${ID.roomMenuZone}, #${ID.roomMenuHandle}, #${ID.chatListZone}, #${ID.chatListHandle}, #${ID.menuSwipeZone}, #${ID.fontCustomStyle}, .crack-ui-novel-model-indicator, .crack-ui-novel-model-menu, .crack-ui-novel-model-menu-backdrop`)
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
  // Feature: chat font / highlight customization
  // =====================================================

  function crackUiFontEscapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function crackUiFontCssString(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function crackUiFontCssStack(value) {
    const family = normalizeCrackUiFontFamily(value);
    if (!family) return '';
    if (/[,"']/.test(family)) return family;
    return `"${crackUiFontCssString(family)}"`;
  }

  function persistCrackUiFontSettings() {
    if (fontSettingsSaveTimer) {
      clearTimeout(fontSettingsSaveTimer);
      fontSettingsSaveTimer = null;
    }
    writeJsonStorage(LS.fontSettings, normalizeCrackUiFontSettings(fontSettings));
  }

  function saveCrackUiFontSettingsSoon() {
    clearTimeout(fontSettingsSaveTimer);
    fontSettingsSaveTimer = setTimeout(() => {
      fontSettingsSaveTimer = null;
      persistCrackUiFontSettings();
    }, 140);
  }

  function crackUiFontStripCssNoise(value) {
    return String(value || '')
      .replace(/<style\b[^>]*>/gi, '')
      .replace(/<\/style>/gi, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();
  }

  function crackUiFontRewriteLegacyUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const rawgit = raw.match(/^https?:\/\/(?:cdn\.)?rawgit\.com\/([^/?#]+)\/([^/?#]+)\/([^/?#]+)\/(.+)$/i);
    if (rawgit) {
      const [, user, repo, ref, rest] = rawgit;
      return `https://cdn.jsdelivr.net/gh/${encodeURIComponent(user)}/${encodeURIComponent(repo)}@${encodeURIComponent(ref)}/${rest}`;
    }

    const github = raw.match(/^https?:\/\/raw\.githubusercontent\.com\/([^/?#]+)\/([^/?#]+)\/([^/?#]+)\/(.+)$/i);
    if (github) {
      const [, user, repo, ref, rest] = github;
      return `https://cdn.jsdelivr.net/gh/${encodeURIComponent(user)}/${encodeURIComponent(repo)}@${encodeURIComponent(ref)}/${rest}`;
    }

    return raw;
  }

  function normalizeCrackUiFontResourceUrl(value) {
    try {
      const parsed = new URL(crackUiFontRewriteLegacyUrl(value));
      if (!/^https?:$/.test(parsed.protocol)) return '';
      return parsed.href.slice(0, 1200);
    } catch {
      return '';
    }
  }

  function crackUiFontResolveUrl(value, baseUrl = '') {
    const raw = String(value || '').trim().replace(/^['"]|['"]$/g, '');
    if (!raw || /^data:/i.test(raw)) return '';
    try {
      if (raw.startsWith('//')) return normalizeCrackUiFontResourceUrl(`https:${raw}`);
      if (/^https?:\/\//i.test(raw)) return normalizeCrackUiFontResourceUrl(raw);
      if (baseUrl) return normalizeCrackUiFontResourceUrl(new URL(raw, baseUrl).href);
      return '';
    } catch {
      return '';
    }
  }

  function crackUiFontNormalizeFormat(value, url = '') {
    const raw = String(value || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (raw) return raw.slice(0, 24);
    if (/\.woff2(?:[?#].*)?$/i.test(url)) return 'woff2';
    if (/\.woff(?:[?#].*)?$/i.test(url)) return 'woff';
    if (/\.ttf(?:[?#].*)?$/i.test(url)) return 'truetype';
    if (/\.otf(?:[?#].*)?$/i.test(url)) return 'opentype';
    return 'woff2';
  }

  function crackUiFontNormalizeCssToken(value, fallback = '') {
    const raw = String(value || '').replace(/[;{}<>]/g, '').trim();
    return (raw || fallback).slice(0, 100);
  }

  function crackUiFontNormalizeWeightToken(value) {
    const raw = crackUiFontNormalizeCssToken(value, 'normal').replace(/[^\w\s.-]/g, '').trim();
    if (/^(normal|bold|lighter|bolder)$/i.test(raw)) return raw.toLowerCase();
    const range = raw.match(/^(\d{2,4})\s+(\d{2,4})$/);
    if (range) return `${Math.max(1, Math.min(1000, Number(range[1])))} ${Math.max(1, Math.min(1000, Number(range[2])))}`;
    if (/^\d{2,4}$/.test(raw)) return String(Math.max(1, Math.min(1000, Number(raw))));
    return 'normal';
  }

  function crackUiFontExtractDeclaration(face, property) {
    const escaped = String(property || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return face.match(new RegExp(`${escaped}\\s*:\\s*([^;{}]+)\\s*;?`, 'i'))?.[1] || '';
  }

  function normalizeCrackUiFontFaceCss(cssText, baseUrl = '') {
    const raw = crackUiFontStripCssNoise(cssText);
    const matches = raw.match(/@font-?face\s*\{[\s\S]*?\}/gi) || [];

    return matches.map((rawFace) => {
      const face = rawFace.replace(/^@fontface/i, '@font-face');
      const familyMatch = face.match(/font-family\s*:\s*(['"]?)([^;'"}]+)\1\s*;?/i);
      const srcDecl = crackUiFontExtractDeclaration(face, 'src');
      const srcMatch = srcDecl.match(/url\((['"]?)([^'")\s]+)\1\)/i);
      if (!familyMatch || !srcMatch) return '';

      const family = normalizeCrackUiFontFamily(familyMatch[2]);
      const url = crackUiFontResolveUrl(srcMatch[2], baseUrl);
      if (!family || !url) return '';

      const format = crackUiFontNormalizeFormat(srcDecl.match(/format\((['"]?)([^'")]+)\1\)/i)?.[2] || '', url);
      const weight = crackUiFontNormalizeWeightToken(crackUiFontExtractDeclaration(face, 'font-weight') || 'normal');
      const style = crackUiFontNormalizeCssToken(crackUiFontExtractDeclaration(face, 'font-style'), 'normal').replace(/[^\w\s.-]/g, '') || 'normal';
      const stretch = crackUiFontNormalizeCssToken(crackUiFontExtractDeclaration(face, 'font-stretch'), '');
      const display = crackUiFontNormalizeCssToken(crackUiFontExtractDeclaration(face, 'font-display'), 'swap').replace(/[^\w\s.-]/g, '') || 'swap';
      const unicodeRange = crackUiFontNormalizeCssToken(crackUiFontExtractDeclaration(face, 'unicode-range'), '').replace(/[^\w\s.,?+*-]/g, '');

      return `@font-face{font-family:"${crackUiFontCssString(family)}";src:url("${crackUiFontCssString(url)}") format("${crackUiFontCssString(format)}");font-weight:${weight};font-style:${style};${stretch ? `font-stretch:${stretch};` : ''}font-display:${display};${unicodeRange ? `unicode-range:${unicodeRange};` : ''}}`;
    }).filter(Boolean).join('\n');
  }

  function crackUiFontExtractFamilies(value) {
    const families = [];
    const seen = new Set();
    const matches = String(value || '').match(/@font-?face\s*\{[\s\S]*?\}/gi) || [];

    matches.forEach((face) => {
      const family = normalizeCrackUiFontFamily(face.match(/font-family\s*:\s*(['"]?)([^;'"}]+)\1\s*;?/i)?.[2] || '');
      const key = family.toLowerCase();
      if (!family || seen.has(key)) return;
      seen.add(key);
      families.push(family);
    });
    return families;
  }

  function crackUiFontFilterFaceCssByFamily(cssText, family) {
    const target = normalizeCrackUiFontFamily(family).toLowerCase();
    if (!target) return '';
    const matches = String(cssText || '').match(/@font-?face\s*\{[\s\S]*?\}/gi) || [];
    return matches.filter((face) => {
      const faceFamily = normalizeCrackUiFontFamily(
        face.match(/font-family\s*:\s*(['"]?)([^;'"}]+)\1\s*;?/i)?.[2] || ''
      ).toLowerCase();
      return faceFamily === target;
    }).join('\n');
  }

  function crackUiFontIsDirectResource(value) {
    return /\.(?:woff2?|ttf|otf)(?:[?#].*)?$/i.test(String(value || '').trim());
  }

  function crackUiFontInferFamily(value) {
    const source = String(value || '').trim();
    if (!source) return '';
    const lower = source.toLowerCase();

    if (lower.includes('monadabxy/mona-font') || /\/mona\.css(?:[?#].*)?$/i.test(source)) return 'Mona12';
    if (lower.includes('moonspam/nanumsquare') || /\/nanumsquare(?:\.min)?\.css(?:[?#].*)?$/i.test(source)) return 'NanumSquare';
    if (lower.includes('wanteddev/wanted-sans') || lower.includes('wantedsansvariable')) return 'Wanted Sans Variable';
    if (lower.includes('projectnoonnu/noonfonts_suit') || /suit[-_]?/i.test(source)) return 'SUIT';

    const inlineFamily = crackUiFontExtractFamilies(source)[0];
    if (inlineFamily) return inlineFamily;

    try {
      const parsed = new URL(source);
      const familyParam = parsed.searchParams.get('family');
      if (familyParam) {
        const family = decodeURIComponent(familyParam).split('|')[0].split(':')[0].replace(/\+/g, ' ').trim();
        if (family) return normalizeCrackUiFontFamily(family);
      }
      if (crackUiFontIsDirectResource(source)) return crackUiFontDeriveResourceName(source) || 'Custom Font';
    } catch {
    }
    return '';
  }

  function normalizeCrackUiFontSource(value) {
    const raw = crackUiFontStripCssNoise(value);
    if (!raw) return '';

    const faceCss = normalizeCrackUiFontFaceCss(raw, '');
    if (faceCss) return faceCss.slice(0, 20000);

    const importMatch = raw.match(/@import\s+(?:url\()?(['"]?)(https?:\/\/[^'")\s]+|\/\/[^'")\s]+)\1\)?/i);
    const linkMatch = raw.match(/href\s*=\s*(['"])(https?:\/\/[^'"]+|\/\/[^'"]+)\1/i);
    const urlMatch = raw.match(/^(https?:\/\/[^\s"'<>]+|\/\/[^\s"'<>]+)$/i);
    let url = importMatch?.[2] || linkMatch?.[2] || urlMatch?.[0] || '';
    if (url.startsWith('//')) url = `https:${url}`;
    return normalizeCrackUiFontResourceUrl(url);
  }

  function getCrackUiFontEffectiveFamily() {
    if (fontResolveSource === normalizeCrackUiFontSource(fontSettings.customFontSource) && fontResolvedFamily) {
      return fontResolvedFamily;
    }
    return crackUiFontExtractFamilies(fontSettings.customFontSource)[0] ||
      crackUiFontInferFamily(fontSettings.customFontSource) ||
      crackUiFontDeriveResourceName(fontSettings.customFontSource);
  }

  function getCrackUiFontBodyRecord(settings = fontSettings) {
    return getCrackUiSavedFontById(settings?.bodyFontId, settings);
  }

  function getCrackUiFontCodeRecord(settings = fontSettings) {
    return getCrackUiSavedFontById(settings?.codeFontId, settings);
  }

  function getCrackUiFontTitleRecord(settings = fontSettings) {
    return getCrackUiSavedFontById(settings?.titleFontId, settings);
  }

  function getCrackUiFontBodyFamily(settings = fontSettings) {
    return getCrackUiSavedFontRuntimeFamily(getCrackUiFontBodyRecord(settings));
  }

  function getCrackUiFontCodeFamily(settings = fontSettings) {
    return getCrackUiSavedFontRuntimeFamily(getCrackUiFontCodeRecord(settings));
  }

  function getCrackUiFontTitleFamily(settings = fontSettings) {
    return getCrackUiSavedFontRuntimeFamily(getCrackUiFontTitleRecord(settings));
  }

  function crackUiFontNormalizeFileFormat(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (/woff2(?:$|[?#])/.test(raw) || raw === 'font/woff2') return 'woff2';
    if (/woff(?:$|[?#])/.test(raw) || raw === 'font/woff') return 'woff';
    if (/otf(?:$|[?#])/.test(raw) || raw === 'font/otf' || raw === 'application/vnd.ms-opentype') return 'otf';
    if (/ttf(?:$|[?#])/.test(raw) || raw === 'font/ttf' || raw === 'application/x-font-ttf') return 'ttf';
    return '';
  }

  function crackUiFontDeriveFileFamily(filename) {
    const base = String(filename || '')
      .replace(/\.(?:woff2?|ttf|otf)$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!base) return '';

    const withoutStyle = base.replace(
      /\s+(?:thin|hairline|extra\s*light|ultra\s*light|light|regular|book|normal|medium|semi\s*bold|demi\s*bold|bold|extra\s*bold|ultra\s*bold|black|heavy|italic|oblique|variable(?:\s*font)?|vf)(?:\s+(?:italic|oblique))?$/i,
      ''
    ).trim();
    return normalizeCrackUiFontFamily(withoutStyle || base);
  }

  function crackUiFontIsSupportedFile(file) {
    if (!file || typeof file.arrayBuffer !== 'function') return false;
    return !!crackUiFontNormalizeFileFormat(file.name || file.type);
  }

  function crackUiFontOpenFileDb() {
    if (fontFileDbPromise) return fontFileDbPromise;
    fontFileDbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('이 브라우저는 폰트 파일 저장을 지원하지 않습니다'));
        return;
      }

      const request = indexedDB.open(FONT_FILE_DB_NAME, FONT_FILE_DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(FONT_FILE_DB_STORE)) {
          db.createObjectStore(FONT_FILE_DB_STORE, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          fontFileDbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () => {
        fontFileDbPromise = null;
        reject(request.error || new Error('폰트 파일 저장소를 열지 못했습니다'));
      };
      request.onblocked = () => {
        fontFileDbPromise = null;
        reject(new Error('다른 탭에서 폰트 저장소를 사용 중입니다'));
      };
    });
    return fontFileDbPromise;
  }

  async function crackUiFontPutFileData(record, file) {
    const db = await crackUiFontOpenFileDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FONT_FILE_DB_STORE, 'readwrite');
      transaction.objectStore(FONT_FILE_DB_STORE).put({
        key: record.fileKey,
        blob: file,
        filename: record.filename,
        family: record.family,
        format: record.format,
        size: record.size,
        lastModified: record.lastModified,
        savedAt: Date.now(),
      });
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error || new Error('폰트 파일을 저장하지 못했습니다'));
      transaction.onabort = () => reject(transaction.error || new Error('폰트 파일 저장이 취소되었습니다'));
    });
  }

  async function crackUiFontGetFileData(fileKey) {
    const db = await crackUiFontOpenFileDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FONT_FILE_DB_STORE, 'readonly');
      const request = transaction.objectStore(FONT_FILE_DB_STORE).get(String(fileKey || ''));
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('폰트 파일을 읽지 못했습니다'));
    });
  }

  async function crackUiFontDeleteFileData(fileKey) {
    if (!fileKey) return false;
    const db = await crackUiFontOpenFileDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FONT_FILE_DB_STORE, 'readwrite');
      transaction.objectStore(FONT_FILE_DB_STORE).delete(String(fileKey));
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error || new Error('폰트 파일을 삭제하지 못했습니다'));
      transaction.onabort = () => reject(transaction.error || new Error('폰트 파일 삭제가 취소되었습니다'));
    });
  }

  function crackUiFontReadTag(view, offset) {
    if (!(view instanceof DataView) || offset < 0 || offset + 4 > view.byteLength) return '';
    return String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
  }

  function crackUiFontDecodeNameBytes(bytes, platformId) {
    if (!(bytes instanceof Uint8Array) || !bytes.length) return '';
    let value = '';
    if (platformId === 0 || platformId === 3) {
      for (let index = 0; index + 1 < bytes.length; index += 2) {
        value += String.fromCharCode((bytes[index] << 8) | bytes[index + 1]);
      }
    } else {
      for (let index = 0; index < bytes.length; index += 1) {
        value += String.fromCharCode(bytes[index]);
      }
    }
    return value.replace(/\0/g, '').replace(/\s+/g, ' ').trim();
  }

  function crackUiFontParseNameTable(buffer, tableOffset, tableLength) {
    if (!(buffer instanceof ArrayBuffer)) return '';
    if (tableOffset < 0 || tableLength < 6 || tableOffset + tableLength > buffer.byteLength) return '';

    const view = new DataView(buffer);
    const count = view.getUint16(tableOffset + 2, false);
    const stringOffset = view.getUint16(tableOffset + 4, false);
    const recordsOffset = tableOffset + 6;
    const stringsBase = tableOffset + stringOffset;
    let best = null;

    for (let index = 0; index < count; index += 1) {
      const offset = recordsOffset + index * 12;
      if (offset + 12 > tableOffset + tableLength || offset + 12 > buffer.byteLength) break;
      const platformId = view.getUint16(offset, false);
      const languageId = view.getUint16(offset + 4, false);
      const nameId = view.getUint16(offset + 6, false);
      const length = view.getUint16(offset + 8, false);
      const relativeOffset = view.getUint16(offset + 10, false);
      if (nameId !== 1 && nameId !== 16) continue;

      const start = stringsBase + relativeOffset;
      const end = start + length;
      if (start < tableOffset || end > tableOffset + tableLength || end > buffer.byteLength) continue;
      const value = normalizeCrackUiFontFamily(
        crackUiFontDecodeNameBytes(new Uint8Array(buffer, start, length), platformId)
      );
      if (!value) continue;

      let score = nameId === 16 ? 100 : 60;
      if (platformId === 3) score += 20;
      else if (platformId === 0) score += 15;
      if (languageId === 0x0409 || languageId === 0x0412 || languageId === 0) score += 10;
      if (!best || score > best.score) best = { value, score };
    }

    return best?.value || '';
  }

  function crackUiFontExtractSfntFamily(buffer) {
    if (!(buffer instanceof ArrayBuffer) || buffer.byteLength < 12) return '';
    const view = new DataView(buffer);
    const signature = view.getUint32(0, false);
    const supported = signature === 0x00010000 || signature === 0x4f54544f || signature === 0x74727565 || signature === 0x74797031;
    if (!supported) return '';

    const numTables = view.getUint16(4, false);
    for (let index = 0; index < numTables; index += 1) {
      const entryOffset = 12 + index * 16;
      if (entryOffset + 16 > buffer.byteLength) break;
      if (crackUiFontReadTag(view, entryOffset) !== 'name') continue;
      const tableOffset = view.getUint32(entryOffset + 8, false);
      const tableLength = view.getUint32(entryOffset + 12, false);
      return crackUiFontParseNameTable(buffer, tableOffset, tableLength);
    }
    return '';
  }

  function crackUiFontExtractWoffFamily(buffer) {
    if (!(buffer instanceof ArrayBuffer) || buffer.byteLength < 44) return '';
    const view = new DataView(buffer);
    if (crackUiFontReadTag(view, 0) !== 'wOFF') return '';
    const numTables = view.getUint16(12, false);
    for (let index = 0; index < numTables; index += 1) {
      const entryOffset = 44 + index * 20;
      if (entryOffset + 20 > buffer.byteLength) break;
      if (crackUiFontReadTag(view, entryOffset) !== 'name') continue;
      const tableOffset = view.getUint32(entryOffset + 4, false);
      const compressedLength = view.getUint32(entryOffset + 8, false);
      const originalLength = view.getUint32(entryOffset + 12, false);
      if (compressedLength !== originalLength) return '';
      return crackUiFontParseNameTable(buffer, tableOffset, originalLength);
    }
    return '';
  }

  async function crackUiFontExtractFileFamily(file) {
    const fallback = crackUiFontDeriveFileFamily(file?.name) || 'Local Font';
    const format = crackUiFontNormalizeFileFormat(file?.name || file?.type);
    if (!file || !['ttf', 'otf', 'woff'].includes(format)) return fallback;
    try {
      const buffer = await file.arrayBuffer();
      return crackUiFontExtractSfntFamily(buffer) || crackUiFontExtractWoffFamily(buffer) || fallback;
    } catch {
      return fallback;
    }
  }

  function crackUiFontCreateFileRecord(file, family) {
    const filename = String(file?.name || 'font-file').replace(/[\\/<>:"|?*]/g, '').trim().slice(0, 180);
    const size = Math.max(0, Math.round(Number(file?.size) || 0));
    const lastModified = Math.max(0, Math.round(Number(file?.lastModified) || 0));
    const normalizedFamily = normalizeCrackUiFontFamily(family || crackUiFontDeriveFileFamily(filename) || 'Local Font');
    const id = `font-file-${crackUiFontHashValue(`${filename}\n${size}\n${lastModified}\n${normalizedFamily}`)}`;
    return normalizeCrackUiSavedFontRecord({
      id,
      kind: 'file',
      fileKey: id,
      family: normalizedFamily,
      filename,
      format: crackUiFontNormalizeFileFormat(filename || file?.type),
      size,
      lastModified,
    });
  }

  function releaseCrackUiLocalFontFace(recordOrId) {
    const id = typeof recordOrId === 'string' ? recordOrId : recordOrId?.id;
    if (!id) return;
    const state = fontLocalFaceState.get(id);
    if (state?.face && document.fonts?.delete) {
      try { document.fonts.delete(state.face); } catch {
      }
    }
    fontLocalFaceState.delete(id);
  }

  function releaseCrackUiUnusedLocalFontFaces(selectedRecords = []) {
    const selectedIds = new Set(
      selectedRecords.filter(crackUiFontIsFileRecord).map((record) => record.id)
    );
    [...fontLocalFaceState.keys()].forEach((id) => {
      if (!selectedIds.has(id)) releaseCrackUiLocalFontFace(id);
    });
  }

  function ensureCrackUiLocalFontLoaded(record) {
    if (!crackUiFontIsFileRecord(record)) return Promise.resolve(false);
    const existing = fontLocalFaceState.get(record.id);
    if (existing?.status === 'loaded') return Promise.resolve(true);
    if (existing?.promise) return existing.promise;

    const token = {};
    const promise = (async () => {
      if (typeof FontFace !== 'function' || !document.fonts) {
        throw new Error('이 브라우저는 로컬 폰트 적용을 지원하지 않습니다');
      }
      const stored = await crackUiFontGetFileData(record.fileKey);
      if (!stored?.blob) throw new Error(`${record.family} 파일을 찾지 못했습니다`);
      const buffer = typeof stored.blob.arrayBuffer === 'function'
        ? await stored.blob.arrayBuffer()
        : stored.blob instanceof ArrayBuffer
          ? stored.blob
          : null;
      if (!buffer) throw new Error(`${record.family} 파일을 읽지 못했습니다`);

      const alias = getCrackUiSavedFontAlias(record);
      let face = new FontFace(alias, buffer, { style: 'normal', weight: '100 900', display: 'swap' });
      try {
        await face.load();
      } catch {
        face = new FontFace(alias, buffer, { style: 'normal', weight: 'normal', display: 'swap' });
        await face.load();
      }

      if (fontLocalFaceState.get(record.id)?.token !== token) {
        try { document.fonts.delete(face); } catch {
        }
        return false;
      }
      document.fonts.add(face);
      fontLocalFaceState.set(record.id, { status: 'loaded', face, promise: Promise.resolve(true), token });
      return true;
    })().catch((error) => {
      if (fontLocalFaceState.get(record.id)?.token === token) fontLocalFaceState.delete(record.id);
      reportCrackUiError('font.file.load', error);
      return false;
    });

    fontLocalFaceState.set(record.id, { status: 'loading', face: null, promise, token });
    return promise;
  }

  async function saveCrackUiFontFiles(fileList, panel = document.getElementById(ID.panel)) {
    if (!panel || !fontSettings.masterEnabled || fontFileOperationActive) return;
    const files = [...(fileList || [])];
    const operationSeq = ++fontSaveOperationSeq;
    fontFileOperationActive = true;
    fontResolveStatus = 'idle';
    fontResolveLastError = '';
    fontSaveStatusText = '';
    syncCrackUiFontSettingsUi(panel);

    try {
      const candidates = files.filter(crackUiFontIsSupportedFile);
      if (!candidates.length) throw new Error('TTF·OTF·WOFF·WOFF2 파일을 선택해 주세요');

      const records = normalizeCrackUiSavedFonts(fontSettings.savedFonts);
      let savedCount = 0;
      let updatedCount = 0;
      let skippedCount = files.length - candidates.length;
      let lastFileError = '';

      for (const file of candidates) {
        if (operationSeq !== fontSaveOperationSeq) return;
        if (file.size <= 0) {
          skippedCount += 1;
          continue;
        }
        if (file.size > FONT_FILE_MAX_BYTES) {
          skippedCount += 1;
          lastFileError = '폰트 파일은 하나당 최대 40MB까지 저장할 수 있습니다';
          continue;
        }

        try {
          const family = await crackUiFontExtractFileFamily(file);
          const record = crackUiFontCreateFileRecord(file, family);
          if (!record) {
            skippedCount += 1;
            continue;
          }

          const existingIndex = records.findIndex((item) => item.id === record.id);
          if (existingIndex < 0 && records.length >= FONT_LIBRARY_MAX_RECORDS) {
            skippedCount += 1;
            continue;
          }

          await crackUiFontPutFileData(record, file);
          releaseCrackUiLocalFontFace(record.id);
          if (existingIndex >= 0) {
            records[existingIndex] = record;
            updatedCount += 1;
          } else {
            records.push(record);
            savedCount += 1;
          }
        } catch (error) {
          skippedCount += 1;
          lastFileError = String(error?.message || error);
          reportCrackUiError('font.file.save', error);
        }
      }

      if (operationSeq !== fontSaveOperationSeq) return;
      if (!savedCount && !updatedCount) {
        throw new Error(lastFileError || (skippedCount ? '저장 가능한 폰트 파일이 없습니다' : '폰트 파일을 저장하지 못했습니다'));
      }

      fontSettings.savedFonts = normalizeCrackUiSavedFonts(records);
      fontSettings.fontLibraryVersion = 3;
      fontSaveStatusText = `파일 ${savedCount}개 저장${updatedCount ? ` · ${updatedCount}개 갱신` : ''}${skippedCount ? ` · ${skippedCount}개 제외` : ''}`;
      applyCrackUiFontFeatureState({ scheduleQuotes: false });
      persistCrackUiFontSettings();
    } catch (error) {
      if (operationSeq !== fontSaveOperationSeq) return;
      fontResolveStatus = 'failed';
      fontResolveLastError = String(error?.message || error);
      fontSaveStatusText = '';
    } finally {
      if (operationSeq === fontSaveOperationSeq) {
        fontFileOperationActive = false;
        const input = panel.querySelector(`#${ID.fontFileInput}`);
        if (input) input.value = '';
        syncCrackUiFontSettingsUi(panel);
      }
    }
  }

  function crackUiFontRequestText(url) {
    return new Promise((resolve, reject) => {
      if (typeof GM_xmlhttpRequest === 'function') {
        try {
          GM_xmlhttpRequest({
            method: 'GET',
            url,
            timeout: 12000,
            anonymous: true,
            onload(response) {
              const status = Number(response?.status || 0);
              if (status >= 200 && status < 400) resolve(String(response.responseText || ''));
              else reject(new Error(`HTTP ${status || 'error'}`));
            },
            ontimeout() {
              reject(new Error('웹폰트 CSS 요청 시간 초과'));
            },
            onerror() {
              reject(new Error('웹폰트 CSS 요청 실패'));
            },
          });
          return;
        } catch {
        }
      }

      fetch(url, { cache: 'force-cache', credentials: 'omit' })
        .then((response) => response.ok ? response.text() : Promise.reject(new Error(`HTTP ${response.status}`)))
        .then(resolve, reject);
    });
  }

  async function createCrackUiSavedFontsFromSource(source) {
    const normalized = normalizeCrackUiFontSource(source);
    if (!normalized) throw new Error('웹폰트 소스를 입력해 주세요');

    let css = '';
    let families = [];

    if (normalized.startsWith('@font-face')) {
      css = normalizeCrackUiFontFaceCss(normalized, '');
      families = crackUiFontExtractFamilies(css);
    } else if (crackUiFontIsDirectResource(normalized)) {
      families = [crackUiFontInferFamily(normalized) || crackUiFontDeriveResourceName(normalized)].filter(Boolean);
    } else {
      const cssText = await crackUiFontRequestText(normalized);
      css = normalizeCrackUiFontFaceCss(cssText, normalized);
      families = crackUiFontExtractFamilies(css);
      if (!families.length) {
        families = [crackUiFontInferFamily(normalized) || crackUiFontDeriveResourceName(normalized)].filter(Boolean);
      }
    }

    const records = families.map((family) => normalizeCrackUiSavedFontRecord({
      id: crackUiFontCreateSavedId(normalized, family),
      source: normalized,
      family,
      // Keep only this family's faces. Different weights/styles of the same family remain grouped.
      css: css ? crackUiFontFilterFaceCssByFamily(css, family) : '',
    })).filter(Boolean);

    if (!records.length) throw new Error('폰트 이름을 자동으로 찾지 못했습니다');
    return records;
  }

  async function saveCrackUiFontFromPanel(panel = document.getElementById(ID.panel)) {
    if (!panel || !fontSettings.masterEnabled || fontFileOperationActive) return;
    const input = panel.querySelector(`#${ID.fontSourceInput}`);
    const source = String(input?.value || fontSettings.customFontSource || '').trim();
    const operationSeq = ++fontSaveOperationSeq;

    fontSettings.customFontSource = source.slice(0, 20000);
    fontResolveStatus = 'loading';
    fontResolveLastError = '';
    fontSaveStatusText = '';
    syncCrackUiFontSettingsUi(panel);

    try {
      const detectedRecords = await createCrackUiSavedFontsFromSource(source);
      if (operationSeq !== fontSaveOperationSeq) return;

      const records = normalizeCrackUiSavedFonts(fontSettings.savedFonts);
      let addedCount = 0;
      let updatedCount = 0;

      detectedRecords.forEach((detected) => {
        // Match by source + family first so a 2.6.37 source-only ID remains selected after update.
        const existingIndex = records.findIndex((item) =>
          normalizeCrackUiFontSource(item.source) === detected.source &&
          normalizeCrackUiFontFamily(item.family).toLowerCase() === detected.family.toLowerCase()
        );
        if (existingIndex >= 0) {
          records[existingIndex] = { ...detected, id: records[existingIndex].id };
          updatedCount += 1;
        } else if (records.length < FONT_LIBRARY_MAX_RECORDS) {
          records.push(detected);
          addedCount += 1;
        }
      });

      fontSettings.savedFonts = normalizeCrackUiSavedFonts(records);
      fontSettings.fontLibraryVersion = 3;
      fontSettings.customFontSource = '';
      if (input) input.value = '';

      fontResolveSource = normalizeCrackUiFontSource(source);
      fontResolveStatus = 'saved';
      fontResolvedFamily = detectedRecords[0]?.family || '';
      fontResolvedFamilies = detectedRecords.map((record) => record.family);
      fontResolveLastError = '';
      const total = detectedRecords.length;
      const skippedCount = Math.max(0, total - addedCount - updatedCount);
      fontSaveStatusText = total > 1
        ? `폰트 ${total}개 감지 · ${addedCount}개 저장${updatedCount ? ` · ${updatedCount}개 갱신` : ''}${skippedCount ? ` · ${skippedCount}개 제한 초과` : ''}`
        : updatedCount
          ? `이미 저장됨 · ${detectedRecords[0].family}`
          : `저장됨 · ${detectedRecords[0].family}`;

      applyCrackUiFontFeatureState({ scheduleQuotes: false });
      persistCrackUiFontSettings();
      syncCrackUiFontSettingsUi(panel);
    } catch (error) {
      if (operationSeq !== fontSaveOperationSeq) return;
      fontResolveStatus = 'failed';
      fontResolveLastError = String(error?.message || error);
      fontSaveStatusText = '';
      syncCrackUiFontSettingsUi(panel);
    }
  }

  function removeCrackUiSavedFont(fontId, panel = document.getElementById(ID.panel)) {
    const id = String(fontId || '');
    if (!id) return;
    const records = normalizeCrackUiSavedFonts(fontSettings.savedFonts);
    const removed = records.find((record) => record.id === id);
    if (!removed) return;

    const snapshot = getCrackUiFontScrollSnapshot(panel);
    fontSettings.savedFonts = records.filter((record) => record.id !== id);
    if (fontSettings.bodyFontId === id) fontSettings.bodyFontId = '';
    if (fontSettings.codeFontId === id) fontSettings.codeFontId = '';
    if (fontSettings.titleFontId === id) fontSettings.titleFontId = '';
    if (crackUiFontIsFileRecord(removed)) {
      releaseCrackUiLocalFontFace(removed);
      crackUiFontDeleteFileData(removed.fileKey).catch((error) => reportCrackUiError('font.file.delete', error));
    }
    fontSaveStatusText = '저장된 폰트를 삭제했습니다';
    applyCrackUiFontFeatureState({ scheduleQuotes: false });
    persistCrackUiFontSettings();
    syncCrackUiFontSettingsUi(panel);
    restoreCrackUiFontScrollSnapshot(snapshot);
  }

  function hydrateCrackUiSavedFontRecord(record) {
    if (!record || crackUiFontIsFileRecord(record) || record.css || String(record.source || '').startsWith('@font-face') || crackUiFontIsDirectResource(record.source)) return;
    if (fontSavedHydrationPending.has(record.id) || fontSavedHydrationAttempted.has(record.id)) return;

    fontSavedHydrationPending.add(record.id);
    fontSavedHydrationAttempted.add(record.id);
    crackUiFontRequestText(record.source)
      .then((cssText) => {
        const fullCss = normalizeCrackUiFontFaceCss(cssText, record.source);
        const families = crackUiFontExtractFamilies(fullCss);
        const family = families.find((item) => item.toLowerCase() === record.family.toLowerCase()) ||
          families[0] || record.family;
        const css = crackUiFontFilterFaceCssByFamily(fullCss, family) || fullCss;
        if (!css || !family) return;

        const updated = normalizeCrackUiSavedFontRecord({
          id: record.id,
          source: record.source,
          family,
          css,
        });
        if (!updated) return;

        const records = normalizeCrackUiSavedFonts(fontSettings.savedFonts);
        const index = records.findIndex((item) => item.id === record.id);
        if (index < 0) return;
        records[index] = updated;
        fontSettings.savedFonts = records;
        persistCrackUiFontSettings();
        crackUiFontRuntimeSignature = '';
        applyCrackUiFontFeatureState({ scheduleQuotes: false });
        syncCrackUiFontSettingsUi();
      })
      .catch(() => {
        // Keep the @import fallback. One failed background attempt is enough for this page.
      })
      .finally(() => {
        fontSavedHydrationPending.delete(record.id);
      });
  }

  function injectCrackUiCustomFontStyle() {
    const existing = document.getElementById(ID.fontCustomStyle);
    if (!fontSettings.masterEnabled) {
      existing?.remove();
      return;
    }

    const records = [getCrackUiFontBodyRecord(), getCrackUiFontCodeRecord(), getCrackUiFontTitleRecord()]
      .filter(Boolean)
      .filter((record, index, list) => list.findIndex((item) => item.id === record.id) === index);
    releaseCrackUiUnusedLocalFontFaces(records);
    if (!records.length) {
      existing?.remove();
      return;
    }

    const imports = [];
    const faces = [];
    records.forEach((record) => {
      if (crackUiFontIsFileRecord(record)) ensureCrackUiLocalFontLoaded(record);
      else hydrateCrackUiSavedFontRecord(record);
      const built = buildCrackUiSavedFontCss(record);
      if (built.importCss && !imports.includes(built.importCss)) imports.push(built.importCss);
      if (built.faceCss && !faces.includes(built.faceCss)) faces.push(built.faceCss);
    });
    const content = [...imports, ...faces].join('\n');

    if (!content) {
      existing?.remove();
      return;
    }
    if (existing && existing.textContent === content) return;

    existing?.remove();
    const style = document.createElement('style');
    style.id = ID.fontCustomStyle;
    style.textContent = content;
    (document.head || document.documentElement).appendChild(style);
  }

  function setCrackUiFontDataAttribute(name, enabled) {
    const root = document.documentElement;
    const next = enabled ? 'on' : 'off';
    if (root.getAttribute(name) !== next) root.setAttribute(name, next);
  }

  function setCrackUiFontCssVariable(name, value) {
    const root = document.documentElement;
    const next = String(value);
    if (root.style.getPropertyValue(name) !== next) root.style.setProperty(name, next);
  }

  function removeCrackUiFontCssVariable(name) {
    const root = document.documentElement;
    if (root.style.getPropertyValue(name)) root.style.removeProperty(name);
  }

  function getCrackUiFontRuntimeSignature(settings, family) {
    // The draft source and unselected library entries do not affect rendered chat. Excluding
    // them keeps saving/deleting an unused font from invalidating the optimized runtime.
    const runtimeSettings = { ...settings };
    delete runtimeSettings.savedFonts;
    delete runtimeSettings.customFontSource;
    delete runtimeSettings.fontLibraryVersion;

    const selectedFontSignature = [getCrackUiFontBodyRecord(settings), getCrackUiFontCodeRecord(settings), getCrackUiFontTitleRecord(settings)]
      .map((record) => record
        ? `${record.id}:${crackUiFontHashValue(crackUiFontIsFileRecord(record)
          ? `${record.fileKey}
${record.filename}
${record.size}
${record.lastModified}`
          : `${record.source}
${record.css}`)}`
        : '')
      .join('|');

    return JSON.stringify([
      getCrackUiFontThemeDefaultSignature(),
      runtimeSettings,
      family,
      selectedFontSignature,
    ]);
  }

  function clearCrackUiFontRuntimeState() {
    const root = document.documentElement;
    FONT_RUNTIME_ATTRIBUTES.forEach((name) => root.removeAttribute(name));
    FONT_RUNTIME_VARIABLES.forEach((name) => root.style.removeProperty(name));

    document.getElementById(ID.fontCustomStyle)?.remove();
    releaseCrackUiUnusedLocalFontFaces();
    disableCrackUiFontQuoteDecorations();
  }

  function applyCrackUiFontFeatureState(options = {}) {
    let settings = normalizeCrackUiFontSettings(fontSettings);
    fontSettings = settings;

    // Master OFF is a pure gate. Clear once on transition, then leave the DOM alone until
    // something actually changes. In particular, do not measure native typography here.
    if (!settings.masterEnabled) {
      if (!crackUiFontRuntimeStateKnown || crackUiFontRuntimeActive) {
        clearCrackUiFontRuntimeState();
      }
      crackUiFontRuntimeStateKnown = true;
      crackUiFontRuntimeActive = false;
      crackUiFontRuntimeSignature = 'off';
      return;
    }

    // Runtime application only needs a native size measurement when the 8–16pt body-size
    // override is active. Other native values are measured lazily when the font panel opens
    // or when the user explicitly resets a control.
    if (settings.textScaleCustom) {
      measureCrackUiFontBaseSizes();
      settings = clampCrackUiFontTextScaleToPointRange(settings);
      fontSettings = settings;
    }

    const root = document.documentElement;
    const bodyFamily = getCrackUiFontBodyFamily(settings);
    const codeFamily = getCrackUiFontCodeFamily(settings);
    const titleFamily = getCrackUiFontTitleFamily(settings);
    const runtimeSignature = getCrackUiFontRuntimeSignature(settings, `${bodyFamily}|${codeFamily}|${titleFamily}`);

    if (
      crackUiFontRuntimeStateKnown &&
      crackUiFontRuntimeActive &&
      crackUiFontRuntimeSignature === runtimeSignature
    ) {
      // Crack can replace head contents during navigation. Restore only the selected
      // external CSS faces, while local files are kept alive through the FontFace registry.
      const selectedRecords = [getCrackUiFontBodyRecord(settings), getCrackUiFontCodeRecord(settings), getCrackUiFontTitleRecord(settings)]
        .filter(Boolean)
        .filter((record, index, list) => list.findIndex((item) => item.id === record.id) === index);
      selectedRecords.filter(crackUiFontIsFileRecord).forEach((record) => ensureCrackUiLocalFontLoaded(record));
      if (selectedRecords.some((record) => !crackUiFontIsFileRecord(record)) && !document.getElementById(ID.fontCustomStyle)) {
        injectCrackUiCustomFontStyle();
      }
      if (isCrackUiFontInlineDecorationEnabled(settings)) {
        if (options.scheduleQuotes !== false) {
          scheduleCrackUiFontQuoteScan({ immediate: options.immediateQuotes === true });
        }
      } else if (fontQuoteWraps.size || document.querySelector('[data-crack-ui-font-base="1"]') || fontQuoteScanTimer || fontQuoteScanRaf) {
        disableCrackUiFontQuoteDecorations();
      }
      return;
    }

    const applyVariable = (name, key, value) => {
      if (isCrackUiFontSettingCustom(key, settings)) setCrackUiFontCssVariable(name, value);
      else removeCrackUiFontCssVariable(name);
    };

    applyVariable('--crack-ui-font-code-text', 'codeTextColor', settings.codeTextColor);
    applyVariable('--crack-ui-font-text-scale', 'textScale', String(settings.textScale));
    applyVariable('--crack-ui-font-code-scale', 'codeTextScale', String(settings.codeTextScale));
    applyVariable('--crack-ui-font-weight', 'fontWeight', String(settings.fontWeight));
    // 전체 두께는 *묘사*와 **굵게**를 포함한 모든 텍스트에 같은 값으로 적용한다.
    applyVariable('--crack-ui-font-strong-weight', 'fontWeight', String(settings.fontWeight));
    applyVariable('--crack-ui-font-line-height', 'lineHeight', String(settings.lineHeight));
    applyVariable('--crack-ui-font-letter-spacing', 'letterSpacing', `${settings.letterSpacing}em`);
    applyVariable('--crack-ui-font-paragraph-spacing', 'paragraphSpacing', `${settings.paragraphSpacing}rem`);
    setCrackUiFontCssVariable('--crack-ui-font-base-rgb', crackUiFontHexToRgb(settings.baseBg, '232,224,228'));
    setCrackUiFontCssVariable('--crack-ui-font-base-text', getCrackUiFontEffectiveSettingValue('baseTextColor'));
    setCrackUiFontCssVariable('--crack-ui-font-dialogue-rgb', crackUiFontHexToRgb(settings.dialogueBg, '178,154,166'));
    setCrackUiFontCssVariable('--crack-ui-font-dialogue-text', getCrackUiFontEffectiveSettingValue('dialogueTextColor'));
    setCrackUiFontCssVariable('--crack-ui-font-thought-rgb', crackUiFontHexToRgb(settings.thoughtBg, '168,154,166'));
    setCrackUiFontCssVariable('--crack-ui-font-thought-text', getCrackUiFontEffectiveSettingValue('thoughtTextColor'));
    setCrackUiFontCssVariable('--crack-ui-font-italic-rgb', crackUiFontHexToRgb(settings.italicBg, '232,224,228'));
    setCrackUiFontCssVariable('--crack-ui-font-italic-text', getCrackUiFontEffectiveSettingValue('italicTextColor'));
    setCrackUiFontCssVariable('--crack-ui-font-strong-rgb', crackUiFontHexToRgb(settings.strongBg, '240,224,232'));
    setCrackUiFontCssVariable('--crack-ui-font-strong-highlight-text', getCrackUiFontEffectiveSettingValue('strongBgTextColor'));
    setCrackUiFontCssVariable('--crack-ui-font-code-rgb', crackUiFontHexToRgb(settings.codeAccent, '200,166,182'));

    const bodyFamilyStack = crackUiFontCssStack(bodyFamily);
    const codeFamilyStack = crackUiFontCssStack(codeFamily);
    const titleFamilyStack = crackUiFontCssStack(titleFamily);
    if (bodyFamilyStack) setCrackUiFontCssVariable('--crack-ui-body-font-stack', bodyFamilyStack);
    else removeCrackUiFontCssVariable('--crack-ui-body-font-stack');
    if (codeFamilyStack) setCrackUiFontCssVariable('--crack-ui-code-font-stack', codeFamilyStack);
    else removeCrackUiFontCssVariable('--crack-ui-code-font-stack');
    if (titleFamilyStack) setCrackUiFontCssVariable('--crack-ui-title-font-stack', titleFamilyStack);
    else removeCrackUiFontCssVariable('--crack-ui-title-font-stack');
    removeCrackUiFontCssVariable('--crack-ui-custom-font-stack');

    setCrackUiFontDataAttribute(
      'data-crack-ui-font-code-text-color',
      settings.codeBlockBgEnabled && settings.codeTextColorCustom
    );
    document.documentElement.removeAttribute('data-crack-ui-font-webfont');
    setCrackUiFontDataAttribute('data-crack-ui-font-body-font', !!bodyFamily);
    setCrackUiFontDataAttribute('data-crack-ui-font-code-font', !!codeFamily);
    setCrackUiFontDataAttribute('data-crack-ui-font-title-font', !!titleFamily);
    const typographyCustom = Object.keys(FONT_SETTING_RANGE).some((key) => isCrackUiFontSettingCustom(key, settings));
    setCrackUiFontDataAttribute('data-crack-ui-font-typography', typographyCustom);
    setCrackUiFontDataAttribute('data-crack-ui-font-size', settings.textScaleCustom);
    setCrackUiFontDataAttribute('data-crack-ui-font-code-size', settings.codeTextScaleCustom);
    setCrackUiFontDataAttribute('data-crack-ui-font-weight', settings.fontWeightCustom);
    setCrackUiFontDataAttribute('data-crack-ui-font-line-height', settings.lineHeightCustom);
    setCrackUiFontDataAttribute('data-crack-ui-font-letter-spacing', settings.letterSpacingCustom);
    setCrackUiFontDataAttribute('data-crack-ui-font-paragraph-spacing', settings.paragraphSpacingCustom);
    setCrackUiFontDataAttribute('data-crack-ui-font-shadow', settings.textShadowEnabled);
    if (root.getAttribute('data-crack-ui-font-shadow-tone') !== settings.textShadowTone) {
      root.setAttribute('data-crack-ui-font-shadow-tone', settings.textShadowTone);
    }
    setCrackUiFontDataAttribute('data-crack-ui-font-base', settings.baseBgEnabled);
    setCrackUiFontDataAttribute(
      'data-crack-ui-font-base-accent',
      settings.baseBgEnabled && settings.baseAccentEnabled
    );
    setCrackUiFontDataAttribute('data-crack-ui-font-dialogue', settings.dialogueBgEnabled);
    setCrackUiFontDataAttribute(
      'data-crack-ui-font-dialogue-accent',
      settings.dialogueBgEnabled && settings.dialogueAccentEnabled
    );
    setCrackUiFontDataAttribute('data-crack-ui-font-thought', settings.thoughtBgEnabled);
    setCrackUiFontDataAttribute(
      'data-crack-ui-font-thought-accent',
      settings.thoughtBgEnabled && settings.thoughtAccentEnabled
    );
    setCrackUiFontDataAttribute('data-crack-ui-font-italic', settings.italicBgEnabled);
    setCrackUiFontDataAttribute(
      'data-crack-ui-font-italic-text-color',
      settings.italicBgEnabled
    );
    setCrackUiFontDataAttribute(
      'data-crack-ui-font-italic-style',
      settings.italicBgEnabled && settings.italicStyleEnabled
    );
    setCrackUiFontDataAttribute(
      'data-crack-ui-font-italic-accent',
      settings.italicBgEnabled && settings.italicAccentEnabled
    );
    setCrackUiFontDataAttribute('data-crack-ui-font-strong-bg', settings.strongBgEnabled);
    setCrackUiFontDataAttribute(
      'data-crack-ui-font-strong-accent',
      settings.strongBgEnabled && settings.strongAccentEnabled
    );
    setCrackUiFontDataAttribute(
      'data-crack-ui-font-code-bg',
      settings.codeBlockBgEnabled && settings.codeAccentEnabled
    );

    injectCrackUiCustomFontStyle();

    crackUiFontRuntimeStateKnown = true;
    crackUiFontRuntimeActive = true;
    crackUiFontRuntimeSignature = getCrackUiFontRuntimeSignature(settings, `${bodyFamily}|${codeFamily}|${titleFamily}`);

    if (isCrackUiFontInlineDecorationEnabled(settings)) {
      if (options.scheduleQuotes !== false) {
        scheduleCrackUiFontQuoteScan({ immediate: options.immediateQuotes === true });
      }
    } else {
      disableCrackUiFontQuoteDecorations();
    }
  }

  function findCrackUiFontMarkdownRoots() {
    const roots = [...document.querySelectorAll('main [data-message-group-id] .wrtn-markdown')]
      .filter((element) => !element.closest(`#${ID.panelRoot}, #${ID.panel}, #${ID.bottomModelPopup}`));
    if (roots.length) return roots;
    return [...document.querySelectorAll('main .wrtn-markdown')]
      .filter((element) => !element.closest(`#${ID.panelRoot}, #${ID.panel}, #${ID.bottomModelPopup}`));
  }

  function findCrackUiFontCodeBlocks() {
    return [...document.querySelectorAll('main .wrtn-codeblock, main .wrtn-markdown pre')]
      .filter((element) => !element.closest(`#${ID.panelRoot}, #${ID.panel}, #${ID.bottomModelPopup}`));
  }

  function crackUiFontSplitQuotes(text, openSet, closeSet, type) {
    const segments = [];
    let index = 0;
    while (index < text.length) {
      const current = String.fromCodePoint(text.codePointAt(index));
      if (openSet.has(current)) {
        let end = index + current.length;
        while (end < text.length) {
          const char = String.fromCodePoint(text.codePointAt(end));
          if (closeSet.has(char)) break;
          end += char.length;
        }
        if (end < text.length) {
          const close = String.fromCodePoint(text.codePointAt(end));
          segments.push({ type, text: text.slice(index, end + close.length) });
          index = end + close.length;
          continue;
        }
        segments.push({ type: 'text', text: text.slice(index) });
        break;
      }

      let end = index + current.length;
      while (end < text.length) {
        const char = String.fromCodePoint(text.codePointAt(end));
        if (openSet.has(char)) break;
        end += char.length;
      }
      segments.push({ type: 'text', text: text.slice(index, end) });
      index = end;
    }
    return segments;
  }

  function crackUiFontSplitDialogueQuotes(text) {
    const matcher = getCrackUiDialogueQuoteMatcher();
    const segments = [];
    let index = 0;

    while (index < text.length) {
      const current = String.fromCodePoint(text.codePointAt(index));
      const closeSet = matcher.closeByOpen.get(current);
      if (closeSet) {
        let end = index + current.length;
        while (end < text.length) {
          const char = String.fromCodePoint(text.codePointAt(end));
          if (closeSet.has(char)) break;
          end += char.length;
        }
        if (end < text.length) {
          const close = String.fromCodePoint(text.codePointAt(end));
          segments.push({ type: 'double', text: text.slice(index, end + close.length) });
          index = end + close.length;
          continue;
        }
        segments.push({ type: 'text', text: text.slice(index) });
        break;
      }

      let end = index + current.length;
      while (end < text.length) {
        const char = String.fromCodePoint(text.codePointAt(end));
        if (matcher.closeByOpen.has(char)) break;
        end += char.length;
      }
      segments.push({ type: 'text', text: text.slice(index, end) });
      index = end;
    }

    return segments;
  }

  function isCrackUiFontInlineDecorationEnabled(settings = fontSettings) {
    return !!(
      settings?.baseBgEnabled ||
      settings?.dialogueBgEnabled ||
      settings?.thoughtBgEnabled
    );
  }

  function restoreCrackUiFontBaseDecorations(root = document) {
    const scope = root instanceof Element || root instanceof Document ? root : document;
    scope.querySelectorAll?.('[data-crack-ui-font-base="1"]').forEach((span) => {
      try {
        span.replaceWith(...Array.from(span.childNodes));
      } catch {
      }
    });
  }

  function collectCrackUiFontBaseTextNodes(markdown) {
    const walker = document.createTreeWalker(markdown, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const value = node.nodeValue || '';
        if (!value.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('[data-crack-ui-font-base="1"], [data-crack-ui-font-quote], em, strong, code, pre, script, style, textarea, input, button, [contenteditable="true"], svg, math, .katex, .MathJax, mjx-container, .not-wrtn-markdown')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    return nodes;
  }

  function wrapCrackUiFontBaseText(markdown) {
    collectCrackUiFontBaseTextNodes(markdown).forEach((textNode) => {
      const parent = textNode.parentNode;
      if (!parent) return;
      const wrapper = document.createElement('span');
      wrapper.setAttribute('data-crack-ui-font-base', '1');
      parent.insertBefore(wrapper, textNode);
      wrapper.appendChild(textNode);
    });
  }

  function replaceCrackUiFontQuoteTextNode(textNode, type) {
    const value = textNode.nodeValue || '';
    const segments = type === 'double'
      ? crackUiFontSplitDialogueQuotes(value)
      : crackUiFontSplitQuotes(value, FONT_SINGLE_OPEN, FONT_SINGLE_CLOSE, 'single');
    if (!segments.some((segment) => segment.type !== 'text')) return;

    const fragment = document.createDocumentFragment();
    const insertedNodes = [];
    const groupId = `f${++fontQuoteWrapSeq}`;

    segments.forEach((segment) => {
      if (!segment.text) return;
      let node;
      if (segment.type === 'text') {
        node = document.createTextNode(segment.text);
      } else {
        node = document.createElement('span');
        node.setAttribute('data-crack-ui-font-quote', segment.type);
        node.setAttribute('data-crack-ui-font-quote-group', groupId);
        node.textContent = segment.text;
      }
      insertedNodes.push(node);
      fragment.appendChild(node);
    });

    const parent = textNode.parentNode;
    if (!parent) return;
    fontQuoteWraps.set(groupId, { originalNode: textNode, insertedNodes });
    parent.replaceChild(fragment, textNode);
  }

  function collectCrackUiFontQuoteTextNodes(markdown, quotePattern) {
    const walker = document.createTreeWalker(markdown, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
        const matches = typeof quotePattern === 'function'
          ? quotePattern(node.nodeValue)
          : quotePattern.test(node.nodeValue);
        if (!matches) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('[data-crack-ui-font-quote], code, pre, .not-wrtn-markdown')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    return nodes;
  }

  function findCrackUiFontCrossNodeQuote(markdown) {
    const dialogueMatcher = getCrackUiDialogueQuoteMatcher();
    const walker = document.createTreeWalker(markdown, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || parent.closest('[data-crack-ui-font-quote], code, pre, .not-wrtn-markdown')) return NodeFilter.FILTER_REJECT;
        const hasDialogueCandidate = fontSettings.dialogueBgEnabled && dialogueMatcher.hasCandidate(node.nodeValue);
        const hasThoughtCandidate = fontSettings.thoughtBgEnabled && node.nodeValue.includes("'");
        if (!hasDialogueCandidate && !hasThoughtCandidate) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let active = null;
    let node;
    while ((node = walker.nextNode())) {
      const value = node.nodeValue || '';
      let index = 0;
      while (index < value.length) {
        const char = String.fromCodePoint(value.codePointAt(index));
        if (!active) {
          const dialogueCloseSet = fontSettings.dialogueBgEnabled
            ? dialogueMatcher.closeByOpen.get(char)
            : null;
          if (dialogueCloseSet) {
            active = { type: 'double', startNode: node, startOffset: index, closeSet: dialogueCloseSet };
          } else if (fontSettings.thoughtBgEnabled && FONT_SINGLE_OPEN.has(char)) {
            active = { type: 'single', startNode: node, startOffset: index, closeSet: FONT_SINGLE_CLOSE };
          }
          index += char.length;
          continue;
        }
        if (active.closeSet.has(char)) {
          return { ...active, endNode: node, endOffset: index + char.length };
        }
        index += char.length;
      }
    }
    return null;
  }

  function wrapCrackUiFontCrossNodeQuote(markdown) {
    const match = findCrackUiFontCrossNodeQuote(markdown);
    if (!match) return false;

    const range = document.createRange();
    range.setStart(match.startNode, match.startOffset);
    range.setEnd(match.endNode, match.endOffset);
    const groupId = `f${++fontQuoteWrapSeq}`;
    const wrapper = document.createElement('span');
    wrapper.setAttribute('data-crack-ui-font-quote', match.type);
    wrapper.setAttribute('data-crack-ui-font-quote-group', groupId);

    try {
      range.surroundContents(wrapper);
    } catch {
      const fragment = range.extractContents();
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);
    }
    fontQuoteWraps.set(groupId, { wrapperNode: wrapper });
    range.detach?.();
    return true;
  }

  function wrapCrackUiFontQuotes(markdown) {
    if (fontSettings.dialogueBgEnabled) {
      const matcher = getCrackUiDialogueQuoteMatcher();
      collectCrackUiFontQuoteTextNodes(markdown, (value) => matcher.hasCandidate(value))
        .forEach((node) => replaceCrackUiFontQuoteTextNode(node, 'double'));
    }

    let safety = 0;
    while (safety < 160 && wrapCrackUiFontCrossNodeQuote(markdown)) safety += 1;

    if (fontSettings.thoughtBgEnabled) {
      collectCrackUiFontQuoteTextNodes(markdown, /'/).forEach((node) => replaceCrackUiFontQuoteTextNode(node, 'single'));
    }
  }

  function restoreCrackUiFontQuoteDecorations() {
    for (const [groupId, record] of Array.from(fontQuoteWraps.entries())) {
      try {
        if (record?.wrapperNode instanceof HTMLElement) {
          const wrapper = record.wrapperNode;
          if (wrapper.isConnected && wrapper.parentNode) wrapper.replaceWith(...Array.from(wrapper.childNodes));
          fontQuoteWraps.delete(groupId);
          continue;
        }

        const originalNode = record?.originalNode;
        const insertedNodes = Array.isArray(record?.insertedNodes) ? record.insertedNodes : [];
        const firstConnected = insertedNodes.find((node) => node?.isConnected && node.parentNode);
        const parent = firstConnected?.parentNode || originalNode?.parentNode;
        if (originalNode instanceof Text && parent && !originalNode.isConnected) parent.insertBefore(originalNode, firstConnected || null);
        insertedNodes.forEach((node) => {
          if (node && node !== originalNode && node.parentNode) node.parentNode.removeChild(node);
        });
        fontQuoteWraps.delete(groupId);
      } catch (error) {
        reportCrackUiError('font.quote.restore', error);
      }
    }

    document.querySelectorAll('span[data-crack-ui-font-quote]').forEach((span) => {
      try {
        span.replaceWith(...Array.from(span.childNodes));
      } catch {
      }
    });

    findCrackUiFontMarkdownRoots().forEach((markdown) => {
      clearCrackUiFontQuoteRootScanState(markdown);
    });
  }

  function disableCrackUiFontQuoteDecorations() {
    clearTimeout(fontQuoteScanTimer);
    fontQuoteScanTimer = null;
    if (fontQuoteScanRaf) cancelAnimationFrame(fontQuoteScanRaf);
    fontQuoteScanRaf = 0;
    if (fontQuoteWraps.size || document.querySelector('[data-crack-ui-font-quote]')) restoreCrackUiFontQuoteDecorations();
    if (document.querySelector('[data-crack-ui-font-base="1"]')) restoreCrackUiFontBaseDecorations();
    findCrackUiFontMarkdownRoots().forEach(clearCrackUiFontQuoteRootScanState);
    fontQuoteDirtyRoots.clear();
    fontQuoteFullScanPending = true;
  }

  function resetCrackUiFontQuoteDecorations() {
    disableCrackUiFontQuoteDecorations();
    if (fontSettings.masterEnabled && isCrackUiFontInlineDecorationEnabled()) {
      scheduleCrackUiFontQuoteScan({ immediate: true, full: true });
    }
  }

  function getCrackUiFontQuoteTextKey(value) {
    const text = String(value || '');
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `${text.length}:${(hash >>> 0).toString(36)}`;
  }

  function clearCrackUiFontQuoteRootScanState(markdown) {
    if (!(markdown instanceof HTMLElement)) return;
    delete markdown.dataset.crackUiFontLenAt;
    delete markdown.dataset.crackUiFontTextKey;
    delete markdown.dataset.crackUiFontQuotedKey;
    delete markdown.dataset.crackUiFontHadQuote;
    delete markdown.dataset.crackUiFontHadBase;
  }

  function getCrackUiFontMarkdownRootFromNode(node) {
    const element = node instanceof Element
      ? node
      : (node?.parentElement instanceof Element ? node.parentElement : null);
    if (!element) return null;
    const markdown = element.matches('.wrtn-markdown')
      ? element
      : element.closest('.wrtn-markdown');
    if (!(markdown instanceof HTMLElement) || !markdown.closest('main')) return null;
    if (markdown.closest(`#${ID.panelRoot}, #${ID.panel}, #${ID.bottomModelPopup}, .not-wrtn-markdown`)) return null;
    return markdown;
  }

  function observeCrackUiFontQuoteMutations() {
    if (fontQuoteMutationObserver || !document.body) return;

    fontQuoteMutationObserver = new MutationObserver((mutations) => {
      if (!fontSettings.masterEnabled || !isCrackUiFontInlineDecorationEnabled()) return;

      const changedRoots = new Set();
      const addDirectRoot = (node) => {
        const directRoot = getCrackUiFontMarkdownRootFromNode(node);
        if (directRoot) changedRoots.add(directRoot);
      };
      const addAddedRoot = (node) => {
        addDirectRoot(node);
        if (!(node instanceof Element)) return;
        if (node.closest(`#${ID.panelRoot}, #${ID.panel}, #${ID.bottomModelPopup}, .not-wrtn-markdown`)) return;
        node.querySelectorAll?.('.wrtn-markdown').forEach((markdown) => {
          const root = getCrackUiFontMarkdownRootFromNode(markdown);
          if (root) changedRoots.add(root);
        });
      };

      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') {
          addDirectRoot(mutation.target);
          return;
        }
        if (mutation.type !== 'childList') return;
        // mutation.target may be <body>. Descendant-scanning it would mark every old log
        // dirty whenever an unrelated overlay/button is inserted. Only scan added subtrees.
        addDirectRoot(mutation.target);
        mutation.addedNodes.forEach(addAddedRoot);
      });

      if (!changedRoots.size) return;
      changedRoots.forEach((markdown) => {
        clearCrackUiFontQuoteRootScanState(markdown);
        fontQuoteDirtyRoots.add(markdown);
      });
      scheduleCrackUiFontQuoteScan();
    });

    fontQuoteMutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    scheduleCrackUiFontQuoteScan({ immediate: true, full: true });
  }

  function scanCrackUiFontQuotes() {
    fontQuoteLastScanAt = Date.now();
    if (!fontSettings.masterEnabled || !isCrackUiFontInlineDecorationEnabled()) return;

    const observer = fontQuoteMutationObserver;
    observer?.disconnect();
    try {
      const fullScan = fontQuoteFullScanPending || fontQuoteDirtyRoots.size === 0;
      fontQuoteFullScanPending = false;
      const roots = fullScan
        ? findCrackUiFontMarkdownRoots()
        : [...fontQuoteDirtyRoots].filter((markdown) => markdown instanceof HTMLElement && markdown.isConnected);
      fontQuoteDirtyRoots.clear();
      const recentFrom = fullScan ? Math.max(0, roots.length - 12) : 0;
      const now = Date.now();
      const dialogueMatcher = fontSettings.dialogueBgEnabled ? getCrackUiDialogueQuoteMatcher() : null;
      let needsFollowUp = false;

      roots.forEach((markdown, index) => {
        if (!(markdown instanceof HTMLElement) || markdown.closest('.not-wrtn-markdown')) return;
        const recent = !fullScan || index >= recentFrom;
        let renderedQuote;
        let renderedBase;
        const hasRenderedQuote = () => {
          if (renderedQuote === undefined) {
            renderedQuote = !!markdown.querySelector('[data-crack-ui-font-quote]');
          }
          return renderedQuote;
        };
        const hasRenderedBase = () => {
          if (renderedBase === undefined) {
            renderedBase = !!markdown.querySelector('[data-crack-ui-font-base="1"]');
          }
          return renderedBase;
        };

        // The dedicated observer clears this root's scan state whenever its text/children change.
        // Untouched old logs therefore need no per-scan descendant queries while a reply streams.
        if (!recent && markdown.dataset.crackUiFontQuotedKey !== undefined) return;

        const content = markdown.textContent || '';
        const length = content.length;
        const textKey = getCrackUiFontQuoteTextKey(content);
        const previousTextKey = markdown.dataset.crackUiFontTextKey || '';
        const decoratedTextKey = markdown.dataset.crackUiFontQuotedKey || '';

        if (textKey !== previousTextKey) {
          markdown.dataset.crackUiFontTextKey = textKey;
          markdown.dataset.crackUiFontLenAt = String(now);
          delete markdown.dataset.crackUiFontQuotedKey;
          delete markdown.dataset.crackUiFontHadQuote;
          delete markdown.dataset.crackUiFontHadBase;
          fontQuoteDirtyRoots.add(markdown);
          needsFollowUp = true;
          return;
        }

        if (decoratedTextKey === textKey) {
          const hadQuote = markdown.dataset.crackUiFontHadQuote === '1';
          const hadBase = markdown.dataset.crackUiFontHadBase === '1';
          if ((!hadQuote || hasRenderedQuote()) && (!hadBase || hasRenderedBase())) return;
        }

        if (now - Number(markdown.dataset.crackUiFontLenAt || now) < 180) {
          fontQuoteDirtyRoots.add(markdown);
          needsFollowUp = true;
          return;
        }

        try {
          // Base spans are always applied last. Unwrap them before quote detection so a newly
          // edited or newly enabled dialogue/thought pair can be recognized correctly.
          restoreCrackUiFontBaseDecorations(markdown);

          const plainContent = markdown.textContent || '';
          const hasDialogueCandidate = !!(dialogueMatcher && dialogueMatcher.hasCandidate(plainContent));
          const hasThoughtCandidate = fontSettings.thoughtBgEnabled && plainContent.includes("'");
          if (hasDialogueCandidate || hasThoughtCandidate) wrapCrackUiFontQuotes(markdown);
          if (fontSettings.baseBgEnabled) wrapCrackUiFontBaseText(markdown);

          const renderedQuoteAfter = !!markdown.querySelector('[data-crack-ui-font-quote]');
          const renderedBaseAfter = !!markdown.querySelector('[data-crack-ui-font-base="1"]');
          markdown.dataset.crackUiFontQuotedKey = textKey;
          markdown.dataset.crackUiFontHadQuote = renderedQuoteAfter ? '1' : '0';
          markdown.dataset.crackUiFontHadBase = renderedBaseAfter ? '1' : '0';
        } catch (error) {
          reportCrackUiError('font.inline.scan', error);
        }
      });

      if (fontQuoteWraps.size >= 350) {
        for (const [groupId, record] of fontQuoteWraps) {
          const connected = record?.wrapperNode?.isConnected || record?.originalNode?.isConnected || record?.insertedNodes?.some?.((node) => node?.isConnected);
          if (!connected) fontQuoteWraps.delete(groupId);
        }
      }

      if (needsFollowUp) scheduleCrackUiFontQuoteScan();
    } finally {
      if (observer && document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
    }
  }

  function scheduleCrackUiFontQuoteScan(options = {}) {
    if (!fontSettings.masterEnabled || !isCrackUiFontInlineDecorationEnabled()) return;
    if (options.full === true || (options.immediate === true && options.full !== false)) {
      fontQuoteFullScanPending = true;
    }
    if (fontQuoteScanTimer || fontQuoteScanRaf) return;

    const elapsed = Date.now() - fontQuoteLastScanAt;
    const delay = options.immediate || elapsed >= 260 ? 0 : 260 - elapsed;
    fontQuoteScanTimer = setTimeout(() => {
      fontQuoteScanTimer = null;
      fontQuoteScanRaf = requestAnimationFrame(() => {
        fontQuoteScanRaf = 0;
        scanCrackUiFontQuotes();
      });
    }, delay);
  }

  function getCrackUiFontResolveStatusText() {
    if (!fontSettings.masterEnabled) return '폰트 사용이 꺼져 있음';
    if (fontFileOperationActive) return '폰트 파일 저장 중';
    if (fontResolveStatus === 'loading') return '웹폰트 이름 확인 중';
    if (fontResolveStatus === 'failed') return `저장 실패${fontResolveLastError ? ` · ${fontResolveLastError}` : ''}`;
    if (fontSaveStatusText) return fontSaveStatusText;
    if (fontSettings.customFontSource) return '웹폰트 저장을 누르면 이름을 자동 확인합니다';
    const count = Array.isArray(fontSettings.savedFonts) ? fontSettings.savedFonts.length : 0;
    return count ? `저장된 폰트 ${count}개` : '저장된 폰트 없음';
  }

  function getCrackUiFontSelectOptionEntries(records = normalizeCrackUiSavedFonts(fontSettings.savedFonts)) {
    return [
      ['', 'Crack 기본 폰트'],
      ...records.map((record) => [record.id, crackUiFontIsFileRecord(record) ? `${record.family} · 파일` : record.family]),
    ];
  }

  function getCrackUiFontSelectOptionSignature(entries = getCrackUiFontSelectOptionEntries()) {
    return JSON.stringify(entries);
  }

  function getCrackUiFontSelectCurrentSignature(select) {
    if (!(select instanceof HTMLSelectElement)) return '';
    return JSON.stringify([...select.options].map((option) => [option.value, option.textContent || '']));
  }

  function isCrackUiFontAssignmentPickerActive(select) {
    return !!select && (
      select.dataset.crackUiFontPickerActive === '1' ||
      document.activeElement === select
    );
  }

  function syncCrackUiFontAssignmentSelect(select, settingKey, masterEnabled, entries = getCrackUiFontSelectOptionEntries()) {
    if (!(select instanceof HTMLSelectElement)) return;

    const optionsSignature = getCrackUiFontSelectOptionSignature(entries);
    const pickerActive = isCrackUiFontAssignmentPickerActive(select);
    const storedId = String(fontSettings[settingKey] || '');
    const selectedId = getCrackUiSavedFontById(storedId) ? storedId : '';

    // Replacing <option> nodes while iOS/Android's native select sheet is open can
    // close and immediately reopen the sheet in a loop. Keep the live select DOM
    // completely untouched until the picker loses focus.
    if (!pickerActive && getCrackUiFontSelectCurrentSignature(select) !== optionsSignature) {
      const fragment = document.createDocumentFragment();
      entries.forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        fragment.appendChild(option);
      });
      select.replaceChildren(fragment);
    }

    if (!pickerActive && select.value !== selectedId) select.value = selectedId;
    select.disabled = !masterEnabled;
  }

  function renderCrackUiFontSelectOptions(selectedId = '') {
    return getCrackUiFontSelectOptionEntries()
      .map(([value, label]) => `<option value="${crackUiFontEscapeHtml(value)}"${value === selectedId ? ' selected' : ''}>${crackUiFontEscapeHtml(label)}</option>`)
      .join('');
  }

  function getCrackUiSavedFontListSignature(records = normalizeCrackUiSavedFonts(fontSettings.savedFonts)) {
    return records.map((record) => [
      record.id,
      record.family,
      record.kind,
      record.filename || '',
      record.source || '',
    ].join('\u0000')).join('\u0001');
  }

  function renderCrackUiSavedFontList(records = normalizeCrackUiSavedFonts(fontSettings.savedFonts)) {
    if (!records.length) return '<span class="crack-ui-font-saved-empty">저장된 폰트가 없습니다</span>';
    return records.map((record) => `
      <span class="crack-ui-font-saved-chip" title="${crackUiFontEscapeHtml(crackUiFontIsFileRecord(record) ? record.filename : `${record.family} 웹폰트`)}">
        <span class="crack-ui-font-saved-name">${crackUiFontEscapeHtml(record.family)}</span>
        <span class="crack-ui-font-saved-type">${crackUiFontIsFileRecord(record) ? '파일' : '웹'}</span>
        <button
          type="button"
          class="crack-ui-font-saved-remove"
          data-crack-ui-font-remove="${crackUiFontEscapeHtml(record.id)}"
          aria-label="${crackUiFontEscapeHtml(record.family)} 삭제"
          title="${crackUiFontEscapeHtml(record.family)} 삭제"
        >×</button>
      </span>`).join('');
  }

  function renderCrackUiFontToggleRow(key, label, description = '') {
    const idMap = {
      masterEnabled: ID.toggleFontMaster,
      textShadowEnabled: ID.toggleFontShadow,
      baseBgEnabled: ID.toggleFontBase,
      dialogueBgEnabled: ID.toggleFontDialogue,
      thoughtBgEnabled: ID.toggleFontThought,
      italicBgEnabled: ID.toggleFontItalic,
      strongBgEnabled: ID.toggleFontStrong,
      codeBlockBgEnabled: ID.toggleFontCodeBlock,
    };
    return `
      <label class="crack-ui-row crack-ui-font-toggle-row">
        <span class="crack-ui-row-text">
          <span class="crack-ui-row-name">${crackUiFontEscapeHtml(label)}</span>
          ${description ? `<span class="crack-ui-row-desc">${crackUiFontEscapeHtml(description)}</span>` : ''}
        </span>
        <span>
          <input id="${idMap[key]}" class="crack-ui-toggle" type="checkbox" data-crack-ui-font-toggle="${key}">
          <span class="crack-ui-switch" aria-hidden="true"></span>
        </span>
      </label>`;
  }

  function renderCrackUiFontColorPickerPopover() {
    return `
      <div id="${ID.fontColorPickerPopover}" role="dialog" aria-modal="false" aria-labelledby="${ID.fontColorPickerTitle}" hidden>
        <div class="crack-ui-font-color-picker-head">
          <span id="${ID.fontColorPickerTitle}" class="crack-ui-font-color-picker-title">색상 선택</span>
          <button id="${ID.fontColorPickerDone}" type="button" class="crack-ui-font-color-picker-done">완료</button>
        </div>
        <div id="${ID.fontColorPickerSv}" aria-label="채도와 밝기 선택">
          <span id="${ID.fontColorPickerCursor}" aria-hidden="true"></span>
        </div>
        <input id="${ID.fontColorPickerHue}" type="range" min="0" max="359" step="1" value="0" aria-label="색상 계열 선택">
        <div class="crack-ui-font-color-picker-value-row">
          <button id="${ID.fontColorPickerPrevious}" type="button" aria-label="이전 색상으로 되돌리기"></button>
          <span id="${ID.fontColorPickerCurrent}" aria-label="현재 색상"></span>
          <input id="${ID.fontColorPickerHex}" type="text" inputmode="text" maxlength="7" spellcheck="false" aria-label="HEX 색상 코드">
        </div>
        <span class="crack-ui-font-color-picker-recent-label">최근 사용 색상</span>
        <div id="${ID.fontColorPickerRecent}" aria-label="최근 사용 색상"></div>
      </div>`;
  }

  function renderCrackUiFontColorRow(key, label) {
    const value = isCrackUiFontSettingCustom(key) ? fontSettings[key] : getCrackUiFontNativeSettingValue(key);
    const accentToggleKey = FONT_ACCENT_COLOR_TOGGLE[key] || '';
    const trailingControl = accentToggleKey
      ? `<button
          type="button"
          class="crack-ui-font-accent-switch"
          role="switch"
          data-checked="0"
          aria-checked="false"
          data-crack-ui-font-accent-toggle="${accentToggleKey}"
          aria-label="${crackUiFontEscapeHtml(label)} 적용"
          title="${crackUiFontEscapeHtml(label)} 적용"
        ></button>`
      : `<button
          type="button"
          class="crack-ui-font-range-reset-button crack-ui-font-color-reset-button"
          data-crack-ui-font-color-reset="${key}"
          aria-label="${crackUiFontEscapeHtml(label)} 초기화"
          title="${crackUiFontEscapeHtml(label)} 초기화"
        >↺</button>`;
    return `
      <div class="crack-ui-font-color-row"${accentToggleKey ? ` data-crack-ui-font-accent-row="${accentToggleKey}"` : ''}>
        <span class="crack-ui-font-control-label">${crackUiFontEscapeHtml(label)}</span>
        <span class="crack-ui-font-color-inputs">
          <button
            type="button"
            class="crack-ui-font-color-swatch"
            data-crack-ui-font-color-picker="${key}"
            aria-label="${crackUiFontEscapeHtml(label)} 색상 선택"
            aria-haspopup="dialog"
            aria-expanded="false"
            style="--crack-ui-font-swatch:${crackUiFontEscapeHtml(value)}"
          ></button>
          <input type="text" value="${crackUiFontEscapeHtml(value)}" spellcheck="false" maxlength="7" data-crack-ui-font-color-code="${key}" aria-label="${crackUiFontEscapeHtml(label)} 코드">
          ${trailingControl}
        </span>
      </div>`;
  }

  function renderCrackUiFontRangeRow(key) {
    const def = FONT_SETTING_RANGE[key];
    const inputConfig = getCrackUiFontRangeInputConfig(key, getCrackUiFontEffectiveSettingValue(key));
    return `
      <div class="crack-ui-range-row crack-ui-font-range-row">
        <div class="crack-ui-range-head">
          <span class="crack-ui-row-name">${crackUiFontEscapeHtml(def.label)}</span>
          <span class="crack-ui-font-range-actions">
            <span class="crack-ui-range-value" data-crack-ui-font-range-value="${key}">${formatCrackUiFontSettingValue(key, getCrackUiFontEffectiveSettingValue(key))}</span>
            <button
              type="button"
              class="crack-ui-font-range-reset-button"
              data-crack-ui-font-range-reset="${key}"
              aria-label="${crackUiFontEscapeHtml(def.label)} 초기화"
              title="${crackUiFontEscapeHtml(def.label)} 초기화"
            >↺</button>
          </span>
        </div>
        <input class="crack-ui-range" type="range" min="${inputConfig.min}" max="${inputConfig.max}" step="${inputConfig.step}" value="${inputConfig.value}" data-crack-ui-font-range="${key}" aria-label="${crackUiFontEscapeHtml(def.label)}">
      </div>`;
  }

  function renderCrackUiDialogueQuoteEditor() {
    const pairs = normalizeCrackUiDialogueQuotePairs(fontSettings.dialogueQuotePairs);
    const chips = pairs.length
      ? pairs.map(([open, close], index) => `
          <span class="crack-ui-font-quote-chip">
            <span class="crack-ui-font-quote-chip-text">${crackUiFontEscapeHtml(open)}&nbsp;&nbsp;${crackUiFontEscapeHtml(close)}</span>
            <button
              type="button"
              class="crack-ui-font-quote-chip-remove"
              data-crack-ui-dialogue-quote-remove="${index}"
              aria-label="${crackUiFontEscapeHtml(open)} ${crackUiFontEscapeHtml(close)} 감지 문자 삭제"
              title="삭제"
            >×</button>
          </span>`).join('')
      : '<span class="crack-ui-font-quote-empty">등록된 대사 감지 문자가 없습니다</span>';

    return `
      <div class="crack-ui-font-quote-editor" data-crack-ui-dialogue-quote-editor="1">
        <div class="crack-ui-font-quote-chip-list" data-crack-ui-dialogue-quote-list="1">${chips}</div>
        <div class="crack-ui-font-quote-add-row">
          <input
            type="text"
            maxlength="2"
            inputmode="text"
            autocomplete="off"
            spellcheck="false"
            placeholder="여는 문자"
            data-crack-ui-dialogue-quote-open="1"
            aria-label="대사 여는 문자"
          >
          <span class="crack-ui-font-quote-arrow" aria-hidden="true">→</span>
          <input
            type="text"
            maxlength="2"
            inputmode="text"
            autocomplete="off"
            spellcheck="false"
            placeholder="닫는 문자"
            data-crack-ui-dialogue-quote-close="1"
            aria-label="대사 닫는 문자"
          >
          <button type="button" class="crack-ui-font-quote-add-button" data-crack-ui-dialogue-quote-add="1">추가</button>
        </div>
      </div>`;
  }


  function renderCrackUiDialogueQuoteTools() {
    const count = normalizeCrackUiDialogueQuotePairs(fontSettings.dialogueQuotePairs).length;
    return `
      <div class="crack-ui-font-quote-tools" data-crack-ui-dialogue-quote-tools="1" data-open="${fontDialogueQuoteMenuOpen ? '1' : '0'}">
        <button
          type="button"
          class="crack-ui-font-quote-toggle"
          data-crack-ui-dialogue-quote-toggle="1"
          aria-expanded="${fontDialogueQuoteMenuOpen ? 'true' : 'false'}"
          aria-label="대사 감지 문자 편집"
          title="대사 감지 문자 편집"
        ><span>감지 문자 <span data-crack-ui-dialogue-quote-count="1">${count}</span>개</span><span class="crack-ui-font-quote-toggle-arrow" aria-hidden="true">▾</span></button>
        <div class="crack-ui-font-quote-popover" data-crack-ui-dialogue-quote-popover="1"${fontDialogueQuoteMenuOpen ? '' : ' hidden'}>
          <div class="crack-ui-font-quote-popover-head">
            <span class="crack-ui-font-quote-popover-title">대사 감지 문자</span>
            <span class="crack-ui-font-quote-popover-note">여는 문자와 닫는 문자 한 쌍</span>
          </div>
          ${renderCrackUiDialogueQuoteEditor()}
        </div>
      </div>`;
  }

  function renderCrackUiFontItalicStyleControl() {
    return `
      <label class="crack-ui-font-italic-style-control" data-crack-ui-font-italic-style-control="1" data-disabled="1">
        <input
          id="${ID.toggleFontItalicStyle}"
          type="checkbox"
          data-crack-ui-font-italic-style-toggle="1"
          aria-label="묘사 기울임"
        >
        <span>기울임</span>
      </label>`;
  }

  function renderCrackUiFontHighlightCard(key, label, description, colorRows = [], options = {}) {
    const layoutClass = options.half ? ' crack-ui-font-highlight-card-half' : '';
    const dialogueClass = options.dialogue ? ' crack-ui-font-dialogue-card' : '';
    const italicClass = options.italic ? ' crack-ui-font-italic-card' : '';
    const extraClass = `${layoutClass}${dialogueClass}${italicClass}`;
    return `
      <div class="crack-ui-font-card crack-ui-font-highlight-card${extraClass}">
        ${renderCrackUiFontToggleRow(key, label, description)}
        ${options.extraHtml || ''}
        ${colorRows.length ? `<div class="crack-ui-font-color-grid">${colorRows.map(([colorKey, colorLabel]) => renderCrackUiFontColorRow(colorKey, colorLabel)).join('')}</div>` : ''}
      </div>`;
  }

  function renderCrackUiFontPresetList() {
    const presets = normalizeCrackUiFontPresets(fontPresets);
    if (!presets.length) return '<span class="crack-ui-font-preset-empty">저장된 프리셋 없음</span>';
    return presets.map((preset) => `
      <span class="crack-ui-font-preset-item">
        <button
          type="button"
          class="crack-ui-font-preset-load"
          data-crack-ui-font-preset-load="${crackUiFontEscapeHtml(preset.id)}"
          title="${crackUiFontEscapeHtml(preset.name)} 불러오기"
          aria-label="${crackUiFontEscapeHtml(preset.name)} 프리셋 불러오기"
        ><span class="crack-ui-font-preset-load-name">${crackUiFontEscapeHtml(preset.name)}</span></button>
        <button
          type="button"
          class="crack-ui-font-preset-remove"
          data-crack-ui-font-preset-remove="${crackUiFontEscapeHtml(preset.id)}"
          title="${crackUiFontEscapeHtml(preset.name)} 삭제"
          aria-label="${crackUiFontEscapeHtml(preset.name)} 프리셋 삭제"
        >×</button>
      </span>`).join('');
  }

  function renderCrackUiFontPresetDock() {
    const presetCount = normalizeCrackUiFontPresets(fontPresets).length;
    return `
      <div id="${ID.fontPresetDock}" class="crack-ui-font-preset-dock" data-open="${fontPresetMenuOpen ? '1' : '0'}"${activePanelSection === 'font' ? '' : ' hidden'}>
        <button
          id="${ID.fontPresetToggleButton}"
          type="button"
          class="crack-ui-panel-preset"
          aria-expanded="${fontPresetMenuOpen ? 'true' : 'false'}"
          aria-controls="${ID.fontPresetPopover}"
          aria-label="폰트 프리셋"
          title="폰트 프리셋 열기"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M6.5 4.5h11v15l-5.5-3.2-5.5 3.2v-15Z" stroke-width="1.7" stroke-linejoin="round"></path>
          </svg>
        </button>
        <div id="${ID.fontPresetPopover}" class="crack-ui-font-preset-popover"${fontPresetMenuOpen ? '' : ' hidden'}>
          <div class="crack-ui-font-preset-head">
            <span class="crack-ui-font-preset-title">폰트 프리셋</span>
            <span class="crack-ui-font-preset-head-note"><span id="${ID.fontPresetCount}">${presetCount}</span>개 저장</span>
          </div>
          <div id="${ID.fontPresetList}" class="crack-ui-font-preset-list">${renderCrackUiFontPresetList()}</div>
          <div class="crack-ui-font-preset-create">
            <input
              id="${ID.fontPresetNameInput}"
              class="crack-ui-font-preset-name"
              type="text"
              maxlength="${FONT_PRESET_NAME_MAX_LENGTH}"
              autocomplete="off"
              spellcheck="false"
              placeholder="새 프리셋 이름"
              aria-label="폰트 프리셋 이름"
            >
            <button id="${ID.fontPresetSaveButton}" type="button" class="crack-ui-font-preset-save">저장</button>
          </div>
          <span id="${ID.fontPresetStatus}" class="crack-ui-font-preset-status">${crackUiFontEscapeHtml(fontPresetStatusText)}</span>
        </div>
      </div>`;
  }

  function renderCrackUiFontSectionHtml() {
    return `
      <div class="crack-ui-section" data-crack-ui-section="font">
        <div class="crack-ui-section-body crack-ui-font-section-body" data-crack-ui-section-body="font" data-crack-ui-font-master="off">
          <div class="crack-ui-font-card crack-ui-font-master-card">
            ${renderCrackUiFontToggleRow('masterEnabled', '폰트 사용')}
          </div>

          <div class="crack-ui-font-highlight-grid">
            ${renderCrackUiFontHighlightCard('dialogueBgEnabled', '대사', '등록한 문자쌍을 감지', [
              ['dialogueBg', '배경색'],
              ['dialogueTextColor', '글자색'],
            ], { half: true, dialogue: true, extraHtml: renderCrackUiDialogueQuoteTools() })}
            ${renderCrackUiFontHighlightCard('baseBgEnabled', '기본', '다른 강조로 감싸지지 않은 일반 글자', [
              ['baseBg', '배경색'],
              ['baseTextColor', '글자색'],
            ], { half: true })}
            ${renderCrackUiFontHighlightCard('thoughtBgEnabled', '생각', "ASCII '작은따옴표'를 감지", [
              ['thoughtBg', '배경색'],
              ['thoughtTextColor', '글자색'],
            ], { half: true })}
            ${renderCrackUiFontHighlightCard('italicBgEnabled', '묘사', '*묘사*로 렌더된 부분', [
              ['italicBg', '배경색'],
              ['italicTextColor', '글자색'],
            ], { half: true, italic: true, extraHtml: renderCrackUiFontItalicStyleControl() })}
            ${renderCrackUiFontHighlightCard('strongBgEnabled', '굵게', '**굵게**로 렌더된 부분', [
              ['strongBg', '배경색'],
              ['strongBgTextColor', '글자색'],
            ], { half: true })}
            ${renderCrackUiFontHighlightCard('codeBlockBgEnabled', '코드블럭', '코드블럭 테두리·배경·글자색을 설정', [
              ['codeAccent', '배경색'],
              ['codeTextColor', '글자색'],
            ], { half: true })}
          </div>

          <div class="crack-ui-font-card crack-ui-font-typography-card">
            <div class="crack-ui-font-card-head">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">글자 모양</span>
                <span class="crack-ui-row-desc">조절한 항목만 적용되며 ↺는 Crack 순정값으로 돌아갑니다</span>
              </span>
              <button
                id="${ID.fontTypographyResetButton}"
                type="button"
                class="crack-ui-font-card-reset-button"
                data-crack-ui-font-range-reset-all="1"
              >초기화</button>
            </div>
            <div class="crack-ui-font-range-grid">
              ${Object.keys(FONT_SETTING_RANGE).map(renderCrackUiFontRangeRow).join('')}
            </div>
          </div>

          <div class="crack-ui-font-card">
            ${renderCrackUiFontToggleRow('textShadowEnabled', '글자 그림자', '배경 위에서도 글자를 또렷하게 표시')}
            <div class="crack-ui-font-choice-row" data-crack-ui-font-shadow-choices="1" role="radiogroup" aria-label="그림자 색">
              <button type="button" class="crack-ui-font-choice-button" data-crack-ui-font-shadow-tone="dark" role="radio" aria-label="검정 그림자">검정</button>
              <button type="button" class="crack-ui-font-choice-button" data-crack-ui-font-shadow-tone="light" role="radio" aria-label="흰색 그림자">흰색</button>
            </div>
          </div>

          <div class="crack-ui-font-card crack-ui-font-assignment-card">
            <div class="crack-ui-font-card-head">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">폰트 선택</span>
                <span class="crack-ui-row-desc">저장된 폰트를 본문·코드블럭·상단 타이틀에 각각 적용합니다</span>
              </span>
            </div>
            <div class="crack-ui-font-select-grid">
              <label class="crack-ui-font-select-field">
                <span class="crack-ui-font-control-label">본문</span>
                <select id="${ID.fontBodySelect}" data-crack-ui-font-assignment="bodyFontId">${renderCrackUiFontSelectOptions(fontSettings.bodyFontId)}</select>
                <span class="crack-ui-font-preview" data-crack-ui-font-preview="body" aria-label="본문 폰트 미리보기">
                  <span class="crack-ui-font-preview-line">가나다라마바사 아자차카타파하</span>
                  <span class="crack-ui-font-preview-line">The quick brown fox · 1234567890</span>
                </span>
              </label>
              <label class="crack-ui-font-select-field">
                <span class="crack-ui-font-control-label">코드블럭</span>
                <select id="${ID.fontCodeSelect}" data-crack-ui-font-assignment="codeFontId">${renderCrackUiFontSelectOptions(fontSettings.codeFontId)}</select>
                <span class="crack-ui-font-preview" data-crack-ui-font-preview="code" aria-label="코드블럭 폰트 미리보기">
                  <span class="crack-ui-font-preview-line">const message = "안녕하세요";</span>
                  <span class="crack-ui-font-preview-line">console.log(message); // 123</span>
                </span>
              </label>
              <label class="crack-ui-font-select-field">
                <span class="crack-ui-font-control-label">타이틀</span>
                <select id="${ID.fontTitleSelect}" data-crack-ui-font-assignment="titleFontId">${renderCrackUiFontSelectOptions(fontSettings.titleFontId)}</select>
                <span class="crack-ui-font-preview" data-crack-ui-font-preview="title" aria-label="타이틀 폰트 미리보기">
                  <span class="crack-ui-font-preview-line">가나다라마바사 타이틀 미리보기</span>
                  <span class="crack-ui-font-preview-line">Sample title · 1234567890</span>
                </span>
              </label>
            </div>
          </div>

          <div class="crack-ui-font-card crack-ui-font-webfont-card">
            <div class="crack-ui-font-card-head">
              <span class="crack-ui-row-text">
                <span class="crack-ui-row-name">폰트 등록</span>
                <span class="crack-ui-row-desc">웹폰트 소스나 기기의 TTF·OTF·WOFF 파일을 저장합니다</span>
              </span>
            </div>
            <div class="crack-ui-font-field-stack">
              <div class="crack-ui-font-register-grid">
                <label class="crack-ui-font-field">
                  <span class="crack-ui-font-control-label">웹폰트 소스</span>
                  <textarea id="${ID.fontSourceInput}" rows="2" spellcheck="false" placeholder="@font-face {...} / 폰트 URL / CSS URL">${crackUiFontEscapeHtml(fontSettings.customFontSource)}</textarea>
                </label>
                <div class="crack-ui-font-field crack-ui-font-file-field">
                  <span class="crack-ui-font-control-label">폰트 파일</span>
                  <button id="${ID.fontFileButton}" type="button" class="crack-ui-font-action-button crack-ui-font-file-button">파일 선택</button>
                  <span class="crack-ui-font-file-hint">TTF · OTF · WOFF · WOFF2 / 브라우저 내부 저장</span>
                  <input id="${ID.fontFileInput}" class="crack-ui-font-file-input" type="file" accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2" multiple>
                </div>
              </div>
              <div class="crack-ui-font-action-row">
                <span id="${ID.fontResolveStatus}" class="crack-ui-font-status">${crackUiFontEscapeHtml(getCrackUiFontResolveStatusText())}</span>
                <button id="${ID.fontSaveButton}" type="button" class="crack-ui-font-action-button">웹폰트 저장</button>
              </div>
              <div id="${ID.fontSavedList}" class="crack-ui-font-saved-list">${renderCrackUiSavedFontList()}</div>
            </div>
          </div>

          <button id="${ID.fontResetButton}" type="button" class="crack-ui-font-reset-button">폰트 설정 초기화</button>
        </div>
      </div>`;
  }

  function renderCrackUiBackgroundSectionHtml() {
    const value = normalizeCrackUiFontHex(chatBackgroundSettings.color, CHAT_BACKGROUND_SETTINGS_DEFAULT.color);
    const colorEnabled = chatBackgroundSettings.enabled === true && chatBackgroundSettings.imageEnabled !== true;
    const imageEnabled = chatBackgroundSettings.enabled === true && chatBackgroundSettings.imageEnabled === true;
    const novelAvailable = normalizeEpisodeUiMode(episodeUiMode) === 'novel';
    const novelEnabled = novelAvailable && chatBackgroundSettings.novelBackdropEnabled === true;
    const novelValue = normalizeCrackUiFontHex(
      chatBackgroundSettings.novelBackdropColor,
      CHAT_BACKGROUND_SETTINGS_DEFAULT.novelBackdropColor
    );
    const novelOpacity = Math.max(5, Math.min(100, Math.round(Number(chatBackgroundSettings.novelBackdropOpacity) || 34)));
    const backgroundImageMeta = getCrackUiChatBackgroundImageMetaText();
    return `
      <div class="crack-ui-section" data-crack-ui-section="background">
        <div class="crack-ui-section-body crack-ui-background-section-body" data-crack-ui-section-body="background">
          <div class="crack-ui-font-highlight-grid crack-ui-background-feature-grid">
            <div class="crack-ui-font-card crack-ui-font-highlight-card crack-ui-background-feature-card crack-ui-background-color-card" data-feature-enabled="1">
              <div class="crack-ui-row crack-ui-font-toggle-row crack-ui-background-title-row">
                <span class="crack-ui-row-text">
                  <span class="crack-ui-row-name">배경 설정</span>
                  <span class="crack-ui-row-desc">배경색과 배경 이미지 중 하나만 활성화할 수 있습니다</span>
                </span>
              </div>

              <div class="crack-ui-font-color-grid crack-ui-background-mode-grid">
                <div class="crack-ui-font-color-row crack-ui-background-mode-block" data-crack-ui-background-mode="color" data-feature-enabled="${colorEnabled ? '1' : '0'}">
                  <label class="crack-ui-background-mode-head">
                    <span class="crack-ui-font-control-label">배경색</span>
                    <span>
                      <input id="${ID.toggleChatBackground}" class="crack-ui-toggle" type="checkbox">
                      <span class="crack-ui-switch" aria-hidden="true"></span>
                    </span>
                  </label>
                  <div class="crack-ui-background-mode-control">
                    <span class="crack-ui-font-color-inputs crack-ui-background-color-inputs">
                      <button
                        type="button"
                        class="crack-ui-font-color-swatch"
                        data-crack-ui-font-color-picker="${CHAT_BACKGROUND_COLOR_PICKER_KEY}"
                        aria-label="배경색 색상 선택"
                        aria-haspopup="dialog"
                        aria-expanded="false"
                        style="--crack-ui-font-swatch:${crackUiFontEscapeHtml(value)}"
                      ></button>
                      <input
                        type="text"
                        value="${crackUiFontEscapeHtml(value)}"
                        spellcheck="false"
                        maxlength="7"
                        data-crack-ui-chat-background-color-code="1"
                        aria-label="배경색 코드"
                      >
                    </span>
                  </div>
                </div>

                <div class="crack-ui-font-color-row crack-ui-background-mode-block" data-crack-ui-background-mode="image" data-feature-enabled="${imageEnabled ? '1' : '0'}">
                  <label class="crack-ui-background-mode-head">
                    <span class="crack-ui-font-control-label">배경 이미지</span>
                    <span>
                      <input id="${ID.toggleChatBackgroundImage}" class="crack-ui-toggle" type="checkbox">
                      <span class="crack-ui-switch" aria-hidden="true"></span>
                    </span>
                  </label>
                  <div class="crack-ui-background-mode-control">
                    <div class="crack-ui-background-image-inline">
                      <div
                        class="crack-ui-background-image-meta"
                        data-crack-ui-chat-background-image-meta="1"
                        title="${crackUiFontEscapeHtml(backgroundImageMeta)}"
                      >${crackUiFontEscapeHtml(backgroundImageMeta)}</div>
                      <span class="crack-ui-background-image-actions">
                        <button id="${ID.chatBackgroundImageButton}" type="button" class="crack-ui-font-action-button">이미지 선택</button>
                        <button id="${ID.chatBackgroundImageRemove}" type="button" class="crack-ui-font-action-button crack-ui-background-image-remove">삭제</button>
                        <input id="${ID.chatBackgroundImageInput}" class="crack-ui-background-image-input" type="file" accept="image/*">
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="crack-ui-font-card crack-ui-font-highlight-card crack-ui-background-feature-card crack-ui-novel-backdrop-controls"
              data-feature-enabled="${novelEnabled ? '1' : '0'}"
              data-crack-ui-novel-layout-enabled="${novelAvailable ? '1' : '0'}"
            >
              <label class="crack-ui-row crack-ui-font-toggle-row" data-disabled="${novelAvailable ? '0' : '1'}">
                <span class="crack-ui-row-text">
                  <span class="crack-ui-row-name">소설형 본문 배경</span>
                </span>
                <span>
                  <input id="${ID.toggleNovelBackdrop}" class="crack-ui-toggle" type="checkbox" ${novelAvailable ? '' : 'disabled'}>
                  <span class="crack-ui-switch" aria-hidden="true"></span>
                </span>
              </label>
              <div class="crack-ui-font-color-grid">
                <div class="crack-ui-font-color-row">
                  <span class="crack-ui-font-control-label">본문 배경색</span>
                  <span class="crack-ui-font-color-inputs crack-ui-background-color-inputs">
                    <button
                      type="button"
                      class="crack-ui-font-color-swatch"
                      data-crack-ui-font-color-picker="${NOVEL_BACKDROP_COLOR_PICKER_KEY}"
                      aria-label="소설형 본문 배경색 색상 선택"
                      aria-haspopup="dialog"
                      aria-expanded="false"
                      style="--crack-ui-font-swatch:${crackUiFontEscapeHtml(novelValue)}"
                    ></button>
                    <input
                      type="text"
                      value="${crackUiFontEscapeHtml(novelValue)}"
                      spellcheck="false"
                      maxlength="7"
                      data-crack-ui-novel-backdrop-color-code="1"
                      aria-label="소설형 본문 배경색 코드"
                    >
                  </span>
                </div>
                <div class="crack-ui-font-color-row crack-ui-background-opacity-control" data-crack-ui-range-preview-row="1">
                  <div class="crack-ui-background-opacity-head">
                    <span class="crack-ui-font-control-label">투명도</span>
                    <span class="crack-ui-font-range-actions">
                      <span class="crack-ui-range-value" data-crack-ui-novel-backdrop-opacity-value="1">${novelOpacity}%</span>
                    </span>
                  </div>
                  <input
                    class="crack-ui-range"
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value="${novelOpacity}"
                    data-crack-ui-novel-backdrop-opacity="1"
                    aria-label="소설형 본문 배경 투명도"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function syncCrackUiChatBackgroundUi(panel = document.getElementById(ID.panel)) {
    if (!panel) return;
    const enabled = chatBackgroundSettings.enabled === true;
    const colorEnabled = enabled && chatBackgroundSettings.imageEnabled !== true;
    const imageEnabled = enabled && chatBackgroundSettings.imageEnabled === true;
    const hasImage = !!normalizeCrackUiChatBackgroundImageFileKey(chatBackgroundSettings.imageFileKey);
    const value = normalizeCrackUiFontHex(chatBackgroundSettings.color, CHAT_BACKGROUND_SETTINGS_DEFAULT.color);
    const novelAvailable = normalizeEpisodeUiMode(episodeUiMode) === 'novel';
    const novelConfigured = chatBackgroundSettings.novelBackdropEnabled === true;
    const novelEnabled = novelAvailable && novelConfigured;
    const novelValue = normalizeCrackUiFontHex(
      chatBackgroundSettings.novelBackdropColor,
      CHAT_BACKGROUND_SETTINGS_DEFAULT.novelBackdropColor
    );
    const novelOpacity = Math.max(5, Math.min(100, Math.round(Number(chatBackgroundSettings.novelBackdropOpacity) || 34)));

    const colorToggle = panel.querySelector(`#${ID.toggleChatBackground}`);
    if (colorToggle) colorToggle.checked = colorEnabled;
    const imageToggle = panel.querySelector(`#${ID.toggleChatBackgroundImage}`);
    if (imageToggle) imageToggle.checked = imageEnabled;

    const colorBlock = panel.querySelector('[data-crack-ui-background-mode="color"]');
    if (colorBlock) colorBlock.dataset.featureEnabled = colorEnabled ? '1' : '0';
    const imageBlock = panel.querySelector('[data-crack-ui-background-mode="image"]');
    if (imageBlock) imageBlock.dataset.featureEnabled = imageEnabled ? '1' : '0';

    const trigger = panel.querySelector(`[data-crack-ui-font-color-picker="${CHAT_BACKGROUND_COLOR_PICKER_KEY}"]`);
    if (trigger) {
      trigger.style.setProperty('--crack-ui-font-swatch', value);
      trigger.disabled = !colorEnabled;
      if (trigger.disabled && fontColorPickerOpen && fontColorPickerTrigger === trigger) {
        closeCrackUiFontColorPicker({ commit: false, sync: false });
      }
    }
    const input = panel.querySelector('[data-crack-ui-chat-background-color-code]');
    if (input) {
      if (document.activeElement !== input) input.value = value;
      input.disabled = !colorEnabled;
    }
    const imageButton = panel.querySelector(`#${ID.chatBackgroundImageButton}`);
    if (imageButton) imageButton.disabled = false;
    const imageRemove = panel.querySelector(`#${ID.chatBackgroundImageRemove}`);
    if (imageRemove) imageRemove.disabled = !hasImage;
    const imageMeta = panel.querySelector('[data-crack-ui-chat-background-image-meta]');
    if (imageMeta) imageMeta.textContent = getCrackUiChatBackgroundImageMetaText();

    const novelToggle = panel.querySelector(`#${ID.toggleNovelBackdrop}`);
    if (novelToggle) {
      novelToggle.checked = novelEnabled;
      novelToggle.disabled = !novelAvailable;
    }
    const novelControls = panel.querySelector('.crack-ui-novel-backdrop-controls');
    if (novelControls) {
      novelControls.dataset.featureEnabled = novelEnabled ? '1' : '0';
      novelControls.dataset.crackUiNovelLayoutEnabled = novelAvailable ? '1' : '0';
      const novelToggleRow = novelControls.querySelector('.crack-ui-font-toggle-row');
      if (novelToggleRow) novelToggleRow.dataset.disabled = novelAvailable ? '0' : '1';
    }
    const novelTrigger = panel.querySelector(`[data-crack-ui-font-color-picker="${NOVEL_BACKDROP_COLOR_PICKER_KEY}"]`);
    if (novelTrigger) {
      novelTrigger.style.setProperty('--crack-ui-font-swatch', novelValue);
      novelTrigger.disabled = !novelEnabled;
      if (novelTrigger.disabled && fontColorPickerOpen && fontColorPickerTrigger === novelTrigger) {
        closeCrackUiFontColorPicker({ commit: false, sync: false });
      }
    }
    const novelInput = panel.querySelector('[data-crack-ui-novel-backdrop-color-code]');
    if (novelInput) {
      if (document.activeElement !== novelInput) novelInput.value = novelValue;
      novelInput.disabled = !novelEnabled;
    }
    const novelOpacityInput = panel.querySelector('[data-crack-ui-novel-backdrop-opacity]');
    if (novelOpacityInput) {
      if (document.activeElement !== novelOpacityInput) novelOpacityInput.value = String(novelOpacity);
      novelOpacityInput.disabled = !novelEnabled;
    }
    const novelOpacityValue = panel.querySelector('[data-crack-ui-novel-backdrop-opacity-value]');
    if (novelOpacityValue) novelOpacityValue.textContent = `${novelOpacity}%`;
  }

  function updateCrackUiChatBackgroundColor(value, options = {}) {
    const normalized = normalizeCrackUiFontHex(value, chatBackgroundSettings.color || CHAT_BACKGROUND_SETTINGS_DEFAULT.color);
    chatBackgroundSettings.color = normalized;
    applyCrackUiChatBackground();
    if (options.persist !== false) persistCrackUiChatBackgroundSettings();
    if (options.sync !== false) syncCrackUiChatBackgroundUi(document.getElementById(ID.panel));
  }

  function updateCrackUiNovelBackdropColor(value, options = {}) {
    const normalized = normalizeCrackUiFontHex(
      value,
      chatBackgroundSettings.novelBackdropColor || CHAT_BACKGROUND_SETTINGS_DEFAULT.novelBackdropColor
    );
    chatBackgroundSettings.novelBackdropColor = normalized;
    applyCrackUiChatBackground();
    if (options.persist !== false) persistCrackUiChatBackgroundSettings();
    if (options.sync !== false) syncCrackUiChatBackgroundUi(document.getElementById(ID.panel));
  }

  function updateCrackUiNovelBackdropOpacity(value, options = {}) {
    const normalized = Math.max(5, Math.min(100, Math.round(Number(value) || CHAT_BACKGROUND_SETTINGS_DEFAULT.novelBackdropOpacity)));
    chatBackgroundSettings.novelBackdropOpacity = normalized;
    applyCrackUiChatBackground();
    if (options.persist !== false) persistCrackUiChatBackgroundSettings();
    if (options.sync !== false) syncCrackUiChatBackgroundUi(document.getElementById(ID.panel));
  }

  function resetCrackUiPanelOuterScroll(panel = document.getElementById(ID.panel)) {
    if (!panel || !panelOpen || panel.dataset.open !== '1') return;
    if (panel.scrollTop !== 0) panel.scrollTop = 0;
    if (panel.scrollLeft !== 0) panel.scrollLeft = 0;
  }

  function getCrackUiFontScrollSnapshot(panel = document.getElementById(ID.panel)) {
    if (!panel || !panelOpen || panel.dataset.open !== '1') return null;
    const scroller = panel.querySelector?.('.crack-ui-panel-body');
    return scroller ? {
      panel,
      scroller,
      top: scroller.scrollTop,
      left: scroller.scrollLeft,
      lifecycleToken: crackUiPanelLifecycleToken,
    } : null;
  }

  function cancelCrackUiFontScrollRestore() {
    if (crackUiFontScrollRestoreRaf) {
      cancelAnimationFrame(crackUiFontScrollRestoreRaf);
      crackUiFontScrollRestoreRaf = 0;
    }
    crackUiFontScrollRestoreTimers.forEach((timer) => clearTimeout(timer));
    crackUiFontScrollRestoreTimers = [];
  }

  function restoreCrackUiFontScrollSnapshot(snapshot) {
    cancelCrackUiFontScrollRestore();
    if (
      !panelOpen ||
      !snapshot?.panel?.isConnected ||
      !snapshot?.scroller?.isConnected ||
      snapshot.panel.dataset.open !== '1' ||
      snapshot.lifecycleToken !== crackUiPanelLifecycleToken
    ) return;

    const restore = () => {
      if (
        !panelOpen ||
        !snapshot.panel.isConnected ||
        !snapshot.scroller.isConnected ||
        snapshot.panel.dataset.open !== '1' ||
        snapshot.lifecycleToken !== crackUiPanelLifecycleToken
      ) return;
      // Never override an active range drag. The pointer owns the current position until release.
      if (activePanelRangePreviewInput) return;
      resetCrackUiPanelOuterScroll(snapshot.panel);
      snapshot.scroller.scrollTop = snapshot.top;
      snapshot.scroller.scrollLeft = snapshot.left;
    };

    restore();
    crackUiFontScrollRestoreRaf = requestAnimationFrame(() => {
      crackUiFontScrollRestoreRaf = 0;
      restore();
    });
    crackUiFontScrollRestoreTimers = [setTimeout(() => {
      crackUiFontScrollRestoreTimers = [];
      restore();
    }, 190)];
  }

  function syncCrackUiFontRangeControl(panel, key) {
    if (!panel || !Object.prototype.hasOwnProperty.call(FONT_SETTING_RANGE, key)) return;

    const effectiveValue = getCrackUiFontEffectiveSettingValue(key);
    const input = panel.querySelector(`[data-crack-ui-font-range="${key}"]`);
    // The browser is already moving the active thumb. Reassigning input.value during the
    // input event can snap it backwards, so only write the value when this is not that thumb.
    if (input && input !== activePanelRangePreviewInput) {
      const inputConfig = getCrackUiFontRangeInputConfig(key, effectiveValue);
      input.min = String(inputConfig.min);
      input.max = String(inputConfig.max);
      input.step = String(inputConfig.step);
      input.value = String(inputConfig.value);
    }

    const output = panel.querySelector(`[data-crack-ui-font-range-value="${key}"]`);
    if (output) output.textContent = formatCrackUiFontSettingValue(key, effectiveValue);

    const reset = panel.querySelector(`[data-crack-ui-font-range-reset="${key}"]`);
    if (reset) reset.disabled = fontSettings.masterEnabled !== true || !isCrackUiFontSettingCustom(key);

    const resetAll = panel.querySelector('[data-crack-ui-font-range-reset-all]');
    if (resetAll) {
      resetAll.disabled = fontSettings.masterEnabled !== true ||
        !Object.keys(FONT_SETTING_RANGE).some((rangeKey) => isCrackUiFontSettingCustom(rangeKey));
    }
  }

  function syncCrackUiDialogueQuoteEditor(panel = document.getElementById(ID.panel)) {
    const editor = panel?.querySelector?.('[data-crack-ui-dialogue-quote-editor]');
    const available = fontSettings.masterEnabled === true && fontSettings.dialogueBgEnabled === true;
    const tools = panel?.querySelector?.('[data-crack-ui-dialogue-quote-tools]');
    const toggle = tools?.querySelector?.('[data-crack-ui-dialogue-quote-toggle]');
    const count = tools?.querySelector?.('[data-crack-ui-dialogue-quote-count]');
    if (count) count.textContent = String(normalizeCrackUiDialogueQuotePairs(fontSettings.dialogueQuotePairs).length);
    if (toggle) toggle.disabled = !available;
    if (!available && fontDialogueQuoteMenuOpen) setCrackUiDialogueQuoteMenuOpen(false, panel);
    if (!editor) return;

    editor.dataset.available = available ? '1' : '0';
    editor.querySelectorAll('[data-crack-ui-dialogue-quote-open], [data-crack-ui-dialogue-quote-close], [data-crack-ui-dialogue-quote-remove]')
      .forEach((control) => { control.disabled = !available; });

    const openInput = editor.querySelector('[data-crack-ui-dialogue-quote-open]');
    const closeInput = editor.querySelector('[data-crack-ui-dialogue-quote-close]');
    const addButton = editor.querySelector('[data-crack-ui-dialogue-quote-add]');
    if (!addButton) return;

    const open = normalizeCrackUiDialogueQuoteCharacter(openInput?.value);
    const close = normalizeCrackUiDialogueQuoteCharacter(closeInput?.value);
    const pairs = normalizeCrackUiDialogueQuotePairs(fontSettings.dialogueQuotePairs);
    const duplicate = !!(open && close && pairs.some(([savedOpen, savedClose]) => savedOpen === open && savedClose === close));
    addButton.disabled = !available || !open || !close || duplicate || pairs.length >= FONT_DIALOGUE_QUOTE_PAIR_LIMIT;
    addButton.title = duplicate ? '이미 등록된 문자 쌍입니다' : '';
  }

  function refreshCrackUiDialogueQuoteEditor(panel = document.getElementById(ID.panel)) {
    const editor = panel?.querySelector?.('[data-crack-ui-dialogue-quote-editor]');
    if (!editor) return;
    editor.outerHTML = renderCrackUiDialogueQuoteEditor();
    syncCrackUiDialogueQuoteEditor(panel);
  }

  function updateCrackUiDialogueQuotePairs(nextPairs, panel = document.getElementById(ID.panel)) {
    const normalized = normalizeCrackUiDialogueQuotePairs(nextPairs);
    if (JSON.stringify(normalized) === JSON.stringify(fontSettings.dialogueQuotePairs)) return false;

    const snapshot = getCrackUiFontScrollSnapshot(panel);
    restoreCrackUiFontQuoteDecorations();
    restoreCrackUiFontBaseDecorations();
    fontSettings.dialogueQuotePairs = normalized;
    fontDialogueQuoteMatcherCache = null;
    applyCrackUiFontFeatureState({ immediateQuotes: true });
    persistCrackUiFontSettings();
    refreshCrackUiDialogueQuoteEditor(panel);
    syncCrackUiFontSettingsUi(panel);
    restoreCrackUiFontScrollSnapshot(snapshot);
    return true;
  }

  function setCrackUiDialogueQuoteMenuOpen(nextOpen, panel = document.getElementById(ID.panel)) {
    const available = fontSettings.masterEnabled === true && fontSettings.dialogueBgEnabled === true;
    fontDialogueQuoteMenuOpen = nextOpen === true && activePanelSection === 'font' && available;
    if (!panel) return;
    const tools = panel.querySelector('[data-crack-ui-dialogue-quote-tools]');
    if (tools) tools.dataset.open = fontDialogueQuoteMenuOpen ? '1' : '0';
    const popover = tools?.querySelector?.('[data-crack-ui-dialogue-quote-popover]');
    if (popover) popover.hidden = !fontDialogueQuoteMenuOpen;
    const toggle = tools?.querySelector?.('[data-crack-ui-dialogue-quote-toggle]');
    if (toggle) {
      toggle.setAttribute('aria-expanded', fontDialogueQuoteMenuOpen ? 'true' : 'false');
      toggle.title = fontDialogueQuoteMenuOpen ? '대사 감지 문자 닫기' : '대사 감지 문자 편집';
    }
  }

  function renderCrackUiFontRecentColorButtons() {
    if (!fontRecentColors.length) return '<span class="crack-ui-font-color-recent-empty">아직 사용한 색상이 없습니다</span>';
    return fontRecentColors.map((color) => `
      <button
        type="button"
        class="crack-ui-font-color-recent"
        data-crack-ui-font-recent-color="${color}"
        aria-label="최근 색상 ${color}"
        title="${color}"
        style="--crack-ui-font-recent-color:${color}"
      ></button>`).join('');
  }

  function applyCrackUiFontColorRuntimeValue(key, value) {
    const normalized = normalizeCrackUiFontHex(value, '#000000');
    const root = document.documentElement;
    if (key === 'baseBg') root.style.setProperty('--crack-ui-font-base-rgb', crackUiFontHexToRgb(normalized));
    else if (key === 'baseTextColor') root.style.setProperty('--crack-ui-font-base-text', normalized);
    else if (key === 'dialogueBg') root.style.setProperty('--crack-ui-font-dialogue-rgb', crackUiFontHexToRgb(normalized));
    else if (key === 'dialogueTextColor') root.style.setProperty('--crack-ui-font-dialogue-text', normalized);
    else if (key === 'thoughtBg') root.style.setProperty('--crack-ui-font-thought-rgb', crackUiFontHexToRgb(normalized));
    else if (key === 'thoughtTextColor') root.style.setProperty('--crack-ui-font-thought-text', normalized);
    else if (key === 'italicBg') root.style.setProperty('--crack-ui-font-italic-rgb', crackUiFontHexToRgb(normalized));
    else if (key === 'italicTextColor') root.style.setProperty('--crack-ui-font-italic-text', normalized);
    else if (key === 'strongBg') root.style.setProperty('--crack-ui-font-strong-rgb', crackUiFontHexToRgb(normalized));
    else if (key === 'strongBgTextColor') root.style.setProperty('--crack-ui-font-strong-highlight-text', normalized);
    else if (key === 'codeAccent') root.style.setProperty('--crack-ui-font-code-rgb', crackUiFontHexToRgb(normalized));
    else if (key === 'codeTextColor') {
      root.style.setProperty('--crack-ui-font-code-text', normalized);
      setCrackUiFontDataAttribute('data-crack-ui-font-code-text-color', fontSettings.codeBlockBgEnabled && fontSettings.codeTextColorCustom);
    }
  }

  function applyCrackUiFontColorPreview(key, value, panel = document.getElementById(ID.panel)) {
    if (!isCrackUiColorPickerKey(key)) return;
    if (isCrackUiBackgroundColorPickerKey(key)) {
      const isNovelBackdrop = key === NOVEL_BACKDROP_COLOR_PICKER_KEY;
      const current = isNovelBackdrop ? chatBackgroundSettings.novelBackdropColor : chatBackgroundSettings.color;
      const fallback = isNovelBackdrop
        ? CHAT_BACKGROUND_SETTINGS_DEFAULT.novelBackdropColor
        : CHAT_BACKGROUND_SETTINGS_DEFAULT.color;
      const normalized = normalizeCrackUiFontHex(value, current || fallback);
      if (isNovelBackdrop) chatBackgroundSettings.novelBackdropColor = normalized;
      else chatBackgroundSettings.color = normalized;
      applyCrackUiChatBackground();
      const trigger = panel?.querySelector?.(`[data-crack-ui-font-color-picker="${key}"]`);
      if (trigger) trigger.style.setProperty('--crack-ui-font-swatch', normalized);
      const code = panel?.querySelector?.(isNovelBackdrop
        ? '[data-crack-ui-novel-backdrop-color-code]'
        : '[data-crack-ui-chat-background-color-code]');
      if (code && document.activeElement !== code) code.value = normalized;
      return;
    }

    const normalized = normalizeCrackUiFontHex(value, fontSettings[key] || '#000000');
    fontSettings[key] = normalized;
    const customFlag = FONT_NATIVE_OVERRIDE_FLAG[key];
    if (customFlag) fontSettings[customFlag] = true;
    applyCrackUiFontColorRuntimeValue(key, normalized);

    const trigger = panel?.querySelector?.(`[data-crack-ui-font-color-picker="${key}"]`);
    if (trigger) trigger.style.setProperty('--crack-ui-font-swatch', normalized);
    const code = panel?.querySelector?.(`[data-crack-ui-font-color-code="${key}"]`);
    if (code && document.activeElement !== code) code.value = normalized;
  }

  function flushCrackUiFontColorPreview() {
    if (fontColorPickerApplyRaf) {
      cancelAnimationFrame(fontColorPickerApplyRaf);
      fontColorPickerApplyRaf = 0;
    }
    const value = normalizeCrackUiFontHex(fontColorPickerPendingHex, null);
    fontColorPickerPendingHex = '';
    if (value && fontColorPickerKey) applyCrackUiFontColorPreview(fontColorPickerKey, value);
  }

  function scheduleCrackUiFontColorPreview(value) {
    fontColorPickerPendingHex = normalizeCrackUiFontHex(value, fontColorPickerPendingHex || '#000000');
    if (fontColorPickerApplyRaf) return;
    fontColorPickerApplyRaf = requestAnimationFrame(() => {
      fontColorPickerApplyRaf = 0;
      const next = fontColorPickerPendingHex;
      fontColorPickerPendingHex = '';
      if (next && fontColorPickerKey) applyCrackUiFontColorPreview(fontColorPickerKey, next);
    });
  }

  function getCrackUiFontColorPickerValue() {
    return crackUiFontHsvToHex(fontColorPickerHue, fontColorPickerSaturation, fontColorPickerValue);
  }

  function syncCrackUiFontColorPickerRecentUi(popover = document.getElementById(ID.fontColorPickerPopover)) {
    const recent = popover?.querySelector?.(`#${ID.fontColorPickerRecent}`);
    if (recent) recent.innerHTML = renderCrackUiFontRecentColorButtons();
  }

  function syncCrackUiFontColorPickerUi(options = {}) {
    const popover = document.getElementById(ID.fontColorPickerPopover);
    if (!popover || !fontColorPickerOpen) return;
    const value = getCrackUiFontColorPickerValue();
    popover.style.setProperty('--crack-ui-font-picker-hue', String(Math.round(fontColorPickerHue)));
    const area = popover.querySelector(`#${ID.fontColorPickerSv}`);
    if (area) area.style.setProperty('--crack-ui-font-picker-hue', String(Math.round(fontColorPickerHue)));
    const cursor = popover.querySelector(`#${ID.fontColorPickerCursor}`);
    if (cursor) {
      cursor.style.left = `${fontColorPickerSaturation * 100}%`;
      cursor.style.top = `${(1 - fontColorPickerValue) * 100}%`;
      cursor.style.background = value;
    }
    const hue = popover.querySelector(`#${ID.fontColorPickerHue}`);
    if (hue && document.activeElement !== hue) hue.value = String(Math.round(fontColorPickerHue));
    if (hue) hue.style.setProperty('--crack-ui-font-picker-hue', String(Math.round(fontColorPickerHue)));
    const previous = popover.querySelector(`#${ID.fontColorPickerPrevious}`);
    if (previous) previous.style.setProperty('--crack-ui-font-picker-swatch', fontColorPickerPrevious);
    const current = popover.querySelector(`#${ID.fontColorPickerCurrent}`);
    if (current) current.style.setProperty('--crack-ui-font-picker-swatch', value);
    const hex = popover.querySelector(`#${ID.fontColorPickerHex}`);
    if (hex && (options.forceHex === true || document.activeElement !== hex)) hex.value = value;
    if (options.preview !== false) scheduleCrackUiFontColorPreview(value);
  }

  function syncCrackUiFontColorPickerFromValue(value) {
    if (!fontColorPickerOpen) return;
    const normalized = normalizeCrackUiFontHex(value, null);
    if (!normalized) return;
    const hsv = crackUiFontHexToHsv(normalized);
    fontColorPickerHue = hsv.h;
    fontColorPickerSaturation = hsv.s;
    fontColorPickerValue = hsv.v;
    syncCrackUiFontColorPickerUi({ preview: false, forceHex: true });
  }

  function positionCrackUiFontColorPicker() {
    const popover = document.getElementById(ID.fontColorPickerPopover);
    const trigger = fontColorPickerTrigger;
    if (!fontColorPickerOpen || !popover || !trigger?.isConnected || popover.hidden) return;
    const triggerRect = trigger.getBoundingClientRect();
    const width = popover.offsetWidth || 292;
    const height = popover.offsetHeight || 300;
    const margin = 8;
    let left = triggerRect.left;
    let top = triggerRect.bottom + margin;
    if (left + width > window.innerWidth - margin) left = window.innerWidth - width - margin;
    if (left < margin) left = margin;
    if (top + height > window.innerHeight - margin) top = triggerRect.top - height - margin;
    if (top < margin) top = Math.max(margin, window.innerHeight - height - margin);
    popover.style.left = `${Math.round(left)}px`;
    popover.style.top = `${Math.round(top)}px`;
  }

  function openCrackUiFontColorPicker(trigger, panel = document.getElementById(ID.panel)) {
    const key = trigger?.dataset?.crackUiFontColorPicker || '';
    if (!isCrackUiColorPickerKey(key) || trigger.disabled) return;
    closeCrackUiFontColorPicker({ commit: true });
    setCrackUiFontPresetMenuOpen(false, panel);
    setCrackUiDialogueQuoteMenuOpen(false, panel);

    const value = key === CHAT_BACKGROUND_COLOR_PICKER_KEY
      ? normalizeCrackUiFontHex(chatBackgroundSettings.color, CHAT_BACKGROUND_SETTINGS_DEFAULT.color)
      : (key === NOVEL_BACKDROP_COLOR_PICKER_KEY
        ? normalizeCrackUiFontHex(chatBackgroundSettings.novelBackdropColor, CHAT_BACKGROUND_SETTINGS_DEFAULT.novelBackdropColor)
        : normalizeCrackUiFontHex(getCrackUiFontEffectiveSettingValue(key), fontSettings[key] || '#000000'));
    const hsv = crackUiFontHexToHsv(value);
    fontColorPickerOpen = true;
    fontColorPickerKey = key;
    fontColorPickerTrigger = trigger;
    fontColorPickerPrevious = value;
    const customFlag = FONT_NATIVE_OVERRIDE_FLAG[key] || '';
    fontColorPickerSnapshot = isCrackUiBackgroundColorPickerKey(key)
      ? {
        key,
        storedValue: key === NOVEL_BACKDROP_COLOR_PICKER_KEY
          ? chatBackgroundSettings.novelBackdropColor
          : chatBackgroundSettings.color,
        background: true,
      }
      : {
        key,
        storedValue: fontSettings[key],
        customFlag,
        customEnabled: customFlag ? fontSettings[customFlag] === true : null,
      };
    fontColorPickerHue = hsv.h;
    fontColorPickerSaturation = hsv.s;
    fontColorPickerValue = hsv.v;
    fontColorPickerPendingHex = '';

    const popover = document.getElementById(ID.fontColorPickerPopover);
    if (!popover) return;
    const title = popover.querySelector(`#${ID.fontColorPickerTitle}`);
    if (title) title.textContent = String(trigger.getAttribute('aria-label') || '색상 선택').replace(/\s*색상 선택$/, '');
    popover.hidden = false;
    popover.dataset.open = '1';
    trigger.setAttribute('aria-expanded', 'true');
    syncCrackUiFontColorPickerRecentUi(popover);
    syncCrackUiFontColorPickerUi({ preview: false, forceHex: true });
    requestAnimationFrame(positionCrackUiFontColorPicker);
  }

  function closeCrackUiFontColorPicker(options = {}) {
    const wasOpen = fontColorPickerOpen;
    const key = fontColorPickerKey;
    const trigger = fontColorPickerTrigger;
    const snapshot = fontColorPickerSnapshot;
    if (wasOpen) flushCrackUiFontColorPreview();

    if (wasOpen && options.commit === false && snapshot?.key === key && isCrackUiColorPickerKey(key)) {
      if (snapshot.background === true) {
        if (key === NOVEL_BACKDROP_COLOR_PICKER_KEY) {
          chatBackgroundSettings.novelBackdropColor = normalizeCrackUiFontHex(
            snapshot.storedValue,
            CHAT_BACKGROUND_SETTINGS_DEFAULT.novelBackdropColor
          );
        } else {
          chatBackgroundSettings.color = normalizeCrackUiFontHex(snapshot.storedValue, CHAT_BACKGROUND_SETTINGS_DEFAULT.color);
        }
        applyCrackUiChatBackground();
        persistCrackUiChatBackgroundSettings();
      } else {
        fontSettings[key] = snapshot.storedValue;
        if (snapshot.customFlag) fontSettings[snapshot.customFlag] = snapshot.customEnabled === true;
        applyCrackUiFontColorRuntimeValue(key, getCrackUiFontEffectiveSettingValue(key));
        // A cancelled picker must also repair storage in case another font action persisted
        // while the live preview was visible.
        persistCrackUiFontSettings();
      }
    } else {
      const finalValue = key === CHAT_BACKGROUND_COLOR_PICKER_KEY
        ? normalizeCrackUiFontHex(chatBackgroundSettings.color, null)
        : (key === NOVEL_BACKDROP_COLOR_PICKER_KEY
          ? normalizeCrackUiFontHex(chatBackgroundSettings.novelBackdropColor, null)
          : (key && FONT_COLOR_KEYS.includes(key)
            ? normalizeCrackUiFontHex(fontSettings[key], null)
            : null));
      if (wasOpen && finalValue) {
        rememberCrackUiFontRecentColor(finalValue);
        if (isCrackUiBackgroundColorPickerKey(key)) persistCrackUiChatBackgroundSettings();
        else persistCrackUiFontSettings();
        syncCrackUiFontColorPickerRecentUi();
      }
    }

    if (trigger?.isConnected) trigger.setAttribute('aria-expanded', 'false');
    const popover = document.getElementById(ID.fontColorPickerPopover);
    if (popover) {
      popover.hidden = true;
      popover.dataset.open = '0';
    }
    fontColorPickerOpen = false;
    fontColorPickerKey = '';
    fontColorPickerTrigger = null;
    fontColorPickerSnapshot = null;
    fontColorPickerPendingHex = '';
    if (wasOpen && options.sync !== false) {
      if (isCrackUiBackgroundColorPickerKey(key)) syncCrackUiChatBackgroundUi(document.getElementById(ID.panel));
      else syncCrackUiFontSettingsUi(document.getElementById(ID.panel));
    }
  }

  function updateCrackUiFontColorPickerFromAreaPointer(event, area) {
    const rect = area.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    fontColorPickerSaturation = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    fontColorPickerValue = 1 - Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    syncCrackUiFontColorPickerUi();
  }

  function bindCrackUiFontColorPicker(panel, panelRoot) {
    if (!panel || !panelRoot || panelRoot.dataset.crackUiFontColorPickerBound === '1') return;
    const popover = document.getElementById(ID.fontColorPickerPopover);
    if (!popover) return;
    panelRoot.dataset.crackUiFontColorPickerBound = '1';

    popover.addEventListener('click', (event) => event.stopPropagation());
    popover.addEventListener('pointerdown', (event) => event.stopPropagation());

    const area = popover.querySelector(`#${ID.fontColorPickerSv}`);
    if (area) {
      const begin = (event) => {
        if (event.button !== undefined && event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        try { area.setPointerCapture(event.pointerId); } catch {
        }
        area.dataset.dragging = '1';
        updateCrackUiFontColorPickerFromAreaPointer(event, area);
      };
      const move = (event) => {
        if (area.dataset.dragging !== '1') return;
        event.preventDefault();
        updateCrackUiFontColorPickerFromAreaPointer(event, area);
      };
      const end = (event) => {
        if (area.dataset.dragging !== '1') return;
        delete area.dataset.dragging;
        try { area.releasePointerCapture(event.pointerId); } catch {
        }
        flushCrackUiFontColorPreview();
      };
      area.addEventListener('pointerdown', begin);
      area.addEventListener('pointermove', move);
      area.addEventListener('pointerup', end);
      area.addEventListener('pointercancel', end);
    }

    const hue = popover.querySelector(`#${ID.fontColorPickerHue}`);
    hue?.addEventListener('input', () => {
      fontColorPickerHue = Number(hue.value) || 0;
      syncCrackUiFontColorPickerUi();
    });
    hue?.addEventListener('change', flushCrackUiFontColorPreview);

    const hex = popover.querySelector(`#${ID.fontColorPickerHex}`);
    const applyHex = () => {
      const normalized = normalizeCrackUiFontHex(hex?.value, null);
      if (!normalized) return false;
      const hsv = crackUiFontHexToHsv(normalized);
      fontColorPickerHue = hsv.h;
      fontColorPickerSaturation = hsv.s;
      fontColorPickerValue = hsv.v;
      syncCrackUiFontColorPickerUi({ forceHex: true });
      flushCrackUiFontColorPreview();
      return true;
    };
    hex?.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(hex.value.trim())) applyHex();
    });
    hex?.addEventListener('change', applyHex);
    hex?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        applyHex();
      }
    });

    popover.querySelector(`#${ID.fontColorPickerPrevious}`)?.addEventListener('click', () => {
      syncCrackUiFontColorPickerFromValue(fontColorPickerPrevious);
      scheduleCrackUiFontColorPreview(fontColorPickerPrevious);
      flushCrackUiFontColorPreview();
    });

    popover.querySelector(`#${ID.fontColorPickerDone}`)?.addEventListener('click', () => {
      const trigger = fontColorPickerTrigger;
      closeCrackUiFontColorPicker({ commit: true });
      trigger?.focus?.({ preventScroll: true });
    });

    popover.querySelector(`#${ID.fontColorPickerRecent}`)?.addEventListener('click', (event) => {
      const button = event.target?.closest?.('[data-crack-ui-font-recent-color]');
      if (!button) return;
      const value = normalizeCrackUiFontHex(button.dataset.crackUiFontRecentColor, null);
      if (!value) return;
      syncCrackUiFontColorPickerFromValue(value);
      scheduleCrackUiFontColorPreview(value);
      flushCrackUiFontColorPreview();
    });

    document.addEventListener('pointerdown', (event) => {
      if (!fontColorPickerOpen) return;
      const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
      const insidePopover = path.includes(popover) || popover.contains(event.target);
      const insideTrigger = !!fontColorPickerTrigger && (
        path.includes(fontColorPickerTrigger) || fontColorPickerTrigger.contains?.(event.target)
      );
      if (insidePopover || insideTrigger) return;
      closeCrackUiFontColorPicker({ commit: false });
    }, true);

    document.addEventListener('keydown', (event) => {
      if (!fontColorPickerOpen || event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      const trigger = fontColorPickerTrigger;
      closeCrackUiFontColorPicker({ commit: false });
      trigger?.focus?.({ preventScroll: true });
    }, true);

    window.addEventListener('resize', () => {
      if (fontColorPickerOpen) requestAnimationFrame(positionCrackUiFontColorPicker);
    }, { passive: true });
    panel.querySelector('.crack-ui-panel-body')?.addEventListener('scroll', () => {
      if (fontColorPickerOpen) requestAnimationFrame(positionCrackUiFontColorPicker);
    }, { passive: true });
  }

  function setCrackUiFontPresetMenuOpen(nextOpen, panel = document.getElementById(ID.panel)) {
    fontPresetMenuOpen = nextOpen === true && activePanelSection === 'font';
    if (!panel) return;
    const dock = panel.querySelector(`#${ID.fontPresetDock}`);
    if (dock) dock.dataset.open = fontPresetMenuOpen ? '1' : '0';
    const popover = panel.querySelector(`#${ID.fontPresetPopover}`);
    if (popover) popover.hidden = !fontPresetMenuOpen;
    const toggle = panel.querySelector(`#${ID.fontPresetToggleButton}`);
    if (toggle) {
      toggle.setAttribute('aria-expanded', fontPresetMenuOpen ? 'true' : 'false');
      toggle.title = fontPresetMenuOpen ? '폰트 프리셋 닫기' : '폰트 프리셋 열기';
    }
  }

  function getCrackUiFontPresetListSignature(presets = normalizeCrackUiFontPresets(fontPresets)) {
    return presets.map((preset) => `${preset.id}\u0000${preset.name}\u0000${preset.updatedAt}`).join('\u0001');
  }

  function syncCrackUiFontPresetUi(panel = document.getElementById(ID.panel)) {
    if (!panel) return;
    const dock = panel.querySelector(`#${ID.fontPresetDock}`);
    if (dock) dock.hidden = activePanelSection !== 'font';
    const presets = normalizeCrackUiFontPresets(fontPresets);
    const list = panel.querySelector(`#${ID.fontPresetList}`);
    if (list) {
      const signature = getCrackUiFontPresetListSignature(presets);
      if (list.dataset.crackUiPresetSignature !== signature) {
        list.innerHTML = renderCrackUiFontPresetList();
        list.dataset.crackUiPresetSignature = signature;
      }
    }
    const count = panel.querySelector(`#${ID.fontPresetCount}`);
    if (count && count.textContent !== String(presets.length)) count.textContent = String(presets.length);
    const status = panel.querySelector(`#${ID.fontPresetStatus}`);
    if (status && status.textContent !== fontPresetStatusText) status.textContent = fontPresetStatusText;
    setCrackUiFontPresetMenuOpen(fontPresetMenuOpen, panel);
  }

  function saveCrackUiFontPresetFromPanel(panel = document.getElementById(ID.panel)) {
    if (!panel) return;
    const input = panel.querySelector(`#${ID.fontPresetNameInput}`);
    const name = normalizeCrackUiFontPresetName(input?.value);
    if (!name) {
      fontPresetStatusText = '이름을 입력해 주세요';
      syncCrackUiFontPresetUi(panel);
      input?.focus?.();
      return;
    }

    const presets = normalizeCrackUiFontPresets(fontPresets);
    const nameKey = name.toLocaleLowerCase();
    const existingIndex = presets.findIndex((preset) => preset.name.toLocaleLowerCase() === nameKey);
    const record = {
      id: existingIndex >= 0 ? presets[existingIndex].id : createCrackUiFontPresetId(),
      name,
      settings: createCrackUiFontPresetSnapshot(fontSettings),
      updatedAt: Date.now(),
    };

    if (existingIndex >= 0) presets.splice(existingIndex, 1);
    presets.unshift(record);
    fontPresets = presets;
    persistCrackUiFontPresets();
    fontPresetStatusText = existingIndex >= 0 ? `${name} 덮어씀` : `${name} 저장됨`;
    if (input) input.value = '';
    syncCrackUiFontPresetUi(panel);
  }

  function loadCrackUiFontPreset(presetId, panel = document.getElementById(ID.panel)) {
    const preset = normalizeCrackUiFontPresets(fontPresets)
      .find((item) => item.id === String(presetId || ''));
    if (!preset) return;

    const scrollSnapshot = getCrackUiFontScrollSnapshot(panel);
    restoreCrackUiFontQuoteDecorations();
    restoreCrackUiFontBaseDecorations();
    const preservedLibrary = {
      fontLibraryVersion: 3,
      savedFonts: normalizeCrackUiSavedFonts(fontSettings.savedFonts),
      customFontSource: fontSettings.customFontSource,
    };
    fontSettings = normalizeCrackUiFontSettings({
      ...preset.settings,
      ...preservedLibrary,
    });

    fontDialogueQuoteMatcherCache = null;
    invalidateCrackUiFontNativeSnapshot();
    fontResolveSource = '';
    fontResolveStatus = 'idle';
    fontResolvedFamily = '';
    fontResolvedFamilies = [];
    fontResolveLastError = '';
    fontSaveStatusText = '';
    fontSaveOperationSeq += 1;
    fontFileOperationActive = false;
    applyCrackUiFontFeatureState({ scheduleQuotes: true, immediateQuotes: true });
    persistCrackUiFontSettings();
    fontPresetStatusText = `${preset.name} 불러옴`;
    setCrackUiFontPresetMenuOpen(false, panel);
    syncCrackUiFontSettingsUi(panel);
    restoreCrackUiFontScrollSnapshot(scrollSnapshot);
  }

  function removeCrackUiFontPreset(presetId, panel = document.getElementById(ID.panel)) {
    const id = String(presetId || '');
    const presets = normalizeCrackUiFontPresets(fontPresets);
    const removed = presets.find((item) => item.id === id);
    if (!removed) return;
    fontPresets = presets.filter((item) => item.id !== id);
    persistCrackUiFontPresets();
    fontPresetStatusText = `${removed.name} 삭제됨`;
    syncCrackUiFontPresetUi(panel);
  }

  function syncCrackUiFontSettingsUi(panel = document.getElementById(ID.panel)) {
    if (!panel) return;
    const panelVisible = panelOpen && panel.dataset.open === '1' && activePanelSection === 'font';
    if (!panelVisible) return;
    resetCrackUiPanelOuterScroll(panel);

    const masterEnabled = fontSettings.masterEnabled === true;
    const sectionBody = panel.querySelector('[data-crack-ui-section-body="font"]');
    if (sectionBody) sectionBody.dataset.crackUiFontMaster = masterEnabled ? 'on' : 'off';

    panel.querySelectorAll('[data-crack-ui-font-toggle]').forEach((input) => {
      const key = input.dataset.crackUiFontToggle;
      if (!(key in fontSettings)) return;
      const isMaster = key === 'masterEnabled';
      input.checked = fontSettings[key] === true;
      input.disabled = !isMaster && !masterEnabled;
      const row = input.closest('.crack-ui-row');
      if (row) row.dataset.disabled = input.disabled ? '1' : '0';
    });

    measureCrackUiFontBaseSizes();

    panel.querySelectorAll('[data-crack-ui-font-range]').forEach((input) => {
      const key = input.dataset.crackUiFontRange;
      if (!(key in FONT_SETTING_RANGE)) return;
      const effectiveValue = getCrackUiFontEffectiveSettingValue(key);
      const inputConfig = getCrackUiFontRangeInputConfig(key, effectiveValue);
      input.min = String(inputConfig.min);
      input.max = String(inputConfig.max);
      input.step = String(inputConfig.step);
      input.value = String(inputConfig.value);
      input.disabled = !masterEnabled;
      const output = panel.querySelector(`[data-crack-ui-font-range-value="${key}"]`);
      if (output) output.textContent = formatCrackUiFontSettingValue(key, effectiveValue);
    });

    panel.querySelectorAll('[data-crack-ui-font-range-reset]').forEach((button) => {
      button.disabled = !masterEnabled || !isCrackUiFontSettingCustom(button.dataset.crackUiFontRangeReset);
    });
    panel.querySelectorAll('[data-crack-ui-font-range-reset-all]').forEach((button) => {
      button.disabled = !masterEnabled || !Object.keys(FONT_SETTING_RANGE).some((key) => isCrackUiFontSettingCustom(key));
    });

    panel.querySelectorAll('.crack-ui-font-highlight-card:not(.crack-ui-background-feature-card)').forEach((card) => {
      const parentToggle = card.querySelector('[data-crack-ui-font-toggle]');
      const parentKey = parentToggle?.dataset.crackUiFontToggle || '';
      const featureEnabled = masterEnabled && parentKey && fontSettings[parentKey] === true;
      card.dataset.featureEnabled = featureEnabled ? '1' : '0';
    });

    const italicStyleInput = panel.querySelector('[data-crack-ui-font-italic-style-toggle]');
    const italicStyleControl = panel.querySelector('[data-crack-ui-font-italic-style-control]');
    const italicStyleAvailable = masterEnabled && fontSettings.italicBgEnabled === true;
    if (italicStyleInput) {
      italicStyleInput.checked = fontSettings.italicStyleEnabled === true;
      italicStyleInput.disabled = !italicStyleAvailable;
    }
    if (italicStyleControl) italicStyleControl.dataset.disabled = italicStyleAvailable ? '0' : '1';

    syncCrackUiDialogueQuoteEditor(panel);

    panel.querySelectorAll('[data-crack-ui-font-color-reset]').forEach((button) => {
      const key = button.dataset.crackUiFontColorReset;
      const customFlag = FONT_NATIVE_OVERRIDE_FLAG[key];
      const card = button.closest('.crack-ui-font-highlight-card');
      const parentKey = card?.querySelector('[data-crack-ui-font-toggle]')?.dataset.crackUiFontToggle || '';
      const parentEnabled = !card || (parentKey && fontSettings[parentKey] === true);
      // A reset clears a stored override; it must remain available even while the parent
      // highlight feature is OFF. This is especially important for code-block text color.
      button.disabled = !masterEnabled || (customFlag ? !isCrackUiFontSettingCustom(key) : !parentEnabled);
    });

    panel.querySelectorAll('[data-crack-ui-font-accent-toggle]').forEach((switchButton) => {
      const key = switchButton.dataset.crackUiFontAccentToggle;
      const checked = fontSettings[key] === true;
      const card = switchButton.closest('.crack-ui-font-highlight-card');
      const parentKey = card?.querySelector('[data-crack-ui-font-toggle]')?.dataset.crackUiFontToggle || '';
      const parentEnabled = !!(parentKey && fontSettings[parentKey] === true);
      switchButton.dataset.checked = checked ? '1' : '0';
      switchButton.dataset.available = masterEnabled && parentEnabled ? '1' : '0';
      switchButton.setAttribute('aria-checked', checked ? 'true' : 'false');
      switchButton.disabled = !masterEnabled || !parentEnabled;
      const row = switchButton.closest('[data-crack-ui-font-accent-row]');
      if (row) {
        row.dataset.enabled = checked ? '1' : '0';
        row.dataset.available = masterEnabled && parentEnabled ? '1' : '0';
      }
    });

    sectionBody?.querySelectorAll('[data-crack-ui-font-color-picker]').forEach((button) => {
      const key = button.dataset.crackUiFontColorPicker;
      const card = button.closest('.crack-ui-font-highlight-card');
      const parentKey = card?.querySelector('[data-crack-ui-font-toggle]')?.dataset.crackUiFontToggle || '';
      const parentEnabled = !card || (parentKey && fontSettings[parentKey] === true);
      const value = key in fontSettings ? getCrackUiFontEffectiveSettingValue(key) : '#ffffff';
      button.style.setProperty('--crack-ui-font-swatch', value);
      button.disabled = !masterEnabled || !parentEnabled;
      if (button.disabled && fontColorPickerOpen && fontColorPickerTrigger === button) closeCrackUiFontColorPicker({ commit: false });
    });
    sectionBody?.querySelectorAll('[data-crack-ui-font-color-code]').forEach((input) => {
      const key = input.dataset.crackUiFontColorCode;
      const card = input.closest('.crack-ui-font-highlight-card');
      const parentKey = card?.querySelector('[data-crack-ui-font-toggle]')?.dataset.crackUiFontToggle || '';
      const parentEnabled = !card || (parentKey && fontSettings[parentKey] === true);
      if (key in fontSettings && document.activeElement !== input) input.value = getCrackUiFontEffectiveSettingValue(key);
      input.disabled = !masterEnabled || !parentEnabled;
    });

    const sourceInput = panel.querySelector(`#${ID.fontSourceInput}`);
    if (sourceInput && document.activeElement !== sourceInput) sourceInput.value = fontSettings.customFontSource;
    if (sourceInput) sourceInput.disabled = !masterEnabled;

    const savedFontRecords = normalizeCrackUiSavedFonts(fontSettings.savedFonts);
    const fontSelectEntries = getCrackUiFontSelectOptionEntries(savedFontRecords);
    syncCrackUiFontAssignmentSelect(
      panel.querySelector(`#${ID.fontBodySelect}`),
      'bodyFontId',
      masterEnabled,
      fontSelectEntries
    );
    syncCrackUiFontAssignmentSelect(
      panel.querySelector(`#${ID.fontCodeSelect}`),
      'codeFontId',
      masterEnabled,
      fontSelectEntries
    );
    syncCrackUiFontAssignmentSelect(
      panel.querySelector(`#${ID.fontTitleSelect}`),
      'titleFontId',
      masterEnabled,
      fontSelectEntries
    );
    const savedList = panel.querySelector(`#${ID.fontSavedList}`);
    if (savedList) {
      const signature = getCrackUiSavedFontListSignature(savedFontRecords);
      if (savedList.dataset.crackUiSavedFontSignature !== signature) {
        savedList.innerHTML = renderCrackUiSavedFontList(savedFontRecords);
        savedList.dataset.crackUiSavedFontSignature = signature;
      }
    }
    const fontRegistrationBusy = fontResolveStatus === 'loading' || fontFileOperationActive;
    panel.querySelectorAll('[data-crack-ui-font-remove]').forEach((button) => {
      button.disabled = !masterEnabled || fontRegistrationBusy;
    });

    const shadowChoicesEnabled = masterEnabled && fontSettings.textShadowEnabled;
    const shadowChoiceRow = panel.querySelector('[data-crack-ui-font-shadow-choices]');
    if (shadowChoiceRow) shadowChoiceRow.dataset.featureEnabled = shadowChoicesEnabled ? '1' : '0';
    panel.querySelectorAll('[data-crack-ui-font-shadow-tone]').forEach((button) => {
      const selected = button.dataset.crackUiFontShadowTone === fontSettings.textShadowTone;
      button.dataset.selected = selected ? '1' : '0';
      button.setAttribute('aria-checked', selected ? 'true' : 'false');
      button.disabled = !shadowChoicesEnabled;
    });

    const saveButton = panel.querySelector(`#${ID.fontSaveButton}`);
    if (saveButton) saveButton.disabled = !masterEnabled || fontRegistrationBusy || !String(fontSettings.customFontSource || '').trim();
    const fileButton = panel.querySelector(`#${ID.fontFileButton}`);
    if (fileButton) fileButton.disabled = !masterEnabled || fontRegistrationBusy;
    const fileInput = panel.querySelector(`#${ID.fontFileInput}`);
    if (fileInput) fileInput.disabled = !masterEnabled || fontRegistrationBusy;
    const status = panel.querySelector(`#${ID.fontResolveStatus}`);
    if (status) status.textContent = getCrackUiFontResolveStatusText();
    syncCrackUiFontPresetUi(panel);

    resetCrackUiPanelOuterScroll(panel);
  }

  function updateCrackUiFontSetting(key, value, options = {}) {
    const panel = document.getElementById(ID.panel);
    const isRangeUpdate = Object.prototype.hasOwnProperty.call(FONT_SETTING_RANGE, key);
    const isLiveRangeUpdate = isRangeUpdate && options.flush !== true && !!activePanelRangePreviewInput;
    const scrollSnapshot = isLiveRangeUpdate ? null : getCrackUiFontScrollSnapshot(panel);

    // Do not cancel the live preview on every range input event. Pointer/input delegation
    // starts it, and change/blur ends it exactly like the original image/chat-width sliders.
    if (!isRangeUpdate) stopPanelRangeDrag();

    const previous = fontSettings[key];
    if (key === 'masterEnabled') {
      // Pure runtime gate: never rewrite, reset, snapshot, or restore a child option here.
      // OFF removes only runtime CSS; ON immediately reapplies the still-stored child settings.
      fontSettings.masterEnabled = value === true;
    } else if (FONT_TOGGLE_KEYS.includes(key) || FONT_ACCENT_TOGGLE_KEYS.includes(key)) {
      fontSettings[key] = value === true;
    } else if (FONT_COLOR_KEYS.includes(key)) {
      fontSettings[key] = normalizeCrackUiFontHex(value, fontSettings[key] || getCrackUiFontNativeSettingValue(key));
      const customFlag = FONT_NATIVE_OVERRIDE_FLAG[key];
      if (customFlag) fontSettings[customFlag] = true;
    } else if (Object.prototype.hasOwnProperty.call(FONT_SETTING_RANGE, key)) {
      const def = FONT_SETTING_RANGE[key];
      const convertedValue = convertCrackUiFontRangeInputValue(key, value);
      let next = clampCrackUiFontNumber(convertedValue, def.min, def.max, getCrackUiFontNativeSettingValue(key));
      if (key === 'fontWeight') next = Math.round(next / 100) * 100;
      fontSettings[key] = next;
      const customFlag = FONT_NATIVE_OVERRIDE_FLAG[key];
      if (customFlag) fontSettings[customFlag] = true;
    } else if (key === 'customFontSource') {
      fontSettings.customFontSource = String(value || '').trim().slice(0, 20000);
    } else if (key === 'bodyFontId' || key === 'codeFontId' || key === 'titleFontId') {
      const id = String(value || '');
      fontSettings[key] = getCrackUiSavedFontById(id) ? id : '';
    } else if (key === 'textShadowTone') {
      fontSettings.textShadowTone = value === 'light' ? 'light' : 'dark';
    } else {
      return;
    }

    if (key === 'customFontSource' && previous !== fontSettings.customFontSource) {
      fontResolveSource = '';
      fontResolveStatus = 'idle';
      fontResolvedFamily = '';
      fontResolvedFamilies = [];
      fontResolveLastError = '';
    }

    if (key === 'baseBgEnabled' || key === 'dialogueBgEnabled' || key === 'thoughtBgEnabled') {
      resetCrackUiFontQuoteDecorations();
    }

    applyCrackUiFontFeatureState({ immediateQuotes: options.immediateQuotes === true });

    if (isLiveRangeUpdate) {
      // Keep live dragging cheap and stable: update only the visible value/reset state.
      // Full UI synchronization measures native styles and scroll restoration schedules
      // delayed writes; doing either on every input event caused the oscillating loop.
      syncCrackUiFontRangeControl(panel, key);
      saveCrackUiFontSettingsSoon();
      return;
    }

    syncCrackUiFontSettingsUi(panel);
    if (options.flush) persistCrackUiFontSettings();
    else saveCrackUiFontSettingsSoon();
    restoreCrackUiFontScrollSnapshot(scrollSnapshot);
  }

  function resetCrackUiFontRangeSettings(keys, panel = document.getElementById(ID.panel)) {
    const validKeys = [...new Set((Array.isArray(keys) ? keys : [keys])
      .filter((key) => Object.prototype.hasOwnProperty.call(FONT_SETTING_RANGE, key)))];
    if (!validKeys.length) return;

    stopPanelRangeDrag();
    const snapshot = getCrackUiFontScrollSnapshot(panel);
    measureCrackUiFontNativeSnapshot({ force: true });
    validKeys.forEach((key) => {
      fontSettings[key] = getCrackUiFontNativeSettingValue(key);
      const customFlag = FONT_NATIVE_OVERRIDE_FLAG[key];
      if (customFlag) fontSettings[customFlag] = false;
    });
    applyCrackUiFontFeatureState({ scheduleQuotes: false });
    persistCrackUiFontSettings();
    crackUiFontBaseMeasuredAt = -Infinity;
    crackUiFontBaseTextMeasured = false;
    crackUiFontBaseCodeMeasured = false;
    syncCrackUiFontSettingsUi(panel);
    restoreCrackUiFontScrollSnapshot(snapshot);
  }

  function resetCrackUiFontColorSetting(key, panel = document.getElementById(ID.panel)) {
    if (!FONT_COLOR_KEYS.includes(key)) return;

    if (fontColorPickerOpen && fontColorPickerKey === key) closeCrackUiFontColorPicker({ commit: false });
    stopPanelRangeDrag();
    const snapshot = getCrackUiFontScrollSnapshot(panel);
    measureCrackUiFontNativeSnapshot({ force: true });
    fontSettings[key] = getCrackUiFontNativeSettingValue(key);
    const customFlag = FONT_NATIVE_OVERRIDE_FLAG[key];
    if (customFlag) fontSettings[customFlag] = false;
    applyCrackUiFontFeatureState({ immediateQuotes: true });
    persistCrackUiFontSettings();
    syncCrackUiFontSettingsUi(panel);
    restoreCrackUiFontScrollSnapshot(snapshot);
  }

  function bindCrackUiFontSettingsControls(panel) {
    if (!panel || panel.dataset.crackUiFontBound === '1') return;
    panel.dataset.crackUiFontBound = '1';

    // #panel has overflow clipping, but browsers may still try to scroll an overflow-hidden
    // ancestor when a deep checkbox receives focus. Keep the outer panel pinned at zero.
    panel.addEventListener('scroll', () => resetCrackUiPanelOuterScroll(panel), { passive: true });
    panel.addEventListener('pointerdown', (event) => {
      const select = event.target instanceof HTMLSelectElement &&
        event.target.matches('[data-crack-ui-font-assignment]')
        ? event.target
        : null;
      if (select) select.dataset.crackUiFontPickerActive = '1';
    }, true);
    panel.addEventListener('touchstart', (event) => {
      const select = event.target instanceof HTMLSelectElement &&
        event.target.matches('[data-crack-ui-font-assignment]')
        ? event.target
        : null;
      if (select) select.dataset.crackUiFontPickerActive = '1';
    }, { capture: true, passive: true });
    panel.addEventListener('focusin', (event) => {
      const select = event.target instanceof HTMLSelectElement &&
        event.target.matches('[data-crack-ui-font-assignment]')
        ? event.target
        : null;
      if (select) {
        select.dataset.crackUiFontPickerActive = '1';
        return;
      }
      resetCrackUiPanelOuterScroll(panel);
      requestAnimationFrame(() => resetCrackUiPanelOuterScroll(panel));
    });
    panel.addEventListener('focusout', (event) => {
      const select = event.target instanceof HTMLSelectElement &&
        event.target.matches('[data-crack-ui-font-assignment]')
        ? event.target
        : null;
      if (!select) return;
      requestAnimationFrame(() => {
        if (!select.isConnected) return;
        delete select.dataset.crackUiFontPickerActive;
        syncCrackUiFontSettingsUi(panel);
      });
    });

    // Font toggles are handled manually. Preventing the label's native default click avoids
    // Chromium scrolling the outer settings panel to the focused hidden checkbox.
    panel.addEventListener('click', (event) => {
      const quoteToggle = event.target?.closest?.('[data-crack-ui-dialogue-quote-toggle]');
      if (quoteToggle && panel.contains(quoteToggle)) {
        event.preventDefault();
        event.stopPropagation();
        if (quoteToggle.disabled) return;
        setCrackUiDialogueQuoteMenuOpen(!fontDialogueQuoteMenuOpen, panel);
        return;
      }

      const quoteRemove = event.target?.closest?.('[data-crack-ui-dialogue-quote-remove]');
      if (quoteRemove && panel.contains(quoteRemove)) {
        event.preventDefault();
        event.stopPropagation();
        if (quoteRemove.disabled) return;
        const index = Number(quoteRemove.dataset.crackUiDialogueQuoteRemove);
        const pairs = normalizeCrackUiDialogueQuotePairs(fontSettings.dialogueQuotePairs);
        if (Number.isInteger(index) && index >= 0 && index < pairs.length) {
          updateCrackUiDialogueQuotePairs(pairs.filter((_, pairIndex) => pairIndex !== index), panel);
        }
        return;
      }

      const quoteAdd = event.target?.closest?.('[data-crack-ui-dialogue-quote-add]');
      if (quoteAdd && panel.contains(quoteAdd)) {
        event.preventDefault();
        event.stopPropagation();
        if (quoteAdd.disabled) return;
        const editor = quoteAdd.closest('[data-crack-ui-dialogue-quote-editor]');
        const open = normalizeCrackUiDialogueQuoteCharacter(editor?.querySelector('[data-crack-ui-dialogue-quote-open]')?.value);
        const close = normalizeCrackUiDialogueQuoteCharacter(editor?.querySelector('[data-crack-ui-dialogue-quote-close]')?.value);
        if (!open || !close) return;
        const pairs = normalizeCrackUiDialogueQuotePairs(fontSettings.dialogueQuotePairs);
        updateCrackUiDialogueQuotePairs([...pairs, [open, close]], panel);
        return;
      }

      const fontRemove = event.target?.closest?.('[data-crack-ui-font-remove]');
      if (fontRemove && panel.contains(fontRemove)) {
        event.preventDefault();
        event.stopPropagation();
        if (fontRemove.disabled) return;
        removeCrackUiSavedFont(fontRemove.dataset.crackUiFontRemove, panel);
        return;
      }

      const colorPicker = event.target?.closest?.('[data-crack-ui-font-color-picker]');
      if (colorPicker && panel.contains(colorPicker)) {
        event.preventDefault();
        event.stopPropagation();
        if (colorPicker.disabled) return;
        if (fontColorPickerOpen && fontColorPickerTrigger === colorPicker) closeCrackUiFontColorPicker({ commit: false });
        else openCrackUiFontColorPicker(colorPicker, panel);
        return;
      }

      const colorReset = event.target?.closest?.('[data-crack-ui-font-color-reset]');
      if (colorReset && panel.contains(colorReset)) {
        event.preventDefault();
        event.stopPropagation();
        resetCrackUiFontColorSetting(colorReset.dataset.crackUiFontColorReset, panel);
        return;
      }

      const rangeReset = event.target?.closest?.('[data-crack-ui-font-range-reset]');
      if (rangeReset && panel.contains(rangeReset)) {
        event.preventDefault();
        event.stopPropagation();
        resetCrackUiFontRangeSettings(rangeReset.dataset.crackUiFontRangeReset, panel);
        return;
      }

      const rangeResetAll = event.target?.closest?.('[data-crack-ui-font-range-reset-all]');
      if (rangeResetAll && panel.contains(rangeResetAll)) {
        event.preventDefault();
        event.stopPropagation();
        resetCrackUiFontRangeSettings(Object.keys(FONT_SETTING_RANGE), panel);
        return;
      }

      const accentSwitch = event.target?.closest?.('[data-crack-ui-font-accent-toggle]');
      if (accentSwitch && panel.contains(accentSwitch)) {
        event.preventDefault();
        event.stopPropagation();
        if (accentSwitch.disabled) return;
        const key = accentSwitch.dataset.crackUiFontAccentToggle;
        const snapshot = getCrackUiFontScrollSnapshot(panel);
        updateCrackUiFontSetting(key, fontSettings[key] !== true, { flush: true, immediateQuotes: true });
        try { accentSwitch.focus({ preventScroll: true }); } catch { accentSwitch.focus(); }
        restoreCrackUiFontScrollSnapshot(snapshot);
        return;
      }

      const row = event.target?.closest?.('.crack-ui-font-toggle-row');
      if (!row || !panel.contains(row)) return;
      const input = row.querySelector('[data-crack-ui-font-toggle]');
      if (!input || input.disabled) return;
      event.preventDefault();
      event.stopPropagation();
      const snapshot = getCrackUiFontScrollSnapshot(panel);
      updateCrackUiFontSetting(input.dataset.crackUiFontToggle, !input.checked, { flush: true, immediateQuotes: true });
      try { input.focus({ preventScroll: true }); } catch { input.focus(); }
      restoreCrackUiFontScrollSnapshot(snapshot);
    }, true);

    panel.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLSelectElement && target.matches('[data-crack-ui-font-assignment]')) {
        updateCrackUiFontSetting(target.dataset.crackUiFontAssignment, target.value, { flush: true });
        return;
      }
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      if (target.matches('[data-crack-ui-font-italic-style-toggle]')) {
        updateCrackUiFontSetting('italicStyleEnabled', target.checked, { flush: true });
        return;
      }
      if (target.matches('[data-crack-ui-font-range]')) {
        updateCrackUiFontSetting(target.dataset.crackUiFontRange, target.value, { flush: true });
        return;
      }
      if (target.matches('[data-crack-ui-font-color-code]')) {
        updateCrackUiFontSetting(target.dataset.crackUiFontColorCode, target.value, { flush: true });
      }
    });

    panel.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLTextAreaElement && target.id === ID.fontSourceInput) {
        fontSettings.customFontSource = String(target.value || '').slice(0, 20000);
        fontResolveStatus = 'idle';
        fontResolveLastError = '';
        fontSaveStatusText = '';
        const status = panel.querySelector(`#${ID.fontResolveStatus}`);
        if (status) status.textContent = getCrackUiFontResolveStatusText();
        const saveButton = panel.querySelector(`#${ID.fontSaveButton}`);
        if (saveButton) saveButton.disabled = !fontSettings.masterEnabled || fontFileOperationActive || !fontSettings.customFontSource.trim();
        saveCrackUiFontSettingsSoon();
        return;
      }
      if (!(target instanceof HTMLInputElement)) return;
      if (target.matches('[data-crack-ui-dialogue-quote-open], [data-crack-ui-dialogue-quote-close]')) {
        const normalized = normalizeCrackUiDialogueQuoteCharacter(target.value);
        if (target.value !== normalized) target.value = normalized;
        syncCrackUiDialogueQuoteEditor(panel);
        return;
      }
      if (target.matches('[data-crack-ui-font-range]')) {
        updateCrackUiFontSetting(target.dataset.crackUiFontRange, target.value);
        return;
      }
      if (target.matches('[data-crack-ui-font-color-code]') && /^#[0-9a-fA-F]{6}$/.test(target.value.trim())) {
        updateCrackUiFontSetting(target.dataset.crackUiFontColorCode, target.value);
      }
    });

    panel.addEventListener('keydown', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (!target.matches('[data-crack-ui-dialogue-quote-open], [data-crack-ui-dialogue-quote-close]')) return;
      if (event.key !== 'Enter') return;
      event.preventDefault();
      event.stopPropagation();
      const addButton = target.closest('[data-crack-ui-dialogue-quote-editor]')
        ?.querySelector('[data-crack-ui-dialogue-quote-add]');
      if (addButton && !addButton.disabled) addButton.click();
    });

    panel.querySelectorAll('[data-crack-ui-font-shadow-tone]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        updateCrackUiFontSetting('textShadowTone', button.dataset.crackUiFontShadowTone, { flush: true });
      });
    });

    panel.addEventListener('click', (event) => {
      if (!fontDialogueQuoteMenuOpen) return;
      const tools = panel.querySelector('[data-crack-ui-dialogue-quote-tools]');
      if (tools && !tools.contains(event.target)) setCrackUiDialogueQuoteMenuOpen(false, panel);
    });

    panel.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !fontDialogueQuoteMenuOpen) return;
      setCrackUiDialogueQuoteMenuOpen(false, panel);
    });

    panel.querySelector(`#${ID.fontPresetToggleButton}`)?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setCrackUiFontPresetMenuOpen(!fontPresetMenuOpen, panel);
    });

    panel.querySelector(`#${ID.fontPresetPopover}`)?.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    panel.addEventListener('click', (event) => {
      if (!fontPresetMenuOpen) return;
      const dock = panel.querySelector(`#${ID.fontPresetDock}`);
      if (dock && !dock.contains(event.target)) setCrackUiFontPresetMenuOpen(false, panel);
    });

    panel.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !fontPresetMenuOpen) return;
      event.preventDefault();
      event.stopPropagation();
      setCrackUiFontPresetMenuOpen(false, panel);
      panel.querySelector(`#${ID.fontPresetToggleButton}`)?.focus?.();
    });

    panel.querySelector(`#${ID.fontPresetSaveButton}`)?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      saveCrackUiFontPresetFromPanel(panel);
    });

    panel.querySelector(`#${ID.fontPresetNameInput}`)?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      event.stopPropagation();
      saveCrackUiFontPresetFromPanel(panel);
    });

    panel.querySelector(`#${ID.fontPresetList}`)?.addEventListener('click', (event) => {
      const loadButton = event.target?.closest?.('[data-crack-ui-font-preset-load]');
      if (loadButton && panel.contains(loadButton)) {
        event.preventDefault();
        event.stopPropagation();
        loadCrackUiFontPreset(loadButton.dataset.crackUiFontPresetLoad, panel);
        return;
      }
      const removeButton = event.target?.closest?.('[data-crack-ui-font-preset-remove]');
      if (removeButton && panel.contains(removeButton)) {
        event.preventDefault();
        event.stopPropagation();
        removeCrackUiFontPreset(removeButton.dataset.crackUiFontPresetRemove, panel);
      }
    });

    panel.querySelector(`#${ID.fontSaveButton}`)?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      saveCrackUiFontFromPanel(panel);
    });

    panel.querySelector(`#${ID.fontFileButton}`)?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const input = panel.querySelector(`#${ID.fontFileInput}`);
      if (!input || input.disabled) return;
      input.click();
    });

    panel.querySelector(`#${ID.fontFileInput}`)?.addEventListener('change', (event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement) || !input.files?.length) return;
      saveCrackUiFontFiles(input.files, panel);
    });

    panel.querySelector(`#${ID.fontResetButton}`)?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const snapshot = getCrackUiFontScrollSnapshot(panel);
      restoreCrackUiFontQuoteDecorations();
      restoreCrackUiFontBaseDecorations();

      // Reset visual values only. Keep every ON/OFF choice, the saved web/file font library,
      // its current body/code/title assignments, and the source draft exactly as the user left them.
      const preserved = {
        accentToggleVersion: 2,
        nativeResetVersion: 2,
        fontLibraryVersion: 3,
        savedFonts: normalizeCrackUiSavedFonts(fontSettings.savedFonts),
        bodyFontId: fontSettings.bodyFontId,
        codeFontId: fontSettings.codeFontId,
        titleFontId: fontSettings.titleFontId,
        customFontSource: fontSettings.customFontSource,
      };
      [...FONT_TOGGLE_KEYS, ...FONT_ACCENT_TOGGLE_KEYS].forEach((key) => {
        preserved[key] = fontSettings[key] === true;
      });
      fontSettings = normalizeCrackUiFontSettings(preserved);
      fontDialogueQuoteMatcherCache = null;
      invalidateCrackUiFontNativeSnapshot();
      fontResolveSource = '';
      fontResolveStatus = 'idle';
      fontResolvedFamily = '';
      fontResolvedFamilies = [];
      fontResolveLastError = '';
      fontSaveStatusText = '';
      fontSaveOperationSeq += 1;
      fontFileOperationActive = false;
      applyCrackUiFontFeatureState({ scheduleQuotes: true, immediateQuotes: true });
      persistCrackUiFontSettings();
      syncCrackUiFontSettingsUi(panel);
      restoreCrackUiFontScrollSnapshot(snapshot);
    });
  }

  function ensureCrackUiFontFeature() {
    // Global init may run repeatedly while messages stream. Runtime signature checks are cheap;
    // the visible font controls are synchronized only by panel/font-tab lifecycle and user actions.
    applyCrackUiFontFeatureState({ scheduleQuotes: false });
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
    font: '폰트',
    background: '배경',
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

    const fontPresetDock = panel.querySelector(`#${ID.fontPresetDock}`);
    if (fontPresetDock) fontPresetDock.hidden = activePanelSection !== 'font';
    if (activePanelSection !== 'font') {
      setCrackUiFontPresetMenuOpen(false, panel);
      setCrackUiDialogueQuoteMenuOpen(false, panel);
    }
    if (fontColorPickerOpen) {
      const pickerIsBackground = isCrackUiBackgroundColorPickerKey(fontColorPickerKey);
      if ((activePanelSection === 'background') !== pickerIsBackground) {
        closeCrackUiFontColorPicker({ commit: true, sync: false });
      }
    }
    if (activePanelSection === 'font' && options.syncFont !== false && panelOpen && panel.dataset.open === '1') {
      syncCrackUiFontSettingsUi(panel);
    } else if (activePanelSection === 'background' && panelOpen && panel.dataset.open === '1') {
      syncCrackUiChatBackgroundUi(panel);
    }

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
    setActivePanelSection(activePanelSection, { persist: false, resetScroll: false, syncFont: false });
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
      if (!document.getElementById(ID.fontColorPickerPopover)) {
        panelRoot.insertAdjacentHTML('beforeend', renderCrackUiFontColorPickerPopover());
      }
      bindCrackUiFontColorPicker(existingPanel, panelRoot);
      return;
    }

    const panel = document.createElement('div');
    panel.id = ID.panel;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Crack UI Max 설정');

    panel.innerHTML = `
      <div class="crack-ui-panel-head">
        <div class="crack-ui-title-wrap">
          <div class="crack-ui-panel-title">Crack UI Max</div>
          <div class="crack-ui-panel-version" aria-label="버전 ${CRACK_UI_VERSION}">v${CRACK_UI_VERSION}</div>
        </div>
        <div class="crack-ui-panel-head-actions">
          ${renderCrackUiFontPresetDock()}
          <button
            id="${ID.panelPreviewButton}"
            type="button"
            class="crack-ui-panel-preview"
            aria-label="누르고 있는 동안 채팅 미리보기"
            aria-pressed="false"
            title="누르고 있는 동안 채팅 미리보기"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
              <circle cx="12" cy="12" r="2.7" stroke-width="1.8"></circle>
            </svg>
          </button>
          <button type="button" class="crack-ui-panel-close" aria-label="닫기">×</button>
        </div>
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
            <button type="button" class="crack-ui-panel-nav-button" role="tab" data-crack-ui-section-nav="font" data-active="${activePanelSection === 'font' ? '1' : '0'}" aria-selected="${activePanelSection === 'font' ? 'true' : 'false'}">폰트</button>
            <button type="button" class="crack-ui-panel-nav-button" role="tab" data-crack-ui-section-nav="background" data-active="${activePanelSection === 'background' ? '1' : '0'}" aria-selected="${activePanelSection === 'background' ? 'true' : 'false'}">배경</button>
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

        ${renderCrackUiFontSectionHtml()}
        ${renderCrackUiBackgroundSectionHtml()}
            </div>
          </div>
        </div>
      </div>
    `;
    panel.addEventListener('click', (e) => e.stopPropagation());
    panel.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    const previewButton = panel.querySelector(`#${ID.panelPreviewButton}`);
    if (previewButton) {
      const beginPreview = (event) => {
        if ('button' in event && event.button !== undefined && event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();

        if (event.type === 'pointerdown' && Number.isFinite(event.pointerId)) {
          try {
            previewButton.setPointerCapture(event.pointerId);
          } catch {
          }
        }

        startPanelHoldPreview();
      };

      if (typeof window.PointerEvent === 'function') {
        previewButton.addEventListener('pointerdown', beginPreview);
      } else {
        previewButton.addEventListener('mousedown', beginPreview);
        previewButton.addEventListener('touchstart', beginPreview, { passive: false });
      }

      previewButton.addEventListener('click', (event) => {
        // Prevent the release click from falling through to the backdrop and closing the panel.
        event.preventDefault();
        event.stopPropagation();
      });
      previewButton.addEventListener('keydown', (event) => {
        if (event.key !== ' ' && event.key !== 'Enter') return;
        beginPreview(event);
      });
      previewButton.addEventListener('keyup', (event) => {
        if (event.key !== ' ' && event.key !== 'Enter') return;
        event.preventDefault();
        stopPanelHoldPreview();
      });
      previewButton.addEventListener('blur', stopPanelHoldPreview);
      previewButton.addEventListener('contextmenu', (event) => event.preventDefault());
    }

    panel.querySelector('.crack-ui-panel-close')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closePanel();
    });
    panelRoot.appendChild(panel);
    if (!document.getElementById(ID.fontColorPickerPopover)) {
      panelRoot.insertAdjacentHTML('beforeend', renderCrackUiFontColorPickerPopover());
    }
    bindCrackUiFontColorPicker(panel, panelRoot);

    bindPanelSections(panel);
    bindPanelThemeStripScroll(panel);
    bindChoiceButtons(panel);
    bindMenuAssistModeControls(panel);
    syncPanelSections();
    updateVisibleModelChoicesUi();
    syncVisibleModelListOpenUi();
    updateThemeUi();
    updateChatListAutoHideUi();
    syncCrackUiFontSettingsUi(panel);
    syncCrackUiChatBackgroundUi(panel);

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

    bindCheckbox(
      panel,
      ID.toggleChatBackground,
      chatBackgroundSettings.enabled === true && chatBackgroundSettings.imageEnabled !== true,
      (checked) => {
        if (checked) {
          chatBackgroundSettings.enabled = true;
          chatBackgroundSettings.imageEnabled = false;
        } else if (chatBackgroundSettings.imageEnabled !== true) {
          chatBackgroundSettings.enabled = false;
        }
        persistCrackUiChatBackgroundSettings();
        syncCrackUiChatBackgroundUi(panel);
        applyCrackUiChatBackground();
      }
    );

    const chatBackgroundColorInput = panel.querySelector('[data-crack-ui-chat-background-color-code]');
    const commitChatBackgroundColorInput = () => {
      if (!chatBackgroundColorInput) return;
      const normalized = normalizeCrackUiFontHex(chatBackgroundColorInput.value, null);
      if (!normalized) {
        chatBackgroundColorInput.value = chatBackgroundSettings.color;
        return;
      }
      updateCrackUiChatBackgroundColor(normalized);
    };
    chatBackgroundColorInput?.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(chatBackgroundColorInput.value.trim())) {
        updateCrackUiChatBackgroundColor(chatBackgroundColorInput.value, { persist: false, sync: false });
      }
    });
    chatBackgroundColorInput?.addEventListener('change', commitChatBackgroundColorInput);
    chatBackgroundColorInput?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      commitChatBackgroundColorInput();
    });

    const chatBackgroundImageButton = panel.querySelector(`#${ID.chatBackgroundImageButton}`);
    const chatBackgroundImageInput = panel.querySelector(`#${ID.chatBackgroundImageInput}`);
    const chatBackgroundImageRemove = panel.querySelector(`#${ID.chatBackgroundImageRemove}`);
    bindCheckbox(
      panel,
      ID.toggleChatBackgroundImage,
      chatBackgroundSettings.enabled === true && chatBackgroundSettings.imageEnabled === true,
      (checked) => {
        if (checked) {
          chatBackgroundSettings.enabled = true;
          chatBackgroundSettings.imageEnabled = true;
        } else if (chatBackgroundSettings.imageEnabled === true) {
          chatBackgroundSettings.enabled = false;
          chatBackgroundSettings.imageEnabled = false;
        }
        persistCrackUiChatBackgroundSettings();
        syncCrackUiChatBackgroundUi(panel);
        applyCrackUiChatBackground();
      }
    );
    chatBackgroundImageButton?.addEventListener('click', (event) => {
      event.preventDefault();
      if (chatBackgroundImageButton.disabled) return;
      chatBackgroundImageInput?.click();
    });
    chatBackgroundImageInput?.addEventListener('change', async () => {
      const file = chatBackgroundImageInput.files?.[0] || null;
      chatBackgroundImageInput.value = '';
      if (!file) return;
      try {
        await updateCrackUiChatBackgroundImageFromFile(file);
      } catch (error) {
        console.warn('[Crack UI Max] background image save failed', error);
        try {
          window.alert(`Crack UI Max: 배경 이미지 저장 실패
${error?.message || error}`);
        } catch {
        }
      }
    });
    chatBackgroundImageRemove?.addEventListener('click', async (event) => {
      event.preventDefault();
      if (chatBackgroundImageRemove.disabled) return;
      try {
        await clearCrackUiChatBackgroundImage();
      } catch (error) {
        console.warn('[Crack UI Max] background image remove failed', error);
      }
    });

    bindCheckbox(panel, ID.toggleNovelBackdrop, chatBackgroundSettings.novelBackdropEnabled, (checked) => {
      if (normalizeEpisodeUiMode(episodeUiMode) !== 'novel') {
        syncCrackUiChatBackgroundUi(panel);
        return;
      }
      chatBackgroundSettings.novelBackdropEnabled = checked === true;
      persistCrackUiChatBackgroundSettings();
      applyCrackUiChatBackground();
      syncCrackUiChatBackgroundUi(panel);
    });

    const novelBackdropColorInput = panel.querySelector('[data-crack-ui-novel-backdrop-color-code]');
    const commitNovelBackdropColorInput = () => {
      if (!novelBackdropColorInput) return;
      const normalized = normalizeCrackUiFontHex(novelBackdropColorInput.value, null);
      if (!normalized) {
        novelBackdropColorInput.value = chatBackgroundSettings.novelBackdropColor;
        return;
      }
      updateCrackUiNovelBackdropColor(normalized);
    };
    novelBackdropColorInput?.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(novelBackdropColorInput.value.trim())) {
        updateCrackUiNovelBackdropColor(novelBackdropColorInput.value, { persist: false, sync: false });
      }
    });
    novelBackdropColorInput?.addEventListener('change', commitNovelBackdropColorInput);
    novelBackdropColorInput?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      commitNovelBackdropColorInput();
    });

    const novelBackdropOpacityInput = panel.querySelector('[data-crack-ui-novel-backdrop-opacity]');
    novelBackdropOpacityInput?.addEventListener('input', () => {
      updateCrackUiNovelBackdropOpacity(novelBackdropOpacityInput.value, { persist: false, sync: true });
    });
    novelBackdropOpacityInput?.addEventListener('change', () => {
      updateCrackUiNovelBackdropOpacity(novelBackdropOpacityInput.value);
    });
    bindCrackUiFontSettingsControls(panel);

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
    syncCheckbox(
      ID.toggleChatBackground,
      chatBackgroundSettings.enabled === true && chatBackgroundSettings.imageEnabled !== true
    );
    syncCheckbox(
      ID.toggleChatBackgroundImage,
      chatBackgroundSettings.enabled === true && chatBackgroundSettings.imageEnabled === true
    );
    syncCheckbox(ID.toggleNovelBackdrop, chatBackgroundSettings.novelBackdropEnabled);
    closeMenuAssistModePanels(panel);
    updateVisibleModelChoicesUi();
    syncVisibleModelListOpenUi();

    syncThemeStateFromOriginalSettings();
    syncPanelSections();
    updateThemeUi();
    updateImageSizeUi();
    updateChatWidthUi();
    crackUiPanelLifecycleToken += 1;
    if (activePanelSection === 'font') {
      measureCrackUiFontNativeSnapshot({ force: true });
      syncCrackUiFontSettingsUi(panel);
    } else if (activePanelSection === 'background') {
      syncCrackUiChatBackgroundUi(panel);
    }
    applyState();
  }

  function clearPanelInteractionState(panel = document.getElementById(ID.panel)) {
    closeCrackUiFontColorPicker({ commit: true, sync: false });
    crackUiPanelLifecycleToken += 1;
    cancelCrackUiFontScrollRestore();

    const focused = document.activeElement;
    if (panel && focused instanceof HTMLElement && panel.contains(focused)) {
      try { focused.blur(); } catch {
      }
    }

    if (activePanelRangePreviewInput instanceof HTMLInputElement) {
      try {
        if (
          Number.isInteger(activePanelRangePreviewInput.__crackUiPointerId) &&
          activePanelRangePreviewInput.hasPointerCapture?.(activePanelRangePreviewInput.__crackUiPointerId)
        ) activePanelRangePreviewInput.releasePointerCapture(activePanelRangePreviewInput.__crackUiPointerId);
      } catch {
      }
    }

    activePanelRangePreviewInput = null;
    activeCrackUiFontRangeScroller = null;
    activeCrackUiFontRangeScrollTop = 0;
    activeCrackUiFontRangeScrollLeft = 0;
    panelHoldPreviewActive = false;
    isChatWidthDragging = false;

    if (panel) {
      panel.querySelectorAll('[data-crack-ui-range-preview-active="1"]').forEach((element) => {
        delete element.dataset.crackUiRangePreviewActive;
      });
      panel.querySelectorAll('[data-crack-ui-range-preview-path="1"]').forEach((element) => {
        delete element.dataset.crackUiRangePreviewPath;
      });
      panel.querySelectorAll('[data-pressed="1"]').forEach((element) => {
        delete element.dataset.pressed;
        if (element.id === ID.panelPreviewButton) element.setAttribute('aria-pressed', 'false');
      });
      delete panel.dataset.crackUiRangePreview;
      delete panel.dataset.crackUiFontRangeTouchLock;
    }

    document.documentElement.classList.remove(CLS.rangePreview, CLS.widthDragging);
  }

  function closePanel() {
    const panel = document.getElementById(ID.panel);
    if (!panel) return;

    // Hide first, then invalidate every pending panel task. No delayed range/scroll callback is
    // allowed to touch a closed panel or Crack's page scroller after this point.
    panelOpen = false;
    panel.dataset.open = '0';
    clearPanelInteractionState(panel);
    closeMenuAssistModePanels(panel);
    setCrackUiDialogueQuoteMenuOpen(false, panel);
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

  function findCrackUiActiveWeatherLayer() {
    const root = document.getElementById('cawf-root');
    if (!(root instanceof HTMLElement) || !root.isConnected) return null;
    const host = root.parentElement;
    if (!(host instanceof HTMLElement) || host === document.body) return null;

    const visible = root.getAttribute('data-cawf-visible') === 'true';
    const hostFound = root.getAttribute('data-cawf-host-found') === 'true';
    if (!(visible && hostFound)) return null;
    if (host.id !== 'cawf-mount-box' && host.id !== 'sgb-bg-root') return null;
    return { root, host };
  }

  function removeCrackUiChatBackgroundWeatherLayer() {
    if (appliedChatBackgroundWeatherLayer?.isConnected) {
      appliedChatBackgroundWeatherLayer.remove();
    }
    appliedChatBackgroundWeatherLayer = null;
  }

  function removeCrackUiNovelBackdropWeatherLayer() {
    if (appliedNovelBackdropWeatherLayer?.isConnected) {
      appliedNovelBackdropWeatherLayer.remove();
    }
    appliedNovelBackdropWeatherLayer = null;
  }

  function ensureCrackUiChatBackgroundWeatherLayer(weather) {
    if (!weather?.root?.isConnected) return null;
    let layer = document.getElementById(ID.chatBackgroundLayer);
    if (!(layer instanceof HTMLElement)) {
      layer = document.createElement('div');
      layer.id = ID.chatBackgroundLayer;
      layer.setAttribute('aria-hidden', 'true');
    }

    // CAWF root is an isolated, clipped stacking context already sized to the chat main.
    // Mounting the solid color inside that root keeps it below every weather/time effect,
    // while still above Crack's opaque native frame that otherwise shows through the fade.
    if (layer.parentElement !== weather.root || weather.root.firstElementChild !== layer) {
      weather.root.insertBefore(layer, weather.root.firstChild);
    }
    layer.style.setProperty('inset', '0', 'important');
    layer.style.removeProperty('left');
    layer.style.removeProperty('top');
    layer.style.removeProperty('width');
    layer.style.removeProperty('height');

    appliedChatBackgroundWeatherLayer = layer;
    return layer;
  }

  function ensureCrackUiNovelBackdropWeatherLayer(weather) {
    if (!weather?.root?.isConnected) return null;
    let layer = document.getElementById(ID.novelBackdropWeatherLayer);
    if (!(layer instanceof HTMLElement)) {
      layer = document.createElement('div');
      layer.id = ID.novelBackdropWeatherLayer;
      layer.setAttribute('aria-hidden', 'true');
    }

    const timeLayer = weather.root.querySelector('#cawf-time-layer');
    const insertionPoint = timeLayer instanceof HTMLElement ? timeLayer.nextSibling : null;
    if (layer.parentElement !== weather.root || layer.previousElementSibling !== timeLayer) {
      weather.root.insertBefore(layer, insertionPoint);
    }

    appliedNovelBackdropWeatherLayer = layer;
    return layer;
  }

  function isCrackUiNovelBackdropLayout(viewport) {
    if (normalizeEpisodeUiMode(episodeUiMode) !== 'novel') return false;
    if (!(viewport instanceof HTMLElement)) return false;
    if (viewport.querySelector('[data-message-group-id] .rounded-none.bg-transparent .wrtn-markdown')) return true;
    return true;
  }

  function applyCrackUiChatBackground() {
    const root = document.documentElement;
    const routeEnabled = crackUiIsChatRoute();
    const enabled = chatBackgroundSettings.enabled === true && routeEnabled;
    const color = normalizeCrackUiFontHex(chatBackgroundSettings.color, CHAT_BACKGROUND_SETTINGS_DEFAULT.color);
    root.style.setProperty('--crack-ui-chat-background-color', color);
    root.style.setProperty(
      '--crack-ui-chat-background-image',
      enabled && chatBackgroundSettings.imageEnabled === true && chatBackgroundImageObjectUrl
        ? crackUiChatBackgroundEscapeCssUrl(chatBackgroundImageObjectUrl)
        : 'none'
    );

    const viewport = routeEnabled ? DOM.chatBackgroundViewport() : null;
    const novelColor = normalizeCrackUiFontHex(
      chatBackgroundSettings.novelBackdropColor,
      CHAT_BACKGROUND_SETTINGS_DEFAULT.novelBackdropColor
    );
    const novelOpacityPercent = Math.max(5, Math.min(100, Math.round(
      Number(chatBackgroundSettings.novelBackdropOpacity) || CHAT_BACKGROUND_SETTINGS_DEFAULT.novelBackdropOpacity
    )));
    const novelOpacity = novelOpacityPercent / 100;
    const novelEnabled = chatBackgroundSettings.novelBackdropEnabled === true
      && routeEnabled
      && isCrackUiNovelBackdropLayout(viewport);
    const weather = routeEnabled && (enabled || novelEnabled) ? findCrackUiActiveWeatherLayer() : null;
    const nextTarget = enabled && !weather ? viewport : null;
    const nextNovelTarget = novelEnabled && !weather ? viewport : null;
    const nextComposerShell = (enabled || novelEnabled) ? DOM.chatBackgroundComposerShell() : null;

    root.style.setProperty('--crack-ui-novel-backdrop-rgb', crackUiFontHexToRgb(novelColor));
    root.style.setProperty('--crack-ui-novel-backdrop-alpha', novelOpacity.toFixed(3));
    root.style.setProperty('--crack-ui-novel-backdrop-soft-alpha', Math.max(0, novelOpacity * 0.36).toFixed(3));

    if (appliedChatBackgroundTarget && appliedChatBackgroundTarget !== nextTarget) {
      appliedChatBackgroundTarget.removeAttribute('data-crack-ui-chat-background-target');
    }
    appliedChatBackgroundTarget = nextTarget;

    if (appliedNovelBackdropTarget && appliedNovelBackdropTarget !== nextNovelTarget) {
      appliedNovelBackdropTarget.removeAttribute('data-crack-ui-novel-backdrop-target');
    }
    appliedNovelBackdropTarget = nextNovelTarget;

    if (appliedChatBackgroundComposerShell && appliedChatBackgroundComposerShell !== nextComposerShell) {
      appliedChatBackgroundComposerShell.removeAttribute('data-crack-ui-chat-background-composer-shell');
    }
    appliedChatBackgroundComposerShell = nextComposerShell;

    let weatherNovelLayer = null;
    if (weather && enabled) {
      ensureCrackUiChatBackgroundWeatherLayer(weather);
    } else {
      removeCrackUiChatBackgroundWeatherLayer();
    }
    if (weather && novelEnabled) {
      weatherNovelLayer = ensureCrackUiNovelBackdropWeatherLayer(weather);
    } else {
      removeCrackUiNovelBackdropWeatherLayer();
    }

    if (nextTarget) nextTarget.setAttribute('data-crack-ui-chat-background-target', '1');
    if (nextNovelTarget) nextNovelTarget.setAttribute('data-crack-ui-novel-backdrop-target', '1');
    if (nextComposerShell) nextComposerShell.setAttribute('data-crack-ui-chat-background-composer-shell', '1');
    root.setAttribute('data-crack-ui-novel-backdrop', nextNovelTarget || weatherNovelLayer ? 'on' : 'off');
    root.setAttribute('data-crack-ui-novel-backdrop-weather', weatherNovelLayer ? 'on' : 'off');
    root.setAttribute(
      'data-crack-ui-chat-background',
      weather ? 'weather-underlay' : (nextTarget ? 'viewport' : 'off')
    );
  }

  function scheduleCrackUiChatBackgroundApply() {
    if (chatBackgroundApplyRaf) return;
    chatBackgroundApplyRaf = requestAnimationFrame(() => {
      chatBackgroundApplyRaf = 0;
      applyCrackUiChatBackground();
    });
  }

  function isCrackUiWeatherLayerStructureNode(node) {
    if (!(node instanceof Element)) return false;
    if (node.id === 'cawf-root' || node.id === 'cawf-time-layer') return true;
    return !!node.querySelector?.('#cawf-root, #cawf-time-layer');
  }

  function refreshCrackUiWeatherRootObserver() {
    const nextRoot = document.getElementById('cawf-root');
    if (observedChatBackgroundWeatherRoot === nextRoot && nextRoot?.isConnected) return nextRoot;

    chatBackgroundWeatherRootObserver?.disconnect();
    chatBackgroundWeatherRootObserver = null;
    observedChatBackgroundWeatherRoot = nextRoot instanceof HTMLElement ? nextRoot : null;

    if (!observedChatBackgroundWeatherRoot) return null;

    chatBackgroundWeatherRootObserver = new MutationObserver((mutations) => {
      const relevant = mutations.some((mutation) => {
        if (mutation.type === 'attributes') {
          return mutation.target === observedChatBackgroundWeatherRoot;
        }
        if (mutation.type !== 'childList') return false;
        return [...mutation.addedNodes, ...mutation.removedNodes]
          .some(isCrackUiWeatherLayerStructureNode);
      });
      if (relevant) scheduleCrackUiChatBackgroundApply();
    });
    chatBackgroundWeatherRootObserver.observe(observedChatBackgroundWeatherRoot, {
      attributes: true,
      attributeFilter: ['data-cawf-visible', 'data-cawf-host-found'],
      childList: true,
    });
    return observedChatBackgroundWeatherRoot;
  }

  function observeCrackUiChatBackgroundCompatibility() {
    if (chatBackgroundCompatibilityObserver) return;
    chatBackgroundCompatibilityObserver = new MutationObserver(() => {
      refreshCrackUiWeatherRootObserver();
      scheduleCrackUiChatBackgroundApply();
    });
    chatBackgroundCompatibilityObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-cawf-layer-active'],
    });
    refreshCrackUiWeatherRootObserver();
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
    applyCrackUiChatBackground();
    ensureCrackUiFontFeature();
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
      console.warn('[Crack UI Max] 공식 모델 버튼을 못 찾음');
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
          console.warn('[Crack UI Max] 공식 모델 메뉴를 못 찾음');
          return false;
        }

        const targetItem = [...modelMenu.querySelectorAll('div[role="menuitem"], [role="menuitem"]')]
          .find((item) => {
            const itemName = getModelNameFromNode(item);
            return itemName === targetName || normalizeText(item.textContent).includes(targetName);
          });

        if (!targetItem) {
          console.warn(`[Crack UI Max] 공식 메뉴에서 ${targetName} 항목을 못 찾음`);
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

    // The UI Plus settings root is a fixed, full-viewport wrapper and contains
    // the text "채팅방 설정 자동 숨김". Without excluding the wrapper itself,
    // it scores exactly like Crack's native room panel on mobile and remains
    // cached as DOM.roomPanel(), which makes boot/auto-close toggle the native
    // room-settings button in the wrong direction.
    if (el.closest(`#${ID.panelRoot}, #${ID.panel}, #${ID.bottomModelPopup}`)) return -1;

    const r = crackUiEdgeRect(el);
    if (!r) return -1;

    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    if (r.height < 280) return -1;
    if (r.top < -16 || r.top > 120) return -1;
    if (r.right < vw - 12 && r.left < vw - 330) return -1;
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
    if (roomPanelToggleFinalVerifyTimer) {
      clearTimeout(roomPanelToggleFinalVerifyTimer);
      roomPanelToggleFinalVerifyTimer = null;
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

          // During the slide animation the panel geometry can lag behind the
          // button state. Never send a second toggle from geometry alone.
          const explicitFailure = toggleOpenAfter !== null && toggleOpenAfter !== want;
          if (openAfter !== want && (!method || explicitFailure)) {
            cachedRoomPanelToggle = null;
            cachedRoomMenuButton = null;
            const fallbackToggle = getRoomPanelToggleForActivation();
            const fallbackMethod = dispatchTouchLikeActivation(fallbackToggle, `${reason || 'room-panel-toggle'}:fallback`);
            if (lastRoomPanelToggleAttempt?.requestSeq === requestSeq) {
              lastRoomPanelToggleAttempt.fallbackMethod = fallbackMethod || 'failed';
              lastRoomPanelToggleAttempt.fallbackToggle = getElementDebugInfo(fallbackToggle);
            }

            roomPanelToggleFinalVerifyTimer = setTimeout(() => {
              roomPanelToggleFinalVerifyTimer = null;
              if (requestSeq !== roomPanelToggleRequestSeq) return;

              const finalPanel = DOM.roomPanel();
              const finalOpen = finalPanel ? isRoomPanelOpen(finalPanel) : false;
              if (lastRoomPanelToggleAttempt?.requestSeq === requestSeq) {
                lastRoomPanelToggleAttempt.finalOpen = finalOpen;
              }
              if (!want) setTimeout(() => pulseRoomTopBarHidden(), 120);
            }, 180);
          }
        }, 220);
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

  function findCrackUiChatBackgroundComposerShell() {
    if (cachedChatBackgroundComposerShell?.isConnected) return cachedChatBackgroundComposerShell;
    cachedChatBackgroundComposerShell = null;

    const editable = findChatComposerEditable();
    let current = editable instanceof HTMLElement ? editable.parentElement : null;
    while (current instanceof HTMLElement && current !== document.body) {
      if (
        current.classList.contains('bg-bg_screen')
        && current.classList.contains('pointer-events-auto')
        && current.querySelector('.__chat_input_textarea, [contenteditable="true"]')
        && !current.closest(`#${ID.panelRoot}, #${ID.panel}`)
      ) {
        cachedChatBackgroundComposerShell = current;
        return current;
      }
      current = current.parentElement;
    }

    const candidates = [...document.querySelectorAll('.bg-bg_screen.pointer-events-auto')].filter((element) => {
      if (!(element instanceof HTMLElement)) return false;
      if (element.closest(`#${ID.panelRoot}, #${ID.panel}, #${ID.chatBackgroundLayer}`)) return false;
      if (!element.querySelector('.__chat_input_textarea, [contenteditable="true"]')) return false;
      const rect = element.getBoundingClientRect();
      return rect.width >= 240 && rect.height >= 40 && rect.bottom >= window.innerHeight * 0.55;
    });

    cachedChatBackgroundComposerShell = candidates
      .sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom)[0] || null;
    return cachedChatBackgroundComposerShell;
  }

  function findCrackUiChatBackgroundViewport() {
    if (cachedChatBackgroundViewport?.isConnected) return cachedChatBackgroundViewport;
    cachedChatBackgroundViewport = null;

    const candidates = [...document.querySelectorAll('.stick-to-bottom')].filter((element) => {
      if (!(element instanceof HTMLElement)) return false;
      if (element.closest(
        `#${ID.panelRoot}, #${ID.panel}, #${ID.chatBackgroundLayer}, #cawf-root, #cawf-mount-box, #sgb-bg-root, ` +
        '[data-crack-ui-room-panel="1"], [data-crack-ui-chat-list-panel="1"]'
      )) return false;
      const rect = element.getBoundingClientRect();
      return rect.width >= 240 && rect.height >= 240;
    });

    let best = null;
    let bestScore = -Infinity;
    candidates.forEach((element) => {
      const cls = String(element.className || '');
      const rect = element.getBoundingClientRect();
      let score = 0;
      if (element.querySelector('[data-message-group-id]')) score += 20;
      if (cls.includes('overflow-y-scroll')) score += 4;
      if (String(element.style.height || '').includes('100%')) score += 3;
      score += Math.min(8, Math.round((rect.width * rect.height) / 180000));
      if (score > bestScore) {
        best = element;
        bestScore = score;
      }
    });

    cachedChatBackgroundViewport = best;
    return best;
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
    fontMarkdownRoots: () => findCrackUiFontMarkdownRoots(),
    fontCodeBlocks: () => findCrackUiFontCodeBlocks(),
    chatBackgroundViewport: () => findCrackUiChatBackgroundViewport(),
    chatBackgroundComposerShell: () => findCrackUiChatBackgroundComposerShell(),
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
    fontMarkdownRoots: DOM.fontMarkdownRoots,
    fontCodeBlocks: DOM.fontCodeBlocks,
    chatBackgroundViewport: DOM.chatBackgroundViewport,
    chatBackgroundComposerShell: DOM.chatBackgroundComposerShell,
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
    cachedChatBackgroundViewport = null;
    cachedChatBackgroundComposerShell = null;
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
    if (observedChatBackgroundWeatherRoot && !observedChatBackgroundWeatherRoot.isConnected) {
      refreshCrackUiWeatherRootObserver();
    }
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
          const safeRoomPanel = e.target.closest?.(`#${ID.roomMenuZone}, #${ID.roomMenuHandle}`) || roomPanel?.contains(e.target);
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
      const fontColorPopover = document.getElementById(ID.fontColorPickerPopover);
      const insideFontColorPopover = !!fontColorPopover && fontColorPopover.contains(e.target);

      // The shared font color picker is intentionally mounted beside the panel rather than
      // inside it so it can escape the panel's clipping/scroll area. Treat it as part of the
      // settings surface; otherwise the capture-phase document click generated after a desktop
      // pointer drag closes the entire settings panel before the picker's bubble handlers run.
      if (panel && !panel.contains(e.target) && !gear && !menuModePopover && !insideFontColorPopover) {
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
    window.addEventListener('resize', scheduleCrackUiViewportRefresh, { passive: true });
    window.visualViewport?.addEventListener?.('resize', scheduleCrackUiViewportRefresh, { passive: true });

    const touchViewportMedia = window.matchMedia('(max-width: 767px), (hover: none), (pointer: coarse)');
    touchViewportMedia.addEventListener?.('change', scheduleCrackUiViewportRefresh);
    window.addEventListener('pointerup', stopPanelRangeDrag);
    window.addEventListener('pointercancel', stopPanelRangeDrag);
    window.addEventListener('mouseup', stopPanelRangeDrag);
    window.addEventListener('touchend', stopPanelRangeDrag, { passive: true });
    window.addEventListener('touchcancel', stopPanelRangeDrag, { passive: true });

    window.addEventListener('pointerup', stopPanelHoldPreview);
    window.addEventListener('pointercancel', stopPanelHoldPreview);
    window.addEventListener('mouseup', stopPanelHoldPreview);
    window.addEventListener('touchend', stopPanelHoldPreview, { passive: true });
    window.addEventListener('touchcancel', stopPanelHoldPreview, { passive: true });
    const restoreCrackUiChatBackgroundAfterResume = () => {
      if (document.visibilityState === 'hidden') return;
      const fileKey = normalizeCrackUiChatBackgroundImageFileKey(chatBackgroundSettings.imageFileKey);
      const needsImage = chatBackgroundSettings.enabled === true
        && chatBackgroundSettings.imageEnabled === true
        && !!fileKey;

      if (needsImage && !chatBackgroundImageObjectUrl) {
        hydrateCrackUiChatBackgroundImage().catch((error) => {
          console.warn('[Crack UI Max] background image resume failed', error);
        });
        return;
      }
      scheduleCrackUiChatBackgroundApply();
    };

    window.addEventListener('pageshow', restoreCrackUiChatBackgroundAfterResume, { passive: true });
    document.addEventListener('visibilitychange', restoreCrackUiChatBackgroundAfterResume, { passive: true });

    window.addEventListener('pagehide', (event) => {
      flushImageSizeSave();
      flushChatWidthSave();
      persistCrackUiFontSettings();
      flushNovelModelCatalogSave();
      if (novelModelIndicator) saveNovelModelMessageCache();

      // Mobile file pickers and BFCache can temporarily hide the page. Keep the
      // Blob URL and observers alive in that case; otherwise the selected image
      // disappears when the user returns from the picker.
      if (event.persisted) return;

      chatBackgroundWeatherRootObserver?.disconnect();
      chatBackgroundCompatibilityObserver?.disconnect();
      if (chatContentRefreshTimer) clearTimeout(chatContentRefreshTimer);
      if (chatContentRefreshRaf) cancelAnimationFrame(chatContentRefreshRaf);
      if (viewportRefreshRaf) cancelAnimationFrame(viewportRefreshRaf);
      // Object URLs are released automatically with the document. Do not revoke
      // here because some mobile browsers emit pagehide during native file picking.
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
      console.error(`[Crack UI Max] ${source} failed`, error);
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
        fontSettings: { ...fontSettings },
        chatBackgroundSettings: { ...chatBackgroundSettings },
        fontNativeSnapshot: { ...crackUiFontNativeSnapshot },
        fontFeatureActive: fontSettings.masterEnabled === true,
        panelOpen,
        panelLifecycleToken: crackUiPanelLifecycleToken,
        panelRangePreviewActive: !!activePanelRangePreviewInput,
        panelHoldPreviewActive,
        fontScrollRestorePending: !!crackUiFontScrollRestoreRaf || crackUiFontScrollRestoreTimers.length > 0,
        fontBaseTextPx: crackUiFontBaseTextPx,
        fontBaseCodePx: crackUiFontBaseCodePx,
        fontBaseTextMeasured: crackUiFontBaseTextMeasured,
        fontBaseCodeMeasured: crackUiFontBaseCodeMeasured,
        fontResolvedFamily: getCrackUiFontEffectiveFamily(),
        fontBodyFamily: getCrackUiFontBodyFamily(),
        fontCodeFamily: getCrackUiFontCodeFamily(),
        fontResolveStatus,
        fontResolveLastError,
        fontResolvedFamilyCount: fontResolvedFamilies.length,
        fontQuoteRenderedCount: document.querySelectorAll('[data-crack-ui-font-quote]').length,
        fontQuoteTrackedCount: fontQuoteWraps.size,
        fontQuoteScanScheduled: !!fontQuoteScanTimer || !!fontQuoteScanRaf,
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
      if (actual !== themeMode) {
        applyThemeModeHint();
        return;
      }
    } else if (actual !== themeMode) {
      themeMode = actual;
      updateThemeUi();
    }

    // Crack has now committed the real theme to the DOM. Drop the previous native-color
    // snapshot and refresh all auto text colors without turning any custom override on.
    refreshCrackUiFontThemeDefaults();
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

  const CHAT_CONTENT_REFRESH_THROTTLE_MS = 180;

  function getCrackUiMutationElement(node) {
    if (node instanceof Element) return node;
    return node?.parentElement instanceof Element ? node.parentElement : null;
  }

  function isCrackUiOwnMutationNode(node) {
    const element = getCrackUiMutationElement(node);
    if (!element) return false;
    return !!element.closest(
      `#${ID.panelRoot}, #${ID.panel}, #${ID.panelBackdrop}, #${ID.bottomModelPopup}, ` +
      `#${ID.chatBackgroundLayer}, #${ID.novelBackdropWeatherLayer}`
    );
  }

  function isCrackUiChatContentMutation(mutation) {
    if (mutation.type !== 'childList') return false;
    if (isCrackUiOwnMutationNode(mutation.target)) return false;

    const target = getCrackUiMutationElement(mutation.target);
    if (target?.closest('main [data-message-group-id], main .wrtn-markdown')) return true;

    return [...mutation.addedNodes, ...mutation.removedNodes].some((node) => {
      const element = getCrackUiMutationElement(node);
      if (!element || isCrackUiOwnMutationNode(element)) return false;
      return element.matches?.('[data-message-group-id], .wrtn-markdown')
        || !!element.querySelector?.('[data-message-group-id], .wrtn-markdown');
    });
  }

  function mutationTouchesCrackUiWeatherRoot(mutation) {
    if (mutation.type !== 'childList') return false;
    return [...mutation.addedNodes, ...mutation.removedNodes]
      .some(isCrackUiWeatherLayerStructureNode);
  }

  function runCrackUiChatContentRefresh() {
    chatContentRefreshRaf = 0;
    chatContentRefreshLastAt = performance.now();
    if (hideSituationImage) scheduleSituationImageButtonMark();
    if (pauseAnimatedThumbs || hasRestorableAnimatedThumbs()) scheduleAnimatedThumbState();
    if (novelModelIndicator) scheduleNovelModelIndicatorScan();
  }

  function scheduleCrackUiChatContentRefresh() {
    if (chatContentRefreshTimer || chatContentRefreshRaf) return;
    const elapsed = performance.now() - chatContentRefreshLastAt;
    const delay = Math.max(0, CHAT_CONTENT_REFRESH_THROTTLE_MS - elapsed);
    chatContentRefreshTimer = setTimeout(() => {
      chatContentRefreshTimer = null;
      chatContentRefreshRaf = requestAnimationFrame(runCrackUiChatContentRefresh);
    }, delay);
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

      const weatherStructureChanged = mutations.some(mutationTouchesCrackUiWeatherRoot);
      if (weatherStructureChanged) {
        refreshCrackUiWeatherRootObserver();
        scheduleCrackUiChatBackgroundApply();
        const onlyWeatherStructureChanges = mutations.every((mutation) =>
          mutationTouchesCrackUiWeatherRoot(mutation) || isCrackUiOwnMutationNode(mutation.target)
        );
        if (onlyWeatherStructureChanges) return;
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

      const onlyOwnUiChanges = mutations.length > 0 && mutations.every((mutation) => {
        if (isCrackUiOwnMutationNode(mutation.target)) return true;
        if (mutation.type !== 'childList') return false;
        const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes];
        return changedNodes.length > 0 && changedNodes.every(isCrackUiOwnMutationNode);
      });
      if (onlyOwnUiChanges) return;

      const chatViewportReady = cachedChatBackgroundViewport?.isConnected === true;
      const onlyChatContentChanges = chatViewportReady
        && mutations.length > 0
        && mutations.every((mutation) => isCrackUiChatContentMutation(mutation));

      if (onlyChatContentChanges) {
        scheduleCrackUiChatContentRefresh();
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
    hydrateCrackUiChatBackgroundImage().catch((error) => {
      console.warn('[Crack UI Max] background image init failed', error);
    });
    runInit();
    observeThemeDomGuard();
    observeCrackUiFontQuoteMutations();
    observeCrackUiChatBackgroundCompatibility();
    observe();
  });
})();

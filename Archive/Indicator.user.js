// ==UserScript==
// @name         Crack Indicator
// @namespace    https://github.com/Dflashh/Crack
// @version      1.0.8
// @description  Crack chat indicator UI with API-derived per-message turns and persistent per-message cost stats
// @match        *://crack.wrtn.ai/*
// @author       깡통들과 나
// @icon         https://cdn.jsdelivr.net/gh/Dflashh/Crack@main/Icon/Indicator.webp
// @downloadURL  https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/Indicator.user.js
// @updateURL    https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/Indicator.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';

  const ROOT_ID = 'crack-indicator-root';
  const STYLE_ID = 'crack-indicator-style';
  const MESSAGE_SELECTOR = 'div[data-message-group-id]';
  const CHAT_INDICATOR_CLASS = 'crack-indicator-chat-stats';
  const MESSAGE_STATS_STORAGE_PREFIX = 'crack-indicator-message-stats-v1:';
  const LEGACY_MESSAGE_COST_SESSION_PREFIX = 'crack-indicator-message-costs-v1:';
  const ROOM_TURN_STORAGE_PREFIX = 'crack-indicator-room-turn-v1:';
  const SETTINGS_NS = 'crack-indicator';
  const SETTINGS_OVERLAY_ID = 'crack-indicator-settings-overlay';
  const SETTING_KEYS = {
    showTurn: `${SETTINGS_NS}:showTurn`,
    showRemainCracker: `${SETTINGS_NS}:showRemainCracker`,
    showDiffCracker: `${SETTINGS_NS}:showDiffCracker`,
    placement: `${SETTINGS_NS}:placement`,
  };
  const DEFAULT_SETTINGS = {
    showTurn: true,
    showRemainCracker: true,
    showDiffCracker: true,
    placement: 'composer',
  };
  const CRACK_STATS_API = {
    balance: 'https://crack-api.wrtn.ai/crack-cash/crackers',
    rawMessages: 'https://contents-api.wrtn.ai/character-chat/v3/chats',
  };
  const TURN_REFRESH_DELAY_MS = 400;
  const TURN_CACHE_MS = 5000;
  const BALANCE_CACHE_MS = 2500;
  const BALANCE_POLL_CHECKPOINTS_MS = [300, 700, 1400, 2500, 4500, 7500, 12000];
  const PENDING_COST_MAX_AGE_MS = 2 * 60 * 1000;


  const CRACKER_PATH = "M21.17 12.01c.52-.59.83-1.36.83-2.21s-.31-1.62-.83-2.21l.17-.21q0-.01.02-.02l.14-.21q0-.02.03-.05.06-.1.1-.2l.05-.08.09-.2q.01-.05.04-.11l.06-.18q0-.08.04-.14.01-.07.04-.16l.03-.19q0-.06.02-.13v-.33a3.37 3.37 0 0 0-3.36-3.37l-.33.01q-.06 0-.12.02-.1 0-.2.03-.07 0-.15.04l-.14.04-.18.06-.11.04-.2.09-.07.04-.2.11q-.03 0-.05.03l-.21.14-.02.02-.21.17a3.4 3.4 0 0 0-4.42 0 3.3 3.3 0 0 0-2.21-.83c-.85 0-1.62.31-2.21.83l-.21-.17-.02-.02-.21-.14q-.02 0-.05-.03l-.2-.11-.08-.04-.2-.09-.11-.04-.18-.06-.14-.04-.16-.04-.2-.03-.12-.02-.33-.01a3.37 3.37 0 0 0-3.34 3.82q0 .1.03.19 0 .07.04.16 0 .08.04.14l.06.18q0 .05.04.11.03.1.09.19l.04.08.1.2q.01.02.04.05l.16.23q.07.1.17.21a3.3 3.3 0 0 0-.83 2.21c0 .85.3 1.62.83 2.21a3.3 3.3 0 0 0-.83 2.21c0 .85.3 1.62.83 2.21l-.17.21-.02.02-.14.21q0 .02-.03.05l-.11.2-.04.08-.1.2-.03.11-.06.18-.04.14-.04.16-.03.19-.02.13-.01.33A3.4 3.4 0 0 0 3.02 21c.6.61 1.45.99 2.38.99l.33-.01q.06 0 .12-.02.1 0 .19-.03.07 0 .16-.04l.14-.04.18-.06.1-.04.2-.09.08-.04.2-.11q.03 0 .05-.03l.2-.14.03-.02.2-.17a3.4 3.4 0 0 0 4.43 0 3.32 3.32 0 0 0 4.42 0 3 3 0 0 0 .44.33q.03 0 .05.03l.2.11.08.04.2.09.10.04.19.06.14.04.16.04.19.03.13.02.33.01c.92 0 1.75-.37 2.36-.97l.02-.02c.6-.61.99-1.45.99-2.38l-.01-.33q0-.06-.02-.12 0-.1-.03-.19 0-.07-.04-.16l-.04-.14-.06-.18-.04-.11-.1-.19-.03-.08-.11-.2q0-.02-.03-.05l-.14-.21-.02-.02-.17-.21c.52-.59.83-1.36.83-2.21s-.31-1.62-.83-2.21M7.5 13.5 6 12l1.5-1.5L9 12zM12 6l1.5 1.5L12 9l-1.5-1.5zm0 12-1.5-1.5L12 15l1.5 1.5zm4.5-4.5L15 12l1.5-1.5L18 12z";

  const stats = [
    { key: 'turn', label: '턴 수', value: '-', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5L13.8 10.2L20.5 12L13.8 13.8L12 20.5L10.2 13.8L3.5 12L10.2 10.2L12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>' },
    { key: 'remainCracker', label: '보유 크래커', value: '-', icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ci-cracker-icon"><path fill="currentColor" d="${CRACKER_PATH}"></path></svg>` },
    { key: 'diffCracker', label: '차감 크래커', value: '-', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 18.5L5.5 8.5H18.5L12 18.5Z" fill="currentColor"/></svg>' },
  ];

  let rafId = 0;
  let mountTimerId = 0;
  let lastMountAt = 0;
  let turnTimerId = 0;
  let turnTimerForce = false;
  let turnTimerDueAt = 0;
  let isReadingTurn = false;
  let lastTurnSignature = '';
  let lastRemainCrackerSignature = '';
  let activeGeneration = null;
  let lastTurnFetchAt = 0;
  let lastTurnInfoCache = null;
  let lastBalanceFetchAt = 0;
  let lastBalanceCache = null;
  let lastObservedBalance = null;
  let activeChatId = null;
  let lastRoomDeductedAmount = null;
  let pendingMessageCost = null;
  let lastGenerationStartedAt = 0;
  let lastGenerationChatId = null;
  const MOUNT_THROTTLE_MS = 120;

  function normalizePlacement(value) {
    return value === 'chat' ? 'chat' : 'composer';
  }

  function getSetting(name) {
    const key = SETTING_KEYS[name];
    const fallback = DEFAULT_SETTINGS[name];

    try {
      if (typeof GM_getValue === 'function') {
        const value = GM_getValue(key, undefined);
        if (typeof value !== 'undefined') {
          return name === 'placement' ? normalizePlacement(value) : value !== false;
        }
      }
    } catch {}

    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        return name === 'placement' ? normalizePlacement(value) : value !== 'false';
      }
    } catch {}

    return fallback;
  }

  function setSetting(name, value) {
    const key = SETTING_KEYS[name];
    const next = name === 'placement' ? normalizePlacement(value) : Boolean(value);

    try {
      if (typeof GM_setValue === 'function') GM_setValue(key, next);
    } catch {}

    try {
      localStorage.setItem(key, String(next));
    } catch {}
  }

  function closeSettingsDialog() {
    document.getElementById(SETTINGS_OVERLAY_ID)?.remove();
  }

  function openSettingsDialog() {
    injectStyle();
    closeSettingsDialog();

    const overlay = document.createElement('div');
    overlay.id = SETTINGS_OVERLAY_ID;
    overlay.innerHTML = `
      <div class="ci-settings-panel" role="dialog" aria-modal="true" aria-label="Crack Indicator 설정">
        <div class="ci-settings-head">
          <strong>Crack Indicator 설정</strong>
          <button type="button" class="ci-settings-close" aria-label="닫기">×</button>
        </div>

        <div class="ci-settings-section-title">표시 항목</div>
        <label class="ci-settings-check"><input type="checkbox" data-ci-setting="showTurn"><span>턴 수</span></label>
        <label class="ci-settings-check"><input type="checkbox" data-ci-setting="showRemainCracker"><span>보유 크래커</span></label>
        <label class="ci-settings-check"><input type="checkbox" data-ci-setting="showDiffCracker"><span>차감 크래커</span></label>

        <div class="ci-settings-section-title ci-settings-location-title">위치</div>
        <label class="ci-settings-radio"><input type="radio" name="ci-placement" value="composer"><span>입력창</span></label>
        <label class="ci-settings-radio"><input type="radio" name="ci-placement" value="chat"><span>채팅창</span></label>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('input[data-ci-setting]').forEach((input) => {
      const name = input.dataset.ciSetting;
      input.checked = getSetting(name);
      input.addEventListener('change', () => {
        setSetting(name, input.checked);
        render();
        scheduleMount(true);
      });
    });

    const placement = getSetting('placement');
    overlay.querySelectorAll('input[name="ci-placement"]').forEach((input) => {
      input.checked = input.value === placement;
      input.addEventListener('change', () => {
        if (!input.checked) return;
        setSetting('placement', input.value);
        scheduleMount(true);
      });
    });

    overlay.querySelector('.ci-settings-close')?.addEventListener('click', closeSettingsDialog);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeSettingsDialog();
    });

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      document.removeEventListener('keydown', onKeyDown, true);
      closeSettingsDialog();
    };
    document.addEventListener('keydown', onKeyDown, true);
  }

  function registerMenuCommands() {
    if (typeof GM_registerMenuCommand !== 'function') return;
    GM_registerMenuCommand('Crack Indicator 설정', openSettingsDialog);
  }

  function statSettingName(key) {
    if (key === 'turn') return 'showTurn';
    if (key === 'remainCracker') return 'showRemainCracker';
    if (key === 'diffCracker') return 'showDiffCracker';
    return null;
  }

  function isStatVisible(stat) {
    const settingName = statSettingName(stat?.key);
    return !settingName || getSetting(settingName);
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID} {
        position: relative;
        z-index: 0;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        height: 20px;
        margin: 0;
        flex: 0 0 auto;
        overflow: hidden;
        pointer-events: none;
      }

      [data-ci-composer-box="1"] {
        overflow: hidden;
      }

      #${ROOT_ID} * {
        box-sizing: border-box;
        font-family:
          -apple-system,
          BlinkMacSystemFont,
          "SF Pro Text",
          "Pretendard",
          "Apple SD Gothic Neo",
          system-ui,
          sans-serif;
      }

      .ci-bar {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: var(--ci-bg);
        backdrop-filter: blur(18px) saturate(180%);
        -webkit-backdrop-filter: blur(18px) saturate(180%);
        color: var(--ci-text);
      }

      .ci-list {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        padding: 0 6px;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
      }

      .ci-list::-webkit-scrollbar {
        display: none;
      }

      .ci-item {
        height: 100%;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        gap: 4px;
        padding: 0 7px;
        border: 0;
        border-radius: 0;
        color: var(--ci-text);
        background: transparent;
        white-space: nowrap;
        user-select: none;
        pointer-events: auto;
      }

      .ci-item + .ci-item::before {
        content: "|";
        margin: 0 7px 0 0;
        color: var(--ci-muted);
        opacity: 0.45;
        font-size: 10px;
        font-weight: 500;
        line-height: 1;
      }

      .ci-icon {
        width: 12px;
        height: 12px;
        min-width: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        line-height: 1;
        font-weight: 800;
        color: var(--ci-accent);
        flex-shrink: 0;
      }

      .ci-icon svg {
        width: 100%;
        height: 100%;
        display: block;
        overflow: visible;
      }

      .ci-item[data-ci-key="diffCracker"] .ci-icon {
        transform: translateY(-1px);
      }

      .ci-icon .ci-cracker-icon {
        width: 13px;
        height: 13px;
      }

      .ci-value {
        min-width: 8px;
        height: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        line-height: 1;
        font-weight: 750;
        color: var(--ci-text);
        letter-spacing: -0.035em;
        text-align: center;
      }

      @media (max-width: 520px) {
        #${ROOT_ID},
        .ci-bar {
          height: 18px;
        }

        .ci-list {
          padding: 0 3px;
        }

        .ci-item {
          height: 100%;
          gap: 3px;
          padding: 0 5px;
        }

        .ci-item + .ci-item::before {
          margin-right: 5px;
          font-size: 9px;
        }

        .ci-icon {
          width: 11px;
          height: 11px;
          min-width: 11px;
          font-size: 9px;
        }

        .ci-icon .ci-cracker-icon {
          width: 12px;
          height: 12px;
        }

        .ci-value {
          height: 100%;
          line-height: 1;
          font-size: 9px;
          min-width: 7px;
        }
      }

      .${CHAT_INDICATOR_CLASS} {
        width: fit-content;
        max-width: none;
        height: 24px;
        overflow: visible;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        color: hsl(var(--line-gray-2));
        pointer-events: none;
      }

      .${CHAT_INDICATOR_CLASS} .ci-bar {
        width: fit-content;
        max-width: none;
        height: 24px;
        overflow: visible;
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        color: hsl(var(--line-gray-2));
      }

      .${CHAT_INDICATOR_CLASS} .ci-list {
        width: fit-content;
        max-width: none;
        overflow: visible;
        padding: 0;
      }

      .${CHAT_INDICATOR_CLASS} .ci-item {
        height: 24px;
        padding: 0;
        gap: 3px;
        color: currentColor;
      }

      .${CHAT_INDICATOR_CLASS} .ci-item:first-child {
        padding-left: 0;
      }

      .${CHAT_INDICATOR_CLASS} .ci-item:last-child {
        padding-right: 0;
      }

      /* 채팅창 안에서는 글자수·시간 배지처럼 가운데점( · )으로 자연스럽게 구분한다. */
      .${CHAT_INDICATOR_CLASS} .ci-item + .ci-item::before {
        content: "·";
        margin: 0 2px 0 5px;
        color: currentColor;
        opacity: .72;
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
      }

      .${CHAT_INDICATOR_CLASS} .ci-icon,
      .${CHAT_INDICATOR_CLASS} .ci-value {
        color: inherit;
      }

      .${CHAT_INDICATOR_CLASS} .ci-icon {
        width: 13px;
        height: 13px;
        min-width: 13px;
      }

      .${CHAT_INDICATOR_CLASS} .ci-value {
        height: 24px;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: inherit;
      }

      #${SETTINGS_OVERLAY_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px;
        background: rgba(0, 0, 0, .28);
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
      }

      #${SETTINGS_OVERLAY_ID} .ci-settings-panel {
        width: min(320px, calc(100vw - 32px));
        padding: 12px;
        border: 1px solid var(--ci-chip-border);
        border-radius: 14px;
        background: var(--ci-settings-bg);
        color: var(--ci-text);
        box-shadow: 0 16px 48px rgba(0, 0, 0, .22);
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Pretendard", "Apple SD Gothic Neo", system-ui, sans-serif;
      }

      #${SETTINGS_OVERLAY_ID} .ci-settings-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 30px;
        padding: 0 2px 6px 6px;
        font-size: 13px;
      }

      #${SETTINGS_OVERLAY_ID} .ci-settings-close {
        width: 28px;
        height: 28px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: var(--ci-muted);
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
      }

      #${SETTINGS_OVERLAY_ID} .ci-settings-close:hover {
        background: var(--ci-settings-hover);
        color: var(--ci-text);
      }

      #${SETTINGS_OVERLAY_ID} .ci-settings-section-title {
        padding: 8px 7px 5px;
        color: var(--ci-muted);
        font-size: 11px;
        font-weight: 700;
      }

      #${SETTINGS_OVERLAY_ID} .ci-settings-location-title {
        margin-top: 3px;
      }

      #${SETTINGS_OVERLAY_ID} .ci-settings-check,
      #${SETTINGS_OVERLAY_ID} .ci-settings-radio {
        min-height: 34px;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 0 8px;
        border-radius: 9px;
        cursor: pointer;
        font-size: 13px;
        user-select: none;
      }

      #${SETTINGS_OVERLAY_ID} .ci-settings-check:hover,
      #${SETTINGS_OVERLAY_ID} .ci-settings-radio:hover {
        background: var(--ci-settings-hover);
      }

      #${SETTINGS_OVERLAY_ID} input {
        width: 15px;
        height: 15px;
        margin: 0;
        accent-color: #FE4532;
      }

      :root {
        --ci-bg: rgba(248, 248, 248, 0.74);
        --ci-text: rgba(17, 24, 39, 0.92);
        --ci-muted: rgba(75, 85, 99, 0.72);
        --ci-chip: rgba(255, 255, 255, 0.66);
        --ci-chip-border: rgba(0, 0, 0, 0.075);
        --ci-accent: #FE4532;
        --ci-settings-bg: rgba(255, 255, 255, .96);
        --ci-settings-hover: rgba(0, 0, 0, .055);
      }

      html.dark,
      html[data-theme="dark"],
      html[data-crack-ui-theme-mode="dark"] {
        --ci-bg: rgba(30, 30, 34, 0.82);
        --ci-text: rgba(255, 255, 255, 0.92);
        --ci-muted: rgba(235, 235, 245, 0.62);
        --ci-chip: rgba(255, 255, 255, 0.13);
        --ci-chip-border: rgba(255, 255, 255, 0.12);
        --ci-accent: #FE4532;
        --ci-settings-bg: rgba(38, 38, 42, .97);
        --ci-settings-hover: rgba(255, 255, 255, .08);
      }
    `;

    document.head.appendChild(style);
  }

  function findComposerInput() {
    const candidates = [
      ...document.querySelectorAll(
        'div.__chat_input_textarea[contenteditable="true"], div.ProseMirror[contenteditable="true"], textarea[placeholder*="메시지"]'
      ),
    ];

    return candidates.find((el) => {
      if (!el || !el.isConnected) return false;
      if (el.closest('[role="dialog"], [data-radix-popper-content-wrapper]')) return false;
      if (el.dataset?.loreRefinerMessageId) return false;

      const rect = el.getBoundingClientRect();
      return rect.width > 120 && rect.top > window.innerHeight * 0.35;
    }) || null;
  }

  function findComposerBox(input) {
    if (!input) return null;

    return (
      input.closest('div.flex.w-full.flex-col.rounded-lg.border') ||
      input.closest('div.rounded-lg.border.bg-background') ||
      input.closest('div[class*="rounded-lg"][class*="border"]')
    );
  }

  function isComposerInputTarget(target) {
    const input = findComposerInput();
    return Boolean(input && (target === input || input.contains?.(target)));
  }

  function mountToComposer(root) {
    const input = findComposerInput();
    const composerBox = findComposerBox(input);

    if (!input || !composerBox) return false;

    document.querySelectorAll('[data-ci-composer-box="1"]').forEach((box) => {
      if (box !== composerBox) {
        delete box.dataset.ciComposerBox;
      }
    });

    composerBox.dataset.ciComposerBox = '1';
    setStat(
      'diffCracker',
      Number.isFinite(lastRoomDeductedAmount) && lastRoomDeductedAmount > 0
        ? lastRoomDeductedAmount.toLocaleString('en-US')
        : '-'
    );
    renderList(root);

    const firstChild = composerBox.firstElementChild;
    if (root.parentElement !== composerBox || firstChild !== root) {
      composerBox.insertBefore(root, firstChild || null);
    }

    return true;
  }

  function ensureRootMarkup(root) {
    if (!root) return;

    if (!root.querySelector('.ci-bar')) {
      root.innerHTML = '<div class="ci-bar"><div class="ci-list"></div></div>';
    }
  }

  function createRoot() {
    const root = document.createElement('div');
    root.id = ROOT_ID;
    ensureRootMarkup(root);
    render(root);
    return root;
  }

  function getRoot() {
    const root = document.getElementById(ROOT_ID) || createRoot();
    ensureRootMarkup(root);
    return root;
  }

  function getListSignature() {
    return stats
      .filter(isStatVisible)
      .map((stat) => `${stat.key}:${stat.value}`)
      .join('|') || '__hidden__';
  }

  function renderList(root) {
    if (!root) return;

    const list = root.querySelector('.ci-list');
    if (!list) return;

    const signature = getListSignature();
    if (list.dataset.ciSignature === signature) return;

    const visibleStats = stats.filter(isStatVisible);
    list.dataset.ciSignature = signature;
    list.innerHTML = '';
    root.style.display = visibleStats.length ? '' : 'none';

    visibleStats.forEach((stat) => {
      const item = document.createElement('div');
      item.className = 'ci-item';
      item.dataset.ciKey = stat.key;
      item.title = stat.label;
      item.setAttribute('aria-label', `${stat.label} ${stat.value}`);
      item.innerHTML = `
        <span class="ci-icon">${stat.icon}</span>
        <span class="ci-value">${stat.value}</span>
      `;
      list.appendChild(item);
    });
  }

  function render(root = document.getElementById(ROOT_ID)) {
    if (getSetting('placement') === 'chat') {
      if (root) root.style.display = 'none';
      renderChatIndicators();
      return;
    }

    removeAllChatIndicators();
    if (!root) return;
    renderList(root);
  }

  function setStat(key, value) {
    const stat = stats.find((item) => item.key === key);
    if (!stat) return;

    const nextValue = value == null || value === '' ? '-' : String(value);
    if (stat.value === nextValue) return;

    stat.value = nextValue;
    render();
  }

  function setStats(nextStats = {}) {
    let changed = false;

    for (const [key, value] of Object.entries(nextStats)) {
      const stat = stats.find((item) => item.key === key);
      if (!stat) continue;

      const nextValue = value == null || value === '' ? '-' : String(value);
      if (stat.value === nextValue) continue;

      stat.value = nextValue;
      changed = true;
    }

    if (changed) render();
  }

  function getMessageGroupId(group) {
    return String(group?.getAttribute?.('data-message-group-id') || '').trim();
  }

  function findModelIndicator(group) {
    if (!group) return null;

    return group.querySelector(
      'button[data-crack-ui-novel-model-name], button.crack-ui-novel-model-indicator'
    );
  }

  function isRerollLikeButton(button) {
    if (!button) return false;
    if (button.dataset?.cleanRerollHooked === '1') return true;
    if (button.classList?.contains('cr-clean-reroll-btn')) return true;

    const text = String(button.textContent || '').replace(/\s+/g, ' ').trim();
    if (/답변\s*비교\s*\d+\s*\/\s*\d+/.test(text)) return true;

    const html = button.innerHTML || '';
    return (
      html.includes('M3.8 12a8.2') ||
      html.includes('M3.8 12') ||
      html.includes('A9.8 9.8') ||
      html.includes('A8.21 8.21')
    );
  }

  function findChatIndicatorHost(group) {
    if (!group) return null;

    // 소설형: 모델 버튼이 있는 왼쪽 flex 줄을 그대로 사용한다.
    const modelButton = findModelIndicator(group);
    if (modelButton) {
      const leftRow = modelButton.parentElement?.classList?.contains('flex')
        ? modelButton.parentElement
        : modelButton.closest('div.flex.items-center');

      if (leftRow) return leftRow;
    }

    // 채팅형: 같은 하단 메타 툴바의 왼쪽 줄은 비어 있을 수 있다.
    // 오른쪽에 리롤/메시지 옵션이 있는 assistant 툴바를 찾아 빈 왼쪽 줄에 append한다.
    const toolbarRows = [...group.querySelectorAll('div.flex.items-center.justify-between.mt-2')];

    for (const toolbar of toolbarRows) {
      const children = [...toolbar.children];
      const leftRow = children.find((child) =>
        child?.matches?.('div.flex.items-center.space-x-3')
      ) || children.find((child) =>
        child?.classList?.contains('flex') &&
        child?.classList?.contains('items-center') &&
        !child?.classList?.contains('flex-row')
      );

      const rightRow = children.find((child) =>
        child?.matches?.('div.flex.flex-row.items-center')
      ) || children.find((child) =>
        child?.classList?.contains('flex') &&
        child?.classList?.contains('flex-row') &&
        child?.classList?.contains('items-center')
      );

      if (!leftRow || !rightRow) continue;

      const hasReroll = [...rightRow.querySelectorAll('button')].some(isRerollLikeButton);
      const hasAssistantBadge = Boolean(rightRow.querySelector('[data-role="assistant"]'));
      const hasMessageOptions = Boolean(rightRow.querySelector('button[aria-label="메시지 옵션"]'));

      if (hasReroll || hasAssistantBadge || (hasMessageOptions && modelButton)) {
        return leftRow;
      }
    }

    return null;
  }

  function messageStatsStorageKey(chatId) {
    return `${MESSAGE_STATS_STORAGE_PREFIX}${chatId || 'unknown'}`;
  }

  function legacyMessageCostStorageKey(chatId) {
    return `${LEGACY_MESSAGE_COST_SESSION_PREFIX}${chatId || 'unknown'}`;
  }

  function normalizeMessageStatsRecord(record) {
    if (record && typeof record === 'object' && !Array.isArray(record)) {
      const cost = Number(record.cost);
      const turn = Number(record.turn);
      return {
        ...(Number.isFinite(cost) && cost > 0 ? { cost: Math.round(cost) } : {}),
        ...(Number.isFinite(turn) && turn >= 0 ? { turn: Math.round(turn) } : {}),
      };
    }

    // v0.1.54 sessionStorage 포맷은 messageId -> cost 숫자였다.
    const legacyCost = Number(record);
    return Number.isFinite(legacyCost) && legacyCost > 0
      ? { cost: Math.round(legacyCost) }
      : {};
  }

  function normalizeMessageStatsMap(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

    const normalized = {};
    for (const [messageId, record] of Object.entries(value)) {
      if (!messageId) continue;
      const next = normalizeMessageStatsRecord(record);
      if (Object.keys(next).length) normalized[messageId] = next;
    }
    return normalized;
  }

  function loadMessageStatsMap(chatId = getCurrentChatIdFromUrl()) {
    if (!chatId) return {};

    try {
      const parsed = JSON.parse(localStorage.getItem(messageStatsStorageKey(chatId)) || '{}');
      const normalized = normalizeMessageStatsMap(parsed);
      if (Object.keys(normalized).length) return normalized;
    } catch {}

    // 바로 전 버전에서 같은 탭에 잡힌 차감값은 최초 1회 localStorage로 승격한다.
    try {
      const legacy = JSON.parse(sessionStorage.getItem(legacyMessageCostStorageKey(chatId)) || '{}');
      const migrated = normalizeMessageStatsMap(legacy);
      if (Object.keys(migrated).length) {
        localStorage.setItem(messageStatsStorageKey(chatId), JSON.stringify(migrated));
        return migrated;
      }
    } catch {}

    return {};
  }

  function saveMessageStatsMap(chatId, map) {
    if (!chatId) return false;
    try {
      const key = messageStatsStorageKey(chatId);
      const serialized = JSON.stringify(map);
      if (localStorage.getItem(key) === serialized) return false;
      localStorage.setItem(key, serialized);
      return true;
    } catch {
      return false;
    }
  }

  function saveMessageCost(chatId, messageId, amount) {
    const value = Number(amount);
    if (!chatId || !messageId || !Number.isFinite(value) || value <= 0) return false;

    const map = loadMessageStatsMap(chatId);
    const record = normalizeMessageStatsRecord(map[messageId]);
    const normalizedCost = Math.max(0, Math.round(value));
    if (record.cost === normalizedCost) return false;
    record.cost = normalizedCost;
    map[messageId] = record;
    return saveMessageStatsMap(chatId, map);
  }

  function saveMessageTurn(chatId, messageId, turn) {
    const value = Number(turn);
    if (!chatId || !messageId || !Number.isFinite(value) || value < 0) return false;

    const map = loadMessageStatsMap(chatId);
    const record = normalizeMessageStatsRecord(map[messageId]);
    const normalizedTurn = Math.max(0, Math.round(value));
    if (record.turn === normalizedTurn) return false;
    record.turn = normalizedTurn;
    map[messageId] = record;
    return saveMessageStatsMap(chatId, map);
  }

  function mergeMessageTurns(chatId, messageTurns) {
    if (!chatId || !messageTurns || typeof messageTurns !== 'object') return false;

    const map = loadMessageStatsMap(chatId);
    let changed = false;

    for (const [messageId, rawTurn] of Object.entries(messageTurns)) {
      const turn = Number(rawTurn);
      if (!messageId || !Number.isFinite(turn) || turn < 0) continue;

      const normalizedTurn = Math.max(0, Math.round(turn));
      const record = normalizeMessageStatsRecord(map[messageId]);
      if (record.turn === normalizedTurn) continue;

      record.turn = normalizedTurn;
      map[messageId] = record;
      changed = true;
    }

    if (!changed) return false;
    const saved = saveMessageStatsMap(chatId, map);
    if (saved) scheduleMount(true);
    return saved;
  }

  function roomTurnStorageKey(chatId) {
    return `${ROOM_TURN_STORAGE_PREFIX}${chatId || 'unknown'}`;
  }

  function loadStoredRoomTurn(chatId = getCurrentChatIdFromUrl()) {
    if (!chatId) return null;
    try {
      const value = Number(localStorage.getItem(roomTurnStorageKey(chatId)));
      return Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
    } catch {
      return null;
    }
  }

  function saveStoredRoomTurn(chatId, turn) {
    const value = Number(turn);
    if (!chatId || !Number.isFinite(value) || value < 0) return false;
    try {
      const key = roomTurnStorageKey(chatId);
      const normalized = String(Math.round(value));
      if (localStorage.getItem(key) === normalized) return false;
      localStorage.setItem(key, normalized);
      return true;
    } catch {
      return false;
    }
  }

  function saveTurnToLatestAssistant(chatId, turn) {
    const value = Number(turn);
    if (!chatId || !Number.isFinite(value) || value < 0) return false;

    const group = findNewestAssistantGroup();
    const messageId = getMessageGroupId(group);
    if (!group || !messageId) return false;

    const saved = saveMessageTurn(chatId, messageId, value);
    if (saved) scheduleMount(true);
    return saved;
  }

  function removeAllChatIndicators() {
    document.querySelectorAll(`.${CHAT_INDICATOR_CLASS}`).forEach((el) => el.remove());
  }

  function renderChatIndicators() {
    if (getSetting('placement') !== 'chat') {
      removeAllChatIndicators();
      return;
    }

    const chatId = getCurrentChatIdFromUrl();
    if (!chatId) {
      removeAllChatIndicators();
      return;
    }

    const visibleStats = stats.filter(isStatVisible);
    const messageStats = loadMessageStatsMap(chatId);
    const liveGroups = new Set();

    document.querySelectorAll(MESSAGE_SELECTOR).forEach((group) => {
      const row = findChatIndicatorHost(group);
      const messageId = getMessageGroupId(group);
      const liveCost = Number(group.dataset?.ciLiveDiffCracker);
      if (!row || (!messageId && !(Number.isFinite(liveCost) && liveCost > 0))) return;

      liveGroups.add(group);

      let indicator = group.querySelector(`.${CHAT_INDICATOR_CLASS}`);
      if (!visibleStats.length) {
        indicator?.remove();
        return;
      }

      if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = CHAT_INDICATOR_CLASS;
        indicator.innerHTML = '<span class="ci-list"></span>';
        // 기존 확프 요소 뒤에 append만 해서 순서 싸움을 하지 않는다.
        row.appendChild(indicator);
      } else if (indicator.parentElement !== row) {
        row.appendChild(indicator);
      }

      const list = indicator.querySelector('.ci-list');
      const messageRecord = messageId
        ? normalizeMessageStatsRecord(messageStats[messageId])
        : normalizeMessageStatsRecord(null);
      const storedCost = Number(messageRecord.cost);
      const cost = Number.isFinite(liveCost) && liveCost > 0 ? liveCost : storedCost;
      const savedTurn = Number(messageRecord.turn);
      const signature = visibleStats.map((stat) => {
        let value = stat.value;
        if (stat.key === 'diffCracker') {
          value = Number.isFinite(cost) && cost > 0
            ? Math.round(cost).toLocaleString('en-US')
            : '-';
        } else if (stat.key === 'turn') {
          value = Number.isFinite(savedTurn) && savedTurn >= 0
            ? String(Math.round(savedTurn))
            : '-';
        }
        return `${stat.key}:${value}`;
      }).join('|');

      if (list.dataset.ciSignature === signature) return;
      list.dataset.ciSignature = signature;
      list.innerHTML = '';

      visibleStats.forEach((stat) => {
        let value = stat.value;
        if (stat.key === 'diffCracker') {
          value = Number.isFinite(cost) && cost > 0
            ? Math.round(cost).toLocaleString('en-US')
            : '-';
        } else if (stat.key === 'turn') {
          value = Number.isFinite(savedTurn) && savedTurn >= 0
            ? String(Math.round(savedTurn))
            : '-';
        }

        const item = document.createElement('span');
        item.className = 'ci-item';
        item.dataset.ciKey = stat.key;
        item.title = stat.key === 'diffCracker'
          ? '이 응답의 차감 크래커'
          : (stat.key === 'turn' ? '이 응답 당시 턴 수' : stat.label);
        item.innerHTML = `
          <span class="ci-icon">${stat.icon}</span>
          <span class="ci-value">${value}</span>
        `;
        list.appendChild(item);
      });
    });

    document.querySelectorAll(`.${CHAT_INDICATOR_CLASS}`).forEach((indicator) => {
      const group = indicator.closest(MESSAGE_SELECTOR);
      if (!group || !liveGroups.has(group)) indicator.remove();
    });
  }

  function captureMessageGroupIds() {
    return new Set(
      [...document.querySelectorAll(MESSAGE_SELECTOR)]
        .map(getMessageGroupId)
        .filter(Boolean)
    );
  }

  function captureAssistantGroups() {
    return new Set(
      [...document.querySelectorAll(MESSAGE_SELECTOR)]
        .filter((group) => findChatIndicatorHost(group))
    );
  }

  function findNewestAssistantGroup(excludedIds = null, excludedGroups = null) {
    const groups = [...document.querySelectorAll(MESSAGE_SELECTOR)]
      .filter((group) => findChatIndicatorHost(group));

    if (excludedGroups) {
      const freshByElement = groups.filter((group) => !excludedGroups.has(group));
      if (freshByElement.length) return freshByElement[freshByElement.length - 1];
    }

    if (excludedIds) {
      const freshById = groups.filter((group) => {
        const id = getMessageGroupId(group);
        return id && !excludedIds.has(id);
      });
      if (freshById.length) return freshById[freshById.length - 1];
    }

    if (excludedGroups || excludedIds) return null;
    return groups.length ? groups[groups.length - 1] : null;
  }

  function clearLiveMessageCost(group) {
    if (!group?.dataset) return;
    delete group.dataset.ciLiveDiffCracker;
    delete group.dataset.ciLiveDiffSavedMessageId;
  }

  function persistLiveMessageCost(group, chatId = getCurrentChatIdFromUrl()) {
    if (!group?.dataset || !chatId) return false;

    const amount = Number(group.dataset.ciLiveDiffCracker);
    const messageId = getMessageGroupId(group);
    if (!messageId || !Number.isFinite(amount) || amount <= 0) return false;

    // 스트리밍 중 data-message-group-id가 바뀔 수 있으므로 같은 DOM에 붙어 있는
    // live 차감값을 새 messageId가 보일 때마다 다시 영구 저장한다.
    if (group.dataset.ciLiveDiffSavedMessageId === messageId) return true;

    saveMessageCost(chatId, messageId, amount);
    group.dataset.ciLiveDiffSavedMessageId = messageId;
    return true;
  }

  function persistVisibleLiveMessageCosts() {
    const chatId = getCurrentChatIdFromUrl();
    if (!chatId) return;

    document.querySelectorAll(MESSAGE_SELECTOR).forEach((group) => {
      const amount = Number(group.dataset?.ciLiveDiffCracker);
      if (!Number.isFinite(amount) || amount <= 0) return;
      persistLiveMessageCost(group, chatId);
    });
  }

  function clearPendingMessageCost() {
    if (pendingMessageCost?.liveGroup) {
      clearLiveMessageCost(pendingMessageCost.liveGroup);
    }
    pendingMessageCost = null;
  }

  function tryAttachPendingMessageCost(allowReuseFallback = false) {
    const pending = pendingMessageCost;
    if (!pending) return false;

    if (
      getCurrentChatIdFromUrl() !== pending.chatId ||
      Date.now() - pending.queuedAt > PENDING_COST_MAX_AGE_MS
    ) {
      clearPendingMessageCost();
      return false;
    }

    // 일반 생성은 시작 당시 없던 새 assistant DOM을 우선한다.
    // element 자체를 비교하므로 messageId가 아직 확정되기 전 스트리밍 DOM에도 즉시 표시할 수 있다.
    let group = findNewestAssistantGroup(
      pending.messageGroupIdsAtStart,
      pending.assistantGroupsAtStart
    );

    // 리롤처럼 같은 DOM을 재사용하는 경우에만 완료 신호에서 최신 assistant 줄을 재사용한다.
    if (!group && allowReuseFallback) {
      group = findNewestAssistantGroup();
    }

    if (!group) return false;

    if (pending.liveGroup && pending.liveGroup !== group) {
      clearLiveMessageCost(pending.liveGroup);
    }

    pending.liveGroup = group;
    group.dataset.ciLiveDiffCracker = String(pending.amount);
    scheduleMount(true);

    const messageId = getMessageGroupId(group);
    if (!messageId) {
      // 표시값은 DOM에 그대로 유지한다. messageId가 붙는 순간 observer가 같은 156을 저장한다.
      return true;
    }

    // 저장 뒤에도 live 값을 지우지 않는다. 스트리밍 중 group id가 바뀌어도
    // 화면의 값은 계속 156이고, observer가 새 id에 다시 저장한다.
    persistLiveMessageCost(group, pending.chatId);
    pending.liveGroup = null;
    pendingMessageCost = null;
    scheduleMount(true);
    return true;
  }

  function queueMessageCostForGeneratedReply(session, amount) {
    const value = Number(amount);
    if (!session?.chatId || !Number.isFinite(value) || value <= 0) return false;

    pendingMessageCost = {
      chatId: session.chatId,
      amount: Math.max(0, Math.round(value)),
      queuedAt: Date.now(),
      messageGroupIdsAtStart: new Set(session.messageGroupIdsAtStart || []),
      assistantGroupsAtStart: new Set(session.assistantGroupsAtStart || []),
      liveGroup: null,
    };

    // 새 AI 응답 DOM이 이미 있으면 그 자리에서 바로 같은 amount를 표시/저장한다.
    // 아직 DOM 자체가 없다면 붙일 곳이 없으므로 observer가 생기는 즉시 연결한다.
    // 일반 생성 중 이전 AI 줄에 잘못 156을 얹는 fallback은 사용하지 않는다.
    tryAttachPendingMessageCost(Boolean(session.generateDoneAt));
    return true;
  }

  function mount() {
    injectStyle();
    const root = getRoot();

    if (getSetting('placement') === 'chat') {
      document.querySelectorAll('[data-ci-composer-box="1"]').forEach((box) => {
        delete box.dataset.ciComposerBox;
      });
      if (root.isConnected) root.remove();
      renderChatIndicators();
      return;
    }

    removeAllChatIndicators();
    mountToComposer(root);
  }


  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function getCurrentChatIdFromUrl() {
    const storyMatch = String(location.pathname || '').match(
      /\/stories\/[^/]+\/episodes\/([^/?#]+)/
    );
    if (storyMatch) return storyMatch[1];

    const objectIdMatch = String(location.pathname || '').match(/[a-f0-9]{24}/i);
    if (objectIdMatch) return objectIdMatch[0];

    const hrefMatch = String(location.href || '').match(/[a-f0-9]{24}/i);
    return hrefMatch ? hrefMatch[0] : null;
  }

  function extractAccessToken() {
    for (const cookie of document.cookie.split(';')) {
      const item = cookie.trim();
      if (item.startsWith('access_token=')) {
        return item.substring('access_token='.length);
      }
    }

    return null;
  }

  async function crackApiGet(url) {
    const token = extractAccessToken();
    const headers = { 'Content-Type': 'application/json' };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  function getMessageId(message) {
    return String(
      message?._id ||
      message?.id ||
      message?.messageId ||
      ''
    ).trim();
  }

  function isUserMessage(message) {
    return String(message?.role || '').toLowerCase() === 'user';
  }

  function isAssistantMessage(message) {
    const role = String(message?.role || '').toLowerCase();
    return role === 'assistant' || role === 'ai' || role === 'model';
  }

  function objectIdTime(value) {
    const id = String(value || '').trim();
    if (!/^[a-f0-9]{24}$/i.test(id)) return 0;

    const seconds = Number.parseInt(id.slice(0, 8), 16);
    return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0;
  }

  function messageTime(message) {
    const candidates = [
      message?.createdAt,
      message?.created_at,
      message?.date,
      message?.timestamp,
      message?.createdTime,
    ];

    for (const candidate of candidates) {
      if (candidate == null || candidate === '') continue;

      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return candidate < 1e12 ? candidate * 1000 : candidate;
      }

      const numeric = Number(candidate);
      if (Number.isFinite(numeric) && numeric > 0) {
        return numeric < 1e12 ? numeric * 1000 : numeric;
      }

      const parsed = new Date(candidate).getTime();
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }

    return objectIdTime(getMessageId(message));
  }

  function getTurnIdentityKeys(message, includeParent = false) {
    const values = [
      getMessageId(message),
      message?.turnId,
      message?.turn_id,
      message?.turn?._id,
      message?.turn?.id,
    ];

    if (includeParent) {
      values.push(
        message?.parentTurnId,
        message?.parent_turn_id,
        message?.parentTurn?._id,
        message?.parentTurn?.id,
      );
    }

    return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
  }

  function buildTurnInfoFromMessages(rows) {
    const indexed = rows.map((message, index) => ({
      message,
      index,
      time: messageTime(message),
    }));

    // messages API가 최신순으로 오더라도 ObjectId/createdAt 기준으로 오래된 메시지부터 정렬한다.
    // 같은 시각이면 user를 assistant보다 먼저 두어 해당 응답이 같은 턴 번호를 받게 한다.
    indexed.sort((a, b) => {
      const aHasTime = a.time > 0;
      const bHasTime = b.time > 0;

      if (aHasTime && bHasTime && a.time !== b.time) return a.time - b.time;
      if (aHasTime !== bHasTime) return aHasTime ? -1 : 1;

      const aRoleOrder = isUserMessage(a.message) ? 0 : (isAssistantMessage(a.message) ? 1 : 2);
      const bRoleOrder = isUserMessage(b.message) ? 0 : (isAssistantMessage(b.message) ? 1 : 2);
      if (aRoleOrder !== bRoleOrder) return aRoleOrder - bRoleOrder;

      return a.index - b.index;
    });

    const seenUserIds = new Set();
    const logicalTurnByKey = new Map();
    const assistantTurnByParent = new Map();
    const messageTurns = {};
    let turn = 0;

    for (const { message } of indexed) {
      const messageId = getMessageId(message);

      if (isUserMessage(message)) {
        if (messageId && seenUserIds.has(messageId)) continue;
        if (messageId) seenUserIds.add(messageId);

        turn += 1;
        getTurnIdentityKeys(message, false).forEach((key) => logicalTurnByKey.set(key, turn));
        continue;
      }

      if (!isAssistantMessage(message) || !messageId) continue;

      const parentKeys = [
        message?.parentTurnId,
        message?.parent_turn_id,
        message?.parentTurn?._id,
        message?.parentTurn?.id,
        message?.turnId,
        message?.turn_id,
      ].map((value) => String(value || '').trim()).filter(Boolean);

      let messageTurn = null;

      // 가장 정확한 경우: assistant의 parentTurnId/turnId가 user turn 식별자와 직접 연결된다.
      for (const key of parentKeys) {
        if (logicalTurnByKey.has(key)) {
          messageTurn = logicalTurnByKey.get(key);
          break;
        }
      }

      // 리롤 답변들은 같은 parentTurnId를 공유하므로 최초 판정된 턴 번호를 재사용한다.
      if (messageTurn == null) {
        for (const key of parentKeys) {
          if (assistantTurnByParent.has(key)) {
            messageTurn = assistantTurnByParent.get(key);
            break;
          }
        }
      }

      // parentTurnId 연결 정보가 없는 일반 응답은 직전까지 센 user 턴 수를 사용한다.
      if (messageTurn == null) messageTurn = turn;

      messageTurns[messageId] = Math.max(0, Math.round(messageTurn));
      parentKeys.forEach((key) => assistantTurnByParent.set(key, messageTurns[messageId]));
    }

    return {
      turn,
      messageTurns,
    };
  }


  function pickMessageArray(json) {
    const data = json?.data ?? json;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.messages)) return data.messages;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.logs)) return data.logs;
    if (Array.isArray(data?.list)) return data.list;
    return [];
  }

  function pickCursor(json) {
    const data = json?.data ?? json;

    return (
      data?.nextCursor ||
      data?.next_cursor ||
      data?.next ||
      json?.nextCursor ||
      json?.next_cursor ||
      ''
    );
  }

  async function fetchAllMessages(chatId) {
    const rows = [];
    const seenIds = new Set();
    const seenCursors = new Set();

    let cursor = '';
    let page = 0;

    while (page < 120) {
      const url =
        `${CRACK_STATS_API.rawMessages}/${encodeURIComponent(chatId)}/messages` +
        '?limit=100' +
        (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '');

      const json = await crackApiGet(url);
      const messages = pickMessageArray(json);

      for (const message of messages) {
        const id = getMessageId(message);

        if (id) {
          if (seenIds.has(id)) continue;
          seenIds.add(id);
        }

        rows.push(message);
      }

      const nextCursor = pickCursor(json);
      page += 1;

      if (!nextCursor || !messages.length) break;
      if (seenCursors.has(nextCursor)) {
        console.warn('[CrackIndicator] 동일 cursor 반복 감지, 턴 조회 중단');
        break;
      }

      seenCursors.add(nextCursor);
      cursor = nextCursor;
      await sleep(20);
    }

    return rows;
  }

  async function getTurnStats(chatId = getCurrentChatIdFromUrl(), force = false) {
    if (!chatId) return null;

    const now = Date.now();
    if (
      !force &&
      lastTurnInfoCache?.chatId === chatId &&
      now - lastTurnFetchAt < TURN_CACHE_MS
    ) {
      return lastTurnInfoCache;
    }

    const rows = await fetchAllMessages(chatId);
    const turnInfo = buildTurnInfoFromMessages(rows);
    const info = {
      chatId,
      turn: turnInfo.turn,
      messageTurns: turnInfo.messageTurns,
    };

    lastTurnFetchAt = Date.now();
    lastTurnInfoCache = info;
    return info;
  }

  async function getBalance(force = false) {
    const now = Date.now();
    if (!force && lastBalanceCache !== null && now - lastBalanceFetchAt < BALANCE_CACHE_MS) {
      return lastBalanceCache;
    }

    try {
      const json = await crackApiGet(CRACK_STATS_API.balance);
      const quantity = json?.data?.quantity;
      const balance = typeof quantity === 'number' ? quantity : null;

      if (balance !== null) {
        lastBalanceFetchAt = now;
        lastBalanceCache = balance;
      }

      return balance;
    } catch (error) {
      console.warn('[CrackIndicator] 보유 크래커 조회 실패', error);
      return lastBalanceCache;
    }
  }

  function formatCracker(value) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return '-';
    return Math.max(0, Math.round(numberValue)).toLocaleString('en-US');
  }

  function syncChatContext(chatId = getCurrentChatIdFromUrl()) {
    const nextChatId = chatId || null;
    if (nextChatId === activeChatId) return false;

    activeChatId = nextChatId;
    activeGeneration = null;
    lastGenerationChatId = null;
    lastGenerationStartedAt = 0;
    clearPendingMessageCost();
    // SPA 방 전환 순간 이전 방 DOM이 잠깐 남아 있어도 live 차감값을 새 chatId에 저장하지 않게 제거한다.
    document.querySelectorAll(MESSAGE_SELECTOR).forEach(clearLiveMessageCost);
    lastRoomDeductedAmount = null;

    // 턴 수는 방별 마지막 정상값을 localStorage에서 즉시 복구한다.
    // 실제 API 조회가 끝나면 최신값으로 다시 갱신/저장된다.
    const storedTurn = loadStoredRoomTurn(nextChatId);
    const storedTurnDisplay = storedTurn === null ? '-' : String(storedTurn);
    lastTurnSignature = storedTurnDisplay;

    // 입력창의 차감 크래커는 방을 바꿀 때만 '-'로 시작한다.
    // 채팅창의 메시지별 차감값은 localStorage에서 각 메시지별로 복구된다.
    setStats({ turn: storedTurnDisplay, diffCracker: '-' });

    // 보유 크래커는 전역 잔액이므로 방 전환 직후의 첫 잔액은 비교하지 않고 기준값으로만 사용한다.
    // 이전 방에서 늦게 반영된 차감을 새 방의 차감으로 오인하는 것을 막는다.
    lastObservedBalance = null;

    return true;
  }

  function showDeductedAmount(amount) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return 0;

    const normalized = Math.max(0, Math.round(value));
    const displayValue = normalized.toLocaleString('en-US');
    lastRoomDeductedAmount = normalized;

    // 입력창/채팅창이 같은 차감 감지값을 단 하나의 source로 공유한다.
    // 위치가 채팅창이어도 stats 값 자체는 항상 156으로 갱신해 둔다.
    setStat('diffCracker', displayValue);

    const chatId = getCurrentChatIdFromUrl();
    if (chatId) {
      if (activeGeneration?.chatId === chatId) {
        queueMessageCostForGeneratedReply(activeGeneration, normalized);
      } else {
        saveCostToLatestAssistant(normalized);
      }
    }

    console.log(`[CrackIndicator] -${normalized} 크래커`);
    return normalized;
  }

  function saveCostToLatestAssistant(amount) {
    const value = Number(amount);
    const chatId = getCurrentChatIdFromUrl();
    const group = findNewestAssistantGroup();
    const messageId = getMessageGroupId(group);

    if (!chatId || !group || !Number.isFinite(value) || value <= 0) return false;

    const normalized = Math.max(0, Math.round(value));

    // 화면 표시는 저장 성공 여부와 분리한다. 입력창에 156이 잡힌 순간
    // 최신 AI DOM에도 동일한 156을 live 값으로 유지한다.
    group.dataset.ciLiveDiffCracker = String(normalized);
    scheduleMount(true);

    // messageId가 이미 있으면 즉시 영구 저장한다. 이후 id가 바뀌면 observer가 재저장한다.
    if (messageId) {
      persistLiveMessageCost(group, chatId);
      return true;
    }

    // 생성 시작 신호 자체를 놓친 특수 케이스에서도 입력창과 동일한 값을 즉시 표시한다.
    // messageId가 나중에 붙으면 MutationObserver가 같은 live 값을 영구 저장한다.
    pendingMessageCost = {
      chatId,
      amount: normalized,
      queuedAt: Date.now(),
      messageGroupIdsAtStart: new Set(),
      assistantGroupsAtStart: new Set(),
      liveGroup: group,
    };
    return true;
  }

  function handleBalanceDrop(previousBalance, currentBalance) {
    if (!Number.isFinite(previousBalance) || !Number.isFinite(currentBalance)) return 0;
    if (currentBalance >= previousBalance) return 0;

    return showDeductedAmount(previousBalance - currentBalance);
  }

  async function pollBalanceDeduction(session) {
    let previousCheckpoint = 0;

    for (const checkpoint of BALANCE_POLL_CHECKPOINTS_MS) {
      if (activeGeneration !== session) return 0;

      const delay = Math.max(0, checkpoint - previousCheckpoint);
      previousCheckpoint = checkpoint;
      await sleep(delay);

      if (activeGeneration !== session) return 0;

      const balance = await getBalance(true);
      if (!Number.isFinite(balance)) continue;

      if (!Number.isFinite(session.baselineBalance)) {
        session.baselineBalance = balance;
        lastObservedBalance = balance;
        continue;
      }

      if (balance < session.baselineBalance) {
        const deducted = showDeductedAmount(session.baselineBalance - balance);
        lastObservedBalance = balance;
        lastBalanceCache = balance;
        lastBalanceFetchAt = Date.now();

        if (activeGeneration === session) activeGeneration = null;
        // generate_done의 턴 갱신과 같은 타이머로 합쳐 중복 전체 메시지 조회를 피한다.
        scheduleTurnRefresh(600, true);
        return deducted;
      }

      lastObservedBalance = balance;
    }

    if (activeGeneration === session) activeGeneration = null;
    return 0;
  }

  function beginGeneration(chatId = getCurrentChatIdFromUrl()) {
    if (!chatId) return;

    const now = Date.now();

    // Enter + 버튼 click + dataLayer start가 연달아 들어오는 경우,
    // 잔액 차감이 매우 빨라 activeGeneration이 먼저 끝났더라도 1.5초 안의 중복 신호는 무시한다.
    if (lastGenerationChatId === chatId && now - lastGenerationStartedAt < 1500) {
      return;
    }

    // 직전 생성의 차감값이 아직 대기 중이면, 정말 새 생성이 시작될 때만 최신 응답에 마지막 한 번 연결한다.
    if (pendingMessageCost?.chatId === chatId) {
      tryAttachPendingMessageCost(true);
      if (pendingMessageCost) clearPendingMessageCost();
    }

    lastGenerationChatId = chatId;
    lastGenerationStartedAt = now;

    // activeGeneration 자체도 중복 방어로 유지한다.
    if (
      activeGeneration &&
      activeGeneration.chatId === chatId &&
      now - activeGeneration.startedAt < 1500
    ) {
      return;
    }

    const session = {
      chatId,
      startedAt: now,
      messageGroupIdsAtStart: captureMessageGroupIds(),
      assistantGroupsAtStart: captureAssistantGroups(),
      generateDoneAt: 0,
      baselineBalance: Number.isFinite(lastObservedBalance)
        ? lastObservedBalance
        : (Number.isFinite(lastBalanceCache) ? lastBalanceCache : null),
    };

    activeGeneration = session;

    if (Number.isFinite(session.baselineBalance)) {
      pollBalanceDeduction(session).catch((error) => {
        console.warn('[CrackIndicator] 잔액 차감 감지 실패', error);
      });
      return;
    }

    // 첫 로드 직후처럼 기준 잔액이 아직 없을 때만 한 번 가져온다.
    getBalance(true).then((balance) => {
      if (activeGeneration !== session || !Number.isFinite(balance)) return;
      session.baselineBalance = balance;
      lastObservedBalance = balance;
      pollBalanceDeduction(session).catch((error) => {
        console.warn('[CrackIndicator] 잔액 차감 감지 실패', error);
      });
    }).catch(() => {});
  }

  function getEventName(entry) {
    if (!entry) return '';

    if (
      (Array.isArray(entry) || typeof entry.length === 'number') &&
      entry[0] === 'event'
    ) {
      return String(entry[1] || '');
    }

    return String(entry?.event || '');
  }

  function isLikelySendButton(target) {
    const button = target?.closest?.('button');
    if (!button || button.disabled) return false;

    const input = findComposerInput();
    const composerBox = findComposerBox(input);
    if (!composerBox || !composerBox.contains(button)) return false;

    const label = [
      button.getAttribute('aria-label'),
      button.getAttribute('title'),
      button.textContent,
    ].filter(Boolean).join(' ').trim();

    return /(전송|보내기|생성|재생성|답변|send|submit|generate|regenerate)/i.test(label);
  }

  function watchGenerationSignals() {
    document.addEventListener('keydown', (event) => {
      if (
        event.key === 'Enter' &&
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        !event.isComposing &&
        isComposerInputTarget(event.target)
      ) {
        beginGeneration();
      }
    }, true);

    document.addEventListener('click', (event) => {
      if (isLikelySendButton(event.target)) {
        beginGeneration();
      }
    }, true);

    const w = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const dataLayer = w.dataLayer = w.dataLayer || [];

    if (!Array.isArray(dataLayer) || dataLayer.__crackIndicatorWrapped) return;

    const originalPush = dataLayer.push;
    dataLayer.push = function (...items) {
      const result = originalPush.apply(this, items);

      for (const entry of items) {
        const eventName = getEventName(entry);

        if (/^(generate|generation)_(start|begin|request|submit)$/i.test(eventName)) {
          beginGeneration();
        }

        if (/^generate_done$/i.test(eventName)) {
          // 차감 polling보다 generate_done이 먼저 오는 경우를 기억한다.
          // 이후 차감이 잡혀도 "완료 신호를 놓친 pending" 상태가 되지 않게 한다.
          if (activeGeneration) {
            activeGeneration.generateDoneAt = Date.now();
          }

          // 새 메시지가 API에 반영될 짧은 여유를 두고 한 번만 강제 갱신한다.
          // 잔액 polling 쪽에서도 같은 타이머를 사용하므로 서로 겹치면 자동 병합된다.
          scheduleTurnRefresh(600, true);

          // 차감이 먼저 잡힌 경우에는 완료 시점에 최신 assistant 줄로 확정 저장한다.
          if (pendingMessageCost) {
            tryAttachPendingMessageCost(true);
          }
        }
      }

      return result;
    };

    dataLayer.__crackIndicatorWrapped = true;
  }

  async function refreshTurnCount(force = false) {
    if (isReadingTurn) {
      scheduleTurnRefresh(250, force);
      return;
    }
    isReadingTurn = true;

    try {
      const chatId = getCurrentChatIdFromUrl();
      const chatChanged = syncChatContext(chatId);
      const previousObservedBalance = chatChanged ? null : lastObservedBalance;
      const [info, balance] = await Promise.all([
        getTurnStats(chatId, force || chatChanged).catch((error) => {
          console.warn('[CrackIndicator] 턴 조회 실패', error);
          if (lastTurnInfoCache?.chatId === chatId) return lastTurnInfoCache;
          const storedTurn = loadStoredRoomTurn(chatId);
          return storedTurn === null ? null : { chatId, turn: storedTurn, source: 'localStorage' };
        }),
        // 턴 강제 갱신과 잔액 강제 갱신을 묶지 않는다.
        // 차감 직후 잔액은 전용 polling이 이미 force 조회하므로 여기서는 짧은 캐시를 재사용한다.
        getBalance(false),
      ]);

      // 조회 중 방이 또 바뀌었으면 이전 방 결과를 UI에 적용하지 않는다.
      if (chatId !== getCurrentChatIdFromUrl()) {
        setTimeout(() => scheduleTurnRefresh(0, true), 0);
        return;
      }

      if (Number.isFinite(balance)) {
        if (!chatChanged) {
          handleBalanceDrop(previousObservedBalance, balance);
        }
        lastObservedBalance = balance;
      }

      if (Number.isFinite(Number(info?.turn))) {
        const normalizedTurn = Math.max(0, Math.round(Number(info.turn)));
        saveStoredRoomTurn(chatId, normalizedTurn);

        // messages API 전체 목록에서 각 AI messageId가 몇 번째 user 턴에 속하는지 계산해
        // 과거 응답까지 한 번에 영구 저장한다. 리롤은 같은 parentTurnId면 같은 턴을 공유한다.
        mergeMessageTurns(chatId, info?.messageTurns);

        // API에 막 생성된 최신 메시지가 아직 반영되지 않은 짧은 구간만 DOM 최신 응답으로 보완한다.
        saveTurnToLatestAssistant(chatId, normalizedTurn);
      }

      const turnSignature = String(info?.turn ?? '-');
      const remainCrackerSignature = formatCracker(balance);
      const nextStats = {};

      if (turnSignature !== lastTurnSignature) {
        lastTurnSignature = turnSignature;
        nextStats.turn = turnSignature;
      }

      if (remainCrackerSignature !== lastRemainCrackerSignature) {
        lastRemainCrackerSignature = remainCrackerSignature;
        nextStats.remainCracker = remainCrackerSignature;
      }

      if (Object.keys(nextStats).length > 0) {
        setStats(nextStats);
      }
    } finally {
      isReadingTurn = false;
    }
  }

  function scheduleTurnRefresh(delay = TURN_REFRESH_DELAY_MS, force = false) {
    const wait = Math.max(0, Number(delay) || 0);
    const dueAt = Date.now() + wait;
    const wantsForce = Boolean(force);
    const alreadyForced = turnTimerForce;

    if (turnTimerId) {
      if (wantsForce) {
        // 일반 갱신이 먼저 잡혀 있어도 강제 갱신 요청의 지연시간을 존중한다.
        // 이미 강제 갱신이 예약돼 있다면 더 빠른 쪽 하나만 남긴다.
        if (alreadyForced && turnTimerDueAt <= dueAt) return;
      } else {
        // 강제 갱신이 대기 중이면 일반 DOM 변화가 그 시점을 앞당기거나 뒤로 밀지 못하게 한다.
        if (alreadyForced || turnTimerDueAt <= dueAt) return;
      }

      clearTimeout(turnTimerId);
    }

    turnTimerForce = alreadyForced || wantsForce;
    turnTimerDueAt = dueAt;
    turnTimerId = setTimeout(() => {
      turnTimerId = 0;
      turnTimerDueAt = 0;
      const shouldForce = turnTimerForce;
      turnTimerForce = false;
      refreshTurnCount(shouldForce);
    }, Math.max(0, dueAt - Date.now()));
  }

  function isOwnUiNode(node) {
    if (!node || node === document || node === window) return false;

    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!el) return false;

    return Boolean(
      el.id === ROOT_ID ||
      el.id === STYLE_ID ||
      el.id === SETTINGS_OVERLAY_ID ||
      el.classList?.contains(CHAT_INDICATOR_CLASS) ||
      el.closest?.(`#${ROOT_ID}`) ||
      el.closest?.(`#${SETTINGS_OVERLAY_ID}`) ||
      el.closest?.(`.${CHAT_INDICATOR_CLASS}`)
    );
  }

  function isOwnMutation(mutation) {
    const touchedNodes = [
      mutation.target,
      ...mutation.addedNodes,
      ...mutation.removedNodes,
    ];

    return touchedNodes.length > 0 && touchedNodes.every(isOwnUiNode);
  }

  function runMountFrame() {
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      rafId = 0;
      lastMountAt = Date.now();
      mount();
    });
  }

  function scheduleMount(immediate = false) {
    if (immediate) {
      if (mountTimerId) {
        clearTimeout(mountTimerId);
        mountTimerId = 0;
      }

      runMountFrame();
      return;
    }

    const elapsed = Date.now() - lastMountAt;
    const wait = Math.max(0, MOUNT_THROTTLE_MS - elapsed);

    if (wait === 0) {
      runMountFrame();
      return;
    }

    if (mountTimerId) return;

    mountTimerId = setTimeout(() => {
      mountTimerId = 0;
      runMountFrame();
    }, wait);
  }


  function watchChatRouteChanges() {
    const notifyRouteChange = () => {
      syncChatContext(getCurrentChatIdFromUrl());
      scheduleMount(true);
      scheduleTurnRefresh(0, true);
    };

    const wrapHistoryMethod = (methodName) => {
      const original = history[methodName];
      if (typeof original !== 'function' || original.__crackIndicatorWrapped) return;

      const wrapped = function (...args) {
        const before = location.href;
        const result = original.apply(this, args);
        if (location.href !== before) {
          setTimeout(notifyRouteChange, 0);
        }
        return result;
      };

      wrapped.__crackIndicatorWrapped = true;
      history[methodName] = wrapped;
    };

    wrapHistoryMethod('pushState');
    wrapHistoryMethod('replaceState');
    window.addEventListener('popstate', notifyRouteChange);
  }

  function nodeContainsMessageGroup(node) {
    if (!node) return false;
    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!el) return false;
    return Boolean(el.matches?.(MESSAGE_SELECTOR) || el.querySelector?.(MESSAGE_SELECTOR));
  }

  function mutationTouchesMessages(mutation) {
    if (!mutation) return false;

    if (
      mutation.type === 'attributes' &&
      mutation.attributeName === 'data-message-group-id'
    ) {
      return true;
    }

    if (mutation.type !== 'childList') return false;

    return [
      ...mutation.addedNodes,
      ...mutation.removedNodes,
    ].some(nodeContainsMessageGroup);
  }

  function observe() {
    const observer = new MutationObserver((mutations) => {
      if (mutations.every(isOwnMutation)) return;

      scheduleMount();

      // 차감값이 대기 중이면 API 호출 없이 DOM 변화가 생긴 그 프레임에 바로 연결한다.
      if (pendingMessageCost) {
        tryAttachPendingMessageCost(false);
      }

      // 이미 표시 중인 live 차감값은 message-group-id가 바뀌어도 같은 DOM을 따라간다.
      // 따라서 스트리밍 임시 id -> 최종 id 전환 시 최종 id에도 자동으로 영구 저장된다.
      persistVisibleLiveMessageCosts();

      // 가상 스크롤로 과거 메시지가 재마운트되는 것만으로 messages API를 다시 읽지 않는다.
      // 실제 생성 세션 중 새 메시지 그룹 변화가 보일 때만 fallback 턴 갱신을 예약한다.
      if (activeGeneration && mutations.some(mutationTouchesMessages)) {
        scheduleTurnRefresh(600, true);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-message-group-id'],
    });

    window.addEventListener('resize', () => {
      scheduleMount(true);
    });

    document.addEventListener('focusin', () => {
      scheduleMount(true);
    }, true);

    document.addEventListener('click', () => {
      scheduleMount(true);
    }, true);
  }

  registerMenuCommands();
  mount();
  observe();
  watchChatRouteChanges();
  watchGenerationSignals();
  scheduleTurnRefresh(0, true);
})();

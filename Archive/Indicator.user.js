// ==UserScript==
// @name         Crack Indicator
// @namespace    https://github.com/Dflashh/Crack
// @version      0.1.38
// @description  Crack chat indicator UI
// @match        *://crack.wrtn.ai/*
// @author       깡통들과 나
// @icon         https://cdn.jsdelivr.net/gh/Dflashh/Crack@main/Icon/Indicator.webp
// @downloadURL  https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackUI.user.js
// @updateURL    https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackUI.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-shared-core@v1.2.1/crack/libraries/crack-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@chasm-shared-core@v1.0.0/libraries/chasm-shared-core.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';

  const ROOT_ID = 'crack-indicator-root';
  const ANCHOR_ID = 'crack-indicator-anchor';
  const STYLE_ID = 'crack-indicator-style';
  const POPOVER_ID = 'crack-indicator-popover';
  const STORE_KEY = 'crack-indicator-visible-stats';
  const POSITION_STORE_KEY = 'crack-indicator-position-mode';
  const AI_TOTAL_STORAGE_PREFIX = 'info_ai_total_';
  const CRACKER_COUNT_STORE_KEY = 'crack-indicator-last-remain-cracker';
  const DIFF_CRACKER_STORE_KEY = 'crack-indicator-last-diff-cracker';
  const DIFF_CRACKER_CHAT_STORE_KEY = 'crack-indicator-last-diff-cracker-chat';
  const CHAT_SPENT_STORAGE_KEY = 'info_display_chat_spent_crackers_v2';
  const MAX_SINGLE_DEDUCTION = 1000;
  const HISTORY_MATCH_WINDOW_MS = 120000;
  const AI_TURN_TAIL_WINDOW_MS = 3 * 60 * 1000;
  const DELETED_TURN_FALLBACK_WINDOW_MS = 5 * 60 * 1000;
  const DEFAULT_HISTORY_PAGE_LIMIT = 500;
  const DEEP_HISTORY_PAGE_LIMIT = 5000;
  const TURN_REFRESH_DELAY_MS = 400;

  const DEFAULT_VISIBLE = {
    turn: true,
    totalTurn: true,
    usedCracker: true,
    remainCracker: true,
    diffCracker: true,
  };

  const CRACKER_PATH = "M21.17 12.01c.52-.59.83-1.36.83-2.21s-.31-1.62-.83-2.21l.17-.21q0-.01.02-.02l.14-.21q0-.02.03-.05.06-.1.1-.2l.05-.08.09-.2q.01-.05.04-.11l.06-.18q0-.08.04-.14.01-.07.04-.16l.03-.19q0-.06.02-.13v-.33a3.37 3.37 0 0 0-3.36-3.37l-.33.01q-.06 0-.12.02-.1 0-.2.03-.07 0-.15.04l-.14.04-.18.06-.11.04-.2.09-.07.04-.2.11q-.03 0-.05.03l-.21.14-.02.02-.21.17a3.4 3.4 0 0 0-4.42 0 3.3 3.3 0 0 0-2.21-.83c-.85 0-1.62.31-2.21.83l-.21-.17-.02-.02-.21-.14q-.02 0-.05-.03l-.2-.11-.08-.04-.2-.09-.11-.04-.18-.06-.14-.04-.16-.04-.2-.03-.12-.02-.33-.01a3.37 3.37 0 0 0-3.34 3.82q0 .1.03.19 0 .07.04.16 0 .08.04.14l.06.18q0 .05.04.11.03.1.09.19l.04.08.1.2q.01.02.04.05l.16.23q.07.1.17.21a3.3 3.3 0 0 0-.83 2.21c0 .85.3 1.62.83 2.21a3.3 3.3 0 0 0-.83 2.21c0 .85.3 1.62.83 2.21l-.17.21-.02.02-.14.21q0 .02-.03.05l-.11.2-.04.08-.1.2-.03.11-.06.18-.04.14-.04.16-.03.19-.02.13-.01.33A3.4 3.4 0 0 0 3.02 21c.6.61 1.45.99 2.38.99l.33-.01q.06 0 .12-.02.1 0 .19-.03.07 0 .16-.04l.14-.04.18-.06.1-.04.2-.09.08-.04.2-.11q.03 0 .05-.03l.2-.14.03-.02.2-.17a3.4 3.4 0 0 0 4.43 0 3.32 3.32 0 0 0 4.42 0 3 3 0 0 0 .44.33q.03 0 .05.03l.2.11.08.04.2.09.10.04.19.06.14.04.16.04.19.03.13.02.33.01c.92 0 1.75-.37 2.36-.97l.02-.02c.6-.61.99-1.45.99-2.38l-.01-.33q0-.06-.02-.12 0-.1-.03-.19 0-.07-.04-.16l-.04-.14-.06-.18-.04-.11-.1-.19-.03-.08-.11-.2q0-.02-.03-.05l-.14-.21-.02-.02-.17-.21c.52-.59.83-1.36.83-2.21s-.31-1.62-.83-2.21M7.5 13.5 6 12l1.5-1.5L9 12zM12 6l1.5 1.5L12 9l-1.5-1.5zm0 12-1.5-1.5L12 15l1.5 1.5zm4.5-4.5L15 12l1.5-1.5L18 12z";

  const stats = [
    { key: 'turn', label: '턴 수', value: '-', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5L13.8 10.2L20.5 12L13.8 13.8L12 20.5L10.2 13.8L3.5 12L10.2 10.2L12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>' },
    { key: 'totalTurn', label: '누적 턴', value: '-', icon: 'Σ' },
    { key: 'usedCracker', label: '사용 크래커', value: '-', icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ci-cracker-icon"><defs><mask id="ci-bite-mask-cracker"><rect width="24" height="24" fill="white"/><circle cx="24" cy="0" r="12" fill="black"/></mask></defs><path fill="currentColor" mask="url(#ci-bite-mask-cracker)" d="${CRACKER_PATH}"></path></svg>` },
    { key: 'remainCracker', label: '보유 크래커', value: '-', icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="ci-cracker-icon"><path fill="currentColor" d="${CRACKER_PATH}"></path></svg>` },
    { key: 'diffCracker', label: '차감 크래커', value: '-', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 18.5L5.5 8.5H18.5L12 18.5Z" fill="currentColor"/></svg>' },
  ];

  let visible = loadVisible();
  let positionMode = loadPositionMode();
  let rafId = 0;
  let mountTimerId = 0;
  let lastMountAt = 0;
  let positionRafId = 0;
  let turnTimerId = 0;
  let isReadingTurn = false;
  let lastTurnSignature = '';
  let lastTotalTurnSignature = '';
  let lastRemainCrackerSignature = '';
  let lastDiffCrackerSignature = '';
  let lastUsedCrackerSignature = '';
  let spentCache = null;
  let isCalculatingUsedCracker = false;
  let isDeepScanning = false;
  let lastUsedEstimateSignature = '';
  let lastAiTotalChatId = null;
  let sessionKnownAiIds = new Set();
  let persistentAiTotal = 0;
  let isFirstAiTotalFetchForChat = true;
  const MOUNT_THROTTLE_MS = 120;

  function loadVisible() {
    try {
      return {
        ...DEFAULT_VISIBLE,
        ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}'),
      };
    } catch {
      return { ...DEFAULT_VISIBLE };
    }
  }

  function saveVisible() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(visible));
    } catch {}
  }

  function loadPositionMode() {
    try {
      const value = localStorage.getItem(POSITION_STORE_KEY) || 'top';
      return value === 'bottom' ? 'bottom' : 'top';
    } catch {
      return 'top';
    }
  }

  function savePositionMode() {
    try {
      localStorage.setItem(POSITION_STORE_KEY, positionMode);
    } catch {}
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID} {
        position: relative;
        z-index: 30;
        width: 100%;
        height: 28px;
        pointer-events: none;
      }

      #${ROOT_ID}[data-ci-mode="composer"] {
        z-index: 0;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        height: 28px;
        margin: 0;
        flex: 0 0 auto;
        overflow: hidden;
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

      #${ANCHOR_ID} {
        position: relative;
        z-index: 20;
        width: 100%;
        margin-top: 48px;
        transition: transform 200ms ease;
      }

      .ci-bar {
        pointer-events: auto;
        position: relative;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0 8px;
        overflow: hidden;

        border-radius: 0;
        border: 0;
        background: var(--ci-bg);

        backdrop-filter: blur(18px) saturate(180%);
        -webkit-backdrop-filter: blur(18px) saturate(180%);

        color: var(--ci-text);
      }

      .ci-menu-button {
        position: absolute;
        left: 8px;
        top: 50%;
        z-index: 2;

        width: 22px;
        height: 22px;
        min-width: 22px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: var(--ci-muted);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transform: translateY(-50%);
        transition:
          background 160ms ease,
          color 160ms ease,
          transform 160ms ease;
      }

      .ci-menu-button:hover {
        background: transparent;
        color: var(--ci-text);
      }

      .ci-menu-button:active {
        transform: translateY(-50%) scale(0.94);
      }

      .ci-menu-dot {
        position: relative;
        width: 3px;
        height: 3px;
        border-radius: 999px;
        background: currentColor;
        display: block;
      }

      .ci-menu-dot::before,
      .ci-menu-dot::after {
        content: "";
        position: absolute;
        left: 0;
        width: 3px;
        height: 3px;
        border-radius: 999px;
        background: currentColor;
      }

      .ci-menu-dot::before {
        top: -5px;
      }

      .ci-menu-dot::after {
        top: 5px;
      }

      .ci-deep-scan-button {
        position: absolute;
        right: 8px;
        top: 50%;
        z-index: 2;

        width: 22px;
        height: 22px;
        min-width: 22px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: var(--ci-muted);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transform: translateY(-50%);
        transition:
          color 160ms ease,
          opacity 160ms ease,
          transform 160ms ease;
      }

      .ci-deep-scan-button svg {
        width: 14px;
        height: 14px;
        display: block;
        overflow: visible;
      }

      .ci-deep-scan-button:hover {
        color: var(--ci-text);
      }

      .ci-deep-scan-button:active {
        transform: translateY(-50%) scale(0.96);
      }

      .ci-deep-scan-button.is-loading {
        color: var(--ci-accent);
        pointer-events: none;
        opacity: 0.95;
      }

      .ci-deep-scan-button.is-loading .ci-deep-scan-hourglass {
        animation: ci-hourglass-spin-rest 2.1s linear infinite;
        transform-origin: 50% 50%;
      }

      @keyframes ci-hourglass-spin-rest {
        0% {
          transform: rotate(0deg);
        }

        34% {
          transform: rotate(360deg);
        }

        52% {
          transform: rotate(360deg);
        }

        86% {
          transform: rotate(720deg);
        }

        100% {
          transform: rotate(720deg);
        }
      }

      .ci-list {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 0 66px 0 34px;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
      }

      .ci-list::-webkit-scrollbar {
        display: none;
      }

      .ci-item {
        height: 22px;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        padding: 0 12px 0 5px;
        border-radius: 999px;
        color: var(--ci-text);
        background: var(--ci-chip);
        border: 1px solid var(--ci-chip-border);
        white-space: nowrap;
        user-select: none;
      }

      .ci-item:hover {
        background: var(--ci-chip-hover);
      }

      .ci-item.is-scanning {
        animation: ci-scan-blink 820ms ease-in-out infinite;
      }

      .ci-item.is-scanning .ci-icon,
      .ci-item.is-scanning .ci-value {
        color: var(--ci-accent);
      }

      @keyframes ci-scan-blink {
        0%,
        100% {
          opacity: 1;
        }

        50% {
          opacity: 0.36;
        }
      }

      .ci-icon {
        width: 14px;
        height: 14px;
        min-width: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        line-height: 1;
        font-weight: 800;
        color: var(--ci-accent);
        background: transparent;
        border-radius: 0;
        flex-shrink: 0;
      }

      .ci-icon svg {
        width: 100%;
        height: 100%;
        display: block;
        overflow: visible;
      }

      .ci-icon .ci-cracker-icon {
        width: 15px;
        height: 15px;
      }

      .ci-label {
        font-size: 11px;
        line-height: 1;
        font-weight: 650;
        color: var(--ci-muted);
        letter-spacing: -0.02em;
      }

      .ci-value {
        min-width: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        line-height: 1;
        font-weight: 750;
        color: var(--ci-text);
        letter-spacing: -0.02em;
        text-align: center;
      }

      .ci-empty {
        font-size: 11px;
        font-weight: 650;
        color: var(--ci-muted);
        padding-left: 4px;
      }

      @media (max-width: 520px) {
        #${ROOT_ID},
        #${ROOT_ID}[data-ci-mode="composer"] {
          height: 24px;
        }

        .ci-bar {
          height: 24px;
          padding: 0 5px;
        }

        .ci-menu-button,
        .ci-deep-scan-button {
          width: 20px;
          height: 20px;
          min-width: 20px;
        }

        .ci-menu-button {
          left: 5px;
        }

        .ci-deep-scan-button {
          right: 5px;
        }

        .ci-deep-scan-button svg {
          width: 12px;
          height: 12px;
        }

        .ci-list {
          gap: 0;
          padding: 0 28px;
          justify-content: center;
        }

        .ci-item {
          height: 20px;
          gap: 4px;
          padding: 0 5px;
          border: 0;
          border-radius: 0;
          background: transparent;
        }

        .ci-item:hover {
          background: transparent;
        }

        .ci-item + .ci-item::before {
          content: "|";
          margin: 0 4px 0 0;
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
          font-size: 10px;
        }

        .ci-icon .ci-cracker-icon {
          width: 13px;
          height: 13px;
        }

        .ci-value {
          font-size: 10px;
          min-width: 8px;
          letter-spacing: -0.04em;
        }

        .ci-empty {
          font-size: 10px;
        }
      }

      .ci-popover {
        position: fixed;
        left: 8px;
        top: 32px;
        z-index: 2147483647;
        width: 172px;
        max-height: calc(100vh - 12px);
        overflow-y: auto;
        padding: 6px;
        border-radius: 14px;
        display: none;
        flex-direction: column;
        gap: 1px;
        backdrop-filter: blur(22px) saturate(180%);
        -webkit-backdrop-filter: blur(22px) saturate(180%);
        background: var(--ci-popover-bg);
        border: 1px solid var(--ci-border);
        color: var(--ci-text);
        pointer-events: auto;
        scrollbar-width: none;
      }

      .ci-popover::-webkit-scrollbar {
        display: none;
      }

      .ci-popover.is-open {
        display: flex;
      }

      .ci-popover-title {
        padding: 4px 7px 5px;
        font-size: 11px;
        font-weight: 750;
        color: var(--ci-muted);
        letter-spacing: -0.02em;
      }

      .ci-toggle {
        width: 100%;
        height: 26px;
        border: 0;
        border-radius: 9px;
        padding: 0 7px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: transparent;
        color: var(--ci-text);
        cursor: pointer;
        transition: background 140ms ease;
      }

      .ci-toggle:hover {
        background: var(--ci-hover);
      }

      .ci-toggle-label {
        font-size: 12px;
        font-weight: 650;
        letter-spacing: -0.02em;
      }

      .ci-popover-section-title {
        padding: 7px 7px 4px;
        font-size: 11px;
        font-weight: 750;
        color: var(--ci-muted);
        letter-spacing: -0.02em;
      }

      .ci-position-option {
        width: 100%;
        height: 26px;
        border: 0;
        border-radius: 9px;
        padding: 0 7px;
        display: flex;
        align-items: center;
        gap: 8px;
        background: transparent;
        color: var(--ci-text);
        cursor: pointer;
        transition: background 140ms ease;
      }

      .ci-position-option:hover {
        background: var(--ci-hover);
      }

      .ci-position-check {
        width: 15px;
        height: 15px;
        min-width: 15px;
        border-radius: 5px;
        border: 1px solid var(--ci-chip-border);
        background: var(--ci-switch-off);
        color: white;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        line-height: 1;
        font-weight: 900;
      }

      .ci-position-option.is-on .ci-position-check {
        border-color: var(--ci-accent);
        background: var(--ci-accent);
      }

      .ci-position-option.is-on .ci-position-check::after {
        content: "✓";
      }

      .ci-position-label {
        font-size: 12px;
        font-weight: 650;
        letter-spacing: -0.02em;
      }

      .ci-switch {
        width: 30px;
        height: 18px;
        padding: 2px;
        border-radius: 999px;
        background: var(--ci-switch-off);
        transition: background 160ms ease;
      }

      .ci-switch::after {
        content: "";
        display: block;
        width: 14px;
        height: 14px;
        border-radius: 999px;
        background: white;
        transform: translateX(0);
        transition: transform 160ms ease;
      }

      .ci-toggle.is-on .ci-switch {
        background: var(--ci-accent);
      }

      .ci-toggle.is-on .ci-switch::after {
        transform: translateX(12px);
      }

      :root {
        --ci-bg: rgba(248, 248, 248, 0.74);
        --ci-popover-bg: rgba(255, 255, 255, 0.86);
        --ci-border: rgba(0, 0, 0, 0.075);
        --ci-text: rgba(17, 24, 39, 0.92);
        --ci-muted: rgba(75, 85, 99, 0.72);
        --ci-hover: rgba(0, 0, 0, 0.055);
        --ci-chip: rgba(255, 255, 255, 0.66);
        --ci-chip-hover: rgba(255, 255, 255, 0.82);
        --ci-chip-border: rgba(0, 0, 0, 0.075);
        --ci-button: rgba(255, 255, 255, 0.36);
        --ci-accent: #FE4532;
        --ci-accent-bg: rgba(254, 69, 50, 0.13);
        --ci-switch-off: rgba(120, 120, 128, 0.24);
      }

      html.dark,
      html[data-theme="dark"],
      html[data-crack-ui-theme-mode="dark"] {
        --ci-bg: rgba(18, 18, 20, 0.78);
        --ci-popover-bg: rgba(24, 24, 26, 0.92);
        --ci-border: rgba(255, 255, 255, 0.11);
        --ci-text: rgba(255, 255, 255, 0.92);
        --ci-muted: rgba(235, 235, 245, 0.62);
        --ci-hover: rgba(255, 255, 255, 0.08);
        --ci-chip: rgba(255, 255, 255, 0.13);
        --ci-chip-hover: rgba(255, 255, 255, 0.20);
        --ci-chip-border: rgba(255, 255, 255, 0.12);
        --ci-button: rgba(255, 255, 255, 0.08);
        --ci-accent: #FE4532;
        --ci-accent-bg: rgba(254, 69, 50, 0.20);
        --ci-switch-off: rgba(120, 120, 128, 0.34);
      }

    `;

    document.head.appendChild(style);
  }

  function findStatWrapper() {
    const statNode = document.querySelector('[data-stat-index]');
    if (!statNode) return null;

    let node = statNode.parentElement;

    while (node && node !== document.body) {
      if (
        node.classList &&
        node.classList.contains('transition-transform') &&
        node.classList.contains('mt-12')
      ) {
        return node;
      }

      node = node.parentElement;
    }

    return null;
  }

  function findStatBar(statWrapper) {
    if (!statWrapper) return null;

    return [...statWrapper.children].find((child) => {
      return child.querySelector && child.querySelector('[data-stat-index]');
    }) || null;
  }

  function findTitleBar() {
    const candidates = [...document.querySelectorAll('div')];

    return candidates.find((el) => {
      return (
        el.classList.contains('absolute') &&
        el.classList.contains('left-0') &&
        el.classList.contains('w-full') &&
        el.classList.contains('h-12') &&
        el.querySelector('button span.line-clamp-1')
      );
    }) || null;
  }

  function findHeaderRoot(fromNode) {
    let node = fromNode;

    while (node && node !== document.body) {
      if (
        node.classList &&
        node.classList.contains('absolute') &&
        node.classList.contains('top-0') &&
        node.classList.contains('left-0') &&
        node.classList.contains('w-full') &&
        node.classList.contains('z-[5]')
      ) {
        return node;
      }

      if (node.classList && node.classList.contains('group/header')) {
        return node;
      }

      node = node.parentElement;
    }

    return null;
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

  function findComposerHost(composerBox) {
    if (!composerBox) return null;

    let node = composerBox.parentElement;

    while (node && node !== document.body) {
      const className = String(node.className || '');

      if (
        className.includes('flex-col') &&
        className.includes('pointer-events-auto') &&
        (
          className.includes('max-w-[768px]') ||
          className.includes('igx-inline-overlay-host') ||
          className.includes('bg-bg_screen')
        )
      ) {
        return node;
      }

      node = node.parentElement;
    }

    return composerBox.parentElement;
  }

  function mountToComposer(root) {
    const input = findComposerInput();
    const composerBox = findComposerBox(input);

    if (!input || !composerBox) return false;

    const oldAnchor = document.getElementById(ANCHOR_ID);
    if (oldAnchor) oldAnchor.remove();

    document.querySelectorAll('[data-ci-composer-box="1"]').forEach((box) => {
      if (box !== composerBox) {
        delete box.dataset.ciComposerBox;
      }
    });

    composerBox.dataset.ciComposerBox = '1';

    const firstChild = composerBox.firstElementChild;

    // 하단 배치에서는 입력창 박스 바깥이 아니라,
    // rounded border composerBox 안쪽 최상단에 넣는다.
    if (root.parentElement !== composerBox || firstChild !== root) {
      composerBox.insertBefore(root, firstChild || null);
    }

    root.dataset.ciMode = 'composer';
    root.style.transform = '';
    return true;
  }

  function clampNumber(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function ensurePopover() {
    let popover = document.getElementById(POPOVER_ID);

    if (!popover) {
      popover = document.createElement('div');
      popover.id = POPOVER_ID;
      popover.className = 'ci-popover';
      popover.innerHTML = '<div class="ci-popover-title">표시 항목</div>';
      document.body.appendChild(popover);
    }

    return popover;
  }

  function closePopover() {
    document.getElementById(POPOVER_ID)?.classList.remove('is-open');
  }

  function schedulePopoverPosition(root = document.getElementById(ROOT_ID)) {
    const popover = document.getElementById(POPOVER_ID);
    if (!popover || !popover.classList.contains('is-open')) return;
    if (positionRafId) return;

    positionRafId = requestAnimationFrame(() => {
      positionRafId = 0;
      positionPopover(root);
    });
  }

  function positionPopover(root = document.getElementById(ROOT_ID)) {
    if (!root) return;

    const menuButton = root.querySelector('.ci-menu-button');
    const popover = ensurePopover();

    if (!menuButton || !popover.classList.contains('is-open')) return;

    popover.style.left = '0px';
    popover.style.top = '0px';
    popover.style.bottom = 'auto';
    popover.style.maxHeight = 'calc(100vh - 12px)';

    const buttonRect = menuButton.getBoundingClientRect();
    const width = popover.offsetWidth || 172;
    const height = Math.min(popover.offsetHeight || 210, window.innerHeight - 12);
    const gap = 6;

    const left = clampNumber(
      buttonRect.left,
      gap,
      Math.max(gap, window.innerWidth - width - gap)
    );

    let top;

    if (positionMode === 'bottom' || root.dataset.ciMode === 'composer') {
      // 하단 모드는 무조건 버튼 위쪽으로 연다.
      // 공간이 부족해도 아래로 뒤집지 않고 화면 안쪽으로만 밀어 넣는다.
      top = buttonRect.top - height - gap;
    } else {
      top = buttonRect.bottom + gap;

      if (top + height > window.innerHeight - gap) {
        top = buttonRect.top - height - gap;
      }
    }

    top = clampNumber(
      top,
      gap,
      Math.max(gap, window.innerHeight - height - gap)
    );

    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
  }

  function ensureRootMarkup(root) {
    if (!root) return;

    let bar = root.querySelector('.ci-bar');
    if (!bar) {
      root.innerHTML = `
        <div class="ci-bar">
          <button class="ci-menu-button" type="button" aria-label="Crack Indicator 설정">
            <span class="ci-menu-dot"></span>
          </button>

          <div class="ci-list"></div>

          <button class="ci-deep-scan-button" type="button" title="사용 크래커 깊은 스캔" aria-label="사용 크래커 깊은 스캔">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 4.5L13.5 9.2L18.2 10.7L13.5 12.2L12 16.9L10.5 12.2L5.8 10.7L10.5 9.2L12 4.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M18.6 18.6L21 21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="15.5" cy="15.5" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
            </svg>
          </button>
        </div>
      `;
      return;
    }

    if (!bar.querySelector('.ci-menu-button')) {
      bar.insertAdjacentHTML('afterbegin', `
        <button class="ci-menu-button" type="button" aria-label="Crack Indicator 설정">
          <span class="ci-menu-dot"></span>
        </button>
      `);
    }

    if (!bar.querySelector('.ci-list')) {
      bar.insertAdjacentHTML('beforeend', '<div class="ci-list"></div>');
    }

    if (!bar.querySelector('.ci-deep-scan-button')) {
      bar.insertAdjacentHTML('beforeend', `
        <button class="ci-deep-scan-button" type="button" title="사용 크래커 깊은 스캔" aria-label="사용 크래커 깊은 스캔">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 4.5L13.5 9.2L18.2 10.7L13.5 12.2L12 16.9L10.5 12.2L5.8 10.7L10.5 9.2L12 4.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M18.6 18.6L21 21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="15.5" cy="15.5" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
            </svg>
          </button>
      `);
    }

    normalizeDeepScanButton(root);
  }

  function bindRootEvents(root) {
    if (!root) return;

    const menuButton = root.querySelector('.ci-menu-button');
    const deepScanButton = root.querySelector('.ci-deep-scan-button');
    const popover = ensurePopover();

    if (menuButton && menuButton.dataset.ciBound !== 'true') {
      menuButton.dataset.ciBound = 'true';

      menuButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        popover.classList.toggle('is-open');

        if (popover.classList.contains('is-open')) {
          render(root, { forceControls: true });
          popover.classList.add('is-open');
          schedulePopoverPosition(root);
        }
      });
    }

    if (deepScanButton && deepScanButton.dataset.ciBound !== 'true') {
      deepScanButton.dataset.ciBound = 'true';

      deepScanButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        runDeepScan(root);
      });
    }

    if (document.documentElement.dataset.ciGlobalBound !== 'true') {
      document.documentElement.dataset.ciGlobalBound = 'true';

      document.addEventListener('click', (event) => {
        const currentRoot = document.getElementById(ROOT_ID);
        const currentPopover = document.getElementById(POPOVER_ID);

        if (
          currentRoot &&
          currentPopover &&
          !currentRoot.contains(event.target) &&
          !currentPopover.contains(event.target)
        ) {
          closePopover();
        }
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closePopover();
        }
      });
    }
  }

  function createRoot() {
    const root = document.createElement('div');
    root.id = ROOT_ID;

    ensureRootMarkup(root);
    bindRootEvents(root);
    render(root, { forceControls: true });

    return root;
  }

  function getRoot() {
    const root = document.getElementById(ROOT_ID) || createRoot();

    ensureRootMarkup(root);
    bindRootEvents(root);

    return root;
  }

  function getListSignature() {
    return stats
      .filter((stat) => visible[stat.key])
      .map((stat) => `${stat.key}:${stat.value}`)
      .join('|') || '__empty__';
  }

  function getControlsSignature() {
    return `${positionMode}|${stats.map((stat) => `${stat.key}:${visible[stat.key] ? 1 : 0}`).join('|')}`;
  }

  function syncUsedScanState(root = document.getElementById(ROOT_ID)) {
    const item = root?.querySelector?.('.ci-item[data-ci-key="usedCracker"]');
    if (!item) return;

    item.classList.toggle('is-scanning', Boolean(isCalculatingUsedCracker));
    item.title = isCalculatingUsedCracker
      ? '사용 크래커 기본 스캔 중'
      : '사용 크래커';
  }

  function renderList(root) {
    if (!root) return;

    const list = root.querySelector('.ci-list');
    if (!list) return;

    const signature = getListSignature();
    if (list.dataset.ciSignature === signature) return;

    list.dataset.ciSignature = signature;
    list.innerHTML = '';

    const visibleStats = stats.filter((stat) => visible[stat.key]);

    if (visibleStats.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'ci-empty';
      empty.textContent = '표시 항목 없음';
      list.appendChild(empty);
      return;
    }

    visibleStats.forEach((stat) => {
      const item = document.createElement('div');
      item.className = `ci-item ${stat.key === 'usedCracker' && isCalculatingUsedCracker ? 'is-scanning' : ''}`.trim();
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

  function renderControls(root, force = false) {
    const popover = ensurePopover();
    const signature = getControlsSignature();

    if (!force && popover.dataset.ciControlsSignature === signature) return;

    popover.dataset.ciControlsSignature = signature;
    popover.querySelectorAll('.ci-toggle, .ci-popover-section-title, .ci-position-option').forEach((el) => el.remove());

    stats.forEach((stat) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `ci-toggle ${visible[stat.key] ? 'is-on' : ''}`;
      button.dataset.ciToggle = stat.key;

      button.innerHTML = `
        <span class="ci-toggle-label">${stat.label}</span>
        <span class="ci-switch"></span>
      `;

      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        visible[stat.key] = !visible[stat.key];
        saveVisible();

        render(root, { forceControls: true });
        popover.classList.add('is-open');
        schedulePopoverPosition(root);
      });

      popover.appendChild(button);
    });

    const positionTitle = document.createElement('div');
    positionTitle.className = 'ci-popover-section-title';
    positionTitle.textContent = '위치';
    popover.appendChild(positionTitle);

    [
      { key: 'top', label: '상단' },
      { key: 'bottom', label: '하단' },
    ].forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `ci-position-option ${positionMode === option.key ? 'is-on' : ''}`;
      button.dataset.ciPosition = option.key;

      button.innerHTML = `
        <span class="ci-position-check"></span>
        <span class="ci-position-label">${option.label}</span>
      `;

      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (positionMode === option.key) return;

        positionMode = option.key;
        savePositionMode();

        mount();
        render(root, { forceControls: true });
        ensurePopover().classList.add('is-open');
        schedulePopoverPosition(root);
      });

      popover.appendChild(button);
    });
  }

  function render(root = document.getElementById(ROOT_ID), options = {}) {
    if (!root) return;

    const popover = ensurePopover();
    const keepPopoverOpen = Boolean(popover.classList.contains('is-open'));

    renderList(root);
    renderControls(root, Boolean(options.forceControls));
    syncUsedScanState(root);
    normalizeDeepScanButton(root);

    if (keepPopoverOpen) {
      popover.classList.add('is-open');
      schedulePopoverPosition(root);
    }
  }

  function syncStandaloneAnchor(anchor, titleBar, headerRoot) {
    if (!anchor || !titleBar) return;

    const update = () => {
      const titleStyle = getComputedStyle(titleBar);
      const titleOpacity = Number.parseFloat(titleStyle.opacity || '1');
      const titleHiddenByClass =
        String(titleBar.className).includes('opacity-0') ||
        String(titleBar.className).includes('invisible');

      const headerHovered = Boolean(headerRoot && headerRoot.matches(':hover'));

      // 실제 제목줄의 현재 표시 상태만 보고 따라간다.
      // 입력창 focus 여부를 고정 조건으로 쓰면, 입력창이 계속 focus된 상태에서
      // 제목줄이 다시 접힐 때 indicator가 아래에 남아버린다.
      const shouldLift =
        (titleOpacity < 0.5 || titleHiddenByClass) &&
        !headerHovered;

      anchor.style.transform = shouldLift ? 'translateY(-48px)' : 'translateY(0)';
    };

    update();

    if (headerRoot && !headerRoot.dataset.ciHoverBound) {
      headerRoot.dataset.ciHoverBound = 'true';
      headerRoot.addEventListener('mouseenter', update);
      headerRoot.addEventListener('mouseleave', update);
    }
  }


  function getTransformTranslateY(transformValue) {
    const value = String(transformValue || '');
    if (!value || value === 'none') return 0;

    const matrix3d = value.match(/^matrix3d\((.+)\)$/);
    if (matrix3d) {
      const parts = matrix3d[1].split(',').map((item) => Number.parseFloat(item.trim()));
      return Number.isFinite(parts[13]) ? parts[13] : 0;
    }

    const matrix = value.match(/^matrix\((.+)\)$/);
    if (matrix) {
      const parts = matrix[1].split(',').map((item) => Number.parseFloat(item.trim()));
      return Number.isFinite(parts[5]) ? parts[5] : 0;
    }

    return 0;
  }

  function findEditableTarget(target) {
    if (!target || target === document || target === window) return null;

    if (target.matches?.('textarea, input, [contenteditable="true"], [role="textbox"]')) {
      return target;
    }

    return target.closest?.('textarea, input, [contenteditable="true"], [role="textbox"]') || null;
  }

  function isLowerComposerTarget(target) {
    const editable = findEditableTarget(target);
    if (!editable) return false;

    const rect = editable.getBoundingClientRect();

    // 상단 검색창 같은 input은 제외하고, 화면 아래쪽 메세지 입력창만 대상으로 삼는다.
    return rect.top > window.innerHeight * 0.45;
  }

  function dropStandaloneAnchorImmediately(event = null) {
    const root = document.getElementById(ROOT_ID);
    const anchor = document.getElementById(ANCHOR_ID);

    if (!root || !anchor || root.dataset.ciMode !== 'no-stat') return;
    if (!isLowerComposerTarget(event?.target) && !isLowerComposerTarget(document.activeElement)) return;

    const computedY = getTransformTranslateY(getComputedStyle(anchor).transform);
    const inlineLifted = String(anchor.style.transform || '').includes('-48px');

    // 접힌 상태에서 입력창을 눌러 제목줄이 내려올 때만 즉시 선반영한다.
    // 이미 내려온 상태에서 다시 누르는 경우에는 강제로 붙잡지 않아서 다시 올라갈 수 있다.
    if (inlineLifted || computedY < -20) {
      anchor.style.transform = 'translateY(0)';
    }
  }

  function mount() {
    injectStyle();

    const root = getRoot();

    // 하단 모드에서는 입력창 바로 위에 고정한다.
    // 상단 모드에서는 기존 스탯바/제목줄 위치를 그대로 사용한다.
    if (positionMode === 'bottom' && mountToComposer(root)) {
      return;
    }

    const statWrapper = findStatWrapper();

    if (statWrapper) {
      const statBar = findStatBar(statWrapper);
      const oldAnchor = document.getElementById(ANCHOR_ID);

      if (oldAnchor) oldAnchor.remove();

      if (statBar && root.previousElementSibling !== statBar) {
        statBar.insertAdjacentElement('afterend', root);
      } else if (!statBar && root.parentElement !== statWrapper) {
        statWrapper.appendChild(root);
      }

      root.dataset.ciMode = 'stat';
      return;
    }

    const titleBar = findTitleBar();
    if (!titleBar) return;

    const headerRoot = findHeaderRoot(titleBar);
    if (!headerRoot) return;

    let anchor = document.getElementById(ANCHOR_ID);

    if (!anchor) {
      anchor = document.createElement('div');
      anchor.id = ANCHOR_ID;
      headerRoot.appendChild(anchor);
    }

    if (root.parentElement !== anchor) {
      anchor.appendChild(root);
    }

    root.dataset.ciMode = 'no-stat';
    syncStandaloneAnchor(anchor, titleBar, headerRoot);
  }

  function getObjectIdTime(objectId) {
    if (!objectId || String(objectId).length < 8) return 0;

    const value = Number.parseInt(String(objectId).slice(0, 8), 16);
    return Number.isFinite(value) ? value * 1000 : 0;
  }

  function getCurrentChatIdFromUrl() {
    const pathMatch = String(location.pathname || '').match(/[a-f0-9]{24}/i);
    if (pathMatch) return pathMatch[0];

    const hrefMatch = String(location.href || '').match(/[a-f0-9]{24}/i);
    return hrefMatch ? hrefMatch[0] : null;
  }

  function getCurrentChatIdFromCrackUtil() {
    try {
      if (typeof CrackUtil === 'undefined') return null;

      const pathInfo = CrackUtil.path?.();
      if (!pathInfo?.isChattingPath?.()) return null;

      return pathInfo.chatRoom?.() || null;
    } catch {
      return null;
    }
  }

  function getCurrentChatIdSafe() {
    return getCurrentChatIdFromCrackUtil() || getCurrentChatIdFromUrl();
  }

  function normalizeAiTotalForChat(chatId) {
    if (lastAiTotalChatId === chatId) return;

    lastAiTotalChatId = chatId;
    sessionKnownAiIds = new Set();
    persistentAiTotal = Math.max(
      0,
      Number.parseInt(localStorage.getItem(AI_TOTAL_STORAGE_PREFIX + chatId), 10) || 0
    );
    isFirstAiTotalFetchForChat = true;
  }

  function updatePersistentAiTotal(chatId, currentAiIds) {
    if (!chatId) return 0;

    normalizeAiTotalForChat(chatId);

    const uniqueAiIds = [...new Set(currentAiIds.filter(Boolean))];
    let changed = false;

    if (isFirstAiTotalFetchForChat) {
      uniqueAiIds.forEach((id) => sessionKnownAiIds.add(id));

      const nextTotal = Math.max(persistentAiTotal, uniqueAiIds.length);
      if (nextTotal !== persistentAiTotal) {
        persistentAiTotal = nextTotal;
        changed = true;
      }

      isFirstAiTotalFetchForChat = false;
    } else {
      let added = 0;

      uniqueAiIds.forEach((id) => {
        if (sessionKnownAiIds.has(id)) return;

        sessionKnownAiIds.add(id);
        added += 1;
      });

      if (added > 0) {
        persistentAiTotal += added;
        changed = true;
      }

      // 외부/기존 기록이 현재 로그보다 낮으면 최소 현재 AI 로그 수까지는 복구한다.
      if (uniqueAiIds.length > persistentAiTotal) {
        persistentAiTotal = uniqueAiIds.length;
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(AI_TOTAL_STORAGE_PREFIX + chatId, String(persistentAiTotal));
    }

    return Math.max(0, persistentAiTotal - 1);
  }

  function getStoredTotalTurn(chatId) {
    if (!chatId) return null;

    const stored = Number.parseInt(localStorage.getItem(AI_TOTAL_STORAGE_PREFIX + chatId), 10);
    if (!Number.isFinite(stored) || stored <= 0) return null;

    return Math.max(0, stored - 1);
  }

  async function readTurnInfoFromCrackUtil() {
    try {
      if (typeof CrackUtil === 'undefined') return null;

      const chatId = getCurrentChatIdFromCrackUtil();
      if (!chatId || !CrackUtil.chatRoom?.().iterateLogs) return null;

      let logCount = 0;
      let userCount = 0;
      let aiCount = 0;
      let lastRole = null;
      const aiIds = [];
      const aiTimestamps = [];
      const userTimestamps = [];

      for await (const log of CrackUtil.chatRoom().iterateLogs(chatId)) {
        logCount += 1;

        if (log?.isUser?.()) {
          userCount += 1;
          lastRole = 'user';

          const timestamp = getObjectIdTime(log.id);
          if (timestamp > 0) {
            userTimestamps.push(timestamp);
          }
        } else {
          aiCount += 1;
          lastRole = 'ai';

          if (log?.id) {
            aiIds.push(String(log.id));

            const timestamp = getObjectIdTime(log.id);
            if (timestamp > 0) {
              aiTimestamps.push(timestamp);
            }
          }
        }
      }

      const totalTurn = updatePersistentAiTotal(chatId, aiIds);

      return {
        source: 'CrackUtil',
        chatId,
        turn: userCount,
        totalTurn,
        logCount,
        userCount,
        aiCount,
        persistentAiTotal,
        aiTimestamps,
        userTimestamps,
        lastRole,
      };
    } catch {
      return null;
    }
  }

  function readTurnInfoFromDom() {
    const groups = [...document.querySelectorAll('div[data-message-group-id]')];
    const chatId = getCurrentChatIdSafe();
    const storedTotalTurn = getStoredTotalTurn(chatId);

    // fallback 전용. DOM은 로드된 메시지만 잡힐 수 있어서 긴 방에서는 낮게 나올 수 있다.
    return {
      source: 'DOM fallback',
      chatId,
      turn: Math.floor(groups.length / 2),
      totalTurn: storedTotalTurn ?? Math.floor(groups.length / 2),
      aiTimestamps: [],
      userTimestamps: [],
      groupCount: groups.length,
    };
  }

  async function readTurnInfo() {
    return (await readTurnInfoFromCrackUtil()) || readTurnInfoFromDom();
  }

  function parseCrackerCount(text) {
    if (!text) return null;

    const match = String(text).match(/[\d,]+/);
    if (!match) return null;

    const value = Number.parseInt(match[0].replace(/,/g, ''), 10);
    return Number.isFinite(value) ? value : null;
  }

  function formatRemainCracker(value) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return '-';

    return Math.max(0, Math.round(numberValue)).toLocaleString('en-US');
  }

  function readRemainCrackerCount() {
    const topBar = document.getElementById('chasm-cracker-text');
    const topBarValue = parseCrackerCount(
      topBar?.getAttribute('chasm-tmi-current') || topBar?.textContent
    );

    if (topBarValue !== null) return topBarValue;

    const label = [...document.querySelectorAll('span, div')]
      .find((el) => el.textContent?.trim() === '나의 크래커');

    const labelValue = parseCrackerCount(label?.nextElementSibling?.textContent);
    if (labelValue !== null) return labelValue;

    return null;
  }

  function getLastRemainCrackerCount() {
    const stored = Number.parseInt(localStorage.getItem(CRACKER_COUNT_STORE_KEY), 10);
    return Number.isFinite(stored) && stored >= 0 ? stored : null;
  }

  function saveRemainCrackerCount(value) {
    if (!Number.isFinite(value) || value < 0) return;
    localStorage.setItem(CRACKER_COUNT_STORE_KEY, String(value));
  }

  function getSpentMap() {
    if (!spentCache) {
      try {
        spentCache = JSON.parse(localStorage.getItem(CHAT_SPENT_STORAGE_KEY) || '{}');
      } catch {
        spentCache = {};
      }
    }

    return spentCache;
  }

  function saveSpentMap() {
    if (!spentCache) return;
    localStorage.setItem(CHAT_SPENT_STORAGE_KEY, JSON.stringify(spentCache));
  }

  function normalizeSpentRecord(record) {
    if (!record || typeof record !== 'object') record = {};

    return {
      estimatedBase: Math.max(0, Number(record.estimatedBase) || 0),
      liveSpent: Math.max(0, Number(record.liveSpent) || 0),
      estimatedAt: Number(record.estimatedAt) || 0,
      liveUpdatedAt: Number(record.liveUpdatedAt) || 0,
    };
  }

  function getChatSpentRecord(chatId) {
    if (!chatId) return normalizeSpentRecord(null);

    const map = getSpentMap();
    const normalized = normalizeSpentRecord(map[chatId]);
    map[chatId] = normalized;

    return normalized;
  }

  function setEstimatedSpent(chatId, estimatedTotal) {
    if (!chatId || !Number.isFinite(estimatedTotal) || estimatedTotal < 0) return;

    const map = getSpentMap();
    const record = getChatSpentRecord(chatId);

    // 히스토리 추정값은 현재 스캔 결과로 다시 계산된 값이다.
    // 이전 추정이 넓은 시간 구간 때문에 과대 계산됐을 수 있으므로 max가 아니라 교체한다.
    const estimatedBase = Math.max(0, Math.round(estimatedTotal) - record.liveSpent);
    record.estimatedBase = estimatedBase;
    record.estimatedAt = Date.now();

    map[chatId] = record;
    saveSpentMap();
  }

  function addLiveSpent(chatId, amount) {
    if (!chatId || !Number.isFinite(amount) || amount <= 0) return;

    const map = getSpentMap();
    const record = getChatSpentRecord(chatId);

    record.liveSpent += Math.round(amount);
    record.liveUpdatedAt = Date.now();

    map[chatId] = record;
    saveSpentMap();
  }

  function getSpentDisplay(chatId) {
    const record = getChatSpentRecord(chatId);

    return {
      total: record.estimatedBase + record.liveSpent,
      estimatedBase: record.estimatedBase,
      liveSpent: record.liveSpent,
      estimatedAt: record.estimatedAt,
      liveUpdatedAt: record.liveUpdatedAt,
    };
  }

  function getAccessToken() {
    return document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith('access_token='))
      ?.split('=')[1] || null;
  }

  function getConsumedAmount(item) {
    const candidates = [
      item?.balance?.total,
      item?.balance?.amount,
      item?.amount,
      item?.total,
    ];

    for (const candidate of candidates) {
      const amount = Number(candidate);
      if (Number.isFinite(amount) && amount !== 0) {
        return Math.abs(amount);
      }
    }

    return 0;
  }

  function normalizeHistoryTitle(title) {
    return String(title || '')
      .replace(/\s+/g, '')
      .replace(/[「」『』"'“”‘’]/g, '')
      .replace(/(파워챗|일반챗|채팅방|채팅|챗)$/u, '')
      .trim();
  }

  function readCurrentChatTitle() {
    const bodyLines = String(document.body?.innerText || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const powerChatLine = bodyLines.find((line) => (
      line.length <= 60 &&
      /파워챗|일반챗/u.test(line)
    ));

    if (powerChatLine) {
      return powerChatLine
        .replace(/(파워챗|일반챗).*$/u, '')
        .trim();
    }

    const heading = [...document.querySelectorAll('h1, h2, h3, [role="heading"]')]
      .map((el) => el.textContent?.trim())
      .find((value) => value && value.length <= 60);

    if (heading) return heading;

    const docTitle = String(document.title || '')
      .replace(/[-|].*$/u, '')
      .replace(/Crack|WRtn|뤼튼/giu, '')
      .trim();

    return docTitle.length <= 60 ? docTitle : '';
  }

  function isHistoryTitleMatched(item, expectedTitle) {
    const expected = normalizeHistoryTitle(expectedTitle);
    if (!expected) return true;

    const actual = normalizeHistoryTitle(item?.title);
    if (!actual) return false;

    return (
      actual === expected ||
      (expected.length >= 3 && actual.includes(expected)) ||
      (actual.length >= 3 && expected.includes(actual))
    );
  }

  function makeTimestampMinuteBuckets(timestamps) {
    const buckets = new Set();

    (timestamps || []).forEach((timestamp) => {
      if (!Number.isFinite(timestamp) || timestamp <= 0) return;

      const minute = Math.floor(timestamp / 60000);
      buckets.add(minute - 1);
      buckets.add(minute);
      buckets.add(minute + 1);
    });

    return buckets;
  }

  function makeHistoryMatchContext(infoOrTimestamps) {
    const info = Array.isArray(infoOrTimestamps)
      ? { aiTimestamps: infoOrTimestamps, userTimestamps: [] }
      : (infoOrTimestamps || {});

    const aiTimestamps = (info.aiTimestamps || []).filter((timestamp) => (
      Number.isFinite(timestamp) &&
      timestamp > 0
    ));
    const userTimestamps = (info.userTimestamps || []).filter((timestamp) => (
      Number.isFinite(timestamp) &&
      timestamp > 0
    ));
    const allTimestamps = [...aiTimestamps, ...userTimestamps];

    if (!allTimestamps.length) return null;

    const chatTitle = readCurrentChatTitle();
    const normalizedChatTitle = normalizeHistoryTitle(chatTitle);
    const timestampBuckets = makeTimestampMinuteBuckets(aiTimestamps);

    const aiSorted = [...new Set(aiTimestamps)].sort((a, b) => a - b);
    const userSorted = [...new Set(userTimestamps)].sort((a, b) => a - b);
    const intervals = [];
    let aiAnchoredIntervalCount = 0;
    let fallbackIntervalCount = 0;

    if (userSorted.length > 0) {
      userSorted.forEach((userTime, index) => {
        const nextUserTime = userSorted[index + 1];
        const start = userTime - 30000;

        const aiInTurn = aiSorted.filter((aiTime) => (
          aiTime >= userTime - 30000 &&
          (!Number.isFinite(nextUserTime) || aiTime < nextUserTime)
        ));

        if (aiInTurn.length > 0) {
          // 남아있는 AI 응답이 있으면 그 응답까지만 강하게 매칭한다.
          // 삭제된 리롤은 보통 최종 응답 이전에 차감되므로 이 구간 안에서 같이 잡힌다.
          const lastAiTime = Math.max(...aiInTurn);
          const end = Math.min(
            lastAiTime + AI_TURN_TAIL_WINDOW_MS,
            Number.isFinite(nextUserTime) ? nextUserTime - 1 : lastAiTime + AI_TURN_TAIL_WINDOW_MS
          );

          intervals.push([start, end]);
          aiAnchoredIntervalCount += 1;
          return;
        }

        // AI 응답이 전부 삭제돼서 기준점이 없으면 넓게 잡지 않는다.
        // 같은 작품명 다른 방이 섞이는 걸 막기 위해 유저 메시지 직후 짧은 구간만 보수적으로 본다.
        const fallbackEnd = Math.min(
          userTime + DELETED_TURN_FALLBACK_WINDOW_MS,
          Number.isFinite(nextUserTime) ? nextUserTime - 1 : userTime + DELETED_TURN_FALLBACK_WINDOW_MS
        );

        intervals.push([start, fallbackEnd]);
        fallbackIntervalCount += 1;
      });
    }

    const intervalTimestamps = intervals.flat();
    const oldest = Math.min(...allTimestamps, ...intervalTimestamps) - HISTORY_MATCH_WINDOW_MS;
    const latest = Math.max(...allTimestamps, ...intervalTimestamps) + HISTORY_MATCH_WINDOW_MS;

    return {
      oldest,
      latest,
      chatTitle,
      normalizedChatTitle,
      timestampBuckets,
      intervals,
      hasIntervals: intervals.length > 0,
      aiAnchoredIntervalCount,
      fallbackIntervalCount,
    };
  }

  function isHistoryItemMatched(item, itemTime, context) {
    if (!context || !Number.isFinite(itemTime)) return false;
    if (!isHistoryTitleMatched(item, context.chatTitle)) return false;

    if (context.hasIntervals) {
      return context.intervals.some(([start, end]) => (
        itemTime >= start &&
        itemTime <= end
      ));
    }

    return context.timestampBuckets.has(Math.floor(itemTime / 60000));
  }

  async function fetchEstimatedSpentFromHistory(infoOrTimestamps, options = {}) {
    const context = makeHistoryMatchContext(infoOrTimestamps);
    const token = getAccessToken();

    if (!token || !context) return null;

    const maxPages = Number(options.maxPages) || DEFAULT_HISTORY_PAGE_LIMIT;
    const warpStep = options.deep ? 35 : 15;
    const delayMs = options.deep ? 18 : 40;

    let totalCalculated = 0;
    let page = 1;
    let lastSafePage = 1;
    let keepGoing = true;
    let isWarping = true;
    let guard = 0;

    while (keepGoing && page <= maxPages && guard < maxPages) {
      guard += 1;

      const response = await fetch(
        `https://crack-api.wrtn.ai/crack-cash/crackers/history?limit=10&type=all&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) break;

      const json = await response.json().catch(() => null);
      const rows = Array.isArray(json?.data) ? json.data : [];
      if (!rows.length) break;

      const pageLatestTime = new Date(rows[0].date).getTime();

      if (isWarping && pageLatestTime < context.latest) {
        page = lastSafePage + 1;
        isWarping = false;
        continue;
      }

      if (isWarping && pageLatestTime > context.latest + 600000) {
        lastSafePage = page;
        page += warpStep;
        continue;
      }

      isWarping = false;

      for (const item of rows) {
        const itemTime = new Date(item.date).getTime();
        if (!Number.isFinite(itemTime)) continue;

        if (itemTime < context.oldest) {
          keepGoing = false;
          break;
        }

        if (
          String(item.isConsumed) === 'true' &&
          (!item.product || item.product === 'cracker') &&
          isHistoryItemMatched(item, itemTime, context)
        ) {
          totalCalculated += getConsumedAmount(item);
        }
      }

      page += 1;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    return Math.round(totalCalculated);
  }

  function getDeepScanButtonMarkup(state = 'idle') {
    if (state === 'loading') {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true" class="ci-deep-scan-hourglass">
          <path d="M7 3.5H17M7 20.5H17M8.3 4.5C8.3 8.2 10.4 8.7 12 10.1C13.6 8.7 15.7 8.2 15.7 4.5M8.3 19.5C8.3 15.8 10.4 15.3 12 13.9C13.6 15.3 15.7 15.8 15.7 19.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }

    if (state === 'done') {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 12.5L10.1 16.1L17.5 8.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }

    if (state === 'fail') {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 7.2V12.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
          <circle cx="12" cy="16.7" r="1.1" fill="currentColor"/>
          <path d="M12 4.4L20 18.4H4L12 4.4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4.5L13.5 9.2L18.2 10.7L13.5 12.2L12 16.9L10.5 12.2L5.8 10.7L10.5 9.2L12 4.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M18.6 18.6L21 21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="15.5" cy="15.5" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
      </svg>
    `;
  }

  function normalizeDeepScanButton(root = document.getElementById(ROOT_ID)) {
    const button = root?.querySelector?.('.ci-deep-scan-button');
    if (!button) return;

    const state = isDeepScanning ? 'loading' : 'idle';

    if (!button.querySelector('svg') || button.textContent.trim()) {
      button.innerHTML = getDeepScanButtonMarkup(state);
    }

    button.classList.toggle('is-loading', state === 'loading');
    button.title = state === 'loading'
      ? '사용 크래커 깊은 스캔 중'
      : '사용 크래커 깊은 스캔';
    button.setAttribute('aria-label', button.title);
  }

  function setDeepScanButtonState(root, state) {
    const button = root?.querySelector?.('.ci-deep-scan-button');
    if (!button) return;

    button.classList.toggle('is-loading', state === 'loading');
    button.innerHTML = getDeepScanButtonMarkup(state);

    if (state === 'loading') {
      button.title = '사용 크래커 깊은 스캔 중';
      button.setAttribute('aria-label', '사용 크래커 깊은 스캔 중');
    } else if (state === 'done') {
      button.title = '깊은 스캔 완료';
      button.setAttribute('aria-label', '깊은 스캔 완료');
      setTimeout(() => setDeepScanButtonState(root, 'idle'), 1400);
    } else if (state === 'fail') {
      button.title = '깊은 스캔 실패';
      button.setAttribute('aria-label', '깊은 스캔 실패');
      setTimeout(() => setDeepScanButtonState(root, 'idle'), 1800);
    } else {
      button.title = '사용 크래커 깊은 스캔';
      button.setAttribute('aria-label', '사용 크래커 깊은 스캔');
    }
  }

  async function runDeepScan(root = document.getElementById(ROOT_ID)) {
    if (isDeepScanning) return;

    isDeepScanning = true;
    setDeepScanButtonState(root, 'loading');

    try {
      const info = await readTurnInfo();

      if (!info?.chatId) {
        setDeepScanButtonState(root, 'fail');
        return;
      }

      const estimatedTotal = await fetchEstimatedSpentFromHistory(info, {
        maxPages: DEEP_HISTORY_PAGE_LIMIT,
        deep: true,
      });

      if (!Number.isFinite(estimatedTotal)) {
        setDeepScanButtonState(root, 'fail');
        return;
      }

      setEstimatedSpent(info.chatId, estimatedTotal);
      updateUsedCrackerDisplay(info.chatId);
      setDeepScanButtonState(root, 'done');
    } catch {
      setDeepScanButtonState(root, 'fail');
    } finally {
      isDeepScanning = false;
    }
  }

  function getUsedEstimateSignature(info) {
    const aiTimestamps = (info?.aiTimestamps || []).filter((timestamp) => (
      Number.isFinite(timestamp) &&
      timestamp > 0
    ));
    const userTimestamps = (info?.userTimestamps || []).filter((timestamp) => (
      Number.isFinite(timestamp) &&
      timestamp > 0
    ));
    const timestamps = [...aiTimestamps, ...userTimestamps];

    if (!info?.chatId || !timestamps.length) return '';

    return [
      info.chatId,
      aiTimestamps.length,
      userTimestamps.length,
      Math.min(...timestamps),
      Math.max(...timestamps),
    ].join(':');
  }

  function updateUsedCrackerDisplay(chatId) {
    if (!chatId) return;

    const display = getSpentDisplay(chatId);
    const signature = String(display.total || 0);

    if (signature === lastUsedCrackerSignature) return;

    lastUsedCrackerSignature = signature;
    window.CrackIndicator?.setStat?.('usedCracker', signature);
  }

  function scheduleEstimatedUsedCracker(info) {
    if (!info?.chatId || !getUsedEstimateSignature(info)) return;

    const signature = getUsedEstimateSignature(info);
    if (!signature || signature === lastUsedEstimateSignature) return;

    lastUsedEstimateSignature = signature;

    if (isCalculatingUsedCracker) return;
    isCalculatingUsedCracker = true;
    syncUsedScanState();

    fetchEstimatedSpentFromHistory(info, {
        maxPages: DEFAULT_HISTORY_PAGE_LIMIT,
      })
      .then((estimatedTotal) => {
        if (
          Number.isFinite(estimatedTotal) &&
          info.chatId === getCurrentChatIdSafe()
        ) {
          setEstimatedSpent(info.chatId, estimatedTotal);
          updateUsedCrackerDisplay(info.chatId);
        }
      })
      .finally(() => {
        isCalculatingUsedCracker = false;
        syncUsedScanState();
      });
  }

  function getLastDiffCracker(chatId) {
    if (!chatId) return null;

    const storedChatId = localStorage.getItem(DIFF_CRACKER_CHAT_STORE_KEY);
    if (storedChatId !== chatId) return null;

    const stored = Number.parseInt(localStorage.getItem(DIFF_CRACKER_STORE_KEY), 10);
    return Number.isFinite(stored) && stored > 0 ? stored : null;
  }

  function saveDiffCracker(chatId, value) {
    if (!chatId || !Number.isFinite(value) || value <= 0) return;

    localStorage.setItem(DIFF_CRACKER_STORE_KEY, String(value));
    localStorage.setItem(DIFF_CRACKER_CHAT_STORE_KEY, chatId);
  }

  function clearDiffCracker() {
    localStorage.setItem(DIFF_CRACKER_STORE_KEY, '0');
    localStorage.setItem(DIFF_CRACKER_CHAT_STORE_KEY, '');
  }

  function updateDiffCrackerCount(currentRemainCracker, chatId) {
    if (currentRemainCracker === null) {
      return getLastDiffCracker(chatId);
    }

    const prevRemainCracker = getLastRemainCrackerCount();
    let diff = null;

    if (
      prevRemainCracker !== null &&
      prevRemainCracker > currentRemainCracker
    ) {
      const nextDiff = prevRemainCracker - currentRemainCracker;

      // 출력량 차감처럼 정상적인 단일 차감만 잡는다.
      // 구매/이벤트/대량 변동 같은 건 차감 크래커로 오인하지 않게 제외한다.
      if (nextDiff > 0 && nextDiff < MAX_SINGLE_DEDUCTION) {
        diff = nextDiff;
        saveDiffCracker(chatId, diff);
        addLiveSpent(chatId, diff);
      }
    } else if (
      prevRemainCracker !== null &&
      prevRemainCracker < currentRemainCracker
    ) {
      clearDiffCracker();
    }

    saveRemainCrackerCount(currentRemainCracker);

    return diff ?? getLastDiffCracker(chatId);
  }

  async function refreshTurnCount() {
    if (isReadingTurn) return;

    isReadingTurn = true;

    try {
      const info = await readTurnInfo();

      const turnSignature = String(info?.turn ?? '-');
      const totalTurnSignature = String(info?.totalTurn ?? '-');
      const remainCrackerCount = readRemainCrackerCount();
      const currentChatId = info?.chatId || getCurrentChatIdSafe();
      const diffCrackerCount = updateDiffCrackerCount(remainCrackerCount, currentChatId);
      const spentDisplay = getSpentDisplay(currentChatId);
      const remainCrackerSignature = formatRemainCracker(
        remainCrackerCount ?? getLastRemainCrackerCount()
      );
      const diffCrackerSignature = String(diffCrackerCount ?? '-');
      const usedCrackerSignature = String(spentDisplay.total || 0);

      scheduleEstimatedUsedCracker(info);

      const nextStats = {};

      if (turnSignature !== lastTurnSignature) {
        lastTurnSignature = turnSignature;
        nextStats.turn = turnSignature;
      }

      if (totalTurnSignature !== lastTotalTurnSignature) {
        lastTotalTurnSignature = totalTurnSignature;
        nextStats.totalTurn = totalTurnSignature;
      }

      if (remainCrackerSignature !== lastRemainCrackerSignature) {
        lastRemainCrackerSignature = remainCrackerSignature;
        nextStats.remainCracker = remainCrackerSignature;
      }

      if (diffCrackerSignature !== lastDiffCrackerSignature) {
        lastDiffCrackerSignature = diffCrackerSignature;
        nextStats.diffCracker = diffCrackerSignature;
      }

      if (usedCrackerSignature !== lastUsedCrackerSignature) {
        lastUsedCrackerSignature = usedCrackerSignature;
        nextStats.usedCracker = usedCrackerSignature;
      }

      if (Object.keys(nextStats).length > 0) {
        window.CrackIndicator?.setStats?.(nextStats);
      }
    } finally {
      isReadingTurn = false;
    }
  }

  function scheduleTurnRefresh(delay = TURN_REFRESH_DELAY_MS) {
    if (turnTimerId) clearTimeout(turnTimerId);

    turnTimerId = setTimeout(() => {
      turnTimerId = 0;
      refreshTurnCount();
    }, delay);
  }

  function isOwnUiNode(node) {
    if (!node || node === document || node === window) return false;

    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!el) return false;

    return Boolean(
      el.id === ROOT_ID ||
      el.id === ANCHOR_ID ||
      el.id === POPOVER_ID ||
      el.id === STYLE_ID ||
      el.closest?.(`#${ROOT_ID}, #${ANCHOR_ID}, #${POPOVER_ID}`)
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

  function scheduleTopSyncBurst(event = null) {
    if (positionMode !== 'top') {
      scheduleMount(true);
      return;
    }

    if (event) dropStandaloneAnchorImmediately(event);

    scheduleMount(true);
    setTimeout(() => scheduleMount(true), 80);
    setTimeout(() => scheduleMount(true), 180);
  }

  function observe() {
    const observer = new MutationObserver((mutations) => {
      if (mutations.every(isOwnMutation)) return;
      scheduleMount();
      scheduleTurnRefresh();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    window.addEventListener('scroll', () => {
      scheduleMount();
      schedulePopoverPosition();
    }, true);

    window.addEventListener('resize', () => {
      scheduleMount(true);
      schedulePopoverPosition();
    });

    document.addEventListener('focusin', (event) => {
      scheduleTopSyncBurst(event);
      scheduleTurnRefresh(800);
    }, true);

    document.addEventListener('focusout', () => {
      scheduleTopSyncBurst();
    }, true);

    document.addEventListener('pointerdown', (event) => {
      scheduleTopSyncBurst(event);
    }, true);

    document.addEventListener('click', () => {
      scheduleTopSyncBurst();
      scheduleTurnRefresh(800);
    }, true);
  }

  window.CrackIndicator = {
    setStat(key, value) {
      const stat = stats.find((item) => item.key === key);
      if (!stat) return;

      const nextValue = value == null || value === '' ? '-' : String(value);
      if (stat.value === nextValue) return;

      stat.value = nextValue;
      render();
    },

    setStats(nextStats = {}) {
      let changed = false;

      Object.entries(nextStats).forEach(([key, value]) => {
        const stat = stats.find((item) => item.key === key);
        if (!stat) return;

        const nextValue = value == null || value === '' ? '-' : String(value);
        if (stat.value === nextValue) return;

        stat.value = nextValue;
        changed = true;
      });

      if (changed) render();
    },

    async debugTurn() {
      const info = await readTurnInfo();
      const domGroups = document.querySelectorAll('div[data-message-group-id]').length;

      return {
        hasCrackUtil: typeof CrackUtil !== 'undefined',
        info,
        domGroups,
        currentDisplayedTurn: stats.find((item) => item.key === 'turn')?.value,
        currentDisplayedTotalTurn: stats.find((item) => item.key === 'totalTurn')?.value,
        remainCracker: readRemainCrackerCount(),
        storedRemainCracker: getLastRemainCrackerCount(),
        storedDiffCracker: getLastDiffCracker(info?.chatId || getCurrentChatIdSafe()),
        spent: getSpentDisplay(info?.chatId || getCurrentChatIdSafe()),
        historyPageLimits: {
          normal: DEFAULT_HISTORY_PAGE_LIMIT,
          deep: DEEP_HISTORY_PAGE_LIMIT,
          aiTailMinutes: AI_TURN_TAIL_WINDOW_MS / 60000,
          deletedFallbackMinutes: DELETED_TURN_FALLBACK_WINDOW_MS / 60000,
        },
        currentChatTitleForHistory: readCurrentChatTitle(),
        normalizedChatTitleForHistory: normalizeHistoryTitle(readCurrentChatTitle()),
        currentDisplayedRemainCracker: stats.find((item) => item.key === 'remainCracker')?.value,
        currentDisplayedDiffCracker: stats.find((item) => item.key === 'diffCracker')?.value,
        currentDisplayedUsedCracker: stats.find((item) => item.key === 'usedCracker')?.value,
        isDefaultUsedCrackerScanning: isCalculatingUsedCracker,
      };
    },

    show() {
      const root = document.getElementById(ROOT_ID);
      if (root) root.style.display = '';
    },

    hide() {
      const root = document.getElementById(ROOT_ID);
      if (root) root.style.display = 'none';
    },
  };

  mount();
  observe();
  scheduleTurnRefresh(0);
})();

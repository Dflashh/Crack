// ==UserScript==
// @name         Crack Indicator
// @namespace    https://github.com/Dflashh/Crack
// @version      1.0.0
// @description  Crack chat indicator UI
// @match        *://crack.wrtn.ai/*
// @author       깡통들과 나
// @icon         https://cdn.jsdelivr.net/gh/Dflashh/Crack@main/Icon/Indicator.webp
// @downloadURL  https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/Indicator.user.js
// @updateURL    https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/Indicator.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';

  const ROOT_ID = 'crack-indicator-root';
  const STYLE_ID = 'crack-indicator-style';
  const CRACK_STATS_API = {
    balance: 'https://crack-api.wrtn.ai/crack-cash/crackers',
    rawMessages: 'https://contents-api.wrtn.ai/character-chat/v3/chats',
  };
  const TURN_REFRESH_DELAY_MS = 400;
  const TURN_CACHE_MS = 1200;
  const BALANCE_CACHE_MS = 700;
  const BALANCE_POLL_CHECKPOINTS_MS = [250, 500, 900, 1400, 2200, 3200, 4800, 7000, 10000, 14000];


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
  const MOUNT_THROTTLE_MS = 120;

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

      :root {
        --ci-bg: rgba(248, 248, 248, 0.74);
        --ci-text: rgba(17, 24, 39, 0.92);
        --ci-muted: rgba(75, 85, 99, 0.72);
        --ci-chip: rgba(255, 255, 255, 0.66);
        --ci-chip-border: rgba(0, 0, 0, 0.075);
        --ci-accent: #FE4532;
      }

      html.dark,
      html[data-theme="dark"],
      html[data-crack-ui-theme-mode="dark"] {
        --ci-bg: rgba(18, 18, 20, 0.78);
        --ci-text: rgba(255, 255, 255, 0.92);
        --ci-muted: rgba(235, 235, 245, 0.62);
        --ci-chip: rgba(255, 255, 255, 0.13);
        --ci-chip-border: rgba(255, 255, 255, 0.12);
        --ci-accent: #FE4532;
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
    return stats.map((stat) => `${stat.key}:${stat.value}`).join('|');
  }

  function renderList(root) {
    if (!root) return;

    const list = root.querySelector('.ci-list');
    if (!list) return;

    const signature = getListSignature();
    if (list.dataset.ciSignature === signature) return;

    list.dataset.ciSignature = signature;
    list.innerHTML = '';

    stats.forEach((stat) => {
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

  function mount() {
    injectStyle();
    mountToComposer(getRoot());
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
    const userRows = rows.filter(isUserMessage);
    const userIds = new Set(userRows.map(getMessageId).filter(Boolean));
    const idlessUserCount = userRows.filter((message) => !getMessageId(message)).length;
    const turns = userIds.size + idlessUserCount;

    const info = { chatId, turn: turns };

    lastTurnFetchAt = now;
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

    // 차감 크래커는 방 단위 상태다.
    // 방을 바꿀 때만 '-'로 시작하고, 같은 방에서는 새 차감이 생길 때까지 마지막 값을 유지한다.
    lastTurnSignature = '-';
    setStats({ turn: '-', diffCracker: '-' });

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

    setStat('diffCracker', displayValue);

    console.log(`[CrackIndicator] -${normalized} 크래커`);
    return normalized;
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
        scheduleTurnRefresh(0, true);
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

    // Enter + 버튼 click + dataLayer start가 연달아 들어오는 경우 한 번만 시작한다.
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
          // 시작 이벤트를 놓쳤더라도 기존 관측 잔액과 비교할 기회를 준다.
          scheduleTurnRefresh(0, true);
          setTimeout(() => scheduleTurnRefresh(0, true), 500);
          setTimeout(() => scheduleTurnRefresh(0, true), 1200);
        }
      }

      return result;
    };

    dataLayer.__crackIndicatorWrapped = true;
  }

  async function refreshTurnCount(force = false) {
    if (isReadingTurn) return;
    isReadingTurn = true;

    try {
      const chatId = getCurrentChatIdFromUrl();
      const chatChanged = syncChatContext(chatId);
      const previousObservedBalance = chatChanged ? null : lastObservedBalance;
      const [info, balance] = await Promise.all([
        getTurnStats(chatId, force || chatChanged).catch((error) => {
          console.warn('[CrackIndicator] 턴 조회 실패', error);
          return lastTurnInfoCache?.chatId === chatId ? lastTurnInfoCache : null;
        }),
        getBalance(force || chatChanged),
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
    if (turnTimerId) clearTimeout(turnTimerId);

    turnTimerId = setTimeout(() => {
      turnTimerId = 0;
      refreshTurnCount(force);
    }, delay);
  }

  function isOwnUiNode(node) {
    if (!node || node === document || node === window) return false;

    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!el) return false;

    return Boolean(
      el.id === ROOT_ID ||
      el.id === STYLE_ID ||
      el.closest?.(`#${ROOT_ID}`)
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

    window.addEventListener('resize', () => {
      scheduleMount(true);
    });

    document.addEventListener('focusin', () => {
      scheduleMount(true);
      scheduleTurnRefresh(800);
    }, true);

    document.addEventListener('click', () => {
      scheduleMount(true);
      scheduleTurnRefresh(800);
    }, true);
  }

  mount();
  observe();
  watchChatRouteChanges();
  watchGenerationSignals();
  scheduleTurnRefresh(0, true);
})();

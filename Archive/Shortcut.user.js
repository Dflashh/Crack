// ==UserScript==
// @name         Crack Shortcut
// @namespace    https://github.com/Dflashh/Crack
// @version      0.1.0
// @description  crack.wrtn.ai 단축키 커스텀/리맵
// @match        *://crack.wrtn.ai/*
// @author       깡통들과 나

// @connect      crack-api.wrtn.ai
// @icon         https://cdn.jsdelivr.net/gh/Dflashh/Crack@main/Icon/Shortcut.webp
// @downloadURL  https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/Shortcut.user.js
// @updateURL    https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/Shortcut.user.js
// @run-at       document-start
// @grant        GM_registerMenuCommand
// ==/UserScript==

(() => {
  'use strict';

  const STORAGE_KEY = 'crack.shortcut.customizer.v1';
  const PANEL_ID = 'crack-shortcut-customizer-panel';

  // 설정창 열기/닫기 단축키
  const PANEL_SHORTCUT = 'ctrl+shift+,';

  // true면 리맵한 뒤 기존 원래 단축키는 막음.
  // 예: 유저노트를 Ctrl+J로 바꾸면 기존 Ctrl+I는 더 이상 작동 안 함.
  const BLOCK_ORIGINAL_AFTER_REMAP = true;

  const ACTIONS = [
    { id: 'history', group: '일반', name: '대화 내역 열기/닫기', original: 'ctrl+shift+s', custom: 'ctrl+shift+s' },
    { id: 'help', group: '일반', name: '도움말', original: 'ctrl+shift+/', custom: 'ctrl+shift+/' },

    { id: 'focus_input', group: '채팅방', name: '인풋 창 포커스', original: 'enter', custom: 'enter' },
    { id: 'blur_input', group: '채팅방', name: '인풋 창 포커스 해제', original: 'esc', custom: 'esc' },
    { id: 'new_chat', group: '채팅방', name: '이 캐릭터와 새로 대화 시작하기', original: 'ctrl+alt+n', custom: 'ctrl+alt+n' },
    { id: 'suggest', group: '채팅방', name: '추천 답변 받기', original: 'ctrl+/', custom: 'ctrl+/' },
    { id: 'user_note', group: '채팅방', name: '유저노트 열기/닫기', original: 'ctrl+i', custom: 'ctrl+i' },
    { id: 'memory', group: '채팅방', name: '요약 메모리 열기/닫기', original: 'ctrl+shift+u', custom: 'ctrl+shift+u' },
    { id: 'pick_suggest_1', group: '채팅방', name: '추천 답변 선택하기 1', original: 'ctrl+1', custom: 'ctrl+1' },
    { id: 'pick_suggest_2', group: '채팅방', name: '추천 답변 선택하기 2', original: 'ctrl+2', custom: 'ctrl+2' },
    { id: 'pick_suggest_3', group: '채팅방', name: '추천 답변 선택하기 3', original: 'ctrl+3', custom: 'ctrl+3' },
    { id: 'scene_image', group: '채팅방', name: '상황 이미지 생성하기', original: 'ctrl+k', custom: 'ctrl+k' },
    { id: 'add_situation', group: '채팅방', name: '상황 추가하기', original: 'ctrl+shift+e', custom: 'ctrl+shift+e' },
    { id: 'regenerate', group: '채팅방', name: '답변 재생성하기', original: 'ctrl+alt+r', custom: 'ctrl+alt+r' },
    { id: 'room_settings', group: '채팅방', name: '채팅방 설정 열기/닫기', original: 'ctrl+0', custom: 'ctrl+0' },
  ];

  let relaying = false;
  let recordingActionId = null;
  let config = loadConfig();

  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand('Crack 단축키 설정 열기', togglePanel);
  }

  document.addEventListener('keydown', onKeyDownCapture, true);

  function onKeyDownCapture(e) {
    if (relaying) return;

    const combo = comboFromEvent(e);
    if (!combo) return;

    if (recordingActionId) {
      e.preventDefault();
      e.stopImmediatePropagation();
      setCustomShortcut(recordingActionId, combo);
      recordingActionId = null;
      renderPanel();
      return;
    }

    if (combo === normalizeCombo(PANEL_SHORTCUT)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      togglePanel();
      return;
    }

    const actionByCustom = ACTIONS.find((action) => getCustomShortcut(action) === combo);
    if (actionByCustom && !shouldIgnoreShortcut(e, actionByCustom, combo)) {
      const original = normalizeCombo(actionByCustom.original);

      // 커스텀이 원래 단축키와 같으면 사이트 기본 핸들러에 맡김.
      if (combo === original) return;

      e.preventDefault();
      e.stopImmediatePropagation();
      relayOriginalShortcut(original);
      return;
    }

    if (BLOCK_ORIGINAL_AFTER_REMAP) {
      const oldAction = ACTIONS.find(
        (action) => normalizeCombo(action.original) === combo && getCustomShortcut(action) !== combo
      );

      if (oldAction && !shouldIgnoreShortcut(e, oldAction, combo)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }
  }

  function shouldIgnoreShortcut(e, action, combo) {
    const active = document.activeElement;
    if (!isEditable(active)) return false;

    // Esc는 입력 중에도 포커스 해제용으로 허용.
    if (action.id === 'blur_input') return false;

    const parsed = parseCombo(combo);
    if (!parsed) return true;

    // Ctrl/Alt/Meta 조합은 입력 중에도 커스텀 단축키로 인정.
    // 단일 문자, Enter 등은 타이핑 방해 방지를 위해 무시.
    return !(parsed.ctrl || parsed.alt || parsed.meta);
  }

  function relayOriginalShortcut(combo) {
    const parsed = parseCombo(combo);
    if (!parsed) return;

    const keyInfo = getKeyInfo(parsed.key);
    const target = document.activeElement || document.body || document.documentElement || document;

    relaying = true;
    try {
      dispatchKeyboardEvent(target, 'keydown', parsed, keyInfo);
      dispatchKeyboardEvent(target, 'keyup', parsed, keyInfo);
    } finally {
      relaying = false;
    }
  }

  function dispatchKeyboardEvent(target, type, parsed, keyInfo) {
    const event = new KeyboardEvent(type, {
      key: keyInfo.key,
      code: keyInfo.code,
      ctrlKey: parsed.ctrl,
      shiftKey: parsed.shift,
      altKey: parsed.alt,
      metaKey: parsed.meta,
      bubbles: true,
      cancelable: true,
      composed: true,
    });

    // 일부 단축키 라이브러리는 keyCode/which를 봄.
    try {
      Object.defineProperty(event, 'keyCode', { get: () => keyInfo.keyCode });
      Object.defineProperty(event, 'which', { get: () => keyInfo.keyCode });
    } catch (_) {}

    target.dispatchEvent(event);
  }

  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function saveConfig() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  function getCustomShortcut(action) {
    const saved = Object.prototype.hasOwnProperty.call(config, action.id)
      ? config[action.id]
      : action.custom;

    return normalizeCombo(saved || '');
  }

  function setCustomShortcut(actionId, combo) {
    config[actionId] = normalizeCombo(combo || '');
    saveConfig();
  }

  function resetShortcut(actionId) {
    delete config[actionId];
    saveConfig();
  }

  function resetAllShortcuts() {
    config = {};
    saveConfig();
  }

  function normalizeCombo(combo) {
    const parsed = parseCombo(combo);
    return parsed ? stringifyCombo(parsed) : '';
  }

  function parseCombo(combo) {
    if (!combo || typeof combo !== 'string') return null;

    const parts = combo
      .toLowerCase()
      .replace(/\s+/g, '')
      .split('+')
      .filter(Boolean);

    const parsed = { ctrl: false, shift: false, alt: false, meta: false, key: '' };

    for (const part of parts) {
      if (part === 'ctrl' || part === 'control') parsed.ctrl = true;
      else if (part === 'shift') parsed.shift = true;
      else if (part === 'alt' || part === 'option') parsed.alt = true;
      else if (part === 'meta' || part === 'cmd' || part === 'command' || part === 'win') parsed.meta = true;
      else parsed.key = normalizeKeyName(part);
    }

    if (!parsed.key) return null;
    return parsed;
  }

  function stringifyCombo(parsed) {
    const out = [];
    if (parsed.ctrl) out.push('ctrl');
    if (parsed.shift) out.push('shift');
    if (parsed.alt) out.push('alt');
    if (parsed.meta) out.push('meta');
    out.push(normalizeKeyName(parsed.key));
    return out.join('+');
  }

  function humanCombo(combo) {
    const parsed = parseCombo(combo);
    if (!parsed) return '';

    const out = [];
    if (parsed.ctrl) out.push('Ctrl');
    if (parsed.shift) out.push('Shift');
    if (parsed.alt) out.push('Alt');
    if (parsed.meta) out.push('Cmd');

    const keyLabels = {
      esc: 'Esc',
      enter: 'Enter',
      space: 'Space',
      tab: 'Tab',
      up: '↑',
      down: '↓',
      left: '←',
      right: '→',
    };

    out.push(keyLabels[parsed.key] || parsed.key.toUpperCase());
    return out.join(' + ');
  }

  function normalizeKeyName(key) {
    const k = String(key || '').toLowerCase();

    const aliases = {
      escape: 'esc',
      ' ': 'space',
      arrowup: 'up',
      arrowdown: 'down',
      arrowleft: 'left',
      arrowright: 'right',
    };

    return aliases[k] || k;
  }

  function comboFromEvent(e) {
    const key = keyFromEvent(e);
    if (!key) return '';

    return stringifyCombo({
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      meta: e.metaKey,
      key,
    });
  }

  function keyFromEvent(e) {
    const code = e.code || '';

    if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
    if (/^Digit[0-9]$/.test(code)) return code.slice(5);

    const byCode = {
      Slash: '/',
      Period: '.',
      Comma: ',',
      Semicolon: ';',
      Quote: "'",
      BracketLeft: '[',
      BracketRight: ']',
      Backslash: '\\',
      Minus: '-',
      Equal: '=',
      Backquote: '`',
      Space: 'space',
      Escape: 'esc',
      Enter: 'enter',
      Tab: 'tab',
      Backspace: 'backspace',
      Delete: 'delete',
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      Home: 'home',
      End: 'end',
      PageUp: 'pageup',
      PageDown: 'pagedown',
    };

    if (byCode[code]) return byCode[code];

    const key = normalizeKeyName(e.key);
    if (['control', 'shift', 'alt', 'meta'].includes(key)) return '';

    return key;
  }

  function getKeyInfo(key) {
    const k = normalizeKeyName(key);

    if (/^[a-z]$/.test(k)) {
      return {
        key: k,
        code: `Key${k.toUpperCase()}`,
        keyCode: k.toUpperCase().charCodeAt(0),
      };
    }

    if (/^[0-9]$/.test(k)) {
      return {
        key: k,
        code: `Digit${k}`,
        keyCode: 48 + Number(k),
      };
    }

    const map = {
      '/': { key: '/', code: 'Slash', keyCode: 191 },
      '.': { key: '.', code: 'Period', keyCode: 190 },
      ',': { key: ',', code: 'Comma', keyCode: 188 },
      ';': { key: ';', code: 'Semicolon', keyCode: 186 },
      "'": { key: "'", code: 'Quote', keyCode: 222 },
      '[': { key: '[', code: 'BracketLeft', keyCode: 219 },
      ']': { key: ']', code: 'BracketRight', keyCode: 221 },
      '\\': { key: '\\', code: 'Backslash', keyCode: 220 },
      '-': { key: '-', code: 'Minus', keyCode: 189 },
      '=': { key: '=', code: 'Equal', keyCode: 187 },
      '`': { key: '`', code: 'Backquote', keyCode: 192 },
      enter: { key: 'Enter', code: 'Enter', keyCode: 13 },
      esc: { key: 'Escape', code: 'Escape', keyCode: 27 },
      space: { key: ' ', code: 'Space', keyCode: 32 },
      tab: { key: 'Tab', code: 'Tab', keyCode: 9 },
      backspace: { key: 'Backspace', code: 'Backspace', keyCode: 8 },
      delete: { key: 'Delete', code: 'Delete', keyCode: 46 },
      up: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
      down: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
      left: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
      right: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
      home: { key: 'Home', code: 'Home', keyCode: 36 },
      end: { key: 'End', code: 'End', keyCode: 35 },
      pageup: { key: 'PageUp', code: 'PageUp', keyCode: 33 },
      pagedown: { key: 'PageDown', code: 'PageDown', keyCode: 34 },
    };

    return map[k] || { key: k, code: '', keyCode: 0 };
  }

  function isEditable(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    if (el.isContentEditable) return true;

    return Boolean(
      el.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')
    );
  }

  function togglePanel() {
    ensurePanel();

    const panel = document.getElementById(PANEL_ID);
    const isOpen = panel.style.display !== 'none';

    panel.style.display = isOpen ? 'none' : 'block';
    recordingActionId = null;

    if (!isOpen) {
      renderPanel();
      panel.focus();
    }
  }

  function ensurePanel() {
    if (document.getElementById(PANEL_ID)) return;

    const style = document.createElement('style');
    style.textContent = `
      #${PANEL_ID} {
        position: fixed;
        z-index: 2147483647;
        inset: 64px auto auto 50%;
        transform: translateX(-50%);
        width: min(760px, calc(100vw - 28px));
        max-height: calc(100vh - 96px);
        overflow: auto;
        color: #f5f5f5;
        font-family: Pretendard, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        outline: none;
      }

      #${PANEL_ID} .csc-card {
        background: rgba(20, 20, 24, 0.96);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 18px;
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
        padding: 18px;
        backdrop-filter: blur(16px);
      }

      #${PANEL_ID} .csc-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
      }

      #${PANEL_ID} h2 {
        font-size: 20px;
        margin: 0;
      }

      #${PANEL_ID} h3 {
        font-size: 15px;
        margin: 18px 0 8px;
        color: #d7d7d7;
      }

      #${PANEL_ID} p {
        margin: 6px 0 14px;
        color: #b8b8b8;
        font-size: 13px;
        line-height: 1.5;
      }

      #${PANEL_ID} .csc-row {
        display: grid;
        grid-template-columns: minmax(160px, 1.5fr) minmax(120px, 0.8fr) minmax(160px, 1fr) auto auto auto;
        gap: 8px;
        align-items: center;
        padding: 8px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      #${PANEL_ID} .csc-name {
        font-size: 13px;
        color: #eeeeee;
      }

      #${PANEL_ID} .csc-original {
        font-size: 12px;
        color: #90b7ff;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }

      #${PANEL_ID} input {
        width: 100%;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 10px;
        padding: 9px 10px;
        font-size: 13px;
        outline: none;
      }

      #${PANEL_ID} input:focus {
        border-color: rgba(130, 170, 255, 0.9);
      }

      #${PANEL_ID} .csc-conflict input {
        border-color: rgba(255, 100, 100, 0.95);
      }

      #${PANEL_ID} .csc-warn {
        color: #ff8b8b;
        font-size: 11px;
        white-space: nowrap;
      }

      #${PANEL_ID} button {
        appearance: none;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        padding: 8px 10px;
        cursor: pointer;
        font-size: 12px;
      }

      #${PANEL_ID} button:hover {
        background: rgba(255, 255, 255, 0.18);
      }

      #${PANEL_ID} .csc-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }

      #${PANEL_ID} .csc-recording {
        background: rgba(80, 130, 255, 0.35);
        border-color: rgba(120, 170, 255, 0.8);
      }

      @media (max-width: 680px) {
        #${PANEL_ID} .csc-row {
          grid-template-columns: 1fr;
          gap: 6px;
        }

        #${PANEL_ID} .csc-warn {
          white-space: normal;
        }
      }
    `;

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.tabIndex = -1;
    panel.style.display = 'none';
    panel.innerHTML = `
      <div class="csc-card">
        <div class="csc-head">
          <h2>Crack 단축키 커스텀</h2>
          <button type="button" data-csc-close>닫기</button>
        </div>

        <p>
          설정창 열기/닫기: <b>Ctrl + Shift + ,</b><br>
          입력칸에 직접 쓰거나 <b>키 입력</b>을 누른 뒤 원하는 키 조합을 누르면 저장됨.
          빈칸으로 두면 해당 커스텀 단축키는 비활성화.
        </p>

        <div data-csc-rows></div>

        <div class="csc-actions">
          <button type="button" data-csc-reset-all>전체 초기화</button>
          <button type="button" data-csc-close>닫기</button>
        </div>
      </div>
    `;

    const root = document.body || document.documentElement;
    root.appendChild(style);
    root.appendChild(panel);

    panel.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (!button) return;

      if (button.matches('[data-csc-close]')) {
        panel.style.display = 'none';
        recordingActionId = null;
        return;
      }

      const recordId = button.getAttribute('data-csc-record');
      if (recordId) {
        recordingActionId = recordId;
        renderPanel();
        return;
      }

      const clearId = button.getAttribute('data-csc-clear');
      if (clearId) {
        setCustomShortcut(clearId, '');
        renderPanel();
        return;
      }

      const resetId = button.getAttribute('data-csc-reset');
      if (resetId) {
        resetShortcut(resetId);
        renderPanel();
        return;
      }

      if (button.matches('[data-csc-reset-all]')) {
        resetAllShortcuts();
        renderPanel();
      }
    });

    panel.addEventListener('change', (e) => {
      const input = e.target.closest('input[data-csc-input]');
      if (!input) return;

      const id = input.getAttribute('data-csc-input');
      const value = input.value.trim();
      const normalized = normalizeCombo(value);

      if (value && !normalized) {
        alert('단축키 형식을 못 읽었음. 예: Ctrl + Shift + J, Alt + A, Esc');
        renderPanel();
        return;
      }

      setCustomShortcut(id, normalized);
      renderPanel();
    });
  }

  function renderPanel() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;

    const rowsRoot = panel.querySelector('[data-csc-rows]');
    if (!rowsRoot) return;

    const duplicates = getDuplicateCombos();
    const groups = [...new Set(ACTIONS.map((action) => action.group))];

    rowsRoot.innerHTML = '';

    for (const group of groups) {
      const title = document.createElement('h3');
      title.textContent = group;
      rowsRoot.appendChild(title);

      for (const action of ACTIONS.filter((item) => item.group === group)) {
        const custom = getCustomShortcut(action);
        const isConflict = custom && duplicates.get(custom)?.length > 1;

        const row = document.createElement('div');
        row.className = `csc-row${isConflict ? ' csc-conflict' : ''}`;
        row.innerHTML = `
          <div class="csc-name"></div>
          <div class="csc-original"></div>
          <input data-csc-input="" placeholder="예: Ctrl + Shift + J">
          <button type="button" data-csc-record="">키 입력</button>
          <button type="button" data-csc-clear="">비우기</button>
          <button type="button" data-csc-reset="">초기화</button>
          ${isConflict ? '<div class="csc-warn">중복</div>' : ''}
        `;

        row.querySelector('.csc-name').textContent = action.name;
        row.querySelector('.csc-original').textContent = `기본: ${humanCombo(action.original)}`;

        const input = row.querySelector('input');
        input.setAttribute('data-csc-input', action.id);
        input.value = custom ? humanCombo(custom) : '';

        row.querySelector('[data-csc-record]').setAttribute('data-csc-record', action.id);
        row.querySelector('[data-csc-clear]').setAttribute('data-csc-clear', action.id);
        row.querySelector('[data-csc-reset]').setAttribute('data-csc-reset', action.id);

        const recordButton = row.querySelector('[data-csc-record]');
        if (recordingActionId === action.id) {
          recordButton.textContent = '누르는 중...';
          recordButton.classList.add('csc-recording');
        }

        rowsRoot.appendChild(row);
      }
    }
  }

  function getDuplicateCombos() {
    const map = new Map();

    for (const action of ACTIONS) {
      const combo = getCustomShortcut(action);
      if (!combo) continue;

      if (!map.has(combo)) map.set(combo, []);
      map.get(combo).push(action.id);
    }

    return map;
  }
})();

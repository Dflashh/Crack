// ==UserScript==
// @name         Crack Shortcut Customizer
// @namespace    https://github.com/Dflashh/Crack
// @version      1.0.1
// @description  Crack 단축키를 내 마음대로 커스텀
// @match        *://crack.wrtn.ai/*
// @author       깡통들과 나
// @connect      crack-api.wrtn.ai
// @icon         https://cdn.jsdelivr.net/gh/Dflashh/Crack@main/Icon/Shortcut.webp
// @downloadURL  https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/Shortcut.user.js
// @updateURL    https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/Shortcut.user.js
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

(() => {
  'use strict';

  const ID = {
    panel: 'crack-sc-panel',
    toast: 'crack-sc-toast',
    backdrop: 'crack-sc-backdrop',
  };

  const LS = {
    config: 'crack_shortcut_customizer_config_v2',
    disabledBackup: 'crack_shortcut_customizer_disabled_backup_v1',
    sectionGeneralOpen: 'crack_shortcut_customizer_section_general_open',
    sectionChatOpen: 'crack_shortcut_customizer_section_chat_open',
  };

  const CLS = {
    panelOpen: 'crack-sc-panel-open',
  };

  const PANEL_SHORTCUT = 'ctrl+shift+,';
  const BLOCK_ORIGINAL_AFTER_REMAP = true;

  const ACTIONS = [
    { id: 'history', group: '일반', name: '대화 내역 열기/닫기', original: 'ctrl+shift+s' },
    { id: 'help', group: '일반', name: '도움말', original: 'ctrl+shift+/' },

    { id: 'focus_input', group: '채팅방', name: '인풋 창 포커스', original: 'enter' },
    { id: 'blur_input', group: '채팅방', name: '인풋 창 포커스 해제', original: 'esc' },
    { id: 'new_chat', group: '채팅방', name: '이 캐릭터와 새로 대화 시작하기', original: 'ctrl+alt+n' },
    { id: 'suggest', group: '채팅방', name: '추천 답변 받기', original: 'ctrl+/' },
    { id: 'user_note', group: '채팅방', name: '유저노트 열기/닫기', original: 'ctrl+i' },
    { id: 'memory', group: '채팅방', name: '요약 메모리 열기/닫기', original: 'ctrl+shift+u' },
    { id: 'pick_suggest_1', group: '채팅방', name: '추천 답변 선택 1', helpName: '추천 답변 선택하기', original: 'ctrl+1' },
    { id: 'pick_suggest_2', group: '채팅방', name: '추천 답변 선택 2', helpName: '추천 답변 선택하기', original: 'ctrl+2' },
    { id: 'pick_suggest_3', group: '채팅방', name: '추천 답변 선택 3', helpName: '추천 답변 선택하기', original: 'ctrl+3' },
    { id: 'scene_image', group: '채팅방', name: '상황 이미지 생성하기', original: 'ctrl+k' },
    { id: 'add_situation', group: '채팅방', name: '상황 추가하기', original: 'ctrl+shift+e' },
    { id: 'regenerate', group: '채팅방', name: '답변 재생성하기', original: 'ctrl+alt+r' },
    { id: 'room_settings', group: '채팅방', name: '채팅방 설정 열기/닫기', original: 'ctrl+0' },
  ];

  const GROUP_STORAGE = {
    일반: LS.sectionGeneralOpen,
    채팅방: LS.sectionChatOpen,
  };

  let config = loadConfig();
  let disabledBackup = loadDisabledBackup();
  let recordingActionId = null;
  let relaying = false;
  let lastAnchor = null;
  let domEnhanceScheduled = false;
  let helpPatchScheduled = false;

  addStyle();

  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand('Crack 단축어 커스텀 열기', () => openPanel(null));
  }

  document.addEventListener('keydown', onKeyDownCapture, true);
  document.addEventListener('pointerdown', onDocumentPointerDown, true);
  window.addEventListener('resize', () => {
    if (isPanelOpen()) positionPanel();
  });

  ready(() => {
    ensurePanel();
    scheduleDomEnhance();
    observeDom();
  });

  function onKeyDownCapture(e) {
    if (relaying) return;

    const combo = comboFromEvent(e);
    if (!combo) return;

    if (recordingActionId) {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (combo === 'backspace') {
        setCustomShortcut(recordingActionId, '');
        showToast('단축키를 껐음');
      } else {
        setCustomShortcut(recordingActionId, combo);
        showToast(`${getActionName(recordingActionId)} → ${humanCombo(combo)}`);
      }

      recordingActionId = null;
      renderPanel();
      scheduleHelpPatch();
      return;
    }

    if (combo === normalizeCombo(PANEL_SHORTCUT)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      togglePanel(null);
      return;
    }

    const actionByCustom = ACTIONS.find((action) => getCustomShortcut(action) === combo);
    if (actionByCustom && !shouldIgnoreShortcut(e, actionByCustom, combo)) {
      const original = normalizeCombo(actionByCustom.original);

      if (combo === original) return;

      e.preventDefault();
      e.stopImmediatePropagation();
      relayOriginalShortcut(original);
      return;
    }

    if (BLOCK_ORIGINAL_AFTER_REMAP) {
      const originalAction = ACTIONS.find(
        (action) => normalizeCombo(action.original) === combo && getCustomShortcut(action) !== combo
      );

      if (originalAction && !shouldIgnoreShortcut(e, originalAction, combo)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }
  }

  function shouldIgnoreShortcut(e, action, combo) {
    const active = document.activeElement;
    if (!isEditable(active)) return false;

    if (action.id === 'blur_input') return false;

    const parsed = parseCombo(combo);
    if (!parsed) return true;

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

    try {
      Object.defineProperty(event, 'keyCode', { get: () => keyInfo.keyCode });
      Object.defineProperty(event, 'which', { get: () => keyInfo.keyCode });
    } catch (_) {}

    target.dispatchEvent(event);
  }

  function loadConfig() {
    try {
      const raw = localStorage.getItem(LS.config);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveConfig() {
    try {
      localStorage.setItem(LS.config, JSON.stringify(config));
    } catch (_) {}
  }

  function loadDisabledBackup() {
    try {
      const raw = localStorage.getItem(LS.disabledBackup);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveDisabledBackup() {
    try {
      localStorage.setItem(LS.disabledBackup, JSON.stringify(disabledBackup));
    } catch (_) {}
  }

  function readStorage(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value == null ? fallback : value;
    } catch (_) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (_) {}
  }

  function getCustomShortcut(action) {
    if (Object.prototype.hasOwnProperty.call(config, action.id)) {
      return normalizeCombo(config[action.id] || '');
    }
    return normalizeCombo(action.original);
  }

  function setCustomShortcut(actionId, combo) {
    const normalized = normalizeCombo(combo || '');
    config[actionId] = normalized;
    if (normalized) {
      disabledBackup[actionId] = normalized;
      saveDisabledBackup();
    }
    saveConfig();
  }

  function toggleShortcutEnabled(actionId) {
    const action = ACTIONS.find((item) => item.id === actionId);
    if (!action) return false;

    const current = getCustomShortcut(action);
    if (current) {
      disabledBackup[actionId] = current;
      saveDisabledBackup();
      config[actionId] = '';
      saveConfig();
      return false;
    }

    const restore = normalizeCombo(disabledBackup[actionId] || action.original);
    config[actionId] = restore;
    disabledBackup[actionId] = restore;
    saveDisabledBackup();
    saveConfig();
    return true;
  }

  function resetShortcut(actionId) {
    delete config[actionId];
    delete disabledBackup[actionId];
    saveDisabledBackup();
    saveConfig();
  }

  function resetAllShortcuts() {
    config = {};
    disabledBackup = {};
    saveDisabledBackup();
    saveConfig();
  }

  function getActionName(actionId) {
    return ACTIONS.find((action) => action.id === actionId)?.name || '단축키';
  }

  function normalizeCombo(combo) {
    const parsed = parseCombo(combo);
    return parsed ? stringifyCombo(parsed) : '';
  }

  function parseCombo(combo) {
    if (!combo || typeof combo !== 'string') return null;

    const raw = combo
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/⌘/g, 'meta')
      .replace(/cmd/g, 'meta')
      .replace(/command/g, 'meta')
      .replace(/option/g, 'alt')
      .replace(/control/g, 'ctrl');

    const parts = raw.split('+').filter(Boolean);
    const parsed = { ctrl: false, shift: false, alt: false, meta: false, key: '' };

    for (const part of parts) {
      if (part === 'ctrl') parsed.ctrl = true;
      else if (part === 'shift') parsed.shift = true;
      else if (part === 'alt') parsed.alt = true;
      else if (part === 'meta' || part === 'win') parsed.meta = true;
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
    if (!parsed) return '꺼짐';

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
      backspace: 'Backspace',
      delete: 'Delete',
      up: '↑',
      down: '↓',
      left: '←',
      right: '→',
      pageup: 'PageUp',
      pagedown: 'PageDown',
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
    if (/^Numpad[0-9]$/.test(code)) return code.slice(6);
    if (/^F([1-9]|1[0-2])$/.test(code)) return code.toLowerCase();

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
    if (['control', 'ctrl', 'shift', 'alt', 'meta'].includes(key)) return '';

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

    if (/^f([1-9]|1[0-2])$/.test(k)) {
      return {
        key: k.toUpperCase(),
        code: k.toUpperCase(),
        keyCode: 111 + Number(k.slice(1)),
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
      el.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""], [role="textbox"]')
    );
  }

  function addStyle() {
    const css = `
      :root {
        --crack-sc-z-backdrop: 2147483097;
        --crack-sc-z-panel: 2147483098;
        --crack-sc-z-toast: 2147483099;
      }

      html.${CLS.panelOpen} #${ID.backdrop} {
        display: block;
      }

      #${ID.backdrop} {
        position: fixed;
        inset: 0;
        z-index: var(--crack-sc-z-backdrop);
        display: none;
        background: rgba(0, 0, 0, .18);
        backdrop-filter: blur(1px);
        -webkit-backdrop-filter: blur(1px);
      }

      #${ID.panel} {
        position: fixed;
        z-index: var(--crack-sc-z-panel);
        width: 560px;
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
        animation: crackScPop .14s ease-out;
      }

      #${ID.panel}[data-open="1"] {
        display: block;
      }

      #${ID.panel}[data-centered="1"] {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      @keyframes crackScPop {
        from {
          opacity: 0;
          transform: translateY(-6px) scale(.985);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      #${ID.panel}[data-centered="1"] {
        animation-name: crackScPopCentered;
      }

      @keyframes crackScPopCentered {
        from {
          opacity: 0;
          transform: translate(-50%, calc(-50% - 6px)) scale(.985);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }

      .crack-sc-panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 0 2px 7px;
        min-height: 26px;
      }

      .crack-sc-title-wrap {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }

      .crack-sc-panel-title {
        font-size: 13px;
        font-weight: 900;
        line-height: 1;
        letter-spacing: -.02em;
      }

      .crack-sc-panel-subtitle {
        font-size: 11px;
        font-weight: 700;
        line-height: 1.2;
        color: rgba(255, 255, 255, .52);
      }

      .crack-sc-panel-close {
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
        transition: background-color 130ms ease, color 130ms ease;
      }

      .crack-sc-panel-close:hover {
        background: rgba(255, 255, 255, .12);
        color: rgba(255, 255, 255, .90);
      }

      .crack-sc-panel-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .crack-sc-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 6px;
        border-radius: 20px;
        background: rgba(255, 255, 255, .035);
        border: 1px solid rgba(255, 255, 255, .055);
        overflow: hidden;
      }

      .crack-sc-section-head {
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

      .crack-sc-section-head:hover {
        background: rgba(255, 255, 255, .055);
      }

      .crack-sc-section-title {
        font-size: 12px;
        font-weight: 900;
        line-height: 1;
        letter-spacing: -.02em;
        color: rgba(255, 255, 255, .94);
      }

      .crack-sc-section-chevron {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 999px;
        color: rgba(255, 255, 255, .64);
        font-size: 17px;
        font-weight: 950;
        line-height: 1;
        transform: rotate(90deg);
        transition: transform 150ms ease, background-color 130ms ease, color 130ms ease, box-shadow 130ms ease;
      }

      .crack-sc-section[data-open="0"] .crack-sc-section-chevron {
        transform: rotate(0deg);
      }

      .crack-sc-section-body {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .crack-sc-section[data-open="0"] .crack-sc-section-body {
        display: none;
      }

      .crack-sc-row {
        width: 100%;
        box-sizing: border-box;
        min-height: 58px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto auto;
        align-items: center;
        column-gap: 7px;
        padding: 10px;
        border-radius: 18px;
        background: rgba(0, 0, 0, .42);
        border: 1px solid rgba(255, 255, 255, .07);
        user-select: none;
        overflow: hidden;
        transition: background-color 130ms ease, border-color 130ms ease;
      }

      .crack-sc-row:hover {
        background: rgba(0, 0, 0, .48);
        border-color: rgba(255, 255, 255, .12);
      }

      .crack-sc-row[data-conflict="1"] {
        border-color: rgba(255, 69, 58, .58);
        background: rgba(255, 69, 58, .09);
      }

      .crack-sc-row-text {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
        overflow: hidden;
      }

      .crack-sc-row-name-line {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }

      .crack-sc-row-name {
        font-size: 13px;
        font-weight: 850;
        line-height: 1.1;
        color: rgba(255, 255, 255, .96);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .crack-sc-row-desc {
        font-size: 11px;
        line-height: 1.35;
        color: rgba(255, 255, 255, .58);
        word-break: keep-all;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .crack-sc-conflict-badge {
        display: inline-flex;
        align-items: center;
        height: 18px;
        padding: 0 7px;
        border-radius: 999px;
        color: rgba(255, 255, 255, .92);
        background: rgba(255, 69, 58, .44);
        font-size: 10px;
        font-weight: 900;
        line-height: 1;
      }

      .crack-sc-btn,
      .crack-sc-key-btn {
        appearance: none;
        min-height: 34px;
        border: 1px solid rgba(255, 255, 255, .085);
        border-radius: 13px;
        background: rgba(255, 255, 255, .055);
        color: rgba(255, 255, 255, .88);
        cursor: pointer;
        font-family: inherit;
        font-size: 11px;
        font-weight: 850;
        line-height: 1;
        transform: none !important;
        transition: background-color 130ms ease, border-color 130ms ease, color 130ms ease;
      }

      .crack-sc-btn {
        padding: 0 9px;
      }

      .crack-sc-row .crack-sc-btn[data-crack-sc-toggle] {
        width: 66px;
        min-width: 66px;
        padding: 0;
      }

      .crack-sc-row .crack-sc-btn[data-crack-sc-reset] {
        width: 54px;
        min-width: 54px;
        padding: 0;
      }

      .crack-sc-key-btn {
        min-width: 116px;
        padding: 0 11px;
        color: rgba(255, 255, 255, .94);
        background: rgba(255, 255, 255, .075);
        font-variant-numeric: tabular-nums;
      }

      .crack-sc-btn:hover,
      .crack-sc-key-btn:hover {
        background: rgba(255, 255, 255, .10);
        border-color: rgba(255, 255, 255, .16);
      }

      .crack-sc-key-btn[data-disabled="1"] {
        color: rgba(255, 255, 255, .42);
      }

      .crack-sc-btn[data-disabled="1"] {
        border-color: rgba(52, 199, 89, .34);
        background: rgba(52, 199, 89, .12);
        color: rgba(220, 255, 228, .92);
      }

      .crack-sc-btn[data-disabled="1"]:hover {
        border-color: rgba(52, 199, 89, .48);
        background: rgba(52, 199, 89, .18);
        color: rgba(245, 255, 248, .98);
      }

      .crack-sc-key-btn[data-recording="1"] {
        background: rgba(52, 199, 89, .18);
        border-color: rgba(52, 199, 89, .52);
        color: rgba(255, 255, 255, .96);
      }

      .crack-sc-panel-foot {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        padding: 1px 2px 0;
      }

      .crack-sc-foot-left,
      .crack-sc-foot-right {
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .crack-sc-foot-note {
        font-size: 11px;
        font-weight: 700;
        line-height: 1.35;
        color: rgba(255, 255, 255, .50);
      }

      #${ID.toast} {
        position: fixed;
        z-index: var(--crack-sc-z-toast);
        left: 50%;
        bottom: 22px;
        transform: translateX(-50%) translateY(14px);
        display: none;
        max-width: calc(100vw - 28px);
        padding: 10px 13px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, .12);
        background: rgba(28, 28, 30, .78);
        color: rgba(255, 255, 255, .92);
        box-shadow: 0 10px 28px rgba(0, 0, 0, .25);
        backdrop-filter: blur(20px) saturate(1.15);
        -webkit-backdrop-filter: blur(20px) saturate(1.15);
        font-size: 12px;
        font-weight: 850;
        line-height: 1;
        opacity: 0;
        transition: opacity 140ms ease, transform 140ms ease;
      }

      #${ID.toast}[data-show="1"] {
        display: block;
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      [data-crack-sc-settings-entry="1"] [role="button"] {
        border: 0 !important;
        border-radius: 0 !important;
        padding: 0 !important;
        background: transparent !important;
        transition: opacity 120ms ease;
      }

      [data-crack-sc-settings-entry="1"] [role="button"]:hover {
        background: transparent !important;
        opacity: .72;
      }

      body[data-theme="light"] #${ID.backdrop},
      html[data-theme="light"] #${ID.backdrop} {
        background: rgba(15, 23, 42, .10);
      }

      body[data-theme="light"] #${ID.panel},
      html[data-theme="light"] #${ID.panel},
      body[data-theme="light"] #${ID.toast},
      html[data-theme="light"] #${ID.toast} {
        border-color: rgba(17, 24, 39, .10);
        background: rgba(255, 255, 255, .82);
        color: rgba(17, 24, 39, .94);
        box-shadow:
          0 18px 46px rgba(15, 23, 42, .14),
          inset 0 1px 0 rgba(255, 255, 255, .72);
      }

      body[data-theme="light"] #${ID.panel} .crack-sc-panel-title,
      html[data-theme="light"] #${ID.panel} .crack-sc-panel-title,
      body[data-theme="light"] #${ID.panel} .crack-sc-section-title,
      html[data-theme="light"] #${ID.panel} .crack-sc-section-title,
      body[data-theme="light"] #${ID.panel} .crack-sc-row-name,
      html[data-theme="light"] #${ID.panel} .crack-sc-row-name {
        color: rgba(17, 24, 39, .94);
      }

      body[data-theme="light"] #${ID.panel} .crack-sc-panel-subtitle,
      html[data-theme="light"] #${ID.panel} .crack-sc-panel-subtitle,
      body[data-theme="light"] #${ID.panel} .crack-sc-row-desc,
      html[data-theme="light"] #${ID.panel} .crack-sc-row-desc,
      body[data-theme="light"] #${ID.panel} .crack-sc-foot-note,
      html[data-theme="light"] #${ID.panel} .crack-sc-foot-note {
        color: rgba(75, 85, 99, .72);
      }

      body[data-theme="light"] #${ID.panel} .crack-sc-section,
      html[data-theme="light"] #${ID.panel} .crack-sc-section {
        background: rgba(17, 24, 39, .035);
        border-color: rgba(17, 24, 39, .065);
      }

      body[data-theme="light"] #${ID.panel} .crack-sc-section-head:hover,
      html[data-theme="light"] #${ID.panel} .crack-sc-section-head:hover {
        background: rgba(17, 24, 39, .055);
      }

      body[data-theme="light"] #${ID.panel} .crack-sc-section-chevron,
      html[data-theme="light"] #${ID.panel} .crack-sc-section-chevron {
        color: rgba(17, 24, 39, .94);
        background: rgba(17, 24, 39, .105);
        box-shadow: inset 0 0 0 1px rgba(17, 24, 39, .08);
      }

      body[data-theme="light"] #${ID.panel} .crack-sc-section-head:hover .crack-sc-section-chevron,
      html[data-theme="light"] #${ID.panel} .crack-sc-section-head:hover .crack-sc-section-chevron {
        color: rgba(17, 24, 39, 1);
        background: rgba(17, 24, 39, .16);
        box-shadow: inset 0 0 0 1px rgba(17, 24, 39, .12);
      }

      body[data-theme="light"] [data-crack-sc-settings-entry="1"] [role="button"],
      html[data-theme="light"] [data-crack-sc-settings-entry="1"] [role="button"] {
        border: 0 !important;
        background: transparent !important;
      }

      body[data-theme="light"] [data-crack-sc-settings-entry="1"] [role="button"]:hover,
      html[data-theme="light"] [data-crack-sc-settings-entry="1"] [role="button"]:hover {
        background: transparent !important;
        opacity: .72;
      }

      body[data-theme="light"] #${ID.panel} .crack-sc-panel-close,
      html[data-theme="light"] #${ID.panel} .crack-sc-panel-close,
      body[data-theme="light"] #${ID.panel} .crack-sc-btn,
      html[data-theme="light"] #${ID.panel} .crack-sc-btn,
      body[data-theme="light"] #${ID.panel} .crack-sc-key-btn,
      html[data-theme="light"] #${ID.panel} .crack-sc-key-btn {
        background: rgba(17, 24, 39, .055);
        border-color: rgba(17, 24, 39, .075);
        color: rgba(17, 24, 39, .88);
      }

      body[data-theme="light"] #${ID.panel} .crack-sc-panel-close:hover,
      html[data-theme="light"] #${ID.panel} .crack-sc-panel-close:hover,
      body[data-theme="light"] #${ID.panel} .crack-sc-btn:hover,
      html[data-theme="light"] #${ID.panel} .crack-sc-btn:hover,
      body[data-theme="light"] #${ID.panel} .crack-sc-key-btn:hover,
      html[data-theme="light"] #${ID.panel} .crack-sc-key-btn:hover {
        background: rgba(17, 24, 39, .09);
        border-color: rgba(17, 24, 39, .13);
      }

      body[data-theme="light"] #${ID.panel} .crack-sc-row,
      html[data-theme="light"] #${ID.panel} .crack-sc-row {
        background: rgba(255, 255, 255, .72);
        border-color: rgba(17, 24, 39, .075);
      }

      body[data-theme="light"] #${ID.panel} .crack-sc-row:hover,
      html[data-theme="light"] #${ID.panel} .crack-sc-row:hover {
        background: rgba(255, 255, 255, .88);
        border-color: rgba(17, 24, 39, .12);
      }

      body[data-theme="light"] #${ID.panel} .crack-sc-row[data-conflict="1"],
      html[data-theme="light"] #${ID.panel} .crack-sc-row[data-conflict="1"] {
        border-color: rgba(255, 69, 58, .42);
        background: rgba(255, 69, 58, .08);
      }

      body[data-theme="light"] #${ID.panel} .crack-sc-key-btn[data-disabled="1"],
      html[data-theme="light"] #${ID.panel} .crack-sc-key-btn[data-disabled="1"] {
        color: rgba(75, 85, 99, .45);
      }

      body[data-theme="light"] #${ID.panel} .crack-sc-key-btn[data-recording="1"],
      html[data-theme="light"] #${ID.panel} .crack-sc-key-btn[data-recording="1"] {
        background: rgba(52, 199, 89, .16);
        border-color: rgba(52, 199, 89, .48);
        color: rgba(17, 24, 39, .94);
      }

      @media (max-width: 520px) {
        #${ID.backdrop} {
          background: rgba(0, 0, 0, .16);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
        }

        #${ID.panel} {
          width: auto;
          max-width: none;
          border-radius: 22px;
          padding: 7px;
        }

        #${ID.panel}[data-open="1"] {
          top: auto !important;
          left: 6px !important;
          right: 6px !important;
          bottom: max(6px, env(safe-area-inset-bottom)) !important;
          transform: none !important;
          width: auto;
          max-height: calc(100dvh - 12px - env(safe-area-inset-bottom));
          animation-name: crackScSheet;
        }

        @keyframes crackScSheet {
          from {
            opacity: 0;
            transform: translateY(20px) scale(.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .crack-sc-panel-head {
          position: sticky;
          top: -7px;
          z-index: 2;
          margin: -7px -7px 0;
          padding: 9px 8px 8px;
          border-radius: 21px 21px 14px 14px;
          background: rgba(28, 28, 30, .72);
          backdrop-filter: blur(18px) saturate(1.12);
          -webkit-backdrop-filter: blur(18px) saturate(1.12);
        }

        body[data-theme="light"] #${ID.panel} .crack-sc-panel-head,
        html[data-theme="light"] #${ID.panel} .crack-sc-panel-head {
          background: rgba(255, 255, 255, .76);
        }

        .crack-sc-panel-title {
          font-size: 14px;
        }

        .crack-sc-panel-subtitle {
          font-size: 10.5px;
          line-height: 1.25;
          white-space: normal;
        }

        .crack-sc-desktop-hint {
          display: none;
        }

        .crack-sc-panel-close {
          width: 30px;
          height: 30px;
          min-width: 30px;
          font-size: 19px;
        }

        .crack-sc-panel-body {
          gap: 7px;
        }

        .crack-sc-section {
          gap: 6px;
          padding: 5px;
          border-radius: 19px;
        }

        .crack-sc-section-head {
          min-height: 32px;
          padding: 5px 8px;
        }

        .crack-sc-section-title {
          font-size: 12px;
        }

        .crack-sc-section-chevron {
          width: 22px;
          height: 22px;
          font-size: 18px;
        }

        .crack-sc-section-body {
          gap: 6px;
        }

        .crack-sc-row {
          min-height: 0;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          row-gap: 8px;
          column-gap: 8px;
          padding: 10px;
          border-radius: 18px;
        }

        .crack-sc-row-text {
          grid-column: 1 / -1;
          gap: 5px;
        }

        .crack-sc-row-name-line {
          min-height: 18px;
        }

        .crack-sc-row-name {
          font-size: 13px;
          line-height: 1.25;
          white-space: normal;
        }

        .crack-sc-row-desc {
          font-size: 10.5px;
          line-height: 1.35;
          white-space: normal;
        }

        .crack-sc-key-btn {
          grid-column: 1 / -1;
          width: 100%;
          min-width: 0;
          min-height: 40px;
          padding: 0 10px;
          border-radius: 15px;
          font-size: 12px;
        }

        .crack-sc-row .crack-sc-btn {
          width: 100% !important;
          min-width: 0 !important;
          min-height: 38px;
          padding: 0 8px;
          border-radius: 14px;
          font-size: 11.5px;
        }

        .crack-sc-row .crack-sc-btn[data-crack-sc-toggle] {
          grid-column: 1 / span 1;
        }

        .crack-sc-row .crack-sc-btn[data-crack-sc-reset] {
          grid-column: 2 / span 1;
        }

        .crack-sc-panel-foot {
          flex-direction: column;
          gap: 8px;
          padding: 2px 1px 0;
        }

        .crack-sc-foot-left,
        .crack-sc-foot-right {
          width: 100%;
        }

        .crack-sc-foot-note {
          font-size: 10.5px;
          line-height: 1.35;
        }

        .crack-sc-foot-right .crack-sc-btn {
          flex: 1;
          min-height: 38px;
          border-radius: 14px;
        }

        #${ID.toast} {
          bottom: max(14px, env(safe-area-inset-bottom));
          max-width: calc(100vw - 24px);
          white-space: normal;
          line-height: 1.25;
          border-radius: 16px;
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

  function ready(fn) {
    if (document.body) fn();
    else requestAnimationFrame(() => ready(fn));
  }

  function ensurePanel() {
    if (document.getElementById(ID.panel)) return;

    const backdrop = document.createElement('div');
    backdrop.id = ID.backdrop;
    backdrop.addEventListener('click', closePanel);
    document.body.appendChild(backdrop);

    const panel = document.createElement('div');
    panel.id = ID.panel;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Crack 단축어 커스텀');
    panel.addEventListener('click', (e) => e.stopPropagation());
    panel.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    document.body.appendChild(panel);

    const toast = document.createElement('div');
    toast.id = ID.toast;
    document.body.appendChild(toast);

    renderPanel();
  }

  function renderPanel() {
    const panel = document.getElementById(ID.panel);
    if (!panel) return;

    const groups = [...new Set(ACTIONS.map((action) => action.group))];
    const duplicates = getDuplicateCombos();

    panel.innerHTML = `
      <div class="crack-sc-panel-head">
        <div class="crack-sc-title-wrap">
          <div class="crack-sc-panel-title">단축어 커스텀</div>
          <div class="crack-sc-panel-subtitle"><span class="crack-sc-desktop-hint">설정창: ${escapeHtml(humanCombo(PANEL_SHORTCUT))} · </span>키 버튼 누르고 원하는 조합 입력</div>
        </div>
        <button type="button" class="crack-sc-panel-close" data-crack-sc-close aria-label="닫기">×</button>
      </div>
      <div class="crack-sc-panel-body">
        ${groups.map((group) => renderGroup(group, duplicates)).join('')}
        <div class="crack-sc-panel-foot">
          <div class="crack-sc-foot-left">
            <span class="crack-sc-foot-note">Backspace 입력 = 비활성화 · 버튼으로 다시 활성화</span>
          </div>
          <div class="crack-sc-foot-right">
            <button type="button" class="crack-sc-btn" data-crack-sc-reset-all>전체 초기화</button>
            <button type="button" class="crack-sc-btn" data-crack-sc-close>닫기</button>
          </div>
        </div>
      </div>
    `;

    bindPanelEvents(panel);
    positionPanel();
  }

  function renderGroup(group, duplicates) {
    const storageKey = GROUP_STORAGE[group];
    const isOpen = readStorage(storageKey, '1') === '1';
    const rows = ACTIONS.filter((action) => action.group === group)
      .map((action) => renderActionRow(action, duplicates))
      .join('');

    return `
      <div class="crack-sc-section" data-crack-sc-section="${escapeAttr(group)}" data-open="${isOpen ? '1' : '0'}">
        <button type="button" class="crack-sc-section-head" data-crack-sc-section-toggle="${escapeAttr(group)}" aria-expanded="${isOpen ? 'true' : 'false'}">
          <span class="crack-sc-section-title">${escapeHtml(group)}</span>
          <span class="crack-sc-section-chevron" aria-hidden="true">›</span>
        </button>
        <div class="crack-sc-section-body">
          ${rows}
        </div>
      </div>
    `;
  }

  function renderActionRow(action, duplicates) {
    const custom = getCustomShortcut(action);
    const isDisabled = !custom;
    const isConflict = custom && duplicates.get(custom)?.length > 1;
    const isRecording = recordingActionId === action.id;
    const hasCustom = Object.prototype.hasOwnProperty.call(config, action.id);
    const label = isRecording ? '입력 대기…' : humanCombo(custom);
    const toggleLabel = isDisabled ? '활성화' : '비활성화';
    const desc = isDisabled
      ? `기본 ${humanCombo(action.original)} · 현재 꺼짐`
      : hasCustom && custom !== normalizeCombo(action.original)
        ? `기본 ${humanCombo(action.original)} · 변경됨`
        : `기본 ${humanCombo(action.original)}`;

    return `
      <div class="crack-sc-row" data-crack-sc-row="${escapeAttr(action.id)}" data-conflict="${isConflict ? '1' : '0'}">
        <span class="crack-sc-row-text">
          <span class="crack-sc-row-name-line">
            <span class="crack-sc-row-name">${escapeHtml(action.name)}</span>
            ${isConflict ? '<span class="crack-sc-conflict-badge">중복</span>' : ''}
          </span>
          <span class="crack-sc-row-desc">${escapeHtml(desc)}</span>
        </span>
        <button type="button" class="crack-sc-key-btn" data-crack-sc-record="${escapeAttr(action.id)}" data-disabled="${isDisabled ? '1' : '0'}" data-recording="${isRecording ? '1' : '0'}">${escapeHtml(label)}</button>
        <button type="button" class="crack-sc-btn" data-crack-sc-toggle="${escapeAttr(action.id)}" data-disabled="${isDisabled ? '1' : '0'}">${toggleLabel}</button>
        <button type="button" class="crack-sc-btn" data-crack-sc-reset="${escapeAttr(action.id)}">초기화</button>
      </div>
    `;
  }

  function bindPanelEvents(panel) {
    panel.querySelectorAll('[data-crack-sc-close]').forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closePanel();
      });
    });

    panel.querySelectorAll('[data-crack-sc-section-toggle]').forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const group = button.getAttribute('data-crack-sc-section-toggle');
        const section = panel.querySelector(`.crack-sc-section[data-crack-sc-section="${cssEscape(group)}"]`);
        if (!section) return;

        const nextOpen = section.getAttribute('data-open') !== '1';
        section.setAttribute('data-open', nextOpen ? '1' : '0');
        button.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');

        const storageKey = GROUP_STORAGE[group];
        if (storageKey) writeStorage(storageKey, nextOpen ? '1' : '0');
      });
    });

    panel.querySelectorAll('[data-crack-sc-record]').forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        recordingActionId = button.getAttribute('data-crack-sc-record');
        renderPanel();
        showToast('원하는 키 조합을 누르셈');
      });
    });

    panel.querySelectorAll('[data-crack-sc-toggle]').forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = button.getAttribute('data-crack-sc-toggle');
        const enabled = toggleShortcutEnabled(id);
        recordingActionId = null;
        renderPanel();
        scheduleHelpPatch();
        showToast(`${getActionName(id)} ${enabled ? '활성화' : '비활성화'}`);
      });
    });

    panel.querySelectorAll('[data-crack-sc-reset]').forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = button.getAttribute('data-crack-sc-reset');
        resetShortcut(id);
        recordingActionId = null;
        renderPanel();
        scheduleHelpPatch();
        showToast(`${getActionName(id)} 초기화`);
      });
    });

    panel.querySelector('[data-crack-sc-reset-all]')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      resetAllShortcuts();
      recordingActionId = null;
      renderPanel();
      scheduleHelpPatch();
      showToast('전체 초기화 완료');
    });
  }

  function openPanel(anchor) {
    ensurePanel();
    lastAnchor = null;
    recordingActionId = null;
    renderPanel();

    const panel = document.getElementById(ID.panel);
    if (!panel) return;

    panel.dataset.open = '1';
    document.documentElement.classList.add(CLS.panelOpen);
    positionPanel();
    requestAnimationFrame(() => panel.focus?.());
  }

  function closePanel() {
    const panel = document.getElementById(ID.panel);
    if (!panel) return;

    panel.dataset.open = '0';
    delete panel.dataset.centered;
    document.documentElement.classList.remove(CLS.panelOpen);
    recordingActionId = null;
  }

  function togglePanel(anchor) {
    if (isPanelOpen()) closePanel();
    else openPanel(anchor);
  }

  function isPanelOpen() {
    return document.getElementById(ID.panel)?.dataset.open === '1';
  }

  function onDocumentPointerDown(e) {
    if (!isPanelOpen()) return;
    const panel = document.getElementById(ID.panel);
    if (!panel) return;
    if (panel.contains(e.target)) return;
    if (e.target.closest?.('[data-crack-sc-open-panel], [data-crack-sc-settings-entry="1"]')) return;
    closePanel();
  }

  function positionPanel() {
    const panel = document.getElementById(ID.panel);
    if (!panel || panel.dataset.open !== '1') return;

    // 항상 화면 중앙 고정.
    // 이전 버전에서 버튼 기준 위치 계산 때문에 이상한 곳에 뜨던 문제를 여기서 막음.
    panel.dataset.centered = '1';
    panel.style.left = '';
    panel.style.top = '';
    panel.style.right = '';
    panel.style.bottom = '';
    panel.style.transform = '';
  }

  function scheduleDomEnhance() {
    if (domEnhanceScheduled) return;
    domEnhanceScheduled = true;
    requestAnimationFrame(() => {
      domEnhanceScheduled = false;
      injectRoomSettingsButton();
      patchShortcutHelpLabels();
    });
  }

  function observeDom() {
    const mo = new MutationObserver((mutations) => {
      if (mutations.length > 0 && mutations.every((m) => m.type === 'attributes')) return;
      scheduleDomEnhance();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  function injectRoomSettingsButton() {
    const headings = [...document.querySelectorAll('p, span')].filter((el) => {
      if (el.closest?.('[data-crack-sc-settings-entry="1"], #' + ID.panel)) return false;
      return normalizeText(el.textContent) === '전체 설정';
    });

    for (const heading of headings) {
      const scope = heading.closest('[data-crack-ui-room-panel="1"], [class*="overflow-y-auto"], [class*="scrollbar"], body');
      if (!scope || scope.querySelector('[data-crack-sc-settings-entry="1"]')) continue;

      const headingBlock = heading.closest('p, div') || heading;
      const row = createRoomSettingsButton();
      headingBlock.parentElement?.insertBefore(row, headingBlock.nextSibling);
    }
  }

  function createRoomSettingsButton() {
    const row = document.createElement('div');
    row.className = 'px-2.5 h-4 box-content py-[18px]';
    row.dataset.crackScSettingsEntry = '1';

    row.innerHTML = `
      <div role="button" tabindex="0" data-crack-sc-open-panel="1" class="w-full flex h-4 items-center justify-between typo-text-base_leading-none_medium space-x-2 [&_svg]:fill-icon_tertiary ring-offset-4 ring-offset-sidebar cursor-pointer">
        <span class="flex space-x-2 items-center min-w-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="var(--icon_secondary)" viewBox="0 0 24 24" width="24" height="24" color="icon_secondary" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.05 4.7h15.9c.86 0 1.55.7 1.55 1.55v11.5c0 .86-.69 1.55-1.55 1.55H4.05c-.86 0-1.55-.69-1.55-1.55V6.25c0-.85.69-1.55 1.55-1.55m.05 1.7v11.2h15.8V6.4z" clip-rule="evenodd"></path>
            <path d="M5.8 8.05h2.25v2.05H5.8zm3.25 0h2.25v2.05H9.05zm3.25 0h2.25v2.05H12.3zm3.25 0h2.65v2.05h-2.65zM5.8 11.05h2.25v2.05H5.8zm3.25 0h2.25v2.05H9.05zm3.25 0h5.9v2.05h-5.9zM5.8 14.05h12.4v2.05H5.8z"></path>
          </svg>
          <span class="whitespace-nowrap overflow-hidden text-ellipsis typo-text-sm_leading-none_medium">단축어 커스텀</span>
        </span>
      </div>
    `;

    const button = row.querySelector('[data-crack-sc-open-panel]');
    button?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openPanel(null);
    });
    button?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      e.stopPropagation();
      openPanel(null);
    });

    return row;
  }

  function scheduleHelpPatch() {
    if (helpPatchScheduled) return;
    helpPatchScheduled = true;
    requestAnimationFrame(() => {
      helpPatchScheduled = false;
      patchShortcutHelpLabels();
    });
  }

  function patchShortcutHelpLabels() {
    const codeNodes = [...document.querySelectorAll('code')];
    if (!codeNodes.length) return;

    const byName = new Map();
    for (const action of ACTIONS) {
      const key = action.helpName || action.name;
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key).push(action);
    }

    for (const code of codeNodes) {
      const row = code.parentElement;
      const label = row?.querySelector('p, span');
      const name = normalizeText(label?.textContent || '');
      if (!name || !byName.has(name)) continue;

      const actions = byName.get(name);
      let text;
      if (name === '추천 답변 선택하기') {
        text = actions
          .map((action, index) => `${index + 1}: ${humanCombo(getCustomShortcut(action))}`)
          .join(' / ');
      } else {
        text = humanCombo(getCustomShortcut(actions[0]));
      }

      code.textContent = text;
      code.title = 'Crack Shortcut Customizer에서 변경됨';
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

  function showToast(message) {
    const toast = document.getElementById(ID.toast);
    if (!toast) return;

    toast.textContent = message;
    toast.dataset.show = '1';
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.dataset.show = '0';
    }, 1200);
  }

  function normalizeText(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function cssEscape(value) {
    if (window.CSS?.escape) return CSS.escape(value);
    return String(value).replace(/"/g, '\\"');
  }
})();

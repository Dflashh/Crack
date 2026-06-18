// ==UserScript==
// @name         턴수 & 크래커 표시기
// @version      2.5
// @description  입력창 내부 상단에 턴수, 누적 응답수, 사용/잔여/차감 크래커를 표시합니다. 사용 크래커는 과거 추정값 + 실시간 차감 누적으로 계산합니다.
// @match        *://crack.wrtn.ai/*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=crack.wrtn.ai
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-shared-core@v1.2.1/crack/libraries/crack-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@chasm-shared-core@v1.0.0/libraries/chasm-shared-core.js
// ==/UserScript==

(function () {
    'use strict';

    const DETAIL_PARTS_STORAGE_KEY = 'info_display_detail_parts';
    const VISIBLE_PARTS_STORAGE_KEY = 'info_display_visible_parts';
    const OUTPUT_COST_STORAGE_KEY = 'info_display_output_costs';
    const TIMESTAMPS_CACHE_KEY = 'info_display_chat_timestamps';
    const CHAT_SPENT_STORAGE_KEY = 'info_display_chat_spent_crackers_v2';
    const MAX_SINGLE_DEDUCTION = 1000;

    const SELECTOR = {
        textarea: 'textarea[placeholder*="메시지"], div.__chat_input_textarea, div.ProseMirror, div[contenteditable="true"].tiptap',
        messageGroup: 'div[data-message-group-id]',
        modelIcon: 'img[src*="model-icon"]'
    };

    const MODEL_INFO = {
        "페이블챗 1.0": { cost: 195 },
        "하이퍼챗 2.0": { cost: 85 }, "하이퍼챗 1.5": { cost: 85 }, "하이퍼챗 1.0": { cost: 85 },
        "슈퍼챗 2.5": { cost: 50 }, "슈퍼챗 2.0": { cost: 50 }, "슈퍼챗 1.5": { cost: 50 },
        "프로챗 2.5": { cost: 58 }, "프로챗 1.0": { cost: 50 }, "파워챗": { cost: 20 }
    };

    const MODEL_ICON_MAP = {
        'fablechat1_0.webp': '페이블챗 1.0', 'fablechat.webp': '페이블챗 1.0',
        'hyperchat2_0.webp': '하이퍼챗 2.0', 'hyperchat1_5.webp': '하이퍼챗 1.5', 'hyperchat.webp': '하이퍼챗 1.0',
        'superchat2_5.webp': '슈퍼챗 2.5', 'superchat2_0.webp': '슈퍼챗 2.0', 'superchat1_5.webp': '슈퍼챗 1.5',
        'prochat2_5.webp': '프로챗 2.5', 'prochat1_0.webp': '프로챗 1.0', 'powerchat.webp': '파워챗'
    };

    const DEFAULT_DETAIL_PARTS = { turn: false, aiTotal: false, cumulative: false, deducted: false, cracker: false };
    const DEFAULT_VISIBLE_PARTS = { turn: true, aiTotal: true, cumulative: true, deducted: true, cracker: true };

    const CRACKER_PATH = "M21.17 12.01c.52-.59.83-1.36.83-2.21s-.31-1.62-.83-2.21l.17-.21q0-.01.02-.02l.14-.21q0-.02.03-.05.06-.1.1-.2l.05-.08.09-.2q.01-.05.04-.11l.06-.18q0-.08.04-.14.01-.07.04-.16l.03-.19q0-.06.02-.13v-.33a3.37 3.37 0 0 0-3.36-3.37l-.33.01q-.06 0-.12.02-.1 0-.2.03-.07 0-.15.04l-.14.04-.18.06-.11.04-.2.09-.07.04-.2.11q-.03 0-.05.03l-.21.14-.02.02-.21.17a3.4 3.4 0 0 0-4.42 0 3.3 3.3 0 0 0-2.21-.83c-.85 0-1.62.31-2.21.83l-.21-.17-.02-.02-.21-.14q-.02 0-.05-.03l-.2-.11-.08-.04-.2-.09-.11-.04-.18-.06-.14-.04-.16-.04-.2-.03-.12-.02-.33-.01a3.37 3.37 0 0 0-3.34 3.82q0 .1.03.19 0 .07.04.16 0 .08.04.14l.06.18q0 .05.04.11.03.1.09.19l.04.08.1.2q.01.02.04.05l.16.23q.07.1.17.21a3.3 3.3 0 0 0-.83 2.21c0 .85.3 1.62.83 2.21a3.3 3.3 0 0 0-.83 2.21c0 .85.3 1.62.83 2.21l-.17.21-.02.02-.14.21q0 .02-.03.05l-.11.2-.04.08-.1.2-.03.11-.06.18-.04.14-.04.16-.03.19-.02.13-.01.33A3.4 3.4 0 0 0 3.02 21c.6.61 1.45.99 2.38.99l.33-.01q.06 0 .12-.02.1 0 .19-.03.07 0 .16-.04l.14-.04.18-.06.1-.04.2-.09.08-.04.2-.11q.03 0 .05-.03l.2-.14.03-.02.2-.17a3.4 3.4 0 0 0 4.43 0 3.32 3.32 0 0 0 4.42 0 3 3 0 0 0 .44.33q.03 0 .05.03l.2.11.08.04.2.09.10.04.19.06.14.04.16.04.19.03.13.02.33.01c.92 0 1.75-.37 2.36-.97l.02-.02c.6-.61.99-1.45.99-2.38l-.01-.33q0-.06-.02-.12 0-.1-.03-.19 0-.07-.04-.16l-.04-.14-.06-.18-.04-.11-.1-.19-.03-.08-.11-.2q0-.02-.03-.05l-.14-.21-.02-.02-.17-.21c.52-.59.83-1.36.83-2.21s-.31-1.62-.83-2.21M7.5 13.5 6 12l1.5-1.5L9 12zM12 6l1.5 1.5L12 9l-1.5-1.5zm0 12-1.5-1.5L12 15l1.5 1.5zm4.5-4.5L15 12l1.5-1.5L18 12z";

    const ICON = {
        settings: `<svg width="6" height="18" viewBox="0 0 6 18" fill="currentColor" class="my-counter-settings-icon"><circle cx="3" cy="3.5" r="1.8"/><circle cx="3" cy="9" r="1.8"/><circle cx="3" cy="14.5" r="1.8"/></svg>`,
        clock: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="my-counter-small-icon"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
        sparkle: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="my-counter-small-icon"><path d="M12 2l2.4 7.6 7.6 2.4-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"></path></svg>`,
        cracker: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" class="my-counter-cracker-icon"><path fill="currentColor" d="${CRACKER_PATH}"></path></svg>`,
        bittenCracker: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" class="my-counter-cracker-icon"><defs><mask id="bite-mask-cracker"><rect width="24" height="24" fill="white" /><circle cx="24" cy="0" r="12" fill="black" /></mask></defs><path fill="currentColor" mask="url(#bite-mask-cracker)" d="${CRACKER_PATH}"></path></svg>`
    };

    let counterBadge = null;
    let textSpan = null;
    let settingsBtn = null;
    let settingsMenu = null;
    let currentTextarea = null;
    let currentContainer = null;

    let detailParts = loadDetailParts();
    let visibleParts = loadVisibleParts();

    let updateTimer = null;
    let observer = null;
    let lastRenderedText = '';

    let cachedTurns = null;
    let cachedTotalMessages = null;
    let isCalculatingTurns = false;
    let lastCalculatedTime = 0;
    let lastChatId = null;

    let cachedCumulative = null;
    let isCalculatingCumulative = false;
    let lastProcessedTurns = -1;
    let cumulativeRetryDoneForChat = null;

    let lastDialogCheckTime = 0;
    let lastSafeLeftOffset = null;

    let sessionDeletedGroups = 0;
    let maxDomGroups = 0;
    let lastDataChatCounts = -1;

    let sessionKnownAiIds = new Set();
    let persistentAiTotal = 0;
    let isFirstFetchForChat = true;
    let cachedAiTotal = null;

    let memCacheTimestamps = null;
    let memCacheOutputCosts = null;
    let memCacheChatSpent = null;
    let asyncUpdateSeq = 0;

    injectBaseStyle();
    bindGlobalEvents();
    startObserver();
    scheduleUpdate();

    function injectBaseStyle() {
        if (document.getElementById('info-display-base-style')) return;
        const style = document.createElement('style');
        style.id = 'info-display-base-style';
        style.textContent = `
            #my-custom-info-display { position: absolute; left: 0; right: 14px; box-sizing: border-box; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 500; pointer-events: none; z-index: 1; display: flex; align-items: center; border-radius: 12px; }
            #my-custom-info-display #my-counter-settings-button { all: unset; position: relative; pointer-events: auto; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-left: 0; margin-right: 8px; transition: opacity 0.15s; touch-action: manipulation; color: inherit; }
            #my-custom-info-display #my-counter-settings-button::after { content: ''; position: absolute; top: -10px; bottom: -10px; left: -8px; right: -10px; }
            #my-custom-info-display #my-counter-settings-button:hover { opacity: 0.7; }
            .my-counter-settings-icon { display: block; flex-shrink: 0; }
            #my-custom-info-display #my-counter-text { display: flex; align-items: center; gap: 0; }
            .my-counter-part { all: unset; display: inline-flex; align-items: center; pointer-events: auto; border-radius: 4px; padding: 1px 2px; touch-action: manipulation; user-select: none; transition: background 0.15s; cursor: pointer; }
            .my-counter-separator { opacity: 0.45; margin: 0 3px; pointer-events: none; user-select: none; }
            #info-display-settings-menu { display: none; position: fixed; border-radius: 8px; padding: 4px; flex-direction: column; align-items: flex-start; gap: 1px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); z-index: 9999999; width: max-content; min-width: unset; box-sizing: border-box; font-size: 13px; border-style: solid; border-width: 1px; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; }
            .my-counter-settings-title { font-size: 12px; font-weight: 700; opacity: 0.7; padding: 0 4px 2px; width: max-content; box-sizing: border-box; white-space: nowrap; }
            .my-counter-settings-row { display: inline-flex; align-items: center; gap: 6px; padding: 2px 6px; border-radius: 5px; cursor: pointer; user-select: none; touch-action: manipulation; width: max-content; box-sizing: border-box; white-space: nowrap; }
            .my-counter-settings-row:hover { background: rgba(128,128,128,0.16); }
            .my-counter-settings-row input { margin: 0; cursor: pointer; }
            .my-counter-small-icon { margin-right: 5px; flex-shrink: 0; }
            .my-counter-cracker-icon { margin: 0 4px 0 0; flex-shrink: 0; }
            @keyframes info-pulse { 0% { opacity: 0.5; filter: drop-shadow(0 0 1px currentColor); } 50% { opacity: 1; filter: drop-shadow(0 0 5px currentColor); } 100% { opacity: 0.5; filter: drop-shadow(0 0 1px currentColor); } }
            .pulse-anim { animation: info-pulse 1s infinite ease-in-out; }
            @media (max-width: 520px) { #my-custom-info-display { right: 8px; font-size: 12px; } .my-counter-separator { margin: 0 2px; } .my-counter-part { padding: 1px; } }
        `;
        document.head.appendChild(style);
    }

    function bindGlobalEvents() {
        document.addEventListener('click', (e) => {
            const clickedInsideSettingsMenu = settingsBtn?.contains(e.target) || settingsMenu?.contains(e.target);
            if (!clickedInsideSettingsMenu && settingsMenu?.style.display === 'flex') hideSettingsMenu();
        });
        window.addEventListener('scroll', hideSettingsMenu, true);
        window.addEventListener('resize', hideSettingsMenu);
    }

    function startObserver() {
        if (observer) return;
        observer = new MutationObserver((mutations) => {
            const onlyMine = mutations.every((m) => {
                const el = m.target.nodeType === Node.ELEMENT_NODE ? m.target : m.target.parentElement;
                return el?.closest?.('#my-custom-info-display, #info-display-settings-menu');
            });
            if (onlyMine) return;
            scheduleUpdate();
        });
        observer.observe(document.body, {
            childList: true, subtree: true, attributes: true, attributeFilter: ['aria-valuenow']
        });
    }

    function scheduleUpdate() {
        clearTimeout(updateTimer);
        updateTimer = setTimeout(updateTurnCount, 150);
    }

    function loadDetailParts() {
        try { return { ...DEFAULT_DETAIL_PARTS, ...JSON.parse(localStorage.getItem(DETAIL_PARTS_STORAGE_KEY) || '{}') }; }
        catch { return { ...DEFAULT_DETAIL_PARTS }; }
    }

    function saveDetailParts() { localStorage.setItem(DETAIL_PARTS_STORAGE_KEY, JSON.stringify(detailParts)); }

    function loadVisibleParts() {
        try { return { ...DEFAULT_VISIBLE_PARTS, ...JSON.parse(localStorage.getItem(VISIBLE_PARTS_STORAGE_KEY) || '{}') }; }
        catch { return { ...DEFAULT_VISIBLE_PARTS }; }
    }

    function saveVisibleParts() { localStorage.setItem(VISIBLE_PARTS_STORAGE_KEY, JSON.stringify(visibleParts)); }

    function toggleDetailPart(partKey) {
        if (!Object.prototype.hasOwnProperty.call(detailParts, partKey)) return;
        if (visibleParts[partKey] === false) return;
        if (['aiTotal', 'deducted'].includes(partKey)) return;
        detailParts[partKey] = !detailParts[partKey];
        saveDetailParts(); lastRenderedText = ''; scheduleUpdate();
    }

    function getCachedTimestamps(chatId) {
        if (!chatId) return [];
        if (!memCacheTimestamps) {
            try { memCacheTimestamps = JSON.parse(localStorage.getItem(TIMESTAMPS_CACHE_KEY) || '{}'); }
            catch { memCacheTimestamps = {}; }
        }
        return Array.isArray(memCacheTimestamps[chatId]) ? memCacheTimestamps[chatId] : [];
    }

    function addTimestampsToCache(chatId, newTimestamps) {
        if (!chatId || !newTimestamps || !newTimestamps.length) return;
        if (!memCacheTimestamps) getCachedTimestamps(chatId);
        const existing = new Set(Array.isArray(memCacheTimestamps[chatId]) ? memCacheTimestamps[chatId] : []);
        let changed = false;
        for (const ts of newTimestamps) {
            if (typeof ts === 'number' && ts > 0 && !existing.has(ts)) { existing.add(ts); changed = true; }
        }
        if (changed) {
            memCacheTimestamps[chatId] = Array.from(existing);
            localStorage.setItem(TIMESTAMPS_CACHE_KEY, JSON.stringify(memCacheTimestamps));
        }
    }

    function getThemeColors(refEl) {
        let bg = '#212121'; let current = refEl;
        while (current && current !== document.body) {
            const cBg = getComputedStyle(current).backgroundColor;
            if (cBg && cBg !== 'rgba(0, 0, 0, 0)' && cBg !== 'transparent') { bg = cBg; break; }
            current = current.parentElement;
        }
        const match = bg.match(/\d+/g); let isDark = true;
        if (match && match.length >= 3) {
            const [r, g, b] = match.map(Number); isDark = (0.2126 * r + 0.7152 * g + 0.0722 * b) < 128;
        }
        return { bg, text: isDark ? '#888' : '#777', menuBg: isDark ? '#282828' : '#fff', menuBorder: isDark ? '#444' : '#e5e5e5', itemText: isDark ? '#ccc' : '#444' };
    }

    function findInputContainer(inputEl) {
        const newUiContainer = inputEl.closest('div.flex.flex-col.rounded-lg.border, div.rounded-lg.border.bg-background');
        if (newUiContainer) return newUiContainer;
        return inputEl.parentElement;
    }

    function initUI(textarea) {
        document.getElementById('my-custom-info-display')?.remove();
        document.getElementById('info-display-settings-menu')?.remove();

        lastRenderedText = ''; currentTextarea = textarea;

        const inputWrapper = findInputContainer(textarea);
        if (!inputWrapper) return;
        currentContainer = inputWrapper;

        if (getComputedStyle(inputWrapper).position === 'static') {
            inputWrapper.style.position = 'relative';
        }

        counterBadge = document.createElement('div');
        counterBadge.id = 'my-custom-info-display';

        settingsBtn = document.createElement('button');
        settingsBtn.id = 'my-counter-settings-button';
        settingsBtn.type = 'button'; settingsBtn.innerHTML = ICON.settings;
        settingsBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggleSettingsMenu(); };

        textSpan = document.createElement('span');
        textSpan.id = 'my-counter-text';
        textSpan.onclick = (e) => {
            const part = e.target.closest('.my-counter-part');
            if (!part) return;
            if (['aiTotal', 'deducted'].includes(part.dataset.part)) return;
            e.preventDefault(); e.stopPropagation(); toggleDetailPart(part.dataset.part);
        };

        counterBadge.append(settingsBtn, textSpan);
        inputWrapper.appendChild(counterBadge);

        const colors = getThemeColors(textarea);

        // 원본 v2.2 설정 그대로 투명 복구
        counterBadge.style.backgroundColor = 'transparent';
        counterBadge.style.color = colors.text;

        settingsMenu = buildSettingsMenu(); document.body.appendChild(settingsMenu);
        settingsMenu.style.background = colors.menuBg; settingsMenu.style.borderColor = colors.menuBorder; settingsMenu.style.color = colors.itemText;

        updateLayout(textarea);
    }

    function buildSettingsMenu() {
        const menu = document.createElement('div'); menu.id = 'info-display-settings-menu';
        const title = document.createElement('div'); title.className = 'my-counter-settings-title'; title.textContent = '정보 표시'; menu.appendChild(title);
        const items = [
            { key: 'turn', label: '턴수' }, { key: 'aiTotal', label: '응답 누적수' },
            { key: 'cumulative', label: '사용 크래커' }, { key: 'cracker', label: '잔여 크래커' }, { key: 'deducted', label: '차감 크래커' }
        ];
        for (const item of items) {
            const row = document.createElement('label'); row.className = 'my-counter-settings-row';
            row.innerHTML = `<input type="checkbox" data-part="${item.key}"><span>${item.label}</span>`;
            const input = row.querySelector('input');
            input.onchange = (e) => {
                e.stopPropagation(); visibleParts[item.key] = input.checked; saveVisibleParts();
                lastRenderedText = '__FORCE__'; scheduleUpdate(); syncSettingsMenu();
            };
            menu.appendChild(row);
        }
        return menu;
    }

    function toggleSettingsMenu() {
        if (!settingsMenu || !settingsBtn) return;
        if (settingsMenu.style.display === 'flex') { hideSettingsMenu(); return; }
        settingsMenu.style.display = 'flex'; syncSettingsMenu(); positionSettingsMenu();
    }
    function hideSettingsMenu() { if (settingsMenu) settingsMenu.style.display = 'none'; }
    function positionSettingsMenu() {
        if (!settingsMenu || !settingsBtn) return;
        const rect = settingsBtn.getBoundingClientRect(); settingsMenu.style.left = '0px'; settingsMenu.style.top = '0px';
        const width = settingsMenu.offsetWidth, height = settingsMenu.offsetHeight, gap = 8;
        let left = Math.max(gap, Math.min(rect.left, window.innerWidth - width - gap));
        let top = rect.top - height - gap; if (top < gap) top = rect.bottom + gap;
        settingsMenu.style.left = `${left}px`; settingsMenu.style.top = `${top}px`;
    }
    function syncSettingsMenu() {
        if (!settingsMenu) return;
        settingsMenu.querySelectorAll('input[data-part]').forEach(input => { input.checked = visibleParts[input.dataset.part] !== false; });
    }

    function getCrackerCount() {
        const parseCount = (text) => {
            if (!text) return null; const match = text.match(/[\d,]+/); if (!match) return null;
            const num = parseInt(match[0].replace(/,/g, ''), 10); return Number.isNaN(num) ? null : num;
        };
        const label = Array.from(document.querySelectorAll('span')).find(span => span.textContent.trim() === '나의 크래커');
        if (label?.nextElementSibling) { const parsed = parseCount(label.nextElementSibling.textContent); if (parsed !== null) return parsed; }
        const topBar = document.getElementById('chasm-cracker-text');
        if (topBar) { const parsed = parseCount(topBar.getAttribute('chasm-tmi-current') || topBar.textContent); if (parsed !== null) return parsed; }
        for (const img of document.querySelectorAll('img[src*="cracker"], img[alt*="크래커"]')) {
            if (img.nextElementSibling) { const parsed = parseCount(img.nextElementSibling.textContent); if (parsed !== null) return parsed; }
            if (img.parentElement) { const parsed = parseCount(img.parentElement.textContent); if (parsed !== null) return parsed; }
        }
        return null;
    }

    function getCurrentModelName() {
        for (const icon of document.querySelectorAll(SELECTOR.modelIcon)) {
            if (icon.closest('[role="menuitem"]') || icon.closest('[role="dialog"]')) continue;
            const fromSrc = Object.entries(MODEL_ICON_MAP).find(([file]) => (icon.src || '').includes(file)); if (fromSrc) return fromSrc[1];
            const found = Object.keys(MODEL_INFO).find(model => (icon.alt || '').includes(model)); if (found) return found;
        }
        return null;
    }

    function getOutputDialog() { return Array.from(document.querySelectorAll('[role="dialog"]')).find(el => el.textContent.includes('최대 출력량 조절')) || null; }
    function getModelBlockFromIcon(icon) {
        let current = icon;
        for (let i = 0; i < 8 && current; i++) {
            const text = current.innerText || ''; if (!!current.querySelector?.('span[role="slider"]') && /최대\s*\d+\s*개/.test(text)) return current;
            current = current.parentElement;
        }
        return null;
    }

    function readOutputCostsFromOpenDialog() {
        const dialog = getOutputDialog(); if (!dialog) return null;
        const result = {};
        for (const icon of dialog.querySelectorAll('img[src*="/model-icon/"]')) {
            const modelName = Object.entries(MODEL_ICON_MAP).find(([file]) => (icon.src || '').includes(file))?.[1]; if (!modelName) continue;
            const block = getModelBlockFromIcon(icon); if (!block) continue;
            const maxMatch = (block.innerText || '').match(/최대\s*(\d+)\s*개/);
            if (maxMatch) result[modelName] = { maxCost: parseInt(maxMatch[1], 10), updatedAt: Date.now() };
        }
        if (Object.keys(result).length > 0) {
            memCacheOutputCosts = { ...(memCacheOutputCosts || {}), ...result }; localStorage.setItem(OUTPUT_COST_STORAGE_KEY, JSON.stringify(memCacheOutputCosts)); return result;
        }
        return null;
    }

    function getOutputAdjustedCost(modelName) {
        if (!modelName) return null;
        if (!memCacheOutputCosts) { try { memCacheOutputCosts = JSON.parse(localStorage.getItem(OUTPUT_COST_STORAGE_KEY) || '{}'); } catch { memCacheOutputCosts = {}; } }
        return memCacheOutputCosts?.[modelName]?.maxCost || MODEL_INFO[modelName]?.cost || null;
    }

    function setImportantStyle(el, prop, value) {
        if (!el) return;
        if (el.style.getPropertyValue(prop) === value && el.style.getPropertyPriority(prop) === 'important') return;
        el.style.setProperty(prop, value, 'important');
    }

    function updateLayout(textarea) {
        if (!counterBadge || !counterBadge.parentElement) return;

        const compStyle = getComputedStyle(textarea);
        const paddingLeft = parseFloat(compStyle.paddingLeft) || 0;
        const borderLeft = parseFloat(compStyle.borderLeftWidth) || 0;

        const textareaRect = textarea.getBoundingClientRect();
        const parentRect = counterBadge.parentElement.getBoundingClientRect();
        const leftOffset = textareaRect.left - parentRect.left + paddingLeft + borderLeft;

        if (Number.isFinite(leftOffset) && leftOffset > 4) lastSafeLeftOffset = leftOffset;

        const safeLeftOffset = lastSafeLeftOffset ?? Math.max(0, leftOffset);
        counterBadge.style.paddingLeft = `${Math.max(0, safeLeftOffset)}px`;

        const hasMiniSidebar = !!document.getElementById('my-custom-btn-menu');
        counterBadge.style.top = hasMiniSidebar ? '30px' : '2px';
        counterBadge.style.paddingTop = hasMiniSidebar ? '4px' : '6px';
        counterBadge.style.paddingBottom = '6px';

        // 미니 사이드바가 있을 때는 그쪽이 입력창 padding/min-height를 담당하게 둔다.
        // 두 스크립트가 같은 스타일을 서로 다른 값으로 계속 쓰면 MutationObserver가 맞물려 들썩거린다.
        if (!hasMiniSidebar) {
            setImportantStyle(textarea, 'padding-top', '36px');
            setImportantStyle(textarea, 'min-height', '70px');
        }
    }

    function renderParts(parts) {
        if (!textSpan) return;
        const visibleRenderParts = parts.filter(part => visibleParts[part.key] !== false);
        if (visibleRenderParts.length === 0) { textSpan.replaceChildren(); lastRenderedText = '__EMPTY__'; return; }
        const html = visibleRenderParts.map((part, index) => {
            const sep = index > 0 ? `<span class="my-counter-separator">|</span>` : '';
            const contentHtml = detailParts[part.key] ? part.detailHtml : part.summaryHtml;
            const cursorStyle = ['aiTotal', 'deducted'].includes(part.key) ? 'style="cursor:default;"' : '';
            return `${sep}<button class="my-counter-part" data-part="${part.key}" ${cursorStyle}>${contentHtml}</button>`;
        }).join('');
        if (html === lastRenderedText) return;
        textSpan.innerHTML = html; lastRenderedText = html;
    }

    function extractAccessToken() {
        for (let cookie of document.cookie.split(';')) { if (cookie.trim().startsWith('access_token=')) return cookie.trim().split('=')[1]; }
        return null;
    }
    function getTimeFromObjectId(objectId) {
        if (!objectId || objectId.length < 8) return 0; try { return parseInt(objectId.substring(0, 8), 16) * 1000; } catch { return 0; }
    }

    function getCurrentChatIdSafe() {
        try {
            if (typeof CrackUtil === 'undefined') return null;
            const pathInfo = CrackUtil.path?.();
            if (!pathInfo?.isChattingPath?.()) return null;
            return pathInfo.chatRoom?.() || null;
        } catch {
            return null;
        }
    }

    function getChatSpentMap() {
        if (!memCacheChatSpent) {
            try { memCacheChatSpent = JSON.parse(localStorage.getItem(CHAT_SPENT_STORAGE_KEY) || '{}'); }
            catch { memCacheChatSpent = {}; }
        }
        return memCacheChatSpent;
    }

    function saveChatSpentMap() {
        if (!memCacheChatSpent) return;
        localStorage.setItem(CHAT_SPENT_STORAGE_KEY, JSON.stringify(memCacheChatSpent));
    }

    function normalizeSpentRecord(record) {
        if (!record || typeof record !== 'object') record = {};
        return {
            estimatedBase: Math.max(0, Number(record.estimatedBase) || 0),
            liveSpent: Math.max(0, Number(record.liveSpent) || 0),
            estimatedAt: Number(record.estimatedAt) || 0,
            liveUpdatedAt: Number(record.liveUpdatedAt) || 0
        };
    }

    function getChatSpentRecord(chatId) {
        if (!chatId) return normalizeSpentRecord(null);
        const map = getChatSpentMap();
        const normalized = normalizeSpentRecord(map[chatId]);
        map[chatId] = normalized;
        return normalized;
    }

    function setEstimatedSpent(chatId, estimatedTotal) {
        if (!chatId || !Number.isFinite(estimatedTotal) || estimatedTotal < 0) return;
        const map = getChatSpentMap();
        const record = getChatSpentRecord(chatId);

        // 히스토리 추정값은 현재 liveSpent까지 포함할 수 있으므로,
        // liveSpent와 중복되지 않게 base만 저장한다.
        const estimatedBase = Math.max(0, Math.round(estimatedTotal) - record.liveSpent);
        record.estimatedBase = Math.max(record.estimatedBase, estimatedBase);
        record.estimatedAt = Date.now();

        map[chatId] = record;
        saveChatSpentMap();
    }

    function addLiveSpent(chatId, amount) {
        if (!chatId || !Number.isFinite(amount) || amount <= 0) return;
        const map = getChatSpentMap();
        const record = getChatSpentRecord(chatId);

        record.liveSpent += Math.round(amount);
        record.liveUpdatedAt = Date.now();

        map[chatId] = record;
        saveChatSpentMap();
    }

    function getSpentDisplay(chatId) {
        const record = getChatSpentRecord(chatId);
        const total = record.estimatedBase + record.liveSpent;
        return {
            total,
            estimatedBase: record.estimatedBase,
            liveSpent: record.liveSpent,
            isEstimated: record.estimatedAt > 0 || record.estimatedBase > 0
        };
    }

    function getConsumedAmount(item) {
        const candidates = [
            item?.balance?.total,
            item?.balance?.amount,
            item?.amount,
            item?.total
        ];
        for (const candidate of candidates) {
            const amount = Number(candidate);
            if (Number.isFinite(amount) && amount !== 0) return Math.abs(amount);
        }
        return 0;
    }

    function makeTimestampMinuteBuckets(timestamps) {
        const buckets = new Set();
        for (const ts of timestamps || []) {
            if (!Number.isFinite(ts) || ts <= 0) continue;
            const minute = Math.floor(ts / 60000);
            buckets.add(minute - 1);
            buckets.add(minute);
            buckets.add(minute + 1);
        }
        return buckets;
    }

    async function fetchRoomData() {
        if (typeof CrackUtil === 'undefined') return { chatCounts: -1, totalMessages: -1, timestamps: [], aiTotal: -1 };
        try {
            const pathInfo = CrackUtil.path(); if (!pathInfo.isChattingPath() || !pathInfo.chatRoom()) return { chatCounts: -1, totalMessages: -1, timestamps: [], aiTotal: -1 };
            const chatId = pathInfo.chatRoom(); let chatCounts = 0, totalMessages = 0, newAiLogsCount = 0; const liveTimestamps = [];
            for await (let log of CrackUtil.chatRoom().iterateLogs(chatId)) {
                totalMessages++;
                if (log.isUser && log.isUser()) { chatCounts++; continue; }
                liveTimestamps.push(getTimeFromObjectId(log.id));
                if (log.id && !sessionKnownAiIds.has(log.id)) { sessionKnownAiIds.add(log.id); if (!isFirstFetchForChat) newAiLogsCount++; }
            }
            if (isFirstFetchForChat) {
                if (sessionKnownAiIds.size > persistentAiTotal) persistentAiTotal = sessionKnownAiIds.size;
                localStorage.setItem('info_ai_total_' + chatId, persistentAiTotal); isFirstFetchForChat = false;
            } else if (newAiLogsCount > 0) {
                persistentAiTotal += newAiLogsCount; localStorage.setItem('info_ai_total_' + chatId, persistentAiTotal);
            }
            const validLive = liveTimestamps.filter(t => t > 0); addTimestampsToCache(chatId, validLive);
            const cachedAll = getCachedTimestamps(chatId);
            return { chatCounts, totalMessages, timestamps: cachedAll.length > 0 ? cachedAll : validLive, aiTotal: persistentAiTotal };
        } catch { return { chatCounts: -1, totalMessages: -1, timestamps: [], aiTotal: -1 }; }
    }

    async function fetchCumulativeCrackers(timestamps) {
        const validTimestamps = (timestamps || []).filter(t => Number.isFinite(t) && t > 0);
        const token = extractAccessToken(); if (!token || validTimestamps.length === 0) return null;

        let totalCalculated = 0, page = 1, lastSafePage = 1, keepGoing = true, isWarping = true, fallbackCount = 0;
        const oldestMsgTime = Math.min(...validTimestamps), latestMsgTime = Math.max(...validTimestamps);
        const timestampBuckets = makeTimestampMinuteBuckets(validTimestamps);

        while (keepGoing && page <= 500 && fallbackCount < 500) {
            fallbackCount++;
            const res = await fetch(`https://crack-api.wrtn.ai/crack-cash/crackers/history?limit=10&type=all&page=${page}`, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
            if (!res.ok) break;
            const json = await res.json(); if (!json?.data?.length) break;
            const pageLatestTime = new Date(json.data[0].date).getTime();
            if (isWarping && pageLatestTime < latestMsgTime) { page = lastSafePage + 1; isWarping = false; continue; }
            if (isWarping && pageLatestTime > latestMsgTime + 600000) { lastSafePage = page; page += 15; continue; }
            isWarping = false;

            for (let item of json.data) {
                const itemTime = new Date(item.date).getTime();
                if (!Number.isFinite(itemTime)) continue;
                if (itemTime < oldestMsgTime - 120000) { keepGoing = false; break; }

                const itemMinute = Math.floor(itemTime / 60000);
                if (String(item.isConsumed) === 'true' && timestampBuckets.has(itemMinute)) {
                    totalCalculated += getConsumedAmount(item);
                }
            }
            page++; await new Promise(r => setTimeout(r, 40));
        }
        return Math.round(totalCalculated);
    }

    function updateTurnCount() {
        const now = Date.now();
        if (now - lastDialogCheckTime > 1500) { readOutputCostsFromOpenDialog(); lastDialogCheckTime = now; }

        const textarea = Array.from(document.querySelectorAll(SELECTOR.textarea)).find(el => {
            if (el.dataset.loreRefinerMessageId) return false;
            if (el.closest('.bg-surface_tertiary')) return false;
            const wrapText = (el.closest('div.flex.flex-col')?.innerText || '');
            if (wrapText.includes('수정 완료') || wrapText.includes('취소')) return false;
            return true;
        });

        if (!textarea) {
            counterBadge?.remove(); counterBadge = null; currentTextarea = null; currentContainer = null; hideSettingsMenu(); return;
        }

        const expectedContainer = findInputContainer(textarea);

        if (!counterBadge || currentTextarea !== textarea || currentContainer !== expectedContainer || counterBadge.parentElement !== expectedContainer) {
            initUI(textarea);
        }
        if (!counterBadge || !textSpan) return;

        const currentChatId = getCurrentChatIdSafe();
        let forceCalculate = false;

        if (currentChatId && currentChatId !== lastChatId) {
            lastChatId = currentChatId; forceCalculate = true;
            cachedTurns = null; cachedTotalMessages = null; cachedCumulative = null;
            lastProcessedTurns = -1; cumulativeRetryDoneForChat = null;
            sessionDeletedGroups = 0; maxDomGroups = 0; lastDataChatCounts = -1;

            sessionKnownAiIds.clear(); isFirstFetchForChat = true;
            persistentAiTotal = parseInt(localStorage.getItem('info_ai_total_' + currentChatId), 10) || 0; cachedAiTotal = null;
        }

        const domTotalMessages = document.querySelectorAll(SELECTOR.messageGroup).length;
        if (domTotalMessages > maxDomGroups) {
            maxDomGroups = domTotalMessages;
        } else if (domTotalMessages < maxDomGroups && domTotalMessages > 0) {
            // 서버 로그 반영 전까지 삭제를 임시 보정한다.
            sessionDeletedGroups += (maxDomGroups - domTotalMessages); maxDomGroups = domTotalMessages; forceCalculate = true;
        }

        const currentModelName = getCurrentModelName();

        if (!isCalculatingTurns && (forceCalculate || now - lastCalculatedTime > 1500)) {
            isCalculatingTurns = true;
            const requestChatId = currentChatId;
            const requestSeq = ++asyncUpdateSeq;

            fetchRoomData().then(data => {
                if (requestSeq !== asyncUpdateSeq || getCurrentChatIdSafe() !== requestChatId) { isCalculatingTurns = false; return; }

                if (data.aiTotal !== -1) cachedAiTotal = data.aiTotal;
                if (data.chatCounts !== -1) {
                    // 서버 로그에서 삭제가 확인되면 DOM 임시 보정값은 초기화한다.
                    if (lastDataChatCounts !== -1 && data.chatCounts < lastDataChatCounts) sessionDeletedGroups = 0;
                    if (data.chatCounts > 0) lastDataChatCounts = data.chatCounts;

                    if (data.chatCounts === 0 && data.totalMessages <= 0 && domTotalMessages > 0) {
                        cachedTurns = Math.floor(domTotalMessages / 2); cachedTotalMessages = domTotalMessages;
                    } else {
                        const adjustedTurns = data.chatCounts - Math.floor(sessionDeletedGroups / 2);
                        const adjustedTotal = (data.totalMessages !== -1 ? data.totalMessages : domTotalMessages) - sessionDeletedGroups;
                        cachedTurns = Math.max(0, adjustedTurns); cachedTotalMessages = Math.max(0, adjustedTotal);
                    }

                    if (cachedTurns !== lastProcessedTurns && !isCalculatingCumulative && data.timestamps.length > 0) {
                        lastProcessedTurns = cachedTurns; isCalculatingCumulative = true;
                        renderUpdate(textarea, currentModelName, domTotalMessages);

                        fetchCumulativeCrackers(data.timestamps).then(async cum => {
                            if (requestSeq !== asyncUpdateSeq || getCurrentChatIdSafe() !== requestChatId) { isCalculatingCumulative = false; return; }

                            if (cum === 0 && cachedTurns >= 2 && requestChatId && cumulativeRetryDoneForChat !== requestChatId) {
                                cumulativeRetryDoneForChat = requestChatId;
                                await new Promise(r => setTimeout(r, 1000));
                                if (requestSeq !== asyncUpdateSeq || getCurrentChatIdSafe() !== requestChatId) { isCalculatingCumulative = false; return; }
                                cum = await fetchCumulativeCrackers(data.timestamps);
                            }

                            if (Number.isFinite(cum)) {
                                cachedCumulative = cum;
                                setEstimatedSpent(requestChatId, cum);
                            }
                            isCalculatingCumulative = false;
                            renderUpdate(textarea, currentModelName, domTotalMessages);
                        }).catch(() => {
                            if (requestSeq !== asyncUpdateSeq || getCurrentChatIdSafe() !== requestChatId) { isCalculatingCumulative = false; return; }
                            isCalculatingCumulative = false; renderUpdate(textarea, currentModelName, domTotalMessages);
                        });
                    }
                } else { cachedTotalMessages = domTotalMessages; cachedTurns = Math.floor(domTotalMessages / 2); }
                lastCalculatedTime = Date.now(); isCalculatingTurns = false; renderUpdate(textarea, currentModelName, domTotalMessages);
            }).catch(() => { isCalculatingTurns = false; renderUpdate(textarea, currentModelName, domTotalMessages); });
        } else { renderUpdate(textarea, currentModelName, domTotalMessages); }
    }

    function renderUpdate(textarea, currentModelName, domTotalMessages) {
        if (!textSpan) return;
        const parts = [];

        const currentChatId = getCurrentChatIdSafe();
        const crackerCount = getCrackerCount();
        const modelCost = currentModelName ? getOutputAdjustedCost(currentModelName) : null;
        let currentDiff = 0;

        if (crackerCount !== null) {
            const prevCount = parseInt(localStorage.getItem('info_display_last_cracker'), 10);

            if (!isNaN(prevCount) && prevCount > crackerCount) {
                const diff = prevCount - crackerCount;
                if (diff > 0 && diff < MAX_SINGLE_DEDUCTION) {
                    currentDiff = diff;
                    localStorage.setItem('info_display_last_diff', diff);
                    localStorage.setItem('info_display_last_diff_chat', currentChatId || '');
                    addLiveSpent(currentChatId, diff);
                }
            } else if (!isNaN(prevCount) && prevCount < crackerCount) {
                localStorage.setItem('info_display_last_diff', 0);
                localStorage.setItem('info_display_last_diff_chat', '');
            }

            localStorage.setItem('info_display_last_cracker', crackerCount);

            if (currentDiff <= 0 && localStorage.getItem('info_display_last_diff_chat') === (currentChatId || '')) {
                currentDiff = parseInt(localStorage.getItem('info_display_last_diff'), 10) || 0;
            }
        }

        let displayTurns = cachedTurns !== null ? cachedTurns : Math.floor(domTotalMessages / 2);
        if (displayTurns > 0) {
            const summary = `${ICON.clock}<span style="font-weight:700;">${displayTurns}</span>턴`; let detail = summary;
            const totalMessages = cachedTotalMessages ?? domTotalMessages;
            if (totalMessages > 0) detail += `&nbsp;<span style="opacity:.75;">(총 메시지 수 ${totalMessages.toLocaleString()}개)</span>`;
            parts.push({ key: 'turn', summaryHtml: summary, detailHtml: detail });
        } else {
            const html = `${ICON.clock}채팅 없음`; parts.push({ key: 'turn', summaryHtml: html, detailHtml: html });
        }

        if (visibleParts.aiTotal !== false) {
            let rawAiTotal = cachedAiTotal !== null ? cachedAiTotal : Math.ceil(domTotalMessages / 2);
            let aiCountDisplay = Math.max(0, rawAiTotal - 1);
            const summary = `${ICON.sparkle}<span style="font-weight:700;">${aiCountDisplay}</span>회`;
            parts.push({ key: 'aiTotal', summaryHtml: summary, detailHtml: summary });
        }

        if (visibleParts.cumulative !== false) {
            const spent = getSpentDisplay(currentChatId);
            let cumText = spent.total.toLocaleString(), suffix = '개', animClass = '';

            if (isCalculatingCumulative && spent.total <= 0) { cumText = '...'; suffix = ''; animClass = 'pulse-anim'; }
            else if (isCalculatingCumulative) { animClass = 'pulse-anim'; }
            else if (displayTurns <= 0 && spent.total <= 0) { cumText = '0'; suffix = '개'; }

            const prefix = spent.isEstimated && cumText !== '...' ? '' : '';
            const bitenIcon = ICON.bittenCracker.replace('class="my-counter-cracker-icon"', `class="my-counter-cracker-icon ${animClass}"`);
            const summary = `${bitenIcon}<span style="font-weight:700;">${prefix}${cumText}</span>${suffix}`;

            let detail = summary;
            if (spent.isEstimated && cumText !== '...') {
                detail = `${bitenIcon}<span style="font-weight:700;">${spent.total.toLocaleString()}</span>개&nbsp;<span style="opacity:.75;">(추정 ${spent.estimatedBase.toLocaleString()} + 기록 ${spent.liveSpent.toLocaleString()})</span>`;
            } else if (spent.liveSpent > 0) {
                detail = `${bitenIcon}<span style="font-weight:700;">${spent.total.toLocaleString()}</span>개&nbsp;<span style="opacity:.75;">(기록 ${spent.liveSpent.toLocaleString()})</span>`;
            }

            parts.push({ key: 'cumulative', summaryHtml: summary, detailHtml: detail });
        }

        if (crackerCount !== null) {
            let summary = `${ICON.cracker}<span style="font-weight:700;">${crackerCount.toLocaleString()}</span>개`; let detail = summary;
            if (modelCost) {
                const possibleTurns = Math.floor(crackerCount / modelCost); detail += `&nbsp;<span style="opacity:.75;">(${possibleTurns.toLocaleString()}턴 가능, 1회 ${modelCost.toLocaleString()}개)</span>`;
            }
            parts.push({ key: 'cracker', summaryHtml: summary, detailHtml: detail });
        }

        if (currentDiff > 0) {
            const consumedHtml = `<span style="display:inline-flex; align-items:center;"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="margin-right:2px; flex-shrink:0;"><polygon points="4,8 20,8 12,18"></polygon></svg><span style="font-weight:700;">${currentDiff}</span>개</span>`;
            parts.push({ key: 'deducted', summaryHtml: consumedHtml, detailHtml: consumedHtml });
        }

        renderParts(parts); updateLayout(textarea);
        if (settingsMenu?.style.display === 'flex') positionSettingsMenu();
    }

})();

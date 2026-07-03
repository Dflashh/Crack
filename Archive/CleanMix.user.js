// ==UserScript==
// @name         클린 리롤 믹서
// @version      1.1.0
// @description  리롤하고 싶은 내용을 삭제하고 새 응답 받기
// @author       로봇 & 나
// @match        https://crack.wrtn.ai/*
// @grant        GM_addStyle
// @run-at       document-idle
// @icon         https://cdn.jsdelivr.net/gh/Dflashh/Crack@main/Icon/Clean.webp
// ==/UserScript==

(function () {
    'use strict';

    /******************************************************************
     * Clean Reroll v1.1.0
     * - 유저 턴 기준으로 연결된 AI 후보 답변들을 전부 삭제
     * - 유저 메시지를 입력창에 복원
     * - 자동 전송 토글 지원
     ******************************************************************/

    const SCRIPT_ID = 'cr-clean-reroll-v110';
    const AUTO_SEND_KEY = 'wrtn_clean_reroll_autosend';
    const API_BASE = 'https://crack-api.wrtn.ai/crack-gen/v3';
    const CLIPBOARD_RESTORE_TTL = 1000 * 60 * 10;
    const MAX_ASSISTANT_CANDIDATES = 8; // 유저 턴에 붙은 AI 메시지 컨테이너 탐색 여유값
    const MAX_VARIANTS_PER_ASSISTANT = 8; // 답변 비교 n/n 안의 후보 삭제 반복 여유값
    const WAIT_STEP = 80;
    const LONG_PRESS_MS = 500;
    const CLEAN_MIXER_NS = 'cr-clean-reroll-mixer';
    const CLEAN_MIXER_MODAL_ID = `${CLEAN_MIXER_NS}-modal`;
    const CLEAN_MIXER_BUTTON_CLASS = `${CLEAN_MIXER_NS}-open-btn`;

    let isCleanRerollExecuting = false;
    let longPressTimer = null;
    let longPressTriggeredAt = 0;
    let activeCleanMixerEditorText = '';

    const cleanClipboard = {
        turnKey: '',
        turnText: '',
        entries: [],
        preExistingUserIds: new Set(),
        activeUserId: '',
        pendingBind: false,
        updatedAt: 0,
        currentAnswerIndex: 0,
        nextAnswerIndex: 1
    };

    let cleanClipboardEditingId = '';

    const SELECTOR = {
        message: '[data-message-group-id]',
        markdown: '.wrtn-markdown',
        editor: '.__chat_input_textarea',
        optionButton: 'button[aria-label="메시지 옵션"]',
        menuItem: '[role="menuitem"]',
        dialog: '[role="dialog"], [role="alertdialog"], dialog'
    };

    const ICON = {
        rerollPathStart: 'M3.8 12',
        sendPathStart: 'M18.38 12.88'
    };

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function isVisible(el) {
        return !!el && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }

    function getAutoSendState() {
        return localStorage.getItem(AUTO_SEND_KEY) !== 'false';
    }

    function setAutoSendState(value) {
        localStorage.setItem(AUTO_SEND_KEY, String(!!value));
        updateAutoSendToggles();
    }

    function toggleAutoSendState() {
        const next = !getAutoSendState();
        setAutoSendState(next);
        return next;
    }

    function log(...args) {
        console.log('[Clean Reroll]', ...args);
    }

    function warn(...args) {
        console.warn('[Clean Reroll]', ...args);
    }

    function normalizeTurnText(text) {
        return String(text || '')
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function hashString(text) {
        const normalized = normalizeTurnText(text);
        let hash = 2166136261;

        for (let i = 0; i < normalized.length; i++) {
            hash ^= normalized.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }

        return (hash >>> 0).toString(36);
    }


    function getClipboardStorageKey() {
        return `${SCRIPT_ID}:clipboard:${location.origin}${location.pathname}${location.search}`;
    }

    function serializeCleanClipboard() {
        return {
            turnKey: cleanClipboard.turnKey,
            turnText: cleanClipboard.turnText,
            entries: cleanClipboard.entries,
            preExistingUserIds: Array.from(cleanClipboard.preExistingUserIds || []),
            activeUserId: cleanClipboard.activeUserId,
            pendingBind: cleanClipboard.pendingBind,
            updatedAt: cleanClipboard.updatedAt,
            currentAnswerIndex: cleanClipboard.currentAnswerIndex,
            nextAnswerIndex: cleanClipboard.nextAnswerIndex,
            savedAt: Date.now()
        };
    }

    function saveCleanClipboardSnapshot() {
        try {
            sessionStorage.setItem(getClipboardStorageKey(), JSON.stringify(serializeCleanClipboard()));
        } catch (err) {
            warn('clipboard snapshot save failed', err);
        }
    }

    function clearCleanClipboardSnapshot() {
        try {
            sessionStorage.removeItem(getClipboardStorageKey());
        } catch (_) {}
    }

    function restoreCleanClipboardSnapshot() {
        try {
            const raw = sessionStorage.getItem(getClipboardStorageKey());
            if (!raw) return false;

            const data = JSON.parse(raw);
            if (!data?.turnKey || !Array.isArray(data.entries)) return false;
            if (Date.now() - Number(data.savedAt || data.updatedAt || 0) > CLIPBOARD_RESTORE_TTL) {
                clearCleanClipboardSnapshot();
                return false;
            }

            cleanClipboard.turnKey = String(data.turnKey || '');
            cleanClipboard.turnText = String(data.turnText || '');
            cleanClipboard.entries = data.entries;
            cleanClipboard.preExistingUserIds = new Set(data.preExistingUserIds || []);
            cleanClipboard.activeUserId = String(data.activeUserId || '');
            cleanClipboard.pendingBind = !!data.pendingBind;
            cleanClipboard.updatedAt = Number(data.updatedAt || Date.now());
            cleanClipboard.currentAnswerIndex = Number(data.currentAnswerIndex || 0);
            cleanClipboard.nextAnswerIndex = Number(data.nextAnswerIndex || 1);
            return true;
        } catch (err) {
            warn('clipboard snapshot restore failed', err);
            clearCleanClipboardSnapshot();
            return false;
        }
    }

    function getCookie(name) {
        const escaped = String(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));

        return match ? decodeURIComponent(match[1]) : null;
    }

    function getCommonHeaders() {
        const headers = {
            accept: 'application/json, text/plain, */*',
            platform: 'web',
            'wrtn-locale': 'ko-KR'
        };

        const token = getCookie('access_token');
        if (token) headers.authorization = `Bearer ${token}`;

        const wrtnId = getCookie('__w_id');
        if (wrtnId) headers['x-wrtn-id'] = wrtnId;

        const mixpanelId = getCookie('Mixpanel-Distinct-Id');
        if (mixpanelId) headers['mixpanel-distinct-id'] = mixpanelId;

        return headers;
    }

    function extractChatIdFromUrl(url = location.href) {
        const str = String(url || '');
        const patterns = [
            /\/episodes\/([a-f0-9]{24})(?:[/?#]|$)/i,
            /\/chats\/([a-f0-9]{24})(?:[/?#]|$)/i,
            /"chatId":"([a-f0-9]{24})"/i
        ];

        for (const pattern of patterns) {
            const match = str.match(pattern);
            if (match) return match[1];
        }

        return null;
    }

    function findChatId() {
        const fromUrl = extractChatIdFromUrl();
        if (fromUrl) return fromUrl;

        try {
            return extractChatIdFromUrl(document.documentElement.innerHTML);
        } catch (_) {
            return null;
        }
    }

    async function overwriteMessageOnServer(chatId, messageId, messageText) {
        const res = await fetch(`${API_BASE}/chats/${chatId}/messages/${messageId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                ...getCommonHeaders(),
                'content-type': 'application/json'
            },
            body: JSON.stringify({ message: messageText })
        });

        if (!res.ok) {
            let body = '';
            try { body = await res.text(); } catch (_) {}
            throw new Error(`답변 덮어쓰기 실패 (${res.status}) ${body.slice(0, 180)}`);
        }

        return await res.json().catch(() => ({}));
    }

    function saveOverwriteBackup({ chatId, messageId, beforeText, afterText, label }) {
        try {
            const key = `${SCRIPT_ID}:overwrite-backups`;
            const list = JSON.parse(localStorage.getItem(key) || '[]');

            list.unshift({
                savedAt: new Date().toISOString(),
                chatId,
                messageId,
                label,
                beforeText,
                afterText
            });

            localStorage.setItem(key, JSON.stringify(list.slice(0, 30)));
        } catch (err) {
            warn('overwrite backup save failed', err);
        }
    }

    function finishServerOverwriteNoReload() {
        saveCleanClipboardSnapshot();
        showToast('서버 반영 완료. 새로고침 없이 화면만 갱신했음.');
    }

    function cssEscapeValue(value) {
        if (window.CSS && typeof CSS.escape === 'function') return CSS.escape(String(value));

        return String(value).replace(/["\\]/g, '\\$&');
    }

    function getUserMessageIdsSnapshot() {
        return new Set(
            Array.from(document.querySelectorAll(SELECTOR.message))
                .filter(el => getMessageRole(el) === 'user')
                .map(getMessageId)
                .filter(Boolean)
        );
    }

    function ensureClipboardTurn(userText, preExistingUserIds = null) {
        const normalized = normalizeTurnText(userText);
        const key = hashString(normalized);

        if (cleanClipboard.turnKey && cleanClipboard.turnKey !== key) {
            resetCleanClipboard();
        }

        if (!cleanClipboard.turnKey) {
            cleanClipboard.turnKey = key;
            cleanClipboard.turnText = normalized;
            cleanClipboard.entries = [];
            cleanClipboard.preExistingUserIds = preExistingUserIds || getUserMessageIdsSnapshot();
            cleanClipboard.activeUserId = '';
            cleanClipboard.pendingBind = true;
            cleanClipboard.updatedAt = Date.now();
            cleanClipboard.currentAnswerIndex = 1;
            cleanClipboard.nextAnswerIndex = 1;
        }

        return key;
    }

    function resetCleanClipboard() {
        cleanClipboard.turnKey = '';
        cleanClipboard.turnText = '';
        cleanClipboard.entries = [];
        cleanClipboard.preExistingUserIds = new Set();
        cleanClipboard.activeUserId = '';
        cleanClipboard.pendingBind = false;
        cleanClipboard.updatedAt = 0;
        cleanClipboard.currentAnswerIndex = 0;
        cleanClipboard.nextAnswerIndex = 1;

        clearCleanClipboardSnapshot();

        const open = document.querySelector('.cr-clip-overlay');
        if (open) renderCleanClipboardOverlay();
    }

    function appendCleanClipboardEntry(text, meta = {}) {
        const normalized = normalizeTurnText(text);
        if (!normalized) return false;

        const textHash = hashString(normalized);
        const answerIndex =
            Number(meta.answerIndex) ||
            Number(cleanClipboard.currentAnswerIndex) ||
            Number(cleanClipboard.nextAnswerIndex) ||
            (getMaxAnswerIndex() + 1) ||
            1;

        const duplicate = cleanClipboard.entries.some(entry => {
            return entry.hash === textHash || normalizeTurnText(entry.text) === normalized;
        });

        cleanClipboard.nextAnswerIndex = Math.max(
            Number(cleanClipboard.nextAnswerIndex) || 1,
            answerIndex + 1,
            getMaxAnswerIndex() + 1
        );
        cleanClipboard.currentAnswerIndex = cleanClipboard.nextAnswerIndex;

        if (duplicate) return false;

        cleanClipboard.entries.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            hash: textHash,
            text: normalized,
            answerIndex,
            label: meta.label || '',
            compareText: meta.compareText || '',
            createdAt: Date.now()
        });

        cleanClipboard.updatedAt = Date.now();

        const open = document.querySelector('.cr-clip-overlay');
        if (open) renderCleanClipboardOverlay();

        return true;
    }

    function getMessageListInDomOrder() {
        return Array.from(document.querySelectorAll(SELECTOR.message))
            .map(el => ({
                el,
                id: getMessageId(el),
                role: getMessageRole(el),
                text: extractMessageText(el)
            }))
            .filter(item => item.id);
    }

    function bindClipboardActiveUserIfNeeded() {
        if (!cleanClipboard.turnKey || !cleanClipboard.pendingBind) return;

        const list = getMessageListInDomOrder();
        const newUsers = list.filter(item => {
            return item.role === 'user' && !cleanClipboard.preExistingUserIds.has(item.id);
        });

        if (!newUsers.length) return;

        cleanClipboard.activeUserId = newUsers[0].id;
        cleanClipboard.pendingBind = false;
    }

    function clearClipboardIfNextTurnDetected() {
        if (!cleanClipboard.turnKey || cleanClipboard.pendingBind || !cleanClipboard.activeUserId) return;
        if (isCleanRerollExecuting) return;

        const list = getMessageListInDomOrder();
        const activeIndex = list.findIndex(item => item.id === cleanClipboard.activeUserId);

        if (activeIndex < 0) {
            cleanClipboard.pendingBind = true;
            return;
        }

        const newerUser = list
            .slice(0, activeIndex)
            .find(item => item.role === 'user');

        if (newerUser) {
            resetCleanClipboard();
        }
    }

    function checkClipboardTurnLifecycle() {
        bindClipboardActiveUserIfNeeded();
        clearClipboardIfNextTurnDetected();
    }

    function formatClipboardTime(ts) {
        try {
            return new Intl.DateTimeFormat('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(new Date(ts));
        } catch (_) {
            return '';
        }
    }

    async function copyTextToSystemClipboard(text) {
        if (!text) return false;

        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (_) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.style.pointerEvents = 'none';

            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();

            let ok = false;
            try {
                ok = document.execCommand('copy');
            } catch (_) {
                ok = false;
            }

            textarea.remove();
            return ok;
        }
    }

    function getKoreanOrdinal(index) {
        const words = ['첫번째', '두번째', '세번째', '네번째', '다섯번째', '여섯번째', '일곱번째', '여덟번째', '아홉번째', '열번째'];

        return words[index - 1] || `${index}번째`;
    }

    function getMaxAnswerIndex() {
        return cleanClipboard.entries.reduce((max, entry) => {
            return Math.max(max, Number(entry.answerIndex) || 0);
        }, 0);
    }

    function resolveCurrentAnswerIndex(text = '') {
        const current = Number(cleanClipboard.currentAnswerIndex) || 0;

        if (current > 0) return current;

        const normalized = normalizeTurnText(text);
        const matching = normalized
            ? cleanClipboard.entries.find(entry => normalizeTurnText(entry.text) === normalized || entry.hash === hashString(normalized))
            : null;

        const inferred =
            Number(matching?.answerIndex) ||
            Math.max(Number(cleanClipboard.nextAnswerIndex) || 1, getMaxAnswerIndex() + 1, 1);

        cleanClipboard.currentAnswerIndex = inferred;
        cleanClipboard.nextAnswerIndex = Math.max(Number(cleanClipboard.nextAnswerIndex) || 1, inferred + 1);

        return inferred;
    }

    function getClipboardDisplayTitle(entry) {
        if (entry?.isCurrent) return '현재 답변';

        const answerIndex = Number(entry?.answerIndex) || 0;

        return `${getKoreanOrdinal(answerIndex || 1)} 답변`;
    }

    function buildClipboardText() {
        const entries = getClipboardDisplayEntries();

        return entries
            .map(entry => `${getClipboardDisplayTitle(entry)}${entry.isCurrent ? ' NOW' : ''}\n\n${entry.text}`)
            .join('\n\n---\n\n');
    }

    function findClipboardTurnUserContainer() {
        checkClipboardTurnLifecycle();

        if (cleanClipboard.activeUserId) {
            const active = findMessageById(cleanClipboard.activeUserId);
            if (active && getMessageRole(active) === 'user') return active;
        }

        if (!cleanClipboard.turnKey) return null;

        return getMessageListInDomOrder()
            .find(item => item.role === 'user' && hashString(item.text) === cleanClipboard.turnKey)
            ?.el || null;
    }

    function findCurrentAssistantForClipboardTurn() {
        const userContainer = findClipboardTurnUserContainer();

        if (userContainer) {
            const assistants = collectAssistantCandidatesForUser(userContainer)
                .filter(el => document.body.contains(el));

            if (assistants[0]) return assistants[0];
        }

        return getMessageListInDomOrder()
            .find(item => item.role === 'assistant')
            ?.el || null;
    }

    function renderMarkdownInline(text) {
        const placeholders = [];

        function hold(html) {
            const key = `\u0000CRMD${placeholders.length}\u0000`;
            placeholders.push(html);
            return key;
        }

        let source = String(text || '');

        source = source.replace(/`([^`\n]+)`/g, (_, codeText) => {
            return hold(`<code>${escapeHTML(codeText)}</code>`);
        });

        source = escapeHTML(source);

        source = source.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
        source = source.replace(/__([\s\S]+?)__/g, '<strong>$1</strong>');
        source = source.replace(/(^|[\s(>])\*([^*\n]+?)\*(?=$|[\s).,!?:;\]가-힣])/g, '$1<em>$2</em>');
        source = source.replace(/(^|[\s(>])_([^_\n]+?)_(?=$|[\s).,!?:;\]가-힣])/g, '$1<em>$2</em>');

        placeholders.forEach((html, index) => {
            source = source.replaceAll(`\u0000CRMD${index}\u0000`, html);
        });

        return source;
    }

    function renderMarkdownBlock(block) {
        const lines = String(block || '').split('\n');

        if (lines.every(line => /^#{1,6}\s+/.test(line.trim()))) {
            return lines.map(line => {
                const match = line.trim().match(/^(#{1,6})\s+(.+)$/);
                const level = Math.min(match[1].length + 1, 6);

                return `<h${level}>${renderMarkdownInline(match[2])}</h${level}>`;
            }).join('');
        }

        if (lines.every(line => /^[-*]\s+/.test(line.trim()))) {
            return `<ul>${lines.map(line => `<li>${renderMarkdownInline(line.trim().replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`;
        }

        if (lines.every(line => /^\d+[.)]\s+/.test(line.trim()))) {
            return `<ol>${lines.map(line => `<li>${renderMarkdownInline(line.trim().replace(/^\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`;
        }

        return `<p>${renderMarkdownInline(block).replace(/\n/g, '<br>')}</p>`;
    }

    function renderPlainAnswerHTML(text) {
        const normalized = normalizeTurnText(text);
        if (!normalized) return '';

        const chunks = normalized.split(/(```[\s\S]*?```)/g).filter(Boolean);

        return chunks.map(chunk => {
            if (chunk.startsWith('```') && chunk.endsWith('```')) {
                const lines = chunk.split('\n');
                const bodyLines = lines.slice(1, -1);

                return `<pre><code>${escapeHTML(bodyLines.join('\n'))}</code></pre>`;
            }

            return chunk
                .split(/\n{2,}/)
                .filter(Boolean)
                .map(renderMarkdownBlock)
                .join('');
        }).join('');
    }

    async function replaceCurrentAssistantWithClipboardText(text) {
        const normalized = normalizeTurnText(text);

        if (!normalized) {
            showToast('빈 내용은 교체 안 됨', 'error');
            return false;
        }

        const assistant = findCurrentAssistantForClipboardTurn();

        if (!assistant) {
            showToast('교체할 현재 답변을 못 찾음', 'error');
            return false;
        }

        const messageId = getMessageId(assistant);
        const chatId = findChatId();

        if (!chatId || !messageId) {
            showToast('채팅 ID 또는 답변 ID를 못 찾음', 'error');
            return false;
        }

        const beforeText = normalizeTurnText(extractMessageText(assistant));

        try {
            showToast('크랙 서버에 답변 교체 중...');
            saveOverwriteBackup({
                chatId,
                messageId,
                label: '클린 리롤 교체',
                beforeText,
                afterText: normalized
            });

            await overwriteMessageOnServer(chatId, messageId, normalized);

            const markdown = assistant.querySelector(SELECTOR.markdown);
            if (markdown) {
                markdown.innerHTML = renderPlainAnswerHTML(normalized);
                markdown.dataset.cleanRerollReplaced = '1';
                assistant.setAttribute('data-cr-clean-visible-replaced', '1');
            }

            try {
                assistant.scrollIntoView({ block: 'center', inline: 'nearest' });
            } catch (_) {}

            return true;
        } catch (err) {
            warn('server overwrite failed', err);
            showToast(err?.message || '서버 답변 교체 실패', 'error');
            return false;
        }
    }

    function getCurrentAssistantClipboardEntry() {
        const assistant = findCurrentAssistantForClipboardTurn();

        if (!assistant) return null;

        const text = normalizeTurnText(extractMessageText(assistant));
        if (!text) return null;

        return {
            id: '__current_assistant__',
            hash: `current-${hashString(text)}`,
            text,
            answerIndex: resolveCurrentAnswerIndex(text),
            label: '현재 답변',
            compareText: '',
            createdAt: Date.now(),
            isCurrent: true
        };
    }

    function getClipboardDisplayEntries() {
        const current = getCurrentAssistantClipboardEntry();
        const saved = cleanClipboard.entries
            .map(entry => ({ ...entry, isCurrent: false }))
            .sort((a, b) => {
                const ai = Number(a.answerIndex) || 0;
                const bi = Number(b.answerIndex) || 0;

                return bi - ai || (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
            });

        return current ? [current, ...saved] : saved;
    }

    function getClipboardEntryById(id) {
        if (id === '__current_assistant__') {
            return getCurrentAssistantClipboardEntry();
        }

        return cleanClipboard.entries.find(item => item.id === id) || null;
    }

    async function swapSavedEntryWithCurrent(entryId) {
        const entry = cleanClipboard.entries.find(item => item.id === entryId);
        const current = getCurrentAssistantClipboardEntry();

        if (!entry) return false;

        const nextCurrentText = normalizeTurnText(entry.text);
        if (!nextCurrentText) return false;

        const previousCurrentText = normalizeTurnText(current?.text || '');
        const selectedAnswerIndex = Number(entry.answerIndex) || 1;
        const previousCurrentIndex = Number(current?.answerIndex) || resolveCurrentAnswerIndex(previousCurrentText);

        const ok = await replaceCurrentAssistantWithClipboardText(nextCurrentText);
        if (!ok) return false;

        cleanClipboard.currentAnswerIndex = selectedAnswerIndex;
        cleanClipboard.nextAnswerIndex = Math.max(
            Number(cleanClipboard.nextAnswerIndex) || 1,
            selectedAnswerIndex + 1,
            previousCurrentIndex + 1,
            getMaxAnswerIndex() + 1
        );

        if (previousCurrentText && previousCurrentText !== nextCurrentText) {
            entry.text = previousCurrentText;
            entry.hash = hashString(previousCurrentText);
            entry.answerIndex = previousCurrentIndex;
            entry.label = '';
            entry.compareText = '';
            entry.createdAt = Date.now();
        } else {
            cleanClipboard.entries = cleanClipboard.entries.filter(item => item.id !== entryId);
        }

        cleanClipboard.updatedAt = Date.now();
        saveCleanClipboardSnapshot();

        const open = document.querySelector('.cr-clip-overlay');
        if (open) renderCleanClipboardOverlay();

        return true;
    }

    async function updateClipboardEntryText(entryId, text) {
        const normalized = normalizeTurnText(text);

        if (!normalized) {
            showToast('빈 내용은 저장 안 됨', 'error');
            return false;
        }

        if (entryId === '__current_assistant__') {
            const ok = await replaceCurrentAssistantWithClipboardText(normalized);
            if (ok) {
                cleanClipboard.updatedAt = Date.now();
                saveCleanClipboardSnapshot();
            }
            return ok;
        }

        const entry = cleanClipboard.entries.find(item => item.id === entryId);
        if (!entry) return false;

        entry.text = normalized;
        entry.hash = hashString(normalized);
        entry.updatedAt = Date.now();
        cleanClipboard.updatedAt = Date.now();
        saveCleanClipboardSnapshot();

        return true;
    }

    async function replaceWithEditedClipboardText(entryId, text) {
        const normalized = normalizeTurnText(text);

        if (!normalized) {
            showToast('빈 내용은 교체 안 됨', 'error');
            return false;
        }

        if (entryId === '__current_assistant__') {
            return await replaceCurrentAssistantWithClipboardText(normalized);
        }

        const entry = cleanClipboard.entries.find(item => item.id === entryId);
        const current = getCurrentAssistantClipboardEntry();

        if (!entry) return false;

        const previousCurrentText = normalizeTurnText(current?.text || '');
        const selectedAnswerIndex = Number(entry.answerIndex) || 1;
        const previousCurrentIndex = Number(current?.answerIndex) || resolveCurrentAnswerIndex(previousCurrentText);
        const ok = await replaceCurrentAssistantWithClipboardText(normalized);

        if (!ok) return false;

        cleanClipboard.currentAnswerIndex = selectedAnswerIndex;
        cleanClipboard.nextAnswerIndex = Math.max(
            Number(cleanClipboard.nextAnswerIndex) || 1,
            selectedAnswerIndex + 1,
            previousCurrentIndex + 1,
            getMaxAnswerIndex() + 1
        );

        if (previousCurrentText && previousCurrentText !== normalized) {
            entry.text = previousCurrentText;
            entry.hash = hashString(previousCurrentText);
            entry.answerIndex = previousCurrentIndex;
            entry.label = '';
            entry.compareText = '';
            entry.createdAt = Date.now();
            entry.updatedAt = Date.now();
        } else {
            cleanClipboard.entries = cleanClipboard.entries.filter(item => item.id !== entryId);
        }

        cleanClipboard.updatedAt = Date.now();
        saveCleanClipboardSnapshot();

        return true;
    }



    function cleanMixerCloseModal() {
        document.getElementById(CLEAN_MIXER_MODAL_ID)?.remove();
    }

    function cleanMixerEscapeHtml(value = '') {
        return escapeHTML(value);
    }

    function cleanMixerNormalizeText(text = '') {
        return String(text).replace(/\s+/g, ' ').trim();
    }

    function cleanMixerStripSystemNote(text = '') {
        return cleanMixerNormalizeText(
            String(text)
                .replace(/^\s*\[\/\/\]:[^\n]*(?:\n|$)/gm, ' ')
                .replace(/\[\/\/\]:\s*#\s*\([^)]+\)/g, ' ')
                .replace(/```[\s\S]*?```/g, '[코드블록]')
                .replace(/!\[[^\]]*\]\([^)]+\)/g, '[이미지]')
        );
    }

    function cleanMixerShortPreview(text = '', max = 120) {
        const cleaned = cleanMixerStripSystemNote(text);
        return cleaned.length > max ? cleaned.slice(0, max) + '…' : cleaned;
    }

    function cleanMixerMessageIdOf(msg) {
        return msg?._id || msg?.id || msg?.cleanEntryId || '';
    }

    function cleanMixerGetMessageContent(msg) {
        return String(msg?.content || msg?.text || msg?.message || msg?.answer || '');
    }

    function cleanMixerGetVariantLabel(msg, fallbackIndex = 0) {
        return msg?.label || `답변 ${fallbackIndex + 1}`;
    }

    function cleanMixerBuildBundleFromClipboard() {
        const entries = getClipboardDisplayEntries();
        const currentAssistant = findCurrentAssistantForClipboardTurn();
        const currentMessageId = currentAssistant ? getMessageId(currentAssistant) : '';
        const variants = entries
            .filter(entry => normalizeTurnText(entry.text))
            .map((entry, index) => {
                const label = getClipboardDisplayTitle(entry);
                return {
                    _id: entry.isCurrent ? (currentMessageId || entry.id) : entry.id,
                    id: entry.isCurrent ? (currentMessageId || entry.id) : entry.id,
                    cleanEntryId: entry.id,
                    role: 'assistant',
                    content: normalizeTurnText(entry.text),
                    label,
                    answerIndex: Number(entry.answerIndex) || index + 1,
                    isCurrent: !!entry.isCurrent,
                    reroll: !entry.isCurrent
                };
            });

        const currentIndex = Math.max(0, variants.findIndex(item => item.isCurrent));

        return {
            variants,
            currentIndex,
            total: variants.length,
            currentMessageId,
            userPrompt: cleanClipboard.turnText ? { content: cleanClipboard.turnText, role: 'user' } : null
        };
    }

    function cleanMixerSplitIntoParagraphs(raw = '') {
        const text = String(raw || '')
            .replace(/\r\n/g, '\n')
            .trim();

        if (!text) return [];

        const blocks = [];
        let buffer = [];
        let inFence = false;

        const flushBuffer = () => {
            const value = buffer.join('\n').trim();
            if (value) blocks.push(value);
            buffer = [];
        };

        for (const line of text.split('\n')) {
            if (/^\s*```/.test(line)) {
                inFence = !inFence;
                buffer.push(line);
                continue;
            }

            if (!inFence && /^\s*\[\/\/\]:/.test(line)) {
                flushBuffer();
                blocks.push(line.trim());
                continue;
            }

            if (!inFence && line.trim() === '') {
                flushBuffer();
                continue;
            }

            buffer.push(line);
        }

        flushBuffer();

        return blocks
            .map(block => block.trim())
            .filter(Boolean);
    }

    function openCleanMixerFromClipboard() {
        const bundle = cleanMixerBuildBundleFromClipboard();

        if (!bundle.variants.length) {
            showToast('믹서에 넣을 리롤본이 없음', 'error');
            return;
        }

        cleanMixerShowModal(bundle);
    }

    function cleanMixerShowModal(bundle) {
        cleanMixerCloseModal();

        const overlay = document.createElement('div');
        overlay.id = CLEAN_MIXER_MODAL_ID;

        const total = bundle.variants.length;
        const current = Math.max(0, Math.min(bundle.currentIndex, total - 1));
        const defaultA = current;
        const defaultB = total > 1 ? (current > 0 ? current - 1 : 1) : current;

        const optionHtml = bundle.variants.map((msg, index) => {
            const preview = cleanMixerShortPreview(cleanMixerGetMessageContent(msg), 54);
            const currentLabel = msg.isCurrent ? ' · 현재' : '';
            return `<option value="${index}">${cleanMixerEscapeHtml(cleanMixerGetVariantLabel(msg, index))}${currentLabel} — ${cleanMixerEscapeHtml(preview)}</option>`;
        }).join('');

        overlay.innerHTML = `
            <div class="${CLEAN_MIXER_NS}-modal-card" role="dialog" aria-modal="true">
                <div class="${CLEAN_MIXER_NS}-modal-header">
                    <div>
                        <div class="${CLEAN_MIXER_NS}-modal-title">클린 리롤 믹서 🧩</div>
                        <div class="${CLEAN_MIXER_NS}-modal-desc">
                            클린 리롤로 저장된 답변을 A/B로 펼쳐 읽고, 마음에 드는 문단을 편집본에 모아요.
                        </div>
                    </div>
                    <button type="button" class="${CLEAN_MIXER_NS}-icon-btn" data-close>✕</button>
                </div>

                <div class="${CLEAN_MIXER_NS}-topbar">
                    <label>
                        <span>A 답변</span>
                        <select data-select-a>${optionHtml}</select>
                    </label>
                    <label>
                        <span>B 답변</span>
                        <select data-select-b>${optionHtml}</select>
                    </label>
                    <button type="button" class="${CLEAN_MIXER_NS}-soft-btn ${CLEAN_MIXER_NS}-swap-btn" data-swap title="A/B 답변 교체" aria-label="A/B 답변 교체">↔</button>
                </div>

                <div class="${CLEAN_MIXER_NS}-mobile-tabs">
                    <button type="button" class="is-active" data-tab="a">A <span class="${CLEAN_MIXER_NS}-tab-count" data-tab-count="a" hidden></span></button>
                    <button type="button" data-tab="b">B <span class="${CLEAN_MIXER_NS}-tab-count" data-tab-count="b" hidden></span></button>
                    <button type="button" data-tab="edit">편집본 <span class="${CLEAN_MIXER_NS}-tab-count" data-tab-count="edit" hidden></span></button>
                </div>

                <div class="${CLEAN_MIXER_NS}-modal-body">
                    <section class="${CLEAN_MIXER_NS}-answer-pane side-a" data-pane="a">
                        <div class="${CLEAN_MIXER_NS}-pane-title ${CLEAN_MIXER_NS}-answer-title">
                            <span>답변 A <small class="${CLEAN_MIXER_NS}-pane-count" data-answer-count-a></small></span>
                            <button type="button" class="${CLEAN_MIXER_NS}-title-add-all" data-add-whole-a>전체 추가</button>
                        </div>
                        <div class="${CLEAN_MIXER_NS}-paragraph-list" data-list-a></div>
                    </section>

                    <section class="${CLEAN_MIXER_NS}-answer-pane side-b" data-pane="b">
                        <div class="${CLEAN_MIXER_NS}-pane-title ${CLEAN_MIXER_NS}-answer-title">
                            <span>답변 B <small class="${CLEAN_MIXER_NS}-pane-count" data-answer-count-b></small></span>
                            <button type="button" class="${CLEAN_MIXER_NS}-title-add-all" data-add-whole-b>전체 추가</button>
                        </div>
                        <div class="${CLEAN_MIXER_NS}-paragraph-list" data-list-b></div>
                    </section>

                    <section class="${CLEAN_MIXER_NS}-editor-pane" data-pane="edit" data-editor-view="chips">
                        <div class="${CLEAN_MIXER_NS}-pane-title ${CLEAN_MIXER_NS}-editor-title">
                            <span>편집본 <small class="${CLEAN_MIXER_NS}-pane-count" data-editor-count></small></span>
                            <small data-overwrite-target>현재 답변에 덮어쓰기</small>
                        </div>
                        <div class="${CLEAN_MIXER_NS}-editor-chip-list" data-chip-list></div>
                        <textarea data-editor placeholder="마음에 드는 문단을 추가하면 여기에 모입니다. 여기서 직접 고쳐도 돼요."></textarea>
                        <div class="${CLEAN_MIXER_NS}-editor-actions">
                            <button type="button" class="${CLEAN_MIXER_NS}-soft-btn" data-toggle-editor-view>직접 편집</button>
                            <button type="button" class="${CLEAN_MIXER_NS}-soft-btn" data-clear-editor>비우기</button>
                        </div>
                    </section>
                </div>

                <div class="${CLEAN_MIXER_NS}-modal-footer">
                    <div class="${CLEAN_MIXER_NS}-meta" data-meta></div>
                    <div class="${CLEAN_MIXER_NS}-footer-buttons">
                        <button type="button" class="${CLEAN_MIXER_NS}-secondary-btn" data-copy>복사</button>
                        <button type="button" class="${CLEAN_MIXER_NS}-secondary-btn" data-insert>입력창</button>
                        <button type="button" class="${CLEAN_MIXER_NS}-primary-btn" data-overwrite>현재 답변에 덮어쓰기</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const selectA = overlay.querySelector('[data-select-a]');
        const selectB = overlay.querySelector('[data-select-b]');
        const listA = overlay.querySelector('[data-list-a]');
        const listB = overlay.querySelector('[data-list-b]');
        const editor = overlay.querySelector('[data-editor]');
        const meta = overlay.querySelector('[data-meta]');
        const overwriteTarget = overlay.querySelector('[data-overwrite-target]');
        const editorPane = overlay.querySelector('[data-pane="edit"]');
        const chipList = overlay.querySelector('[data-chip-list]');
        const editorViewToggle = overlay.querySelector('[data-toggle-editor-view]');

        selectA.value = String(defaultA);
        selectB.value = String(defaultB);
        editor.value = activeCleanMixerEditorText || '';

        const addedParagraphKeys = new Map();
        const addedParagraphSourceLabels = new Map();
        let editorComposing = false;

        const getEditorText = () => editor.value;
        const commitEditorText = () => {
            activeCleanMixerEditorText = editor.value;
            return activeCleanMixerEditorText;
        };
        const setEditorText = (value) => {
            editor.value = value;
            activeCleanMixerEditorText = value;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
        };

        function makeParagraphKey(answerIndex, pIndex) {
            return `${answerIndex}:${pIndex}`;
        }

        function normalizeEditorBlock(text = '') {
            return String(text || '')
                .replace(/\r\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        }

        function splitEditorBlocks(text = '') {
            const normalized = normalizeEditorBlock(text);
            if (!normalized) return [];
            return normalized
                .split(/\n{2,}/)
                .map(block => block.trim())
                .filter(Boolean);
        }

        function circledCount(count) {
            const marks = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳'];
            return marks[count] || String(count);
        }

        function sourceLabelFromText(label = '') {
            const value = String(label || '').trim().toUpperCase();
            if (value.startsWith('A')) return 'A';
            if (value.startsWith('B')) return 'B';
            return '';
        }

        function resolveSourceLabelFromKey(key = '') {
            const answerIndex = Number(String(key).split(':')[0]);
            if (Number.isNaN(answerIndex)) return '';
            if (answerIndex === Number(selectA.value)) return 'A';
            if (answerIndex === Number(selectB.value)) return 'B';
            return '';
        }

        function removeSourceForMissingBlocks() {
            for (const [key, text] of addedParagraphKeys.entries()) {
                if (!editorContainsParagraph(text)) {
                    addedParagraphKeys.delete(key);
                    addedParagraphSourceLabels.delete(key);
                }
            }
        }

        function getSourceForBlock(block = '') {
            const target = normalizeEditorBlock(block);
            if (!target) return { label: '직접', detail: '', cls: 'source-direct' };

            for (const [key, text] of addedParagraphKeys.entries()) {
                if (normalizeEditorBlock(text) !== target) continue;

                const [answerIndexRaw, pIndexRaw] = String(key).split(':');
                const answerIndex = Number(answerIndexRaw);
                const pIndex = Number(pIndexRaw);
                const sourceLabel = addedParagraphSourceLabels.get(key) || resolveSourceLabelFromKey(key);
                const paragraphLabel = Number.isNaN(pIndex) ? '' : `${sourceLabel || '문단'}-${pIndex + 1}`;

                if (sourceLabel === 'A') return { label: 'A', detail: paragraphLabel, cls: 'source-a' };
                if (sourceLabel === 'B') return { label: 'B', detail: paragraphLabel, cls: 'source-b' };

                if (!Number.isNaN(answerIndex)) {
                    const variantLabel = cleanMixerGetVariantLabel(bundle.variants[answerIndex], answerIndex);
                    return {
                        label: variantLabel,
                        detail: Number.isNaN(pIndex) ? '' : `문단 ${pIndex + 1}`,
                        cls: 'source-other'
                    };
                }
            }

            return { label: '직접', detail: '', cls: 'source-direct' };
        }

        function editorContainsParagraph(paragraph = '') {
            const target = normalizeEditorBlock(paragraph);
            if (!target) return false;
            return splitEditorBlocks(getEditorText()).some(block => normalizeEditorBlock(block) === target);
        }

        function removeParagraphFromEditor(paragraph = '') {
            const target = normalizeEditorBlock(paragraph);
            if (!target) return false;

            const blocks = splitEditorBlocks(getEditorText());
            const index = blocks.findIndex(block => normalizeEditorBlock(block) === target);

            if (index < 0) return false;

            blocks.splice(index, 1);
            setEditorText(blocks.join('\n\n'));
            return true;
        }

        function getAnswerParagraphs(answerIndex) {
            const msg = bundle.variants[answerIndex];
            if (!msg) return [];
            return cleanMixerSplitIntoParagraphs(cleanMixerGetMessageContent(msg)).filter(Boolean);
        }

        function getAnswerAddedCount(answerIndex) {
            return getAnswerParagraphs(answerIndex).reduce((count, paragraph) => {
                return count + (editorContainsParagraph(paragraph) ? 1 : 0);
            }, 0);
        }

        function updateAnswerBulkButton(btn, answerIndex, sideLabel = '') {
            if (!btn) return;

            const totalParagraphs = getAnswerParagraphs(answerIndex).length;
            const addedCount = getAnswerAddedCount(answerIndex);
            const hasAdded = addedCount > 0;

            btn.dataset.bulkMode = hasAdded ? 'remove' : 'add';
            btn.classList.toggle('is-remove', hasAdded);
            btn.textContent = hasAdded ? '전체 제거' : '전체 추가';
            btn.disabled = totalParagraphs <= 0;
            btn.title = hasAdded
                ? `${sideLabel || '이'} 답변에서 편집본에 들어간 문단 ${addedCount}개 제거`
                : `${sideLabel || '이'} 답변 전체를 편집본에 추가`;
        }

        function updateAnswerBulkButtons() {
            updateAnswerBulkButton(overlay.querySelector('[data-add-whole-a]'), Number(selectA.value), 'A');
            updateAnswerBulkButton(overlay.querySelector('[data-add-whole-b]'), Number(selectB.value), 'B');
        }

        function updateTabBadges() {
            const editorCount = splitEditorBlocks(getEditorText()).length;
            const aCount = getAnswerAddedCount(Number(selectA.value));
            const bCount = getAnswerAddedCount(Number(selectB.value));

            const setTabCount = (name, count) => {
                const el = overlay.querySelector(`[data-tab-count="${name}"]`);
                if (!el) return;
                el.textContent = count > 0 ? circledCount(count) : '';
                el.hidden = count <= 0;
            };

            setTabCount('a', aCount);
            setTabCount('b', bCount);
            setTabCount('edit', editorCount);

            const editorCountEl = overlay.querySelector('[data-editor-count]');
            if (editorCountEl) editorCountEl.textContent = editorCount > 0 ? `(${editorCount}개)` : '';

            const answerCountA = overlay.querySelector('[data-answer-count-a]');
            if (answerCountA) answerCountA.textContent = aCount > 0 ? `(${aCount}개 추가)` : '';

            const answerCountB = overlay.querySelector('[data-answer-count-b]');
            if (answerCountB) answerCountB.textContent = bCount > 0 ? `(${bCount}개 추가)` : '';
        }

        function renderEditorChips() {
            if (!chipList) return;

            const blocks = splitEditorBlocks(getEditorText());

            if (!blocks.length) {
                chipList.innerHTML = `<div class="${CLEAN_MIXER_NS}-chip-empty">아직 모은 문단이 없어요. A/B에서 마음에 드는 문단을 눌러 추가해 주세요.</div>`;
                return;
            }

            chipList.innerHTML = blocks.map((block, index) => {
                const source = getSourceForBlock(block);
                return `
                    <article class="${CLEAN_MIXER_NS}-editor-chip ${source.cls}">
                        <div class="${CLEAN_MIXER_NS}-chip-head">
                            <div class="${CLEAN_MIXER_NS}-chip-meta">
                                <span class="${CLEAN_MIXER_NS}-source-chip">${cleanMixerEscapeHtml(source.label)}</span>
                                ${source.detail ? `<span class="${CLEAN_MIXER_NS}-source-subchip">${cleanMixerEscapeHtml(source.detail)}</span>` : ''}
                            </div>
                            <div class="${CLEAN_MIXER_NS}-chip-buttons">
                                <button type="button" data-chip-up="${index}" ${index === 0 ? 'disabled' : ''} title="위로 이동">↑</button>
                                <button type="button" data-chip-down="${index}" ${index === blocks.length - 1 ? 'disabled' : ''} title="아래로 이동">↓</button>
                                <button type="button" data-chip-remove="${index}" title="이 문단 제거">✕</button>
                            </div>
                        </div>
                        <div class="${CLEAN_MIXER_NS}-chip-body">
                            <pre>${cleanMixerEscapeHtml(block)}</pre>
                        </div>
                    </article>
                `;
            }).join('');

            chipList.querySelectorAll('[data-chip-remove]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const blocksNow = splitEditorBlocks(getEditorText());
                    const index = Number(btn.dataset.chipRemove);
                    const block = blocksNow[index];
                    if (!block) return;
                    removeParagraphFromEditor(block);
                    syncParagraphButtons();
                });
            });

            chipList.querySelectorAll('[data-chip-up]').forEach(btn => {
                btn.addEventListener('click', () => moveEditorBlock(Number(btn.dataset.chipUp), -1));
            });

            chipList.querySelectorAll('[data-chip-down]').forEach(btn => {
                btn.addEventListener('click', () => moveEditorBlock(Number(btn.dataset.chipDown), 1));
            });
        }

        function moveEditorBlock(index, delta) {
            const blocks = splitEditorBlocks(getEditorText());
            const nextIndex = index + delta;

            if (index < 0 || nextIndex < 0 || index >= blocks.length || nextIndex >= blocks.length) return;

            [blocks[index], blocks[nextIndex]] = [blocks[nextIndex], blocks[index]];
            setEditorText(blocks.join('\n\n'));
            syncParagraphButtons();
        }

        function setEditorView(view) {
            const nextView = view === 'edit' ? 'edit' : 'chips';
            const currentView = editorPane?.dataset.editorView === 'edit' ? 'edit' : 'chips';

            if (currentView === 'edit' && nextView === 'chips') {
                editor.blur();
                commitEditorText();
            }

            if (editorPane) editorPane.dataset.editorView = nextView;
            if (editorViewToggle) editorViewToggle.textContent = nextView === 'edit' ? '수정 완료' : '직접 편집';

            if (nextView === 'chips') {
                syncParagraphButtons();
            } else {
                commitEditorText();
                renderEditorChips();
            }
        }

        function syncParagraphButtons() {
            overlay.querySelectorAll('[data-paragraph-key]').forEach(btn => {
                const key = btn.dataset.paragraphKey || '';
                const text = addedParagraphKeys.get(key) || btn.dataset.paragraphText || '';
                const isAdded = !!text && editorContainsParagraph(text);

                if (key && isAdded && !addedParagraphKeys.has(key)) {
                    addedParagraphKeys.set(key, text);
                    const sourceLabel = resolveSourceLabelFromKey(key);
                    if (sourceLabel) addedParagraphSourceLabels.set(key, sourceLabel);
                }

                if (key && addedParagraphKeys.has(key) && !isAdded) {
                    addedParagraphKeys.delete(key);
                    addedParagraphSourceLabels.delete(key);
                }

                btn.classList.toggle('is-added', isAdded);
                btn.textContent = isAdded ? '- 제거' : '+ 추가';
                btn.title = isAdded ? '편집본에서 이 문단 제거' : '편집본에 이 문단 추가';
                btn.setAttribute('aria-pressed', isAdded ? 'true' : 'false');
            });

            removeSourceForMissingBlocks();
            updateAnswerBulkButtons();
            updateTabBadges();
            renderEditorChips();
        }

        function appendToEditor(text, key = '', sourceLabel = '') {
            const clean = String(text || '').trim();
            const source = sourceLabelFromText(sourceLabel);
            if (!clean) return;

            if (editorContainsParagraph(clean)) {
                if (key) {
                    addedParagraphKeys.set(key, clean);
                    if (source) addedParagraphSourceLabels.set(key, source);
                }
                syncParagraphButtons();
                showToast('이미 편집본에 있는 문단이야.');
                return;
            }

            const currentText = getEditorText().trim();
            const next = currentText ? `${currentText}\n\n${clean}` : clean;
            setEditorText(next);

            if (key) {
                addedParagraphKeys.set(key, clean);
                if (source) addedParagraphSourceLabels.set(key, source);
            }

            syncParagraphButtons();
        }

        function removeFromEditor(text, key = '') {
            const clean = String(text || '').trim();
            if (!clean) return;

            const removed = removeParagraphFromEditor(clean);

            if (key) {
                addedParagraphKeys.delete(key);
                addedParagraphSourceLabels.delete(key);
            }

            syncParagraphButtons();

            if (!removed) showToast('편집본에서 원문 문단을 찾지 못했어.');
        }

        function toggleParagraphInEditor(text, key = '', sourceLabel = '') {
            const clean = String(text || '').trim();
            if (!clean) return;

            const alreadyAdded = key && addedParagraphKeys.has(key) && editorContainsParagraph(clean);

            if (alreadyAdded) {
                removeFromEditor(clean, key);
            } else {
                appendToEditor(clean, key, sourceLabel);
            }
        }

        function addWholeAnswerToEditor(answerIndex, sideLabel = '', sourceLabel = '') {
            const paragraphs = getAnswerParagraphs(answerIndex);
            const source = sourceLabelFromText(sourceLabel || sideLabel);

            if (!paragraphs.length) {
                showToast('추가할 문단을 찾지 못했어.');
                return;
            }

            let added = 0;
            let duplicated = 0;

            paragraphs.forEach((paragraph, pIndex) => {
                const clean = String(paragraph || '').trim();
                if (!clean) return;

                const key = makeParagraphKey(answerIndex, pIndex);

                if (editorContainsParagraph(clean)) {
                    addedParagraphKeys.set(key, clean);
                    if (source) addedParagraphSourceLabels.set(key, source);
                    duplicated++;
                    return;
                }

                const currentText = getEditorText().trim();
                const next = currentText ? `${currentText}\n\n${clean}` : clean;
                setEditorText(next);
                addedParagraphKeys.set(key, clean);
                if (source) addedParagraphSourceLabels.set(key, source);
                added++;
            });

            syncParagraphButtons();

            if (added > 0) showToast(`${sideLabel || '답변'} 전체에서 ${added}개 문단을 추가했어.`);
            else if (duplicated > 0) showToast('이미 편집본에 들어간 답변이야.');
        }

        function removeWholeAnswerFromEditor(answerIndex, sideLabel = '') {
            const paragraphs = getAnswerParagraphs(answerIndex);

            if (!paragraphs.length) {
                showToast('제거할 문단을 찾지 못했어.');
                return;
            }

            let removed = 0;

            paragraphs.forEach((paragraph, pIndex) => {
                const key = makeParagraphKey(answerIndex, pIndex);

                if (removeParagraphFromEditor(paragraph)) removed++;

                addedParagraphKeys.delete(key);
                addedParagraphSourceLabels.delete(key);
            });

            syncParagraphButtons();

            if (removed > 0) showToast(`${sideLabel || '답변'}에서 ${removed}개 문단을 제거했어.`);
            else showToast('편집본에서 원문 문단을 찾지 못했어.');
        }

        function toggleWholeAnswerInEditor(answerIndex, sideLabel = '', sourceLabel = '') {
            if (getAnswerAddedCount(answerIndex) > 0) {
                removeWholeAnswerFromEditor(answerIndex, sideLabel);
            } else {
                addWholeAnswerToEditor(answerIndex, sideLabel, sourceLabel);
            }
        }

        function renderList(listEl, answerIndex, sideLabel) {
            const msg = bundle.variants[answerIndex];
            const content = cleanMixerGetMessageContent(msg);
            const paragraphs = cleanMixerSplitIntoParagraphs(content);
            const isCurrent = !!msg?.isCurrent;
            const reroll = !!msg?.reroll;

            listEl.classList.toggle('side-a', sideLabel === 'A');
            listEl.classList.toggle('side-b', sideLabel === 'B');

            if (!paragraphs.length) {
                listEl.innerHTML = `<div class="${CLEAN_MIXER_NS}-empty">문단을 찾지 못했어요.</div>`;
                return;
            }

            const messageId = cleanMixerMessageIdOf(msg);
            const variantLabel = cleanMixerGetVariantLabel(msg, answerIndex);

            listEl.innerHTML = `
                <div class="${CLEAN_MIXER_NS}-answer-info">
                    <div class="${CLEAN_MIXER_NS}-answer-info-main">
                        <b>${sideLabel} · ${cleanMixerEscapeHtml(variantLabel)}</b>
                        ${isCurrent ? '<span class="badge current">현재 화면</span>' : ''}
                        ${reroll ? '<span class="badge reroll">saved</span>' : '<span class="badge original">current</span>'}
                        ${messageId ? `<button type="button" class="${CLEAN_MIXER_NS}-id-toggle" data-toggle-message-id aria-expanded="false" title="ID 보기">ⓘ</button><code class="${CLEAN_MIXER_NS}-message-id is-hidden" data-message-id>${cleanMixerEscapeHtml(messageId)}</code>` : ''}
                    </div>
                </div>
                ${paragraphs.map((paragraph, pIndex) => {
                    const paragraphKey = makeParagraphKey(answerIndex, pIndex);
                    const isAdded = editorContainsParagraph(paragraph);
                    const isCommentBlock = /^\s*\[\/\/\]:/.test(paragraph);
                    return `
                        <article class="${CLEAN_MIXER_NS}-paragraph-card ${isCommentBlock ? 'is-comment-block' : ''}">
                            <div class="${CLEAN_MIXER_NS}-paragraph-head">
                                <span>${sideLabel}-${pIndex + 1}${isCommentBlock ? ' · 주석' : ''}</span>
                                <button
                                    type="button"
                                    class="${isAdded ? 'is-added' : ''}"
                                    data-add-paragraph="${pIndex}"
                                    data-paragraph-key="${cleanMixerEscapeHtml(paragraphKey)}"
                                    data-paragraph-text="${cleanMixerEscapeHtml(paragraph)}"
                                    aria-pressed="${isAdded ? 'true' : 'false'}"
                                    title="${isAdded ? '편집본에서 이 문단 제거' : '편집본에 이 문단 추가'}"
                                >${isAdded ? '- 제거' : '+ 추가'}</button>
                            </div>
                            <pre>${cleanMixerEscapeHtml(paragraph)}</pre>
                        </article>
                    `;
                }).join('')}
            `;

            listEl.querySelectorAll('[data-add-paragraph]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const pIndex = Number(btn.dataset.addParagraph);
                    const key = btn.dataset.paragraphKey || makeParagraphKey(answerIndex, pIndex);
                    toggleParagraphInEditor(paragraphs[pIndex] || '', key, sideLabel);
                });
            });

            listEl.querySelectorAll('[data-toggle-message-id]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const code = btn.parentElement?.querySelector('[data-message-id]');
                    const nextExpanded = code?.classList.contains('is-hidden');
                    code?.classList.toggle('is-hidden', !nextExpanded);
                    btn.setAttribute('aria-expanded', nextExpanded ? 'true' : 'false');
                    btn.title = nextExpanded ? 'ID 숨기기' : 'ID 보기';
                });
            });

            syncParagraphButtons();
        }

        function renderAll() {
            const aIndex = Number(selectA.value);
            const bIndex = Number(selectB.value);

            renderList(listA, aIndex, 'A');
            renderList(listB, bIndex, 'B');

            const promptPreview = bundle.userPrompt ? cleanMixerShortPreview(cleanMixerGetMessageContent(bundle.userPrompt), 80) : '';
            const currentVariant = bundle.variants[current];
            const currentLabel = currentVariant ? cleanMixerGetVariantLabel(currentVariant, current) : '현재 답변';
            meta.textContent = `총 ${total}개 저장 · 현재: ${currentLabel}${promptPreview ? ` · 입력: ${promptPreview}` : ''}`;
            if (overwriteTarget) overwriteTarget.textContent = `덮어쓰기 대상: 현재 답변`;

            updateTabBadges();
            renderEditorChips();
        }

        function setMobileTab(tabName) {
            overlay.querySelectorAll('[data-tab]').forEach(btn => {
                btn.classList.toggle('is-active', btn.dataset.tab === tabName);
            });
            overlay.dataset.mobileTab = tabName;
        }

        selectA.addEventListener('change', renderAll);
        selectB.addEventListener('change', renderAll);
        editorViewToggle?.addEventListener('click', () => {
            const currentView = editorPane?.dataset.editorView === 'edit' ? 'edit' : 'chips';
            setEditorView(currentView === 'edit' ? 'chips' : 'edit');
        });
        editor.addEventListener('compositionstart', () => { editorComposing = true; });
        editor.addEventListener('compositionend', () => {
            editorComposing = false;
            commitEditorText();
            syncParagraphButtons();
        });
        editor.addEventListener('input', () => {
            commitEditorText();
            if (!editorComposing) syncParagraphButtons();
        });
        editor.addEventListener('change', () => {
            commitEditorText();
            syncParagraphButtons();
        });
        editor.addEventListener('blur', () => { commitEditorText(); });

        overlay.querySelector('[data-swap]').addEventListener('click', () => {
            const oldA = selectA.value;
            selectA.value = selectB.value;
            selectB.value = oldA;
            renderAll();
        });

        overlay.querySelector('[data-add-whole-a]')?.addEventListener('click', () => {
            toggleWholeAnswerInEditor(Number(selectA.value), 'A 답변', 'A');
        });

        overlay.querySelector('[data-add-whole-b]')?.addEventListener('click', () => {
            toggleWholeAnswerInEditor(Number(selectB.value), 'B 답변', 'B');
        });

        overlay.querySelector('[data-clear-editor]').addEventListener('click', () => {
            const ok = !editor.value.trim() || confirm('편집본을 비울까요?');
            if (!ok) return;
            setEditorText('');
        });

        overlay.querySelector('[data-copy]').addEventListener('click', async () => {
            commitEditorText();
            const text = editor.value.trim();
            if (!text) return alert('복사할 편집본이 비어 있어요.');
            await copyTextToSystemClipboard(text);
        });

        overlay.querySelector('[data-insert]').addEventListener('click', async () => {
            commitEditorText();
            const text = editor.value.trim();
            if (!text) return alert('입력창에 넣을 편집본이 비어 있어요.');
            const ok = await insertTextIntoEditor(text);
            if (ok) {
                showToast('입력창에 넣었어. 전송 전 확인해줘!');
                cleanMixerCloseModal();
            } else {
                alert('입력창을 찾지 못했습니다. 편집본 복사를 사용해 주세요.');
            }
        });

        overlay.querySelector('[data-overwrite]').addEventListener('click', async () => {
            commitEditorText();
            const text = editor.value.trim();
            if (!text) return alert('답변 덮어쓰기에 사용할 편집본이 비어 있어요.');

            if (!getCurrentAssistantClipboardEntry()) {
                alert('현재 답변을 찾지 못해서 덮어쓰기를 중단했어요.');
                return;
            }

            const beforePreview = cleanMixerShortPreview(cleanMixerGetMessageContent(bundle.variants[current]), 150);
            const afterPreview = cleanMixerShortPreview(text, 150);
            const ok = confirm([
                '현재 화면 답변에 편집본을 덮어쓸까요?',
                '',
                `기존: ${beforePreview}`,
                '',
                `변경: ${afterPreview}`,
                '',
                '덮어쓴 답변은 크랙 서버의 채팅 내용에 반영됩니다.'
            ].join('\n'));

            if (!ok) return;

            const btn = overlay.querySelector('[data-overwrite]');
            const oldLabel = btn.textContent;
            btn.disabled = true;
            btn.textContent = '덮어쓰는 중...';

            try {
                const success = await replaceCurrentAssistantWithClipboardText(text);
                if (!success) {
                    btn.disabled = false;
                    btn.textContent = oldLabel;
                    return;
                }

                activeCleanMixerEditorText = '';
                cleanMixerCloseModal();
                showToast('믹서 편집본 덮어쓰기 완료');
            } catch (err) {
                warn('clean mixer overwrite failed', err);
                alert(err?.message || '답변 덮어쓰기에 실패했어요.');
                btn.disabled = false;
                btn.textContent = oldLabel;
            }
        });

        overlay.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', cleanMixerCloseModal);
        });

        overlay.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => setMobileTab(btn.dataset.tab));
        });

        overlay.addEventListener('mousedown', e => {
            if (e.target === overlay) cleanMixerCloseModal();
        });

        renderAll();
        setEditorView('chips');
        setMobileTab('a');
    }

    function openCleanClipboardOverlay() {
        openCleanMixerFromClipboard();
    }

    function renderCleanClipboardOverlay() {
        const body = document.querySelector('.cr-clip-body');
        if (!body) return;

        const displayEntries = getClipboardDisplayEntries();
        const count = displayEntries.length;
        const savedCount = cleanClipboard.entries.length;
        const allText = buildClipboardText();

        if (!count) {
            body.innerHTML = `
                <div class="cr-clip-card cr-clip-empty">
                    <div class="cr-clip-empty-icon">↻</div>
                    <div>아직 이번 턴에서 저장된 클린 리롤 내용이 없음</div>
                    <p>클린 리롤로 삭제한 AI 답변들이 여기에 임시로 쌓임</p>
                </div>
            `;
            return;
        }

        body.innerHTML = `
            <div class="cr-clip-card cr-clip-actions">
                <div>
                    <strong>${count}개 표시됨</strong>
                    <span>저장본 ${savedCount}개 · 다음 턴에서 비워짐</span>
                </div>
                <div class="cr-clip-action-buttons">
                    <button type="button" class="cr-clip-ghost" data-cr-clip-copy-all>전체 복사</button>
                    <button type="button" class="cr-clip-danger" data-cr-clip-clear>비우기</button>
                </div>
            </div>
            <div class="cr-clip-list">
                ${displayEntries.map((entry, index) => `
                    <article class="cr-clip-item ${entry.isCurrent ? 'is-current' : ''}">
                        <div class="cr-clip-item-head">
                            <div>
                                <strong>${escapeHTML(getClipboardDisplayTitle(entry))}${entry.isCurrent ? '<em>NOW</em>' : ''}</strong>
                            </div>
                            <div class="cr-clip-item-buttons">
                                <button type="button" class="cr-clip-copy-one" data-cr-clip-copy-one="${escapeHTML(entry.id)}">복사</button>
                                <button type="button" class="cr-clip-edit-one" data-cr-clip-edit-one="${escapeHTML(entry.id)}">수정</button>
                                <button type="button" class="cr-clip-replace-one" data-cr-clip-replace-one="${escapeHTML(entry.id)}" ${entry.isCurrent ? 'disabled' : ''}>${entry.isCurrent ? '현재' : '교체'}</button>
                            </div>
                        </div>
                        ${cleanClipboardEditingId === entry.id ? `
                            <div class="cr-clip-editor">
                                <textarea data-cr-clip-edit-area="${escapeHTML(entry.id)}">${escapeHTML(entry.text)}</textarea>
                                <div class="cr-clip-editor-actions">
                                    <button type="button" class="cr-clip-replace-one" data-cr-clip-apply-edit="${escapeHTML(entry.id)}">${entry.isCurrent ? '적용' : '저장 후 교체'}</button>
                                    <button type="button" class="cr-clip-ghost" data-cr-clip-save-edit="${escapeHTML(entry.id)}">저장</button>
                                    <button type="button" class="cr-clip-ghost" data-cr-clip-cancel-edit>취소</button>
                                </div>
                            </div>
                        ` : `<pre>${escapeHTML(entry.text)}</pre>`}
                    </article>
                `).join('')}
            </div>
        `;

        body.querySelector('[data-cr-clip-copy-all]')?.addEventListener('click', async () => {
            const ok = await copyTextToSystemClipboard(allText);
            if (ok) showToast('클립보드에 복사됨');
        });

        body.querySelector('[data-cr-clip-clear]')?.addEventListener('click', () => {
            resetCleanClipboard();
        });

        body.querySelectorAll('[data-cr-clip-copy-one]').forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.getAttribute('data-cr-clip-copy-one');
                const entry = getClipboardEntryById(id);
                if (!entry) return;

                const ok = await copyTextToSystemClipboard(entry.text);
                if (ok) showToast('복사됨');
            });
        });

        body.querySelectorAll('[data-cr-clip-replace-one]').forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.getAttribute('data-cr-clip-replace-one');
                if (!id || id === '__current_assistant__') return;

                button.disabled = true;
                const oldText = button.textContent;
                button.textContent = '교체 중...';

                const ok = await swapSavedEntryWithCurrent(id);
                if (ok) {
                    document.querySelector('.cr-clip-overlay')?.remove();
                    finishServerOverwriteNoReload();
                } else {
                    button.disabled = false;
                    button.textContent = oldText;
                }
            });
        });

        body.querySelectorAll('[data-cr-clip-edit-one]').forEach(button => {
            button.addEventListener('click', () => {
                cleanClipboardEditingId = button.getAttribute('data-cr-clip-edit-one') || '';
                renderCleanClipboardOverlay();
            });
        });

        body.querySelectorAll('[data-cr-clip-cancel-edit]').forEach(button => {
            button.addEventListener('click', () => {
                cleanClipboardEditingId = '';
                renderCleanClipboardOverlay();
            });
        });

        body.querySelectorAll('[data-cr-clip-save-edit]').forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.getAttribute('data-cr-clip-save-edit');
                const textarea = body.querySelector(`[data-cr-clip-edit-area="${cssEscapeValue(id)}"]`);

                button.disabled = true;
                const oldText = button.textContent;
                button.textContent = '저장 중...';

                const ok = await updateClipboardEntryText(id, textarea?.value || '');

                if (ok) {
                    cleanClipboardEditingId = '';
                    if (id === '__current_assistant__') {
                        document.querySelector('.cr-clip-overlay')?.remove();
                        finishServerOverwriteNoReload();
                    } else {
                        renderCleanClipboardOverlay();
                    }
                } else {
                    button.disabled = false;
                    button.textContent = oldText;
                }
            });
        });

        body.querySelectorAll('[data-cr-clip-apply-edit]').forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.getAttribute('data-cr-clip-apply-edit');
                const textarea = body.querySelector(`[data-cr-clip-edit-area="${cssEscapeValue(id)}"]`);

                button.disabled = true;
                const oldText = button.textContent;
                button.textContent = '교체 중...';

                const ok = await replaceWithEditedClipboardText(id, textarea?.value || '');

                if (ok) {
                    cleanClipboardEditingId = '';
                    document.querySelector('.cr-clip-overlay')?.remove();
                    finishServerOverwriteNoReload();
                } else {
                    button.disabled = false;
                    button.textContent = oldText;
                }
            });
        });
    }

    function simulateRealClick(element) {
        if (!element) return false;

        try {
            element.scrollIntoView({ block: 'center', inline: 'center' });
        } catch (_) {}

        try {
            if (typeof PointerEvent !== 'undefined') {
                element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse' }));
                element.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerType: 'mouse' }));
            }
        } catch (_) {}

        try {
            element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
            element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
            element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            return true;
        } catch (_) {
            try {
                element.click();
                return true;
            } catch (err) {
                warn('click failed', err);
                return false;
            }
        }
    }

    async function waitFor(fn, timeout = 3000, interval = WAIT_STEP) {
        const started = Date.now();

        while (Date.now() - started < timeout) {
            const result = fn();
            if (result) return result;
            await wait(interval);
        }

        return null;
    }

    function escapeHTML(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function parseWrtnHTML(node, context = {}) {
        if (!node) return '';
        if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
        if (node.nodeType !== Node.ELEMENT_NODE) return '';

        const tag = node.tagName.toLowerCase();

        if (tag === 'img') return '';

        let inner = '';
        for (const child of node.childNodes) {
            inner += parseWrtnHTML(child, { inPre: context.inPre || tag === 'pre' });
        }

        switch (tag) {
            case 'strong':
            case 'b':
                return context.inPre ? inner : `**${inner}**`;

            case 'em':
            case 'i':
                return context.inPre ? inner : `*${inner}*`;

            case 'del':
            case 's':
                return context.inPre ? inner : `~${inner}~`;

            case 'br':
                return '\n';

            case 'code':
                if (context.inPre) return inner;
                return `\`${inner}\``;

            case 'pre':
                return `\n\`\`\`\n${inner.trimEnd()}\n\`\`\`\n\n`;

            case 'li':
                return `- ${inner.trim()}\n`;

            case 'blockquote':
                return inner
                    .split('\n')
                    .map(line => line ? `> ${line}` : '>')
                    .join('\n') + '\n\n';

            case 'p':
            case 'div':
                return `${inner.trimEnd()}\n\n`;

            default:
                return inner;
        }
    }

    function extractMessageText(container) {
        const markdown = container?.querySelector(SELECTOR.markdown);
        if (!markdown) return '';

        const parsed = parseWrtnHTML(markdown)
            .replace(/\u00a0/g, ' ')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        if (parsed) return parsed;

        return (markdown.innerText || markdown.textContent || '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function getMessageRole(container) {
        if (!container || !container.matches?.(SELECTOR.message)) return 'unknown';

        const markdown = container.querySelector(SELECTOR.markdown);
        if (!markdown) return 'unknown';

        if (markdown.classList.contains('css-peb4p4')) return 'user';
        if (markdown.classList.contains('css-v3ezgq')) return 'assistant';

        if (container.querySelector('.border-y.border-outline_tertiary')) return 'user';

        const buttons = Array.from(container.querySelectorAll('button'));
        if (buttons.some(isNativeRerollButton)) return 'assistant';

        if (container.querySelector('.flex.flex-col.gap-2.w-full')) return 'assistant';
        if (container.querySelector('.flex.flex-col.gap-2.w-auto')) return 'user';

        return 'unknown';
    }

    function isNativeRerollButton(btn) {
        if (!btn || btn.classList?.contains('cr-clean-reroll-btn')) return false;

        const path = btn.querySelector('svg path')?.getAttribute('d') || '';
        return path.startsWith(ICON.rerollPathStart);
    }

    function isSendButton(btn) {
        if (!btn || btn.disabled) return false;

        const cls = String(btn.className || '');
        const path = btn.querySelector('svg path')?.getAttribute('d') || '';

        return cls.includes('bg-primary') && path.startsWith(ICON.sendPathStart);
    }

    function findUserForAssistant(aiContainer) {
        if (!aiContainer) return null;

        let node = aiContainer.nextElementSibling;
        let guard = 0;

        while (node && guard < 20) {
            guard++;

            if (!node.matches?.(SELECTOR.message)) {
                node = node.nextElementSibling;
                continue;
            }

            const role = getMessageRole(node);
            if (role === 'user') return node;

            if (role === 'assistant' || role === 'unknown') {
                node = node.nextElementSibling;
                continue;
            }

            break;
        }

        return null;
    }

    function collectAssistantCandidatesForUser(userContainer) {
        const result = [];
        let node = userContainer?.previousElementSibling;
        let guard = 0;

        while (node && guard < 30 && result.length < MAX_ASSISTANT_CANDIDATES) {
            guard++;

            if (!node.matches?.(SELECTOR.message)) {
                node = node.previousElementSibling;
                continue;
            }

            const role = getMessageRole(node);

            if (role === 'user') break;

            if (role === 'assistant') {
                result.push(node);
                node = node.previousElementSibling;
                continue;
            }

            node = node.previousElementSibling;
        }

        return result;
    }

    function getMessageId(container) {
        return container?.getAttribute('data-message-group-id') || '';
    }

    function findMessageById(id) {
        if (!id) return null;

        const messages = Array.from(document.querySelectorAll(SELECTOR.message));
        return messages.find(el => getMessageId(el) === id) || null;
    }

    function findOptionButton(container) {
        return container?.querySelector(SELECTOR.optionButton) ||
               container?.querySelector('.dropdown-button button') ||
               null;
    }

    function findVisibleDeleteMenuItem() {
        const items = Array.from(document.querySelectorAll(SELECTOR.menuItem)).filter(isVisible);

        return items.find(el => {
            const text = (el.innerText || el.textContent || '').trim();
            return text === '삭제' || text.includes('삭제');
        }) || null;
    }

    function findVisibleDeleteConfirmButton() {
        const dialogs = Array.from(document.querySelectorAll(SELECTOR.dialog)).filter(isVisible);

        for (const dialog of dialogs) {
            const text = dialog.innerText || dialog.textContent || '';

            if (!text.includes('삭제')) continue;

            const buttons = Array.from(dialog.querySelectorAll('button')).filter(isVisible);

            const primaryDelete = buttons.find(btn => {
                const btnText = (btn.innerText || btn.textContent || '').trim();
                const cls = String(btn.className || '');
                return btnText === '삭제' && cls.includes('bg-primary');
            });

            if (primaryDelete) return primaryDelete;

            const anyDelete = buttons.find(btn => {
                const btnText = (btn.innerText || btn.textContent || '').trim();
                return btnText === '삭제' && !btnText.includes('취소');
            });

            if (anyDelete) return anyDelete;
        }

        return null;
    }

    async function deleteMessageOnce(container, label = 'message', options = {}) {
        const requireRemoved = options.requireRemoved !== false;

        if (!container || !document.body.contains(container)) {
            return {
                removed: true,
                remaining: null
            };
        }

        const id = getMessageId(container);
        if (!id) throw new Error(`${label} ID를 찾지 못했습니다.`);

        const optionButton = findOptionButton(container);
        if (!optionButton) throw new Error(`${label} 옵션 버튼을 찾지 못했습니다.`);

        simulateRealClick(optionButton);

        const deleteItem = await waitFor(findVisibleDeleteMenuItem, 2500);
        if (!deleteItem) {
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Escape',
                bubbles: true,
                cancelable: true
            }));
            throw new Error(`${label} 삭제 메뉴를 찾지 못했습니다.`);
        }

        simulateRealClick(deleteItem);

        const confirmButton = await waitFor(findVisibleDeleteConfirmButton, 2500);
        if (!confirmButton) {
            throw new Error(`${label} 삭제 확인 버튼을 찾지 못했습니다.`);
        }

        simulateRealClick(confirmButton);

        if (requireRemoved) {
            const removed = await waitFor(() => !findMessageById(id), 4500);

            if (!removed) {
                throw new Error(`${label} 삭제 후에도 메시지가 남아 있습니다.`);
            }

            return {
                removed: true,
                remaining: null
            };
        }

        await wait(650);

        const remaining = findMessageById(id);

        return {
            removed: !remaining,
            remaining
        };
    }

    async function deleteAssistantMessageFully(container, label = 'AI 답변') {
        if (!container || !document.body.contains(container)) return true;

        const id = getMessageId(container);
        if (!id) throw new Error(`${label} ID를 찾지 못했습니다.`);

        for (let pass = 1; pass <= MAX_VARIANTS_PER_ASSISTANT; pass++) {
            const current = findMessageById(id);

            if (!current) {
                return true;
            }

            const compareText =
                Array.from(current.querySelectorAll('button'))
                    .map(btn => btn.innerText || btn.textContent || '')
                    .find(text => /답변\s*비교\s*\d+\s*\/\s*\d+/.test(text)) || '';

            log(`${label} 삭제 시도`, {
                pass,
                id,
                compareText
            });

            const deletedText = extractMessageText(current);
            appendCleanClipboardEntry(deletedText, {
                label: `${label} 후보 ${pass}`,
                compareText
            });

            const result = await deleteMessageOnce(current, `${label} 후보 ${pass}`, {
                requireRemoved: false
            });

            if (result.removed) {
                return true;
            }

            await wait(350);
        }

        if (findMessageById(id)) {
            throw new Error(`${label}의 후보 답변을 모두 삭제하지 못했습니다.`);
        }

        return true;
    }

    function selectEditorContents(editor) {
        const selection = window.getSelection();
        const range = document.createRange();

        range.selectNodeContents(editor);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function textToEditorHTML(text) {
        const safe = escapeHTML(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        return `<p>${safe.replace(/\n/g, '<br>')}</p>`;
    }

    async function insertTextIntoEditor(text) {
        const editor = await waitFor(() => document.querySelector(SELECTOR.editor), 3000);
        if (!editor) return false;

        editor.focus();
        await wait(50);

        try {
            selectEditorContents(editor);
            document.execCommand('delete', false, null);
        } catch (_) {
            editor.innerHTML = '<p><br></p>';
        }

        await wait(50);

        let inserted = false;

        try {
            inserted = document.execCommand('insertText', false, text);
        } catch (_) {
            inserted = false;
        }

        if (!inserted || !editor.innerText.trim()) {
            try {
                const data = new DataTransfer();
                data.setData('text/plain', text);

                const pasteEvent = new ClipboardEvent('paste', {
                    bubbles: true,
                    cancelable: true,
                    clipboardData: data
                });

                editor.dispatchEvent(pasteEvent);
                inserted = true;
            } catch (_) {}
        }

        if (!editor.innerText.trim()) {
            editor.innerHTML = textToEditorHTML(text);
        }

        editor.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: text
        }));

        editor.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

        await wait(150);

        return !!(editor.innerText || '').trim();
    }

    function findSendButton() {
        const editor = document.querySelector(SELECTOR.editor);

        const root =
            editor?.closest('form') ||
            editor?.parentElement?.parentElement?.parentElement ||
            document.body;

        const buttons = Array.from(root.querySelectorAll('button'));

        return buttons.find(isSendButton) || null;
    }

    async function clickSendButton() {
        const sendButton = await waitFor(findSendButton, 2500);

        if (sendButton && !sendButton.disabled) {
            simulateRealClick(sendButton);
            return true;
        }

        const editor = document.querySelector(SELECTOR.editor);
        if (editor) {
            editor.focus();
            editor.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true
            }));
            return true;
        }

        return false;
    }

    function showToast(message, type = 'info') {
        const old = document.getElementById('cr-clean-reroll-toast');
        if (old) old.remove();

        const toast = document.createElement('div');
        toast.id = 'cr-clean-reroll-toast';
        toast.textContent = message;
        toast.dataset.type = type;

        document.body.appendChild(toast);

        setTimeout(() => {
            if (document.body.contains(toast)) toast.remove();
        }, 3200);
    }

    async function executeCleanReroll(event) {
        event.preventDefault();
        event.stopPropagation();

        const button = event.currentTarget;

        button.innerHTML = createCleanRerollIconSVG();
        button.classList.add('cr-clean-reroll-working');
        button.disabled = true;
        button.style.pointerEvents = 'none';
        isCleanRerollExecuting = true;

        try {
            const clickedAssistant = button.closest(SELECTOR.message);
            if (!clickedAssistant) throw new Error('AI 메시지를 찾지 못했습니다.');

            const clickedRole = getMessageRole(clickedAssistant);
            if (clickedRole !== 'assistant') {
                throw new Error('이 버튼이 AI 답변에 붙어 있지 않습니다.');
            }

            const userContainer = findUserForAssistant(clickedAssistant);
            if (!userContainer) throw new Error('이 AI 답변에 연결된 유저 메시지를 찾지 못했습니다.');

            const userText = extractMessageText(userContainer);
            if (!userText) {
                throw new Error('유저 메시지 텍스트를 추출하지 못했습니다.');
            }

            const preExistingUserIds = getUserMessageIdsSnapshot();
            ensureClipboardTurn(userText, preExistingUserIds);

            const assistants = collectAssistantCandidatesForUser(userContainer);
            if (!assistants.length) {
                throw new Error('삭제할 AI 답변 후보를 찾지 못했습니다.');
            }

            const assistantIds = assistants.map(getMessageId).filter(Boolean);
            log('target user:', getMessageId(userContainer), 'assistants:', assistantIds);

            for (let i = 0; i < assistants.length; i++) {
                const target = assistants[i];

                if (!target || !document.body.contains(target)) continue;

                await deleteAssistantMessageFully(target, `AI 답변 ${i + 1}`);
                await wait(250);
            }

            await deleteMessageOnce(userContainer, '유저 메시지', {
                requireRemoved: true
            });
            await wait(250);

            const typed = await insertTextIntoEditor(userText);
            if (!typed) {
                throw new Error('입력창에 메시지를 복원하지 못했습니다.');
            }

            if (getAutoSendState()) {
                await wait(250);
                const sent = await clickSendButton();

                if (!sent) {
                    showToast('입력창에 복원했지만 전송 버튼을 찾지 못했어요.', 'warn');
                }
            } else {
            }

        } catch (err) {
            console.error('[Clean Reroll] failed:', err);
            alert(`클린 리롤 실패: ${err.message}`);
        } finally {
            isCleanRerollExecuting = false;

            if (document.body.contains(button)) {
                button.classList.remove('cr-clean-reroll-working');
                button.innerHTML = createCleanRerollIconSVG();
                button.disabled = false;
                button.style.pointerEvents = 'auto';
            }

            requestAnimationFrame(() => {
                try {
                    addCleanRerollButtons();
                    addSettingsMenuToggle();
                } catch (err) {
                    warn('post reroll cleanup failed:', err);
                }
            });
        }
    }

    function createCleanRerollIconSVG() {
        return `
            <svg class="cr-clean-reroll-icon"
                 xmlns="http://www.w3.org/2000/svg"
                 fill="currentColor"
                 viewBox="0 0 24 24"
                 width="19"
                 height="19"
                 aria-hidden="true"
                 focusable="false">
                <path class="cr-clean-reroll-native"
                      d="M3.8 12a8.2 8.2 0 0 1 13.05-6.61H15v1.6h4.68V2.31h-1.6v2A9.8 9.8 0 0 0 2.72 15.17l1.52-.5A8 8 0 0 1 3.8 12m15.96-2.65A8.21 8.21 0 0 1 7.15 18.6h1.87V17H4.34v4.68h1.6V19.7A9.8 9.8 0 0 0 21.28 8.83z"/>
                <path class="cr-clean-reroll-sparkle"
                      d="M12 6.55 13.48 10.52 17.45 12 13.48 13.48 12 17.45 10.52 13.48 6.55 12 10.52 10.52Z"/>
            </svg>
        `;
    }

    function clearLongPressCharge(button) {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }

        button?.classList?.remove('cr-clean-reroll-charging');
    }

    function setupCleanButtonInteractions(button) {
        button.addEventListener('pointerdown', event => {
            if (event.button != null && event.button !== 0) return;

            clearLongPressCharge(button);

            button.classList.add('cr-clean-reroll-charging');

            longPressTimer = setTimeout(() => {
                longPressTimer = null;
                longPressTriggeredAt = Date.now();
                button.classList.remove('cr-clean-reroll-charging');
                openCleanClipboardOverlay();
            }, LONG_PRESS_MS);
        });

        button.addEventListener('pointerup', () => clearLongPressCharge(button));
        button.addEventListener('pointerleave', () => clearLongPressCharge(button));
        button.addEventListener('pointercancel', () => clearLongPressCharge(button));

        button.addEventListener('contextmenu', event => {
            if (button.classList.contains('cr-clean-reroll-charging')) {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        button.addEventListener('click', event => {
            const justLongPressed = Date.now() - longPressTriggeredAt < 900;

            if (justLongPressed) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            executeCleanReroll(event);
        });

        button.addEventListener('touchstart', event => event.stopPropagation(), { passive: true });
    }

    function createCleanButton(nativeRerollButton) {
        const cleanButton = document.createElement('button');

        cleanButton.type = 'button';
        cleanButton.className = `${nativeRerollButton.className || ''} cr-clean-reroll-btn`;
        cleanButton.innerHTML = createCleanRerollIconSVG();
        cleanButton.title = '클린 리롤';
        cleanButton.setAttribute('aria-label', '클린 리롤');

        Object.assign(cleanButton.style, {
            fontSize: '15px',
            lineHeight: '1',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        setupCleanButtonInteractions(cleanButton);

        return cleanButton;
    }

    function addCleanRerollButtons() {
        if (isCleanRerollExecuting) return;

        const messages = Array.from(document.querySelectorAll(SELECTOR.message));

        for (const message of messages) {
            if (getMessageRole(message) !== 'assistant') {
                message.querySelectorAll?.('.cr-clean-reroll-btn').forEach(btn => btn.remove());
                continue;
            }

            const nativeButtons = Array.from(message.querySelectorAll('button'))
                .filter(btn => isNativeRerollButton(btn) && isVisible(btn));

            if (!nativeButtons.length) {
                message.querySelectorAll('.cr-clean-reroll-btn').forEach(btn => btn.remove());
                continue;
            }

            const nativeParents = new Set(nativeButtons.map(btn => btn.parentElement).filter(Boolean));

            message.querySelectorAll('.cr-clean-reroll-btn').forEach(cleanBtn => {
                const parent = cleanBtn.parentElement;
                const prev = cleanBtn.previousElementSibling;
                const isValid =
                    parent &&
                    nativeParents.has(parent) &&
                    prev &&
                    isNativeRerollButton(prev);

                if (!isValid) {
                    cleanBtn.remove();
                }
            });

            for (const nativeButton of nativeButtons) {
                const row = nativeButton.parentElement;
                if (!row) continue;

                const cleanSiblings = Array.from(row.children)
                    .filter(el => el.classList?.contains('cr-clean-reroll-btn'));

                const correctButton =
                    nativeButton.nextElementSibling?.classList?.contains('cr-clean-reroll-btn')
                        ? nativeButton.nextElementSibling
                        : null;

                for (const cleanButton of cleanSiblings) {
                    if (cleanButton !== correctButton) {
                        cleanButton.remove();
                    }
                }

                if (correctButton) {
                    nativeButton.dataset.cleanRerollHooked = '1';
                    continue;
                }

                const cleanButton = createCleanButton(nativeButton);
                nativeButton.insertAdjacentElement('afterend', cleanButton);
                nativeButton.dataset.cleanRerollHooked = '1';
            }
        }
    }

    function updateAutoSendToggles() {
        const enabled = getAutoSendState();

        document.querySelectorAll('[data-cr-clean-autosend-toggle]').forEach(toggle => {
            toggle.setAttribute('aria-checked', String(enabled));
            toggle.dataset.state = enabled ? 'checked' : 'unchecked';

            const knob = toggle.querySelector('[data-cr-clean-toggle-knob]');
            if (knob) knob.dataset.state = enabled ? 'checked' : 'unchecked';
        });
    }

    function createAutoSendSettingRow() {
        const enabled = getAutoSendState();
        const state = enabled ? 'checked' : 'unchecked';

        const row = document.createElement('div');
        row.id = 'cr-clean-reroll-setting';
        row.className = 'px-2.5 h-4 box-content py-[18px]';

        row.innerHTML = `
            <div role="button" tabindex="0" class="w-full flex h-4 items-center justify-between typo-text-base_leading-none_medium space-x-2 [&_svg]:fill-icon_tertiary ring-offset-4 ring-offset-sidebar cursor-pointer">
                <span class="flex space-x-2 items-center">
                    <svg xmlns="http://www.w3.org/2000/svg"
                         fill="var(--icon_secondary)"
                         viewBox="0 0 24 24"
                         width="24"
                         height="24"
                         color="icon_secondary"
                         aria-hidden="true"
                         focusable="false">
                        <path d="M3.8 12a8.2 8.2 0 0 1 13.05-6.61H15v1.6h4.68V2.31h-1.6v2A9.8 9.8 0 0 0 2.72 15.17l1.52-.5A8 8 0 0 1 3.8 12m15.96-2.65A8.21 8.21 0 0 1 7.15 18.6h1.87V17H4.34v4.68h1.6V19.7A9.8 9.8 0 0 0 21.28 8.83z"></path>
                    </svg>
                    <span class="whitespace-nowrap overflow-hidden text-ellipsis typo-text-sm_leading-none_medium">클린 리롤 자동 전송</span>
                </span>
                <span>
                    <button type="button"
                            role="switch"
                            aria-checked="${enabled}"
                            data-state="${state}"
                            value="on"
                            data-cr-clean-autosend-toggle
                            class="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors border data-[state=unchecked]:border-bg-input-80 data-[state=unchecked]:bg-bg-input-80 data-[state=checked]:border-primary data-[state=checked]:bg-primary focus-visible:border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50"
                            tabindex="-1">
                        <span data-state="${state}"
                              data-cr-clean-toggle-knob
                              class="pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[15px] data-[state=unchecked]:translate-x-[-1px]"></span>
                    </button>
                </span>
            </div>
        `;

        const clickTarget = row.querySelector('div[role="button"]');

        clickTarget.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            toggleAutoSendState();
        });

        clickTarget.addEventListener('keydown', e => {
            if (e.key !== 'Enter' && e.key !== ' ') return;

            e.preventDefault();
            e.stopPropagation();

            toggleAutoSendState();
        });

        return row;
    }

    function findSettingsInsertTarget() {
        const exactLabels = [
            '상황 이미지 보기',
            '상황 이미지 생성하기',
            '추천 답변 받기',
            '채팅방 설정'
        ];

        const spans = Array.from(document.querySelectorAll('span, div')).filter(isVisible);

        for (const label of exactLabels) {
            const textEl = spans.find(el => (el.textContent || '').trim() === label);
            if (!textEl) continue;

            return textEl.closest('.box-content') ||
                   textEl.closest('[role="button"]')?.parentElement ||
                   textEl.closest('div');
        }

        return null;
    }

    function addSettingsMenuToggle() {
        if (document.getElementById('cr-clean-reroll-setting')) {
            updateAutoSendToggles();
            return;
        }

        const target = findSettingsInsertTarget();
        if (!target || !target.parentNode) return;

        const row = createAutoSendSettingRow();
        target.parentNode.insertBefore(row, target.nextSibling);
        updateAutoSendToggles();
    }



    function injectCleanMixerStyles() {
        GM_addStyle(`
            .${CLEAN_MIXER_BUTTON_CLASS} {
                margin-left: 0 !important;
                background-color: var(--transparent) !important;
                color: hsl(var(--line-gray-2)) !important;
            }

            .${CLEAN_MIXER_BUTTON_CLASS} .${CLEAN_MIXER_NS}-btn-label {
                font-size: inherit;
                font-weight: inherit;
                line-height: inherit;
                color: inherit;
            }

            .${CLEAN_MIXER_BUTTON_CLASS} svg {
                color: inherit;
            }

            #${CLEAN_MIXER_NS}-toast {
                position: fixed;
                right: 22px;
                bottom: 122px;
                z-index: 2147483001;
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: none;
            }

            .${CLEAN_MIXER_NS}-toast-item {
                max-width: 320px;
                padding: 10px 12px;
                border-radius: 12px;
                background: rgba(24,24,27,.94);
                color: #fff;
                font-size: 13px;
                line-height: 1.4;
                box-shadow: 0 8px 24px rgba(0,0,0,.24);
                transition: opacity .22s ease, transform .22s ease;
                backdrop-filter: blur(10px);
            }

            .${CLEAN_MIXER_NS}-toast-item.success {
                background: rgba(24, 128, 72, .94);
            }

            #${CLEAN_MIXER_MODAL_ID} {
                --rrm-overlay: rgba(0, 0, 0, .42);
                --rrm-bg: #ffffff;
                --rrm-panel: #f7f7f8;
                --rrm-card: #ffffff;
                --rrm-text: #18181b;
                --rrm-strong: #0f0f12;
                --rrm-muted: #6f7178;
                --rrm-faint: #8b8e97;
                --rrm-border: rgba(16, 18, 24, .13);
                --rrm-soft: rgba(16, 18, 24, .065);
                --rrm-soft-hover: rgba(16, 18, 24, .105);
                --rrm-input: #ffffff;
                --rrm-primary: #ff4432;
                --rrm-primary-hover: #ff5b4b;
                --rrm-primary-text: #ffffff;
                --rrm-a: #BA7517;
                --rrm-a-soft: rgba(186,117,23,.12);
                --rrm-b: #185FA5;
                --rrm-b-soft: rgba(24,95,165,.12);
                --rrm-blue-bg: rgba(37, 99, 235, .12);
                --rrm-blue-text: #1d4ed8;
                --rrm-shadow: 0 20px 80px rgba(0,0,0,.28);
                position: fixed;
                inset: 0;
                z-index: 2147483002;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 18px;
                background: var(--rrm-overlay);
                backdrop-filter: blur(5px);
                color: var(--rrm-text);
            }

            body[data-theme="dark"] #${CLEAN_MIXER_MODAL_ID},
            [data-theme="dark"] #${CLEAN_MIXER_MODAL_ID} {
                --rrm-overlay: rgba(0, 0, 0, .58);
                --rrm-bg: #18181c;
                --rrm-panel: #202027;
                --rrm-card: #24242b;
                --rrm-text: #f4f4f5;
                --rrm-strong: #ffffff;
                --rrm-muted: rgba(255,255,255,.68);
                --rrm-faint: rgba(255,255,255,.46);
                --rrm-border: rgba(255,255,255,.12);
                --rrm-soft: rgba(255,255,255,.085);
                --rrm-soft-hover: rgba(255,255,255,.14);
                --rrm-input: #18181c;
                --rrm-a: #EF9F27;
                --rrm-a-soft: rgba(239,159,39,.18);
                --rrm-b: #378ADD;
                --rrm-b-soft: rgba(55,138,221,.18);
                --rrm-blue-bg: rgba(92, 154, 255, .18);
                --rrm-blue-text: #9fc4ff;
                --rrm-shadow: 0 20px 80px rgba(0,0,0,.48);
            }

            @media (prefers-color-scheme: dark) {
                body:not([data-theme="light"]) #${CLEAN_MIXER_MODAL_ID} {
                    --rrm-overlay: rgba(0, 0, 0, .58);
                    --rrm-bg: #18181c;
                    --rrm-panel: #202027;
                    --rrm-card: #24242b;
                    --rrm-text: #f4f4f5;
                    --rrm-strong: #ffffff;
                    --rrm-muted: rgba(255,255,255,.68);
                    --rrm-faint: rgba(255,255,255,.46);
                    --rrm-border: rgba(255,255,255,.12);
                    --rrm-soft: rgba(255,255,255,.085);
                    --rrm-soft-hover: rgba(255,255,255,.14);
                    --rrm-input: #18181c;
                    --rrm-a: #EF9F27;
                    --rrm-a-soft: rgba(239,159,39,.18);
                    --rrm-b: #378ADD;
                    --rrm-b-soft: rgba(55,138,221,.18);
                    --rrm-blue-bg: rgba(92, 154, 255, .18);
                    --rrm-blue-text: #9fc4ff;
                    --rrm-shadow: 0 20px 80px rgba(0,0,0,.48);
                }
            }

            .${CLEAN_MIXER_NS}-modal-card {
                width: min(1240px, calc(100vw - 28px));
                height: min(860px, calc(100vh - 28px));
                display: flex;
                flex-direction: column;
                overflow: hidden;
                border-radius: 18px;
                border: 1px solid var(--rrm-border);
                background: var(--rrm-bg);
                color: var(--rrm-text);
                box-shadow: var(--rrm-shadow);
            }

            .${CLEAN_MIXER_NS}-modal-header {
                display: flex;
                justify-content: space-between;
                gap: 14px;
                padding: 15px 18px 11px;
                border-bottom: 1px solid var(--rrm-border);
                background: var(--rrm-bg);
            }

            .${CLEAN_MIXER_NS}-modal-title {
                font-size: 18px;
                line-height: 1.2;
                font-weight: 900;
                color: var(--rrm-strong);
            }

            .${CLEAN_MIXER_NS}-modal-desc {
                margin-top: 6px;
                color: var(--rrm-muted);
                font-size: 13px;
                line-height: 1.45;
            }

            .${CLEAN_MIXER_NS}-icon-btn {
                flex: 0 0 auto;
                width: 32px;
                height: 32px;
                border: 1px solid var(--rrm-border);
                border-radius: 999px;
                background: var(--rrm-soft);
                color: var(--rrm-text);
                cursor: pointer;
                font-size: 16px;
            }

            .${CLEAN_MIXER_NS}-icon-btn:hover {
                background: var(--rrm-soft-hover);
            }

            .${CLEAN_MIXER_NS}-topbar {
                display: grid;
                grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
                gap: 10px;
                align-items: end;
                padding: 12px 18px;
                border-bottom: 1px solid var(--rrm-border);
                background: var(--rrm-panel);
            }

            .${CLEAN_MIXER_NS}-topbar label {
                display: flex;
                flex-direction: column;
                gap: 5px;
                min-width: 0;
            }

            .${CLEAN_MIXER_NS}-topbar label span {
                font-size: 12px;
                color: var(--rrm-muted);
                font-weight: 800;
            }

            .${CLEAN_MIXER_NS}-topbar select {
                width: 100%;
                min-height: 34px;
                border: 1px solid var(--rrm-border);
                border-radius: 10px;
                background: var(--rrm-input);
                color: var(--rrm-text);
                padding: 0 10px;
                font-size: 13px;
                outline: none;
            }

            .${CLEAN_MIXER_NS}-topbar select option {
                background: var(--rrm-bg);
                color: var(--rrm-text);
            }

            .${CLEAN_MIXER_NS}-swap-btn {
                align-self: end;
                width: 38px;
                min-width: 38px;
                padding: 0 !important;
                font-size: 16px;
                line-height: 1;
            }

            .${CLEAN_MIXER_NS}-mobile-tabs {
                display: none;
                grid-template-columns: repeat(3, 1fr);
                gap: 6px;
                padding: 10px 12px 0;
                background: var(--rrm-bg);
            }

            .${CLEAN_MIXER_NS}-mobile-tabs button {
                min-height: 34px;
                border: 1px solid var(--rrm-border);
                border-radius: 999px;
                background: var(--rrm-soft);
                color: var(--rrm-muted);
                font-weight: 900;
            }

            .${CLEAN_MIXER_NS}-mobile-tabs button.is-active {
                background: var(--rrm-primary);
                color: var(--rrm-primary-text);
                border-color: transparent;
            }

            .${CLEAN_MIXER_NS}-tab-count {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 18px;
                height: 18px;
                margin-left: 4px;
                border-radius: 999px;
                background: rgba(255,255,255,.22);
                color: inherit;
                font-size: 12px;
                line-height: 1;
            }

            .${CLEAN_MIXER_NS}-tab-count[hidden] {
                display: none !important;
            }

            .${CLEAN_MIXER_NS}-modal-body {
                flex: 1;
                min-height: 0;
                display: grid;
                grid-template-columns: minmax(300px, 1fr) minmax(300px, 1fr) minmax(280px, .82fr);
                gap: 12px;
                padding: 14px 18px;
                overflow: hidden;
                background: var(--rrm-bg);
            }

            .${CLEAN_MIXER_NS}-answer-pane,
            .${CLEAN_MIXER_NS}-editor-pane {
                min-height: 0;
                min-width: 0;
                display: flex;
                flex-direction: column;
                border: 1px solid var(--rrm-border);
                border-radius: 14px;
                background: var(--rrm-panel);
                color: var(--rrm-text);
                overflow: hidden;
            }

            .${CLEAN_MIXER_NS}-pane-title {
                flex: 0 0 auto;
                padding: 10px 12px;
                border-bottom: 1px solid var(--rrm-border);
                font-size: 14px;
                font-weight: 900;
                color: var(--rrm-strong);
                background: var(--rrm-panel);
            }

            .${CLEAN_MIXER_NS}-pane-count {
                color: var(--rrm-muted);
                font-size: 12px;
                font-weight: 800;
            }

            .${CLEAN_MIXER_NS}-answer-title {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
            }

            .${CLEAN_MIXER_NS}-title-add-all {
                flex: 0 0 auto;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                height: 28px;
                min-height: 28px;
                border: 1px solid var(--rrm-primary);
                border-radius: 999px;
                padding: 0 11px;
                background: var(--rrm-primary);
                color: var(--rrm-primary-text) !important;
                font-size: 12px;
                font-weight: 900;
                line-height: 1;
                cursor: pointer;
                white-space: nowrap;
                vertical-align: middle;
                box-sizing: border-box;
            }

            .${CLEAN_MIXER_NS}-title-add-all:hover {
                background: var(--rrm-primary-hover);
                color: var(--rrm-primary-text) !important;
            }

            .${CLEAN_MIXER_NS}-title-add-all.is-remove {
                background: var(--rrm-soft);
                color: var(--rrm-primary) !important;
                border-color: color-mix(in srgb, var(--rrm-primary) 42%, transparent);
            }

            .${CLEAN_MIXER_NS}-title-add-all.is-remove:hover {
                background: var(--rrm-soft-hover);
                color: var(--rrm-primary) !important;
            }

            .${CLEAN_MIXER_NS}-title-add-all:disabled {
                opacity: .55;
                cursor: not-allowed;
            }

            .side-a .${CLEAN_MIXER_NS}-title-add-all:not(.is-remove) {
                background: var(--rrm-a);
                border-color: var(--rrm-a);
            }

            .side-b .${CLEAN_MIXER_NS}-title-add-all:not(.is-remove) {
                background: var(--rrm-b);
                border-color: var(--rrm-b);
            }

            .side-a .${CLEAN_MIXER_NS}-title-add-all.is-remove {
                color: var(--rrm-a) !important;
                border-color: color-mix(in srgb, var(--rrm-a) 42%, transparent);
            }

            .side-b .${CLEAN_MIXER_NS}-title-add-all.is-remove {
                color: var(--rrm-b) !important;
                border-color: color-mix(in srgb, var(--rrm-b) 42%, transparent);
            }

            .${CLEAN_MIXER_NS}-editor-title {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
            }

            .${CLEAN_MIXER_NS}-editor-title small {
                min-width: 0;
                color: var(--rrm-muted);
                font-size: 11px;
                font-weight: 800;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .${CLEAN_MIXER_NS}-paragraph-list {
                flex: 1 1 auto;
                min-height: 0;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 10px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                overscroll-behavior: contain;
            }

            .${CLEAN_MIXER_NS}-answer-info {
                display: flex;
                gap: 8px;
                align-items: center;
                padding: 8px 9px;
                border-radius: 11px;
                background: var(--rrm-soft);
                color: var(--rrm-text);
                font-size: 12px;
            }

            .${CLEAN_MIXER_NS}-answer-info-main {
                min-width: 0;
                display: flex;
                flex-wrap: wrap;
                gap: 7px;
                align-items: center;
            }

            .${CLEAN_MIXER_NS}-id-toggle {
                width: 22px;
                height: 22px;
                border: 1px solid var(--rrm-border);
                border-radius: 999px;
                background: var(--rrm-card);
                color: var(--rrm-muted);
                font-size: 12px;
                font-weight: 900;
                cursor: pointer;
                line-height: 1;
            }

            .${CLEAN_MIXER_NS}-id-toggle:hover {
                background: var(--rrm-soft-hover);
                color: var(--rrm-text);
            }

            .${CLEAN_MIXER_NS}-answer-info code {
                color: var(--rrm-faint);
                word-break: break-all;
            }

            .${CLEAN_MIXER_NS}-message-id.is-hidden {
                display: none;
            }

            .${CLEAN_MIXER_NS}-paragraph-card {
                flex: 0 0 auto;
                position: relative;
                border: 1px solid var(--rrm-border);
                border-radius: 13px;
                background: var(--rrm-card);
                overflow: visible;
            }

            .side-a .${CLEAN_MIXER_NS}-paragraph-card {
                border-left: 3px solid var(--rrm-a);
            }

            .side-b .${CLEAN_MIXER_NS}-paragraph-card {
                border-left: 3px solid var(--rrm-b);
            }

            .${CLEAN_MIXER_NS}-paragraph-card.is-comment-block {
                border-style: dashed;
                background: color-mix(in srgb, var(--rrm-card) 88%, var(--rrm-primary) 12%);
            }

            .${CLEAN_MIXER_NS}-paragraph-head {
                position: sticky;
                top: 0;
                z-index: 3;
                display: flex;
                justify-content: space-between;
                gap: 8px;
                align-items: center;
                padding: 8px 9px;
                border-bottom: 1px solid var(--rrm-border);
                border-radius: 13px 13px 0 0;
                background: color-mix(in srgb, var(--rrm-card) 94%, transparent);
                backdrop-filter: blur(8px);
            }

            .${CLEAN_MIXER_NS}-paragraph-head span {
                font-size: 12px;
                font-weight: 900;
                color: var(--rrm-muted);
            }

            .${CLEAN_MIXER_NS}-paragraph-head button,
            .${CLEAN_MIXER_NS}-soft-btn,
            .${CLEAN_MIXER_NS}-secondary-btn,
            .${CLEAN_MIXER_NS}-primary-btn {
                min-height: 30px;
                border: 1px solid transparent;
                border-radius: 9px;
                padding: 0 10px;
                font-size: 12px;
                font-weight: 900;
                cursor: pointer;
                transition: background .16s ease, opacity .16s ease, transform .16s ease;
            }

            .${CLEAN_MIXER_NS}-paragraph-head button,
            .${CLEAN_MIXER_NS}-primary-btn {
                background: var(--rrm-primary);
                color: var(--rrm-primary-text);
            }

            .${CLEAN_MIXER_NS}-paragraph-head button:hover,
            .${CLEAN_MIXER_NS}-primary-btn:hover {
                background: var(--rrm-primary-hover);
            }

            .side-a .${CLEAN_MIXER_NS}-paragraph-card .${CLEAN_MIXER_NS}-paragraph-head button:not(.is-added) {
                background: var(--rrm-a);
            }

            .side-b .${CLEAN_MIXER_NS}-paragraph-card .${CLEAN_MIXER_NS}-paragraph-head button:not(.is-added) {
                background: var(--rrm-b);
            }

            .side-a .${CLEAN_MIXER_NS}-paragraph-card .${CLEAN_MIXER_NS}-paragraph-head button.is-added {
                color: var(--rrm-a);
                border-color: color-mix(in srgb, var(--rrm-a) 42%, transparent);
            }

            .side-b .${CLEAN_MIXER_NS}-paragraph-card .${CLEAN_MIXER_NS}-paragraph-head button.is-added {
                color: var(--rrm-b);
                border-color: color-mix(in srgb, var(--rrm-b) 42%, transparent);
            }

            .${CLEAN_MIXER_NS}-paragraph-head button.is-added {
                background: var(--rrm-soft);
                color: var(--rrm-primary);
                border-color: color-mix(in srgb, var(--rrm-primary) 42%, transparent);
            }

            .${CLEAN_MIXER_NS}-paragraph-head button.is-added:hover {
                background: var(--rrm-soft-hover);
                color: var(--rrm-primary);
            }

            .side-a .${CLEAN_MIXER_NS}-paragraph-card .${CLEAN_MIXER_NS}-paragraph-head button.is-added,
            .side-a .${CLEAN_MIXER_NS}-paragraph-card .${CLEAN_MIXER_NS}-paragraph-head button.is-added:hover {
                color: var(--rrm-a);
                border-color: color-mix(in srgb, var(--rrm-a) 42%, transparent);
            }

            .side-b .${CLEAN_MIXER_NS}-paragraph-card .${CLEAN_MIXER_NS}-paragraph-head button.is-added,
            .side-b .${CLEAN_MIXER_NS}-paragraph-card .${CLEAN_MIXER_NS}-paragraph-head button.is-added:hover {
                color: var(--rrm-b);
                border-color: color-mix(in srgb, var(--rrm-b) 42%, transparent);
            }

            .${CLEAN_MIXER_NS}-soft-btn,
            .${CLEAN_MIXER_NS}-secondary-btn {
                background: var(--rrm-soft);
                color: var(--rrm-text);
                border-color: var(--rrm-border);
            }

            .${CLEAN_MIXER_NS}-soft-btn:hover,
            .${CLEAN_MIXER_NS}-secondary-btn:hover {
                background: var(--rrm-soft-hover);
            }

            .${CLEAN_MIXER_NS}-primary-btn:disabled,
            .${CLEAN_MIXER_NS}-secondary-btn:disabled,
            .${CLEAN_MIXER_NS}-soft-btn:disabled {
                opacity: .55;
                cursor: wait;
            }

            .${CLEAN_MIXER_NS}-paragraph-card pre {
                display: block !important;
                visibility: visible !important;
                height: auto !important;
                max-height: none !important;
                margin: 0;
                padding: 11px 12px 12px;
                white-space: pre-wrap;
                word-break: break-word;
                overflow-wrap: anywhere;
                overflow: visible;
                font-family: inherit;
                font-size: 13px;
                line-height: 1.66;
                color: var(--rrm-text);
            }

            .${CLEAN_MIXER_NS}-editor-chip-list {
                flex: 1 1 auto;
                min-height: 0;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 10px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                background: var(--rrm-input);
                overscroll-behavior: contain;
            }

            .${CLEAN_MIXER_NS}-editor-chip {
                flex: 0 0 auto;
                min-height: max-content;
                border: 1px solid var(--rrm-border);
                border-radius: 13px;
                background: var(--rrm-card);
                overflow: hidden;
            }

            .${CLEAN_MIXER_NS}-editor-chip.source-a {
                border-left: 3px solid var(--rrm-a);
            }

            .${CLEAN_MIXER_NS}-editor-chip.source-b {
                border-left: 3px solid var(--rrm-b);
            }

            .${CLEAN_MIXER_NS}-editor-chip.source-direct,
            .${CLEAN_MIXER_NS}-editor-chip.source-other {
                border-left: 3px solid var(--rrm-muted);
            }

            .${CLEAN_MIXER_NS}-chip-head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 8px 9px;
                border-bottom: 1px solid var(--rrm-border);
                background: color-mix(in srgb, var(--rrm-card) 94%, transparent);
            }

            .${CLEAN_MIXER_NS}-chip-meta {
                min-width: 0;
                display: flex;
                align-items: center;
                gap: 6px;
                flex-wrap: wrap;
            }

            .${CLEAN_MIXER_NS}-source-chip,
            .${CLEAN_MIXER_NS}-source-subchip {
                display: inline-flex;
                align-items: center;
                height: 20px;
                padding: 0 8px;
                border-radius: 999px;
                background: var(--rrm-soft);
                color: var(--rrm-muted);
                font-size: 11px;
                font-weight: 900;
                line-height: 1;
            }

            .${CLEAN_MIXER_NS}-source-subchip {
                background: color-mix(in srgb, var(--rrm-soft) 74%, transparent);
                color: var(--rrm-text);
            }

            .${CLEAN_MIXER_NS}-editor-chip.source-a .${CLEAN_MIXER_NS}-source-chip {
                background: var(--rrm-a-soft);
                color: var(--rrm-a);
            }

            .${CLEAN_MIXER_NS}-editor-chip.source-b .${CLEAN_MIXER_NS}-source-chip {
                background: var(--rrm-b-soft);
                color: var(--rrm-b);
            }

            .${CLEAN_MIXER_NS}-editor-chip.source-a .${CLEAN_MIXER_NS}-source-subchip {
                background: color-mix(in srgb, var(--rrm-a-soft) 78%, transparent);
                color: var(--rrm-a);
            }

            .${CLEAN_MIXER_NS}-editor-chip.source-b .${CLEAN_MIXER_NS}-source-subchip {
                background: color-mix(in srgb, var(--rrm-b-soft) 78%, transparent);
                color: var(--rrm-b);
            }

            .${CLEAN_MIXER_NS}-chip-buttons {
                display: flex;
                gap: 5px;
                flex: 0 0 auto;
            }

            .${CLEAN_MIXER_NS}-chip-buttons button {
                width: 28px;
                height: 26px;
                border: 1px solid var(--rrm-border);
                border-radius: 8px;
                background: var(--rrm-soft);
                color: var(--rrm-text);
                font-size: 12px;
                font-weight: 900;
                cursor: pointer;
            }

            .${CLEAN_MIXER_NS}-chip-buttons button:hover {
                background: var(--rrm-soft-hover);
            }

            .${CLEAN_MIXER_NS}-chip-buttons button:disabled {
                opacity: .38;
                cursor: not-allowed;
            }

            .${CLEAN_MIXER_NS}-chip-body {
                display: block !important;
                flex: 0 0 auto;
                height: auto !important;
                min-height: 0;
                max-height: none !important;
                overflow: visible !important;
            }

            .${CLEAN_MIXER_NS}-editor-chip pre {
                display: block !important;
                height: auto !important;
                max-height: none !important;
                margin: 0;
                padding: 11px 12px 12px;
                white-space: pre-wrap;
                word-break: break-word;
                overflow-wrap: anywhere;
                overflow: visible !important;
                font-family: inherit;
                font-size: 13px;
                line-height: 1.6;
                color: var(--rrm-text);
            }

            .${CLEAN_MIXER_NS}-chip-empty {
                padding: 14px;
                border: 1px dashed var(--rrm-border);
                border-radius: 12px;
                color: var(--rrm-muted);
                font-size: 13px;
                line-height: 1.45;
            }

            .${CLEAN_MIXER_NS}-editor-pane[data-editor-view="chips"] textarea {
                display: none;
            }

            .${CLEAN_MIXER_NS}-editor-pane[data-editor-view="edit"] .${CLEAN_MIXER_NS}-editor-chip-list {
                display: none;
            }

            .${CLEAN_MIXER_NS}-editor-pane textarea {
                flex: 1;
                min-height: 0;
                resize: none;
                border: none;
                outline: none;
                background: var(--rrm-input);
                color: var(--rrm-text);
                padding: 12px;
                font-family: inherit;
                font-size: 13px;
                line-height: 1.55;
                white-space: pre-wrap;
            }

            .${CLEAN_MIXER_NS}-editor-pane textarea::placeholder {
                color: var(--rrm-faint);
            }

            .${CLEAN_MIXER_NS}-editor-actions {
                display: flex;
                gap: 8px;
                padding: 10px;
                border-top: 1px solid var(--rrm-border);
                background: var(--rrm-panel);
            }

            .${CLEAN_MIXER_NS}-modal-footer {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                align-items: center;
                padding: 12px 18px 16px;
                border-top: 1px solid var(--rrm-border);
                background: var(--rrm-bg);
            }

            .${CLEAN_MIXER_NS}-meta {
                min-width: 0;
                color: var(--rrm-muted);
                font-size: 12px;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .${CLEAN_MIXER_NS}-footer-buttons {
                display: flex;
                gap: 8px;
                flex: 0 0 auto;
            }

            .badge {
                display: inline-flex;
                align-items: center;
                height: 19px;
                padding: 0 7px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 800;
                line-height: 1;
            }

            .badge.current {
                background: var(--rrm-primary);
                color: var(--rrm-primary-text);
            }

            .badge.reroll {
                background: var(--rrm-blue-bg);
                color: var(--rrm-blue-text);
            }

            .badge.original {
                background: var(--rrm-soft);
                color: var(--rrm-muted);
            }

            .${CLEAN_MIXER_NS}-empty {
                padding: 14px;
                color: var(--rrm-muted);
                font-size: 13px;
            }

            @media (max-width: 860px) {
                #${CLEAN_MIXER_MODAL_ID} {
                    padding: 8px;
                    align-items: flex-end;
                }

                .${CLEAN_MIXER_NS}-modal-card {
                    width: 100%;
                    height: min(92vh, 840px);
                    border-radius: 18px 18px 10px 10px;
                }

                .${CLEAN_MIXER_NS}-modal-header {
                    padding: 14px 14px 10px;
                }

                .${CLEAN_MIXER_NS}-modal-desc {
                    font-size: 12px;
                }

                .${CLEAN_MIXER_NS}-topbar {
                    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 38px;
                    padding: 10px 12px;
                    align-items: stretch;
                    gap: 8px;
                }

                .${CLEAN_MIXER_NS}-topbar label {
                    display: grid;
                    grid-template-columns: auto minmax(0, 1fr);
                    align-items: center;
                    gap: 8px;
                }

                .${CLEAN_MIXER_NS}-topbar label span {
                    margin: 0;
                    white-space: nowrap;
                }

                .${CLEAN_MIXER_NS}-topbar label select {
                    min-width: 0;
                }

                .${CLEAN_MIXER_NS}-swap-btn {
                    align-self: stretch;
                    width: 38px;
                    min-width: 38px;
                    min-height: 34px;
                }

                .${CLEAN_MIXER_NS}-mobile-tabs {
                    display: grid;
                }

                .${CLEAN_MIXER_NS}-modal-body {
                    display: block;
                    padding: 10px 12px;
                    overflow: hidden;
                }

                .${CLEAN_MIXER_NS}-answer-pane,
                .${CLEAN_MIXER_NS}-editor-pane {
                    height: 100%;
                    display: none;
                }

                #${CLEAN_MIXER_MODAL_ID}[data-mobile-tab="a"] [data-pane="a"],
                #${CLEAN_MIXER_MODAL_ID}[data-mobile-tab="b"] [data-pane="b"],
                #${CLEAN_MIXER_MODAL_ID}[data-mobile-tab="edit"] [data-pane="edit"] {
                    display: flex;
                }

                .${CLEAN_MIXER_NS}-modal-footer {
                    flex-direction: column;
                    align-items: stretch;
                    padding: 10px 12px 12px;
                }

                .${CLEAN_MIXER_NS}-meta {
                    white-space: normal;
                }

                .${CLEAN_MIXER_NS}-footer-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                }

                .${CLEAN_MIXER_NS}-footer-buttons [data-overwrite] {
                    grid-column: 1 / -1;
                }
            }
        `);
    }

    function initStyle() {
        GM_addStyle(`
            .cr-clean-reroll-btn {
                min-width: 28px !important;
                user-select: none !important;
            }

            .cr-clean-reroll-btn:disabled {
                opacity: 0.65 !important;
                cursor: wait !important;
            }

            .cr-clean-reroll-icon {
                width: 19px !important;
                height: 19px !important;
                display: block;
            }

            .cr-clean-reroll-btn .cr-clean-reroll-native {
                opacity: 0.92;
                transform-origin: 12px 12px;
                transform: scale(0.96);
            }

            .cr-clean-reroll-btn .cr-clean-reroll-sparkle {
                opacity: 0.95;
                transform-origin: 12px 12px;
                transform: scale(1.06);
            }

            .cr-clean-reroll-btn.cr-clean-reroll-working .cr-clean-reroll-icon {
                animation: cr-clean-reroll-spin 0.85s linear infinite;
            }

            @keyframes cr-clean-reroll-spin {
                to {
                    transform: rotate(360deg);
                }
            }

            .cr-clean-reroll-btn.cr-clean-reroll-charging {
                background:
                    conic-gradient(from 0deg, hsl(var(--primary)) var(--cr-clean-charge, 0%), transparent 0) !important;
                animation: cr-clean-charge 0.5s linear forwards;
            }

            .cr-clean-reroll-btn.cr-clean-reroll-charging::before {
                content: "";
                position: absolute;
                inset: 2px;
                border-radius: 999px;
                background: hsl(var(--background));
                opacity: .86;
            }

            .cr-clean-reroll-btn.cr-clean-reroll-charging .cr-clean-reroll-icon {
                position: relative;
                z-index: 1;
                animation: cr-clean-reroll-spin 0.5s linear infinite;
            }

            @property --cr-clean-charge {
                syntax: "<percentage>";
                inherits: false;
                initial-value: 0%;
            }

            @keyframes cr-clean-charge {
                from { --cr-clean-charge: 0%; }
                to { --cr-clean-charge: 100%; }
            }

            .cr-clip-overlay {
                position: fixed;
                inset: 0;
                z-index: 2147483647;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 22px;
                background: rgba(0, 0, 0, 0.28);
                backdrop-filter: blur(14px) saturate(130%);
                -webkit-backdrop-filter: blur(14px) saturate(130%);
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Pretendard, system-ui, sans-serif;
            }

            .cr-clip-sheet {
                width: min(760px, calc(100vw - 28px));
                max-height: min(860px, calc(100vh - 34px));
                overflow: hidden;
                border-radius: 30px;
                background: rgba(250, 250, 252, 0.92);
                color: #151515;
                box-shadow: 0 36px 110px rgba(0,0,0,.32), inset 0 0 0 1px rgba(255,255,255,.65);
                backdrop-filter: blur(26px) saturate(160%);
                -webkit-backdrop-filter: blur(26px) saturate(160%);
                display: flex;
                flex-direction: column;
            }

            body[data-theme="dark"] .cr-clip-sheet {
                background: rgba(24, 24, 26, 0.88);
                color: #F7F7F8;
                box-shadow: 0 36px 110px rgba(0,0,0,.58), inset 0 0 0 1px rgba(255,255,255,.10);
            }

            .cr-clip-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 14px 18px 10px;
            }

            .cr-clip-brand {
                display: flex;
                align-items: center;
                gap: 11px;
                min-width: 0;
            }

            .cr-clip-logo {
                width: 36px;
                height: 36px;
                border-radius: 12px;
                display: grid;
                place-items: center;
                background: linear-gradient(145deg, hsl(var(--primary)), #ff7d4b);
                color: white;
                box-shadow: 0 8px 18px rgba(254,69,50,.22);
                flex: 0 0 auto;
            }

            .cr-clip-logo .cr-clean-reroll-icon {
                width: 21px !important;
                height: 21px !important;
            }

            .cr-clip-title {
                margin: 0;
                font-size: 20px;
                line-height: 1;
                letter-spacing: -0.045em;
                font-weight: 900;
            }

            .cr-clip-version {
                margin-top: 4px;
                font-size: 11px;
                line-height: 1;
                font-weight: 800;
                letter-spacing: -0.02em;
                color: rgba(30,30,32,.42);
            }

            body[data-theme="dark"] .cr-clip-version {
                color: rgba(245,245,247,.38);
            }

            .cr-clip-subtitle {
                display: none;
            }

            .cr-clip-close {
                width: 32px;
                height: 32px;
                border-radius: 999px;
                border: 0;
                cursor: pointer;
                background: rgba(120,120,128,.14);
                color: inherit;
                font-size: 17px;
                font-weight: 900;
            }

            .cr-clip-body {
                padding: 0 18px 18px;
                overflow: auto;
            }

            .cr-clip-card {
                border-radius: 24px;
                background: rgba(255,255,255,.78);
                box-shadow: inset 0 0 0 1px rgba(0,0,0,.055);
                padding: 16px;
            }

            body[data-theme="dark"] .cr-clip-card {
                background: rgba(255,255,255,.075);
                box-shadow: inset 0 0 0 1px rgba(255,255,255,.075);
            }

            .cr-clip-empty {
                min-height: 240px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                color: rgba(30,30,32,.52);
                gap: 8px;
                font-weight: 800;
                letter-spacing: -0.02em;
            }

            body[data-theme="dark"] .cr-clip-empty {
                color: rgba(245,245,247,.52);
            }

            .cr-clip-empty-icon {
                font-size: 34px;
                line-height: 1;
            }

            .cr-clip-empty p {
                margin: 0;
                font-size: 12px;
                opacity: .75;
            }

            .cr-clip-actions {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 14px;
                margin-bottom: 12px;
            }

            .cr-clip-actions strong {
                display: block;
                font-size: 18px;
                font-weight: 950;
                letter-spacing: -0.04em;
            }

            .cr-clip-actions span {
                display: block;
                margin-top: 3px;
                font-size: 12px;
                opacity: .54;
                font-weight: 800;
            }

            .cr-clip-action-buttons {
                display: flex;
                gap: 8px;
                flex: 0 0 auto;
            }

            .cr-clip-ghost,
            .cr-clip-danger,
            .cr-clip-copy-one,
            .cr-clip-edit-one,
            .cr-clip-replace-one {
                border: 0;
                border-radius: 999px;
                cursor: pointer;
                font-weight: 900;
                letter-spacing: -0.03em;
            }

            .cr-clip-ghost,
            .cr-clip-danger {
                height: 38px;
                padding: 0 13px;
                font-size: 13px;
            }

            .cr-clip-ghost {
                background: rgba(118,118,128,.13);
                color: inherit;
            }

            .cr-clip-danger {
                background: rgba(254,69,50,.12);
                color: hsl(var(--primary));
            }

            body[data-theme="dark"] .cr-clip-ghost {
                background: rgba(255,255,255,.10);
            }

            .cr-clip-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .cr-clip-item {
                border-radius: 20px;
                padding: 14px;
                background: rgba(255,255,255,.78);
                box-shadow: inset 0 0 0 1px rgba(0,0,0,.055);
            }

            body[data-theme="dark"] .cr-clip-item {
                background: rgba(255,255,255,.075);
                box-shadow: inset 0 0 0 1px rgba(255,255,255,.075);
            }

            .cr-clip-item.is-current {
                background: rgba(255,255,255,.78);
            }

            body[data-theme="dark"] .cr-clip-item.is-current {
                background: rgba(255,255,255,.075);
            }

            .cr-clip-item-head {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 10px;
                margin-bottom: 10px;
            }

            .cr-clip-item-head strong {
                display: block;
                font-size: 14px;
                font-weight: 950;
                letter-spacing: -0.035em;
            }

            .cr-clip-item-head strong em {
                display: inline-flex;
                align-items: center;
                height: 18px;
                margin-left: 7px;
                padding: 0 7px;
                border-radius: 999px;
                background: rgba(254,69,50,.14);
                color: hsl(var(--primary));
                font-size: 10px;
                font-style: normal;
                font-weight: 950;
                vertical-align: middle;
            }

            .cr-clip-item-buttons {
                display: flex;
                gap: 6px;
                flex: 0 0 auto;
            }

            .cr-clip-copy-one,
            .cr-clip-edit-one,
            .cr-clip-replace-one {
                height: 30px;
                padding: 0 11px;
                flex: 0 0 auto;
                font-size: 12px;
            }

            .cr-clip-copy-one,
            .cr-clip-edit-one {
                background: rgba(118,118,128,.13);
                color: inherit;
            }

            .cr-clip-replace-one {
                background: rgba(254,69,50,.12);
                color: hsl(var(--primary));
            }

            body[data-theme="dark"] .cr-clip-copy-one,
            body[data-theme="dark"] .cr-clip-edit-one {
                background: rgba(255,255,255,.10);
            }

            body[data-theme="dark"] .cr-clip-replace-one {
                background: rgba(254,69,50,.16);
            }

            .cr-clip-replace-one:disabled {
                cursor: default;
                opacity: .58;
                background: rgba(118,118,128,.13);
                color: inherit;
            }

            body[data-theme="dark"] .cr-clip-replace-one:disabled {
                background: rgba(255,255,255,.10);
            }

            .cr-clip-editor {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .cr-clip-editor textarea {
                width: 100%;
                min-height: 220px;
                max-height: 42vh;
                box-sizing: border-box;
                resize: vertical;
                border: 0;
                outline: none;
                border-radius: 16px;
                padding: 12px;
                background: rgba(118,118,128,.10);
                color: inherit;
                font: 12.5px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
                letter-spacing: -0.02em;
            }

            body[data-theme="dark"] .cr-clip-editor textarea {
                background: rgba(255,255,255,.075);
            }

            .cr-clip-editor-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                flex-wrap: wrap;
            }

            .cr-clip-editor-actions .cr-clip-ghost,
            .cr-clip-editor-actions .cr-clip-replace-one {
                height: 30px;
                padding: 0 11px;
                flex: 0 0 auto;
                font-size: 12px;
            }

            .wrtn-markdown[data-clean-reroll-replaced="1"] strong {
                font-weight: 800;
                color: inherit;
            }

            .wrtn-markdown[data-clean-reroll-replaced="1"] em {
                font-style: normal;
                color: rgb(107, 114, 128);
            }

            body[data-theme="dark"] .wrtn-markdown[data-clean-reroll-replaced="1"] em {
                color: rgba(245, 245, 247, 0.62);
            }

            .wrtn-markdown[data-clean-reroll-replaced="1"] ul,
            .wrtn-markdown[data-clean-reroll-replaced="1"] ol {
                margin: 0.4em 0 0.85em 1.25em;
                padding: 0;
            }

            .wrtn-markdown[data-clean-reroll-replaced="1"] li {
                margin: 0.2em 0;
            }

            .wrtn-markdown[data-clean-reroll-replaced="1"] p {
                margin: 0 0 0.85em;
            }

            .wrtn-markdown[data-clean-reroll-replaced="1"] p:last-child {
                margin-bottom: 0;
            }

            .wrtn-markdown[data-clean-reroll-replaced="1"] pre {
                white-space: pre-wrap;
                word-break: break-word;
            }

            .cr-clip-item pre {
                max-height: 220px;
                overflow: auto;
                margin: 0;
                white-space: pre-wrap;
                word-break: break-word;
                border-radius: 16px;
                padding: 12px;
                background: rgba(118,118,128,.10);
                font: 12.5px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
                letter-spacing: -0.02em;
            }

            body[data-theme="dark"] .cr-clip-item pre {
                background: rgba(255,255,255,.075);
            }

            /* v0.3.2: 클립보드 상단/답변 카드 압축 */
            .cr-clip-card.cr-clip-actions {
                padding: 10px 14px;
                border-radius: 22px;
                margin-bottom: 10px;
            }

            .cr-clip-actions strong {
                font-size: 16px;
                font-weight: 850;
                letter-spacing: -0.035em;
            }

            .cr-clip-actions span {
                margin-top: 2px;
                font-size: 11.5px;
                font-weight: 700;
                opacity: .50;
            }

            .cr-clip-actions .cr-clip-ghost,
            .cr-clip-actions .cr-clip-danger {
                height: 34px;
                padding: 0 15px;
                font-size: 13px;
                font-weight: 850;
            }

            .cr-clip-item {
                padding: 12px 14px;
                border-radius: 18px;
            }

            .cr-clip-item-head {
                align-items: center;
                margin: 0 0 12px;
            }

            .cr-clip-item-head strong {
                font-weight: 850;
            }

            .cr-clip-copy-one,
            .cr-clip-edit-one,
            .cr-clip-replace-one {
                height: 28px;
                padding: 0 10px;
                font-size: 12px;
                font-weight: 850;
            }

            .cr-clip-item pre {
                border-radius: 14px;
                padding: 10px;
            }

            @media (max-width: 620px) {
                .cr-clip-overlay {
                    align-items: stretch;
                    padding: 8px;
                }

                .cr-clip-sheet {
                    width: calc(100vw - 16px);
                    max-height: calc(100vh - 16px);
                    border-radius: 24px;
                }

                .cr-clip-top {
                    padding: 17px 17px 11px;
                }

                .cr-clip-body {
                    padding: 0 17px 17px;
                }

                .cr-clip-title {
                    font-size: 22px;
                }

                .cr-clip-logo {
                    width: 44px;
                    height: 44px;
                    border-radius: 15px;
                }

                .cr-clip-actions {
                    align-items: stretch;
                    flex-direction: column;
                }

                .cr-clip-card.cr-clip-actions {
                    padding: 10px 12px;
                }

                .cr-clip-action-buttons {
                    width: 100%;
                }

                .cr-clip-ghost,
                .cr-clip-danger {
                    flex: 1;
                }
            }


            #cr-clean-reroll-toast {
                position: fixed;
                left: 50%;
                bottom: 92px;
                transform: translateX(-50%);
                z-index: 2147483647;
                max-width: min(520px, calc(100vw - 32px));
                padding: 10px 14px;
                border-radius: 999px;
                background: rgba(24, 24, 24, .92);
                color: white;
                font-size: 13px;
                font-weight: 600;
                line-height: 1.35;
                box-shadow: 0 8px 24px rgba(0,0,0,.24);
                pointer-events: none;
            }
        `);
        injectCleanMixerStyles();
    }

    function initObserver() {
        if (!document.body) {
            setTimeout(initObserver, 100);
            return;
        }

        let scheduled = false;

        const run = () => {
            scheduled = false;
            try {
                addCleanRerollButtons();
                addSettingsMenuToggle();
                checkClipboardTurnLifecycle();
            } catch (err) {
                warn('observer update failed', err);
            }
        };

        const schedule = () => {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(run);
        };

        const observer = new MutationObserver(schedule);
        observer.observe(document.body, { childList: true, subtree: true });

        run();
    }

    restoreCleanClipboardSnapshot();
    initStyle();
    initObserver();

})();

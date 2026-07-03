// ==UserScript==
// @name         클린 리롤
// @version      1.0.0
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
     * Clean Reroll v0.3.4
     * - 유저 턴 기준으로 연결된 AI 후보 답변들을 전부 삭제
     * - 유저 메시지를 입력창에 복원
     * - 자동 전송 토글 지원
     ******************************************************************/

    const SCRIPT_ID = 'cr-clean-reroll-v034';
    const AUTO_SEND_KEY = 'wrtn_clean_reroll_autosend';
    const API_BASE = 'https://crack-api.wrtn.ai/crack-gen/v3';
    const CLIPBOARD_RESTORE_TTL = 1000 * 60 * 10;
    const MAX_ASSISTANT_CANDIDATES = 8; // 유저 턴에 붙은 AI 메시지 컨테이너 탐색 여유값
    const MAX_VARIANTS_PER_ASSISTANT = 8; // 답변 비교 n/n 안의 후보 삭제 반복 여유값
    const WAIT_STEP = 80;
    const LONG_PRESS_MS = 500;

    let isCleanRerollExecuting = false;
    let longPressTimer = null;
    let longPressTriggeredAt = 0;

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

    function openCleanClipboardOverlay() {
        document.querySelector('.cr-clip-overlay')?.remove();

        const overlay = document.createElement('div');
        overlay.className = 'cr-clip-overlay';
        overlay.innerHTML = `
            <div class="cr-clip-sheet" role="dialog" aria-modal="true" aria-label="클린 리롤">
                <div class="cr-clip-top">
                    <div class="cr-clip-brand">
                        <div class="cr-clip-logo">${createCleanRerollIconSVG()}</div>
                        <div>
                            <h2 class="cr-clip-title">Clean Clipboard</h2>
                            <div class="cr-clip-version">v0.3.4</div>
                        </div>
                    </div>
                    <button type="button" class="cr-clip-close" aria-label="닫기">×</button>
                </div>
                <div class="cr-clip-body"></div>
            </div>
        `;

        document.body.appendChild(overlay);
        renderCleanClipboardOverlay();

        overlay.querySelector('.cr-clip-close')?.addEventListener('click', () => overlay.remove());

        overlay.addEventListener('click', event => {
            if (event.target === overlay) overlay.remove();
        });

        overlay.addEventListener('keydown', event => {
            if (event.key === 'Escape') overlay.remove();
        });
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

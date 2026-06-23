// ==UserScript==
// @name         클린 리롤 & 믹서 통합판
// @namespace    https://github.com/Dflashh/Crack
// @version      2.6.2
// @description  클린 리롤로 문맥 오염을 막고, 메모리 저장 및 리롤 믹서 통합
// @author       깡통들 & 나
// @match        https://crack.wrtn.ai/*
// @grant        GM_addStyle
// @run-at       document-idle
// @license      MIT
// @icon         https://cdn.jsdelivr.net/gh/Dflashh/Crack@main/Icon/Clean.webp
// @downloadURL  https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackUI.user.js
// @updateURL    https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackUI.user.js
// ==/UserScript===

(function() {
    'use strict';

    // ==========================================
    // 🧠 통합 메모리 및 상태 관리 변수
    // ==========================================
    let cleanMixerMemory = []; // 삭제된 AI 답변들을 누적 저장하는 클립보드(배열)
    let isAutomatedSend = false; // 클린 리롤이 자동으로 전송하는 중인지 판별 (초기화 방지용)

    const SCRIPT_NS = 'crack-reroll-mixer';
    const MODAL_ID = `${SCRIPT_NS}-modal`;
    const API_BASE = 'https://crack-api.wrtn.ai/crack-gen/v3';
    let activeEditorText = '';

    const MIXER_ICON_HTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path fill="currentColor" d="M7.5 3.5 10 6 8.9 7.1 7.8 6H6.5A2.5 2.5 0 0 0 4 8.5V10H2.4V8.5A4.1 4.1 0 0 1 6.5 4.4h1.3L6.4 3zm9 0 1.1 1.1-1.4 1.4h1.3a4.1 4.1 0 0 1 4.1 4.1v.7H20v-.7a2.5 2.5 0 0 0-2.5-2.5h-1.3l1.1 1.1L16.2 9.8 13.7 7.3zM2.4 14h1.6v1.5A2.5 2.5 0 0 0 6.5 18h1.3l-1.1-1.1 1.1-1.1 2.5 2.5-2.5 2.5-1.1-1.1L7.8 19.6H6.5a4.1 4.1 0 0 1-4.1-4.1zm17.6 0h1.6v1.5a4.1 4.1 0 0 1-4.1 4.1h-1.3l1.1 1.1-1.1 1.1-2.5-2.5 2.5-2.5 1.1 1.1-1.1 1.1h1.3a2.5 2.5 0 0 0 2.5-2.5zM9 10.2h6v1.6H9zm0 3h6v1.6H9z"/>
        </svg>
    `;

    // ==========================================
    // ⚙️ 자동 전송 토글 상태 관리 (B에서 추가됨)
    // ==========================================
    function getAutoSendState() {
        return localStorage.getItem('wrtn_clean_reroll_autosend') !== 'false';
    }

    function toggleAutoSendState() {
        const newState = !getAutoSendState();
        localStorage.setItem('wrtn_clean_reroll_autosend', newState);
        return newState;
    }

    // ==========================================
    // 🗑️ 새로운 턴 감지 (메모리 초기화)
    // ==========================================
    function clearMemoryOnNewTurn() {
        if (!isAutomatedSend) {
            if (cleanMixerMemory.length > 0) {
                console.log('[클린리롤&믹서] 새로운 대화 턴 감지! 저장된 리롤 메모리를 비웁니다.');
            }
            cleanMixerMemory = [];
        }
    }

    // 엔터키 입력 감지
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && e.target.classList.contains('__chat_input_textarea')) {
            clearMemoryOnNewTurn();
        }
    }, true);

    // 전송 버튼 클릭 감지
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button.bg-primary');
        if (btn) {
            const svgPath = btn.querySelector('svg path');
            if (svgPath && svgPath.getAttribute('d').startsWith('M18.77')) {
                clearMemoryOnNewTurn();
            }
        }
    }, true);


    // ==========================================
    // ✨ 유틸리티 및 클린 리롤 핵심 기능 (B 개선 반영)
    // ==========================================
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function isVisible(elem) {
        return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
    }

    function simulateRealClick(element) {
        if (!element) return;

        // B: 모바일 터치 이벤트 추가 지원
        if (typeof TouchEvent !== 'undefined') {
            try {
                element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }));
                element.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true }));
            } catch (e) { /* 무시 */ }
        }

        const events = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'];
        events.forEach(eventType => {
            try {
                const event = new MouseEvent(eventType, { bubbles: true, cancelable: true });
                element.dispatchEvent(event);
            } catch (e) {
                const evt = document.createEvent('MouseEvents');
                evt.initEvent(eventType, true, true);
                element.dispatchEvent(evt);
            }
        });
    }

    function parseWrtnHTML(node) {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent;
        if (node.nodeType !== Node.ELEMENT_NODE) return '';

        let inner = '';
        for (let child of node.childNodes) {
            inner += parseWrtnHTML(child);
        }

        const tag = node.tagName.toLowerCase();
        switch (tag) {
            case 'strong':
            case 'b': return `**${inner}**`;
            case 'em':
            case 'i': return `*${inner}*`;
            case 'del':
            case 's': return `~${inner}~`;
            case 'p':
            case 'div': return `${inner}\n\n`;
            case 'br': return `\n`;
            case 'code': return `\`${inner}\``;
            case 'pre': return `\n\`\`\`\n${inner}\n\`\`\`\n\n`;
            case 'li': return `- ${inner}\n`;
            case 'blockquote': return `> ${inner}\n`;
            default: return inner;
        }
    }

    // B: 텍스트 타이핑 개선 (execCommand 활용으로 호환성 향상)
    function typeTextIntoEditor(text) {
        const editor = document.querySelector('.__chat_input_textarea');
        if (!editor) return false;

        editor.focus();

        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        editor.innerHTML = '';

        let htmlText = text.replace(/&/g, '&amp;')
                           .replace(/</g, '&lt;')
                           .replace(/>/g, '&gt;')
                           .replace(/"/g, '&quot;')
                           .replace(/'/g, '&#39;');
        htmlText = htmlText.replace(/\n/g, '<br>');

        const success = document.execCommand('insertHTML', false, htmlText);

        if (!success || !editor.innerText.trim()) {
            editor.innerHTML = htmlText;
        }

        editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

        return true;
    }

    // B: 전송 버튼 인식 로직 개선
    function clickSendButton() {
        const editor = document.querySelector('.__chat_input_textarea');
        let sendBtn = null;

        const buttons = document.querySelectorAll('button.bg-primary');
        for (let btn of buttons) {
            const svgPath = btn.querySelector('svg path');
            if (svgPath && svgPath.getAttribute('d').startsWith('M18.77')) {
                sendBtn = btn;
                break;
            }
        }

        if (!sendBtn && editor) {
            const chatContainer = editor.closest('.flex') || editor.parentElement.parentElement;
            if (chatContainer) {
                const nearbyButtons = Array.from(chatContainer.querySelectorAll('button'));
                sendBtn = nearbyButtons.find(b => b.classList.contains('bg-primary'));
                if (!sendBtn && nearbyButtons.length > 0) {
                    sendBtn = nearbyButtons[nearbyButtons.length - 1];
                }
            }
        }

        if (sendBtn && !sendBtn.disabled) {
            simulateRealClick(sendBtn);
            return true;
        }

        if (editor) {
            editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        }
    }

    async function aggressiveDelete(messageId) {
        const container = document.querySelector(`[data-message-group-id="${messageId}"]`);
        if (!container) return true;

        const optionBtn = container.querySelector('button[aria-label="메시지 옵션"]') || container.querySelector('.dropdown-button');
        if (!optionBtn) return false;

        simulateRealClick(optionBtn);

        let deleteMenu = null;
        for (let i = 0; i < 20; i++) {
            await wait(100);
            const items = Array.from(document.querySelectorAll('[role="menuitem"]')).filter(isVisible);
            deleteMenu = items.find(el => el.textContent.includes('삭제'));
            if (deleteMenu) break;
        }

        if (!deleteMenu) {
            document.body.click();
            return false;
        }

        simulateRealClick(deleteMenu);

        let confirmBtn = null;
        for (let i = 0; i < 20; i++) {
            await wait(100);
            const dialogBtns = Array.from(document.querySelectorAll('[role="alertdialog"] button, [role="dialog"] button, dialog button')).filter(isVisible);
            confirmBtn = dialogBtns.find(el => {
                const text = el.textContent.trim();
                return (text.includes('삭제') || text.includes('확인') || text.includes('네')) && !text.includes('취소');
            });
            if (confirmBtn) break;
        }

        if (confirmBtn) {
            simulateRealClick(confirmBtn);
        }

        for (let i = 0; i < 30; i++) {
            await wait(100);
            if (!document.querySelector(`[data-message-group-id="${messageId}"]`)) {
                return true;
            }
        }
        return false;
    }

    async function executeCleanReroll(e) {
        e.preventDefault();
        e.stopPropagation();

        const myBtn = e.currentTarget;
        myBtn.innerText = '⏳';
        myBtn.style.pointerEvents = 'none';

        try {
            const aiContainer = myBtn.closest('[data-message-group-id]');
            if (!aiContainer) throw new Error('AI 메시지를 찾을 수 없습니다.');
            const aiId = aiContainer.getAttribute('data-message-group-id');

            const userContainer = aiContainer.nextElementSibling;
            if (!userContainer || !userContainer.hasAttribute('data-message-group-id')) {
                 throw new Error('이전 유저 대화를 찾을 수 없습니다.');
            }
            const userId = userContainer.getAttribute('data-message-group-id');

            // --- 🚨 핵심 유지(A기능): 삭제하기 전에 현재 AI 답변을 메모리에 저장 ---
            const aiTextNode = aiContainer.querySelector('.wrtn-markdown');
            if (aiTextNode) {
                const aiText = parseWrtnHTML(aiTextNode).trim();
                if (aiText) cleanMixerMemory.push(aiText);
            }
            // -------------------------------------------------------------

            let userText = "";
            const textNode = userContainer.querySelector('.wrtn-markdown');
            if (textNode) {
                userText = parseWrtnHTML(textNode).replace(/\n{3,}/g, '\n\n').trim();
            }

            if (!userText) {
                userText = prompt("텍스트 추출 실패. 다시 전송할 내용을 직접 입력해주세요:");
                if (!userText) {
                    myBtn.innerText = '✨';
                    myBtn.style.pointerEvents = 'auto';
                    return;
                }
            }

            isAutomatedSend = true; // 메모리 초기화 방지 락 걸기 (A기능)

            await aggressiveDelete(userId);
            await wait(500);

            let maxAttempts = 5;
            while (document.querySelector(`[data-message-group-id="${aiId}"]`) && maxAttempts > 0) {
                await aggressiveDelete(aiId);
                await wait(400);
                maxAttempts--;
            }

            await wait(300);
            const isTyped = typeTextIntoEditor(userText); // 개선된 타이핑 적용 (B기능)

            if (isTyped) {
                await wait(300);
                // B에서 가져온 자동 전송 토글 상태 반영
                if (getAutoSendState()) {
                    clickSendButton();
                }
            } else {
                alert("채팅창을 찾지 못했습니다. 직접 붙여넣기 해주세요.\n\n" + userText);
            }

        } catch (error) {
            console.error('클린 리롤 에러:', error);
            alert("진행 중 에러 발생: " + error.message);
        } finally {
            isAutomatedSend = false; // 락 해제
            if (document.body.contains(myBtn)) {
                myBtn.innerText = '✨';
                myBtn.style.pointerEvents = 'auto';
            }
        }
    }


    // ==========================================
    // 🧩 믹서 유틸리티 및 UI 랜더링 (A 원본 유지)
    // ==========================================
    function escapeHtml(value = '') {
        return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
    }
    function normalizeText(text = '') { return String(text).replace(/\s+/g, ' ').trim(); }
    function stripSystemNote(text = '') {
        return normalizeText(String(text).replace(/^\s*\[\/\/\]:[^\n]*(?:\n|$)/gm, ' ').replace(/\[\/\/\]:\s*#\s*\([^)]+\)/g, ' ').replace(/```[\s\S]*?```/g, '[코드블록]').replace(/!\[[^\]]*\]\([^)]+\)/g, '[이미지]'));
    }
    function shortPreview(text = '', max = 120) {
        const cleaned = stripSystemNote(text);
        return cleaned.length > max ? cleaned.slice(0, max) + '…' : cleaned;
    }
    function toast(message, type = 'info', ms = 2200) {
        let box = document.getElementById(`${SCRIPT_NS}-toast`);
        if (!box) {
            box = document.createElement('div');
            box.id = `${SCRIPT_NS}-toast`;
            document.body.appendChild(box);
        }
        const item = document.createElement('div');
        item.className = `${SCRIPT_NS}-toast-item ${type}`;
        item.textContent = message;
        box.appendChild(item);
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(8px)';
            setTimeout(() => item.remove(), 240);
        }, ms);
    }
    function getMessageContent(msg) { return String(msg?.content || msg?.text || msg?.message || msg?.answer || ''); }
    function messageIdOf(msg) { return msg?._id || msg?.id || ''; }
    function getRerollFlag(msg) { return msg?.reroll ? true : false; }
    function splitIntoParagraphs(raw = '') {
        const text = String(raw || '').replace(/\r\n/g, '\n').trim();
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
        return blocks.map(block => block.trim()).filter(Boolean);
    }

    function getCookie(name) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    }
    function getCommonHeaders() {
        const token = getCookie('access_token');
        const headers = { accept: 'application/json, text/plain, */*', platform: 'web', 'wrtn-locale': 'ko-KR' };
        if (token) headers.authorization = `Bearer ${token}`;
        const wrtnId = getCookie('__w_id');
        if (wrtnId) headers['x-wrtn-id'] = wrtnId;
        return headers;
    }
    function extractChatIdFromUrl() {
        const str = String(location.href || '');
        const match = str.match(/\/episodes\/([a-f0-9]{24})/i) || str.match(/\/chats\/([a-f0-9]{24})/i);
        return match ? match[1] : null;
    }
    async function overwriteMessageOnServer(chatId, messageId, messageText) {
        const res = await fetch(`${API_BASE}/chats/${chatId}/messages/${messageId}`, {
            method: 'PATCH', credentials: 'include',
            headers: { ...getCommonHeaders(), 'content-type': 'application/json' },
            body: JSON.stringify({ message: messageText })
        });
        if (!res.ok) throw new Error(`답변 덮어쓰기 실패 (${res.status})`);
        return await res.json().catch(() => ({}));
    }

    async function openMixerForGroup(group) {
        const chatId = extractChatIdFromUrl();
        if (!chatId) return alert('채팅 ID를 찾을 수 없습니다.');

        const domMessageId = group.getAttribute('data-message-group-id');
        if (!domMessageId) return alert('메시지 ID를 찾을 수 없습니다.');

        let currentAiText = '';
        const aiTextNode = group.querySelector('.wrtn-markdown');
        if (aiTextNode) currentAiText = parseWrtnHTML(aiTextNode).trim();

        const mockVariants = cleanMixerMemory.map((text, index) => ({
            _id: `memory_id_${index}`,
            content: text,
            role: 'assistant',
            reroll: true
        }));

        mockVariants.push({
            _id: domMessageId,
            content: currentAiText,
            role: 'assistant',
            reroll: false
        });

        const bundle = {
            group,
            domMessageId,
            variants: mockVariants,
            totalMatches: true,
            currentIndex: mockVariants.length - 1,
            userPrompt: null
        };

        if (mockVariants.length <= 1) {
            alert('비교할 리롤 답변이 없습니다. 클린 리롤(✨)을 한 번 이상 사용한 후에 눌러주세요.');
            return;
        }

        showMixerModal(bundle);
    }

    function showMixerModal(bundle) {
        document.getElementById(MODAL_ID)?.remove();

        const overlay = document.createElement('div');
        overlay.id = MODAL_ID;

        const total = bundle.variants.length;
        const current = bundle.currentIndex;
        const defaultA = current;
        const defaultB = current > 0 ? current - 1 : 0;

        const optionHtml = bundle.variants.map((msg, index) => {
            const preview = shortPreview(getMessageContent(msg), 54);
            const currentLabel = index === current ? ' · 현재' : '';
            return `<option value="${index}">답변 ${index + 1}${currentLabel} — ${escapeHtml(preview)}</option>`;
        }).join('');

        overlay.innerHTML = `
            <div class="${SCRIPT_NS}-modal-card" role="dialog" aria-modal="true">
                <div class="${SCRIPT_NS}-modal-header">
                    <div>
                        <div class="${SCRIPT_NS}-modal-title">리롤 믹서 🧩</div>
                        <div class="${SCRIPT_NS}-modal-desc">
                            답변 두 개를 나란히 펼쳐 읽고, 마음에 드는 문단을 편집본에 모아요. 편집본은 현재 화면 답변에 덮어쓸 수 있습니다.
                        </div>
                    </div>
                    <button type="button" class="${SCRIPT_NS}-icon-btn" data-close>✕</button>
                </div>

                <div class="${SCRIPT_NS}-topbar">
                    <label>
                        <span>A 답변</span>
                        <select data-select-a>${optionHtml}</select>
                    </label>
                    <label>
                        <span>B 답변</span>
                        <select data-select-b>${optionHtml}</select>
                    </label>
                    <button type="button" class="${SCRIPT_NS}-soft-btn" data-swap>↔ 교체</button>
                </div>

                <div class="${SCRIPT_NS}-mobile-tabs">
                    <button type="button" class="is-active" data-tab="a">A</button>
                    <button type="button" data-tab="b">B</button>
                    <button type="button" data-tab="edit">편집본</button>
                </div>

                <div class="${SCRIPT_NS}-modal-body">
                    <section class="${SCRIPT_NS}-answer-pane" data-pane="a">
                        <div class="${SCRIPT_NS}-pane-title ${SCRIPT_NS}-answer-title">
                            <span>답변 A</span>
                            <button type="button" class="${SCRIPT_NS}-title-add-all" data-add-whole-a>전체 추가</button>
                        </div>
                        <div class="${SCRIPT_NS}-paragraph-list" data-list-a></div>
                    </section>

                    <section class="${SCRIPT_NS}-answer-pane" data-pane="b">
                        <div class="${SCRIPT_NS}-pane-title ${SCRIPT_NS}-answer-title">
                            <span>답변 B</span>
                            <button type="button" class="${SCRIPT_NS}-title-add-all" data-add-whole-b>전체 추가</button>
                        </div>
                        <div class="${SCRIPT_NS}-paragraph-list" data-list-b></div>
                    </section>

                    <section class="${SCRIPT_NS}-editor-pane" data-pane="edit">
                        <div class="${SCRIPT_NS}-pane-title ${SCRIPT_NS}-editor-title">
                            <span>편집본</span>
                            <small data-overwrite-target>현재 답변에 덮어쓰기</small>
                        </div>
                        <textarea data-editor placeholder="마음에 드는 문단을 추가하면 여기에 모입니다. 여기서 직접 고쳐도 돼요."></textarea>
                        <div class="${SCRIPT_NS}-editor-actions">
                            <button type="button" class="${SCRIPT_NS}-soft-btn" data-clear-editor>비우기</button>
                        </div>
                    </section>
                </div>

                <div class="${SCRIPT_NS}-modal-footer">
                    <div class="${SCRIPT_NS}-meta" data-meta></div>
                    <div class="${SCRIPT_NS}-footer-buttons">
                        <button type="button" class="${SCRIPT_NS}-secondary-btn" data-copy>복사</button>
                        <button type="button" class="${SCRIPT_NS}-primary-btn" data-overwrite>답변 덮어쓰기</button>
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

        selectA.value = String(defaultA);
        selectB.value = String(defaultB);
        editor.value = activeEditorText || '';

        const addedParagraphKeys = new Map();
        const getEditorText = () => editor.value;
        const setEditorText = (value) => {
            editor.value = value;
            activeEditorText = value;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
        };

        function makeParagraphKey(answerIndex, pIndex) { return `${answerIndex}:${pIndex}`; }
        function normalizeEditorBlock(text = '') { return String(text || '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim(); }
        function splitEditorBlocks(text = '') { return normalizeEditorBlock(text).split(/\n{2,}/).map(b => b.trim()).filter(Boolean); }
        function editorContainsParagraph(paragraph = '') { return splitEditorBlocks(getEditorText()).some(block => normalizeEditorBlock(block) === normalizeEditorBlock(paragraph)); }
        function removeParagraphFromEditor(paragraph = '') {
            const target = normalizeEditorBlock(paragraph);
            const blocks = splitEditorBlocks(getEditorText());
            const index = blocks.findIndex(b => normalizeEditorBlock(b) === target);
            if (index < 0) return false;
            blocks.splice(index, 1);
            setEditorText(blocks.join('\n\n'));
            return true;
        }
        function getAnswerParagraphs(answerIndex) { return splitIntoParagraphs(getMessageContent(bundle.variants[answerIndex])).filter(Boolean); }
        function getAnswerAddedCount(answerIndex) { return getAnswerParagraphs(answerIndex).reduce((c, p) => c + (editorContainsParagraph(p) ? 1 : 0), 0); }

        function updateAnswerBulkButton(btn, answerIndex, sideLabel = '') {
            if (!btn) return;
            const total = getAnswerParagraphs(answerIndex).length;
            const hasAdded = getAnswerAddedCount(answerIndex) > 0;
            btn.classList.toggle('is-remove', hasAdded);
            btn.textContent = hasAdded ? '전체 제거' : '전체 추가';
            btn.disabled = total <= 0;
        }

        function syncParagraphButtons() {
            overlay.querySelectorAll('[data-paragraph-key]').forEach(btn => {
                const key = btn.dataset.paragraphKey;
                const text = addedParagraphKeys.get(key) || btn.dataset.paragraphText;
                const isAdded = addedParagraphKeys.has(key) && editorContainsParagraph(text);
                btn.classList.toggle('is-added', isAdded);
                btn.textContent = isAdded ? '- 제거' : '+ 추가';
            });
            updateAnswerBulkButton(overlay.querySelector('[data-add-whole-a]'), Number(selectA.value), 'A');
            updateAnswerBulkButton(overlay.querySelector('[data-add-whole-b]'), Number(selectB.value), 'B');
        }

        function toggleParagraphInEditor(text, key = '') {
            const clean = String(text || '').trim();
            if (!clean) return;
            if (key && addedParagraphKeys.has(key) && editorContainsParagraph(clean)) {
                removeParagraphFromEditor(clean);
                if (key) addedParagraphKeys.delete(key);
                toast('편집본에서 제거했어.', 'success', 900);
            } else {
                if (!editorContainsParagraph(clean)) {
                    const currentText = getEditorText().trim();
                    setEditorText(currentText ? `${currentText}\n\n${clean}` : clean);
                }
                if (key) addedParagraphKeys.set(key, clean);
                toast('편집본에 추가했어.', 'success', 900);
            }
            syncParagraphButtons();
        }

        function toggleWholeAnswerInEditor(answerIndex) {
            const paragraphs = getAnswerParagraphs(answerIndex);
            if (!paragraphs.length) return;
            if (getAnswerAddedCount(answerIndex) > 0) {
                paragraphs.forEach((p, i) => {
                    removeParagraphFromEditor(p);
                    addedParagraphKeys.delete(makeParagraphKey(answerIndex, i));
                });
                toast('답변 전체를 제거했어.', 'success');
            } else {
                paragraphs.forEach((p, i) => {
                    const clean = String(p).trim();
                    if (!editorContainsParagraph(clean)) {
                        const currentText = getEditorText().trim();
                        setEditorText(currentText ? `${currentText}\n\n${clean}` : clean);
                    }
                    addedParagraphKeys.set(makeParagraphKey(answerIndex, i), clean);
                });
                toast('답변 전체를 추가했어.', 'success');
            }
            syncParagraphButtons();
        }

        function renderList(listEl, answerIndex, sideLabel) {
            const msg = bundle.variants[answerIndex];
            const paragraphs = getAnswerParagraphs(answerIndex);
            const isCurrent = answerIndex === current;

            if (!paragraphs.length) {
                listEl.innerHTML = `<div class="${SCRIPT_NS}-empty">문단을 찾지 못했어요.</div>`;
                return;
            }

            listEl.innerHTML = `
                <div class="${SCRIPT_NS}-answer-info">
                    <div class="${SCRIPT_NS}-answer-info-main">
                        <b>${sideLabel} · 답변 ${answerIndex + 1}</b>
                        ${isCurrent ? '<span class="badge current">현재 화면</span>' : '<span class="badge original">메모리 백업</span>'}
                    </div>
                </div>
                ${paragraphs.map((paragraph, pIndex) => {
                    const paragraphKey = makeParagraphKey(answerIndex, pIndex);
                    const isAdded = addedParagraphKeys.has(paragraphKey) && editorContainsParagraph(paragraph);
                    return `
                        <article class="${SCRIPT_NS}-paragraph-card">
                            <div class="${SCRIPT_NS}-paragraph-head">
                                <span>${sideLabel}-${pIndex + 1}</span>
                                <button type="button" class="${isAdded ? 'is-added' : ''}" data-add-paragraph="${pIndex}" data-paragraph-key="${escapeHtml(paragraphKey)}" data-paragraph-text="${escapeHtml(paragraph)}">${isAdded ? '- 제거' : '+ 추가'}</button>
                            </div>
                            <pre>${escapeHtml(paragraph)}</pre>
                        </article>
                    `;
                }).join('')}
            `;

            listEl.querySelectorAll('[data-add-paragraph]').forEach(btn => {
                btn.addEventListener('click', () => {
                    toggleParagraphInEditor(paragraphs[Number(btn.dataset.addParagraph)], btn.dataset.paragraphKey);
                });
            });
            syncParagraphButtons();
        }

        function renderAll() {
            renderList(listA, Number(selectA.value), 'A');
            renderList(listB, Number(selectB.value), 'B');
            meta.textContent = `총 ${total}개 리롤 (화면 1개 + 백업 ${total-1}개) · 현재 화면 답변은 덮어쓰기 대상입니다.`;
        }

        function setMobileTab(tabName) {
            overlay.querySelectorAll('[data-tab]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.tab === tabName));
            overlay.dataset.mobileTab = tabName;
        }

        selectA.addEventListener('change', renderAll);
        selectB.addEventListener('change', renderAll);
        editor.addEventListener('input', () => { activeEditorText = editor.value; syncParagraphButtons(); });

        overlay.querySelector('[data-swap]').addEventListener('click', () => {
            const oldA = selectA.value; selectA.value = selectB.value; selectB.value = oldA; renderAll();
        });
        overlay.querySelector('[data-add-whole-a]')?.addEventListener('click', () => toggleWholeAnswerInEditor(Number(selectA.value)));
        overlay.querySelector('[data-add-whole-b]')?.addEventListener('click', () => toggleWholeAnswerInEditor(Number(selectB.value)));
        overlay.querySelector('[data-clear-editor]').addEventListener('click', () => {
            if (!editor.value.trim() || confirm('편집본을 비울까요?')) setEditorText('');
        });
        overlay.querySelector('[data-copy]').addEventListener('click', async () => {
            try { await navigator.clipboard.writeText(editor.value.trim()); toast('복사 완료!', 'success'); } catch(e) {}
        });

        overlay.querySelector('[data-overwrite]').addEventListener('click', async () => {
            const text = editor.value.trim();
            if (!text) return alert('덮어쓰기에 사용할 편집본이 비어 있어요.');

            const targetId = bundle.domMessageId;
            if (!confirm(`현재 화면에 떠있는 답변(ID: ${targetId.slice(-6)})에 편집본을 덮어쓸까요?\n(서버에도 반영됩니다)`)) return;

            const btn = overlay.querySelector('[data-overwrite]');
            btn.disabled = true;
            btn.textContent = '덮어쓰는 중...';

            try {
                await overwriteMessageOnServer(extractChatIdFromUrl(), targetId, text);
                toast('답변 덮어쓰기 완료. 새로고침할게.', 'success', 1300);
                setTimeout(() => location.reload(), 650);
            } catch (err) {
                alert('덮어쓰기 실패: ' + err.message);
                btn.disabled = false;
                btn.textContent = '답변 덮어쓰기';
            }
        });

        overlay.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => overlay.remove()));
        overlay.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => setMobileTab(btn.dataset.tab)));
        overlay.addEventListener('mousedown', e => { if (e.target === overlay) overlay.remove(); });

        renderAll();
        setMobileTab('a');
    }


    // ==========================================
    // 🎨 UI 주입 (버튼 나란히 배치 및 설정 메뉴 추가)
    // ==========================================
    function addActionButtons() {
        const originalRerolls = Array.from(document.querySelectorAll('button')).filter(btn => {
            const svg = btn.querySelector('svg path');
            return svg && svg.getAttribute('d').startsWith('M3.8 12');
        });

        if (originalRerolls.length === 0) return;
        const latestReroll = originalRerolls[0];
        const group = latestReroll.closest('[data-message-group-id]');

        if (latestReroll.nextElementSibling && latestReroll.nextElementSibling.classList.contains('custom-action-container')) return;

        document.querySelectorAll('.custom-action-container').forEach(e => e.remove());

        const btnContainer = document.createElement('div');
        btnContainer.className = 'custom-action-container';
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '4px';
        btnContainer.style.alignItems = 'center';
        btnContainer.style.marginLeft = '4px';

        const cleanBtn = document.createElement('button');
        cleanBtn.innerText = '✨';
        cleanBtn.title = "현재 AI 답변 백업 후 클린 리롤 실행";
        cleanBtn.className = latestReroll.className;
        Object.assign(cleanBtn.style, {
            fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0', padding: '0', width: '28px', height: '28px'
        });

        // B: 터치 이벤트 개선 반영
        cleanBtn.addEventListener('click', executeCleanReroll);
        cleanBtn.addEventListener('touchstart', (e) => e.stopPropagation(), {passive: true});

        const mixerBtn = document.createElement('button');
        mixerBtn.type = 'button';
        mixerBtn.className = `crack-reroll-mixer-open-btn relative inline-flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:fill-current h-6 rounded px-2 py-1 text-xs [&_svg]:size-4 bg-transparent text-line-gray-2 hover:bg-accent active:bg-accent/80`;
        mixerBtn.title = '저장된 클린 리롤 답변 믹서 열기';
        mixerBtn.innerHTML = `${MIXER_ICON_HTML}<span class="${SCRIPT_NS}-btn-label">믹스</span>`;
        mixerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openMixerForGroup(group);
        });

        btnContainer.appendChild(cleanBtn);
        btnContainer.appendChild(mixerBtn);

        latestReroll.parentNode.insertBefore(btnContainer, latestReroll.nextSibling);
    }

    // B: 자동 전송 설정 메뉴 UI 토글 추가
    function addSettingsMenuToggle() {
        if (document.getElementById('custom-reroll-setting')) return;

        const targetTextElement = Array.from(document.querySelectorAll('span')).find(el => el.textContent.trim() === '상황 이미지 보기');
        if (!targetTextElement) return;

        const targetMenu = targetTextElement.closest('.box-content');
        if (!targetMenu) return;

        const isAuto = getAutoSendState();
        const stateStr = isAuto ? 'checked' : 'unchecked';

        const settingContainer = document.createElement('div');
        settingContainer.id = 'custom-reroll-setting';
        settingContainer.className = 'px-2.5 h-4 box-content py-[18px]';

        settingContainer.innerHTML = `
            <div role="button" tabindex="0" class="w-full flex h-4 items-center justify-between typo-text-base_leading-none_medium space-x-2 [&_svg]:fill-icon_tertiary ring-offset-4 ring-offset-sidebar cursor-pointer">
                <span class="flex space-x-2 items-center">
                    <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="var(--icon_secondary)" viewBox="0 0 24 24" width="24" height="24" color="icon_secondary">
                        <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.87 5.87 0 016 12c0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
                    </svg>
                    <span class="whitespace-nowrap overflow-hidden text-ellipsis typo-text-sm_leading-none_medium">클린 리롤 자동 전송</span>
                </span>
                <span>
                    <button id="custom-autosend-toggle" type="button" role="switch" aria-checked="${isAuto}" data-state="${stateStr}" class="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors border data-[state=unchecked]:border-bg-input-80 data-[state=unchecked]:bg-bg-input-80 data-[state=checked]:border-primary data-[state=checked]:bg-primary focus-visible:border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50" tabindex="-1">
                        <span data-state="${stateStr}" class="pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[15px] data-[state=unchecked]:translate-x-[-1px]"></span>
                    </button>
                </span>
            </div>
        `;

        const clickTarget = settingContainer.querySelector('div[role="button"]');
        const toggleBtn = settingContainer.querySelector('#custom-autosend-toggle');
        const toggleSpan = toggleBtn.querySelector('span');

        clickTarget.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const newState = toggleAutoSendState();
            const newStateStr = newState ? 'checked' : 'unchecked';

            toggleBtn.setAttribute('aria-checked', newState);
            toggleBtn.setAttribute('data-state', newStateStr);
            toggleSpan.setAttribute('data-state', newStateStr);
        });

        targetMenu.parentNode.insertBefore(settingContainer, targetMenu.nextSibling);
    }

    function initObserver() {
        if (!document.body) {
            setTimeout(initObserver, 100);
            return;
        }
        const observer = new MutationObserver(() => {
            addActionButtons();      // A의 통합 버튼 (터치 이벤트 개선)
            addSettingsMenuToggle(); // B의 자동 전송 토글 메뉴
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // 믹서용 CSS (원문 그대로 100% 유지)
    function injectStyles() {
        GM_addStyle(`
            .crack-reroll-mixer-open-btn {
                margin-left: 0 !important; background-color: var(--transparent) !important; color: hsl(var(--line-gray-2)) !important;
            }
            .crack-reroll-mixer-open-btn .${SCRIPT_NS}-btn-label, .crack-reroll-mixer-open-btn svg { color: inherit; }
            #${SCRIPT_NS}-toast { position: fixed; right: 22px; bottom: 122px; z-index: 2147483001; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
            .${SCRIPT_NS}-toast-item { max-width: 320px; padding: 10px 12px; border-radius: 12px; background: rgba(24,24,27,.94); color: #fff; font-size: 13px; box-shadow: 0 8px 24px rgba(0,0,0,.24); transition: opacity .22s ease, transform .22s ease; backdrop-filter: blur(10px); }
            .${SCRIPT_NS}-toast-item.success { background: rgba(24, 128, 72, .94); }
            #${MODAL_ID} {
                --rrm-overlay: rgba(0, 0, 0, .42); --rrm-bg: #ffffff; --rrm-panel: #f7f7f8; --rrm-card: #ffffff;
                --rrm-text: #18181b; --rrm-strong: #0f0f12; --rrm-muted: #6f7178; --rrm-faint: #8b8e97;
                --rrm-border: rgba(16, 18, 24, .13); --rrm-soft: rgba(16, 18, 24, .065); --rrm-soft-hover: rgba(16, 18, 24, .105);
                --rrm-input: #ffffff; --rrm-primary: #ff4432; --rrm-primary-hover: #ff5b4b; --rrm-primary-text: #ffffff;
                --rrm-blue-bg: rgba(37, 99, 235, .12); --rrm-blue-text: #1d4ed8; --rrm-shadow: 0 20px 80px rgba(0,0,0,.28);
                position: fixed; inset: 0; z-index: 2147483002; display: flex; align-items: center; justify-content: center; padding: 18px; background: var(--rrm-overlay); backdrop-filter: blur(5px); color: var(--rrm-text);
            }
            body[data-theme="dark"] #${MODAL_ID}, [data-theme="dark"] #${MODAL_ID} {
                --rrm-overlay: rgba(0, 0, 0, .58); --rrm-bg: #18181c; --rrm-panel: #202027; --rrm-card: #24242b;
                --rrm-text: #f4f4f5; --rrm-strong: #ffffff; --rrm-muted: rgba(255,255,255,.68); --rrm-faint: rgba(255,255,255,.46);
                --rrm-border: rgba(255,255,255,.12); --rrm-soft: rgba(255,255,255,.085); --rrm-soft-hover: rgba(255,255,255,.14);
                --rrm-input: #18181c; --rrm-blue-bg: rgba(92, 154, 255, .18); --rrm-blue-text: #9fc4ff; --rrm-shadow: 0 20px 80px rgba(0,0,0,.48);
            }
            @media (prefers-color-scheme: dark) {
                body:not([data-theme="light"]) #${MODAL_ID} {
                    --rrm-overlay: rgba(0, 0, 0, .58); --rrm-bg: #18181c; --rrm-panel: #202027; --rrm-card: #24242b; --rrm-text: #f4f4f5; --rrm-strong: #ffffff; --rrm-muted: rgba(255,255,255,.68); --rrm-faint: rgba(255,255,255,.46); --rrm-border: rgba(255,255,255,.12); --rrm-soft: rgba(255,255,255,.085); --rrm-soft-hover: rgba(255,255,255,.14); --rrm-input: #18181c; --rrm-blue-bg: rgba(92, 154, 255, .18); --rrm-blue-text: #9fc4ff; --rrm-shadow: 0 20px 80px rgba(0,0,0,.48);
                }
            }
            .${SCRIPT_NS}-modal-card { width: min(1240px, calc(100vw - 28px)); height: min(860px, calc(100vh - 28px)); display: flex; flex-direction: column; overflow: hidden; border-radius: 18px; border: 1px solid var(--rrm-border); background: var(--rrm-bg); color: var(--rrm-text); box-shadow: var(--rrm-shadow); }
            .${SCRIPT_NS}-modal-header { display: flex; justify-content: space-between; gap: 14px; padding: 15px 18px 11px; border-bottom: 1px solid var(--rrm-border); background: var(--rrm-bg); }
            .${SCRIPT_NS}-modal-title { font-size: 18px; line-height: 1.2; font-weight: 900; color: var(--rrm-strong); }
            .${SCRIPT_NS}-modal-desc { margin-top: 6px; color: var(--rrm-muted); font-size: 13px; line-height: 1.45; }
            .${SCRIPT_NS}-icon-btn { flex: 0 0 auto; width: 32px; height: 32px; border: 1px solid var(--rrm-border); border-radius: 999px; background: var(--rrm-soft); color: var(--rrm-text); cursor: pointer; font-size: 16px; }
            .${SCRIPT_NS}-icon-btn:hover { background: var(--rrm-soft-hover); }
            .${SCRIPT_NS}-topbar { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; gap: 10px; align-items: end; padding: 12px 18px; border-bottom: 1px solid var(--rrm-border); background: var(--rrm-panel); }
            .${SCRIPT_NS}-topbar label { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
            .${SCRIPT_NS}-topbar label span { font-size: 12px; color: var(--rrm-muted); font-weight: 800; }
            .${SCRIPT_NS}-topbar select { width: 100%; min-height: 34px; border: 1px solid var(--rrm-border); border-radius: 10px; background: var(--rrm-input); color: var(--rrm-text); padding: 0 10px; font-size: 13px; outline: none; }
            .${SCRIPT_NS}-topbar select option { background: var(--rrm-bg); color: var(--rrm-text); }
            .${SCRIPT_NS}-mobile-tabs { display: none; grid-template-columns: repeat(3, 1fr); gap: 6px; padding: 10px 12px 0; background: var(--rrm-bg); }
            .${SCRIPT_NS}-mobile-tabs button { min-height: 34px; border: 1px solid var(--rrm-border); border-radius: 999px; background: var(--rrm-soft); color: var(--rrm-muted); font-weight: 900; }
            .${SCRIPT_NS}-mobile-tabs button.is-active { background: var(--rrm-primary); color: var(--rrm-primary-text); border-color: transparent; }
            .${SCRIPT_NS}-modal-body { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(300px, 1fr) minmax(300px, 1fr) minmax(280px, .82fr); gap: 12px; padding: 14px 18px; overflow: hidden; background: var(--rrm-bg); }
            .${SCRIPT_NS}-answer-pane, .${SCRIPT_NS}-editor-pane { min-height: 0; min-width: 0; display: flex; flex-direction: column; border: 1px solid var(--rrm-border); border-radius: 14px; background: var(--rrm-panel); color: var(--rrm-text); overflow: hidden; }
            .${SCRIPT_NS}-pane-title { flex: 0 0 auto; padding: 10px 12px; border-bottom: 1px solid var(--rrm-border); font-size: 14px; font-weight: 900; color: var(--rrm-strong); background: var(--rrm-panel); }
            .${SCRIPT_NS}-answer-title { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
            .${SCRIPT_NS}-title-add-all { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; height: 28px; min-height: 28px; border: 1px solid var(--rrm-primary); border-radius: 999px; padding: 0 11px; background: var(--rrm-primary); color: var(--rrm-primary-text) !important; font-size: 12px; font-weight: 900; line-height: 1; cursor: pointer; white-space: nowrap; }
            .${SCRIPT_NS}-title-add-all:hover { background: var(--rrm-primary-hover); color: var(--rrm-primary-text) !important; }
            .${SCRIPT_NS}-title-add-all.is-remove { background: var(--rrm-soft); color: var(--rrm-primary) !important; border-color: color-mix(in srgb, var(--rrm-primary) 42%, transparent); }
            .${SCRIPT_NS}-title-add-all.is-remove:hover { background: var(--rrm-soft-hover); color: var(--rrm-primary) !important; }
            .${SCRIPT_NS}-title-add-all:disabled { opacity: .55; cursor: not-allowed; }
            .${SCRIPT_NS}-editor-title { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
            .${SCRIPT_NS}-editor-title small { min-width: 0; color: var(--rrm-muted); font-size: 11px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .${SCRIPT_NS}-paragraph-list { flex: 1 1 auto; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 10px; display: flex; flex-direction: column; gap: 10px; overscroll-behavior: contain; }
            .${SCRIPT_NS}-answer-info { display: flex; gap: 8px; align-items: center; padding: 8px 9px; border-radius: 11px; background: var(--rrm-soft); color: var(--rrm-text); font-size: 12px; }
            .${SCRIPT_NS}-answer-info-main { min-width: 0; display: flex; flex-wrap: wrap; gap: 7px; align-items: center; }
            .${SCRIPT_NS}-paragraph-card { flex: 0 0 auto; position: relative; border: 1px solid var(--rrm-border); border-radius: 13px; background: var(--rrm-card); overflow: visible; }
            .${SCRIPT_NS}-paragraph-head { position: sticky; top: 0; z-index: 3; display: flex; justify-content: space-between; gap: 8px; align-items: center; padding: 8px 9px; border-bottom: 1px solid var(--rrm-border); border-radius: 13px 13px 0 0; background: color-mix(in srgb, var(--rrm-card) 94%, transparent); backdrop-filter: blur(8px); }
            .${SCRIPT_NS}-paragraph-head span { font-size: 12px; font-weight: 900; color: var(--rrm-muted); }
            .${SCRIPT_NS}-paragraph-head button, .${SCRIPT_NS}-soft-btn, .${SCRIPT_NS}-secondary-btn, .${SCRIPT_NS}-primary-btn { min-height: 30px; border: 1px solid transparent; border-radius: 9px; padding: 0 10px; font-size: 12px; font-weight: 900; cursor: pointer; transition: background .16s ease, opacity .16s ease, transform .16s ease; }
            .${SCRIPT_NS}-paragraph-head button, .${SCRIPT_NS}-primary-btn { background: var(--rrm-primary); color: var(--rrm-primary-text); }
            .${SCRIPT_NS}-paragraph-head button:hover, .${SCRIPT_NS}-primary-btn:hover { background: var(--rrm-primary-hover); }
            .${SCRIPT_NS}-paragraph-head button.is-added { background: var(--rrm-soft); color: var(--rrm-primary); border-color: color-mix(in srgb, var(--rrm-primary) 42%, transparent); }
            .${SCRIPT_NS}-paragraph-head button.is-added:hover { background: var(--rrm-soft-hover); color: var(--rrm-primary); }
            .${SCRIPT_NS}-soft-btn, .${SCRIPT_NS}-secondary-btn { background: var(--rrm-soft); color: var(--rrm-text); border-color: var(--rrm-border); }
            .${SCRIPT_NS}-soft-btn:hover, .${SCRIPT_NS}-secondary-btn:hover { background: var(--rrm-soft-hover); }
            .${SCRIPT_NS}-primary-btn:disabled, .${SCRIPT_NS}-secondary-btn:disabled, .${SCRIPT_NS}-soft-btn:disabled { opacity: .55; cursor: wait; }
            .${SCRIPT_NS}-paragraph-card pre { display: block !important; visibility: visible !important; height: auto !important; max-height: none !important; margin: 0; padding: 11px 12px 12px; white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; overflow: visible; font-family: inherit; font-size: 13px; line-height: 1.66; color: var(--rrm-text); }
            .${SCRIPT_NS}-editor-pane textarea { flex: 1; min-height: 0; resize: none; border: none; outline: none; background: var(--rrm-input); color: var(--rrm-text); padding: 12px; font-family: inherit; font-size: 13px; line-height: 1.55; white-space: pre-wrap; }
            .${SCRIPT_NS}-editor-pane textarea::placeholder { color: var(--rrm-faint); }
            .${SCRIPT_NS}-editor-actions { display: flex; gap: 8px; padding: 10px; border-top: 1px solid var(--rrm-border); background: var(--rrm-panel); }
            .${SCRIPT_NS}-modal-footer { display: flex; justify-content: space-between; gap: 10px; align-items: center; padding: 12px 18px 16px; border-top: 1px solid var(--rrm-border); background: var(--rrm-bg); }
            .${SCRIPT_NS}-meta { min-width: 0; color: var(--rrm-muted); font-size: 12px; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .${SCRIPT_NS}-footer-buttons { display: flex; gap: 8px; flex: 0 0 auto; }
            .badge { display: inline-flex; align-items: center; height: 19px; padding: 0 7px; border-radius: 999px; font-size: 11px; font-weight: 800; line-height: 1; }
            .badge.current { background: var(--rrm-primary); color: var(--rrm-primary-text); }
            .badge.original { background: var(--rrm-soft); color: var(--rrm-muted); }
            .${SCRIPT_NS}-empty { padding: 14px; color: var(--rrm-muted); font-size: 13px; }
            @media (max-width: 860px) {
                #${MODAL_ID} { padding: 8px; align-items: flex-end; }
                .${SCRIPT_NS}-modal-card { width: 100%; height: min(92vh, 840px); border-radius: 18px 18px 10px 10px; }
                .${SCRIPT_NS}-modal-header { padding: 14px 14px 10px; }
                .${SCRIPT_NS}-modal-desc { font-size: 12px; }
                .${SCRIPT_NS}-topbar { grid-template-columns: 1fr; padding: 10px 12px; }
                .${SCRIPT_NS}-mobile-tabs { display: grid; }
                .${SCRIPT_NS}-modal-body { display: block; padding: 10px 12px; overflow: hidden; }
                .${SCRIPT_NS}-answer-pane, .${SCRIPT_NS}-editor-pane { height: 100%; display: none; }
                #${MODAL_ID}[data-mobile-tab="a"] [data-pane="a"], #${MODAL_ID}[data-mobile-tab="b"] [data-pane="b"], #${MODAL_ID}[data-mobile-tab="edit"] [data-pane="edit"] { display: flex; }
                .${SCRIPT_NS}-modal-footer { flex-direction: column; align-items: stretch; padding: 10px 12px 12px; }
                .${SCRIPT_NS}-meta { white-space: normal; }
                .${SCRIPT_NS}-footer-buttons { display: grid; grid-template-columns: 1fr 1fr; }
                .${SCRIPT_NS}-footer-buttons [data-overwrite] { grid-column: 1 / -1; }
            }
        `);
    }

    injectStyles();
    initObserver();

})();

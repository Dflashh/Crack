// ==UserScript==
// @name         ✨ 클린 리롤
// @namespace    https://github.com/Dflashh/Crack
// @version      2.5.3
// @description  리롤하고 싶은 내용을 삭제하고 새 응답 받기
// @author       깡통들 & 나
// @match        https://crack.wrtn.ai/*
// @grant        GM_addStyle
// @run-at       document-idle
// @icon         https://cdn.jsdelivr.net/gh/Dflashh/Crack@main/Icon/Clean.webp
// @downloadURL  https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackUI.user.js
// @updateURL    https://raw.githubusercontent.com/Dflashh/Crack/main/Archive/CrackUI.user.js
// ==/UserScript==

(function() {
    'use strict';

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function getAutoSendState() {
        return localStorage.getItem('wrtn_clean_reroll_autosend') !== 'false';
    }

    function toggleAutoSendState() {
        const newState = !getAutoSendState();
        localStorage.setItem('wrtn_clean_reroll_autosend', newState);
        return newState;
    }

    function isVisible(elem) {
        return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
    }

    function simulateRealClick(element) {
        if (!element) return;

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

            await aggressiveDelete(userId);
            await wait(500);

            let maxAttempts = 5;
            while (document.querySelector(`[data-message-group-id="${aiId}"]`) && maxAttempts > 0) {
                await aggressiveDelete(aiId);
                await wait(400);
                maxAttempts--;
            }

            await wait(300);
            const isTyped = typeTextIntoEditor(userText);

            if (isTyped) {
                await wait(300); 
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
            if (document.body.contains(myBtn)) {
                myBtn.innerText = '✨';
                myBtn.style.pointerEvents = 'auto';
            }
        }
    }

    function addCleanRerollButton() {
        const originalRerolls = Array.from(document.querySelectorAll('button')).filter(btn => {
            const svg = btn.querySelector('svg path');
            return svg && svg.getAttribute('d').startsWith('M3.8 12');
        });

        if (originalRerolls.length === 0) return;
        const latestReroll = originalRerolls[0];

        if (latestReroll.nextElementSibling && latestReroll.nextElementSibling.id === 'custom-clean-reroll') return;

        const oldCustomBtns = document.querySelectorAll('#custom-clean-reroll');
        oldCustomBtns.forEach(btn => btn.remove());

        const cleanBtn = document.createElement('button');
        cleanBtn.id = 'custom-clean-reroll';
        cleanBtn.innerText = '✨';
        cleanBtn.title = "현재 AI 답변과 내 응답을 삭제하고, 다시 전송합니다.";

        cleanBtn.className = latestReroll.className;

        Object.assign(cleanBtn.style, {
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0',
            padding: '0'
        });

        cleanBtn.addEventListener('click', executeCleanReroll);
        cleanBtn.addEventListener('touchstart', (e) => e.stopPropagation(), {passive: true}); 

        latestReroll.parentNode.insertBefore(cleanBtn, latestReroll.nextSibling);
    }

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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="var(--icon_secondary)" viewBox="0 0 24 24" width="24" height="24" color="icon_secondary">
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
            addCleanRerollButton();
            addSettingsMenuToggle();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    initObserver();

})();

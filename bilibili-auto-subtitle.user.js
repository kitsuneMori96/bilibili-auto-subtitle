// ==UserScript==
// @name         B站自动字幕增强版（快捷键C切换开关）
// @namespace    https://github.com/kitsuneMori96/bilibili-auto-subtitle
// @version      1.4
// @description  按C键切换全局启用/禁用状态（含真正关闭字幕）；切换分P时自动打开字幕，专为B站2025最新版优化
// @author       Apixus
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/list/*
// @grant        none
// @run-at       document-end
// @license      MIT
// @supportURL   https://github.com/kitsuneMori96/bilibili-auto-subtitle/issues
// @updateURL    https://github.com/kitsuneMori96/bilibili-auto-subtitle/raw/main/bilibili-auto-subtitle.user.js
// @downloadURL  https://github.com/kitsuneMori96/bilibili-auto-subtitle/raw/main/bilibili-auto-subtitle.user.js
// ==/UserScript==

(function () {
  'use strict';

  const KEY = 'KeyC';
  const NEED_SHIFT = false;
  const STORAGE_KEY = 'bilibili_subtitle_enabled';
  const MAX_RETRY = 10;
  const RETRY_INTERVAL = 500;

  let isEnabled = true;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      isEnabled = JSON.parse(saved);
    }
  } catch (e) {
    console.log('[B站自动字幕] 使用默认启用状态');
  }

  function logStatus() {
    const message = `[B站自动字幕] 当前状态: ${isEnabled ? '已启用' : '已禁用'}`;
    console.log(message);
  }

  function showToast(message) {
    const existing = document.getElementById('bilibili-subtitle-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'bilibili-subtitle-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.75);
      color: #fff;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 99999;
      transition: opacity 0.3s;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  function getSubtitleMenuBtn() {
    const selectors = [
      '.bpx-player-ctrl-subtitle',
      '.bpx-player-ctrl-btn[aria-label*="字幕"]',
      '.bpx-player-ctrl-btn[aria-label*="CC"]',
      '.squirtle-subtitle-wrap',
      '.bpx-player-ctrl-subtitle-wrap',
      '.bpx-player-subtitle',
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.offsetParent !== null) {
        return el;
      }
    }
    return null;
  }

  function getFirstLanguageItem() {
    const selectors = [
      '.bpx-player-ctrl-subtitle-language-item[data-lan]',
      '.bpx-player-ctrl-subtitle-language-item',
      '.bpx-player-subtitle-panel-lang-item',
      '.subtitle-language-item',
      '[class*="subtitle-language"] [class*="item"]',
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  function isSubtitleOn() {
    const activeLang = document.querySelector(
      '.bpx-player-ctrl-subtitle-language-item.bpx-state-active'
    );
    if (activeLang) return true;
    const subtitleDisplay = document.querySelector(
      '.bpx-player-subtitle-panel-text, .bpx-player-subtitle-text, .subtitle-text'
    );
    if (subtitleDisplay && subtitleDisplay.textContent.trim()) {
      return true;
    }
    return false;
  }

  function closeSubtitle() {
    const closeBtn = document.querySelector(
      '.bpx-player-ctrl-subtitle-close-switch'
    );
    if (closeBtn) {
      closeBtn.click();
      console.log('[B站自动字幕] 已点击关闭按钮');
      return true;
    }
    const menuBtn = getSubtitleMenuBtn();
    if (menuBtn) {
      menuBtn.click();
      setTimeout(() => {
        const closeBtn2 = document.querySelector(
          '.bpx-player-ctrl-subtitle-close-switch'
        );
        if (closeBtn2) {
          closeBtn2.click();
          console.log('[B站自动字幕] 已通过菜单关闭字幕');
        }
      }, 200);
      return true;
    }
    return false;
  }

  function openSubtitle(retryCount = 0) {
    if (!isEnabled) {
      console.log('[B站自动字幕] 功能已禁用，跳过打开字幕');
      return;
    }

    if (isSubtitleOn()) {
      console.log('[B站自动字幕] 字幕已处于开启状态');
      return;
    }

    const menuBtn = getSubtitleMenuBtn();
    if (!menuBtn) {
      if (retryCount < MAX_RETRY) {
        console.log(`[B站自动字幕] 未找到字幕按钮，重试 ${retryCount + 1}/${MAX_RETRY}`);
        setTimeout(() => openSubtitle(retryCount + 1), RETRY_INTERVAL);
      } else {
        console.warn('[B站自动字幕] 多次重试后仍未找到字幕按钮，该视频可能没有字幕');
      }
      return;
    }

    menuBtn.click();
    console.log('[B站自动字幕] 点击字幕菜单按钮');

    setTimeout(() => {
      const langItem = getFirstLanguageItem();
      if (langItem) {
        langItem.click();
        console.log('[B站自动字幕] 已选择语言，字幕已开启');
        showToast('字幕已开启 ✓');
      } else {
        console.log('[B站自动字幕] 未找到语言选项，可能是开关式字幕');
        if (isSubtitleOn()) {
          showToast('字幕已开启 ✓');
        } else if (retryCount < MAX_RETRY) {
          console.log(`[B站自动字幕] 字幕仍未开启，重试 ${retryCount + 1}/${MAX_RETRY}`);
          setTimeout(() => openSubtitle(retryCount + 1), RETRY_INTERVAL);
        }
      }
    }, 200);
  }

  document.addEventListener('keydown', e => {
    const inInput = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    const isContentEditable = document.activeElement.isContentEditable;

    if (!inInput && !isContentEditable && e.code === KEY && e.shiftKey === NEED_SHIFT && !e.repeat) {
      isEnabled = !isEnabled;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isEnabled));
      logStatus();
      showToast(`自动字幕: ${isEnabled ? '已启用' : '已禁用'}`);

      if (isEnabled) {
        setTimeout(() => openSubtitle(), 300);
      } else {
        setTimeout(() => closeSubtitle(), 300);
      }
    }
  });

  let lastUrl = location.href;

  function checkUrlChange() {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log('[B站自动字幕] 检测到URL变化（可能切换了分P）');
      if (isEnabled) {
        setTimeout(() => openSubtitle(), 1500);
      }
    }
  }

  const observer = new MutationObserver(() => {
    checkUrlChange();
  });

  function startObserver() {
    const target = document.body;
    if (target) {
      observer.observe(target, { childList: true, subtree: true });
    } else {
      setTimeout(startObserver, 500);
    }
  }

  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    setTimeout(checkUrlChange, 100);
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    setTimeout(checkUrlChange, 100);
  };

  window.addEventListener('popstate', () => {
    setTimeout(checkUrlChange, 100);
  });

  startObserver();

  function initOnPageLoad() {
    console.log('[B站自动字幕] 页面加载完成，准备开启字幕');
    logStatus();

    if (isEnabled) {
      setTimeout(() => openSubtitle(), 2000);
    }
  }

  if (document.readyState === 'complete') {
    initOnPageLoad();
  } else {
    window.addEventListener('load', initOnPageLoad);
  }

  window.bilibiliAutoSubtitle = {
    toggle: () => {
      isEnabled = !isEnabled;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isEnabled));
      logStatus();
      showToast(`自动字幕: ${isEnabled ? '已启用' : '已禁用'}`);
      if (isEnabled) {
        setTimeout(() => openSubtitle(), 300);
      } else {
        setTimeout(() => closeSubtitle(), 300);
      }
      return isEnabled;
    },
    getStatus: () => isEnabled,
    openNow: () => openSubtitle(),
    closeNow: () => closeSubtitle(),
  };

  console.log('[B站自动字幕] 脚本已加载，按 C 键切换开关');
})();

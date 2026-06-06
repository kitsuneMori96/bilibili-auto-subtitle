// ==UserScript==
// @name         B站自动字幕（快捷键 C & 自动开启）
// @namespace    https://github.com/Apixus/bilibili-auto-subtitle
// @version      2.0
// @description  C键切换字幕 + 自动开启字幕（优化性能与稳定性），专为B站2026最新版优化
// @author       Apixus
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/list/*
// @grant        none
// @run-at       document-end
// @license      MIT
// @supportURL   https://github.com/Apixus/bilibili-auto-subtitle/issues
// @updateURL    https://github.com/Apixus/bilibili-auto-subtitle/blob/main/bilibili-auto-subtitle.user.js
// @downloadURL  https://github.com/Apixus/bilibili-auto-subtitle/blob/main/bilibili-auto-subtitle.user.js
// ==/UserScript==

(function () {
  'use strict';

  /* ---------------- 配置 ---------------- */

  const CONFIG = {
    KEY: 'KeyC',
    MENU_OPEN_DELAY: 200,
    AUTO_DELAY: 1500,
    ELEMENT_TIMEOUT: 8000,
  };

  /* ---------------- 选择器 ---------------- */

  const SELECTORS = {
    subtitleBtn: '.bpx-player-ctrl-subtitle',
    menuPanel: '.bpx-player-ctrl-subtitle-box',
    langItem: '.bpx-player-ctrl-subtitle-language-item[data-lan]',
    activeLangItem: '.bpx-player-ctrl-subtitle-language-item.bpx-state-active',
    closeBtn: '.bpx-player-ctrl-subtitle-close-switch',
  };

  /* ---------------- 日志 ---------------- */

  const log = (...args) => console.log('[B站字幕]', ...args);

  /* ---------------- 工具函数 ---------------- */

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 等待元素出现（优化轮询）
   */
  function waitForElement(selector, timeout = CONFIG.ELEMENT_TIMEOUT) {
    return new Promise((resolve, reject) => {
      const start = Date.now();

      const timer = setInterval(() => {
        const el = document.querySelector(selector);

        if (el) {
          clearInterval(timer);
          resolve(el);
        }

        if (Date.now() - start > timeout) {
          clearInterval(timer);
          reject(new Error(`等待元素超时: ${selector}`));
        }
      }, 120); // 降低轮询频率
    });
  }

  /**
   * 判断字幕是否开启
   */
  function isSubtitleOn() {
    return Boolean(document.querySelector(SELECTORS.activeLangItem));
  }

  /**
   * 判断菜单是否可见
   */
  function isMenuVisible() {
    const panel = document.querySelector(SELECTORS.menuPanel);
    return panel && panel.offsetParent !== null;
  }

  /* ---------------- 核心逻辑 ---------------- */

  async function ensureMenuOpen() {
    if (isMenuVisible()) return;

    const btn = await waitForElement(SELECTORS.subtitleBtn);

    btn.click();

    await sleep(CONFIG.MENU_OPEN_DELAY);
  }

  async function turnOnSubtitle() {
    const langItem = document.querySelector(SELECTORS.langItem);

    if (!langItem) throw new Error('未找到字幕语言');

    langItem.click();

    log('字幕开启');
  }

  async function turnOffSubtitle() {
    const closeBtn = await waitForElement(SELECTORS.closeBtn);

    closeBtn.click();

    log('字幕关闭');
  }

  /**
   * 自动开启字幕
   */
  async function autoOpenSubtitle() {
    try {
      await waitForElement(SELECTORS.subtitleBtn);

      if (!isSubtitleOn()) {
        await ensureMenuOpen();

        await turnOnSubtitle();
      }
    } catch (err) {
      log('视频可能没有字幕:', err.message);
    }
  }

  /**
   * 快捷键切换
   */
  async function toggleSubtitle() {
    try {
      await ensureMenuOpen();

      if (isSubtitleOn()) {
        await turnOffSubtitle();
      } else {
        await turnOnSubtitle();
      }
    } catch (err) {
      log('快捷键失败:', err);
    }
  }

  /* ---------------- 快捷键监听 ---------------- */

  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;

    const inInput =
        /^(INPUT|TEXTAREA|SELECT)$/i.test(active.tagName) ||
        active.isContentEditable;

    if (inInput) return;

    if (
        e.code === CONFIG.KEY &&
        !e.repeat &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey
    ) {
      e.preventDefault();

      toggleSubtitle();
    }
  });

  /* ---------------- URL变化监听 ---------------- */

  let lastUrl = location.href;

  let debounceTimer = null;

  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;

      log('检测到视频切换');

      clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        autoOpenSubtitle();
      }, CONFIG.AUTO_DELAY);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  /* ---------------- 首次进入 ---------------- */

  setTimeout(() => {
    log('首次加载');

    autoOpenSubtitle();
  }, 2000);
})();

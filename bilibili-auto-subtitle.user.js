// ==UserScript==
// @name         B站自动字幕（快捷键 C & 自动开启）
// @namespace    https://github.com/Apixus/bilibili-auto-subtitle
// @version      2.1
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

  const STORAGE_KEY = 'BILIBILI_SUBTITLE_CUSTOM_KEY';

  /**
   * 获取用户自定义按键（默认 KeyC）
   */
  function getConfiguredKey() {
    return localStorage.getItem(STORAGE_KEY) || 'KeyC';
  }

  function saveConfiguredKey(code) {
    localStorage.setItem(STORAGE_KEY, code);
  }

  const CONFIG = {
    MENU_OPEN_DELAY: 200,
    AUTO_DELAY: 1500,
    ELEMENT_TIMEOUT: 8000,
  };

  /**
   * 按键码 → 可读名称（用于界面显示）
   */
  function keyCodeToDisplay(code) {
    const special = {
      Space: '空格', Enter: '回车', Escape: 'Esc',
      Tab: 'Tab', Backspace: '退格', Delete: '删除',
    };
    if (special[code]) return special[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Arrow')) return code.slice(5) + '方向键';
    if (code.startsWith('F') && code.length <= 3) return code;
    return code;
  }

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
      e.code === getConfiguredKey() &&
      !e.repeat &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      e.preventDefault();

      toggleSubtitle();
    }
  });

  /* ---------------- 按键设置 UI ---------------- */

  function createSettingsUI() {
    const container = document.createElement('div');
    container.id = 'bili-subtitle-settings';

    // 初始代码（显示给用户看）
    const initialKey = keyCodeToDisplay(getConfiguredKey());

    container.innerHTML = `
      <style>
        #bili-subtitle-settings{position:fixed;z-index:99999;top:80px;right:24px;font-family:'Microsoft YaHei','PingFang SC',sans-serif}
        #bili-subtitle-settings-btn{
          width:42px;height:42px;border-radius:50%;border:none;
          background:linear-gradient(135deg,#00a1d6,#00b5e5);
          color:#fff;font-size:20px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 12px rgba(0,161,214,.45);
          transition:transform .2s,box-shadow .2s;margin-left:auto;
          position:relative;z-index:1;
        }
        #bili-subtitle-settings-btn:hover{transform:scale(1.08);box-shadow:0 4px 20px rgba(0,161,214,.6)}
        #bili-subtitle-settings-btn:active{transform:scale(.95)}
        #bili-subtitle-settings-panel{
          display:none;position:absolute;top:52px;right:0;
          padding:20px;border-radius:14px;
          background:rgba(255,255,255,.78);
          color:#333;font-size:13px;
          min-width:230px;
          box-shadow:0 8px 32px rgba(0,0,0,.12);
          border:1px solid rgba(255,255,255,.5);
          backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
          z-index:99999;
        }
        #bili-subtitle-settings-panel.open{display:block}
        #bili-subtitle-settings-panel .header{
          font-size:14px;font-weight:600;color:#222;margin-bottom:16px;
          display:flex;align-items:center;gap:6px;
        }
        #bili-subtitle-settings-panel .row{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
        #bili-subtitle-settings-panel .label{color:#888;font-size:12px}
        #bili-subtitle-settings-panel .current-key{
          display:inline-flex;align-items:center;justify-content:center;
          min-width:42px;height:34px;padding:0 14px;border-radius:8px;
          background:linear-gradient(135deg,#00a1d6,#00b5e5);
          color:#fff;
          font-size:17px;font-weight:700;letter-spacing:.5px;
          box-shadow:0 2px 8px rgba(0,161,214,.3);
        }
        #bili-subtitle-settings-panel .divider{height:1px;background:rgba(0,0,0,.08);margin:14px 0}
        #bili-subtitle-settings-panel .btn{
          display:block;width:100%;padding:10px 0;border:none;border-radius:8px;
          background:linear-gradient(135deg,#00a1d6,#00b5e5);
          color:#fff;font-size:13px;font-weight:500;cursor:pointer;
          transition:transform .15s,box-shadow .15s;text-align:center;
          box-shadow:0 2px 8px rgba(0,161,214,.3);
        }
        #bili-subtitle-settings-panel .btn:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,161,214,.4)}
        #bili-subtitle-settings-panel .btn:active{transform:translateY(0)}
        #bili-subtitle-settings-panel .btn.recording{background:linear-gradient(135deg,#f25d8e,#ff7eb3);animation:recordPulse 1s infinite;box-shadow:0 2px 8px rgba(242,93,142,.3)}
        @keyframes recordPulse{50%{opacity:.78}}
        #bili-subtitle-settings-panel .status-msg{
          margin-top:12px;padding:8px 10px;border-radius:6px;
          font-size:12px;line-height:1.5;text-align:center;
          display:none;
        }
        #bili-subtitle-settings-panel .status-msg.success{display:block;background:rgba(0,200,83,.1);color:#2e7d32}
        #bili-subtitle-settings-panel .status-msg.recording-status{display:block;background:rgba(242,93,142,.1);color:#c62828}
        #bili-subtitle-settings-panel .hint{
          color:#999;font-size:11px;margin-top:10px;text-align:center;
        }
        #bili-subtitle-settings-panel .hint strong{color:#666;font-weight:500}
      </style>
      <div id="bili-subtitle-settings-panel">
        <div class="header">
          <span>⌨</span>
          <span>字幕快捷键设置</span>
        </div>
        <div class="row">
          <span class="label">当前快捷键</span>
          <span class="current-key" id="bili-subtitle-display-key">${initialKey}</span>
        </div>
        <div class="divider"></div>
        <button class="btn" id="bili-subtitle-record-btn">更改快捷键</button>
        <div class="status-msg" id="bili-subtitle-status-msg"></div>
        <div class="hint">按下 <strong>Esc</strong> 可取消录制 · 设置自动保存</div>
      </div>
      <button id="bili-subtitle-settings-btn" title="自定义字幕快捷键">⚙</button>
    `;
    document.body.appendChild(container);

    const panel = container.querySelector('#bili-subtitle-settings-panel');
    const gearBtn = container.querySelector('#bili-subtitle-settings-btn');
    const displayKey = container.querySelector('#bili-subtitle-display-key');
    const recordBtn = container.querySelector('#bili-subtitle-record-btn');
    const statusMsg = container.querySelector('#bili-subtitle-status-msg');

    let recording = false;
    let statusTimer = null;

    /* ---- 显示/隐藏 ---- */

    function openPanel() {
      panel.classList.add('open');
    }

    function closePanel() {
      panel.classList.remove('open');
      if (recording) {
        recording = false;
        updateRecordBtnState();
      }
      clearStatus();
    }

    /* ---- 状态消息 ---- */

    function showStatus(text, type) {
      clearStatus();
      statusMsg.textContent = text;
      statusMsg.className = 'status-msg';
      if (type) statusMsg.classList.add(type);
      statusTimer = setTimeout(clearStatus, 3000);
    }

    function clearStatus() {
      statusMsg.textContent = '';
      statusMsg.className = 'status-msg';
      if (statusTimer) { clearTimeout(statusTimer); statusTimer = null; }
    }

    /* ---- UI 更新 ---- */

    function updateDisplay() {
      displayKey.textContent = keyCodeToDisplay(getConfiguredKey());
    }

    function updateRecordBtnState() {
      recordBtn.textContent = recording ? '录制中 — 请按下新按键' : '更改快捷键';
      recordBtn.classList.toggle('recording', recording);
      if (recording) {
        showStatus('已进入录制模式，请按下你想要设置的新按键...\n按 Esc 可取消', 'recording-status');
      } else {
        clearStatus();
      }
    }

    /* ---- 齿轮按钮: 切换面板 ---- */

    gearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (panel.classList.contains('open')) {
        closePanel();
      } else {
        openPanel();
      }
    });

    /* ---- 点击外部关闭面板 ---- */

    document.addEventListener('click', (e) => {
      if (!panel.classList.contains('open')) return;
      if (container.contains(e.target)) return;
      closePanel();
    });

    /* ---- 录制按钮 ---- */

    recordBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (recording) {
        // 已在录制中 → 点击取消录制
        recording = false;
        updateRecordBtnState();
        return;
      }
      recording = true;
      updateRecordBtnState();
    });

    /* ---- 键盘事件: 录制新键 / Esc取消 / 关闭 ---- */

    document.addEventListener('keydown', (e) => {
      // Esc 关闭面板
      if (e.code === 'Escape' && panel.classList.contains('open') && !recording) {
        closePanel();
        return;
      }

      if (!recording) return;

      // 录制中按 Esc 取消
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        recording = false;
        updateRecordBtnState();
        showStatus('已取消设置', '');
        return;
      }

      // 录制新按键
      e.preventDefault();
      e.stopPropagation();

      const newCode = e.code;
      saveConfiguredKey(newCode);
      recording = false;
      updateDisplay();
      updateRecordBtnState();
      showStatus(`✓ 快捷键已设置为 ${keyCodeToDisplay(newCode)}（${newCode}）`, 'success');
      log('快捷键已设置为:', newCode, `(${keyCodeToDisplay(newCode)})`);
    }, true);

    updateDisplay();
    log('按键设置 UI 已创建');
  }

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

    createSettingsUI();
  }, 2000);
})();

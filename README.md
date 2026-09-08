

# B站自动字幕

一个便捷的B站字幕控制用户脚本，支持快捷键切换和自动开启字幕。

## 功能特点

- 🎯 **快捷键切换**: 按快捷键快速**开启/关闭**字幕（默认 `C` 键）
- 🎛️ **自定义按键**: 支持将快捷键改为任意键（数字键、字母键等），点击页面右上角 ⚙ 按钮即可设置
- ✨ **毛玻璃面板**: 设置面板采用玻璃拟态设计，半透明模糊背景，美观易用
- 🔄 **自动开启**: 切换视频时自动打开字幕（支持分P、推荐视频等）
- 🆕 **最新适配**: 专为B站2026最新版优化
- ⚡ **性能优化**: 使用 MutationObserver 智能监听，告别轮询卡顿
- 🛡️ **防冲突**: 智能检测输入框状态，避免与页面输入冲突
- 🔧 **模块化**: 代码结构清晰，易于维护扩展

## 安装方法

### 第一步：安装用户脚本管理器

- **Tampermonkey**: [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) | [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- **Violentmonkey**: [Chrome](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag) | [Edge](https://microsoftedge.microsoft.com/addons/detail/violentmonkey/eeagobfjdenkkddmbclomhiblgggliao) | [Firefox](https://addons.mozilla.org/firefox/addon/violentmonkey/)

### 第二步：安装脚本

点击这里安装: [安装脚本](https://github.com/Apixus/bilibili-auto-subtitle/blob/main/bilibili-auto-subtitle.user.js)

## 使用方法

1. 访问任意B站视频页面
2. 按 `C` 键（默认）**切换**字幕显示状态
3. 点击页面右上角 ⚙ 按钮，可**自定义快捷键**为任意按键（如数字键 `1` `2` `3` 等）。点击面板外部或按 `Esc` 键可关闭面板或取消录制
4. 切换分P或点击推荐视频时，字幕会自动开启

## 技术特性

- **智能 DOM 查询**: 自动等待元素加载，超时友好提示
- **状态感知**: 自动检测当前字幕开启状态，避免重复操作
- **防抖优化**: URL 变化防抖处理，避免频繁触发
- **异步架构**: 使用 async/await 替代回调，逻辑更清晰
- **快捷键保护**: 自动拦截默认行为，防止页面跳转

## 更新日志

### v2.1 (2026-06-06)

- ✨ **新增**: 支持**自定义快捷键**，点击页面右上角 ⚙ 按钮即可设置为任意按键
- ✨ **新增**: 玻璃拟态设置面板，录制式交互，按下即生效
- ✨ **新增**: 点击面板外部自动关闭，Esc 键支持关闭/取消录制
- 🔧 **存储**: 设置保存在浏览器本地，下次访问自动沿用
- 💄 **优化**: 面板采用半透明毛玻璃设计，适配浅色主题

### v2.0 (2026-03-05)

- ✨ **新增**: 快捷键支持**关闭**字幕（原仅支持开启）
- 🚀 **优化**: 重写 URL 监听机制，使用 MutationObserver 替代轮询
- 🚀 **优化**: 新增智能元素等待函数，提升稳定性
- 🐛 **修复**: 增加 SELECT 和富文本编辑器的输入检测
- 🐛 **修复**: 快捷键现在正确阻止默认浏览器行为
- 🔧 **重构**: 代码模块化，提取 CONFIG/SELECTORS 配置

### v1.0 (2025-09-20)

- 适配B站2025年新版播放器
- 实现快捷键和自动开启功能

## 问题反馈

如果遇到任何问题，请到 [Issues](https://github.com/Apixus/bilibili-auto-subtitle/issues) 页面反馈。

## 贡献

欢迎提交 Pull Request 或提出建议！

## 许可证

MIT License

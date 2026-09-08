# B站自动字幕增强版

按 C 键切换字幕开启/关闭，视频加载时自动开启字幕。专为B站2025最新版优化。

## 功能

- **快捷键切换** — 按 `C` 键一键开启/关闭字幕
- **自动开启** — 进入视频页或切换分P时自动打开字幕
- **真正关闭** — 按 C 键禁用时会实际关闭字幕面板（v1.4 修复）
- **状态记忆** — 开关状态保存在 localStorage，刷新页面后保持

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)
2. 点击安装：[bilibili-auto-subtitle.user.js](https://github.com/kitsuneMori96/bilibili-auto-subtitle/raw/main/bilibili-auto-subtitle.user.js)

## 使用

| 操作 | 效果 |
|------|------|
| 打开视频页 | 字幕自动开启 |
| 按 `C` 键 | 关闭字幕 |
| 再按 `C` 键 | 重新开启字幕 |
| 切换分P | 字幕自动重新开启 |

## 调试接口

在控制台可调用：

```js
bilibiliAutoSubtitle.getStatus()   // 返回 true/false
bilibiliAutoSubtitle.toggle()      // 切换开关
bilibiliAutoSubtitle.openNow()     // 立即开启字幕
bilibiliAutoSubtitle.closeNow()    // 立即关闭字幕
```

## 更新日志

### v1.4
- **修复**: 按 C 键禁用时真正关闭字幕（之前只改状态不关闭面板）
- **新增**: `closeSubtitle()` 函数，点击 `.bpx-player-ctrl-subtitle-close-switch`
- **改进**: `isSubtitleOn()` 增加语言选项激活状态检测

### v1.3
- 适配B站2025最新版播放器
- 支持 C 键切换 + 自动开启

## 许可证

MIT

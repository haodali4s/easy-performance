# Monitor Monorepo

一个性能监控并上报的小工具，包含核心监控 SDK 和配套的可视化 Dashboard，支持个性化选择监控指标和自定义监控阈值。

### ✨ 特性

支持如下指标监控

- **加载与渲染 (Loading & Rendering)**: FP, FCP, LCP, Load, TTFB
- **交互响应 (Interaction)**: FID, INP, Long Task
- **视觉稳定性 (Visual Stability)**: CLS
- **资源与网络 (Resource & Network)**: 静态资源加载耗时, API 请求耗时
- **数据上报**: 支持自动上报性能数据到指定服务器

### 🚀 快速开始

## 📦 安装

```bash
# npm
npm install easy-performance

# yarn
yarn add easy-performance

# pnpm
pnpm add easy-performance
```

## 🛠 使用方法

`easy-performance` 提供了一个开箱即用的 React 组件，只需将其添加到你的应用根节点即可。

```tsx
import PerformanceDebugger from "easy-performance";

function App() {
  return (
    <div>
      {/* 你的其他业务组件 */}

      {/* 将监控组件放在应用的最外层 */}
      <PerformanceDebugger />
    </div>
  );
}

export default App;
```

启动应用后，你会在屏幕右下角看到一个悬浮图标：

1. **点击图标**：首次点击会打开配置面板，可选择需要监控的指标（FCP, LCP, INP, Network 等）及自定义阈值。
2. **开始监控**：配置完成后点击 "开始监控"，SDK 将自动采集数据。
3. **查看数据**：再次点击图标即可实时查看各项性能指标的卡片展示。

无需额外配置 `PerformanceMonitor` SDK，该组件会自动管理 SDK 的初始化与数据上报。

import { useState } from "react";
import "./index.css";
import PerformanceDebugger from "D:/front/学工程化/rollup/packages/dashboard/dist/easy-performance.es.js";

// 独立的监控报告页面组件
// 这个组件会渲染到一个全新的 Window 中

function App() {
  const [clsBlock, setClsBlock] = useState(false);

  const triggerData = () => {
    fetch("https://jsonplaceholder.typicode.com/todos/1");
  };

  const simulateSlowInteraction = () => {
    const start = performance.now();
    while (performance.now() - start < 300) {
      // Block main thread for 300ms to simulate slow INP
    }
    console.log("Slow interaction finished");
  };

  const triggerCLS = () => {
    // 延迟 1秒，避开 hadRecentInput 判定
    // 浏览器会自动忽略用户交互后 500ms 内发生的布局偏移
    setTimeout(() => {
      setClsBlock((v) => !v);
    }, 1000);
  };

  return (
    <div style={{ padding: 40 }}>
      {clsBlock && (
        <div
          style={{
            height: 200,
            background: "orange",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1>CLS Block (Layout Shift)</h1>
        </div>
      )}
      <h1>App Running</h1>
      <p>
        Interact with the page to generate metrics, then drag & click the
        floating icon.
      </p>
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <button onClick={triggerData}>Trigger Network Request</button>
        <button onClick={simulateSlowInteraction}>
          Trigger Slow INP (Block 300ms)
        </button>
        <button
          onClick={triggerCLS}
          style={{ background: "#ff9800", color: "white" }}
        >
          Trigger CLS (Wait 1s)
        </button>
      </div>
      {/* Floating Debugger */}、
      <PerformanceDebugger />
    </div>
  );
}

export default App;

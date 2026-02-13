// src/loading/LCP.ts
import { getSelector } from "../../util/";

export function startLCP(report: (data: any) => void) {
  let lcpEntry: PerformanceEntry | undefined;
  let hasReported = false;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // 记录最新的 LCP 候选值
      lcpEntry = entry;
    }
  });
  observer.observe({ type: "largest-contentful-paint", buffered: true });
  const sendReport = () => {
    if (hasReported || !lcpEntry) return;
    hasReported = true;
    const json = (lcpEntry as any).toJSON();
    const reportData = {
      ...json,
      value: lcpEntry.startTime,
      elementSelector: getSelector((lcpEntry as any).element),
      type: "performance",
      name: "LCP",
      pageUrl: window.location.href,
    };
    report(reportData);
  };

  // 页面隐藏或用户首次交互时，上报最终 LCP
  const onHidden = () => {
    if (document.visibilityState === "hidden") sendReport();
  };

  // 监听页面显示隐藏
  document.addEventListener("visibilitychange", onHidden, { once: true });
  window.addEventListener("pagehide", sendReport, { once: true });
  // 监听用户交互
  ["click", "keydown", "pointerdown"].forEach((type) => {
    window.addEventListener(type, sendReport, { once: true, capture: true });
  });

  return () => {
    observer.disconnect();
    document.removeEventListener("visibilitychange", onHidden);
  };
}
/*
它是动态变化的：LCP 代表视口内最大内容的渲染时间。不同于 FP/FCP 一次定音，LCP 是渐进式的。随着图片加载或字体渲染，更大的内容可能随后出现，浏览器会不断更新 LCP 候选值。


什么时候“定格”？ 浏览器会在用户首次交互（点击、按键）或页面隐藏时，停止产生新的 LCP。因此，我们不能抓到一个就上报，而是要监听这些“停止信号”，取最后一次候选值作为最终结果。


光有时间不够：老板问你“为什么慢”，你不能光给个时间。我们需要利用 element 属性计算出 CSS 选择器，精准定位是哪张图或哪段文字拖了后腿。

*/

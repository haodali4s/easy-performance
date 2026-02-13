export function startFID(report: (data: any) => void) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // 核心公式：处理开始时间 - 点击时间 = 延迟时间
      const delay =
        (entry.processingStart || entry.startTime) - entry.startTime;
      report({
        type: "performance",
        name: "FID",
        value: delay,
        target: getSelector(entry.target),
        startTime: entry.startTime,
      });
      observer.disconnect(); // FID 只看第一下，拿到就撤
    }
  });
  observer.observe({ type: "first-input", buffered: true });
  return () => observer.disconnect();
}

function getSelector(el: any) {
  if (el instanceof Element) {
    return (
      el.tagName +
      (el.id ? "#" + el.id : "") +
      (el.className ? "." + el.className : "")
    );
  }
  return "";
}

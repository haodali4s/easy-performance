export function startLongTask(
  threshold: number,
  report: (data: any) => void,
  isBuffered: boolean = true,
) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > threshold) {
        // 抓到个慢的！看看是谁
        // attribution里面藏着“罪魁祸首”的名字,通常包含：name(self/iframe), containerType(iframe/embed), containerSrc
        // 虽不能精确到具体函数，但能帮你区分是“自己写的代码慢”还是“第三方插件慢”
        // 如果类型是 'window'，说明是当前主页面（你的代码）卡了；如果是 'iframe'，那就是广告或插件卡了
        report({
          type: "performance",
          name: "LongTask",
          duration: entry.duration,
          attribution: (entry as any).attribution,
          startTime: entry.startTime,
        });
      }
    }
  });
  // 开启监听，buffered 同样重要
  observer.observe({ type: "longtask", buffered: isBuffered });
  return () => observer.disconnect();
}
//拆分任务：把一次性的大计算拆成多个小段，并在每段之间主动“让路”。常用手段：setTimeout(0) 切片、requestAnimationFrame 在绘制后继续、requestIdleCallback 在空闲期执行、重度计算迁移到 Web Worker。注意：requestIdleCallback 在后台标签页会被强烈限速，不适合关键路径。

// src/loading/FP.ts

export const startFPFPC = (report: (data: any) => void) => {
  const handler = (list: PerformanceObserverEntryList) => {
    for (const entry of list.getEntries()) {
      if (
        entry.name === "first-contentful-paint" ||
        entry.name === "first-paint"
      ) {
        if (entry.name === "first-contentful-paint") {
          observer.disconnect(); // FP PCP一辈子只发生一次，抓到就撤，省内存
        }
        const json = entry.toJSON();
        // 简单的名称映射用于日志
        const nameMap: Record<string, string> = {
          "first-paint": "FP",
          "first-contentful-paint": "FCP",
        };

        const reportData = {
          ...json,
          type: "performance",
          name: nameMap[entry.name],
          value: entry.startTime,
          pageUrl: window.location.href,
        };
        report(reportData);
      }
    }
  };
  const observer = new PerformanceObserver(handler); // 1. 创建观测者
  observer.observe({ type: "paint", buffered: true }); // 2. 开始蹲守 'paint' 频道 buffered: true 是关键，确保能拿到 SDK 初始化之前的记录
  return () => observer.disconnect(); // 3. 返回清理函数
};

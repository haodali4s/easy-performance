export function startTTFB(report: (data: any) => void) {
  // 监听导航条目
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();

    // 只取第一个导航条目
    for (const entry of entries) {
      if (entry.entryType === "navigation") {
        const navEntry = entry as PerformanceNavigationTiming;

        // 计算 TTFB: responseStart - requestStart
        // 实际上 responseStart 已经是相对于 navigationStart 的时间
        // 但通常我们也关心它相对于请求开始的耗时，或者直接用 responseStart 代表用户感知的首字节时间
        const ttfb = navEntry.responseStart - navEntry.startTime;

        const reportData = {
          type: "performance",
          subType: "TTFB",
          name: "TTFB",
          value: ttfb,
          pageUrl: window.location.href,
          serviceWorkerTime:
            navEntry.workerStart > 0
              ? navEntry.responseEnd - navEntry.workerStart
              : 0,
          dnsTime: navEntry.domainLookupEnd - navEntry.domainLookupStart,
          tcpTime: navEntry.connectEnd - navEntry.connectStart,
        };

        report(reportData);

        // 获取到后断开连接
        observer.disconnect();
      }
    }
  });

  observer.observe({ type: "navigation", buffered: true });
  return () => observer.disconnect();
}

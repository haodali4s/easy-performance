export function startRequest(
  threshold: number,
  report: (data: any) => void,
  isBuffered: boolean = true,
  excludeUrl?: string, // 新增参数：需要排除的上报接口地址
) {
  const entryHandler = (list: PerformanceObserverEntryList) => {
    const data = list.getEntries();
    for (const entry of data as unknown as PerformanceResourceTiming[]) {
      // 过滤掉上报接口自身的请求，防止无限循环
      if (excludeUrl && entry.name.includes(excludeUrl)) {
        continue;
      }
      // 过滤出 API 请求 (Fetch 和 XHR)
      if (
        (entry.initiatorType === "fetch" ||
          entry.initiatorType === "xmlhttprequest" ||
          entry.initiatorType === "beacon") &&
        entry.duration > threshold // 阈值：只上报超过阈值的慢请求
      ) {
        const reportData = {
          name: "Request",
          target: entry.name, // 接口地址
          type: "performance", // 日志类型
          subType: entry.entryType, // 资源类型 (resource)
          sourceType: entry.initiatorType, // 发起方式 (fetch/xhr)
          duration: entry.duration, // 总耗时
          dns: entry.domainLookupEnd - entry.domainLookupStart, // DNS 耗时
          tcp: entry.connectEnd - entry.connectStart, // TCP 耗时
          ttfb: entry.responseStart - entry.requestStart, // 首字节响应时间 (TTFB)
          transferSize: entry.transferSize, // 传输体积
          startTime: entry.startTime, // 开始时间
          pageUrl: window.location.href, // 当前页面 URL
        };
        report(reportData);
      }
    }
  };

  // 这里不调用 disconnect()，以便持续监听后续产生的网络请求
  const observer = new PerformanceObserver(entryHandler);
  observer.observe({ type: "resource", buffered: isBuffered });
  return () => observer.disconnect();
}

export function startEntries(
  threshold: number,
  report: (data: any) => void,
  isBuffered: boolean = true,
) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as unknown as PerformanceResourceTiming[]) {
      // resource 类型包含了 img, script, css, fetch, xmlhttprequest, link 等
      // 我们这里排除 fetch 和 xmlhttprequest，因为它们在 startRequest 中单独处理
      if (
        entry.entryType === "resource" &&
        entry.initiatorType !== "fetch" &&
        entry.initiatorType !== "xmlhttprequest" &&
        entry.initiatorType !== "beacon" &&
        entry.duration > threshold // 阈值：只上报超过阈值的慢资源
      ) {
        report({
          resourceName: entry.name,
          name: "Resource",
          initiatorType: entry.initiatorType,
          duration: entry.duration,
          startTime: entry.startTime,
        });
      }
    }
  });
  // 同样记得 buffered: true，防止漏掉页面刚开始加载的那些资源
  observer.observe({ type: "resource", buffered: isBuffered });
  return () => observer.disconnect();
}

/**
entryType === 'resource'：这个频道包罗万象。图片 (img)、样式 (css)、脚本 (script) 甚至你的接口调用 (fetch/xmlhttprequest) 都在这儿。
initiatorType：这个字段告诉你资源是谁发起的。是 <img src="..."> 发起的？还是 fetch() 发起的？一看便知。

 */

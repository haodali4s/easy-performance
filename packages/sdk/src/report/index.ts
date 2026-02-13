export const report = (data: Record<string, any>, url: string) => {
  if (!url) return;
  // 1. 包装数据：加上一些公共信息（比如 UserAgent，屏幕分辨率等）
  const dataToSend = {
    ...data,
    userAgent: navigator.userAgent,
    // screenWidth: window.screen.width, // 可选
  };
  // 2. 优先使用 sendBeacon (最稳，且不阻塞)
  // 注意：sendBeacon 不支持自定义 Content-Type，默认是 text/plain
  // 这里用 Blob 强制指定为 application/json
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(dataToSend)], {
      type: "application/json",
    });
    // sendBeacon 返回 true 表示进入队列成功
    navigator.sendBeacon(url, blob);
    return;
  } else {
    // 3. 降级方案：使用 fetch + keepalive
    // 即使页面关闭，keepalive 也能保证请求发出
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
      keepalive: true, // <--- 关键参数！防止页面关闭时请求被杀
    }).catch((err) => {
      console.error("上报失败:", err);
    });
  }
};

// 定义 LayoutShift 接口，因为标准库可能还未包含完整定义
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

export function startCLS(
  report: (data: any) => void,
  initialCLS: number = 0,
  buffered: boolean = true,
) {
  let clsValue = initialCLS;
  let sessionValue = 0;
  let gap = 1000;
  let maxDuration = 5000;
  let sessionEntries: LayoutShift[] = []; // 调试用，也没坏处

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as unknown as LayoutShift[]) {
      // 核心：剔除用户交互（点击/输入）导致的预期偏移
      if (!entry.hadRecentInput) {
        const firstEntry = sessionEntries[0];
        const lastEntry = sessionEntries[sessionEntries.length - 1];

        // 判定是否属于当前会话：
        // 1. 如果是第一条，直接加入
        // 2. 距离上一条 < 1s 且 距离第一条 < 5s
        if (
          sessionValue > 0 &&
          entry.startTime - lastEntry.startTime < gap &&
          entry.startTime - firstEntry.startTime < maxDuration
        ) {
          sessionValue += entry.value;
          sessionEntries.push(entry);
        } else {
          // 此时我们必须“结算”上一个窗口的总分。如果上一个窗口的总分 (sessionValue) 是历史最高的，我们就把它更新为当前的 CLS 值并上报。
          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            report({
              type: "performance",
              name: "CLS",
              value: clsValue,
            });
          }
          // 重置
          sessionValue = entry.value;
          sessionEntries = [entry];
        }
        // 实时更新最大值，因为如果当前正在进行且还没断开，可能已经超过之前最大的了
        if (sessionValue > clsValue) {
          clsValue = sessionValue;
          report({
            type: "performance",
            name: "CLS",
            value: clsValue,
          });
        }
      }
    }
  });
  observer.observe({ type: "layout-shift", buffered });

  const sendReport = () => {
    report({
      type: "performance",
      name: "CLS",
      value: clsValue,
    });
  };

  // 双重保险：兼容各类浏览器的卸载场景
  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") sendReport();
  };

  window.addEventListener("pagehide", sendReport, { once: true });
  document.addEventListener("visibilitychange", onVisibilityChange, {
    once: true,
  });

  return () => {
    observer.disconnect();
    window.removeEventListener("pagehide", sendReport);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}

/**
 * 为啥要监听两个卸载事件？
visibilitychange 和 pagehide 都是用来监听页面关闭/隐藏的。为啥要搞两个？
因为浏览器脾气不一样：有的喜欢 pagehide（比如 Safari），有的推荐 visibilitychange。
为了保证数据不丢，咱们搞个“双保险”，谁先触发就算谁的。

为啥不用 beforeunload？
早年间确实流行用 beforeunload 或 unload，但现在它们不靠谱了，尤其是在手机上。
用户直接划掉 App、切后台，这些事件经常不会触发。
而且它还会阻止浏览器做“往返缓存”（BFCache），拖慢页面后退速度。所以现在的标准姿势就是 visibilitychange + pagehide。

 */

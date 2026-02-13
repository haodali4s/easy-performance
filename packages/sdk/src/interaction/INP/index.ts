export function startINP(
  durationThreshold: number,
  report: (data: any) => void,
  maxValue: number = 0,
  enableBuffered: boolean = true,
) {
  // 记录当前的 INP 值（最长的一次交互耗时），如果有历史值，从历史值开始，避免 resume 后归零
  let inpValue = maxValue;
  // 记录最长交互的目标元素（用于调试）
  let inpTarget = null;
  // 用于存储由于“同一次交互触发多个事件”时的最大耗时
  // Key: interactionId, Value: { duration, entries }
  const interactionMap = new Map();

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();

    for (const entry of entries) {
      // 1. 过滤掉没有 interactionId 的事件
      // Scroll 和 Hover 事件通常 interactionId 为 0 或 undefined，不属于 INP 范畴
      if (!entry.interactionId) continue;
      // 2. 聚合逻辑：处理同一个交互的多个阶段
      // 比如点击按钮可能会由 pointerdown, mouseup, click 组成
      // 它们共享同一个 interactionId，我们取其中 duration 最大的一个
      let interaction = interactionMap.get(entry.interactionId);
      if (!interaction) {
        interaction = { duration: 0, entries: [] };
        interactionMap.set(entry.interactionId, interaction);
      }
      interaction.entries.push(entry);
      // 如果当前事件的耗时比同 ID 下的其他事件长，更新该交互的耗时
      if (entry.duration > interaction.duration) {
        interaction.duration = entry.duration;

        interaction.target = entry.target;
      }
      // 3. 更新全局 INP (寻找页面生命周期内最差的一次)
      if (interaction.duration > inpValue) {
        inpValue = interaction.duration;
        inpTarget = interaction.target;
        // 🟢 只有当 INP 变差（创新高）时才上报/打印
        report({
          type: "performance",
          name: "INP",
          value: Math.round(inpValue),
          interactionId: entry.interactionId,
          eventType: entry.name,
          target: inpTarget,
        });
      }
    }
  });

  observer.observe({
    type: "event",
    durationThreshold,
    buffered: enableBuffered,
  } as any);
  return () => observer.disconnect();
}
//INP 代码：type: 'event'。这里我们不断监听，不断打 log。实际场景里，你需要维护一个数组，把耗时最长的几次交互存下来，最后上报那个最慢的。
//durationThreshold: 16：这是个优化参数。意思是“小于 16ms（一帧）的交互我就不看了”，省得数据太多刷屏。

/**
 要准确计算 INP，核心逻辑在于：
只关注有 interactionId 的事件（排除 scroll、hover 等非交互事件）。
去重与聚合：一次点击通常会触发多个事件（如 pointerdown, mousedown, pointerup, click），它们拥有同一个 interactionId。我们需要取这组事件中耗时最长的那个作为该次交互的耗时。
取最大值：在页面生命周期内，记录耗时最长的那次交互（即 INP）。
 */

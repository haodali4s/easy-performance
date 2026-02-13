export declare function startINP(durationThreshold: number, report: (data: any) => void): void;
/**
 要准确计算 INP，核心逻辑在于：
只关注有 interactionId 的事件（排除 scroll、hover 等非交互事件）。
去重与聚合：一次点击通常会触发多个事件（如 pointerdown, mousedown, pointerup, click），它们拥有同一个 interactionId。我们需要取这组事件中耗时最长的那个作为该次交互的耗时。
取最大值：在页面生命周期内，记录耗时最长的那次交互（即 INP）。
 */

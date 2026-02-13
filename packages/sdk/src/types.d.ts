interface PerformanceEntry {
  processingStart?: number;
  interactionId?: number;
  target?: unknown;
}

interface PerformanceObserverInit {
  durationThreshold?: number;
}

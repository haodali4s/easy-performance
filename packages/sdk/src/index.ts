// src/index.ts

import { startFPFPC, startLCP, startLoad, startTTFB } from "./loading/";
import { startFID, startINP, startLongTask } from "./interaction";
import { startCLS } from "./visualStability";
import { startEntries, startRequest } from "./network";
import { Reporter } from "./reporter";

interface Options {
  resourceThreshold?: number;
  requestThreshold?: number;
  inpThreshold?: number;
  longTaskThreshold?: number;
  reportUrl?: string; // 上报地址
}
export default class PerformanceMonitor {
  options!: Options;
  reporter!: Reporter;
  static instance: PerformanceMonitor | null = null;

  constructor() {
    // 如果已经有实例，直接返回
    if (PerformanceMonitor.instance) {
      return PerformanceMonitor.instance;
    }
    this.reporter = new Reporter();
    this.metricsStatus = new Map();
    PerformanceMonitor.instance = this;

    // 立即监听 Load，确保不漏掉早期事件
    const collect = this.reporter.collect.bind(this.reporter);
    this.loadCleanup = startLoad((data) => {
      if (!this.metricsStatus.has("Load")) {
        collect(data);
        this.metricsStatus.set("Load", 0);
      }
    });
  }

  cleanups: Function[] = [];
  metricsStatus: Map<string, number> = new Map();
  private loadCleanup: Function | null = null;

  init(
    options: Options = {
      resourceThreshold: 500,
      requestThreshold: 500,
      inpThreshold: 24,
      longTaskThreshold: 50,
    },
  ) {
    this.options = { ...options };
    if (this.options.reportUrl) {
      this.reporter.setReportUrl(this.options.reportUrl.trim());
    }
    this.scan(true);
    console.log("Performance Monitor Initialized");
  }

  // 重置并应用新配置
  reset(newOptions: Options) {
    this.stop();
    this.clearMetrics(["INP", "LongTask", "Resource", "Request"]);
    this.options = { ...this.options, ...newOptions };
    if (this.options.reportUrl) {
      this.reporter.setReportUrl(this.options.reportUrl.trim());
    }
    this.resume();
  }

  scan(enableBuffered: boolean = true) {
    // 避免重复监听
    if (this.cleanups.length > 0) return;

    const collect = this.reporter.collect.bind(this.reporter);
    // 1. 页面加载与渲染 (Loading & Rendering)
    if (!this.metricsStatus.has("FCP")) {
      this.cleanups.push(
        startFPFPC((data) => {
          if (!this.metricsStatus.has(data.name)) {
            collect(data);
            this.metricsStatus.set(data.name, 0);
          }
        }),
      );
    }
    if (!this.metricsStatus.has("LCP")) {
      this.cleanups.push(
        startLCP((data) => {
          collect(data, true);
          this.metricsStatus.set("LCP", data.value);
        }),
      );
    }
    // 检查 Load 是否已由构造函数启动 (loadCleanup) 或已完成 (metricsStatus)
    if (!this.metricsStatus.has("Load") && !this.loadCleanup) {
      this.cleanups.push(
        startLoad((data) => {
          if (!this.metricsStatus.has("Load")) {
            collect(data);
            this.metricsStatus.set("Load", 0);
          }
        }),
      );
    }
    if (!this.metricsStatus.has("TTFB")) {
      this.cleanups.push(
        startTTFB((data) => {
          if (!this.metricsStatus.has("TTFB")) {
            collect(data);
            this.metricsStatus.set("TTFB", 0);
          }
        }),
      ); //为啥加两次判断 防止buffered=true然后重复上报
    }
    // // 2. 交互响应 (Interaction)
    if (!this.metricsStatus.has("FID")) {
      this.cleanups.push(
        startFID((data) => {
          if (!this.metricsStatus.has("FID")) {
            collect(data);
            this.metricsStatus.set("FID", 0);
          }
        }),
      );
    }
    const maxINP = this.metricsStatus.get("INP") || 0;
    this.cleanups.push(
      startINP(
        this.options.inpThreshold!,
        (data) => {
          collect(data, true);
          this.metricsStatus.set("INP", data.value);
        },
        maxINP,
        enableBuffered,
      ),
    ); //inp需要用到历史值
    this.cleanups.push(
      startLongTask(this.options.longTaskThreshold!, collect, enableBuffered),
    );
    // // 3. 视觉稳定性 (Visual Stability)
    const maxCLS = this.metricsStatus.get("CLS") || 0;
    this.cleanups.push(
      startCLS(
        (data) => {
          collect(data);
          this.metricsStatus.set("CLS", data.value);
        },
        maxCLS,
        enableBuffered,
      ),
    );
    // // 4. 资源与网络 (Resource & Network)
    // 默认阈值为 1000ms，也可通过入参自定义配置
    this.cleanups.push(
      startEntries(this.options.resourceThreshold!, collect, enableBuffered),
    );
    this.cleanups.push(
      startRequest(
        this.options.requestThreshold!,
        collect,
        enableBuffered,
        this.options.reportUrl,
      ),
    );
  }

  stop() {
    this.cleanups.forEach((fn) => fn && fn());
    this.cleanups = [];
    if (this.loadCleanup) {
      this.loadCleanup();
      this.loadCleanup = null;
    }
    console.log("Performance Monitor Stopped");
  }

  resume() {
    this.scan(false);
    console.log("Performance Monitor Resumed");
  }

  getMetrics() {
    return this.reporter.getMetrics();
  }

  clearMetrics(keys: string[]) {
    this.reporter.clearMetrics(keys);
    keys.forEach((key) => {
      this.metricsStatus.delete(key);
    });
  }
}

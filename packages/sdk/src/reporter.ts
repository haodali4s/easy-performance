/**
 * @file reporter.ts
 * @description 核心数据收集器，负责存储和管理性能指标
 */
import { report } from "./report";

export interface Metric {
  name: string;
  type: "performance" | "error" | "resource" | string;
  value?: number;
  duration?: number;
  startTime?: number;
  pageUrl?: string;

  // Interaction (INP)
  interactionId?: number;
  eventType?: string;
  target?: string | any;

  // LongTask
  attribution?: any[];

  // Resource / Network
  resourceName?: string;
  initiatorType?: string;
  subType?: string;
  sourceType?: string;
  dns?: number;
  tcp?: number;
  ttfb?: number;
  transferSize?: number;

  // LCP
  lcpTime?: number;
  elementSelector?: string;

  [key: string]: any;
}

export class Reporter {
  private metrics: Record<string, Metric[]> = {};
  private reportUrl?: string;

  constructor() {
    this.metrics = {};
  }

  public setReportUrl(url: string) {
    this.reportUrl = url;
  }

  /**
   * 收集单个指标
   * @param data 性能数据
   */
  public collect(data: Metric, rewrite: boolean = false): void {
    if (rewrite) {
      this.metrics[data.name] = [data];
    } else {
      if (!this.metrics[data.name]) {
        this.metrics[data.name] = [];
      }
      this.metrics[data.name].push(data);
    }

    if (this.reportUrl) {
      report(data, this.reportUrl);
    }
  }

  /**
   * 获取所有收集到的指标
   */
  public getMetrics(): Record<string, Metric[]> {
    return this.metrics;
  }

  /**
   * 清空指标队列
   */
  public clear(): void {
    this.metrics = {};
  }

  /**
   * 清空指定类型的指标
   * @param keys 要清空的指标名称列表
   */
  public clearMetrics(keys: string[]): void {
    keys.forEach((key) => {
      delete this.metrics[key];
    });
  }
}

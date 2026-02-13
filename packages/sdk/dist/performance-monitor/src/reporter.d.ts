/**
 * @file reporter.ts
 * @description 核心数据收集器，负责存储和管理性能指标
 */
export interface Metric {
    name: string;
    type: 'performance' | 'error' | 'resource' | string;
    value?: number;
    duration?: number;
    startTime?: number;
    pageUrl?: string;
    interactionId?: number;
    eventType?: string;
    target?: string | any;
    attribution?: any[];
    resourceName?: string;
    initiatorType?: string;
    subType?: string;
    sourceType?: string;
    dns?: number;
    tcp?: number;
    ttfb?: number;
    transferSize?: number;
    lcpTime?: number;
    elementSelector?: string;
    [key: string]: any;
}
export declare class Reporter {
    private metrics;
    constructor();
    /**
     * 收集单个指标
     * @param data 性能数据
     */
    collect(data: Metric): void;
    /**
     * 获取所有收集到的指标
     */
    getMetrics(): Record<string, Metric[]>;
    /**
     * 清空指标队列
     */
    clear(): void;
}

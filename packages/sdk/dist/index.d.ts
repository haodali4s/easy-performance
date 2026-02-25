import { Reporter } from "./reporter";
interface Options {
    resourceThreshold?: number;
    requestThreshold?: number;
    inpThreshold?: number;
    longTaskThreshold?: number;
    reportUrl?: string;
}
export default class PerformanceMonitor {
    options: Options;
    reporter: Reporter;
    static instance: PerformanceMonitor | null;
    constructor();
    cleanups: Function[];
    metricsStatus: Map<string, number>;
    private loadCleanup;
    init(options?: Options): void;
    reset(newOptions: Options): void;
    scan(enableBuffered?: boolean): void;
    stop(): void;
    resume(): void;
    getMetrics(): Record<string, import("./reporter").Metric[]>;
    clearMetrics(keys: string[]): void;
}
export {};

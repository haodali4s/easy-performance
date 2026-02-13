import { Reporter } from "./reporter";
interface Options {
    resourceThreshold?: number;
    requestThreshold?: number;
    inpThreshold?: number;
    longTaskThreshold?: number;
}
export default class PerformanceMonitor {
    options: Options;
    reporter: Reporter;
    constructor(options?: Options);
    init(): void;
    getMetrics(): Record<string, import("./reporter").Metric[]>;
}
export {};

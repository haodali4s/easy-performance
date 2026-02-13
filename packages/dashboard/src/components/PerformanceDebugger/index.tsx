import React, { useState, useRef, useEffect } from "react";
import PerformanceMonitor from "@monitor/sdk";
import { TimeCard } from "../TimeCard";
import { LongTaskCard } from "../LongTaskCard";
import { ResourceCard } from "../ResourceCard";
import { RequestCard } from "../RequestCard";
import "./index.less";

const PerformanceDebugger: React.FC = () => {
  const [position, setPosition] = useState({
    x: window.innerWidth - 80,
    y: window.innerHeight - 80,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [isMonitorInitialized, setIsMonitorInitialized] = useState(false);

  // Settings State
  const [config, setConfig] = useState({
    // Basic Metrics
    enableFP: true,
    enableFCP: true,
    enableLCP: true,
    enableCLS: true,
    enableTTFB: true,
    enableLoad: true,
    // Interaction
    enableINP: true,
    enableFID: true,
    enableLongTask: true,
    // Network
    enableResource: true,
    enableRequest: true,
    // Thresholds
    resourceThreshold: 500,
    requestThreshold: 500,
    inpThreshold: 24,
    longTaskThreshold: 50,
    // Reporting
    enableReport: false,
    reportUrl: "",
  });

  const dragStartRef = useRef<{
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const monitorRef = useRef<PerformanceMonitor | null>(null);

  // Check for existing instance on mount, but DO NOT auto-init
  useEffect(() => {
    // @ts-ignore
    const MonitorClass = PerformanceMonitor.default || PerformanceMonitor;

    // 如果没有实例（首次加载），预初始化以捕获 Load 等早期指标
    if (!MonitorClass.instance) {
      // 1. 构造函数立即启动 Load 监听 (不带参数)
      // 我们不再这里调用 init，而是推迟到用户点击 "Start Monitor"
      new MonitorClass();
    }
    // 注意：即使 instance 存在（例如 React StrictMode 导致的二次挂载），
    // 我们也不自动设置 isMonitorInitialized(true)。
    // 这样确保用户总是能看到配置表单。

    monitorRef.current = MonitorClass.instance;
  }, []);

  const startMonitor = () => {
    // @ts-ignore
    const MonitorClass = PerformanceMonitor.default || PerformanceMonitor;

    // 提取阈值配置传给 SDK，保留 enable 开关在本地用于控制展示
    // Extract thresholds for SDK, keep 'enable' flags local for UI display
    const {
      resourceThreshold,
      requestThreshold,
      inpThreshold,
      longTaskThreshold,
      enableReport,
      reportUrl,
    } = config;

    const sdkOptions: any = {
      resourceThreshold,
      requestThreshold,
      inpThreshold,
      longTaskThreshold,
    };

    if (enableReport && reportUrl) {
      sdkOptions.reportUrl = reportUrl;
    }

    if (MonitorClass.instance) {
      // 如果 instance.options 已经存在，说明之前已经调用过 init，现在是重新配置或重启
      // If instance.options exists, it means init was called before, so we're re-configuring or restarting.
      if (MonitorClass.instance.options) {
        MonitorClass.instance.reset(sdkOptions);
      } else {
        // 如果 instance.options 不存在，说明这是首次启动 (只有构造函数运行过)
        // If instance.options doesn't exist, it's the first start (only constructor ran).
        MonitorClass.instance.init(sdkOptions);
      }
    } else {
      // 理论上不会走到这里，因为 useEffect 已经创建了实例，但作为防守代码
      // This case should ideally not be hit as useEffect creates the instance, but as defensive code.
      new MonitorClass();
      MonitorClass.instance.init(sdkOptions);
    }

    monitorRef.current = MonitorClass.instance;
    setIsMonitorInitialized(true);
    setShowModal(false);
  };

  // 拖拽逻辑
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(false);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
      startX: e.clientX,
      startY: e.clientY,
    };
  };

  useEffect(() => {
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;

      const moveX = moveEvent.clientX - dragStartRef.current.startX;
      const moveY = moveEvent.clientY - dragStartRef.current.startY;

      // 添加阈值防止误触 (5px)
      if (Math.abs(moveX) < 5 && Math.abs(moveY) < 5) return;

      setIsDragging(true);

      const newX = moveEvent.clientX - dragStartRef.current.x;
      const newY = moveEvent.clientY - dragStartRef.current.y;

      // 边界检查 (简单的)
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;

      setPosition({
        x: Math.min(Math.max(0, newX), maxX),
        y: Math.min(Math.max(0, newY), maxY),
      });
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []); // 只需要绑定一次 document 事件

  const handleClick = () => {
    if (isDragging) return;

    // 如果未初始化，直接打开配置弹窗
    if (!isMonitorInitialized) {
      setShowModal(true);
      return;
    }

    const monitor = monitorRef.current;
    if (monitor) {
      console.log("Stopping Monitor...");
      // 获取当前数据
      const data = monitor.getMetrics();
      setMetrics(data);
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleStopAndReset = () => {
    if (monitorRef.current) {
      // 仅停止监控，保留实例和数据（Load/FCP等），以便重新配置时使用 reset 逻辑
      // Only stop monitoring, keep instance and data to support reset logic during re-configuration
      monitorRef.current.stop();
      // 注意：不要设置为 null，否则会走新建实例逻辑，丢失 load 等一次性指标数据
      // MonitorClass.instance = null;
      // monitorRef.current = null;
    }
    setIsMonitorInitialized(false);
    // 保持 modal 打开，回到配置界面
    // setShowModal(true);
  };

  return (
    <>
      <div
        ref={iconRef}
        className="performance-debugger-icon"
        style={{
          left: position.x,
          top: position.y,
          background: isMonitorInitialized ? "#4CAF50" : "#555",
        }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        title={
          isMonitorInitialized
            ? "Click to inspect metrics"
            : "Click to configure & start monitor"
        }
      >
        <svg viewBox="0 0 24 24" fill="white">
          <path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z" />
        </svg>
      </div>

      {showModal && (
        <div className="performance-debugger-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {isMonitorInitialized
                  ? "Performance Metrics"
                  : "Monitor Configuration"}
              </h2>
              <button className="close-btn" onClick={handleClose}>
                &times;
              </button>
            </div>

            {!isMonitorInitialized ? (
              <div
                className="modal-settings"
                style={{ borderBottom: "none", background: "transparent" }}
              >
                <h3>选择监控指标 (Select Metrics)</h3>
                <div className="settings-section">
                  <h4>加载体验 (Loading)</h4>
                  <div className="settings-row">
                    {[
                      { key: "enableFP", label: "FP (First Paint)" },
                      {
                        key: "enableFCP",
                        label: "FCP (First Contentful Paint)",
                      },
                      {
                        key: "enableLCP",
                        label: "LCP (Largest Contentful Paint)",
                      },
                      {
                        key: "enableCLS",
                        label: "CLS (Cumulative Layout Shift)",
                      },
                      { key: "enableTTFB", label: "TTFB (Time to First Byte)" },
                      { key: "enableLoad", label: "Load (Page Load Time)" },
                    ].map(({ key, label }) => (
                      <label key={key}>
                        <input
                          type="checkbox"
                          checked={
                            config[key as keyof typeof config] as boolean
                          }
                          onChange={(e) =>
                            setConfig({ ...config, [key]: e.target.checked })
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="settings-section">
                  <h4>交互与响应 (Interaction)</h4>
                  <div className="settings-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={config.enableINP}
                        onChange={(e) =>
                          setConfig({ ...config, enableINP: e.target.checked })
                        }
                      />
                      INP (Interaction to Next Paint)
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={config.enableFID}
                        onChange={(e) =>
                          setConfig({ ...config, enableFID: e.target.checked })
                        }
                      />
                      FID (First Input Delay)
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={config.enableLongTask}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            enableLongTask: e.target.checked,
                          })
                        }
                      />
                      Long Task (长任务)
                    </label>
                  </div>
                  {config.enableINP && (
                    <div className="settings-row thresholds">
                      <label>
                        INP 阈值 (ms):
                        <input
                          type="number"
                          value={config.inpThreshold}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              inpThreshold: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                    </div>
                  )}
                  {config.enableLongTask && (
                    <div className="settings-row thresholds">
                      <label>
                        LongTask 阈值 (ms):
                        <input
                          type="number"
                          value={config.longTaskThreshold}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              longTaskThreshold: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="settings-section">
                  <h4>网络请求 (Network)</h4>
                  <div className="settings-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={config.enableResource}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            enableResource: e.target.checked,
                          })
                        }
                      />
                      Resource (资源加载)
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={config.enableRequest}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            enableRequest: e.target.checked,
                          })
                        }
                      />
                      XHR/Fetch (接口请求)
                    </label>
                  </div>
                  {config.enableResource && (
                    <div className="settings-row thresholds">
                      <label>
                        资源耗时阈值 (ms):
                        <input
                          type="number"
                          value={config.resourceThreshold}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              resourceThreshold: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                    </div>
                  )}
                  {config.enableRequest && (
                    <div className="settings-row thresholds">
                      <label>
                        请求耗时阈值 (ms):
                        <input
                          type="number"
                          value={config.requestThreshold}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              requestThreshold: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="settings-section">
                  <h4>数据上报 (Data Reporting)</h4>
                  <div className="settings-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={config.enableReport}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            enableReport: e.target.checked,
                          })
                        }
                      />
                      开启自动上报 (Enable Auto Report)
                    </label>
                  </div>
                  {config.enableReport && (
                    <div className="settings-row thresholds">
                      <label style={{ width: "100%" }}>
                        上报地址 (Report URL):
                        <input
                          type="text"
                          placeholder="https://example.com/analytics"
                          value={config.reportUrl}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              reportUrl: e.target.value,
                            })
                          }
                          style={{ width: "300px", marginLeft: "10px" }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <button
                  onClick={startMonitor}
                  className="apply-btn"
                  style={{
                    fontSize: "16px",
                    padding: "10px 24px",
                    marginTop: "20px",
                  }}
                >
                  开始监控 (Start Monitor)
                </button>
              </div>
            ) : (
              <>
                <div className="modal-body">
                  {/* 1. Loading */}
                  {(config.enableLoad ||
                    config.enableFP ||
                    config.enableFCP ||
                    config.enableTTFB ||
                    config.enableLCP ||
                    config.enableCLS) && (
                    <section>
                      <div className="section-header">
                        <h3>加载体验 (Loading)</h3>
                      </div>
                      <div className="card-grid">
                        {config.enableLoad && (
                          <TimeCard
                            title="Load Time"
                            name="Load"
                            unit="s"
                            metrics={metrics}
                          />
                        )}
                        {config.enableFP && (
                          <TimeCard
                            title="First Paint"
                            name="FP"
                            unit="s"
                            metrics={metrics}
                          />
                        )}
                        {config.enableFCP && (
                          <TimeCard
                            title="First Contentful Paint"
                            name="FCP"
                            unit="s"
                            metrics={metrics}
                          />
                        )}
                        {config.enableTTFB && (
                          <TimeCard
                            title="Time to First Byte"
                            name="TTFB"
                            unit="ms"
                            metrics={metrics}
                          />
                        )}
                        {config.enableLCP && (
                          <TimeCard
                            title="Largest Contentful Paint"
                            name="LCP"
                            unit="s"
                            metrics={metrics}
                            target
                          />
                        )}
                        {config.enableCLS && (
                          <TimeCard
                            title="Cumulative Layout Shift"
                            name="CLS"
                            unit=""
                            metrics={metrics}
                          />
                        )}
                      </div>
                    </section>
                  )}

                  {/* 2. Interaction */}
                  {(config.enableINP ||
                    config.enableFID ||
                    config.enableLongTask) && (
                    <section>
                      <div className="section-header">
                        <h3>交互响应 (Interaction)</h3>
                      </div>
                      <div className="card-grid">
                        {config.enableINP && (
                          <TimeCard
                            title="Interaction to Next Paint"
                            name="INP"
                            unit="ms"
                            metrics={metrics}
                          />
                        )}
                        {config.enableFID && (
                          <TimeCard
                            title="First Input Delay"
                            name="FID"
                            unit="ms"
                            metrics={metrics}
                          />
                        )}
                        {config.enableLongTask && (
                          <LongTaskCard tasks={metrics.LongTask} />
                        )}
                      </div>
                    </section>
                  )}

                  {/* 3. Network */}
                  {(config.enableResource || config.enableRequest) && (
                    <section>
                      <div className="section-header">
                        <h3>网络请求 (Network)</h3>
                      </div>
                      <div className="card-grid network-grid">
                        {config.enableResource && (
                          <ResourceCard data={metrics?.Resource} />
                        )}
                        {config.enableRequest && (
                          <RequestCard data={metrics?.Request} />
                        )}
                      </div>
                    </section>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    className="log-btn"
                    onClick={() => console.log(metrics)}
                  >
                    在控制台打印
                  </button>
                  <button
                    className="stop-btn"
                    onClick={handleStopAndReset}
                    style={{
                      background: "#d32f2f",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    停止并重置配置
                  </button>
                  <button className="resume-btn" onClick={handleClose}>
                    关闭 (继续运行)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceDebugger;

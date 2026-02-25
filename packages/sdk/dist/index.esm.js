function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _createForOfIteratorHelper(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
      t && (r = t);
      var n = 0,
        F = function () {};
      return {
        s: F,
        n: function () {
          return n >= r.length ? {
            done: true
          } : {
            done: false,
            value: r[n++]
          };
        },
        e: function (r) {
          throw r;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o,
    a = true,
    u = false;
  return {
    s: function () {
      t = t.call(r);
    },
    n: function () {
      var r = t.next();
      return a = r.done, r;
    },
    e: function (r) {
      u = true, o = r;
    },
    f: function () {
      try {
        a || null == t.return || t.return();
      } finally {
        if (u) throw o;
      }
    }
  };
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (String )(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

// src/loading/FP.ts
var startFPFPC = function startFPFPC(report) {
  var handler = function handler(list) {
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        if (entry.name === "first-contentful-paint" || entry.name === "first-paint") {
          if (entry.name === "first-contentful-paint") {
            observer.disconnect(); // FP PCP一辈子只发生一次，抓到就撤，省内存
          }
          var json = entry.toJSON();
          // 简单的名称映射用于日志
          var nameMap = {
            "first-paint": "FP",
            "first-contentful-paint": "FCP"
          };
          var reportData = Object.assign(Object.assign({}, json), {
            type: "performance",
            name: nameMap[entry.name],
            value: entry.startTime,
            pageUrl: window.location.href
          });
          report(reportData);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };
  var observer = new PerformanceObserver(handler); // 1. 创建观测者
  observer.observe({
    type: "paint",
    buffered: true
  }); // 2. 开始蹲守 'paint' 频道 buffered: true 是关键，确保能拿到 SDK 初始化之前的记录
  return function () {
    return observer.disconnect();
  }; // 3. 返回清理函数
};

function getSelector$1(element) {
  if (!element || element.nodeType !== 1) return "";
  // 如果有 id，直接返回 #id
  if (element.id) {
    return "#".concat(element.id);
  }
  // 递归向上查找
  var path = [];
  while (element) {
    var name = element.localName;
    if (!name) break;
    // 如果有 id，拼接后停止
    if (element.id) {
      path.unshift("#".concat(element.id));
      break;
    }
    // 加上 class
    var className = element.getAttribute("class");
    if (className) {
      name += "." + className.split(/\s+/).join(".");
    }
    path.unshift(name);
    element = element.parentElement;
  }
  return path.join(" > ");
}

function startLCP(report) {
  var lcpEntry;
  var hasReported = false;
  var observer = new PerformanceObserver(function (list) {
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        // 记录最新的 LCP 候选值
        lcpEntry = entry;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  });
  observer.observe({
    type: "largest-contentful-paint",
    buffered: true
  });
  var sendReport = function sendReport() {
    if (hasReported || !lcpEntry) return;
    hasReported = true;
    var json = lcpEntry.toJSON();
    var reportData = Object.assign(Object.assign({}, json), {
      value: lcpEntry.startTime,
      elementSelector: getSelector$1(lcpEntry.element),
      type: "performance",
      name: "LCP",
      pageUrl: window.location.href
    });
    report(reportData);
  };
  // 页面隐藏或用户首次交互时，上报最终 LCP
  var onHidden = function onHidden() {
    if (document.visibilityState === "hidden") sendReport();
  };
  // 监听页面显示隐藏
  document.addEventListener("visibilitychange", onHidden, {
    once: true
  });
  window.addEventListener("pagehide", sendReport, {
    once: true
  });
  // 监听用户交互
  ["click", "keydown", "pointerdown"].forEach(function (type) {
    window.addEventListener(type, sendReport, {
      once: true,
      capture: true
    });
  });
  return function () {
    observer.disconnect();
    document.removeEventListener("visibilitychange", onHidden);
  };
}
/*
它是动态变化的：LCP 代表视口内最大内容的渲染时间。不同于 FP/FCP 一次定音，LCP 是渐进式的。随着图片加载或字体渲染，更大的内容可能随后出现，浏览器会不断更新 LCP 候选值。


什么时候“定格”？ 浏览器会在用户首次交互（点击、按键）或页面隐藏时，停止产生新的 LCP。因此，我们不能抓到一个就上报，而是要监听这些“停止信号”，取最后一次候选值作为最终结果。


光有时间不够：老板问你“为什么慢”，你不能光给个时间。我们需要利用 element 属性计算出 CSS 选择器，精准定位是哪张图或哪段文字拖了后腿。

*/

// src/loading/load.ts
function startLoad(report) {
  var onPageShow = function onPageShow(event) {
    requestAnimationFrame(function () {
      var reportData = {
        type: "performance",
        name: "Load",
        value: event.timeStamp,
        pageUrl: window.location.href
      };
      report(reportData);
    });
  };
  window.addEventListener("pageshow", onPageShow, true);
  return function () {
    window.removeEventListener("pageshow", onPageShow, true);
  };
}
/**
 1. 为什么要用 pageshow 而不是 onload？
传统 onload 的缺陷：
它只在页面首次从网络加载完全部资源（图片、脚本等）时触发。
如果用户点了“后退”按钮回到这个页面，或者浏览器从BFCache（往返缓存）里秒开了这个页面，onload 是不会触发的。
pageshow 的优势：
通吃：不管你是第一次来，还是按后退键回来的，只要页面“展示”出来了，它都会触发。
这能确保你的监控数据覆盖到所有用户看到的场景，不会漏掉那些“后退进入”的访问。
2. 为什么要包一层 requestAnimationFrame (rAF)？
这是为了避让主线程和更精准的时机：

避让：当 pageshow 触发时，浏览器的主线程通常非常忙（正在忙着把页面画出来）。这时候如果直接塞一段 JS 逻辑进去，可能会让页面卡顿一下。
时机：requestAnimationFrame 的意思是：“浏览器大哥，等你把当前这一帧画面画完，准备画下一帧之前的空档，顺手帮我执行一下这个”。
这样做，能确保我们的代码是在页面第一帧渲染完成之后立即执行的，这个时间点更代表“用户真正看见页面”的时刻。
**/

function startTTFB(report) {
  // 监听导航条目
  var observer = new PerformanceObserver(function (list) {
    var entries = list.getEntries();
    // 只取第一个导航条目
    var _iterator = _createForOfIteratorHelper(entries),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        if (entry.entryType === "navigation") {
          var navEntry = entry;
          // 计算 TTFB: responseStart - requestStart
          // 实际上 responseStart 已经是相对于 navigationStart 的时间
          // 但通常我们也关心它相对于请求开始的耗时，或者直接用 responseStart 代表用户感知的首字节时间
          var ttfb = navEntry.responseStart - navEntry.startTime;
          var reportData = {
            type: "performance",
            subType: "TTFB",
            name: "TTFB",
            value: ttfb,
            pageUrl: window.location.href,
            serviceWorkerTime: navEntry.workerStart > 0 ? navEntry.responseEnd - navEntry.workerStart : 0,
            dnsTime: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcpTime: navEntry.connectEnd - navEntry.connectStart
          };
          report(reportData);
          // 获取到后断开连接
          observer.disconnect();
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  });
  observer.observe({
    type: "navigation",
    buffered: true
  });
  return function () {
    return observer.disconnect();
  };
}

function startFID(report) {
  var observer = new PerformanceObserver(function (list) {
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        // 核心公式：处理开始时间 - 点击时间 = 延迟时间
        var delay = (entry.processingStart || entry.startTime) - entry.startTime;
        report({
          type: "performance",
          name: "FID",
          value: delay,
          target: getSelector(entry.target),
          startTime: entry.startTime
        });
        observer.disconnect(); // FID 只看第一下，拿到就撤
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  });
  observer.observe({
    type: "first-input",
    buffered: true
  });
  return function () {
    return observer.disconnect();
  };
}
function getSelector(el) {
  if (el instanceof Element) {
    return el.tagName + (el.id ? "#" + el.id : "") + (el.className ? "." + el.className : "");
  }
  return "";
}

function startINP(durationThreshold, report) {
  var maxValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var enableBuffered = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  // 记录当前的 INP 值（最长的一次交互耗时），如果有历史值，从历史值开始，避免 resume 后归零
  var inpValue = maxValue;
  // 记录最长交互的目标元素（用于调试）
  var inpTarget = null;
  // 用于存储由于“同一次交互触发多个事件”时的最大耗时
  // Key: interactionId, Value: { duration, entries }
  var interactionMap = new Map();
  var observer = new PerformanceObserver(function (list) {
    var entries = list.getEntries();
    var _iterator = _createForOfIteratorHelper(entries),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        // 1. 过滤掉没有 interactionId 的事件
        // Scroll 和 Hover 事件通常 interactionId 为 0 或 undefined，不属于 INP 范畴
        if (!entry.interactionId) continue;
        // 2. 聚合逻辑：处理同一个交互的多个阶段
        // 比如点击按钮可能会由 pointerdown, mouseup, click 组成
        // 它们共享同一个 interactionId，我们取其中 duration 最大的一个
        var interaction = interactionMap.get(entry.interactionId);
        if (!interaction) {
          interaction = {
            duration: 0,
            entries: []
          };
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
            target: inpTarget
          });
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  });
  observer.observe({
    type: "event",
    durationThreshold: durationThreshold,
    buffered: enableBuffered
  });
  return function () {
    return observer.disconnect();
  };
}
//INP 代码：type: 'event'。这里我们不断监听，不断打 log。实际场景里，你需要维护一个数组，把耗时最长的几次交互存下来，最后上报那个最慢的。
//durationThreshold: 16：这是个优化参数。意思是“小于 16ms（一帧）的交互我就不看了”，省得数据太多刷屏。
/**
 要准确计算 INP，核心逻辑在于：
只关注有 interactionId 的事件（排除 scroll、hover 等非交互事件）。
去重与聚合：一次点击通常会触发多个事件（如 pointerdown, mousedown, pointerup, click），它们拥有同一个 interactionId。我们需要取这组事件中耗时最长的那个作为该次交互的耗时。
取最大值：在页面生命周期内，记录耗时最长的那次交互（即 INP）。
 */

function startLongTask(threshold, report) {
  var isBuffered = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var observer = new PerformanceObserver(function (list) {
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        if (entry.duration > threshold) {
          // 抓到个慢的！看看是谁
          // attribution里面藏着“罪魁祸首”的名字,通常包含：name(self/iframe), containerType(iframe/embed), containerSrc
          // 虽不能精确到具体函数，但能帮你区分是“自己写的代码慢”还是“第三方插件慢”
          // 如果类型是 'window'，说明是当前主页面（你的代码）卡了；如果是 'iframe'，那就是广告或插件卡了
          report({
            type: "performance",
            name: "LongTask",
            duration: entry.duration,
            attribution: entry.attribution,
            startTime: entry.startTime
          });
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  });
  // 开启监听，buffered 同样重要
  observer.observe({
    type: "longtask",
    buffered: isBuffered
  });
  return function () {
    return observer.disconnect();
  };
}
//拆分任务：把一次性的大计算拆成多个小段，并在每段之间主动“让路”。常用手段：setTimeout(0) 切片、requestAnimationFrame 在绘制后继续、requestIdleCallback 在空闲期执行、重度计算迁移到 Web Worker。注意：requestIdleCallback 在后台标签页会被强烈限速，不适合关键路径。

function startCLS(report) {
  var initialCLS = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var buffered = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var clsValue = initialCLS;
  var sessionValue = 0;
  var gap = 1000;
  var maxDuration = 5000;
  var sessionEntries = []; // 调试用，也没坏处
  var observer = new PerformanceObserver(function (list) {
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        // 核心：剔除用户交互（点击/输入）导致的预期偏移
        if (!entry.hadRecentInput) {
          var firstEntry = sessionEntries[0];
          var lastEntry = sessionEntries[sessionEntries.length - 1];
          // 判定是否属于当前会话：
          // 1. 如果是第一条，直接加入
          // 2. 距离上一条 < 1s 且 距离第一条 < 5s
          if (sessionValue > 0 && entry.startTime - lastEntry.startTime < gap && entry.startTime - firstEntry.startTime < maxDuration) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            // 此时我们必须“结算”上一个窗口的总分。如果上一个窗口的总分 (sessionValue) 是历史最高的，我们就把它更新为当前的 CLS 值并上报。
            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              report({
                type: "performance",
                name: "CLS",
                value: clsValue
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
              value: clsValue
            });
          }
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  });
  observer.observe({
    type: "layout-shift",
    buffered: buffered
  });
  var sendReport = function sendReport() {
    report({
      type: "performance",
      name: "CLS",
      value: clsValue
    });
  };
  // 双重保险：兼容各类浏览器的卸载场景
  var onVisibilityChange = function onVisibilityChange() {
    if (document.visibilityState === "hidden") sendReport();
  };
  window.addEventListener("pagehide", sendReport, {
    once: true
  });
  document.addEventListener("visibilitychange", onVisibilityChange, {
    once: true
  });
  return function () {
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

function startEntries(threshold, report) {
  var isBuffered = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var observer = new PerformanceObserver(function (list) {
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        // resource 类型包含了 img, script, css, fetch, xmlhttprequest, link 等
        // 我们这里排除 fetch 和 xmlhttprequest，因为它们在 startRequest 中单独处理
        if (entry.entryType === "resource" && entry.initiatorType !== "fetch" && entry.initiatorType !== "xmlhttprequest" && entry.initiatorType !== "beacon" && entry.duration > threshold // 阈值：只上报超过阈值的慢资源
        ) {
          report({
            resourceName: entry.name,
            name: "Resource",
            initiatorType: entry.initiatorType,
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  });
  // 同样记得 buffered: true，防止漏掉页面刚开始加载的那些资源
  observer.observe({
    type: "resource",
    buffered: isBuffered
  });
  return function () {
    return observer.disconnect();
  };
}
/**
entryType === 'resource'：这个频道包罗万象。图片 (img)、样式 (css)、脚本 (script) 甚至你的接口调用 (fetch/xmlhttprequest) 都在这儿。
initiatorType：这个字段告诉你资源是谁发起的。是 <img src="..."> 发起的？还是 fetch() 发起的？一看便知。

 */

function startRequest(threshold, report) {
  var isBuffered = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var excludeUrl = arguments.length > 3 ? arguments[3] : undefined;
  var entryHandler = function entryHandler(list) {
    var data = list.getEntries();
    var _iterator = _createForOfIteratorHelper(data),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        // 过滤掉上报接口自身的请求，防止无限循环
        if (excludeUrl && entry.name.includes(excludeUrl)) {
          continue;
        }
        // 过滤出 API 请求 (Fetch 和 XHR)
        if ((entry.initiatorType === "fetch" || entry.initiatorType === "xmlhttprequest" || entry.initiatorType === "beacon") && entry.duration > threshold // 阈值：只上报超过阈值的慢请求
        ) {
          var reportData = {
            name: "Request",
            target: entry.name,
            // 接口地址
            type: "performance",
            // 日志类型
            subType: entry.entryType,
            // 资源类型 (resource)
            sourceType: entry.initiatorType,
            // 发起方式 (fetch/xhr)
            duration: entry.duration,
            // 总耗时
            dns: entry.domainLookupEnd - entry.domainLookupStart,
            // DNS 耗时
            tcp: entry.connectEnd - entry.connectStart,
            // TCP 耗时
            ttfb: entry.responseStart - entry.requestStart,
            // 首字节响应时间 (TTFB)
            transferSize: entry.transferSize,
            // 传输体积
            startTime: entry.startTime,
            // 开始时间
            pageUrl: window.location.href // 当前页面 URL
          };
          report(reportData);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };
  // 这里不调用 disconnect()，以便持续监听后续产生的网络请求
  var observer = new PerformanceObserver(entryHandler);
  observer.observe({
    type: "resource",
    buffered: isBuffered
  });
  return function () {
    return observer.disconnect();
  };
}

var report = function report(data, url) {
  if (!url) return;
  // 1. 包装数据：加上一些公共信息（比如 UserAgent，屏幕分辨率等）
  var dataToSend = Object.assign(Object.assign({}, data), {
    userAgent: navigator.userAgent
  });
  // 2. 优先使用 sendBeacon (最稳，且不阻塞)
  // 注意：sendBeacon 不支持自定义 Content-Type，默认是 text/plain
  // 这里用 Blob 强制指定为 application/json
  if (navigator.sendBeacon) {
    var blob = new Blob([JSON.stringify(dataToSend)], {
      type: "application/json"
    });
    // sendBeacon 返回 true 表示进入队列成功
    navigator.sendBeacon(url, blob);
    return;
  } else {
    // 3. 降级方案：使用 fetch + keepalive
    // 即使页面关闭，keepalive 也能保证请求发出
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataToSend),
      keepalive: true // <--- 关键参数！防止页面关闭时请求被杀
    })["catch"](function (err) {
      console.error("上报失败:", err);
    });
  }
};

var Reporter = /*#__PURE__*/function () {
  function Reporter() {
    _classCallCheck(this, Reporter);
    this.metrics = {};
    this.metrics = {};
  }
  return _createClass(Reporter, [{
    key: "setReportUrl",
    value: function setReportUrl(url) {
      this.reportUrl = url;
    }
    /**
     * 收集单个指标
     * @param data 性能数据
     */
  }, {
    key: "collect",
    value: function collect(data) {
      var rewrite = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
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
  }, {
    key: "getMetrics",
    value: function getMetrics() {
      return this.metrics;
    }
    /**
     * 清空指标队列
     */
  }, {
    key: "clear",
    value: function clear() {
      this.metrics = {};
    }
    /**
     * 清空指定类型的指标
     * @param keys 要清空的指标名称列表
     */
  }, {
    key: "clearMetrics",
    value: function clearMetrics(keys) {
      var _this = this;
      keys.forEach(function (key) {
        delete _this.metrics[key];
      });
    }
  }]);
}();

var PerformanceMonitor = /*#__PURE__*/function () {
  function PerformanceMonitor() {
    var _this = this;
    _classCallCheck(this, PerformanceMonitor);
    this.cleanups = [];
    this.metricsStatus = new Map();
    this.loadCleanup = null;
    // 如果已经有实例，直接返回
    if (PerformanceMonitor.instance) {
      return PerformanceMonitor.instance;
    }
    this.reporter = new Reporter();
    this.metricsStatus = new Map();
    PerformanceMonitor.instance = this;
    // 立即监听 Load，确保不漏掉早期事件
    var collect = this.reporter.collect.bind(this.reporter);
    this.loadCleanup = startLoad(function (data) {
      if (!_this.metricsStatus.has("Load")) {
        collect(data);
        _this.metricsStatus.set("Load", 0);
      }
    });
  }
  return _createClass(PerformanceMonitor, [{
    key: "init",
    value: function init() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        resourceThreshold: 500,
        requestThreshold: 500,
        inpThreshold: 24,
        longTaskThreshold: 50
      };
      this.options = Object.assign({}, options);
      if (this.options.reportUrl) {
        this.reporter.setReportUrl(this.options.reportUrl.trim());
      }
      this.scan(true);
      console.log("Performance Monitor Initialized");
    }
    // 重置并应用新配置
  }, {
    key: "reset",
    value: function reset(newOptions) {
      this.stop();
      this.clearMetrics(["INP", "LongTask", "Resource", "Request"]);
      this.options = Object.assign(Object.assign({}, this.options), newOptions);
      if (this.options.reportUrl) {
        this.reporter.setReportUrl(this.options.reportUrl.trim());
      }
      this.resume();
    }
  }, {
    key: "scan",
    value: function scan() {
      var _this2 = this;
      var enableBuffered = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      // 避免重复监听
      if (this.cleanups.length > 0) return;
      var collect = this.reporter.collect.bind(this.reporter);
      // 1. 页面加载与渲染 (Loading & Rendering)
      if (!this.metricsStatus.has("FCP")) {
        this.cleanups.push(startFPFPC(function (data) {
          if (!_this2.metricsStatus.has(data.name)) {
            collect(data);
            _this2.metricsStatus.set(data.name, 0);
          }
        }));
      }
      if (!this.metricsStatus.has("LCP")) {
        this.cleanups.push(startLCP(function (data) {
          collect(data, true);
          _this2.metricsStatus.set("LCP", data.value);
        }));
      }
      // 检查 Load 是否已由构造函数启动 (loadCleanup) 或已完成 (metricsStatus)
      if (!this.metricsStatus.has("Load") && !this.loadCleanup) {
        this.cleanups.push(startLoad(function (data) {
          if (!_this2.metricsStatus.has("Load")) {
            collect(data);
            _this2.metricsStatus.set("Load", 0);
          }
        }));
      }
      if (!this.metricsStatus.has("TTFB")) {
        this.cleanups.push(startTTFB(function (data) {
          if (!_this2.metricsStatus.has("TTFB")) {
            collect(data);
            _this2.metricsStatus.set("TTFB", 0);
          }
        })); //为啥加两次判断 防止buffered=true然后重复上报
      }
      // // 2. 交互响应 (Interaction)
      if (!this.metricsStatus.has("FID")) {
        this.cleanups.push(startFID(function (data) {
          if (!_this2.metricsStatus.has("FID")) {
            collect(data);
            _this2.metricsStatus.set("FID", 0);
          }
        }));
      }
      var maxINP = this.metricsStatus.get("INP") || 0;
      this.cleanups.push(startINP(this.options.inpThreshold, function (data) {
        collect(data, true);
        _this2.metricsStatus.set("INP", data.value);
      }, maxINP, enableBuffered)); //inp需要用到历史值
      this.cleanups.push(startLongTask(this.options.longTaskThreshold, collect, enableBuffered));
      // // 3. 视觉稳定性 (Visual Stability)
      var maxCLS = this.metricsStatus.get("CLS") || 0;
      this.cleanups.push(startCLS(function (data) {
        collect(data);
        _this2.metricsStatus.set("CLS", data.value);
      }, maxCLS, enableBuffered));
      // // 4. 资源与网络 (Resource & Network)
      // 默认阈值为 1000ms，也可通过入参自定义配置
      this.cleanups.push(startEntries(this.options.resourceThreshold, collect, enableBuffered));
      this.cleanups.push(startRequest(this.options.requestThreshold, collect, enableBuffered, this.options.reportUrl));
    }
  }, {
    key: "stop",
    value: function stop() {
      this.cleanups.forEach(function (fn) {
        return fn && fn();
      });
      this.cleanups = [];
      if (this.loadCleanup) {
        this.loadCleanup();
        this.loadCleanup = null;
      }
      console.log("Performance Monitor Stopped");
    }
  }, {
    key: "resume",
    value: function resume() {
      this.scan(false);
      console.log("Performance Monitor Resumed");
    }
  }, {
    key: "getMetrics",
    value: function getMetrics() {
      return this.reporter.getMetrics();
    }
  }, {
    key: "clearMetrics",
    value: function clearMetrics(keys) {
      var _this3 = this;
      this.reporter.clearMetrics(keys);
      keys.forEach(function (key) {
        _this3.metricsStatus["delete"](key);
      });
    }
  }]);
}();
PerformanceMonitor.instance = null;

export { PerformanceMonitor as default };
//# sourceMappingURL=index.esm.js.map

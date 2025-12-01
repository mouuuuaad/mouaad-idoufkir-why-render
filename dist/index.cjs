"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  useWhyRender: () => useWhyRenderExport,
  withWhyRender: () => withWhyRender
});
module.exports = __toCommonJS(src_exports);

// src/hooks/useWhyRender.ts
var import_react = require("react");

// src/utils/diff.ts
function isObject(x) {
  return typeof x === "object" && x !== null;
}
function fastDeepEqual(a, b, depth = 3) {
  if (depth < 0) return true;
  if (Object.is(a, b)) return true;
  if (!isObject(a) || !isObject(b)) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!fastDeepEqual(a[key], b[key], depth - 1)) return false;
  }
  return true;
}
function deepEqual(a, b) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch (e) {
    return fastDeepEqual(a, b, 10);
  }
}
function getChanges(prevProps, nextProps, strategy, customCompare, skipKeys = []) {
  const changes = [];
  const allKeys = /* @__PURE__ */ new Set([...Object.keys(prevProps || {}), ...Object.keys(nextProps || {})]);
  for (const key of allKeys) {
    if (skipKeys.includes(key)) continue;
    const prev = prevProps ? prevProps[key] : void 0;
    const next = nextProps ? nextProps[key] : void 0;
    if (Object.is(prev, next)) {
      continue;
    }
    if (customCompare && customCompare(prev, next)) {
      continue;
    }
    let reason = "value";
    let areDeepEqual = false;
    if (typeof prev !== typeof next) {
      reason = "type";
    } else if (typeof prev === "function") {
      reason = "function";
    } else if (Array.isArray(prev) && Array.isArray(next) && prev.length !== next.length) {
      reason = "length";
    } else if (isObject(prev) && isObject(next)) {
      if (strategy === "deep") {
        areDeepEqual = deepEqual(prev, next);
      } else if (strategy === "fast-deep") {
        areDeepEqual = fastDeepEqual(prev, next);
      } else {
        areDeepEqual = false;
      }
      if (areDeepEqual) {
        reason = "reference";
      } else {
        reason = "value";
      }
    }
    changes.push({
      key,
      reason,
      oldValue: prev,
      newValue: next
    });
  }
  return changes;
}

// src/utils/env.ts
function shouldInstrument() {
  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    return true;
  }
  if (typeof window !== "undefined" && window.__WHY_RENDER__ === true) {
    return true;
  }
  return false;
}

// src/engine/EventEmitter.ts
var EventEmitter = class {
  constructor() {
    __publicField(this, "listeners", /* @__PURE__ */ new Map());
  }
  /**
   * Subscribe to an event
   */
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }
  /**
   * Unsubscribe from an event
   */
  off(event, handler) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }
  /**
   * Emit an event to all subscribers
   */
  emit(event, payload) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`[why-render] Error in event handler for ${event}:`, error);
        }
      });
    }
  }
  /**
   * Subscribe to an event once (auto-unsubscribe after first call)
   */
  once(event, handler) {
    const wrappedHandler = (payload) => {
      handler(payload);
      this.off(event, wrappedHandler);
    };
    return this.on(event, wrappedHandler);
  }
  /**
   * Remove all listeners for a specific event or all events
   */
  clear(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
  /**
   * Get listener count for an event
   */
  listenerCount(event) {
    return this.listeners.get(event)?.size ?? 0;
  }
};
var globalEventEmitter = new EventEmitter();

// src/engine/PerformanceMonitor.ts
var DEFAULT_SLOW_THRESHOLD = 16;
var PerformanceMonitor = class {
  constructor(options = {}) {
    __publicField(this, "metrics", /* @__PURE__ */ new Map());
    __publicField(this, "activeRenders", /* @__PURE__ */ new Map());
    __publicField(this, "options");
    this.options = {
      slowThresholdMs: options.slowThresholdMs ?? DEFAULT_SLOW_THRESHOLD,
      enableMarks: options.enableMarks ?? false
    };
  }
  /**
   * Mark the start of a component render
   */
  markRenderStart(componentName, componentId) {
    const timestamp = performance.now();
    this.activeRenders.set(componentId, timestamp);
    if (this.options.enableMarks) {
      performance.mark(`${componentName}:${componentId}:start`);
    }
    globalEventEmitter.emit("render:start", {
      componentName,
      componentId,
      timestamp
    });
  }
  /**
   * Mark the end of a component render and record metrics
   */
  markRenderEnd(componentName, componentId) {
    const endTime = performance.now();
    const startTime = this.activeRenders.get(componentId);
    if (!startTime) {
      console.warn(`[why-render] No start time found for ${componentName}:${componentId}`);
      return 0;
    }
    const duration = endTime - startTime;
    this.activeRenders.delete(componentId);
    if (this.options.enableMarks) {
      const markName = `${componentName}:${componentId}`;
      performance.mark(`${markName}:end`);
      performance.measure(markName, `${markName}:start`, `${markName}:end`);
    }
    this.updateMetrics(componentName, componentId, duration);
    globalEventEmitter.emit("render:end", {
      componentName,
      componentId,
      timestamp: endTime,
      duration
    });
    if (duration > this.options.slowThresholdMs) {
      globalEventEmitter.emit("performance:warning", {
        componentName,
        componentId,
        duration,
        threshold: this.options.slowThresholdMs
      });
    }
    return duration;
  }
  /**
   * Update performance metrics for a component
   */
  updateMetrics(componentName, componentId, duration) {
    const existing = this.metrics.get(componentId);
    if (existing) {
      const newRenderCount = existing.renderCount + 1;
      const newTotalTime = existing.totalTime + duration;
      this.metrics.set(componentId, {
        componentName,
        componentId,
        renderCount: newRenderCount,
        totalTime: newTotalTime,
        averageTime: newTotalTime / newRenderCount,
        lastRenderTime: duration,
        slowRenders: duration > this.options.slowThresholdMs ? existing.slowRenders + 1 : existing.slowRenders,
        maxRenderTime: Math.max(existing.maxRenderTime, duration),
        minRenderTime: Math.min(existing.minRenderTime, duration)
      });
    } else {
      this.metrics.set(componentId, {
        componentName,
        componentId,
        renderCount: 1,
        totalTime: duration,
        averageTime: duration,
        lastRenderTime: duration,
        slowRenders: duration > this.options.slowThresholdMs ? 1 : 0,
        maxRenderTime: duration,
        minRenderTime: duration
      });
    }
  }
  /**
   * Get metrics for a specific component
   */
  getMetrics(componentId) {
    return this.metrics.get(componentId);
  }
  /**
   * Get all metrics
   */
  getAllMetrics() {
    return Array.from(this.metrics.values());
  }
  /**
   * Get components sorted by total render time
   */
  getSlowestComponents(limit = 10) {
    return Array.from(this.metrics.values()).sort((a, b) => b.totalTime - a.totalTime).slice(0, limit);
  }
  /**
   * Get components with most renders
   */
  getMostRenderedComponents(limit = 10) {
    return Array.from(this.metrics.values()).sort((a, b) => b.renderCount - a.renderCount).slice(0, limit);
  }
  /**
   * Clear metrics for a component or all components
   */
  clearMetrics(componentId) {
    if (componentId) {
      this.metrics.delete(componentId);
    } else {
      this.metrics.clear();
    }
  }
  /**
   * Update slow threshold
   */
  setSlowThreshold(thresholdMs) {
    this.options.slowThresholdMs = thresholdMs;
  }
};
var globalPerformanceMonitor = new PerformanceMonitor();

// src/engine/RenderTracker.ts
var RenderTracker = class {
  constructor(maxHistorySize = 1e3) {
    __publicField(this, "renderHistory", /* @__PURE__ */ new Map());
    __publicField(this, "componentHierarchy", /* @__PURE__ */ new Map());
    __publicField(this, "componentRenderCounts", /* @__PURE__ */ new Map());
    __publicField(this, "maxHistorySize");
    this.maxHistorySize = maxHistorySize;
  }
  /**
   * Track a component render
   */
  trackRender(componentName, componentId, props, changes) {
    const timestamp = performance.now();
    globalPerformanceMonitor.markRenderStart(componentName, componentId);
    const renderCount = (this.componentRenderCounts.get(componentId) ?? 0) + 1;
    this.componentRenderCounts.set(componentId, renderCount);
    if (changes.length > 0) {
      globalEventEmitter.emit("change:detected", {
        componentName,
        componentId,
        changes
      });
    }
    const eventId = `${componentId}-${timestamp}`;
    this.renderHistory.set(eventId, {
      id: eventId,
      componentName,
      componentId,
      timestamp,
      duration: 0,
      // Will be set in commitRender
      changes,
      props,
      renderCount
    });
    if (this.renderHistory.size > this.maxHistorySize) {
      const firstKey = this.renderHistory.keys().next().value;
      if (firstKey) {
        this.renderHistory.delete(firstKey);
      }
    }
  }
  /**
   * Commit a render (called after render completes)
   */
  commitRender(componentName, componentId) {
    const duration = globalPerformanceMonitor.markRenderEnd(componentName, componentId);
    const recentEvent = Array.from(this.renderHistory.values()).reverse().find((event) => event.componentId === componentId);
    if (recentEvent) {
      recentEvent.duration = duration;
    }
  }
  /**
   * Register a component in the hierarchy
   */
  registerComponent(componentName, componentId, parentId) {
    const parent = parentId ? this.componentHierarchy.get(parentId) : void 0;
    const depth = parent ? parent.depth + 1 : 0;
    const node = {
      componentName,
      componentId,
      children: [],
      parent,
      depth
    };
    this.componentHierarchy.set(componentId, node);
    if (parent) {
      parent.children.push(node);
    }
    globalEventEmitter.emit("component:mounted", {
      componentName,
      componentId
    });
  }
  /**
   * Unregister a component from the hierarchy
   */
  unregisterComponent(componentId) {
    const node = this.componentHierarchy.get(componentId);
    if (node) {
      if (node.parent) {
        node.parent.children = node.parent.children.filter(
          (child) => child.componentId !== componentId
        );
      }
      this.componentHierarchy.delete(componentId);
      globalEventEmitter.emit("component:unmounted", {
        componentName: node.componentName,
        componentId
      });
    }
  }
  /**
   * Get render history for a component
   */
  getComponentHistory(componentId) {
    return Array.from(this.renderHistory.values()).filter((event) => event.componentId === componentId).sort((a, b) => a.timestamp - b.timestamp);
  }
  /**
   * Get all render history
   */
  getAllHistory() {
    return Array.from(this.renderHistory.values()).sort((a, b) => a.timestamp - b.timestamp);
  }
  /**
   * Get recent renders (last N)
   */
  getRecentRenders(limit = 50) {
    return Array.from(this.renderHistory.values()).sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }
  /**
   * Get component hierarchy tree
   */
  getHierarchy() {
    return Array.from(this.componentHierarchy.values()).filter((node) => !node.parent);
  }
  /**
   * Get a specific component node
   */
  getComponentNode(componentId) {
    return this.componentHierarchy.get(componentId);
  }
  /**
   * Get render count for a component
   */
  getRenderCount(componentId) {
    return this.componentRenderCounts.get(componentId) ?? 0;
  }
  /**
   * Clear all tracking data
   */
  clear() {
    this.renderHistory.clear();
    this.componentHierarchy.clear();
    this.componentRenderCounts.clear();
    globalPerformanceMonitor.clearMetrics();
  }
  /**
   * Export data for debugging/reports
   */
  export() {
    return {
      history: this.getAllHistory(),
      hierarchy: this.getHierarchy(),
      metrics: globalPerformanceMonitor.getAllMetrics()
    };
  }
};
var globalRenderTracker = new RenderTracker();

// src/hooks/useWhyRender.ts
var componentIdCounter = 0;
var generateComponentId = (name) => {
  return `${name}-${++componentIdCounter}-${Date.now()}`;
};
function useWhyRender(props, componentName, options) {
  if (!shouldInstrument()) {
    return { lastProps: null, changes: [], componentId: "" };
  }
  const componentIdRef = (0, import_react.useRef)("");
  if (!componentIdRef.current) {
    const name2 = componentName || "Component";
    componentIdRef.current = generateComponentId(name2);
    globalRenderTracker.registerComponent(name2, componentIdRef.current);
  }
  const lastProps = (0, import_react.useRef)(null);
  const changesRef = (0, import_react.useRef)([]);
  const renderCount = (0, import_react.useRef)(0);
  const name = componentName || "Component";
  const strategy = options?.compareStrategy || "shallow";
  globalPerformanceMonitor.markRenderStart(name, componentIdRef.current);
  if (lastProps.current) {
    changesRef.current = getChanges(
      lastProps.current,
      props,
      strategy,
      options?.customCompare,
      options?.skipKeys
    );
    globalRenderTracker.trackRender(
      name,
      componentIdRef.current,
      props,
      changesRef.current
    );
    if (changesRef.current.length > 0) {
      const msg = `[why-render] ${name} re-rendered because: ${changesRef.current.map((c) => c.key).join(", ")}`;
      console.warn(msg);
      if (options?.verbose) {
        console.groupCollapsed(`[why-render] ${name} details`);
        changesRef.current.forEach((change) => {
          const formatVal = (v) => {
            try {
              const s = typeof v === "string" ? v : JSON.stringify(v);
              return s && s.length > 1e3 ? s.slice(0, 1e3) + "..." : s;
            } catch {
              return String(v);
            }
          };
          console.log(`Prop '${change.key}':`, {
            ...change,
            oldValue: formatVal(change.oldValue),
            newValue: formatVal(change.newValue)
          });
          if (change.reason === "function") {
            console.log("\u{1F4A1} Tip: Wrap with useCallback");
          } else if (change.reason === "reference") {
            console.log("\u{1F4A1} Tip: Memoize object/array or move outside component");
          }
        });
        console.groupEnd();
      }
    }
  } else {
    globalRenderTracker.trackRender(
      name,
      componentIdRef.current,
      props,
      []
    );
  }
  renderCount.current++;
  (0, import_react.useEffect)(() => {
    lastProps.current = props;
    globalRenderTracker.commitRender(name, componentIdRef.current);
  });
  (0, import_react.useEffect)(() => {
    return () => {
      globalRenderTracker.unregisterComponent(componentIdRef.current);
    };
  }, []);
  return {
    lastProps: lastProps.current,
    changes: changesRef.current,
    componentId: componentIdRef.current
  };
}
useWhyRender.track = () => {
  return Symbol("why-render-token");
};

// src/hoc/withWhyRender.tsx
var import_react2 = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function withWhyRender(Component, options) {
  const WrappedComponent = (0, import_react2.forwardRef)((props, ref) => {
    const componentName = Component.displayName || Component.name || "Component";
    useWhyRender(props, componentName, options);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, { ...props, ref });
  });
  WrappedComponent.displayName = `withWhyRender(${Component.displayName || Component.name || "Component"})`;
  return WrappedComponent;
}

// src/index.ts
var useWhyRenderExport = useWhyRender;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useWhyRender,
  withWhyRender
});
//# sourceMappingURL=index.cjs.map
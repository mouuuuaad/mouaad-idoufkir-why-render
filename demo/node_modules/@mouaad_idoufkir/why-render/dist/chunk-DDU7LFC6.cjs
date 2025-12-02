"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }


var _chunkXWASE2UZcjs = require('./chunk-XWASE2UZ.cjs');

// src/engine/PerformanceMonitor.ts
var DEFAULT_SLOW_THRESHOLD = 16;
var PerformanceMonitor = class {
  constructor(options = {}) {
    _chunkXWASE2UZcjs.__publicField.call(void 0, this, "metrics", /* @__PURE__ */ new Map());
    _chunkXWASE2UZcjs.__publicField.call(void 0, this, "activeRenders", /* @__PURE__ */ new Map());
    _chunkXWASE2UZcjs.__publicField.call(void 0, this, "options");
    this.options = {
      slowThresholdMs: _nullishCoalesce(options.slowThresholdMs, () => ( DEFAULT_SLOW_THRESHOLD)),
      enableMarks: _nullishCoalesce(options.enableMarks, () => ( false))
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
    _chunkXWASE2UZcjs.globalEventEmitter.emit("render:start", {
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
    if (duration > this.options.slowThresholdMs) {
      _chunkXWASE2UZcjs.globalEventEmitter.emit("performance:warning", {
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
    _chunkXWASE2UZcjs.__publicField.call(void 0, this, "renderHistory", /* @__PURE__ */ new Map());
    _chunkXWASE2UZcjs.__publicField.call(void 0, this, "componentHierarchy", /* @__PURE__ */ new Map());
    _chunkXWASE2UZcjs.__publicField.call(void 0, this, "componentRenderCounts", /* @__PURE__ */ new Map());
    _chunkXWASE2UZcjs.__publicField.call(void 0, this, "maxHistorySize");
    this.maxHistorySize = maxHistorySize;
  }
  /**
   * Track a component render
   */
  trackRender(componentName, componentId, props, changes) {
    const timestamp = performance.now();
    globalPerformanceMonitor.markRenderStart(componentName, componentId);
    const renderCount = (_nullishCoalesce(this.componentRenderCounts.get(componentId), () => ( 0))) + 1;
    this.componentRenderCounts.set(componentId, renderCount);
    if (changes.length > 0) {
      _chunkXWASE2UZcjs.globalEventEmitter.emit("change:detected", {
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
      console.log("[RenderTracker] Emitting render:end event:", {
        componentName,
        componentId,
        eventId: recentEvent.id,
        duration: recentEvent.duration
      });
      _chunkXWASE2UZcjs.globalEventEmitter.emit("render:end", {
        componentName,
        componentId,
        renderEvent: recentEvent
      });
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
    _chunkXWASE2UZcjs.globalEventEmitter.emit("component:mounted", {
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
      _chunkXWASE2UZcjs.globalEventEmitter.emit("component:unmounted", {
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
    return _nullishCoalesce(this.componentRenderCounts.get(componentId), () => ( 0));
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




exports.globalPerformanceMonitor = globalPerformanceMonitor; exports.globalRenderTracker = globalRenderTracker;
//# sourceMappingURL=chunk-DDU7LFC6.cjs.map
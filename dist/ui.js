var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/ui/WhyRenderDevTools.tsx
import { useEffect } from "react";

// src/store/index.ts
import { create } from "zustand";
var useDevToolsStore = create((set) => ({
  // Initial state
  isOpen: false,
  activePanel: null,
  selectedComponentId: null,
  showHeatmap: false,
  showFlash: true,
  showGrid: false,
  renders: [],
  hierarchy: [],
  metrics: [],
  searchQuery: "",
  minDuration: 0,
  maxRenders: 1e3,
  slowThreshold: 16,
  maxHistorySize: 1e3,
  autoScroll: true,
  // Actions
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setSelectedComponent: (componentId) => set({ selectedComponentId: componentId }),
  toggleHeatmap: () => set((state) => ({ showHeatmap: !state.showHeatmap })),
  toggleFlash: () => set((state) => ({ showFlash: !state.showFlash })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  updateRenders: (renders) => set({ renders }),
  updateHierarchy: (hierarchy2) => set({ hierarchy: hierarchy2 }),
  updateMetrics: (metrics) => set({ metrics }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setMinDuration: (ms) => set({ minDuration: ms }),
  setMaxRenders: (count2) => set({ maxRenders: count2 }),
  setSlowThreshold: (ms) => set({ slowThreshold: ms }),
  clearData: () => set({
    renders: [],
    hierarchy: [],
    metrics: [],
    selectedComponentId: null
  })
}));

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

// src/ui/panels/RenderTimeline.tsx
import { useMemo } from "react";

// src/utils/colors.ts
function performanceToColor(value, threshold) {
  if (value <= threshold.good) {
    return "#10b981";
  } else if (value <= threshold.warning) {
    return "#f59e0b";
  } else {
    return "#ef4444";
  }
}

// src/ui/panels/RenderTimeline.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var RenderTimeline = ({
  events,
  slowThreshold = 16,
  maxEvents = 100,
  onSelectEvent,
  selectedEventId
}) => {
  const recentEvents = useMemo(() => {
    return events.slice(-maxEvents).reverse();
  }, [events, maxEvents]);
  const getPerformanceColor = (duration) => {
    return performanceToColor(duration, {
      good: slowThreshold,
      warning: slowThreshold * 2
    });
  };
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    const ms = (timestamp % 1e3).toFixed(0).padStart(3, "0");
    return `${timeStr}.${ms}`;
  };
  const getRelativeWidth = (duration) => {
    const maxDuration = Math.max(...recentEvents.map((e) => e.duration));
    return Math.max(10, duration / maxDuration * 100);
  };
  if (recentEvents.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-64 text-slate-400", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(
        "svg",
        {
          className: "w-12 h-12 mx-auto mb-2 opacity-50",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx("p", { children: "No renders recorded yet" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b border-slate-700", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-200", children: "Render Timeline" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-slate-400", children: [
        events.length,
        " total renders"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto why-render-scrollbar", children: /* @__PURE__ */ jsx("div", { className: "p-4 space-y-2", children: recentEvents.map((event) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `
                group relative p-3 rounded-lg border cursor-pointer transition-all
                ${selectedEventId === event.id ? "bg-blue-500/10 border-blue-500/50" : "bg-slate-800 border-slate-700 hover:border-slate-600"}
              `,
        onClick: () => onSelectEvent?.(event),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-slate-200", children: event.componentName }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500", children: [
                "#",
                event.renderCount
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-slate-400", children: formatTimestamp(event.timestamp) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "relative h-6 bg-slate-900 rounded overflow-hidden mb-2", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full transition-all duration-300 flex items-center px-2",
              style: {
                width: `${getRelativeWidth(event.duration)}%`,
                backgroundColor: getPerformanceColor(event.duration)
              },
              children: /* @__PURE__ */ jsxs("span", { className: "text-xs font-mono text-white font-semibold", children: [
                event.duration.toFixed(2),
                "ms"
              ] })
            }
          ) }),
          event.changes.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1", children: [
            event.changes.slice(0, 3).map((change, i) => /* @__PURE__ */ jsx(
              "span",
              {
                className: "text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30",
                children: change.key
              },
              i
            )),
            event.changes.length > 3 && /* @__PURE__ */ jsxs("span", { className: "text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400", children: [
              "+",
              event.changes.length - 3,
              " more"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "opacity-0 group-hover:opacity-100 absolute top-full left-0 mt-1 p-2 bg-slate-900 border border-slate-700 rounded shadow-xl text-xs whitespace-nowrap z-10 transition-opacity pointer-events-none", children: "Click to view details" })
        ]
      },
      event.id
    )) }) })
  ] });
};

// src/ui/panels/ComponentStats.tsx
import { useMemo as useMemo2 } from "react";

// src/utils/suggestions.ts
function analyzePropChanges(componentName, changes) {
  const suggestions = [];
  const functionChanges = changes.filter((c) => c.reason === "function");
  const referenceChanges = changes.filter((c) => c.reason === "reference");
  if (functionChanges.length > 0) {
    suggestions.push({
      type: "useCallback",
      severity: functionChanges.length > 2 ? "warning" : "info",
      title: "Unstable Function Props Detected",
      description: `${functionChanges.length} function prop(s) are being recreated on every render. Wrap them with useCallback to maintain referential equality.`,
      affectedProps: functionChanges.map((c) => c.key),
      codeExample: `const ${functionChanges[0].key} = useCallback(() => {
  // your function logic
}, [dependencies]);`
    });
  }
  if (referenceChanges.length > 0) {
    suggestions.push({
      type: "useMemo",
      severity: referenceChanges.length > 2 ? "warning" : "info",
      title: "Unstable Reference Props Detected",
      description: `${referenceChanges.length} object/array prop(s) are being recreated with the same content. Use useMemo to prevent unnecessary re-renders.`,
      affectedProps: referenceChanges.map((c) => c.key),
      codeExample: `const ${referenceChanges[0].key} = useMemo(() => ({
  // your object
}), [dependencies]);`
    });
  }
  const constantLikeChanges = changes.filter(
    (c) => c.reason === "reference" && typeof c.newValue === "object" && JSON.stringify(c.oldValue) === JSON.stringify(c.newValue)
  );
  if (constantLikeChanges.length > 0) {
    suggestions.push({
      type: "moveOutside",
      severity: "info",
      title: "Consider Moving Constants Outside Component",
      description: "Some props appear to be static objects/arrays. Consider moving them outside the component or using useMemo.",
      affectedProps: constantLikeChanges.map((c) => c.key),
      codeExample: `// Move outside component
const STATIC_${constantLikeChanges[0].key.toUpperCase()} = ${JSON.stringify(constantLikeChanges[0].newValue, null, 2).substring(0, 100)}...;

function ${componentName}() {
  // Use STATIC_${constantLikeChanges[0].key.toUpperCase()}
}`
    });
  }
  return suggestions;
}
function analyzePerformance(metrics, threshold = 16) {
  const suggestions = [];
  if (metrics.renderCount > 50) {
    suggestions.push({
      type: "React.memo",
      severity: metrics.renderCount > 100 ? "critical" : "warning",
      title: "Excessive Re-renders Detected",
      description: `This component has rendered ${metrics.renderCount} times. Consider wrapping it with React.memo() to prevent unnecessary renders.`,
      codeExample: `export default React.memo(${metrics.componentName});

// Or with custom comparison
export default React.memo(${metrics.componentName}, (prevProps, nextProps) => {
  // return true if passing nextProps would result in same output
  return prevProps.id === nextProps.id;
});`
    });
  }
  if (metrics.slowRenders > 5) {
    const slowPercentage = metrics.slowRenders / metrics.renderCount * 100;
    suggestions.push({
      type: metrics.averageTime > 100 ? "splitComponent" : "useTransition",
      severity: slowPercentage > 50 ? "critical" : "warning",
      title: "Slow Renders Detected",
      description: `${slowPercentage.toFixed(1)}% of renders exceeded ${threshold}ms. Average: ${metrics.averageTime.toFixed(2)}ms, Max: ${metrics.maxRenderTime.toFixed(2)}ms.`,
      codeExample: metrics.averageTime > 100 ? `// Consider splitting into smaller components
function ${metrics.componentName}() {
  return (
    <>
      <LightweightPart />
      <HeavyPart /> {/* Move expensive logic here */}
    </>
  );
}` : `// Use React 19 transitions for non-urgent updates
import { useTransition } from 'react';

const [isPending, startTransition] = useTransition();

startTransition(() => {
  // Non-urgent state updates
  setState(newValue);
});`
    });
  }
  if (metrics.averageTime > 50 && metrics.renderCount > 10) {
    suggestions.push({
      type: "general",
      severity: "warning",
      title: "Component Optimization Needed",
      description: `Average render time is ${metrics.averageTime.toFixed(2)}ms. This component may benefit from performance optimizations.`,
      codeExample: `// Optimization strategies:
// 1. Memoize expensive calculations with useMemo
// 2. Virtualize long lists (react-window, react-virtual)
// 3. Lazy load heavy components with React.lazy()
// 4. Use React DevTools Profiler to identify bottlenecks`
    });
  }
  return suggestions;
}
function analyzeRenderPatterns(history) {
  const suggestions = [];
  if (history.length < 3) return suggestions;
  let rapidRenderCount = 0;
  for (let i = 1; i < history.length; i++) {
    if (history[i].timestamp - history[i - 1].timestamp < 10) {
      rapidRenderCount++;
    }
  }
  if (rapidRenderCount > 3) {
    suggestions.push({
      type: "general",
      severity: "warning",
      title: "Rapid Re-render Pattern Detected",
      description: `Component is re-rendering multiple times in quick succession (${rapidRenderCount} rapid renders detected). This may indicate a state update loop.`,
      codeExample: `// Common causes:
// 1. useEffect updating state it depends on
useEffect(() => {
  setState(value); // Don't update state that's in dependencies
}, [value]);

// 2. Parent re-rendering due to unstable props
// Use React.memo or stabilize parent props

// 3. Context value changing on every render
// Memoize context value
const value = useMemo(() => ({ data }), [data]);`
    });
  }
  const propChangeFrequency = /* @__PURE__ */ new Map();
  history.forEach((event) => {
    event.changes.forEach((change) => {
      propChangeFrequency.set(
        change.key,
        (propChangeFrequency.get(change.key) || 0) + 1
      );
    });
  });
  const frequentChanges = Array.from(propChangeFrequency.entries()).filter(([_, count2]) => count2 > history.length * 0.8).map(([key]) => key);
  if (frequentChanges.length > 0) {
    suggestions.push({
      type: "general",
      severity: "info",
      title: "Frequently Changing Props",
      description: `Props ${frequentChanges.join(", ")} change in most renders. Verify if all changes are necessary.`,
      affectedProps: frequentChanges
    });
  }
  return suggestions;
}
function getComponentSuggestions(componentName, changes, metrics, history, slowThreshold = 16) {
  const allSuggestions = [
    ...analyzePropChanges(componentName, changes),
    ...analyzePerformance(metrics, slowThreshold),
    ...analyzeRenderPatterns(history)
  ];
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  return allSuggestions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

// src/ui/panels/ComponentStats.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var ComponentStats = ({
  metrics,
  history,
  slowThreshold = 16
}) => {
  const suggestions = useMemo2(() => {
    const latestEvent = history[history.length - 1];
    return getComponentSuggestions(
      metrics.componentName,
      latestEvent?.changes || [],
      metrics,
      history,
      slowThreshold
    );
  }, [metrics, history, slowThreshold]);
  const stats = [
    {
      label: "Total Renders",
      value: metrics.renderCount,
      icon: "\u{1F504}",
      color: "text-blue-400"
    },
    {
      label: "Average Time",
      value: `${metrics.averageTime.toFixed(2)}ms`,
      icon: "\u23F1\uFE0F",
      color: performanceToColor(metrics.averageTime, {
        good: slowThreshold,
        warning: slowThreshold * 2
      })
    },
    {
      label: "Total Time",
      value: `${metrics.totalTime.toFixed(2)}ms`,
      icon: "\u23F3",
      color: "text-purple-400"
    },
    {
      label: "Slowest Render",
      value: `${metrics.maxRenderTime.toFixed(2)}ms`,
      icon: "\u{1F40C}",
      color: performanceToColor(metrics.maxRenderTime, {
        good: slowThreshold,
        warning: slowThreshold * 2
      })
    },
    {
      label: "Fastest Render",
      value: `${metrics.minRenderTime.toFixed(2)}ms`,
      icon: "\u26A1",
      color: "text-green-400"
    },
    {
      label: "Slow Renders",
      value: `${metrics.slowRenders} (${(metrics.slowRenders / metrics.renderCount * 100).toFixed(1)}%)`,
      icon: "\u26A0\uFE0F",
      color: metrics.slowRenders > 0 ? "text-amber-400" : "text-green-400"
    }
  ];
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return "\u{1F534}";
      case "warning":
        return "\u{1F7E1}";
      case "info":
      default:
        return "\u{1F535}";
    }
  };
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "border-red-500/50 bg-red-500/10";
      case "warning":
        return "border-amber-500/50 bg-amber-500/10";
      case "info":
      default:
        return "border-blue-500/50 bg-blue-500/10";
    }
  };
  return /* @__PURE__ */ jsxs2("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ jsxs2("div", { className: "p-4 border-b border-slate-700", children: [
      /* @__PURE__ */ jsx2("h3", { className: "text-lg font-semibold text-slate-200", children: metrics.componentName }),
      /* @__PURE__ */ jsx2("p", { className: "text-sm text-slate-400 mt-1", children: "Component Performance Stats" })
    ] }),
    /* @__PURE__ */ jsxs2("div", { className: "flex-1 overflow-y-auto why-render-scrollbar", children: [
      /* @__PURE__ */ jsx2("div", { className: "p-4", children: /* @__PURE__ */ jsx2("div", { className: "grid grid-cols-2 gap-3", children: stats.map((stat, index) => /* @__PURE__ */ jsxs2(
        "div",
        {
          className: "p-3 bg-slate-800 border border-slate-700 rounded-lg",
          children: [
            /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx2("span", { className: "text-lg", children: stat.icon }),
              /* @__PURE__ */ jsx2("span", { className: "text-xs text-slate-400", children: stat.label })
            ] }),
            /* @__PURE__ */ jsx2(
              "div",
              {
                className: "text-lg font-bold font-mono",
                style: { color: stat.color },
                children: stat.value
              }
            )
          ]
        },
        index
      )) }) }),
      suggestions.length > 0 && /* @__PURE__ */ jsxs2("div", { className: "p-4 border-t border-slate-700", children: [
        /* @__PURE__ */ jsxs2("h4", { className: "text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx2("span", { children: "\u{1F4A1}" }),
          "Optimization Suggestions"
        ] }),
        /* @__PURE__ */ jsx2("div", { className: "space-y-3", children: suggestions.map((suggestion, index) => /* @__PURE__ */ jsxs2(
          "div",
          {
            className: `p-3 rounded-lg border ${getSeverityColor(
              suggestion.severity
            )}`,
            children: [
              /* @__PURE__ */ jsxs2("div", { className: "flex items-start gap-2 mb-2", children: [
                /* @__PURE__ */ jsx2("span", { className: "text-sm", children: getSeverityIcon(suggestion.severity) }),
                /* @__PURE__ */ jsxs2("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsx2("h5", { className: "text-sm font-semibold text-slate-200", children: suggestion.title }),
                  /* @__PURE__ */ jsx2("p", { className: "text-xs text-slate-400 mt-1", children: suggestion.description })
                ] })
              ] }),
              suggestion.affectedProps && suggestion.affectedProps.length > 0 && /* @__PURE__ */ jsx2("div", { className: "flex flex-wrap gap-1 mb-2", children: suggestion.affectedProps.map((prop, i) => /* @__PURE__ */ jsx2(
                "span",
                {
                  className: "text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono",
                  children: prop
                },
                i
              )) }),
              suggestion.codeExample && /* @__PURE__ */ jsxs2("details", { className: "mt-2", children: [
                /* @__PURE__ */ jsx2("summary", { className: "text-xs text-blue-400 cursor-pointer hover:text-blue-300", children: "View code example" }),
                /* @__PURE__ */ jsx2("pre", { className: "mt-2 p-2 bg-slate-900 rounded text-xs overflow-x-auto", children: /* @__PURE__ */ jsx2("code", { className: "text-slate-300 font-mono", children: suggestion.codeExample }) })
              ] })
            ]
          },
          index
        )) })
      ] })
    ] })
  ] });
};

// src/ui/panels/DiffViewer.tsx
import { useState } from "react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var DiffViewer = ({
  changes,
  componentName
}) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const formatValue = (value) => {
    if (value === void 0) return "undefined";
    if (value === null) return "null";
    if (typeof value === "function") return "[Function]";
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };
  const getReasonIcon = (reason) => {
    switch (reason) {
      case "function":
        return "\u{1F527}";
      case "reference":
        return "\u{1F517}";
      case "type":
        return "\u{1F3F7}\uFE0F";
      case "length":
        return "\u{1F4CF}";
      case "value":
      default:
        return "\u270F\uFE0F";
    }
  };
  const getReasonColor = (reason) => {
    switch (reason) {
      case "function":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "reference":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "type":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "length":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "value":
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };
  if (changes.length === 0) {
    return /* @__PURE__ */ jsx3("div", { className: "flex items-center justify-center h-64 text-slate-400", children: /* @__PURE__ */ jsxs3("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx3(
        "svg",
        {
          className: "w-12 h-12 mx-auto mb-2 opacity-50",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx3(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx3("p", { children: "No prop changes detected" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs3("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ jsxs3("div", { className: "p-4 border-b border-slate-700", children: [
      /* @__PURE__ */ jsxs3("h3", { className: "text-lg font-semibold text-slate-200", children: [
        "Prop Changes - ",
        componentName
      ] }),
      /* @__PURE__ */ jsxs3("p", { className: "text-sm text-slate-400 mt-1", children: [
        changes.length,
        " change",
        changes.length !== 1 ? "s" : "",
        " detected"
      ] })
    ] }),
    /* @__PURE__ */ jsx3("div", { className: "flex-1 overflow-y-auto why-render-scrollbar", children: /* @__PURE__ */ jsx3("div", { className: "p-4 space-y-3", children: changes.map((change, index) => /* @__PURE__ */ jsxs3(
      "div",
      {
        className: "bg-slate-800 border border-slate-700 rounded-lg overflow-hidden",
        children: [
          /* @__PURE__ */ jsx3(
            "div",
            {
              className: "p-3 cursor-pointer hover:bg-slate-750 transition-colors",
              onClick: () => setExpandedIndex(expandedIndex === index ? null : index),
              children: /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx3("span", { className: "text-lg", children: getReasonIcon(change.reason) }),
                  /* @__PURE__ */ jsx3("span", { className: "font-mono text-sm font-semibold text-slate-200", children: change.key }),
                  /* @__PURE__ */ jsx3(
                    "span",
                    {
                      className: `text-xs px-2 py-0.5 rounded border ${getReasonColor(
                        change.reason
                      )}`,
                      children: change.reason
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx3(
                  "svg",
                  {
                    className: `w-4 h-4 text-slate-400 transition-transform ${expandedIndex === index ? "rotate-180" : ""}`,
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    children: /* @__PURE__ */ jsx3(
                      "path",
                      {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M19 9l-7 7-7-7"
                      }
                    )
                  }
                )
              ] })
            }
          ),
          expandedIndex === index && /* @__PURE__ */ jsx3("div", { className: "border-t border-slate-700", children: /* @__PURE__ */ jsxs3("div", { className: "grid grid-cols-2 divide-x divide-slate-700", children: [
            /* @__PURE__ */ jsxs3("div", { className: "p-3", children: [
              /* @__PURE__ */ jsx3("div", { className: "text-xs font-semibold text-red-400 mb-2", children: "Previous Value" }),
              /* @__PURE__ */ jsx3("pre", { className: "text-xs bg-slate-900 p-2 rounded overflow-x-auto", children: /* @__PURE__ */ jsx3("code", { className: "text-slate-300 font-mono", children: formatValue(change.oldValue) }) })
            ] }),
            /* @__PURE__ */ jsxs3("div", { className: "p-3", children: [
              /* @__PURE__ */ jsx3("div", { className: "text-xs font-semibold text-green-400 mb-2", children: "New Value" }),
              /* @__PURE__ */ jsx3("pre", { className: "text-xs bg-slate-900 p-2 rounded overflow-x-auto", children: /* @__PURE__ */ jsx3("code", { className: "text-slate-300 font-mono", children: formatValue(change.newValue) }) })
            ] })
          ] }) })
        ]
      },
      index
    )) }) })
  ] });
};

// src/ui/panels/FlameGraph.tsx
import { useMemo as useMemo3, useState as useState2 } from "react";

// node_modules/d3-hierarchy/src/hierarchy/count.js
function count(node) {
  var sum = 0, children = node.children, i = children && children.length;
  if (!i) sum = 1;
  else while (--i >= 0) sum += children[i].value;
  node.value = sum;
}
function count_default() {
  return this.eachAfter(count);
}

// node_modules/d3-hierarchy/src/hierarchy/each.js
function each_default(callback, that) {
  let index = -1;
  for (const node of this) {
    callback.call(that, node, ++index, this);
  }
  return this;
}

// node_modules/d3-hierarchy/src/hierarchy/eachBefore.js
function eachBefore_default(callback, that) {
  var node = this, nodes = [node], children, i, index = -1;
  while (node = nodes.pop()) {
    callback.call(that, node, ++index, this);
    if (children = node.children) {
      for (i = children.length - 1; i >= 0; --i) {
        nodes.push(children[i]);
      }
    }
  }
  return this;
}

// node_modules/d3-hierarchy/src/hierarchy/eachAfter.js
function eachAfter_default(callback, that) {
  var node = this, nodes = [node], next = [], children, i, n, index = -1;
  while (node = nodes.pop()) {
    next.push(node);
    if (children = node.children) {
      for (i = 0, n = children.length; i < n; ++i) {
        nodes.push(children[i]);
      }
    }
  }
  while (node = next.pop()) {
    callback.call(that, node, ++index, this);
  }
  return this;
}

// node_modules/d3-hierarchy/src/hierarchy/find.js
function find_default(callback, that) {
  let index = -1;
  for (const node of this) {
    if (callback.call(that, node, ++index, this)) {
      return node;
    }
  }
}

// node_modules/d3-hierarchy/src/hierarchy/sum.js
function sum_default(value) {
  return this.eachAfter(function(node) {
    var sum = +value(node.data) || 0, children = node.children, i = children && children.length;
    while (--i >= 0) sum += children[i].value;
    node.value = sum;
  });
}

// node_modules/d3-hierarchy/src/hierarchy/sort.js
function sort_default(compare) {
  return this.eachBefore(function(node) {
    if (node.children) {
      node.children.sort(compare);
    }
  });
}

// node_modules/d3-hierarchy/src/hierarchy/path.js
function path_default(end) {
  var start = this, ancestor = leastCommonAncestor(start, end), nodes = [start];
  while (start !== ancestor) {
    start = start.parent;
    nodes.push(start);
  }
  var k = nodes.length;
  while (end !== ancestor) {
    nodes.splice(k, 0, end);
    end = end.parent;
  }
  return nodes;
}
function leastCommonAncestor(a, b) {
  if (a === b) return a;
  var aNodes = a.ancestors(), bNodes = b.ancestors(), c = null;
  a = aNodes.pop();
  b = bNodes.pop();
  while (a === b) {
    c = a;
    a = aNodes.pop();
    b = bNodes.pop();
  }
  return c;
}

// node_modules/d3-hierarchy/src/hierarchy/ancestors.js
function ancestors_default() {
  var node = this, nodes = [node];
  while (node = node.parent) {
    nodes.push(node);
  }
  return nodes;
}

// node_modules/d3-hierarchy/src/hierarchy/descendants.js
function descendants_default() {
  return Array.from(this);
}

// node_modules/d3-hierarchy/src/hierarchy/leaves.js
function leaves_default() {
  var leaves = [];
  this.eachBefore(function(node) {
    if (!node.children) {
      leaves.push(node);
    }
  });
  return leaves;
}

// node_modules/d3-hierarchy/src/hierarchy/links.js
function links_default() {
  var root = this, links = [];
  root.each(function(node) {
    if (node !== root) {
      links.push({ source: node.parent, target: node });
    }
  });
  return links;
}

// node_modules/d3-hierarchy/src/hierarchy/iterator.js
function* iterator_default() {
  var node = this, current, next = [node], children, i, n;
  do {
    current = next.reverse(), next = [];
    while (node = current.pop()) {
      yield node;
      if (children = node.children) {
        for (i = 0, n = children.length; i < n; ++i) {
          next.push(children[i]);
        }
      }
    }
  } while (next.length);
}

// node_modules/d3-hierarchy/src/hierarchy/index.js
function hierarchy(data, children) {
  if (data instanceof Map) {
    data = [void 0, data];
    if (children === void 0) children = mapChildren;
  } else if (children === void 0) {
    children = objectChildren;
  }
  var root = new Node(data), node, nodes = [root], child, childs, i, n;
  while (node = nodes.pop()) {
    if ((childs = children(node.data)) && (n = (childs = Array.from(childs)).length)) {
      node.children = childs;
      for (i = n - 1; i >= 0; --i) {
        nodes.push(child = childs[i] = new Node(childs[i]));
        child.parent = node;
        child.depth = node.depth + 1;
      }
    }
  }
  return root.eachBefore(computeHeight);
}
function node_copy() {
  return hierarchy(this).eachBefore(copyData);
}
function objectChildren(d) {
  return d.children;
}
function mapChildren(d) {
  return Array.isArray(d) ? d[1] : null;
}
function copyData(node) {
  if (node.data.value !== void 0) node.value = node.data.value;
  node.data = node.data.data;
}
function computeHeight(node) {
  var height = 0;
  do
    node.height = height;
  while ((node = node.parent) && node.height < ++height);
}
function Node(data) {
  this.data = data;
  this.depth = this.height = 0;
  this.parent = null;
}
Node.prototype = hierarchy.prototype = {
  constructor: Node,
  count: count_default,
  each: each_default,
  eachAfter: eachAfter_default,
  eachBefore: eachBefore_default,
  find: find_default,
  sum: sum_default,
  sort: sort_default,
  path: path_default,
  ancestors: ancestors_default,
  descendants: descendants_default,
  leaves: leaves_default,
  links: links_default,
  copy: node_copy,
  [Symbol.iterator]: iterator_default
};

// node_modules/d3-hierarchy/src/treemap/round.js
function round_default(node) {
  node.x0 = Math.round(node.x0);
  node.y0 = Math.round(node.y0);
  node.x1 = Math.round(node.x1);
  node.y1 = Math.round(node.y1);
}

// node_modules/d3-hierarchy/src/treemap/dice.js
function dice_default(parent, x0, y0, x1, y1) {
  var nodes = parent.children, node, i = -1, n = nodes.length, k = parent.value && (x1 - x0) / parent.value;
  while (++i < n) {
    node = nodes[i], node.y0 = y0, node.y1 = y1;
    node.x0 = x0, node.x1 = x0 += node.value * k;
  }
}

// node_modules/d3-hierarchy/src/partition.js
function partition_default() {
  var dx = 1, dy = 1, padding = 0, round = false;
  function partition(root) {
    var n = root.height + 1;
    root.x0 = root.y0 = padding;
    root.x1 = dx;
    root.y1 = dy / n;
    root.eachBefore(positionNode(dy, n));
    if (round) root.eachBefore(round_default);
    return root;
  }
  function positionNode(dy2, n) {
    return function(node) {
      if (node.children) {
        dice_default(node, node.x0, dy2 * (node.depth + 1) / n, node.x1, dy2 * (node.depth + 2) / n);
      }
      var x0 = node.x0, y0 = node.y0, x1 = node.x1 - padding, y1 = node.y1 - padding;
      if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
      if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
      node.x0 = x0;
      node.y0 = y0;
      node.x1 = x1;
      node.y1 = y1;
    };
  }
  partition.round = function(x) {
    return arguments.length ? (round = !!x, partition) : round;
  };
  partition.size = function(x) {
    return arguments.length ? (dx = +x[0], dy = +x[1], partition) : [dx, dy];
  };
  partition.padding = function(x) {
    return arguments.length ? (padding = +x, partition) : padding;
  };
  return partition;
}

// src/ui/panels/FlameGraph.tsx
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var FlameGraph = ({
  width = 800,
  height = 400
}) => {
  const { renders, hierarchy: hierarchy2 } = useDevToolsStore();
  const [selectedNode, setSelectedNode] = useState2(null);
  const rootData = useMemo3(() => {
    if (!hierarchy2 || hierarchy2.length === 0) return null;
    const buildTree = (nodes) => {
      return nodes.map((node) => {
        const componentRenders = renders.filter((r) => r.componentId === node.componentId);
        const lastRender = componentRenders[componentRenders.length - 1];
        const duration = lastRender?.duration || 0.1;
        return {
          name: node.componentName,
          value: duration,
          componentId: node.componentId,
          actualDuration: duration,
          children: node.children ? buildTree(node.children) : void 0
        };
      });
    };
    const children = buildTree(hierarchy2);
    return {
      name: "Root",
      value: 0,
      // Will be summed by d3
      componentId: "root",
      actualDuration: 0,
      children
    };
  }, [hierarchy2, renders]);
  const root = useMemo3(() => {
    if (!rootData) return null;
    const hierarchyNode = hierarchy(rootData).sum((d) => d.value).sort((a, b) => (b.value || 0) - (a.value || 0));
    const partition = partition_default().size([width, height]).padding(1);
    return partition(hierarchyNode);
  }, [rootData, width, height]);
  if (!root) {
    return /* @__PURE__ */ jsx4("div", { className: "flex items-center justify-center h-full text-slate-400", children: "No render data available yet" });
  }
  return /* @__PURE__ */ jsxs4("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsx4("div", { className: "flex-1 overflow-hidden relative bg-slate-900 rounded-lg border border-slate-700", children: /* @__PURE__ */ jsx4("svg", { width: "100%", height: "100%", viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "none", children: root.descendants().map((node, i) => {
      if (node.depth === 0) return null;
      const isSelected = selectedNode === node;
      const color = performanceToColor(node.data.actualDuration, { good: 4, warning: 16 });
      return /* @__PURE__ */ jsxs4(
        "g",
        {
          transform: `translate(${node.x0},${node.y0})`,
          onClick: () => setSelectedNode(node),
          className: "cursor-pointer transition-opacity hover:opacity-80",
          children: [
            /* @__PURE__ */ jsx4(
              "rect",
              {
                width: Math.max(0, node.x1 - node.x0),
                height: Math.max(0, node.y1 - node.y0),
                fill: color,
                fillOpacity: isSelected ? 1 : 0.8,
                stroke: isSelected ? "#fff" : "none",
                strokeWidth: 2,
                rx: 2
              }
            ),
            node.x1 - node.x0 > 30 && node.y1 - node.y0 > 14 && /* @__PURE__ */ jsx4(
              "text",
              {
                x: 4,
                y: 14,
                fontSize: 10,
                fill: "#fff",
                className: "pointer-events-none font-mono select-none",
                style: { textShadow: "0 1px 2px rgba(0,0,0,0.5)" },
                children: node.data.name
              }
            )
          ]
        },
        `${node.data.componentId}-${i}`
      );
    }) }) }),
    /* @__PURE__ */ jsxs4("div", { className: "h-16 border-t border-slate-700 p-2 bg-slate-800 flex items-center justify-between", children: [
      selectedNode ? /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsx4("div", { className: "font-bold text-slate-200", children: selectedNode.data.name }),
        /* @__PURE__ */ jsxs4("div", { className: "text-xs text-slate-400 font-mono", children: [
          "Duration: ",
          selectedNode.data.actualDuration.toFixed(2),
          "ms",
          /* @__PURE__ */ jsx4("span", { className: "mx-2", children: "\u2022" }),
          "Depth: ",
          selectedNode.depth
        ] })
      ] }) : /* @__PURE__ */ jsx4("div", { className: "text-slate-500 text-sm italic", children: "Click a bar to view details" }),
      /* @__PURE__ */ jsx4("div", { className: "text-xs text-slate-500", children: "Flame Graph" })
    ] })
  ] });
};

// src/ui/panels/ComponentTree.tsx
import { useState as useState3, useMemo as useMemo4 } from "react";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var TreeNode = ({
  node,
  depth,
  onSelect,
  selectedId,
  metricsMap,
  slowThreshold
}) => {
  const [isExpanded, setIsExpanded] = useState3(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.componentId === selectedId;
  const metric = metricsMap.get(node.componentId);
  const renderCount = metric?.renderCount ?? 0;
  const lastRenderTime = metric?.lastRenderTime ?? 0;
  const badgeColor = metric ? performanceToColor(lastRenderTime, { good: slowThreshold / 2, warning: slowThreshold }) : void 0;
  return /* @__PURE__ */ jsxs5("div", { className: "select-none", children: [
    /* @__PURE__ */ jsxs5(
      "div",
      {
        className: `
          flex items-center py-1 px-2 hover:bg-slate-800 cursor-pointer
          ${isSelected ? "bg-blue-900/30 border-l-2 border-blue-500" : "border-l-2 border-transparent"}
        `,
        style: { paddingLeft: `${depth * 16 + 8}px` },
        onClick: () => onSelect(node.componentId),
        children: [
          /* @__PURE__ */ jsx5(
            "button",
            {
              className: `w-4 h-4 mr-1 flex items-center justify-center text-slate-400 hover:text-white ${!hasChildren ? "invisible" : ""}`,
              onClick: (e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              },
              children: isExpanded ? "\u25BC" : "\u25B6"
            }
          ),
          /* @__PURE__ */ jsx5("span", { className: "text-sm font-mono text-slate-300 truncate mr-2", children: node.componentName }),
          renderCount > 0 && /* @__PURE__ */ jsx5(
            "span",
            {
              className: "ml-auto text-xs px-1.5 py-0.5 rounded-full text-slate-900 font-medium min-w-[20px] text-center",
              style: { backgroundColor: badgeColor || "#94a3b8" },
              title: `Last render: ${lastRenderTime.toFixed(2)}ms | Total renders: ${renderCount}`,
              children: renderCount
            }
          )
        ]
      }
    ),
    isExpanded && hasChildren && /* @__PURE__ */ jsx5("div", { children: node.children.map((child) => /* @__PURE__ */ jsx5(
      TreeNode,
      {
        node: child,
        depth: depth + 1,
        onSelect,
        selectedId,
        metricsMap,
        slowThreshold
      },
      child.componentId
    )) })
  ] });
};
var ComponentTree = () => {
  const { hierarchy: hierarchy2, selectedComponentId, setSelectedComponent, metrics, slowThreshold } = useDevToolsStore();
  const metricsMap = useMemo4(() => {
    return new Map(metrics.map((m) => [m.componentId, m]));
  }, [metrics]);
  if (!hierarchy2 || hierarchy2.length === 0) {
    return /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-center h-full text-slate-400 p-4", children: [
      "No component hierarchy detected.",
      /* @__PURE__ */ jsx5("br", {}),
      "Make sure to use 'withWhyRender' or 'useWhyRender' in your components."
    ] });
  }
  return /* @__PURE__ */ jsx5("div", { className: "h-full overflow-y-auto why-render-scrollbar bg-slate-900/50", children: /* @__PURE__ */ jsx5("div", { className: "p-2", children: hierarchy2.map((node) => /* @__PURE__ */ jsx5(
    TreeNode,
    {
      node,
      depth: 0,
      onSelect: setSelectedComponent,
      selectedId: selectedComponentId,
      metricsMap,
      slowThreshold
    },
    node.componentId
  )) }) });
};

// src/ui/WhyRenderDevTools.tsx
import { Fragment, jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var WhyRenderDevTools = ({
  slowThreshold = 16,
  position = "bottom-right",
  toggleShortcut = "Meta+Shift+D"
}) => {
  const {
    isOpen,
    activePanel,
    selectedComponentId,
    renders,
    metrics,
    toggleOpen,
    setActivePanel,
    updateRenders,
    updateHierarchy,
    updateMetrics
  } = useDevToolsStore();
  useEffect(() => {
    globalPerformanceMonitor.setSlowThreshold(slowThreshold);
  }, [slowThreshold]);
  useEffect(() => {
    const syncData = () => {
      const exportedData = globalRenderTracker.export();
      updateRenders(exportedData.history);
      updateHierarchy(exportedData.hierarchy);
      updateMetrics(exportedData.metrics);
    };
    syncData();
    const unsubscribe = globalEventEmitter.on("render:end", syncData);
    return () => {
      unsubscribe();
    };
  }, [updateRenders, updateHierarchy, updateMetrics]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      const parts = toggleShortcut.split("+");
      const meta = parts.includes("Meta") ? e.metaKey : false;
      const shift = parts.includes("Shift") ? e.shiftKey : false;
      const key = parts[parts.length - 1].toLowerCase();
      if (meta && shift && e.key.toLowerCase() === key) {
        e.preventDefault();
        toggleOpen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleShortcut, toggleOpen]);
  const selectedMetrics = metrics.find(
    (m) => m.componentId === selectedComponentId
  );
  const selectedHistory = selectedComponentId ? globalRenderTracker.getComponentHistory(selectedComponentId) : [];
  const latestRender = selectedHistory[selectedHistory.length - 1];
  const positionClasses = {
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4"
  };
  const renderPanel = () => {
    switch (activePanel) {
      case "timeline":
        return /* @__PURE__ */ jsx6(
          RenderTimeline,
          {
            events: renders,
            slowThreshold,
            maxEvents: 100,
            onSelectEvent: () => {
              setActivePanel("stats");
            },
            selectedEventId: latestRender?.id
          }
        );
      case "stats":
        if (!selectedMetrics || !latestRender) {
          return /* @__PURE__ */ jsx6("div", { className: "flex items-center justify-center h-full text-slate-400", children: "Select a component from the timeline" });
        }
        return /* @__PURE__ */ jsx6(
          ComponentStats,
          {
            metrics: selectedMetrics,
            history: selectedHistory,
            slowThreshold
          }
        );
      case "diff":
        if (!latestRender) {
          return /* @__PURE__ */ jsx6("div", { className: "flex items-center justify-center h-full text-slate-400", children: "Select a component from the timeline" });
        }
        return /* @__PURE__ */ jsx6(
          DiffViewer,
          {
            changes: latestRender.changes,
            componentName: latestRender.componentName
          }
        );
      case "flamegraph":
        return /* @__PURE__ */ jsx6(FlameGraph, {});
      case "tree":
        return /* @__PURE__ */ jsx6(ComponentTree, {});
      default:
        return /* @__PURE__ */ jsx6(
          RenderTimeline,
          {
            events: renders,
            slowThreshold,
            maxEvents: 100,
            selectedEventId: latestRender?.id
          }
        );
    }
  };
  const tabs = [
    { id: "timeline", label: "Timeline", icon: "\u23F1\uFE0F" },
    { id: "stats", label: "Stats", icon: "\u{1F4CA}" },
    { id: "diff", label: "Diff", icon: "\u{1F4DD}" },
    { id: "flamegraph", label: "Flame", icon: "\u{1F525}" },
    { id: "tree", label: "Tree", icon: "\u{1F333}" }
  ];
  return /* @__PURE__ */ jsxs6(Fragment, { children: [
    !isOpen && /* @__PURE__ */ jsxs6(
      "button",
      {
        onClick: toggleOpen,
        className: `
            fixed ${positionClasses[position]} z-[9999]
            px-4 py-2 bg-blue-500 hover:bg-blue-600
            text-white rounded-lg shadow-lg
            transition-all duration-300 hover:scale-105
            flex items-center gap-2 font-medium text-sm
            animate-pulse-glow
          `,
        title: `Toggle DevTools (${toggleShortcut})`,
        children: [
          /* @__PURE__ */ jsx6(
            "svg",
            {
              className: "w-4 h-4",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /* @__PURE__ */ jsx6(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M13 10V3L4 14h7v7l9-11h-7z"
                }
              )
            }
          ),
          "Why Render"
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsx6(
      "div",
      {
        className: "fixed inset-0 z-[9998] flex items-end justify-end p-4 pointer-events-none",
        style: { fontFamily: "system-ui, sans-serif" },
        children: /* @__PURE__ */ jsxs6(
          "div",
          {
            className: "\n              w-full max-w-4xl h-[600px]\n              why-render-panel\n              flex flex-col\n              pointer-events-auto\n              animate-slide-in-up\n            ",
            children: [
              /* @__PURE__ */ jsxs6("div", { className: "flex items-center justify-between p-4 border-b border-slate-700", children: [
                /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx6(
                    "svg",
                    {
                      className: "w-6 h-6 text-blue-400",
                      fill: "none",
                      viewBox: "0 0 24 24",
                      stroke: "currentColor",
                      children: /* @__PURE__ */ jsx6(
                        "path",
                        {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M13 10V3L4 14h7v7l9-11h-7z"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx6("h2", { className: "text-xl font-bold text-slate-100", children: "Why Render DevTools" }),
                  /* @__PURE__ */ jsx6("span", { className: "text-xs text-slate-500", children: "v0.1.0" })
                ] }),
                /* @__PURE__ */ jsx6(
                  "button",
                  {
                    onClick: toggleOpen,
                    className: "p-2 hover:bg-slate-800 rounded-lg transition-colors",
                    title: "Close (Esc)",
                    children: /* @__PURE__ */ jsx6(
                      "svg",
                      {
                        className: "w-5 h-5 text-slate-400",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        children: /* @__PURE__ */ jsx6(
                          "path",
                          {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M6 18L18 6M6 6l12 12"
                          }
                        )
                      }
                    )
                  }
                )
              ] }),
              /* @__PURE__ */ jsx6("div", { className: "flex border-b border-slate-700", children: tabs.map((tab) => /* @__PURE__ */ jsxs6(
                "button",
                {
                  onClick: () => setActivePanel(tab.id),
                  className: `
                    px-4 py-2 font-medium text-sm transition-colors
                    border-b-2 flex items-center gap-2
                    ${activePanel === tab.id || activePanel === null && tab.id === "timeline" ? "text-blue-400 border-blue-400" : "text-slate-400 border-transparent hover:text-slate-300"}
                  `,
                  children: [
                    /* @__PURE__ */ jsx6("span", { children: tab.icon }),
                    tab.label
                  ]
                },
                tab.id
              )) }),
              /* @__PURE__ */ jsx6("div", { className: "flex-1 overflow-hidden", children: renderPanel() })
            ]
          }
        )
      }
    )
  ] });
};

// src/ui/components/PerformanceBadge.tsx
import { useEffect as useEffect2, useState as useState4 } from "react";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var PerformanceBadge = ({
  renderCount,
  componentName,
  lastRenderDuration,
  threshold = 16,
  position = "top-right",
  inline = false
}) => {
  const [isGlowing, setIsGlowing] = useState4(false);
  const [prevCount, setPrevCount] = useState4(renderCount);
  useEffect2(() => {
    if (renderCount > prevCount) {
      setIsGlowing(true);
      const timeout = setTimeout(() => setIsGlowing(false), 500);
      setPrevCount(renderCount);
      return () => clearTimeout(timeout);
    }
  }, [renderCount, prevCount]);
  const getSeverityColor = () => {
    if (!lastRenderDuration) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (lastRenderDuration <= threshold) {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    } else if (lastRenderDuration <= threshold * 2) {
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    } else {
      return "bg-red-500/20 text-red-400 border-red-500/30";
    }
  };
  const positionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2"
  };
  const badgeClass = `
    inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border
    ${getSeverityColor()}
    ${isGlowing ? "animate-pulse-glow" : ""}
    ${!inline ? `fixed ${positionClasses[position]} z-[9999]` : ""}
    transition-all duration-300
  `;
  return /* @__PURE__ */ jsxs7("div", { className: badgeClass, title: componentName, children: [
    /* @__PURE__ */ jsx7(
      "svg",
      {
        className: "w-3 h-3",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: /* @__PURE__ */ jsx7(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M13 10V3L4 14h7v7l9-11h-7z"
          }
        )
      }
    ),
    /* @__PURE__ */ jsx7("span", { className: "font-mono", children: renderCount }),
    lastRenderDuration !== void 0 && /* @__PURE__ */ jsxs7("span", { className: "opacity-70 font-mono", children: [
      lastRenderDuration.toFixed(1),
      "ms"
    ] })
  ] });
};
export {
  ComponentStats,
  DiffViewer,
  PerformanceBadge,
  RenderTimeline,
  WhyRenderDevTools
};
//# sourceMappingURL=ui.js.map
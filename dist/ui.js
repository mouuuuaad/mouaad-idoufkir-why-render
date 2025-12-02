import {
  globalPerformanceMonitor,
  globalRenderTracker
} from "./chunk-7MZUDFGY.js";
import {
  useDevToolsStore
} from "./chunk-DOIGLAQ4.js";
import {
  globalEventEmitter
} from "./chunk-WISWZH32.js";

// src/ui/WhyRenderDevTools.tsx
import { useEffect } from "react";

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
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full text-slate-400 p-8", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 mb-4 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 shadow-inner", children: /* @__PURE__ */ jsx(
        "svg",
        {
          className: "w-8 h-8 text-slate-500",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 1.5,
              d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            }
          )
        }
      ) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-slate-300 mb-1", children: "No renders recorded yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 text-center max-w-xs", children: "Interact with your application to capture render events and performance metrics." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm font-semibold text-slate-200 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-indigo-500" }),
        "Render Timeline"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/30", children: [
        events.length,
        " events"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto why-render-scrollbar p-4 space-y-3", children: recentEvents.map((event, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `
              group relative p-3 rounded-xl border cursor-pointer transition-all duration-200
              ${selectedEventId === event.id ? "bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/60 hover:border-slate-600/60 hover:shadow-lg hover:-translate-y-0.5"}
              animate-slide-in-right
            `,
        style: { animationDelay: `${index * 50}ms` },
        onClick: () => onSelectEvent?.(event),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: `text-sm font-semibold tracking-tight ${selectedEventId === event.id ? "text-indigo-300" : "text-slate-200"}`, children: event.componentName }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 border border-slate-600/30", children: [
                "#",
                event.renderCount
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-slate-500 bg-slate-900/30 px-1.5 py-0.5 rounded", children: formatTimestamp(event.timestamp) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "relative h-1.5 bg-slate-700/30 rounded-full overflow-hidden mb-3", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out",
              style: {
                width: `${getRelativeWidth(event.duration)}%`,
                backgroundColor: getPerformanceColor(event.duration),
                boxShadow: `0 0 8px ${getPerformanceColor(event.duration)}`
              }
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Duration" }),
            /* @__PURE__ */ jsxs("span", { className: "font-mono font-medium", style: { color: getPerformanceColor(event.duration) }, children: [
              event.duration.toFixed(2),
              "ms"
            ] })
          ] }),
          event.changes.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5 pt-2 border-t border-slate-700/30", children: [
            event.changes.slice(0, 3).map((change, i) => /* @__PURE__ */ jsx(
              "span",
              {
                className: "text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium",
                children: change.key
              },
              i
            )),
            event.changes.length > 3 && /* @__PURE__ */ jsxs("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 border border-slate-600/30", children: [
              "+",
              event.changes.length - 3
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "opacity-0 group-hover:opacity-100 absolute top-2 right-2 transition-opacity duration-200", children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-slate-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })
        ]
      },
      event.id
    )) })
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
      icon: /* @__PURE__ */ jsx2("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }),
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20"
    },
    {
      label: "Average Time",
      value: `${metrics.averageTime.toFixed(2)}ms`,
      icon: /* @__PURE__ */ jsx2("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
      color: performanceToColor(metrics.averageTime, {
        good: slowThreshold,
        warning: slowThreshold * 2
      }),
      bg: "bg-slate-800/50 border-slate-700/50"
    },
    {
      label: "Total Time",
      value: `${metrics.totalTime.toFixed(2)}ms`,
      icon: /* @__PURE__ */ jsx2("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20"
    },
    {
      label: "Slowest Render",
      value: `${metrics.maxRenderTime.toFixed(2)}ms`,
      icon: /* @__PURE__ */ jsx2("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
      color: performanceToColor(metrics.maxRenderTime, {
        good: slowThreshold,
        warning: slowThreshold * 2
      }),
      bg: "bg-slate-800/50 border-slate-700/50"
    },
    {
      label: "Fastest Render",
      value: `${metrics.minRenderTime.toFixed(2)}ms`,
      icon: /* @__PURE__ */ jsx2("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20"
    },
    {
      label: "Slow Renders",
      value: `${metrics.slowRenders} (${metrics.renderCount > 0 ? (metrics.slowRenders / metrics.renderCount * 100).toFixed(1) : 0}%)`,
      icon: /* @__PURE__ */ jsx2("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }),
      color: metrics.slowRenders > 0 ? "text-amber-400" : "text-emerald-400",
      bg: metrics.slowRenders > 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"
    }
  ];
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return /* @__PURE__ */ jsxs2("span", { className: "flex h-2 w-2 relative", children: [
          /* @__PURE__ */ jsx2("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" }),
          /* @__PURE__ */ jsx2("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-rose-500" })
        ] });
      case "warning":
        return /* @__PURE__ */ jsx2("span", { className: "h-2 w-2 rounded-full bg-amber-500" });
      case "info":
      default:
        return /* @__PURE__ */ jsx2("span", { className: "h-2 w-2 rounded-full bg-indigo-500" });
    }
  };
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case "critical":
        return "border-rose-500/30 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]";
      case "warning":
        return "border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
      case "info":
      default:
        return "border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.1)]";
    }
  };
  return /* @__PURE__ */ jsxs2("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ jsx2("div", { className: "px-6 py-5 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm", children: /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx2("div", { className: "p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20", children: /* @__PURE__ */ jsx2("svg", { className: "w-6 h-6 text-indigo-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }) }),
      /* @__PURE__ */ jsxs2("div", { children: [
        /* @__PURE__ */ jsx2("h3", { className: "text-xl font-bold text-slate-100 tracking-tight", children: metrics.componentName }),
        /* @__PURE__ */ jsx2("p", { className: "text-sm text-slate-400 font-medium", children: "Performance Overview" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs2("div", { className: "flex-1 overflow-y-auto why-render-scrollbar p-6", children: [
      /* @__PURE__ */ jsx2("div", { className: "grid grid-cols-2 gap-4 mb-8", children: stats.map((stat, index) => /* @__PURE__ */ jsxs2(
        "div",
        {
          className: `
                                p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02]
                                ${stat.bg || "bg-slate-800/50 border-slate-700/50"}
                                animate-slide-in-up
                            `,
          style: { animationDelay: `${index * 50}ms` },
          children: [
            /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx2("span", { className: `p-1.5 rounded-md bg-slate-900/50 ${stat.color}`, children: stat.icon }),
              /* @__PURE__ */ jsx2("span", { className: "text-xs font-medium text-slate-400 uppercase tracking-wider", children: stat.label })
            ] }),
            /* @__PURE__ */ jsx2(
              "div",
              {
                className: "text-2xl font-bold font-mono tracking-tight",
                style: { color: typeof stat.color === "string" && stat.color.startsWith("#") ? stat.color : void 0 },
                children: /* @__PURE__ */ jsx2("span", { className: !stat.color.startsWith("#") ? stat.color : "", children: stat.value })
              }
            )
          ]
        },
        index
      )) }),
      suggestions.length > 0 && /* @__PURE__ */ jsxs2("div", { className: "animate-fade-in delay-300", children: [
        /* @__PURE__ */ jsxs2("h4", { className: "text-sm font-bold text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider", children: [
          /* @__PURE__ */ jsx2("span", { className: "w-1.5 h-1.5 rounded-full bg-amber-400" }),
          "Optimization Suggestions"
        ] }),
        /* @__PURE__ */ jsx2("div", { className: "space-y-4", children: suggestions.map((suggestion, index) => /* @__PURE__ */ jsxs2(
          "div",
          {
            className: `
                                        group p-4 rounded-xl border transition-all duration-200
                                        ${getSeverityStyles(suggestion.severity)}
                                        hover:shadow-lg
                                    `,
            children: [
              /* @__PURE__ */ jsxs2("div", { className: "flex items-start gap-3 mb-3", children: [
                /* @__PURE__ */ jsx2("div", { className: "mt-1.5", children: getSeverityIcon(suggestion.severity) }),
                /* @__PURE__ */ jsxs2("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsx2("h5", { className: "text-base font-semibold text-slate-200 mb-1", children: suggestion.title }),
                  /* @__PURE__ */ jsx2("p", { className: "text-sm text-slate-400 leading-relaxed", children: suggestion.description })
                ] })
              ] }),
              suggestion.affectedProps && suggestion.affectedProps.length > 0 && /* @__PURE__ */ jsx2("div", { className: "flex flex-wrap gap-2 mb-3 ml-5", children: suggestion.affectedProps.map((prop, i) => /* @__PURE__ */ jsx2(
                "span",
                {
                  className: "text-xs px-2.5 py-1 rounded-md bg-slate-900/50 text-slate-300 font-mono border border-slate-700/50",
                  children: prop
                },
                i
              )) }),
              suggestion.codeExample && /* @__PURE__ */ jsxs2("details", { className: "ml-5 group/details", children: [
                /* @__PURE__ */ jsxs2("summary", { className: "text-xs font-medium text-indigo-400 cursor-pointer hover:text-indigo-300 flex items-center gap-1 select-none transition-colors", children: [
                  /* @__PURE__ */ jsx2("svg", { className: "w-4 h-4 transition-transform group-open/details:rotate-90", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }),
                  "View code example"
                ] }),
                /* @__PURE__ */ jsxs2("div", { className: "mt-3 relative group/code", children: [
                  /* @__PURE__ */ jsx2("pre", { className: "p-4 bg-slate-950/80 rounded-lg text-xs overflow-x-auto border border-slate-800/50 shadow-inner", children: /* @__PURE__ */ jsx2("code", { className: "text-slate-300 font-mono leading-relaxed", children: suggestion.codeExample }) }),
                  /* @__PURE__ */ jsx2("div", { className: "absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx2(
                    "button",
                    {
                      className: "p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors",
                      title: "Copy code",
                      onClick: (e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(suggestion.codeExample || "");
                      },
                      children: /* @__PURE__ */ jsx2("svg", { className: "w-3.5 h-3.5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx2("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" }) })
                    }
                  ) })
                ] })
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
        return /* @__PURE__ */ jsx3("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx3("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" }) });
      case "reference":
        return /* @__PURE__ */ jsx3("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx3("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" }) });
      case "type":
        return /* @__PURE__ */ jsx3("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx3("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" }) });
      case "length":
        return /* @__PURE__ */ jsx3("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx3("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" }) });
      case "value":
      default:
        return /* @__PURE__ */ jsx3("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx3("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" }) });
    }
  };
  const getReasonStyles = (reason) => {
    switch (reason) {
      case "function":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "reference":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "type":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "length":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "value":
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };
  if (changes.length === 0) {
    return /* @__PURE__ */ jsxs3("div", { className: "flex flex-col items-center justify-center h-full text-slate-400 p-8", children: [
      /* @__PURE__ */ jsx3("div", { className: "w-16 h-16 mb-4 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 shadow-inner", children: /* @__PURE__ */ jsx3(
        "svg",
        {
          className: "w-8 h-8 text-slate-500",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx3(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 1.5,
              d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            }
          )
        }
      ) }),
      /* @__PURE__ */ jsx3("h3", { className: "text-lg font-medium text-slate-300 mb-1", children: "No prop changes detected" }),
      /* @__PURE__ */ jsx3("p", { className: "text-sm text-slate-500 text-center max-w-xs", children: "The component re-rendered but props and state appear identical." })
    ] });
  }
  return /* @__PURE__ */ jsxs3("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ jsx3("div", { className: "px-6 py-5 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm", children: /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx3("div", { className: "p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20", children: /* @__PURE__ */ jsx3("svg", { className: "w-6 h-6 text-indigo-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx3("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" }) }) }),
      /* @__PURE__ */ jsxs3("div", { children: [
        /* @__PURE__ */ jsx3("h3", { className: "text-xl font-bold text-slate-100 tracking-tight", children: "Prop Changes" }),
        /* @__PURE__ */ jsxs3("p", { className: "text-sm text-slate-400 font-medium flex items-center gap-2", children: [
          /* @__PURE__ */ jsx3("span", { className: "w-1.5 h-1.5 rounded-full bg-indigo-500" }),
          componentName,
          /* @__PURE__ */ jsxs3("span", { className: "px-1.5 py-0.5 rounded-full bg-slate-700/50 text-slate-400 text-[10px] border border-slate-600/30", children: [
            changes.length,
            " change",
            changes.length !== 1 ? "s" : ""
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx3("div", { className: "flex-1 overflow-y-auto why-render-scrollbar p-6", children: /* @__PURE__ */ jsx3("div", { className: "space-y-4", children: changes.map((change, index) => /* @__PURE__ */ jsxs3(
      "div",
      {
        className: "group bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 hover:bg-slate-800/60 transition-all duration-200 animate-slide-in-up",
        style: { animationDelay: `${index * 50}ms` },
        children: [
          /* @__PURE__ */ jsx3(
            "div",
            {
              className: "p-4 cursor-pointer",
              onClick: () => setExpandedIndex(expandedIndex === index ? null : index),
              children: /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx3("div", { className: `p-2 rounded-lg ${getReasonStyles(change.reason)}`, children: getReasonIcon(change.reason) }),
                  /* @__PURE__ */ jsxs3("div", { children: [
                    /* @__PURE__ */ jsx3("div", { className: "font-mono text-sm font-bold text-slate-200", children: change.key }),
                    /* @__PURE__ */ jsxs3("div", { className: "text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5", children: [
                      change.reason,
                      " change"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx3("div", { className: `
                                        w-8 h-8 rounded-full flex items-center justify-center bg-slate-800/50 text-slate-400 
                                        transition-all duration-200 group-hover:bg-slate-700/50 group-hover:text-slate-200
                                        ${expandedIndex === index ? "rotate-180 bg-slate-700/50 text-slate-200" : ""}
                                    `, children: /* @__PURE__ */ jsx3("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx3("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) }) })
              ] })
            }
          ),
          expandedIndex === index && /* @__PURE__ */ jsx3("div", { className: "border-t border-slate-700/50 bg-slate-900/30 animate-fade-in", children: /* @__PURE__ */ jsxs3("div", { className: "grid grid-cols-2 divide-x divide-slate-700/50", children: [
            /* @__PURE__ */ jsxs3("div", { className: "p-4", children: [
              /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2 mb-3", children: [
                /* @__PURE__ */ jsx3("span", { className: "w-2 h-2 rounded-full bg-rose-500" }),
                /* @__PURE__ */ jsx3("span", { className: "text-xs font-bold text-rose-400 uppercase tracking-wider", children: "Previous" })
              ] }),
              /* @__PURE__ */ jsx3("pre", { className: "text-xs bg-slate-950/50 p-3 rounded-lg overflow-x-auto border border-rose-500/10 shadow-inner", children: /* @__PURE__ */ jsx3("code", { className: "text-rose-200/80 font-mono leading-relaxed", children: formatValue(change.oldValue) }) })
            ] }),
            /* @__PURE__ */ jsxs3("div", { className: "p-4 bg-emerald-500/5", children: [
              /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2 mb-3", children: [
                /* @__PURE__ */ jsx3("span", { className: "w-2 h-2 rounded-full bg-emerald-500" }),
                /* @__PURE__ */ jsx3("span", { className: "text-xs font-bold text-emerald-400 uppercase tracking-wider", children: "Current" })
              ] }),
              /* @__PURE__ */ jsx3("pre", { className: "text-xs bg-slate-950/50 p-3 rounded-lg overflow-x-auto border border-emerald-500/10 shadow-inner", children: /* @__PURE__ */ jsx3("code", { className: "text-emerald-200/80 font-mono leading-relaxed", children: formatValue(change.newValue) }) })
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
    if ((!hierarchy2 || hierarchy2.length === 0) && renders.length === 0) return null;
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
          children: node.children && node.children.length > 0 ? buildTree(node.children) : void 0
        };
      });
    };
    let children;
    if (hierarchy2 && hierarchy2.length > 0) {
      children = buildTree(hierarchy2);
    } else {
      const uniqueComponents = /* @__PURE__ */ new Map();
      renders.forEach((r) => {
        const existing = uniqueComponents.get(r.componentId);
        if (!existing || r.timestamp > existing.duration) {
          uniqueComponents.set(r.componentId, {
            name: r.componentName,
            id: r.componentId,
            duration: r.duration
          });
        }
      });
      children = Array.from(uniqueComponents.values()).map((comp) => ({
        name: comp.name,
        value: comp.duration,
        componentId: comp.id,
        actualDuration: comp.duration
      }));
    }
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
    const partition = partition_default().size([width, height]).padding(2);
    return partition(hierarchyNode);
  }, [rootData, width, height]);
  if (!root) {
    return /* @__PURE__ */ jsxs4("div", { className: "flex flex-col items-center justify-center h-full text-slate-400 p-8", children: [
      /* @__PURE__ */ jsx4("div", { className: "w-16 h-16 mb-4 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 shadow-inner", children: /* @__PURE__ */ jsxs4("svg", { className: "w-8 h-8 text-slate-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
        /* @__PURE__ */ jsx4("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" }),
        /* @__PURE__ */ jsx4("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" })
      ] }) }),
      /* @__PURE__ */ jsx4("h3", { className: "text-lg font-medium text-slate-300 mb-1", children: "No render data available" }),
      /* @__PURE__ */ jsx4("p", { className: "text-sm text-slate-500 text-center max-w-xs", children: "Interact with your application to generate flame graph data." })
    ] });
  }
  return /* @__PURE__ */ jsxs4("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs4("div", { className: "px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs4("h3", { className: "text-sm font-semibold text-slate-200 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx4("span", { className: "w-1.5 h-1.5 rounded-full bg-orange-500" }),
        "Flame Graph"
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2 text-xs text-slate-400", children: [
        /* @__PURE__ */ jsxs4("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx4("span", { className: "w-2 h-2 rounded-sm bg-emerald-500/50" }),
          " Fast"
        ] }),
        /* @__PURE__ */ jsxs4("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx4("span", { className: "w-2 h-2 rounded-sm bg-amber-500/50" }),
          " Warning"
        ] }),
        /* @__PURE__ */ jsxs4("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx4("span", { className: "w-2 h-2 rounded-sm bg-rose-500/50" }),
          " Slow"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx4("div", { className: "flex-1 overflow-hidden relative bg-slate-900/50 m-4 rounded-xl border border-slate-700/50 shadow-inner", children: /* @__PURE__ */ jsxs4("svg", { width: "100%", height: "100%", viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "none", children: [
      /* @__PURE__ */ jsx4("defs", { children: /* @__PURE__ */ jsxs4("filter", { id: "glow", x: "-20%", y: "-20%", width: "140%", height: "140%", children: [
        /* @__PURE__ */ jsx4("feGaussianBlur", { stdDeviation: "2", result: "blur" }),
        /* @__PURE__ */ jsx4("feComposite", { in: "SourceGraphic", in2: "blur", operator: "over" })
      ] }) }),
      root.descendants().map((node, i) => {
        if (node.depth === 0) return null;
        const isSelected = selectedNode === node;
        const color = performanceToColor(node.data.actualDuration, { good: 4, warning: 16 });
        return /* @__PURE__ */ jsxs4(
          "g",
          {
            transform: `translate(${node.x0},${node.y0})`,
            onClick: () => setSelectedNode(node),
            className: "cursor-pointer transition-all duration-200",
            style: { opacity: selectedNode && !isSelected ? 0.4 : 1 },
            children: [
              /* @__PURE__ */ jsx4(
                "rect",
                {
                  width: Math.max(0, node.x1 - node.x0),
                  height: Math.max(0, node.y1 - node.y0),
                  fill: color,
                  fillOpacity: isSelected ? 1 : 0.7,
                  stroke: isSelected ? "#fff" : "rgba(0,0,0,0.2)",
                  strokeWidth: isSelected ? 2 : 1,
                  rx: 4,
                  filter: isSelected ? "url(#glow)" : "",
                  className: "transition-all duration-300 hover:fill-opacity-90"
                }
              ),
              node.x1 - node.x0 > 40 && node.y1 - node.y0 > 16 && /* @__PURE__ */ jsx4(
                "text",
                {
                  x: 6,
                  y: 16,
                  fontSize: 11,
                  fill: "#fff",
                  className: "pointer-events-none font-medium select-none text-shadow",
                  style: {
                    textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                    fontWeight: isSelected ? 700 : 500
                  },
                  children: node.data.name
                }
              )
            ]
          },
          `${node.data.componentId}-${i}`
        );
      })
    ] }) }),
    /* @__PURE__ */ jsx4("div", { className: "h-20 border-t border-slate-700/50 px-6 py-3 bg-slate-800/50 backdrop-blur-md flex items-center justify-between", children: selectedNode ? /* @__PURE__ */ jsxs4("div", { className: "animate-slide-in-up", children: [
      /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsx4("span", { className: "font-bold text-slate-100 text-lg tracking-tight", children: selectedNode.data.name }),
        /* @__PURE__ */ jsxs4("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300 border border-slate-600", children: [
          "Depth: ",
          selectedNode.depth
        ] })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-4 text-xs text-slate-400 font-mono", children: [
        /* @__PURE__ */ jsxs4("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx4("span", { className: "w-1.5 h-1.5 rounded-full bg-indigo-400" }),
          "Duration: ",
          /* @__PURE__ */ jsxs4("span", { className: "text-slate-200 font-bold", children: [
            selectedNode.data.actualDuration.toFixed(2),
            "ms"
          ] })
        ] }),
        /* @__PURE__ */ jsxs4("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx4("span", { className: "w-1.5 h-1.5 rounded-full bg-purple-400" }),
          "Base: ",
          /* @__PURE__ */ jsxs4("span", { className: "text-slate-200", children: [
            selectedNode.data.baseDuration ? selectedNode.data.baseDuration.toFixed(2) : "-",
            "ms"
          ] })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-3 text-slate-500", children: [
      /* @__PURE__ */ jsx4("div", { className: "p-2 rounded-lg bg-slate-800 border border-slate-700", children: /* @__PURE__ */ jsx4("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx4("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" }) }) }),
      /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsx4("p", { className: "text-sm font-medium text-slate-400", children: "No component selected" }),
        /* @__PURE__ */ jsx4("p", { className: "text-xs", children: "Click on any bar in the flame graph to view detailed metrics" })
      ] })
    ] }) })
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
  slowThreshold,
  isLastChild = false
}) => {
  const [isExpanded, setIsExpanded] = useState3(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.componentId === selectedId;
  const metric = metricsMap.get(node.componentId);
  const renderCount = metric?.renderCount ?? 0;
  const lastRenderTime = metric?.lastRenderTime ?? 0;
  const badgeColor = metric ? performanceToColor(lastRenderTime, { good: slowThreshold / 2, warning: slowThreshold }) : void 0;
  return /* @__PURE__ */ jsxs5("div", { className: "select-none relative", children: [
    depth > 0 && /* @__PURE__ */ jsx5(
      "div",
      {
        className: `absolute left-0 top-0 border-l border-slate-700/50 ${isLastChild ? "h-1/2" : "h-full"}`,
        style: { left: `${(depth - 1) * 20 + 10}px` }
      }
    ),
    /* @__PURE__ */ jsxs5(
      "div",
      {
        className: `
          flex items-center py-1.5 px-2 my-0.5 rounded-lg cursor-pointer transition-all duration-200
          ${isSelected ? "bg-indigo-500/20 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.1)]" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"}
        `,
        style: { paddingLeft: `${depth * 20 + 8}px` },
        onClick: () => onSelect(node.componentId),
        children: [
          /* @__PURE__ */ jsx5(
            "button",
            {
              className: `
                        w-5 h-5 mr-1 flex items-center justify-center rounded hover:bg-white/10 transition-colors
                        ${!hasChildren ? "invisible" : ""}
                    `,
              onClick: (e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              },
              children: /* @__PURE__ */ jsx5(
                "svg",
                {
                  className: `w-3 h-3 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`,
                  fill: "none",
                  viewBox: "0 0 24 24",
                  stroke: "currentColor",
                  children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" })
                }
              )
            }
          ),
          /* @__PURE__ */ jsx5("span", { className: `text-sm font-medium truncate mr-2 ${isSelected ? "text-indigo-300" : "text-slate-300"}`, children: node.componentName }),
          renderCount > 0 && /* @__PURE__ */ jsxs5("div", { className: "ml-auto flex items-center gap-2", children: [
            lastRenderTime > slowThreshold && /* @__PURE__ */ jsxs5("span", { className: "flex h-2 w-2 relative", title: "Slow render detected", children: [
              /* @__PURE__ */ jsx5("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" }),
              /* @__PURE__ */ jsx5("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-amber-500" })
            ] }),
            /* @__PURE__ */ jsx5(
              "span",
              {
                className: "text-[10px] px-1.5 py-0.5 rounded-md font-mono font-medium min-w-[24px] text-center border shadow-sm",
                style: {
                  backgroundColor: badgeColor ? `${badgeColor}20` : "#94a3b820",
                  color: badgeColor || "#94a3b8",
                  borderColor: badgeColor ? `${badgeColor}40` : "#94a3b840"
                },
                title: `Last render: ${lastRenderTime.toFixed(2)}ms | Total renders: ${renderCount}`,
                children: renderCount
              }
            )
          ] })
        ]
      }
    ),
    isExpanded && hasChildren && /* @__PURE__ */ jsx5("div", { className: "animate-slide-in-up", style: { animationDuration: "0.2s" }, children: node.children.map((child, index) => /* @__PURE__ */ jsx5(
      TreeNode,
      {
        node: child,
        depth: depth + 1,
        onSelect,
        selectedId,
        metricsMap,
        slowThreshold,
        isLastChild: index === node.children.length - 1
      },
      child.componentId
    )) })
  ] });
};
var ComponentTree = () => {
  const { hierarchy: hierarchy2, selectedComponentId, setSelectedComponent, metrics, slowThreshold, renders } = useDevToolsStore();
  const metricsMap = useMemo4(() => {
    return new Map(metrics.map((m) => [m.componentId, m]));
  }, [metrics]);
  const displayHierarchy = useMemo4(() => {
    if (hierarchy2 && hierarchy2.length > 0) {
      return hierarchy2;
    }
    if (renders.length === 0) return [];
    const uniqueComponents = /* @__PURE__ */ new Map();
    renders.forEach((r) => {
      if (!uniqueComponents.has(r.componentId)) {
        uniqueComponents.set(r.componentId, {
          componentName: r.componentName,
          componentId: r.componentId,
          children: [],
          depth: 0
        });
      }
    });
    return Array.from(uniqueComponents.values());
  }, [hierarchy2, renders]);
  if (displayHierarchy.length === 0) {
    return /* @__PURE__ */ jsxs5("div", { className: "flex flex-col items-center justify-center h-full text-slate-400 p-8", children: [
      /* @__PURE__ */ jsx5("div", { className: "w-16 h-16 mb-4 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 shadow-inner", children: /* @__PURE__ */ jsx5("svg", { className: "w-8 h-8 text-slate-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" }) }) }),
      /* @__PURE__ */ jsx5("h3", { className: "text-lg font-medium text-slate-300 mb-1", children: "No component data" }),
      /* @__PURE__ */ jsx5("p", { className: "text-sm text-slate-500 text-center max-w-xs", children: "Interact with your application to populate the component tree." })
    ] });
  }
  return /* @__PURE__ */ jsxs5("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ jsxs5("div", { className: "px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs5("h3", { className: "text-sm font-semibold text-slate-200 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx5("span", { className: "w-1.5 h-1.5 rounded-full bg-indigo-500" }),
        "Component Tree"
      ] }),
      /* @__PURE__ */ jsxs5("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/30", children: [
        displayHierarchy.length,
        " root items"
      ] })
    ] }),
    /* @__PURE__ */ jsx5("div", { className: "flex-1 overflow-y-auto why-render-scrollbar bg-slate-900/20 p-4", children: displayHierarchy.map((node, index) => /* @__PURE__ */ jsx5(
      TreeNode,
      {
        node,
        depth: 0,
        onSelect: setSelectedComponent,
        selectedId: selectedComponentId,
        metricsMap,
        slowThreshold,
        isLastChild: index === displayHierarchy.length - 1
      },
      node.componentId
    )) })
  ] });
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
    setSelectedComponent,
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
      console.log("[DevTools] Syncing data:", {
        historyCount: exportedData.history.length,
        hierarchyCount: exportedData.hierarchy.length,
        metricsCount: exportedData.metrics.length
      });
      updateRenders(exportedData.history);
      updateHierarchy(exportedData.hierarchy);
      updateMetrics(exportedData.metrics);
    };
    syncData();
    console.log("[DevTools] Subscribing to render:end events");
    const unsubscribe = globalEventEmitter.on("render:end", (payload) => {
      console.log("[DevTools] Received render:end event:", payload);
      syncData();
    });
    return () => {
      console.log("[DevTools] Unsubscribing from render:end events");
      unsubscribe();
    };
  }, [updateRenders, updateHierarchy, updateMetrics]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
        return;
      }
      const parts = toggleShortcut.toLowerCase().split("+");
      const key = parts[parts.length - 1].trim();
      const wantsMeta = parts.some((p) => ["meta", "cmd", "command"].includes(p));
      const wantsCtrl = parts.some((p) => ["ctrl", "control"].includes(p));
      const wantsShift = parts.includes("shift");
      const wantsAlt = parts.includes("alt");
      if (e.key.toLowerCase() !== key) return;
      const shiftOk = e.shiftKey === wantsShift;
      const altOk = e.altKey === wantsAlt;
      let metaCtrlOk = false;
      if (wantsMeta && !wantsCtrl) {
        metaCtrlOk = e.metaKey || e.ctrlKey;
      } else if (wantsCtrl && !wantsMeta) {
        metaCtrlOk = e.ctrlKey && !e.metaKey;
      } else if (wantsMeta && wantsCtrl) {
        metaCtrlOk = e.metaKey && e.ctrlKey;
      } else {
        metaCtrlOk = !e.metaKey && !e.ctrlKey;
      }
      if (shiftOk && altOk && metaCtrlOk) {
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
            onSelectEvent: (event) => {
              setSelectedComponent(event.componentId);
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
            px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500
            text-white rounded-full shadow-lg shadow-indigo-500/30
            transition-all duration-300 hover:scale-105 active:scale-95
            flex items-center gap-2.5 font-medium text-sm
            animate-pulse-glow backdrop-blur-sm border border-indigo-400/20
          `,
        title: `Toggle DevTools (${toggleShortcut})`,
        children: [
          /* @__PURE__ */ jsxs6("div", { className: "relative flex h-3 w-3", children: [
            /* @__PURE__ */ jsx6("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" }),
            /* @__PURE__ */ jsx6("span", { className: "relative inline-flex rounded-full h-3 w-3 bg-indigo-400" })
          ] }),
          /* @__PURE__ */ jsx6("span", { className: "font-semibold tracking-wide", children: "Why Render" })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsx6(
      "div",
      {
        className: "fixed inset-0 z-[9998] flex items-end justify-end p-6 pointer-events-none",
        style: { fontFamily: "'Inter', system-ui, sans-serif" },
        children: /* @__PURE__ */ jsxs6(
          "div",
          {
            className: "\n              w-full max-w-5xl h-[650px]\n              why-render-panel\n              flex flex-col\n              pointer-events-auto\n              animate-slide-in-up\n              overflow-hidden\n            ",
            children: [
              /* @__PURE__ */ jsxs6("div", { className: "flex items-center justify-between px-5 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-md", children: [
                /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx6("div", { className: "p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20", children: /* @__PURE__ */ jsx6(
                    "svg",
                    {
                      className: "w-5 h-5 text-indigo-400",
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
                  ) }),
                  /* @__PURE__ */ jsxs6("div", { children: [
                    /* @__PURE__ */ jsxs6("h2", { className: "text-lg font-bold text-white tracking-tight flex items-center gap-2", children: [
                      "Why Render",
                      /* @__PURE__ */ jsx6("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider", children: "DevTools" })
                    ] }),
                    /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-2 text-[11px] text-slate-400 font-medium", children: [
                      /* @__PURE__ */ jsx6("span", { children: "v0.1.0" }),
                      /* @__PURE__ */ jsx6("span", { className: "w-1 h-1 rounded-full bg-slate-600" }),
                      /* @__PURE__ */ jsxs6("span", { children: [
                        renders.length,
                        " events captured"
                      ] })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded-md border border-slate-700/50 mr-2", children: [
                    /* @__PURE__ */ jsx6("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }),
                    /* @__PURE__ */ jsx6("span", { className: "text-xs text-slate-400 font-medium", children: "Live" })
                  ] }),
                  /* @__PURE__ */ jsx6(
                    "button",
                    {
                      onClick: toggleOpen,
                      className: "p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all duration-200 active:scale-95",
                      title: "Close (Esc)",
                      children: /* @__PURE__ */ jsx6(
                        "svg",
                        {
                          className: "w-5 h-5",
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
                ] })
              ] }),
              /* @__PURE__ */ jsx6("div", { className: "flex px-2 border-b border-slate-700/50 bg-slate-900/30 backdrop-blur-sm", children: tabs.map((tab) => {
                const isActive = activePanel === tab.id || activePanel === null && tab.id === "timeline";
                return /* @__PURE__ */ jsxs6(
                  "button",
                  {
                    onClick: () => setActivePanel(tab.id),
                    className: `
                      relative px-4 py-3 font-medium text-sm transition-all duration-200
                      flex items-center gap-2 group outline-none
                      ${isActive ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"}
                    `,
                    children: [
                      /* @__PURE__ */ jsx6("span", { className: `transition-transform duration-200 group-hover:scale-110 ${isActive ? "scale-110" : ""}`, children: tab.icon }),
                      tab.label,
                      isActive && /* @__PURE__ */ jsx6("span", { className: "absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-fade-in" }),
                      /* @__PURE__ */ jsx6("span", { className: `absolute inset-0 bg-white/5 rounded-t-lg transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}` })
                    ]
                  },
                  tab.id
                );
              }) }),
              /* @__PURE__ */ jsxs6("div", { className: "flex-1 overflow-hidden bg-slate-900/20 relative", children: [
                /* @__PURE__ */ jsx6(
                  "div",
                  {
                    className: "absolute inset-0 opacity-[0.03] pointer-events-none",
                    style: {
                      backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)",
                      backgroundSize: "20px 20px"
                    }
                  }
                ),
                /* @__PURE__ */ jsx6("div", { className: "relative h-full", children: renderPanel() })
              ] })
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
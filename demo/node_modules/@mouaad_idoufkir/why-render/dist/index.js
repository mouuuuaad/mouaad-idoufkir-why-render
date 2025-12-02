import {
  globalPerformanceMonitor,
  globalRenderTracker
} from "./chunk-7MZUDFGY.js";
import "./chunk-WISWZH32.js";

// src/hooks/useWhyRender.ts
import { useRef, useEffect } from "react";

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
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV) {
    return true;
  }
  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    return true;
  }
  if (typeof window !== "undefined" && window.__WHY_RENDER__ === true) {
    return true;
  }
  return false;
}

// src/hooks/useWhyRender.ts
var componentIdCounter = 0;
var generateComponentId = (name) => {
  return `${name}-${++componentIdCounter}-${Date.now()}`;
};
function useWhyRender(props, componentName, options) {
  if (!shouldInstrument()) {
    return { lastProps: null, changes: [], componentId: "" };
  }
  const componentIdRef = useRef("");
  if (!componentIdRef.current) {
    const name2 = componentName || "Component";
    componentIdRef.current = generateComponentId(name2);
    globalRenderTracker.registerComponent(name2, componentIdRef.current);
  }
  const lastProps = useRef(null);
  const changesRef = useRef([]);
  const renderCount = useRef(0);
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
  useEffect(() => {
    lastProps.current = props;
    globalRenderTracker.commitRender(name, componentIdRef.current);
  });
  useEffect(() => {
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
import { forwardRef } from "react";
import { jsx } from "react/jsx-runtime";
function withWhyRender(Component, options) {
  const WrappedComponent = forwardRef((props, ref) => {
    const componentName = Component.displayName || Component.name || "Component";
    useWhyRender(props, componentName, options);
    return /* @__PURE__ */ jsx(Component, { ...props, ref });
  });
  WrappedComponent.displayName = `withWhyRender(${Component.displayName || Component.name || "Component"})`;
  return WrappedComponent;
}

// src/index.ts
var useWhyRenderExport = useWhyRender;
export {
  useWhyRenderExport as useWhyRender,
  withWhyRender
};
//# sourceMappingURL=index.js.map
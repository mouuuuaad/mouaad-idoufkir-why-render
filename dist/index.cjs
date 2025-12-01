'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

// src/hooks/useWhyRender.ts

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

// src/hooks/useWhyRender.ts
var componentRegistry = /* @__PURE__ */ new WeakMap();
function useWhyRender(props, componentName, options) {
  if (!shouldInstrument()) {
    return { lastProps: null, changes: [] };
  }
  const idRef = react.useRef(null);
  if (!idRef.current) {
    idRef.current = {};
  }
  const lastProps = react.useRef(null);
  const changesRef = react.useRef([]);
  const renderCount = react.useRef(0);
  const name = componentName || "Component";
  const strategy = options?.compareStrategy || "shallow";
  if (lastProps.current) {
    changesRef.current = getChanges(
      lastProps.current,
      props,
      strategy,
      options?.customCompare,
      options?.skipKeys
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
            console.log("Tip: Wrap with useCallback");
          } else if (change.reason === "reference") {
            console.log("Tip: Memoize object/array or move outside component");
          }
        });
        console.groupEnd();
      }
    }
  }
  renderCount.current++;
  react.useEffect(() => {
    lastProps.current = props;
  });
  react.useEffect(() => {
    if (idRef.current) {
      componentRegistry.set(idRef.current, name);
    }
  }, [name]);
  return {
    lastProps: lastProps.current,
    changes: changesRef.current
  };
}
useWhyRender.track = () => {
  return Symbol("why-render-token");
};
function withWhyRender(Component, options) {
  const WrappedComponent = react.forwardRef((props, ref) => {
    const componentName = Component.displayName || Component.name || "Component";
    useWhyRender(props, componentName, options);
    return /* @__PURE__ */ jsxRuntime.jsx(Component, { ...props, ref });
  });
  WrappedComponent.displayName = `withWhyRender(${Component.displayName || Component.name || "Component"})`;
  return WrappedComponent;
}

// src/index.ts
var useWhyRenderExport = useWhyRender;

exports.useWhyRender = useWhyRenderExport;
exports.withWhyRender = withWhyRender;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map
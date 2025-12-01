'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

// src/hooks/useWhyRender.ts

// src/utils/diff.ts
function getChanges(prevProps, nextProps, strategy, customCompare) {
  const changes = [];
  const allKeys = /* @__PURE__ */ new Set([...Object.keys(prevProps || {}), ...Object.keys(nextProps || {})]);
  for (const key of allKeys) {
    const prev = prevProps ? prevProps[key] : void 0;
    const next = nextProps ? nextProps[key] : void 0;
    if (Object.is(prev, next)) {
      continue;
    }
    if (customCompare && customCompare(prev, next)) {
      continue;
    }
    let reason = "value";
    if (typeof prev !== typeof next) {
      reason = "type";
    } else if (typeof prev === "function") {
      reason = "function";
    } else if (Array.isArray(prev) && Array.isArray(next) && prev.length !== next.length) {
      reason = "length";
    } else if (typeof prev === "object" && prev !== null && next !== null) {
      if (strategy === "deep" || strategy === "fast-deep") {
        if (JSON.stringify(prev) === JSON.stringify(next)) {
          reason = "reference";
        } else {
          reason = "value";
        }
      } else {
        reason = "reference";
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
function useWhyRender(props, componentName, options) {
  if (!shouldInstrument()) {
    return { lastProps: null, changes: [] };
  }
  const lastProps = react.useRef(null);
  const changesRef = react.useRef([]);
  const name = componentName || "Component";
  const strategy = options?.compareStrategy || "shallow";
  if (lastProps.current) {
    changesRef.current = getChanges(lastProps.current, props, strategy, options?.customCompare);
    if (changesRef.current.length > 0) {
      const msg = `[why-render] ${name} re-rendered because: ${changesRef.current.map((c) => c.key).join(", ")}`;
      console.warn(msg);
      if (options?.verbose) {
        console.groupCollapsed(`[why-render] ${name} details`);
        changesRef.current.forEach((change) => {
          console.log(`Prop '${change.key}':`, change);
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
  react.useEffect(() => {
    lastProps.current = props;
  });
  return {
    lastProps: lastProps.current,
    changes: changesRef.current
  };
}
function withWhyRender(Component, options) {
  const WrappedComponent = react.forwardRef((props, ref) => {
    const componentName = Component.displayName || Component.name || "Component";
    useWhyRender(props, componentName, options);
    return /* @__PURE__ */ jsxRuntime.jsx(Component, { ...props, ref });
  });
  WrappedComponent.displayName = `withWhyRender(${Component.displayName || Component.name || "Component"})`;
  return WrappedComponent;
}

exports.useWhyRender = useWhyRender;
exports.withWhyRender = withWhyRender;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map
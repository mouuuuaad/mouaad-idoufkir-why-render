"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }


var _chunkDDU7LFC6cjs = require('./chunk-DDU7LFC6.cjs');
require('./chunk-XWASE2UZ.cjs');

// src/hooks/useWhyRender.ts
var _react = require('react');

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
  const componentIdRef = _react.useRef.call(void 0, "");
  if (!componentIdRef.current) {
    const name2 = componentName || "Component";
    componentIdRef.current = generateComponentId(name2);
    _chunkDDU7LFC6cjs.globalRenderTracker.registerComponent(name2, componentIdRef.current);
  }
  const lastProps = _react.useRef.call(void 0, null);
  const changesRef = _react.useRef.call(void 0, []);
  const renderCount = _react.useRef.call(void 0, 0);
  const name = componentName || "Component";
  const strategy = _optionalChain([options, 'optionalAccess', _ => _.compareStrategy]) || "shallow";
  _chunkDDU7LFC6cjs.globalPerformanceMonitor.markRenderStart(name, componentIdRef.current);
  if (lastProps.current) {
    changesRef.current = getChanges(
      lastProps.current,
      props,
      strategy,
      _optionalChain([options, 'optionalAccess', _2 => _2.customCompare]),
      _optionalChain([options, 'optionalAccess', _3 => _3.skipKeys])
    );
    _chunkDDU7LFC6cjs.globalRenderTracker.trackRender(
      name,
      componentIdRef.current,
      props,
      changesRef.current
    );
    if (changesRef.current.length > 0) {
      const msg = `[why-render] ${name} re-rendered because: ${changesRef.current.map((c) => c.key).join(", ")}`;
      console.warn(msg);
      if (_optionalChain([options, 'optionalAccess', _4 => _4.verbose])) {
        console.groupCollapsed(`[why-render] ${name} details`);
        changesRef.current.forEach((change) => {
          const formatVal = (v) => {
            try {
              const s = typeof v === "string" ? v : JSON.stringify(v);
              return s && s.length > 1e3 ? s.slice(0, 1e3) + "..." : s;
            } catch (e2) {
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
    _chunkDDU7LFC6cjs.globalRenderTracker.trackRender(
      name,
      componentIdRef.current,
      props,
      []
    );
  }
  renderCount.current++;
  _react.useEffect.call(void 0, () => {
    lastProps.current = props;
    _chunkDDU7LFC6cjs.globalRenderTracker.commitRender(name, componentIdRef.current);
  });
  _react.useEffect.call(void 0, () => {
    return () => {
      _chunkDDU7LFC6cjs.globalRenderTracker.unregisterComponent(componentIdRef.current);
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

var _jsxruntime = require('react/jsx-runtime');
function withWhyRender(Component, options) {
  const WrappedComponent = _react.forwardRef.call(void 0, (props, ref) => {
    const componentName = Component.displayName || Component.name || "Component";
    useWhyRender(props, componentName, options);
    return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, Component, { ...props, ref });
  });
  WrappedComponent.displayName = `withWhyRender(${Component.displayName || Component.name || "Component"})`;
  return WrappedComponent;
}

// src/index.ts
var useWhyRenderExport = useWhyRender;



exports.useWhyRender = useWhyRenderExport; exports.withWhyRender = withWhyRender;
//# sourceMappingURL=index.cjs.map
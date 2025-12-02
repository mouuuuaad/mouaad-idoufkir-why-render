"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkL7HSIKKScjs = require('./chunk-L7HSIKKS.cjs');


var _chunkXWASE2UZcjs = require('./chunk-XWASE2UZ.cjs');

// src/overlays/UpdateFlash.tsx
var _react = require('react');
var _jsxruntime = require('react/jsx-runtime');
var UpdateFlash = () => {
  const { showFlash } = _chunkL7HSIKKScjs.useDevToolsStore.call(void 0, );
  const [flashes, setFlashes] = _react.useState.call(void 0, /* @__PURE__ */ new Map());
  _react.useEffect.call(void 0, () => {
    if (!showFlash) return;
    const handleRenderEnd = (payload) => {
      setFlashes((prev) => {
        const next = new Map(prev);
        next.set(payload.componentId, Date.now());
        return next;
      });
      setTimeout(() => {
        setFlashes((prev) => {
          const next = new Map(prev);
          next.delete(payload.componentId);
          return next;
        });
      }, 500);
    };
    const unsubscribe = _chunkXWASE2UZcjs.globalEventEmitter.on("render:end", handleRenderEnd);
    return () => unsubscribe();
  }, [showFlash]);
  if (!showFlash || flashes.size === 0) return null;
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "fixed inset-0 pointer-events-none z-[9997]", children: Array.from(flashes.keys()).map((componentId) => /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
    "div",
    {
      className: "absolute inset-0 border-4 border-blue-500 animate-flash",
      style: {
        animation: "flash 0.5s ease-in-out"
      }
    },
    componentId
  )) });
};


exports.UpdateFlash = UpdateFlash;
//# sourceMappingURL=overlays.cjs.map
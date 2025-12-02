import {
  useDevToolsStore
} from "./chunk-DOIGLAQ4.js";
import {
  globalEventEmitter
} from "./chunk-WISWZH32.js";

// src/overlays/UpdateFlash.tsx
import { useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
var UpdateFlash = () => {
  const { showFlash } = useDevToolsStore();
  const [flashes, setFlashes] = useState(/* @__PURE__ */ new Map());
  useEffect(() => {
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
    const unsubscribe = globalEventEmitter.on("render:end", handleRenderEnd);
    return () => unsubscribe();
  }, [showFlash]);
  if (!showFlash || flashes.size === 0) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 pointer-events-none z-[9997]", children: Array.from(flashes.keys()).map((componentId) => /* @__PURE__ */ jsx(
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
export {
  UpdateFlash
};
//# sourceMappingURL=overlays.js.map
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/overlays/UpdateFlash.tsx
import { useEffect, useState } from "react";

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
  updateHierarchy: (hierarchy) => set({ hierarchy }),
  updateMetrics: (metrics) => set({ metrics }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setMinDuration: (ms) => set({ minDuration: ms }),
  setMaxRenders: (count) => set({ maxRenders: count }),
  setSlowThreshold: (ms) => set({ slowThreshold: ms }),
  clearData: () => set({
    renders: [],
    hierarchy: [],
    metrics: [],
    selectedComponentId: null
  })
}));

// src/overlays/UpdateFlash.tsx
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
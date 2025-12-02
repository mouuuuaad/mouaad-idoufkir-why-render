var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

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

export {
  __publicField,
  globalEventEmitter
};
//# sourceMappingURL=chunk-WISWZH32.js.map
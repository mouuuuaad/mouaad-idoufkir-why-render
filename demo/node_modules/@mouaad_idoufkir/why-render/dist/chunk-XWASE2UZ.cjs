"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var __defProp = Object.defineProperty;
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
    return _nullishCoalesce(_optionalChain([this, 'access', _ => _.listeners, 'access', _2 => _2.get, 'call', _3 => _3(event), 'optionalAccess', _4 => _4.size]), () => ( 0));
  }
};
var globalEventEmitter = new EventEmitter();




exports.__publicField = __publicField; exports.globalEventEmitter = globalEventEmitter;
//# sourceMappingURL=chunk-XWASE2UZ.cjs.map
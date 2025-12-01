/**
 * Core engine exports
 */

export { EventEmitter, globalEventEmitter } from './EventEmitter';
export type { RenderEventType, RenderEventPayload } from './EventEmitter';

export { PerformanceMonitor, globalPerformanceMonitor } from './PerformanceMonitor';
export type { PerformanceMetrics, PerformanceOptions } from './PerformanceMonitor';

export { RenderTracker, globalRenderTracker } from './RenderTracker';
export type { RenderEvent, ComponentHierarchyNode } from './RenderTracker';

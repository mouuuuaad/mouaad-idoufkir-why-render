/**
 * Comprehensive tests for core engine components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventEmitter } from '../src/engine/EventEmitter';
import { PerformanceMonitor } from '../src/engine/PerformanceMonitor';
import { RenderTracker } from '../src/engine/RenderTracker';

describe('EventEmitter', () => {
    let emitter: EventEmitter;

    beforeEach(() => {
        emitter = new EventEmitter();
    });

    it('should emit and receive events', () => {
        const handler = vi.fn();
        emitter.on('render:start', handler);

        emitter.emit('render:start', {
            componentName: 'Test',
            componentId: 'test-1',
            timestamp: 123,
        });

        expect(handler).toHaveBeenCalledWith({
            componentName: 'Test',
            componentId: 'test-1',
            timestamp: 123,
        });
    });

    it('should unsubscribe handlers', () => {
        const handler = vi.fn();
        const unsubscribe = emitter.on('render:start', handler);

        unsubscribe();

        emitter.emit('render:start', {
            componentName: 'Test',
            componentId: 'test-1',
            timestamp: 123,
        });

        expect(handler).not.toHaveBeenCalled();
    });

    it('should support once() for single-use handlers', () => {
        const handler = vi.fn();
        emitter.once('render:end', handler);

        emitter.emit('render:end', {
            componentName: 'Test',
            componentId: 'test-1',
            renderEvent: {
                id: '1',
                componentName: 'Test',
                componentId: 'test-1',
                timestamp: 456,
                duration: 10,
                changes: [],
                props: {},
                renderCount: 1,
            },
        });

        emitter.emit('render:end', {
            componentName: 'Test',
            componentId: 'test-1',
            renderEvent: {
                id: '2',
                componentName: 'Test',
                componentId: 'test-1',
                timestamp: 500,
                duration: 12,
                changes: [],
                props: {},
                renderCount: 2,
            },
        });

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should get listener count', () => {
        emitter.on('render:start', () => { });
        emitter.on('render:start', () => { });

        expect(emitter.listenerCount('render:start')).toBe(2);
    });

    it('should clear all listeners', () => {
        emitter.on('render:start', () => { });
        emitter.on('render:end', () => { });

        emitter.clear();

        expect(emitter.listenerCount('render:start')).toBe(0);
        expect(emitter.listenerCount('render:end')).toBe(0);
    });
});

describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
        monitor = new PerformanceMonitor({ slowThresholdMs: 16 });
    });

    it('should track render duration', () => {
        monitor.markRenderStart('TestComponent', 'test-1');

        // Simulate some work
        const start = performance.now();
        while (performance.now() - start < 5) {
            // busy wait
        }

        const duration = monitor.markRenderEnd('TestComponent', 'test-1');

        expect(duration).toBeGreaterThan(0);
    });

    it('should calculate metrics correctly', () => {
        monitor.markRenderStart('TestComponent', 'test-1');
        monitor.markRenderEnd('TestComponent', 'test-1');

        monitor.markRenderStart('TestComponent', 'test-1');
        monitor.markRenderEnd('TestComponent', 'test-1');

        const metrics = monitor.getMetrics('test-1');

        expect(metrics).toBeDefined();
        expect(metrics!.renderCount).toBe(2);
        expect(metrics!.averageTime).toBeGreaterThan(0);
    });

    it('should detect slow renders', () => {
        const slowThreshold = 10;
        const testMonitor = new PerformanceMonitor({ slowThresholdMs: slowThreshold });

        testMonitor.markRenderStart('SlowComponent', 'slow-1');

        // Force a slow render
        const start = performance.now();
        while (performance.now() - start < slowThreshold + 5) {
            // busy wait
        }

        testMonitor.markRenderEnd('SlowComponent', 'slow-1');

        const metrics = testMonitor.getMetrics('slow-1');
        expect(metrics!.slowRenders).toBe(1);
    });

    it('should get slowest components', () => {
        // Create some renders
        for (let i = 0; i < 3; i++) {
            monitor.markRenderStart(`Component${i}`, `comp-${i}`);
            const start = performance.now();
            while (performance.now() - start < i * 2) { } // Different durations
            monitor.markRenderEnd(`Component${i}`, `comp-${i}`);
        }

        const slowest = monitor.getSlowestComponents(2);
        expect(slowest).toHaveLength(2);
        expect(slowest[0].totalTime).toBeGreaterThanOrEqual(slowest[1].totalTime);
    });
});

describe('RenderTracker', () => {
    let tracker: RenderTracker;

    beforeEach(() => {
        tracker = new RenderTracker(100);
    });

    it('should track renders', () => {
        tracker.trackRender('TestComponent', 'test-1', { foo: 'bar' }, []);
        tracker.commitRender('TestComponent', 'test-1');

        const history = tracker.getComponentHistory('test-1');
        expect(history).toHaveLength(1);
        expect(history[0].componentName).toBe('TestComponent');
    });

    it('should maintain component hierarchy', () => {
        tracker.registerComponent('Parent', 'parent-1');
        tracker.registerComponent('Child', 'child-1', 'parent-1');

        const parentNode = tracker.getComponentNode('parent-1');
        expect(parentNode).toBeDefined();
        expect(parentNode!.children).toHaveLength(1);
        expect(parentNode!.children[0].componentId).toBe('child-1');
    });

    it('should track render counts', () => {
        tracker.trackRender('TestComponent', 'test-1', {}, []);
        tracker.trackRender('TestComponent', 'test-1', {}, []);
        tracker.trackRender('TestComponent', 'test-1', {}, []);

        expect(tracker.getRenderCount('test-1')).toBe(3);
    });

    it('should limit history size', () => {
        const smallTracker = new RenderTracker(5);

        for (let i = 0; i < 10; i++) {
            smallTracker.trackRender('Test', 'test-1', {}, []);
        }

        const history = smallTracker.getAllHistory();
        expect(history.length).toBeLessThanOrEqual(5);
    });

    it('should export data correctly', () => {
        tracker.registerComponent('Test', 'test-1');
        tracker.trackRender('Test', 'test-1', {}, []);
        tracker.commitRender('Test', 'test-1');

        const exported = tracker.export();

        expect(exported.history).toBeDefined();
        expect(exported.hierarchy).toBeDefined();
        expect(exported.metrics).toBeDefined();
    });

    it('should unregister components', () => {
        tracker.registerComponent('Parent', 'parent-1');
        tracker.registerComponent('Child', 'child-1', 'parent-1');

        tracker.unregisterComponent('child-1');

        const parentNode = tracker.getComponentNode('parent-1');
        expect(parentNode!.children).toHaveLength(0);
    });
});

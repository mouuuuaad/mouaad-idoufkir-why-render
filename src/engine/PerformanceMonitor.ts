/**
 * Performance monitoring for React components
 * Tracks render duration, detects slow renders, monitors transitions
 */

import { globalEventEmitter } from './EventEmitter';

export interface PerformanceMetrics {
    componentName: string;
    componentId: string;
    renderCount: number;
    totalTime: number;
    averageTime: number;
    lastRenderTime: number;
    slowRenders: number;
    maxRenderTime: number;
    minRenderTime: number;
}

export interface PerformanceOptions {
    slowThresholdMs?: number;
    enableMarks?: boolean;
}

const DEFAULT_SLOW_THRESHOLD = 16; // 16ms (one frame at 60fps)

export class PerformanceMonitor {
    private metrics: Map<string, PerformanceMetrics> = new Map();
    private activeRenders: Map<string, number> = new Map();
    private options: Required<PerformanceOptions>;

    constructor(options: PerformanceOptions = {}) {
        this.options = {
            slowThresholdMs: options.slowThresholdMs ?? DEFAULT_SLOW_THRESHOLD,
            enableMarks: options.enableMarks ?? false,
        };
    }

    /**
     * Mark the start of a component render
     */
    markRenderStart(componentName: string, componentId: string): void {
        const timestamp = performance.now();
        this.activeRenders.set(componentId, timestamp);

        if (this.options.enableMarks) {
            performance.mark(`${componentName}:${componentId}:start`);
        }

        globalEventEmitter.emit('render:start', {
            componentName,
            componentId,
            timestamp,
        });
    }

    /**
     * Mark the end of a component render and record metrics
     */
    markRenderEnd(componentName: string, componentId: string): number {
        const endTime = performance.now();
        const startTime = this.activeRenders.get(componentId);

        if (!startTime) {
            console.warn(`[why-render] No start time found for ${componentName}:${componentId}`);
            return 0;
        }

        const duration = endTime - startTime;
        this.activeRenders.delete(componentId);

        if (this.options.enableMarks) {
            const markName = `${componentName}:${componentId}`;
            performance.mark(`${markName}:end`);
            performance.measure(markName, `${markName}:start`, `${markName}:end`);
        }

        // Update metrics
        this.updateMetrics(componentName, componentId, duration);

        // Emit event
        globalEventEmitter.emit('render:end', {
            componentName,
            componentId,
            timestamp: endTime,
            duration,
        });

        // Check for slow render
        if (duration > this.options.slowThresholdMs) {
            globalEventEmitter.emit('performance:warning', {
                componentName,
                componentId,
                duration,
                threshold: this.options.slowThresholdMs,
            });
        }

        return duration;
    }

    /**
     * Update performance metrics for a component
     */
    private updateMetrics(componentName: string, componentId: string, duration: number): void {
        const existing = this.metrics.get(componentId);

        if (existing) {
            const newRenderCount = existing.renderCount + 1;
            const newTotalTime = existing.totalTime + duration;

            this.metrics.set(componentId, {
                componentName,
                componentId,
                renderCount: newRenderCount,
                totalTime: newTotalTime,
                averageTime: newTotalTime / newRenderCount,
                lastRenderTime: duration,
                slowRenders: duration > this.options.slowThresholdMs
                    ? existing.slowRenders + 1
                    : existing.slowRenders,
                maxRenderTime: Math.max(existing.maxRenderTime, duration),
                minRenderTime: Math.min(existing.minRenderTime, duration),
            });
        } else {
            this.metrics.set(componentId, {
                componentName,
                componentId,
                renderCount: 1,
                totalTime: duration,
                averageTime: duration,
                lastRenderTime: duration,
                slowRenders: duration > this.options.slowThresholdMs ? 1 : 0,
                maxRenderTime: duration,
                minRenderTime: duration,
            });
        }
    }

    /**
     * Get metrics for a specific component
     */
    getMetrics(componentId: string): PerformanceMetrics | undefined {
        return this.metrics.get(componentId);
    }

    /**
     * Get all metrics
     */
    getAllMetrics(): PerformanceMetrics[] {
        return Array.from(this.metrics.values());
    }

    /**
     * Get components sorted by total render time
     */
    getSlowestComponents(limit: number = 10): PerformanceMetrics[] {
        return Array.from(this.metrics.values())
            .sort((a, b) => b.totalTime - a.totalTime)
            .slice(0, limit);
    }

    /**
     * Get components with most renders
     */
    getMostRenderedComponents(limit: number = 10): PerformanceMetrics[] {
        return Array.from(this.metrics.values())
            .sort((a, b) => b.renderCount - a.renderCount)
            .slice(0, limit);
    }

    /**
     * Clear metrics for a component or all components
     */
    clearMetrics(componentId?: string): void {
        if (componentId) {
            this.metrics.delete(componentId);
        } else {
            this.metrics.clear();
        }
    }

    /**
     * Update slow threshold
     */
    setSlowThreshold(thresholdMs: number): void {
        this.options.slowThresholdMs = thresholdMs;
    }
}

// Global singleton instance
export const globalPerformanceMonitor = new PerformanceMonitor();

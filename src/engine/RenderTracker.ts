/**
 * Core render tracking engine
 * Tracks component renders, prop changes, and maintains render history
 */

import { globalEventEmitter } from './EventEmitter';
import { globalPerformanceMonitor } from './PerformanceMonitor';
import type { Change } from '../types';

export interface RenderEvent {
    id: string;
    componentName: string;
    componentId: string;
    timestamp: number;
    duration: number;
    changes: Change[];
    props: any;
    renderCount: number;
}

export interface ComponentHierarchyNode {
    componentName: string;
    componentId: string;
    children: ComponentHierarchyNode[];
    parent?: ComponentHierarchyNode;
    depth: number;
}

export class RenderTracker {
    private renderHistory: Map<string, RenderEvent> = new Map();
    private componentHierarchy: Map<string, ComponentHierarchyNode> = new Map();
    private componentRenderCounts: Map<string, number> = new Map();
    private maxHistorySize: number;

    constructor(maxHistorySize: number = 1000) {
        this.maxHistorySize = maxHistorySize;
    }

    /**
     * Track a component render
     */
    trackRender(
        componentName: string,
        componentId: string,
        props: any,
        changes: Change[]
    ): void {
        const timestamp = performance.now();

        // Start performance monitoring
        globalPerformanceMonitor.markRenderStart(componentName, componentId);

        // Update render count
        const renderCount = (this.componentRenderCounts.get(componentId) ?? 0) + 1;
        this.componentRenderCounts.set(componentId, renderCount);

        // Emit changes if any
        if (changes.length > 0) {
            globalEventEmitter.emit('change:detected', {
                componentName,
                componentId,
                changes,
            });
        }

        // Record render event (will be completed in commitRender)
        const eventId = `${componentId}-${timestamp}`;
        this.renderHistory.set(eventId, {
            id: eventId,
            componentName,
            componentId,
            timestamp,
            duration: 0, // Will be set in commitRender
            changes,
            props,
            renderCount,
        });

        // Maintain history size
        if (this.renderHistory.size > this.maxHistorySize) {
            const firstKey = this.renderHistory.keys().next().value;
            if (firstKey) {
                this.renderHistory.delete(firstKey);
            }
        }
    }

    /**
     * Commit a render (called after render completes)
     */
    commitRender(componentName: string, componentId: string): void {
        const duration = globalPerformanceMonitor.markRenderEnd(componentName, componentId);

        // Update the most recent render event with duration
        const recentEvent = Array.from(this.renderHistory.values())
            .reverse()
            .find(event => event.componentId === componentId);

        if (recentEvent) {
            recentEvent.duration = duration;
        }
    }

    /**
     * Register a component in the hierarchy
     */
    registerComponent(
        componentName: string,
        componentId: string,
        parentId?: string
    ): void {
        const parent = parentId ? this.componentHierarchy.get(parentId) : undefined;
        const depth = parent ? parent.depth + 1 : 0;

        const node: ComponentHierarchyNode = {
            componentName,
            componentId,
            children: [],
            parent,
            depth,
        };

        this.componentHierarchy.set(componentId, node);

        if (parent) {
            parent.children.push(node);
        }

        globalEventEmitter.emit('component:mounted', {
            componentName,
            componentId,
        });
    }

    /**
     * Unregister a component from the hierarchy
     */
    unregisterComponent(componentId: string): void {
        const node = this.componentHierarchy.get(componentId);

        if (node) {
            // Remove from parent's children
            if (node.parent) {
                node.parent.children = node.parent.children.filter(
                    child => child.componentId !== componentId
                );
            }

            this.componentHierarchy.delete(componentId);

            globalEventEmitter.emit('component:unmounted', {
                componentName: node.componentName,
                componentId,
            });
        }
    }

    /**
     * Get render history for a component
     */
    getComponentHistory(componentId: string): RenderEvent[] {
        return Array.from(this.renderHistory.values())
            .filter(event => event.componentId === componentId)
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Get all render history
     */
    getAllHistory(): RenderEvent[] {
        return Array.from(this.renderHistory.values())
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Get recent renders (last N)
     */
    getRecentRenders(limit: number = 50): RenderEvent[] {
        return Array.from(this.renderHistory.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Get component hierarchy tree
     */
    getHierarchy(): ComponentHierarchyNode[] {
        return Array.from(this.componentHierarchy.values())
            .filter(node => !node.parent);
    }

    /**
     * Get a specific component node
     */
    getComponentNode(componentId: string): ComponentHierarchyNode | undefined {
        return this.componentHierarchy.get(componentId);
    }

    /**
     * Get render count for a component
     */
    getRenderCount(componentId: string): number {
        return this.componentRenderCounts.get(componentId) ?? 0;
    }

    /**
     * Clear all tracking data
     */
    clear(): void {
        this.renderHistory.clear();
        this.componentHierarchy.clear();
        this.componentRenderCounts.clear();
        globalPerformanceMonitor.clearMetrics();
    }

    /**
     * Export data for debugging/reports
     */
    export(): {
        history: RenderEvent[];
        hierarchy: ComponentHierarchyNode[];
        metrics: ReturnType<typeof globalPerformanceMonitor.getAllMetrics>;
    } {
        return {
            history: this.getAllHistory(),
            hierarchy: this.getHierarchy(),
            metrics: globalPerformanceMonitor.getAllMetrics(),
        };
    }
}

// Global singleton instance
export const globalRenderTracker = new RenderTracker();

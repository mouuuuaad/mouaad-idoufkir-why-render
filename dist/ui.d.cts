import React from 'react';
import { R as RenderEvent, C as Change } from './types-D18qxgqb.cjs';

/**
 * Main DevTools Wrapper Component
 * Container for all debugging panels and overlays
 */

interface WhyRenderDevToolsProps {
    /**
     * Initial open state
     */
    defaultOpen?: boolean;
    /**
     * Slow render threshold in milliseconds
     */
    slowThreshold?: number;
    /**
     * Maximum history size
     */
    maxHistory?: number;
    /**
     * Position of the toggle button
     */
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    /**
     * Keyboard shortcut to toggle (default: Meta+Shift+D)
     */
    toggleShortcut?: string;
}
declare const WhyRenderDevTools: React.FC<WhyRenderDevToolsProps>;

/**
 * Performance Badge Component
 * Shows render count and glows on render
 */

interface PerformanceBadgeProps {
    renderCount: number;
    componentName: string;
    lastRenderDuration?: number;
    threshold?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    inline?: boolean;
}
declare const PerformanceBadge: React.FC<PerformanceBadgeProps>;

/**
 * Render Timeline Panel
 * Shows chronological render events with performance visualization
 */

interface RenderTimelineProps {
    events: RenderEvent[];
    slowThreshold?: number;
    maxEvents?: number;
    onSelectEvent?: (event: RenderEvent) => void;
    selectedEventId?: string;
}
declare const RenderTimeline: React.FC<RenderTimelineProps>;

/**
 * Performance monitoring for React components
 * Tracks render duration, detects slow renders, monitors transitions
 */
interface PerformanceMetrics {
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

/**
 * Component Stats Panel
 * Shows performance metrics and statistics for a component
 */

interface ComponentStatsProps {
    metrics: PerformanceMetrics;
    history: RenderEvent[];
    slowThreshold?: number;
}
declare const ComponentStats: React.FC<ComponentStatsProps>;

/**
 * Diff Viewer Component
 * Shows prop/state changes side-by-side
 */

interface DiffViewerProps {
    changes: Change[];
    componentName: string;
}
declare const DiffViewer: React.FC<DiffViewerProps>;

export { ComponentStats, type ComponentStatsProps, DiffViewer, type DiffViewerProps, PerformanceBadge, type PerformanceBadgeProps, RenderTimeline, type RenderTimelineProps, WhyRenderDevTools, type WhyRenderDevToolsProps };

/**
 * Zustand store for DevTools UI state
 */

import { create } from 'zustand';
import type { ComponentHierarchyNode } from '../engine/RenderTracker';
import type { RenderEvent } from '../types';
import type { PerformanceMetrics } from '../engine/PerformanceMonitor';

export interface DevToolsState {
    // UI State
    isOpen: boolean;
    activePanel: 'timeline' | 'flamegraph' | 'tree' | 'stats' | 'diff' | null;
    selectedComponentId: string | null;

    // Overlays
    showHeatmap: boolean;
    showFlash: boolean;
    showGrid: boolean;

    // Data
    renders: RenderEvent[];
    hierarchy: ComponentHierarchyNode[];
    metrics: PerformanceMetrics[];

    // Filters
    searchQuery: string;
    minDuration: number;
    maxRenders: number;

    // Settings
    slowThreshold: number;
    maxHistorySize: number;
    autoScroll: boolean;

    // Actions
    toggleOpen: () => void;
    setActivePanel: (panel: DevToolsState['activePanel']) => void;
    setSelectedComponent: (componentId: string | null) => void;
    toggleHeatmap: () => void;
    toggleFlash: () => void;
    toggleGrid: () => void;
    updateRenders: (renders: RenderEvent[]) => void;
    updateHierarchy: (hierarchy: ComponentHierarchyNode[]) => void;
    updateMetrics: (metrics: PerformanceMetrics[]) => void;
    setSearchQuery: (query: string) => void;
    setMinDuration: (ms: number) => void;
    setMaxRenders: (count: number) => void;
    setSlowThreshold: (ms: number) => void;
    clearData: () => void;
}

export const useDevToolsStore = create<DevToolsState>((set) => ({
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

    searchQuery: '',
    minDuration: 0,
    maxRenders: 1000,

    slowThreshold: 16,
    maxHistorySize: 1000,
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
        selectedComponentId: null,
    }),
}));

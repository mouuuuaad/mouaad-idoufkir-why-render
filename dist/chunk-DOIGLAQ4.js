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

export {
  useDevToolsStore
};
//# sourceMappingURL=chunk-DOIGLAQ4.js.map
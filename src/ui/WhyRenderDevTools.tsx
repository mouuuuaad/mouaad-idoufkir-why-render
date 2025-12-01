/**
 * Main DevTools Wrapper Component
 * Container for all debugging panels and overlays
 */

import React, { useEffect } from 'react';
import { useDevToolsStore } from '../store';
import { globalRenderTracker } from '../engine/RenderTracker';
import { globalPerformanceMonitor } from '../engine/PerformanceMonitor';
import { globalEventEmitter } from '../engine/EventEmitter';
import { RenderTimeline } from './panels/RenderTimeline';
import { ComponentStats } from './panels/ComponentStats';
import { DiffViewer } from './panels/DiffViewer';
import { FlameGraph } from './panels/FlameGraph';
import { ComponentTree } from './panels/ComponentTree';


export interface WhyRenderDevToolsProps {
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

export const WhyRenderDevTools: React.FC<WhyRenderDevToolsProps> = ({
    slowThreshold = 16,
    position = 'bottom-right',
    toggleShortcut = 'Meta+Shift+D',
}) => {
    const {
        isOpen,
        activePanel,
        selectedComponentId,
        renders,
        metrics,
        toggleOpen,
        setActivePanel,
        updateRenders,
        updateHierarchy,
        updateMetrics,
    } = useDevToolsStore();

    // Initialize settings
    useEffect(() => {
        globalPerformanceMonitor.setSlowThreshold(slowThreshold);
    }, [slowThreshold]);

    // Sync data from render tracker
    useEffect(() => {
        const syncData = () => {
            const exportedData = globalRenderTracker.export();
            updateRenders(exportedData.history);
            updateHierarchy(exportedData.hierarchy);
            updateMetrics(exportedData.metrics);
        };

        // Initial sync
        syncData();

        // Subscribe to render events
        const unsubscribe = globalEventEmitter.on('render:end', syncData);

        return () => {
            unsubscribe();
        };
    }, [updateRenders, updateHierarchy, updateMetrics]);

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const parts = toggleShortcut.split('+');
            const meta = parts.includes('Meta') ? e.metaKey : false;
            const shift = parts.includes('Shift') ? e.shiftKey : false;
            const key = parts[parts.length - 1].toLowerCase();

            if (meta && shift && e.key.toLowerCase() === key) {
                e.preventDefault();
                toggleOpen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleShortcut, toggleOpen]);

    // Get selected component data
    const selectedMetrics = metrics.find(
        (m: any) => m.componentId === selectedComponentId
    );
    const selectedHistory = selectedComponentId
        ? globalRenderTracker.getComponentHistory(selectedComponentId)
        : [];
    const latestRender = selectedHistory[selectedHistory.length - 1];

    const positionClasses = {
        'bottom-left': 'bottom-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'top-left': 'top-4 left-4',
        'top-right': 'top-4 right-4',
    };

    const renderPanel = () => {
        switch (activePanel) {
            case 'timeline':
                return (
                    <RenderTimeline
                        events={renders}
                        slowThreshold={slowThreshold}
                        maxEvents={100}
                        onSelectEvent={() => {
                            setActivePanel('stats');
                        }}
                        selectedEventId={latestRender?.id}
                    />
                );

            case 'stats':
                if (!selectedMetrics || !latestRender) {
                    return (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            Select a component from the timeline
                        </div>
                    );
                }
                return (
                    <ComponentStats
                        metrics={selectedMetrics}
                        history={selectedHistory}
                        slowThreshold={slowThreshold}
                    />
                );

            case 'diff':
                if (!latestRender) {
                    return (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            Select a component from the timeline
                        </div>
                    );
                }
                return (
                    <DiffViewer
                        changes={latestRender.changes}
                        componentName={latestRender.componentName}
                    />
                );

            case 'flame':
                return <FlameGraph />;

            case 'tree':
                return <ComponentTree />;

            default:
                return (
                    <RenderTimeline
                        events={renders}
                        slowThreshold={slowThreshold}
                        maxEvents={100}
                        selectedEventId={latestRender?.id}
                    />
                );
        }
    };

    const tabs = [
        { id: 'timeline', label: 'Timeline', icon: '⏱️' },
        { id: 'stats', label: 'Stats', icon: '📊' },
        { id: 'diff', label: 'Diff', icon: '📝' },
        { id: 'flame', label: 'Flame', icon: '🔥' },
        { id: 'tree', label: 'Tree', icon: '🌳' },
    ];

    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={toggleOpen}
                    className={`
            fixed ${positionClasses[position]} z-[9999]
            px-4 py-2 bg-blue-500 hover:bg-blue-600
            text-white rounded-lg shadow-lg
            transition-all duration-300 hover:scale-105
            flex items-center gap-2 font-medium text-sm
            animate-pulse-glow
          `}
                    title={`Toggle DevTools (${toggleShortcut})`}
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                    </svg>
                    Why Render
                </button>
            )}

            {/* DevTools Panel */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9998] flex items-end justify-end p-4 pointer-events-none"
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                    <div
                        className="
              w-full max-w-4xl h-[600px]
              why-render-panel
              flex flex-col
              pointer-events-auto
              animate-slide-in-up
            "
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                <svg
                                    className="w-6 h-6 text-blue-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                                <h2 className="text-xl font-bold text-slate-100">
                                    Why Render DevTools
                                </h2>
                                <span className="text-xs text-slate-500">v0.1.0</span>
                            </div>

                            <button
                                onClick={toggleOpen}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                title="Close (Esc)"
                            >
                                <svg
                                    className="w-5 h-5 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex border-b border-slate-700">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActivePanel(tab.id as any)}
                                    className={`
                    px-4 py-2 font-medium text-sm transition-colors
                    border-b-2 flex items-center gap-2
                    ${activePanel === tab.id || (activePanel === null && tab.id === 'timeline')
                                            ? 'text-blue-400 border-blue-400'
                                            : 'text-slate-400 border-transparent hover:text-slate-300'
                                        }
                  `}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-hidden">
                            {renderPanel()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

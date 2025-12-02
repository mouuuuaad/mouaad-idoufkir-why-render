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
        setSelectedComponent,
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
            console.log('[DevTools] Syncing data:', {
                historyCount: exportedData.history.length,
                hierarchyCount: exportedData.hierarchy.length,
                metricsCount: exportedData.metrics.length,
            });
            updateRenders(exportedData.history);
            updateHierarchy(exportedData.hierarchy);
            updateMetrics(exportedData.metrics);
        };

        // Initial sync
        syncData();

        // Subscribe to render events
        console.log('[DevTools] Subscribing to render:end events');
        const unsubscribe = globalEventEmitter.on('render:end', (payload) => {
            console.log('[DevTools] Received render:end event:', payload);
            syncData();
        });

        return () => {
            console.log('[DevTools] Unsubscribing from render:end events');
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
                        onSelectEvent={(event) => {
                            setSelectedComponent(event.componentId);
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

            case 'flamegraph':
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
        { id: 'flamegraph', label: 'Flame', icon: '🔥' },
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
            px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500
            text-white rounded-full shadow-lg shadow-indigo-500/30
            transition-all duration-300 hover:scale-105 active:scale-95
            flex items-center gap-2.5 font-medium text-sm
            animate-pulse-glow backdrop-blur-sm border border-indigo-400/20
          `}
                    title={`Toggle DevTools (${toggleShortcut})`}
                >
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-400"></span>
                    </div>
                    <span className="font-semibold tracking-wide">Why Render</span>
                </button>
            )}

            {/* DevTools Panel */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9998] flex items-end justify-end p-6 pointer-events-none"
                    style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                    <div
                        className="
              w-full max-w-5xl h-[650px]
              why-render-panel
              flex flex-col
              pointer-events-auto
              animate-slide-in-up
              overflow-hidden
            "
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                    <svg
                                        className="w-5 h-5 text-indigo-400"
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
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                        Why Render
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                                            DevTools
                                        </span>
                                    </h2>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                                        <span>v0.1.0</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                        <span>{renders.length} events captured</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded-md border border-slate-700/50 mr-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-xs text-slate-400 font-medium">Live</span>
                                </div>
                                <button
                                    onClick={toggleOpen}
                                    className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all duration-200 active:scale-95"
                                    title="Close (Esc)"
                                >
                                    <svg
                                        className="w-5 h-5"
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
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex px-2 border-b border-slate-700/50 bg-slate-900/30 backdrop-blur-sm">
                            {tabs.map((tab) => {
                                const isActive = activePanel === tab.id || (activePanel === null && tab.id === 'timeline');
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActivePanel(tab.id as any)}
                                        className={`
                      relative px-4 py-3 font-medium text-sm transition-all duration-200
                      flex items-center gap-2 group outline-none
                      ${isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}
                    `}
                                    >
                                        <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                                            {tab.icon}
                                        </span>
                                        {tab.label}

                                        {/* Active Indicator */}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-fade-in"></span>
                                        )}

                                        {/* Hover background */}
                                        <span className={`absolute inset-0 bg-white/5 rounded-t-lg transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-hidden bg-slate-900/20 relative">
                            {/* Background pattern */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                style={{
                                    backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}>
                            </div>

                            <div className="relative h-full">
                                {renderPanel()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

import React, { useState, useMemo } from 'react';
import { useDevToolsStore } from '../../store';
import { performanceToColor } from '../../utils/colors';
import type { PerformanceMetrics } from '../../engine/PerformanceMonitor';

interface TreeNodeProps {
    node: any;
    depth: number;
    onSelect: (componentId: string) => void;
    selectedId: string | null;
    metricsMap: Map<string, PerformanceMetrics>;
    slowThreshold: number;
    isLastChild?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
    node,
    depth,
    onSelect,
    selectedId,
    metricsMap,
    slowThreshold,
    isLastChild = false
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = node.componentId === selectedId;

    const metric = metricsMap.get(node.componentId);
    const renderCount = metric?.renderCount ?? 0;
    const lastRenderTime = metric?.lastRenderTime ?? 0;

    const badgeColor = metric
        ? performanceToColor(lastRenderTime, { good: slowThreshold / 2, warning: slowThreshold })
        : undefined;

    return (
        <div className="select-none relative">
            {/* Tree lines */}
            {depth > 0 && (
                <div
                    className={`absolute left-0 top-0 border-l border-slate-700/50 ${isLastChild ? 'h-1/2' : 'h-full'}`}
                    style={{ left: `${(depth - 1) * 20 + 10}px` }}
                />
            )}

            <div
                className={`
          flex items-center py-1.5 px-2 my-0.5 rounded-lg cursor-pointer transition-all duration-200
          ${isSelected
                        ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }
        `}
                style={{ paddingLeft: `${depth * 20 + 8}px` }}
                onClick={() => onSelect(node.componentId)}
            >
                <button
                    className={`
                        w-5 h-5 mr-1 flex items-center justify-center rounded hover:bg-white/10 transition-colors
                        ${!hasChildren ? 'invisible' : ''}
                    `}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                >
                    <svg
                        className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                <span className={`text-sm font-medium truncate mr-2 ${isSelected ? 'text-indigo-300' : 'text-slate-300'}`}>
                    {node.componentName}
                </span>

                {/* Show render count badge if available */}
                {renderCount > 0 && (
                    <div className="ml-auto flex items-center gap-2">
                        {lastRenderTime > slowThreshold && (
                            <span className="flex h-2 w-2 relative" title="Slow render detected">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                        )}
                        <span
                            className="text-[10px] px-1.5 py-0.5 rounded-md font-mono font-medium min-w-[24px] text-center border shadow-sm"
                            style={{
                                backgroundColor: badgeColor ? `${badgeColor}20` : '#94a3b820',
                                color: badgeColor || '#94a3b8',
                                borderColor: badgeColor ? `${badgeColor}40` : '#94a3b840'
                            }}
                            title={`Last render: ${lastRenderTime.toFixed(2)}ms | Total renders: ${renderCount}`}
                        >
                            {renderCount}
                        </span>
                    </div>
                )}
            </div>

            {isExpanded && hasChildren && (
                <div className="animate-slide-in-up" style={{ animationDuration: '0.2s' }}>
                    {node.children.map((child: any, index: number) => (
                        <TreeNode
                            key={child.componentId}
                            node={child}
                            depth={depth + 1}
                            onSelect={onSelect}
                            selectedId={selectedId}
                            metricsMap={metricsMap}
                            slowThreshold={slowThreshold}
                            isLastChild={index === node.children.length - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const ComponentTree: React.FC = () => {
    const { hierarchy, selectedComponentId, setSelectedComponent, metrics, slowThreshold, renders } = useDevToolsStore();

    const metricsMap = useMemo(() => {
        return new Map(metrics.map(m => [m.componentId, m]));
    }, [metrics]);

    // Build hierarchy from renders if actual hierarchy is empty
    const displayHierarchy = useMemo(() => {
        if (hierarchy && hierarchy.length > 0) {
            return hierarchy;
        }

        // Create flat hierarchy from unique components in renders
        if (renders.length === 0) return [];

        const uniqueComponents = new Map<string, any>();
        renders.forEach(r => {
            if (!uniqueComponents.has(r.componentId)) {
                uniqueComponents.set(r.componentId, {
                    componentName: r.componentName,
                    componentId: r.componentId,
                    children: [],
                    depth: 0
                });
            }
        });

        return Array.from(uniqueComponents.values());
    }, [hierarchy, renders]);

    if (displayHierarchy.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 shadow-inner">
                    <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-1">No component data</h3>
                <p className="text-sm text-slate-500 text-center max-w-xs">
                    Interact with your application to populate the component tree.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Component Tree
                </h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/30">
                    {displayHierarchy.length} root items
                </span>
            </div>

            <div className="flex-1 overflow-y-auto why-render-scrollbar bg-slate-900/20 p-4">
                {displayHierarchy.map((node: any, index: number) => (
                    <TreeNode
                        key={node.componentId}
                        node={node}
                        depth={0}
                        onSelect={setSelectedComponent}
                        selectedId={selectedComponentId}
                        metricsMap={metricsMap}
                        slowThreshold={slowThreshold}
                        isLastChild={index === displayHierarchy.length - 1}
                    />
                ))}
            </div>
        </div>
    );
};

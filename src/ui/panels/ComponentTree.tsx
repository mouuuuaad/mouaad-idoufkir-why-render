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
}

const TreeNode: React.FC<TreeNodeProps> = ({
    node,
    depth,
    onSelect,
    selectedId,
    metricsMap,
    slowThreshold
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
        <div className="select-none">
            <div
                className={`
          flex items-center py-1 px-2 hover:bg-slate-800 cursor-pointer
          ${isSelected ? 'bg-blue-900/30 border-l-2 border-blue-500' : 'border-l-2 border-transparent'}
        `}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
                onClick={() => onSelect(node.componentId)}
            >
                <button
                    className={`w-4 h-4 mr-1 flex items-center justify-center text-slate-400 hover:text-white ${!hasChildren ? 'invisible' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                >
                    {isExpanded ? '▼' : '▶'}
                </button>

                <span className="text-sm font-mono text-slate-300 truncate mr-2">
                    {node.componentName}
                </span>

                {/* Show render count badge if available */}
                {renderCount > 0 && (
                    <span
                        className="ml-auto text-xs px-1.5 py-0.5 rounded-full text-slate-900 font-medium min-w-[20px] text-center"
                        style={{ backgroundColor: badgeColor || '#94a3b8' }}
                        title={`Last render: ${lastRenderTime.toFixed(2)}ms | Total renders: ${renderCount}`}
                    >
                        {renderCount}
                    </span>
                )}
            </div>

            {isExpanded && hasChildren && (
                <div>
                    {node.children.map((child: any) => (
                        <TreeNode
                            key={child.componentId}
                            node={child}
                            depth={depth + 1}
                            onSelect={onSelect}
                            selectedId={selectedId}
                            metricsMap={metricsMap}
                            slowThreshold={slowThreshold}
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
            <div className="flex items-center justify-center h-full text-slate-400 p-4">
                <div className="text-center">
                    <p>No component data available yet.</p>
                    <p className="text-sm mt-2">Interact with your app to see component tree.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto why-render-scrollbar bg-slate-900/50">
            <div className="p-2">
                {displayHierarchy.map((node: any) => (
                    <TreeNode
                        key={node.componentId}
                        node={node}
                        depth={0}
                        onSelect={setSelectedComponent}
                        selectedId={selectedComponentId}
                        metricsMap={metricsMap}
                        slowThreshold={slowThreshold}
                    />
                ))}
            </div>
        </div>
    );
};

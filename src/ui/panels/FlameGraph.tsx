import React, { useMemo, useState } from 'react';
import * as d3 from 'd3-hierarchy';
import { useDevToolsStore } from '../../store';
import { performanceToColor } from '../../utils/colors';

interface FlameGraphNode {
    name: string;
    value: number;
    children?: FlameGraphNode[];
    componentId: string;
    actualDuration: number;
    baseDuration?: number;
}

interface FlameGraphProps {
    width?: number;
    height?: number;
}

export const FlameGraph: React.FC<FlameGraphProps> = ({
    width = 800,
    height = 400
}) => {
    const { renderHistory, hierarchy } = useDevToolsStore();
    const [selectedNode, setSelectedNode] = useState<d3.HierarchyRectangularNode<FlameGraphNode> | null>(null);

    // Transform hierarchy data into d3 compatible format
    const rootData = useMemo(() => {
        if (!hierarchy || hierarchy.length === 0) return null;

        // Helper to build the tree with performance data
        const buildTree = (nodes: any[]): FlameGraphNode[] => {
            return nodes.map(node => {
                // Find latest render for this component
                const renders = renderHistory.filter(r => r.componentId === node.componentId);
                const lastRender = renders[renders.length - 1];
                const duration = lastRender?.duration || 0.1; // Fallback for visibility

                return {
                    name: node.componentName,
                    value: duration,
                    componentId: node.componentId,
                    actualDuration: duration,
                    children: node.children ? buildTree(node.children) : undefined
                };
            });
        };

        const children = buildTree(hierarchy);

        return {
            name: 'Root',
            value: 0, // Will be summed by d3
            componentId: 'root',
            actualDuration: 0,
            children
        };
    }, [hierarchy, renderHistory]);

    const root = useMemo(() => {
        if (!rootData) return null;

        const hierarchyNode = d3.hierarchy<FlameGraphNode>(rootData)
            .sum(d => d.value)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        const partition = d3.partition<FlameGraphNode>()
            .size([width, height])
            .padding(1);

        return partition(hierarchyNode);
    }, [rootData, width, height]);

    if (!root) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400">
                No render data available yet
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden relative bg-slate-900 rounded-lg border border-slate-700">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    {root.descendants().map((node, i) => {
                        // Skip root node if it's just a container
                        if (node.depth === 0) return null;

                        const isSelected = selectedNode === node;
                        const color = performanceToColor(node.data.actualDuration, { good: 4, warning: 16 });

                        return (
                            <g
                                key={`${node.data.componentId}-${i}`}
                                transform={`translate(${node.x0},${node.y0})`}
                                onClick={() => setSelectedNode(node)}
                                className="cursor-pointer transition-opacity hover:opacity-80"
                            >
                                <rect
                                    width={Math.max(0, node.x1 - node.x0)}
                                    height={Math.max(0, node.y1 - node.y0)}
                                    fill={color}
                                    fillOpacity={isSelected ? 1 : 0.8}
                                    stroke={isSelected ? '#fff' : 'none'}
                                    strokeWidth={2}
                                    rx={2}
                                />
                                {(node.x1 - node.x0) > 30 && (node.y1 - node.y0) > 14 && (
                                    <text
                                        x={4}
                                        y={14}
                                        fontSize={10}
                                        fill="#fff"
                                        className="pointer-events-none font-mono select-none"
                                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                                    >
                                        {node.data.name}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Tooltip / Info Panel */}
            <div className="h-16 border-t border-slate-700 p-2 bg-slate-800 flex items-center justify-between">
                {selectedNode ? (
                    <div>
                        <div className="font-bold text-slate-200">{selectedNode.data.name}</div>
                        <div className="text-xs text-slate-400 font-mono">
                            Duration: {selectedNode.data.actualDuration.toFixed(2)}ms
                            <span className="mx-2">•</span>
                            Depth: {selectedNode.depth}
                        </div>
                    </div>
                ) : (
                    <div className="text-slate-500 text-sm italic">
                        Click a bar to view details
                    </div>
                )}
                <div className="text-xs text-slate-500">
                    Flame Graph
                </div>
            </div>
        </div>
    );
};

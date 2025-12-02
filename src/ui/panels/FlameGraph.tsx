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
    const { renders, hierarchy } = useDevToolsStore();
    const [selectedNode, setSelectedNode] = useState<d3.HierarchyRectangularNode<FlameGraphNode> | null>(null);

    // Transform hierarchy data into d3 compatible format
    const rootData = useMemo(() => {
        // If no hierarchy, try to build from renders
        if ((!hierarchy || hierarchy.length === 0) && renders.length === 0) return null;

        // Helper to build the tree with performance data
        const buildTree = (nodes: any[]): FlameGraphNode[] => {
            return nodes.map(node => {
                // Find latest render for this component
                const componentRenders = renders.filter(r => r.componentId === node.componentId);
                const lastRender = componentRenders[componentRenders.length - 1];
                const duration = lastRender?.duration || 0.1; // Fallback for visibility

                return {
                    name: node.componentName,
                    value: duration,
                    componentId: node.componentId,
                    actualDuration: duration,
                    children: node.children && node.children.length > 0 ? buildTree(node.children) : undefined
                };
            });
        };

        // Use hierarchy if available, otherwise create flat structure from renders
        let children: FlameGraphNode[];
        if (hierarchy && hierarchy.length > 0) {
            children = buildTree(hierarchy);
        } else {
            // Create a flat structure from unique components in renders
            const uniqueComponents = new Map<string, { name: string; id: string; duration: number }>();
            renders.forEach(r => {
                const existing = uniqueComponents.get(r.componentId);
                if (!existing || r.timestamp > existing.duration) {
                    uniqueComponents.set(r.componentId, {
                        name: r.componentName,
                        id: r.componentId,
                        duration: r.duration
                    });
                }
            });

            children = Array.from(uniqueComponents.values()).map(comp => ({
                name: comp.name,
                value: comp.duration,
                componentId: comp.id,
                actualDuration: comp.duration
            }));
        }

        return {
            name: 'Root',
            value: 0, // Will be summed by d3
            componentId: 'root',
            actualDuration: 0,
            children
        };
    }, [hierarchy, renders]);

    const root = useMemo(() => {
        if (!rootData) return null;

        const hierarchyNode = d3.hierarchy<FlameGraphNode>(rootData)
            .sum(d => d.value)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        const partition = d3.partition<FlameGraphNode>()
            .size([width, height])
            .padding(2); // Increased padding for better separation

        return partition(hierarchyNode);
    }, [rootData, width, height]);

    if (!root) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 shadow-inner">
                    <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-1">No render data available</h3>
                <p className="text-sm text-slate-500 text-center max-w-xs">
                    Interact with your application to generate flame graph data.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    Flame Graph
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-emerald-500/50"></span> Fast
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-amber-500/50"></span> Warning
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-rose-500/50"></span> Slow
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative bg-slate-900/50 m-4 rounded-xl border border-slate-700/50 shadow-inner">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
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
                                className="cursor-pointer transition-all duration-200"
                                style={{ opacity: selectedNode && !isSelected ? 0.4 : 1 }}
                            >
                                <rect
                                    width={Math.max(0, node.x1 - node.x0)}
                                    height={Math.max(0, node.y1 - node.y0)}
                                    fill={color}
                                    fillOpacity={isSelected ? 1 : 0.7}
                                    stroke={isSelected ? '#fff' : 'rgba(0,0,0,0.2)'}
                                    strokeWidth={isSelected ? 2 : 1}
                                    rx={4}
                                    filter={isSelected ? 'url(#glow)' : ''}
                                    className="transition-all duration-300 hover:fill-opacity-90"
                                />
                                {(node.x1 - node.x0) > 40 && (node.y1 - node.y0) > 16 && (
                                    <text
                                        x={6}
                                        y={16}
                                        fontSize={11}
                                        fill="#fff"
                                        className="pointer-events-none font-medium select-none text-shadow"
                                        style={{
                                            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                            fontWeight: isSelected ? 700 : 500
                                        }}
                                    >
                                        {node.data.name}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Info Panel */}
            <div className="h-20 border-t border-slate-700/50 px-6 py-3 bg-slate-800/50 backdrop-blur-md flex items-center justify-between">
                {selectedNode ? (
                    <div className="animate-slide-in-up">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-100 text-lg tracking-tight">{selectedNode.data.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300 border border-slate-600">
                                Depth: {selectedNode.depth}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                Duration: <span className="text-slate-200 font-bold">{selectedNode.data.actualDuration.toFixed(2)}ms</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                Base: <span className="text-slate-200">{selectedNode.data.baseDuration ? selectedNode.data.baseDuration.toFixed(2) : '-'}ms</span>
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-slate-500">
                        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-400">No component selected</p>
                            <p className="text-xs">Click on any bar in the flame graph to view detailed metrics</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

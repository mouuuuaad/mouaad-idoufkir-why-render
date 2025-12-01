import React, { useState } from 'react';
import { useDevToolsStore } from '../../store';
import { performanceToColor } from '../../utils/colors';

interface TreeNodeProps {
    node: any;
    depth: number;
    onSelect: (componentId: string) => void;
    selectedId: string | null;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth, onSelect, selectedId }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = node.componentId === selectedId;

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

                <span className="text-sm font-mono text-slate-300 truncate">
                    {node.componentName}
                </span>

                {/* Optional: Show render count badge if available in node data */}
                {/* <span className="ml-auto text-xs text-slate-500">{node.renderCount}</span> */}
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
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const ComponentTree: React.FC = () => {
    const { hierarchy, selectedComponentId, setSelectedComponentId } = useDevToolsStore();

    if (!hierarchy || hierarchy.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 p-4">
                No component hierarchy detected.
                <br />
                Make sure to use 'withWhyRender' or 'useWhyRender' in your components.
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto why-render-scrollbar bg-slate-900/50">
            <div className="p-2">
                {hierarchy.map((node: any) => (
                    <TreeNode
                        key={node.componentId}
                        node={node}
                        depth={0}
                        onSelect={setSelectedComponentId}
                        selectedId={selectedComponentId}
                    />
                ))}
            </div>
        </div>
    );
};

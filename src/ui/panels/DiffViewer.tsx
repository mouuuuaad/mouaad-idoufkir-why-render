/**
 * Diff Viewer Component
 * Shows prop/state changes side-by-side
 */

import React, { useState } from 'react';
import type { Change } from '../../types';

export interface DiffViewerProps {
    changes: Change[];
    componentName: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
    changes,
    componentName,
}) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const formatValue = (value: any): string => {
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';
        if (typeof value === 'function') return '[Function]';

        try {
            return JSON.stringify(value, null, 2);
        } catch {
            return String(value);
        }
    };

    const getReasonIcon = (reason: Change['reason']): string => {
        switch (reason) {
            case 'function':
                return '🔧';
            case 'reference':
                return '🔗';
            case 'type':
                return '🏷️';
            case 'length':
                return '📏';
            case 'value':
            default:
                return '✏️';
        }
    };

    const getReasonColor = (reason: Change['reason']): string => {
        switch (reason) {
            case 'function':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'reference':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'type':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'length':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'value':
            default:
                return 'bg-green-500/20 text-green-400 border-green-500/30';
        }
    };

    if (changes.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <div className="text-center">
                    <svg
                        className="w-12 h-12 mx-auto mb-2 opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p>No prop changes detected</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200">
                    Prop Changes - {componentName}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                    {changes.length} change{changes.length !== 1 ? 's' : ''} detected
                </p>
            </div>

            <div className="flex-1 overflow-y-auto why-render-scrollbar">
                <div className="p-4 space-y-3">
                    {changes.map((change, index) => (
                        <div
                            key={index}
                            className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
                        >
                            {/* Change Header */}
                            <div
                                className="p-3 cursor-pointer hover:bg-slate-750 transition-colors"
                                onClick={() =>
                                    setExpandedIndex(expandedIndex === index ? null : index)
                                }
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{getReasonIcon(change.reason)}</span>
                                        <span className="font-mono text-sm font-semibold text-slate-200">
                                            {change.key}
                                        </span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded border ${getReasonColor(
                                                change.reason
                                            )}`}
                                        >
                                            {change.reason}
                                        </span>
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-slate-400 transition-transform ${expandedIndex === index ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedIndex === index && (
                                <div className="border-t border-slate-700">
                                    <div className="grid grid-cols-2 divide-x divide-slate-700">
                                        {/* Old Value */}
                                        <div className="p-3">
                                            <div className="text-xs font-semibold text-red-400 mb-2">
                                                Previous Value
                                            </div>
                                            <pre className="text-xs bg-slate-900 p-2 rounded overflow-x-auto">
                                                <code className="text-slate-300 font-mono">
                                                    {formatValue(change.oldValue)}
                                                </code>
                                            </pre>
                                        </div>

                                        {/* New Value */}
                                        <div className="p-3">
                                            <div className="text-xs font-semibold text-green-400 mb-2">
                                                New Value
                                            </div>
                                            <pre className="text-xs bg-slate-900 p-2 rounded overflow-x-auto">
                                                <code className="text-slate-300 font-mono">
                                                    {formatValue(change.newValue)}
                                                </code>
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

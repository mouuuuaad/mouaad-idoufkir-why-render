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

    const getReasonIcon = (reason: Change['reason']) => {
        switch (reason) {
            case 'function':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                );
            case 'reference':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                );
            case 'type':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                );
            case 'length':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                );
            case 'value':
            default:
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                );
        }
    };

    const getReasonStyles = (reason: Change['reason']): string => {
        switch (reason) {
            case 'function':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'reference':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'type':
                return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'length':
                return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
            case 'value':
            default:
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        }
    };

    if (changes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 shadow-inner">
                    <svg
                        className="w-8 h-8 text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-1">No prop changes detected</h3>
                <p className="text-sm text-slate-500 text-center max-w-xs">
                    The component re-rendered but props and state appear identical.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-100 tracking-tight">
                            Prop Changes
                        </h3>
                        <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            {componentName}
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-700/50 text-slate-400 text-[10px] border border-slate-600/30">
                                {changes.length} change{changes.length !== 1 ? 's' : ''}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto why-render-scrollbar p-6">
                <div className="space-y-4">
                    {changes.map((change, index) => (
                        <div
                            key={index}
                            className="group bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 hover:bg-slate-800/60 transition-all duration-200 animate-slide-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Change Header */}
                            <div
                                className="p-4 cursor-pointer"
                                onClick={() =>
                                    setExpandedIndex(expandedIndex === index ? null : index)
                                }
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${getReasonStyles(change.reason)}`}>
                                            {getReasonIcon(change.reason)}
                                        </div>
                                        <div>
                                            <div className="font-mono text-sm font-bold text-slate-200">
                                                {change.key}
                                            </div>
                                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                                                {change.reason} change
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center bg-slate-800/50 text-slate-400 
                                        transition-all duration-200 group-hover:bg-slate-700/50 group-hover:text-slate-200
                                        ${expandedIndex === index ? 'rotate-180 bg-slate-700/50 text-slate-200' : ''}
                                    `}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedIndex === index && (
                                <div className="border-t border-slate-700/50 bg-slate-900/30 animate-fade-in">
                                    <div className="grid grid-cols-2 divide-x divide-slate-700/50">
                                        {/* Old Value */}
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Previous</span>
                                            </div>
                                            <pre className="text-xs bg-slate-950/50 p-3 rounded-lg overflow-x-auto border border-rose-500/10 shadow-inner">
                                                <code className="text-rose-200/80 font-mono leading-relaxed">
                                                    {formatValue(change.oldValue)}
                                                </code>
                                            </pre>
                                        </div>

                                        {/* New Value */}
                                        <div className="p-4 bg-emerald-500/5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Current</span>
                                            </div>
                                            <pre className="text-xs bg-slate-950/50 p-3 rounded-lg overflow-x-auto border border-emerald-500/10 shadow-inner">
                                                <code className="text-emerald-200/80 font-mono leading-relaxed">
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

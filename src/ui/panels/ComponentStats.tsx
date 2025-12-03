/**
 * Component Stats Panel
 * Shows performance metrics and statistics for a component
 */

import React, { useMemo } from 'react';
import type { PerformanceMetrics } from '../../engine/PerformanceMonitor';
import type { RenderEvent } from '../../types';
import { performanceToColor } from '../../utils/colors';
import { getComponentSuggestions } from '../../utils/suggestions';

export interface ComponentStatsProps {
    metrics: PerformanceMetrics;
    history: RenderEvent[];
    slowThreshold?: number;
}

export const ComponentStats: React.FC<ComponentStatsProps> = ({
    metrics,
    history,
    slowThreshold = 16,
}) => {
    const suggestions = useMemo(() => {
        const latestEvent = history[history.length - 1];
        return getComponentSuggestions(
            metrics.componentName,
            latestEvent?.changes || [],
            metrics,
            history,
            slowThreshold
        );
    }, [metrics, history, slowThreshold]);

    const stats = [
        {
            label: 'Total Renders',
            value: metrics.renderCount,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            ),
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10 border-indigo-500/20',
        },
        {
            label: 'Average Time',
            value: `${metrics.averageTime.toFixed(2)}ms`,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: performanceToColor(metrics.averageTime, {
                good: slowThreshold,
                warning: slowThreshold * 2,
            }),
            bg: 'bg-slate-800/50 border-slate-700/50',
        },
        {
            label: 'Total Time',
            value: `${metrics.totalTime.toFixed(2)}ms`,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'text-purple-400',
            bg: 'bg-purple-500/10 border-purple-500/20',
        },
        {
            label: 'Slowest Render',
            value: `${metrics.maxRenderTime.toFixed(2)}ms`,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            color: performanceToColor(metrics.maxRenderTime, {
                good: slowThreshold,
                warning: slowThreshold * 2,
            }),
            bg: 'bg-slate-800/50 border-slate-700/50',
        },
        {
            label: 'Fastest Render',
            value: `${metrics.minRenderTime.toFixed(2)}ms`,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
        },
        {
            label: 'Slow Renders',
            value: `${metrics.slowRenders} (${metrics.renderCount > 0 ? ((metrics.slowRenders / metrics.renderCount) * 100).toFixed(1) : 0}%)`,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            color: metrics.slowRenders > 0 ? 'text-amber-400' : 'text-emerald-400',
            bg: metrics.slowRenders > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20',
        },
    ];

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'border-rose-500/30 bg-rose-500/5';
            case 'warning':
                return 'border-amber-500/30 bg-amber-500/5';
            case 'info':
            default:
                return 'border-cyan-500/30 bg-cyan-500/5';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return (
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'info':
            default:
                return (
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                );
        }
    };

    // Lightweight Syntax Highlighter for Dracula Theme
    const SyntaxHighlight = ({ code }: { code: string }) => {
        const tokens = code.split(/(\/\/.*|\/\*[\s\S]*?\*\/|'.*?'|".*?"|`.*?`|\b(?:const|let|var|function|return|if|else|import|export|default|from|class|interface|type)\b|\b(?:React|useState|useEffect|useMemo|useCallback|useRef|useContext|console)\b|[(){}[\].,;])/g);

        return (
            <code className="font-mono text-sm">
                {tokens.map((token, i) => {
                    if (!token) return null;

                    // Comments
                    if (token.startsWith('//') || token.startsWith('/*')) {
                        return <span key={i} style={{ color: '#6272a4' }}>{token}</span>;
                    }
                    // Strings
                    if (token.startsWith("'") || token.startsWith('"') || token.startsWith('`')) {
                        return <span key={i} style={{ color: '#f1fa8c' }}>{token}</span>;
                    }
                    // Keywords (Pink)
                    if (/^(const|let|var|function|return|if|else|import|export|default|from|class|interface|type)$/.test(token)) {
                        return <span key={i} style={{ color: '#ff79c6' }}>{token}</span>;
                    }
                    // Built-ins/Hooks (Cyan)
                    if (/^(React|useState|useEffect|useMemo|useCallback|useRef|useContext|console)$/.test(token)) {
                        return <span key={i} style={{ color: '#8be9fd', fontStyle: 'italic' }}>{token}</span>;
                    }
                    // Punctuation (White/Foreground)
                    if (/^[(){}[\].,;]$/.test(token)) {
                        return <span key={i} style={{ color: '#f8f8f2' }}>{token}</span>;
                    }
                    // Normal text (Foreground)
                    return <span key={i} style={{ color: '#f8f8f2' }}>{token}</span>;
                })}
            </code>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-100 tracking-tight">
                            {metrics.componentName}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium">
                            Performance Overview
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto why-render-scrollbar p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={`
                                p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02]
                                ${stat.bg || 'bg-slate-800/50 border-slate-700/50'}
                                animate-slide-in-up
                            `}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`p-1.5 rounded-md bg-slate-900/50 ${stat.color}`}>
                                    {stat.icon}
                                </span>
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <div
                                className="text-2xl font-bold font-mono tracking-tight"
                                style={{ color: typeof stat.color === 'string' && stat.color.startsWith('#') ? stat.color : undefined }}
                            >
                                <span className={!stat.color.startsWith('#') ? stat.color : ''}>
                                    {stat.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div className="animate-fade-in delay-300">
                        <h4 className="text-sm font-bold text-[#f8f8f2] mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f1fa8c]"></span>
                            Optimization Suggestions
                        </h4>
                        <div className="space-y-4">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className={`
                                        group relative overflow-hidden rounded-xl border transition-all duration-300
                                        ${getSeverityStyles(suggestion.severity)}
                                    `}
                                >
                                    {/* Decorative gradient background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#f8f8f2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="relative p-5">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                                {getSeverityIcon(suggestion.severity)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <h5 className="text-lg font-bold text-[#f8f8f2] tracking-tight">
                                                        {suggestion.title}
                                                    </h5>
                                                    <span className={`
                                                        px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                                                        ${suggestion.severity === 'critical' ? 'bg-[#ff5555]/20 text-[#ff5555] border-[#ff5555]/30' :
                                                            suggestion.severity === 'warning' ? 'bg-[#ffb86c]/20 text-[#ffb86c] border-[#ffb86c]/30' :
                                                                'bg-[#8be9fd]/20 text-[#8be9fd] border-[#8be9fd]/30'}
                                                    `}>
                                                        {suggestion.severity}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-[#f8f8f2]/80 leading-relaxed mb-4">
                                                    {suggestion.description}
                                                </p>

                                                {suggestion.affectedProps && suggestion.affectedProps.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {suggestion.affectedProps.map((prop, i) => (
                                                            <span
                                                                key={i}
                                                                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#282a36]/50 text-[#bd93f9] font-mono border border-[#6272a4]/50 shadow-sm"
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#bd93f9]"></span>
                                                                {prop}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {suggestion.codeExample && (
                                                    <div className="mt-4 rounded-lg overflow-hidden border border-[#6272a4]/30 bg-[#282a36] shadow-xl">
                                                        <div className="flex items-center justify-between px-4 py-2 bg-[#44475a]/50 border-b border-[#6272a4]/30">
                                                            <span className="text-xs font-medium text-[#6272a4]">Suggestion</span>
                                                            <button
                                                                className="text-xs text-[#bd93f9] hover:text-[#ff79c6] transition-colors flex items-center gap-1"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    navigator.clipboard.writeText(suggestion.codeExample || '');
                                                                }}
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                                Copy
                                                            </button>
                                                        </div>
                                                        <div className="p-4 overflow-x-auto custom-scrollbar">
                                                            <pre className="text-xs leading-relaxed">
                                                                <SyntaxHighlight code={suggestion.codeExample} />
                                                            </pre>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

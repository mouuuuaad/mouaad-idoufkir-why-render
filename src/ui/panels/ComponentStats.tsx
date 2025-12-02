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

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return (
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                );
            case 'warning':
                return <span className="h-2 w-2 rounded-full bg-amber-500"></span>;
            case 'info':
            default:
                return <span className="h-2 w-2 rounded-full bg-indigo-500"></span>;
        }
    };

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'border-rose-500/30 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
            case 'warning':
                return 'border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
            case 'info':
            default:
                return 'border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.1)]';
        }
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
                        <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            Optimization Suggestions
                        </h4>
                        <div className="space-y-4">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className={`
                                        group p-4 rounded-xl border transition-all duration-200
                                        ${getSeverityStyles(suggestion.severity)}
                                        hover:shadow-lg
                                    `}
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="mt-1.5">
                                            {getSeverityIcon(suggestion.severity)}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="text-base font-semibold text-slate-200 mb-1">
                                                {suggestion.title}
                                            </h5>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                {suggestion.description}
                                            </p>
                                        </div>
                                    </div>

                                    {suggestion.affectedProps && suggestion.affectedProps.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3 ml-5">
                                            {suggestion.affectedProps.map((prop, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs px-2.5 py-1 rounded-md bg-slate-900/50 text-slate-300 font-mono border border-slate-700/50"
                                                >
                                                    {prop}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {suggestion.codeExample && (
                                        <details className="ml-5 group/details">
                                            <summary className="text-xs font-medium text-indigo-400 cursor-pointer hover:text-indigo-300 flex items-center gap-1 select-none transition-colors">
                                                <svg className="w-4 h-4 transition-transform group-open/details:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                View code example
                                            </summary>
                                            <div className="mt-3 relative group/code">
                                                <pre className="p-4 bg-slate-950/80 rounded-lg text-xs overflow-x-auto border border-slate-800/50 shadow-inner">
                                                    <code className="text-slate-300 font-mono leading-relaxed">
                                                        {suggestion.codeExample}
                                                    </code>
                                                </pre>
                                                <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                                    <button
                                                        className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                                                        title="Copy code"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            navigator.clipboard.writeText(suggestion.codeExample || '');
                                                        }}
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </details>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

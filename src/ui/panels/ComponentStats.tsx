/**
 * Component Stats Panel
 * Shows performance metrics and statistics for a component
 */

import React, { useMemo } from 'react';
import type { PerformanceMetrics } from '../../engine/PerformanceMonitor';
import type { RenderEvent } from '../../engine/RenderTracker';
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
            icon: '🔄',
            color: 'text-blue-400',
        },
        {
            label: 'Average Time',
            value: `${metrics.averageTime.toFixed(2)}ms`,
            icon: '⏱️',
            color: performanceToColor(metrics.averageTime, {
                good: slowThreshold,
                warning: slowThreshold * 2,
            }),
        },
        {
            label: 'Total Time',
            value: `${metrics.totalTime.toFixed(2)}ms`,
            icon: '⏳',
            color: 'text-purple-400',
        },
        {
            label: 'Slowest Render',
            value: `${metrics.maxRenderTime.toFixed(2)}ms`,
            icon: '🐌',
            color: performanceToColor(metrics.maxRenderTime, {
                good: slowThreshold,
                warning: slowThreshold * 2,
            }),
        },
        {
            label: 'Fastest Render',
            value: `${metrics.minRenderTime.toFixed(2)}ms`,
            icon: '⚡',
            color: 'text-green-400',
        },
        {
            label: 'Slow Renders',
            value: `${metrics.slowRenders} (${((metrics.slowRenders / metrics.renderCount) * 100).toFixed(1)}%)`,
            icon: '⚠️',
            color: metrics.slowRenders > 0 ? 'text-amber-400' : 'text-green-400',
        },
    ];

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return '🔴';
            case 'warning':
                return '🟡';
            case 'info':
            default:
                return '🔵';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'border-red-500/50 bg-red-500/10';
            case 'warning':
                return 'border-amber-500/50 bg-amber-500/10';
            case 'info':
            default:
                return 'border-blue-500/50 bg-blue-500/10';
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200">
                    {metrics.componentName}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                    Component Performance Stats
                </p>
            </div>

            <div className="flex-1 overflow-y-auto why-render-scrollbar">
                {/* Stats Grid */}
                <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="p-3 bg-slate-800 border border-slate-700 rounded-lg"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{stat.icon}</span>
                                    <span className="text-xs text-slate-400">{stat.label}</span>
                                </div>
                                <div
                                    className="text-lg font-bold font-mono"
                                    style={{ color: stat.color }}
                                >
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div className="p-4 border-t border-slate-700">
                        <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                            <span>💡</span>
                            Optimization Suggestions
                        </h4>
                        <div className="space-y-3">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border ${getSeverityColor(
                                        suggestion.severity
                                    )}`}
                                >
                                    <div className="flex items-start gap-2 mb-2">
                                        <span className="text-sm">{getSeverityIcon(suggestion.severity)}</span>
                                        <div className="flex-1">
                                            <h5 className="text-sm font-semibold text-slate-200">
                                                {suggestion.title}
                                            </h5>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {suggestion.description}
                                            </p>
                                        </div>
                                    </div>

                                    {suggestion.affectedProps && suggestion.affectedProps.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {suggestion.affectedProps.map((prop, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono"
                                                >
                                                    {prop}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {suggestion.codeExample && (
                                        <details className="mt-2">
                                            <summary className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">
                                                View code example
                                            </summary>
                                            <pre className="mt-2 p-2 bg-slate-900 rounded text-xs overflow-x-auto">
                                                <code className="text-slate-300 font-mono">
                                                    {suggestion.codeExample}
                                                </code>
                                            </pre>
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

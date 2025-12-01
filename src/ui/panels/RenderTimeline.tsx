/**
 * Render Timeline Panel
 * Shows chronological render events with performance visualization
 */

import React, { useMemo } from 'react';
import type { RenderEvent } from '../../engine/RenderTracker';
import { performanceToColor } from '../../utils/colors';

export interface RenderTimelineProps {
    events: RenderEvent[];
    slowThreshold?: number;
    maxEvents?: number;
    onSelectEvent?: (event: RenderEvent) => void;
    selectedEventId?: string;
}

export const RenderTimeline: React.FC<RenderTimelineProps> = ({
    events,
    slowThreshold = 16,
    maxEvents = 100,
    onSelectEvent,
    selectedEventId,
}) => {
    const recentEvents = useMemo(() => {
        return events.slice(-maxEvents).reverse();
    }, [events, maxEvents]);

    const getPerformanceColor = (duration: number): string => {
        return performanceToColor(duration, {
            good: slowThreshold,
            warning: slowThreshold * 2,
        });
    };

    const formatTimestamp = (timestamp: number): string => {
        const date = new Date(timestamp);
        const timeStr = date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        const ms = (timestamp % 1000).toFixed(0).padStart(3, '0');
        return `${timeStr}.${ms}`;
    };
    const getRelativeWidth = (duration: number): number => {
        const maxDuration = Math.max(...recentEvents.map(e => e.duration));
        return Math.max(10, (duration / maxDuration) * 100);
    };

    if (recentEvents.length === 0) {
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p>No renders recorded yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200">
                    Render Timeline
                </h3>
                <span className="text-sm text-slate-400">
                    {events.length} total renders
                </span>
            </div>

            <div className="flex-1 overflow-y-auto why-render-scrollbar">
                <div className="p-4 space-y-2">
                    {recentEvents.map((event) => (
                        <div
                            key={event.id}
                            className={`
                group relative p-3 rounded-lg border cursor-pointer transition-all
                ${selectedEventId === event.id
                                    ? 'bg-blue-500/10 border-blue-500/50'
                                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                }
              `}
                            onClick={() => onSelectEvent?.(event)}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-200">
                                        {event.componentName}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        #{event.renderCount}
                                    </span>
                                </div>
                                <span className="text-xs font-mono text-slate-400">
                                    {formatTimestamp(event.timestamp)}
                                </span>
                            </div>

                            {/* Duration Bar */}
                            <div className="relative h-6 bg-slate-900 rounded overflow-hidden mb-2">
                                <div
                                    className="h-full transition-all duration-300 flex items-center px-2"
                                    style={{
                                        width: `${getRelativeWidth(event.duration)}%`,
                                        backgroundColor: getPerformanceColor(event.duration),
                                    }}
                                >
                                    <span className="text-xs font-mono text-white font-semibold">
                                        {event.duration.toFixed(2)}ms
                                    </span>
                                </div>
                            </div>

                            {/* Changes */}
                            {event.changes.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {event.changes.slice(0, 3).map((change, i) => (
                                        <span
                                            key={i}
                                            className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                        >
                                            {change.key}
                                        </span>
                                    ))}
                                    {event.changes.length > 3 && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">
                                            +{event.changes.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Hover tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 absolute top-full left-0 mt-1 p-2 bg-slate-900 border border-slate-700 rounded shadow-xl text-xs whitespace-nowrap z-10 transition-opacity pointer-events-none">
                                Click to view details
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

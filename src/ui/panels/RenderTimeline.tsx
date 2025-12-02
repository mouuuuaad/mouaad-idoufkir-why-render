/**
 * Render Timeline Panel
 * Shows chronological render events with performance visualization
 */

import React, { useMemo } from 'react';
import type { RenderEvent } from '../../types';
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-1">No renders recorded yet</h3>
                <p className="text-sm text-slate-500 text-center max-w-xs">
                    Interact with your application to capture render events and performance metrics.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Render Timeline
                </h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/30">
                    {events.length} events
                </span>
            </div>

            <div className="flex-1 overflow-y-auto why-render-scrollbar p-4 space-y-3">
                {recentEvents.map((event, index) => (
                    <div
                        key={event.id}
                        className={`
              group relative p-3 rounded-xl border cursor-pointer transition-all duration-200
              ${selectedEventId === event.id
                                ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                                : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/60 hover:border-slate-600/60 hover:shadow-lg hover:-translate-y-0.5'
                            }
              animate-slide-in-right
            `}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => onSelectEvent?.(event)}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold tracking-tight ${selectedEventId === event.id ? 'text-indigo-300' : 'text-slate-200'}`}>
                                    {event.componentName}
                                </span>
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 border border-slate-600/30">
                                    #{event.renderCount}
                                </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-900/30 px-1.5 py-0.5 rounded">
                                {formatTimestamp(event.timestamp)}
                            </span>
                        </div>

                        {/* Duration Bar */}
                        <div className="relative h-1.5 bg-slate-700/30 rounded-full overflow-hidden mb-3">
                            <div
                                className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                    width: `${getRelativeWidth(event.duration)}%`,
                                    backgroundColor: getPerformanceColor(event.duration),
                                    boxShadow: `0 0 8px ${getPerformanceColor(event.duration)}`
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-500">Duration</span>
                            <span className="font-mono font-medium" style={{ color: getPerformanceColor(event.duration) }}>
                                {event.duration.toFixed(2)}ms
                            </span>
                        </div>

                        {/* Changes */}
                        {event.changes.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-700/30">
                                {event.changes.slice(0, 3).map((change, i) => (
                                    <span
                                        key={i}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium"
                                    >
                                        {change.key}
                                    </span>
                                ))}
                                {event.changes.length > 3 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 border border-slate-600/30">
                                        +{event.changes.length - 3}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Hover tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 transition-opacity duration-200">
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

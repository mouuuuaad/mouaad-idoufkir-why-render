/**
 * Performance Badge Component
 * Shows render count and glows on render
 */

import React, { useEffect, useState } from 'react';

export interface PerformanceBadgeProps {
    renderCount: number;
    componentName: string;
    lastRenderDuration?: number;
    threshold?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    inline?: boolean;
}

export const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({
    renderCount,
    componentName,
    lastRenderDuration,
    threshold = 16,
    position = 'top-right',
    inline = false,
}) => {
    const [isGlowing, setIsGlowing] = useState(false);
    const [prevCount, setPrevCount] = useState(renderCount);

    useEffect(() => {
        if (renderCount > prevCount) {
            setIsGlowing(true);
            const timeout = setTimeout(() => setIsGlowing(false), 500);
            setPrevCount(renderCount);
            return () => clearTimeout(timeout);
        }
    }, [renderCount, prevCount]);

    const getSeverityColor = () => {
        if (!lastRenderDuration) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';

        if (lastRenderDuration <= threshold) {
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        } else if (lastRenderDuration <= threshold * 2) {
            return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        } else {
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        }
    };

    const positionClasses = {
        'top-left': 'top-2 left-2',
        'top-right': 'top-2 right-2',
        'bottom-left': 'bottom-2 left-2',
        'bottom-right': 'bottom-2 right-2',
    };

    const badgeClass = `
    inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border
    ${getSeverityColor()}
    ${isGlowing ? 'animate-pulse-glow' : ''}
    ${!inline ? `fixed ${positionClasses[position]} z-[9999]` : ''}
    transition-all duration-300
  `;

    return (
        <div className={badgeClass} title={componentName}>
            <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                />
            </svg>
            <span className="font-mono">{renderCount}</span>
            {lastRenderDuration !== undefined && (
                <span className="opacity-70 font-mono">{lastRenderDuration.toFixed(1)}ms</span>
            )}
        </div>
    );
};

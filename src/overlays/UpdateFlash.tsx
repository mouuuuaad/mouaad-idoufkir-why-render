/**
 * Flash Update Overlay
 * Highlights components when they update (like React DevTools)
 */

import React, { useEffect, useState } from 'react';
import { globalEventEmitter } from '../engine/EventEmitter';
import { useDevToolsStore } from '../store';

export const UpdateFlash: React.FC = () => {
    const { showFlash } = useDevToolsStore();
    const [flashes, setFlashes] = useState<Map<string, number>>(new Map());

    useEffect(() => {
        if (!showFlash) return;

        const handleRenderEnd = (payload: { componentId: string }) => {
            setFlashes((prev) => {
                const next = new Map(prev);
                next.set(payload.componentId, Date.now());
                return next;
            });

            // Remove flash after animation
            setTimeout(() => {
                setFlashes((prev) => {
                    const next = new Map(prev);
                    next.delete(payload.componentId);
                    return next;
                });
            }, 500);
        };

        const unsubscribe = globalEventEmitter.on('render:end', handleRenderEnd);
        return () => unsubscribe();
    }, [showFlash]);

    if (!showFlash || flashes.size === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9997]">
            {Array.from(flashes.keys()).map((componentId) => (
                <div
                    key={componentId}
                    className="absolute inset-0 border-4 border-blue-500 animate-flash"
                    style={{
                        animation: 'flash 0.5s ease-in-out',
                    }}
                />
            ))}
        </div>
    );
};

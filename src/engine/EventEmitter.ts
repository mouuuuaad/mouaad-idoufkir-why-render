/**
 * Simple type-safe event emitter for render tracking events
 */

import type { RenderEvent } from '../types';

export type RenderEventType =
    | 'render:start'
    | 'render:end'
    | 'change:detected'
    | 'performance:warning'
    | 'component:mounted'
    | 'component:unmounted';

export interface RenderEventPayload {
    'render:start': {
        componentName: string;
        componentId: string;
        timestamp: number;
    };
    'render:end': {
        componentName: string;
        componentId: string;
        renderEvent: RenderEvent;
    };
    'change:detected': {
        componentName: string;
        componentId: string;
        changes: Array<{
            key: string;
            reason: string;
            oldValue: any;
            newValue: any;
        }>;
    };
    'performance:warning': {
        componentName: string;
        componentId: string;
        duration: number;
        threshold: number;
    };
    'component:mounted': {
        componentName: string;
        componentId: string;
    };
    'component:unmounted': {
        componentName: string;
        componentId: string;
    };
}

type EventHandler<T extends RenderEventType> = (payload: RenderEventPayload[T]) => void;

export class EventEmitter {
    private listeners: Map<RenderEventType, Set<EventHandler<any>>> = new Map();

    /**
     * Subscribe to an event
     */
    on<T extends RenderEventType>(event: T, handler: EventHandler<T>): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event)!.add(handler);

        // Return unsubscribe function
        return () => this.off(event, handler);
    }

    /**
     * Unsubscribe from an event
     */
    off<T extends RenderEventType>(event: T, handler: EventHandler<T>): void {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.delete(handler);
        }
    }

    /**
     * Emit an event to all subscribers
     */
    emit<T extends RenderEventType>(event: T, payload: RenderEventPayload[T]): void {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(payload);
                } catch (error) {
                    console.error(`[why-render] Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Subscribe to an event once (auto-unsubscribe after first call)
     */
    once<T extends RenderEventType>(event: T, handler: EventHandler<T>): () => void {
        const wrappedHandler = (payload: RenderEventPayload[T]) => {
            handler(payload);
            this.off(event, wrappedHandler);
        };

        return this.on(event, wrappedHandler as EventHandler<T>);
    }

    /**
     * Remove all listeners for a specific event or all events
     */
    clear(event?: RenderEventType): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Get listener count for an event
     */
    listenerCount(event: RenderEventType): number {
        return this.listeners.get(event)?.size ?? 0;
    }
}

// Global singleton instance
export const globalEventEmitter = new EventEmitter();

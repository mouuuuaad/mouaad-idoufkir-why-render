import { useRef, useEffect } from 'react';
import { Options, Change } from '../types';
import { getChanges } from '../utils/diff';
import { shouldInstrument } from '../utils/env';
import { globalRenderTracker } from '../engine/RenderTracker';
import { globalPerformanceMonitor } from '../engine/PerformanceMonitor';

// Generate stable component IDs
let componentIdCounter = 0;
const generateComponentId = (name: string): string => {
    return `${name}-${++componentIdCounter}-${Date.now()}`;
};

export function useWhyRender<TProps = any>(
    props: TProps,
    componentName?: string,
    options?: Options
): { lastProps: TProps | null; changes: Change[]; componentId: string } {
    if (!shouldInstrument()) {
        return { lastProps: null, changes: [], componentId: '' };
    }

    // Stable ID for this component instance
    const componentIdRef = useRef<string>('');
    if (!componentIdRef.current) {
        const name = componentName || 'Component';
        componentIdRef.current = generateComponentId(name);

        // Register component in hierarchy
        globalRenderTracker.registerComponent(name, componentIdRef.current);
    }

    const lastProps = useRef<TProps | null>(null);
    const changesRef = useRef<Change[]>([]);
    const renderCount = useRef(0);
    const name = componentName || 'Component';
    const strategy = options?.compareStrategy || 'shallow';

    // Start performance tracking
    globalPerformanceMonitor.markRenderStart(name, componentIdRef.current);

    // Calculate changes during render
    if (lastProps.current) {
        changesRef.current = getChanges(
            lastProps.current,
            props,
            strategy,
            options?.customCompare,
            options?.skipKeys
        );

        // Track render with changes
        globalRenderTracker.trackRender(
            name,
            componentIdRef.current,
            props,
            changesRef.current
        );

        if (changesRef.current.length > 0) {
            const msg = `[why-render] ${name} re-rendered because: ${changesRef.current.map(c => c.key).join(', ')}`;
            console.warn(msg);

            if (options?.verbose) {
                console.groupCollapsed(`[why-render] ${name} details`);
                changesRef.current.forEach(change => {
                    // Truncate long values for display
                    const formatVal = (v: any) => {
                        try {
                            const s = typeof v === 'string' ? v : JSON.stringify(v);
                            return s && s.length > 1000 ? s.slice(0, 1000) + '...' : s;
                        } catch { return String(v); }
                    };

                    console.log(`Prop '${change.key}':`, {
                        ...change,
                        oldValue: formatVal(change.oldValue),
                        newValue: formatVal(change.newValue)
                    });

                    if (change.reason === 'function') {
                        console.log('💡 Tip: Wrap with useCallback');
                    } else if (change.reason === 'reference') {
                        console.log('💡 Tip: Memoize object/array or move outside component');
                    }
                });
                console.groupEnd();
            }
        }
    } else {
        // Initial render
        globalRenderTracker.trackRender(
            name,
            componentIdRef.current,
            props,
            []
        );
    }

    renderCount.current++;

    // Commit phase: update lastProps and end performance tracking
    useEffect(() => {
        lastProps.current = props;
        globalRenderTracker.commitRender(name, componentIdRef.current);
    });

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            globalRenderTracker.unregisterComponent(componentIdRef.current);
        };
    }, []);

    return {
        lastProps: lastProps.current,
        changes: changesRef.current,
        componentId: componentIdRef.current,
    };
}

// Static track method for opt-in tracking
(useWhyRender as any).track = () => {
    return Symbol('why-render-token');
};

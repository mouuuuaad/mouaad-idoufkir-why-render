import { useRef, useEffect } from 'react';
import { Options, Change } from '../types';
import { getChanges } from '../utils/diff';
import { shouldInstrument } from '../utils/env';

// Global registry for tracking (WeakMap keyed by a unique symbol per component instance)
const componentRegistry = new WeakMap<object, string>();

export function useWhyRender<TProps = any>(
    props: TProps,
    componentName?: string,
    options?: Options
): { lastProps: TProps | null; changes: Change[] } {
    if (!shouldInstrument()) {
        return { lastProps: null, changes: [] };
    }

    // Stable ID for this component instance
    // We use a ref to hold a symbol that represents this instance "identity"
    const idRef = useRef<object>(null);
    if (!idRef.current) {
        idRef.current = {}; // Unique object as key
    }

    const lastProps = useRef<TProps | null>(null);
    const changesRef = useRef<Change[]>([]);
    const renderCount = useRef(0);

    const name = componentName || 'Component';
    const strategy = options?.compareStrategy || 'shallow';

    // Calculate changes during render
    if (lastProps.current) {
        changesRef.current = getChanges(
            lastProps.current,
            props,
            strategy,
            options?.customCompare,
            options?.skipKeys
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
                        console.log('Tip: Wrap with useCallback');
                    } else if (change.reason === 'reference') {
                        console.log('Tip: Memoize object/array or move outside component');
                    }
                });
                console.groupEnd();
            }
        }
    }

    renderCount.current++;

    // Commit phase: update lastProps
    useEffect(() => {
        lastProps.current = props;
    });

    // Register for tracking if needed
    useEffect(() => {
        if (idRef.current) {
            componentRegistry.set(idRef.current, name);
        }
    }, [name]);

    return {
        lastProps: lastProps.current,
        changes: changesRef.current
    };
}

// Static-like method to get the token (not directly attached to function due to ESM, but exported separately if needed)
// Or we can attach it if we change export style. 
// Requirement: "Provide an opt-in useWhyRender.track()"
// We can assign it to the function object.
(useWhyRender as any).track = () => {
    // This is tricky because hooks rely on call context. 
    // If the user calls `useWhyRender.track()` inside a component, it's just a function.
    // It probably needs to be a separate hook `useWhyRenderTrack` or return a token from the main hook.
    // Re-reading requirement: "Provide an opt-in useWhyRender.track() that returns a small token"
    // Maybe they mean the return value of the hook has a track method? Or it's a separate function on the export?
    // "useWhyRender.track()" looks like a static method.
    // But to work it needs access to the instance. 
    // I will implement a separate hook `useTrackWhyRender` or just return the token from `useWhyRender` if requested?
    // Let's stick to the simplest interpretation: A static helper that generates a token?
    // Actually, if I attach it to the function, I can't use hook state inside it unless it's also a hook.
    // I'll implement it as a property on the function that returns a unique symbol/token.
    return Symbol('why-render-token');
};

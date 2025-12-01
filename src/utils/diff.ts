import { Change, CompareStrategy } from '../types';

function isObject(x: any): x is object {
    return typeof x === 'object' && x !== null;
}

function fastDeepEqual(a: any, b: any, depth: number = 3): boolean {
    if (depth < 0) return true; // Stop recursion, assume equal to avoid perf hit
    if (Object.is(a, b)) return true;

    if (!isObject(a) || !isObject(b)) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
        if (!fastDeepEqual((a as any)[key], (b as any)[key], depth - 1)) return false;
    }

    return true;
}

function deepEqual(a: any, b: any): boolean {
    // Try structuredClone for deep copy comparison if available (modern browsers/Node)
    // But structuredClone copies, it doesn't compare.
    // We can use a recursive comparator that handles cycles if needed, 
    // or just JSON.stringify if we assume no cycles/functions for "deep" data.
    // Requirement says: "use user-provided structuredClone + JSON compare or a controlled recursive comparator"
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch (e) {
        // Fallback to fastDeepEqual with higher depth if JSON fails (e.g. circular)
        return fastDeepEqual(a, b, 10);
    }
}

export function getChanges(
    prevProps: any,
    nextProps: any,
    strategy: CompareStrategy,
    customCompare?: (a: any, b: any) => boolean,
    skipKeys: string[] = []
): Change[] {
    const changes: Change[] = [];
    const allKeys = new Set([...Object.keys(prevProps || {}), ...Object.keys(nextProps || {})]);

    for (const key of allKeys) {
        if (skipKeys.includes(key)) continue;

        const prev = prevProps ? prevProps[key] : undefined;
        const next = nextProps ? nextProps[key] : undefined;

        if (Object.is(prev, next)) {
            continue;
        }

        if (customCompare && customCompare(prev, next)) {
            continue;
        }

        let reason: Change['reason'] = 'value';
        let areDeepEqual = false;

        if (typeof prev !== typeof next) {
            reason = 'type';
        } else if (typeof prev === 'function') {
            reason = 'function';
        } else if (Array.isArray(prev) && Array.isArray(next) && prev.length !== next.length) {
            reason = 'length';
        } else if (isObject(prev) && isObject(next)) {
            // It's an object/array reference change
            if (strategy === 'deep') {
                areDeepEqual = deepEqual(prev, next);
            } else if (strategy === 'fast-deep') {
                areDeepEqual = fastDeepEqual(prev, next);
            } else {
                // shallow strategy: we already know they are not Object.is, so they are different refs
                areDeepEqual = false;
            }

            if (areDeepEqual) {
                reason = 'reference';
            } else {
                reason = 'value'; // Deeply different
            }
        }

        changes.push({
            key,
            reason,
            oldValue: prev,
            newValue: next,
        });
    }

    return changes;
}

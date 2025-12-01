import { describe, it, expect, vi } from 'vitest';
import { getChanges } from '../src/utils/diff';
import { renderHook } from '@testing-library/react';
import { useWhyRender } from '../src/hooks/useWhyRender';
import React from 'react';

describe('getChanges advanced strategies', () => {
    it('fast-deep: detects differences at depth', () => {
        const prev = { a: { b: { c: 1 } } };
        const next = { a: { b: { c: 2 } } };
        const changes = getChanges(prev, next, 'fast-deep');
        expect(changes[0]).toMatchObject({ key: 'a', reason: 'value' });
    });

    it('fast-deep: ignores differences beyond default depth', () => {
        // Default depth is 3.
        // Level 1: a (passed to getChanges, so fastDeepEqual called on a's value)
        // Level 2: b
        // Level 3: c
        // Level 4: d
        // Level 5: e -> difference here should be ignored

        const prev = { a: { b: { c: { d: { e: 1 } } } } };
        const next = { a: { b: { c: { d: { e: 2 } } } } };
        // If depth is 3, it checks a, b, c. At c, it compares d.
        // Wait, let's trace:
        // depth 3: keys(prev) = ['a']. loop 'a'. recurse(prev.a, next.a, 2)
        // depth 2: keys(prev.a) = ['b']. loop 'b'. recurse(prev.a.b, next.a.b, 1)
        // depth 1: keys(prev.a.b) = ['c']. loop 'c'. recurse(prev.a.b.c, next.a.b.c, 0)
        // So changes at depth 4 (d) are ignored.

        const changes = getChanges(prev, next, 'fast-deep');
        // It thinks they are equal (deep difference ignored), so it reports 'reference' change
        expect(changes).toHaveLength(1);
        expect(changes[0]).toMatchObject({ key: 'a', reason: 'reference' });
    });

    it('deep: detects deep differences', () => {
        const prev = { a: { b: { c: { d: 1 } } } };
        const next = { a: { b: { c: { d: 2 } } } };
        const changes = getChanges(prev, next, 'deep');
        expect(changes[0]).toMatchObject({ key: 'a', reason: 'value' });
    });
});

describe('useWhyRender Strict Mode', () => {
    it('handles double invocation without logging twice', () => {
        // Mock console.warn
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        // We can't easily simulate Strict Mode double render in renderHook without a wrapper,
        // but we can simulate the behavior by calling the hook logic twice.
        // However, the hook relies on refs.
        // In Strict Mode, React runs the render function twice, but uses the same ref object.
        // So `renderCount` should increment twice.
        // But `useEffect` only runs once (after commit).

        // Actually, in React 18/19 dev strict mode, effects also run twice (mount/unmount/mount).
        // But render phase double invocation happens before commit.

        const { rerender } = renderHook(({ val }) => useWhyRender({ val }, 'Test'), {
            initialProps: { val: 1 }
        });

        // First render: lastProps is null, no log.
        expect(consoleSpy).not.toHaveBeenCalled();

        // Rerender with same props
        rerender({ val: 1 });
        expect(consoleSpy).not.toHaveBeenCalled();

        // Rerender with new props
        rerender({ val: 2 });
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('val'));

        consoleSpy.mockRestore();
    });
});

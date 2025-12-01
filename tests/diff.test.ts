import { describe, it, expect } from 'vitest';
import { getChanges } from '../src/utils/diff';

describe('getChanges', () => {
    it('detects value changes', () => {
        const prev = { a: 1 };
        const next = { a: 2 };
        const changes = getChanges(prev, next, 'shallow');
        expect(changes).toHaveLength(1);
        expect(changes[0]).toMatchObject({ key: 'a', reason: 'value', oldValue: 1, newValue: 2 });
    });

    it('detects type changes', () => {
        const prev = { a: 1 };
        const next = { a: '1' };
        const changes = getChanges(prev, next, 'shallow');
        expect(changes[0]).toMatchObject({ key: 'a', reason: 'type' });
    });

    it('detects function changes', () => {
        const fn1 = () => { };
        const fn2 = () => { };
        const prev = { cb: fn1 };
        const next = { cb: fn2 };
        const changes = getChanges(prev, next, 'shallow');
        expect(changes[0]).toMatchObject({ key: 'cb', reason: 'function' });
    });

    it('detects reference changes for objects', () => {
        const obj1 = { x: 1 };
        const obj2 = { x: 1 }; // Same content, different ref
        const prev = { data: obj1 };
        const next = { data: obj2 };
        const changes = getChanges(prev, next, 'shallow');
        expect(changes[0]).toMatchObject({ key: 'data', reason: 'reference' });
    });

    it('ignores identical references', () => {
        const obj = { x: 1 };
        const prev = { data: obj };
        const next = { data: obj };
        const changes = getChanges(prev, next, 'shallow');
        expect(changes).toHaveLength(0);
    });

    it('detects deep changes with deep strategy', () => {
        const prev = { data: { x: 1 } };
        const next = { data: { x: 2 } };
        // With shallow strategy, this is just a reference change (assuming new object)
        // But if we use deep strategy, we want to know if it's *really* different?
        // Wait, my implementation of 'deep' strategy in diff.ts was:
        // if (JSON.stringify(prev) === JSON.stringify(next)) reason = 'reference' else reason = 'value'

        const changes = getChanges(prev, next, 'deep');
        expect(changes[0]).toMatchObject({ key: 'data', reason: 'value' });
    });

    it('detects deep equality (reference only change) with deep strategy', () => {
        const prev = { data: { x: 1 } };
        const next = { data: { x: 1 } };
        const changes = getChanges(prev, next, 'deep');
        expect(changes[0]).toMatchObject({ key: 'data', reason: 'reference' });
    });
});

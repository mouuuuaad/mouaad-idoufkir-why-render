/**
 * Tests for utility functions
 */

import { describe, it, expect } from 'vitest';
import {
    stringToColor,
    intensityToColor,
    performanceToColor,
} from '../src/utils/colors';
import {
    analyzePropChanges,
    analyzePerformance,
    analyzeRenderPatterns,
} from '../src/utils/suggestions';
import type { Change } from '../src/types';
import type { PerformanceMetrics } from '../src/engine/PerformanceMonitor';
import type { RenderEvent } from '../src/engine/RenderTracker';

describe('Color Utilities', () => {
    it('should generate consistent colors from strings', () => {
        const color1 = stringToColor('TestComponent');
        const color2 = stringToColor('TestComponent');
        const color3 = stringToColor('DifferentComponent');

        expect(color1).toBe(color2);
        expect(color1).not.toBe(color3);
        expect(color1).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
    });

    it('should generate heatmap colors by intensity', () => {
        const low = intensityToColor(0.1);
        const mid = intensityToColor(0.5);
        const high = intensityToColor(0.9);

        expect(low).toMatch(/^hsla\(\d+, 100%, 50%, 1\)$/);
        expect(mid).toMatch(/^hsla\(\d+, 100%, 50%, 1\)$/);
        expect(high).toMatch(/^hsla\(\d+, 100%, 50%, 1\)$/);
    });

    it('should generate performance colors', () => {
        const green = performanceToColor(10, { good: 16, warning: 32 });
        const yellow = performanceToColor(20, { good: 16, warning: 32 });
        const red = performanceToColor(40, { good: 16, warning: 32 });

        expect(green).toBe('#10b981');
        expect(yellow).toBe('#f59e0b');
        expect(red).toBe('#ef4444');
    });
});

describe('Suggestion Engine', () => {
    it('should suggest useCallback for function props', () => {
        const changes: Change[] = [
            {
                key: 'onClick',
                reason: 'function',
                oldValue: () => { },
                newValue: () => { },
            },
        ];

        const suggestions = analyzePropChanges('TestComponent', changes);

        expect(suggestions).toHaveLength(1);
        expect(suggestions[0].type).toBe('useCallback');
        expect(suggestions[0].affectedProps).toContain('onClick');
    });

    it('should suggest useMemo for object props', () => {
        const changes: Change[] = [
            {
                key: 'config',
                reason: 'reference',
                oldValue: { foo: 'bar' },
                newValue: { foo: 'bar' },
            },
        ];

        const suggestions = analyzePropChanges('TestComponent', changes);

        expect(suggestions.some(s => s.type === 'useMemo')).toBe(true);
    });

    it('should suggest React.memo for excessive renders', () => {
        const metrics: PerformanceMetrics = {
            componentName: 'TestComponent',
            componentId: 'test-1',
            renderCount: 150,
            totalTime: 1000,
            averageTime: 6.67,
            lastRenderTime: 5,
            slowRenders: 0,
            maxRenderTime: 10,
            minRenderTime: 3,
        };

        const suggestions = analyzePerformance(metrics, 16);

        expect(suggestions.some(s => s.type === 'React.memo')).toBe(true);
        expect(suggestions.some(s => s.severity === 'critical')).toBe(true);
    });

    it('should detect rapid re-render patterns', () => {
        const history: RenderEvent[] = [
            {
                id: '1',
                componentName: 'Test',
                componentId: 'test-1',
                timestamp: 100,
                duration: 5,
                changes: [],
                props: {},
                renderCount: 1,
            },
            {
                id: '2',
                componentName: 'Test',
                componentId: 'test-1',
                timestamp: 105, // 5ms later - rapid!
                duration: 5,
                changes: [],
                props: {},
                renderCount: 2,
            },
            {
                id: '3',
                componentName: 'Test',
                componentId: 'test-1',
                timestamp: 110, // Another 5ms - rapid!
                duration: 5,
                changes: [],
                props: {},
                renderCount: 3,
            },
            {
                id: '4',
                componentName: 'Test',
                componentId: 'test-1',
                timestamp: 115,
                duration: 5,
                changes: [],
                props: {},
                renderCount: 4,
            },
            {
                id: '5',
                componentName: 'Test',
                componentId: 'test-1',
                timestamp: 120, // One more rapid render to trigger warning
                duration: 5,
                changes: [],
                props: {},
                renderCount: 5,
            },
        ];

        const suggestions = analyzeRenderPatterns(history);

        expect(suggestions.some(s => s.title.includes('Rapid Re-render'))).toBe(true);
    });
});

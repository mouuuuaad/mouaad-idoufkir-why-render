
import { analyzeRenderPatterns } from '../src/utils/suggestions';
import { RenderEvent } from '../src/types';
import { describe, it, expect } from 'vitest';

describe('analyzeRenderPatterns', () => {
    it('should generate detailed suggestions for rapid re-renders', () => {
        const mockHistory: RenderEvent[] = [
            { id: '1', timestamp: 1000, componentName: 'Test', componentId: '1', duration: 1, changes: [], props: {}, renderCount: 1 },
            { id: '2', timestamp: 1005, componentName: 'Test', componentId: '1', duration: 1, changes: [], props: {}, renderCount: 2 },
            { id: '3', timestamp: 1009, componentName: 'Test', componentId: '1', duration: 1, changes: [], props: {}, renderCount: 3 },
            { id: '4', timestamp: 1012, componentName: 'Test', componentId: '1', duration: 1, changes: [], props: {}, renderCount: 4 },
            { id: '5', timestamp: 1015, componentName: 'Test', componentId: '1', duration: 1, changes: [], props: {}, renderCount: 5 },
        ];

        const suggestions = analyzeRenderPatterns(mockHistory);

        expect(suggestions).toHaveLength(3);
        expect(suggestions[0].title).toBe('Potential Cause: Effect Dependency Loop');
        expect(suggestions[1].title).toBe('Potential Cause: Unstable Parent or Props');
        expect(suggestions[2].title).toBe('Potential Cause: Context Thrashing');
    });
});

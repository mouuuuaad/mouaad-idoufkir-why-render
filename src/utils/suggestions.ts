/**
 * AI-Powered (Rule-based) Suggestion Engine
 * Analyzes render patterns and provides optimization suggestions
 */

import type { Change, RenderEvent } from '../types';
import type { PerformanceMetrics } from '../engine/PerformanceMonitor';

export interface Suggestion {
    type: 'useMemo' | 'useCallback' | 'React.memo' | 'moveOutside' | 'splitComponent' | 'useTransition' | 'general' | 'styleProp';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    codeExample?: string;
    affectedProps?: string[];
}

/**
 * Analyze changes and generate suggestions
 */
export function analyzePropChanges(componentName: string, changes: Change[]): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Count change types
    const functionChanges = changes.filter(c => c.reason === 'function');
    const referenceChanges = changes.filter(c => c.reason === 'reference');

    // Suggest useCallback for function props
    if (functionChanges.length > 0) {
        suggestions.push({
            type: 'useCallback',
            severity: functionChanges.length > 2 ? 'warning' : 'info',
            title: 'Unstable Function Props Detected',
            description: `${functionChanges.length} function prop(s) are being recreated on every render. Wrap them with useCallback to maintain referential equality.`,
            affectedProps: functionChanges.map(c => c.key),
            codeExample: `const ${functionChanges[0].key} = useCallback(() => {
  // your function logic
}, [dependencies]);`
        });
    }

    // Suggest useMemo for object/array props
    if (referenceChanges.length > 0) {
        // Check for style prop specifically
        const styleChange = referenceChanges.find(c => c.key === 'style');
        if (styleChange) {
            suggestions.push({
                type: 'styleProp',
                severity: 'warning',
                title: 'Inline Style Object Detected',
                description: 'The `style` prop is receiving a new object on every render. This breaks referential equality and causes re-renders.',
                affectedProps: ['style'],
                codeExample: `// Bad
<Component style={{ color: 'red' }} />

// Good (Move outside)
const styles = { color: 'red' };
<Component style={styles} />

// Good (useMemo)
const styles = useMemo(() => ({ color: active ? 'red' : 'blue' }), [active]);
<Component style={styles} />`
            });
        }

        const otherRefChanges = referenceChanges.filter(c => c.key !== 'style');
        if (otherRefChanges.length > 0) {
            suggestions.push({
                type: 'useMemo',
                severity: otherRefChanges.length > 2 ? 'warning' : 'info',
                title: 'Unstable Reference Props Detected',
                description: `${otherRefChanges.length} object/array prop(s) are being recreated with the same content. Use useMemo to prevent unnecessary re-renders.`,
                affectedProps: otherRefChanges.map(c => c.key),
                codeExample: `const ${otherRefChanges[0].key} = useMemo(() => ({
  // your object
}), [dependencies]);`
            });
        }
    }

    // Suggest moving constants outside component
    const constantLikeChanges = changes.filter(c =>
        c.reason === 'reference' &&
        typeof c.newValue === 'object' &&
        JSON.stringify(c.oldValue) === JSON.stringify(c.newValue)
    );

    if (constantLikeChanges.length > 0) {
        suggestions.push({
            type: 'moveOutside',
            severity: 'info',
            title: 'Consider Moving Constants Outside Component',
            description: 'Some props appear to be static objects/arrays. Consider moving them outside the component or using useMemo.',
            affectedProps: constantLikeChanges.map(c => c.key),
            codeExample: `// Move outside component
const STATIC_${constantLikeChanges[0].key.toUpperCase()} = ${JSON.stringify(constantLikeChanges[0].newValue, null, 2).substring(0, 100)}...;

function ${componentName}() {
  // Use STATIC_${constantLikeChanges[0].key.toUpperCase()}
}`
        });
    }

    return suggestions;
}

/**
 * Analyze performance metrics and generate suggestions
 */
export function analyzePerformance(metrics: PerformanceMetrics, threshold: number = 16): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Too many renders
    if (metrics.renderCount > 50) {
        suggestions.push({
            type: 'React.memo',
            severity: metrics.renderCount > 100 ? 'critical' : 'warning',
            title: 'Excessive Re-renders Detected',
            description: `This component has rendered ${metrics.renderCount} times. Consider wrapping it with React.memo() to prevent unnecessary renders.`,
            codeExample: `export default React.memo(${metrics.componentName});

// Or with custom comparison
export default React.memo(${metrics.componentName}, (prevProps, nextProps) => {
  // return true if passing nextProps would result in same output
  return prevProps.id === nextProps.id;
});`
        });
    }

    // Slow renders
    if (metrics.slowRenders > 5) {
        const slowPercentage = (metrics.slowRenders / metrics.renderCount) * 100;
        suggestions.push({
            type: metrics.averageTime > 100 ? 'splitComponent' : 'useTransition',
            severity: slowPercentage > 50 ? 'critical' : 'warning',
            title: 'Slow Renders Detected',
            description: `${slowPercentage.toFixed(1)}% of renders exceeded ${threshold}ms. Average: ${metrics.averageTime.toFixed(2)}ms, Max: ${metrics.maxRenderTime.toFixed(2)}ms.`,
            codeExample: metrics.averageTime > 100
                ? `// Consider splitting into smaller components
function ${metrics.componentName}() {
  return (
    <>
      <LightweightPart />
      <HeavyPart /> {/* Move expensive logic here */}
    </>
  );
}`
                : `// Use React 19 transitions for non-urgent updates
import { useTransition } from 'react';

const [isPending, startTransition] = useTransition();

startTransition(() => {
  // Non-urgent state updates
  setState(newValue);
});`
        });
    }



    // High average render time
    if (metrics.averageTime > 50 && metrics.renderCount > 10) {
        suggestions.push({
            type: 'general',
            severity: 'warning',
            title: 'Component Optimization Needed',
            description: `Average render time is ${metrics.averageTime.toFixed(2)}ms. This component may benefit from performance optimizations.`,
            codeExample: `// Optimization strategies:
// 1. Memoize expensive calculations with useMemo
// 2. Virtualize long lists (react-window, react-virtual)
// 3. Lazy load heavy components with React.lazy()
// 4. Use React DevTools Profiler to identify bottlenecks`
        });
    }

    return suggestions;
}

/**
 * Analyze context usage patterns
 */
export function analyzeContextPatterns(history: RenderEvent[]): Suggestion[] {
    const suggestions: Suggestion[] = [];
    if (history.length < 2) return suggestions;

    // Check for props named 'value' or 'context' that change frequently
    const contextLikeProps = ['value', 'context', 'theme', 'store'];
    const propChanges = new Map<string, number>();

    history.forEach(event => {
        event.changes.forEach((change: Change) => {
            if (contextLikeProps.some(p => change.key.toLowerCase().includes(p))) {
                propChanges.set(change.key, (propChanges.get(change.key) || 0) + 1);
            }
        });
    });

    const frequentContextChanges = Array.from(propChanges.entries())
        .filter(([_, count]) => count > history.length * 0.8);

    if (frequentContextChanges.length > 0) {
        suggestions.push({
            type: 'general',
            severity: 'warning',
            title: 'Potential Context Thrashing',
            description: `Context-like props (${frequentContextChanges.map(p => p[0]).join(', ')}) are changing in almost every render. This can cause widespread re-renders in consumers.`,
            codeExample: `// Split context into smaller contexts
const ValueContext = createContext(null);
const ActionsContext = createContext(null);

// Or memoize the value
const value = useMemo(() => ({ state, dispatch }), [state]);`
        });
    }

    return suggestions;
}

/**
 * Analyze render event history and detect patterns
 */
export function analyzeRenderPatterns(history: RenderEvent[]): Suggestion[] {
    const suggestions: Suggestion[] = [];

    if (history.length < 3) return suggestions;

    // Detect rapid re-renders (< 10ms apart)
    let rapidRenderCount = 0;
    for (let i = 1; i < history.length; i++) {
        if (history[i].timestamp - history[i - 1].timestamp < 10) {
            rapidRenderCount++;
        }
    }

    if (rapidRenderCount > 3) {
        // 1. Effect Dependency Loop Suggestion
        suggestions.push({
            type: 'general',
            severity: 'warning',
            title: 'Potential Cause: Effect Dependency Loop',
            description: 'Rapid re-renders often occur when a useEffect updates a state variable that is also in its dependency array, creating an infinite loop.',
            codeExample: `// ❌ PROBLEM: Updating state that is a dependency
useEffect(() => {
  // This updates 'value', which triggers re-render
  // Then useEffect runs again because 'value' changed
  setValue(value + 1); 
}, [value]); // <--- 'value' is a dependency

// ✅ SOLUTION 1: Use functional update
useEffect(() => {
  setValue(prev => prev + 1); // No dependency needed
}, []);

// ✅ SOLUTION 2: Remove unnecessary dependency
// If you only need to run this when other props change
useEffect(() => {
  if (shouldUpdate) {
    setValue(newValue);
  }
}, [shouldUpdate]); // Remove 'value' from deps`
        });

        // 2. Unstable Parent/Props Suggestion
        suggestions.push({
            type: 'React.memo',
            severity: 'info',
            title: 'Potential Cause: Unstable Parent or Props',
            description: 'If the parent component re-renders frequently and passes new object/function references, this component will also re-render.',
            codeExample: `// ❌ PROBLEM: Parent passes new reference every time
function Parent() {
  // Created new every render
  const handleClick = () => {}; 
  const style = { color: 'red' };

  return <Child onClick={handleClick} style={style} />;
}

// ✅ SOLUTION: Stabilize props in Parent
function Parent() {
  const handleClick = useCallback(() => {}, []);
  const style = useMemo(() => ({ color: 'red' }), []);

  return <Child onClick={handleClick} style={style} />;
}

// ✅ ALTERNATIVE: Wrap Child in React.memo
const Child = React.memo(function Child(props) {
  return <div>...</div>;
});`
        });

        // 3. Context Thrashing Suggestion
        suggestions.push({
            type: 'useMemo',
            severity: 'info',
            title: 'Potential Cause: Context Thrashing',
            description: 'If this component consumes a Context, and the Context value is a new object every time, it will force a re-render.',
            codeExample: `// ❌ PROBLEM: Context provider value is unstable
function MyProvider({ children }) {
  // New object created every render!
  const value = { data, setData }; 
  
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// ✅ SOLUTION: Memoize the context value
function MyProvider({ children }) {
  const value = useMemo(() => ({ data, setData }), [data]);
  
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}`
        });
    }

    // Detect same prop changing repeatedly
    const propChangeFrequency = new Map<string, number>();
    history.forEach(event => {
        event.changes.forEach(change => {
            propChangeFrequency.set(
                change.key,
                (propChangeFrequency.get(change.key) || 0) + 1
            );
        });
    });

    const frequentChanges = Array.from(propChangeFrequency.entries())
        .filter(([_, count]) => count > history.length * 0.8)
        .map(([key]) => key);

    if (frequentChanges.length > 0) {
        suggestions.push({
            type: 'general',
            severity: 'info',
            title: 'Frequently Changing Props',
            description: `Props ${frequentChanges.join(', ')} change in most renders. Verify if all changes are necessary.`,
            affectedProps: frequentChanges
        });
    }

    return suggestions;
}

/**
 * Get all suggestions for a component
 */
export function getComponentSuggestions(
    componentName: string,
    changes: Change[],
    metrics: PerformanceMetrics,
    history: RenderEvent[],
    slowThreshold: number = 16
): Suggestion[] {
    const allSuggestions: Suggestion[] = [
        ...analyzePropChanges(componentName, changes),
        ...analyzePerformance(metrics, slowThreshold),
        ...analyzeRenderPatterns(history),
        ...analyzeContextPatterns(history),
    ];

    // Sort by severity
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return allSuggestions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

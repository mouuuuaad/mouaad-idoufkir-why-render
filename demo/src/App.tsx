import React, { useState, useCallback, useMemo } from 'react';
import { useWhyRender } from '../../src/hooks/useWhyRender';
import { PerformanceBadge } from '../../src/ui/components/PerformanceBadge';
import './App.css';

// Component with good performance (uses useCallback)
function OptimizedCounter({ onClick, label }: { onClick: () => void; label: string }) {
    const { componentId } = useWhyRender({ onClick, label }, 'OptimizedCounter');

    return (
        <div className="component-card good">
            <PerformanceBadge
                renderCount={0}
                componentName="OptimizedCounter"
                inline
            />
            <h3>✅ Optimized Counter</h3>
            <p>Uses useCallback - minimal re-renders</p>
            <button onClick={onClick}>{label}</button>
        </div>
    );
}

// Component with poor performance (recreates function every render)
function UnoptimizedCounter({ count }: { count: number }) {
    // BAD: Creates new function on every render
    const handleClick = () => {
        console.log('Clicked', count);
    };

    // BAD: Creates new object on every render
    const styles = { color: 'blue' };

    useWhyRender({ count, onClick: handleClick, styles }, 'UnoptimizedCounter', {
        verbose: true,
    });

    return (
        <div className="component-card warning">
            <h3>⚠️ Unoptimized Counter</h3>
            <p>Recreates functions - excessive re-renders</p>
            <button onClick={handleClick} style={styles}>
                Count: {count}
            </button>
        </div>
    );
}

// Component with slow render (intentional)
function SlowComponent({ data }: { data: number[] }) {
    useWhyRender({ data }, 'SlowComponent', { verbose: true });

    // Intentionally slow computation
    const slowSum = () => {
        const start = performance.now();
        let sum = 0;
        // Busy wait for ~50ms
        while (performance.now() - start < 50) {
            sum += Math.random();
        }
        return data.reduce((acc, val) => acc + val, 0) + sum;
    };

    return (
        <div className="component-card danger">
            <h3>🐌 Slow Component</h3>
            <p>Takes ~50ms to render</p>
            <div>Sum: {slowSum().toFixed(2)}</div>
        </div>
    );
}

// Nested component hierarchy
function Parent({ count }: { count: number }) {
    useWhyRender({ count }, 'Parent');

    return (
        <div className="component-card">
            <h3>👨‍👧‍👦 Parent Component</h3>
            <p>Count: {count}</p>
            <Child count={count} />
        </div>
    );
}

function Child({ count }: { count: number }) {
    useWhyRender({ count }, 'Child');

    return (
        <div className="nested-component">
            <h4>Child Component</h4>
            <GrandChild count={count} />
        </div>
    );
}

function GrandChild({ count }: { count: number }) {
    useWhyRender({ count }, 'GrandChild');

    return (
        <div className="nested-component">
            <h5>GrandChild: {count}</h5>
        </div>
    );
}

// Component that renders too frequently
function RapidRenderer({ trigger }: { trigger: number }) {
    const [localCount, setLocalCount] = useState(0);

    useWhyRender({ trigger, localCount }, 'RapidRenderer', { verbose: true });

    // This causes rapid re-renders
    const handleRapidClick = () => {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => setLocalCount(prev => prev + 1), i * 5);
        }
    };

    return (
        <div className="component-card warning">
            <h3>⚡ Rapid Re-renderer</h3>
            <p>Re-renders 5 times in quick succession</p>
            <p>Local count: {localCount}</p>
            <button onClick={handleRapidClick}>Trigger Rapid Renders</button>
        </div>
    );
}

// Main App Component
function App() {
    const [count, setCount] = useState(0);
    const [data, setData] = useState([1, 2, 3, 4, 5]);
    const [trigger, setTrigger] = useState(0);

    // GOOD: Memoized callback
    const handleOptimizedClick = useCallback(() => {
        setCount(c => c + 1);
    }, []);

    // GOOD: Memoized value
    const label = useMemo(() => `Click me (${count})`, [count]);

    useWhyRender({ count, data, trigger }, 'App', { verbose: true });

    return (
        <div className="app">
            <header className="app-header">
                <h1>🔍 Why Render - Demo Application</h1>
                <p>Press <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd> to toggle DevTools</p>
                <div className="stats">
                    <div>Global Count: {count}</div>
                    <div>Data Length: {data.length}</div>
                </div>
            </header>

            <div className="controls">
                <button onClick={() => setCount(c => c + 1)} className="btn-primary">
                    Increment Count
                </button>
                <button onClick={() => setData([...data, data.length + 1])} className="btn-primary">
                    Add Data
                </button>
                <button onClick={() => setTrigger(t => t + 1)} className="btn-primary">
                    Trigger Update
                </button>
                <button
                    onClick={() => {
                        setCount(0);
                        setData([1, 2, 3, 4, 5]);
                        setTrigger(0);
                    }}
                    className="btn-secondary"
                >
                    Reset All
                </button>
            </div>

            <div className="components-grid">
                <OptimizedCounter onClick={handleOptimizedClick} label={label} />
                <UnoptimizedCounter count={count} />
                <SlowComponent data={data} />
                <Parent count={count} />
                <RapidRenderer trigger={trigger} />
            </div>

            <div className="info-section">
                <h2>📊 Test Instructions</h2>
                <ol>
                    <li>Open DevTools with <kbd>Cmd/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd></li>
                    <li>Click "Increment Count" - see which components re-render</li>
                    <li>Check Timeline panel for render durations</li>
                    <li>View Stats panel for performance metrics</li>
                    <li>Open Diff panel to see prop changes</li>
                    <li>Look for AI suggestions for optimization</li>
                </ol>

                <h3>Expected Findings:</h3>
                <ul>
                    <li>✅ <strong>OptimizedCounter</strong>: Should re-render minimally (only when label changes)</li>
                    <li>⚠️ <strong>UnoptimizedCounter</strong>: Will show warnings about unstable function props</li>
                    <li>🐌 <strong>SlowComponent</strong>: Should appear red in timeline (slow render)</li>
                    <li>👨‍👧‍👦 <strong>Parent/Child/GrandChild</strong>: Shows component hierarchy</li>
                    <li>⚡ <strong>RapidRenderer</strong>: Triggers rapid re-render pattern detection</li>
                </ul>
            </div>
        </div>
    );
}

export default App;

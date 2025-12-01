import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { useWhyRender, withWhyRender } from '../src';

const Child = ({ count, onClick }: { count: number; onClick: () => void }) => {
    useWhyRender({ count, onClick }, 'Child');
    return <button onClick={onClick}>Child Count: {count}</button>;
};

const MemoizedChild = React.memo(Child);

const App = () => {
    const [count, setCount] = useState(0);
    const [dummy, setDummy] = useState(0);

    // This function is recreated on every render
    const handleClick = () => setCount(c => c + 1);

    // This function is stable
    const stableClick = useCallback(() => setCount(c => c + 1), []);

    return (
        <div style={{ padding: 20 }}>
            <h1>why-render Demo</h1>
            <button onClick={() => setDummy(d => d + 1)}>Force Re-render Parent (Dummy: {dummy})</button>
            <hr />
            <h3>Case 1: Function Recreation</h3>
            <p>Clicking "Force Re-render Parent" will cause Child to re-render because `handleClick` is new.</p>
            <Child count={count} onClick={handleClick} />

            <hr />
            <h3>Case 2: Stable Props</h3>
            <p>Clicking "Force Re-render Parent" should NOT re-render MemoizedChild if props are stable.</p>
            <MemoizedChild count={count} onClick={stableClick} />

            <hr />
            <h3>Case 3: Deep Comparison</h3>
            <p>This component uses `compareStrategy: 'deep'`. It should NOT re-render if object content is same.</p>
            <DeepChild data={{ x: 1, y: { z: 2 } }} />
        </div>
    );
};

const DeepChild = withWhyRender(({ data }: { data: any }) => {
    return <div>Deep Child Data: {JSON.stringify(data)}</div>;
}, { compareStrategy: 'deep', verbose: true });


ReactDOM.createRoot(document.getElementById('root')!).render(<App />);

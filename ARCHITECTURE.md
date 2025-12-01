# Architecture - @mouaad-idoufkir/why-render

## Overview
The library is designed to be a lightweight, dev-only tool for detecting unnecessary re-renders in React applications. It hooks into the React render lifecycle to compare props between renders and identify why a component is updating.

## Memory Model
- **Ref Storage**: We use `useRef` to store the `previousProps` and `changes` for each component instance. This ensures that the data persists across renders but doesn't trigger re-renders itself.
- **WeakMap (Internal)**: While `useRef` handles per-component storage, we can use a module-level `WeakMap` to associate component instances (identified by a stable symbol or ref) with metadata if we need to aggregate data globally for the CLI.
- **Strict Mode Resilience**: React 19 Strict Mode double-invokes render functions. We use `useEffect` to commit the "last props" only after the render is committed. However, to detect the *reason* for the current render, we compare the current props against the *committed* previous props.

## Diffing Algorithms
- **Shallow (Default)**: Uses `Object.is` for strict equality and shallow key comparison. Fast and sufficient for most cases.
- **Fast-Deep**: A depth-limited recursive comparison (default depth 3). Useful for checking if nested objects have changed structure without full traversal.
- **Deep**: Uses `JSON.stringify` (or `structuredClone` logic) to check for deep equality. This helps distinguish between "reference changed but content is same" (fixable with useMemo) vs "content actually changed".

## Tree Shaking
- All instrumentation code is guarded by `if (process.env.NODE_ENV !== 'production')` or `shouldInstrument()` checks.
- The `package.json` defines `"sideEffects": false` to allow bundlers to remove unused imports.
- The production build should result in empty hooks/HOCs that do nothing.

## CLI Integration
- The runtime can optionally track component IDs and emit events.
- The CLI tool (`why-render-report`) is designed to ingest these logs (future scope: via websocket or local storage dump) and generate a summary.

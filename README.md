# @mouaad-idoufkir/why-render

A minimal-bundle library for React 19 that detects and explains unnecessary re-renders.

## Features

- 🪶 **Lightweight**: Tree-shakeable, zero runtime overhead in production.
- ⚡ **React 19 Ready**: Supports concurrent rendering and strict mode.
- 🔍 **Deep Insights**: Detects value changes, reference changes, function recreations, and more.
- 🛠 **Flexible**: Hooks (`useWhyRender`) and HOC (`withWhyRender`) support.

## Installation

```bash
npm install @mouaad-idoufkir/why-render
# or
yarn add @mouaad-idoufkir/why-render
# or
pnpm add @mouaad-idoufkir/why-render
```

## Usage

### Hook: `useWhyRender`

```tsx
import { useWhyRender } from '@mouaad-idoufkir/why-render';

const MyComponent = (props) => {
  useWhyRender(props, 'MyComponent');
  return <div>...</div>;
};
```

### HOC: `withWhyRender`

```tsx
import { withWhyRender } from '@mouaad-idoufkir/why-render';

const MyComponent = (props) => <div>...</div>;

export default withWhyRender(MyComponent);
```

## Options

```ts
interface Options {
  compareStrategy?: "shallow" | "deep" | "fast-deep" | "custom";
  verbose?: boolean; // Show detailed diffs in console group (truncated at 1000 chars)
  skipKeys?: string[];
  customCompare?: (a: any, b: any) => boolean;
}
```

### Comparison Strategies
- **shallow** (default): Fast, checks for reference equality and shallow property equality.
- **fast-deep**: Recursive comparison with a depth limit (default 3). Good for checking if nested data changed without full traversal.
- **deep**: Uses `JSON.stringify` (or structured clone logic) to check for deep equality. Useful to distinguish "reference changed" from "value changed".
- **custom**: Provide your own `customCompare` function.

## Best Practices
- **Dev Only**: The library is optimized for development. It automatically disables itself in production.
- **Verbose Mode**: Use `verbose: true` to see exactly *what* changed in your props, including before/after values.
- **Strict Mode**: Compatible with React 19 Strict Mode. Note that you might see logs reflecting the double-invocation behavior if you have side-effects in render, but `useWhyRender` is designed to be resilient.

## Production
The library is tree-shakeable. Ensure your bundler supports `sideEffects: false` (added in package.json).
To force enable in production (e.g. for debugging a specific deployment), set `window.__WHY_RENDER__ = true` before the app loads.


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
  verbose?: boolean; // Show detailed diffs in console group
  skipKeys?: string[];
  customCompare?: (a: any, b: any) => boolean;
}
```

## Production

The library automatically disables itself in production (`process.env.NODE_ENV === 'production'`).
To force enable it (e.g. in a specific environment), set `window.__WHY_RENDER__ = true`.

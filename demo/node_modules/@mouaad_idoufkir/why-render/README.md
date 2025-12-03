# @mouaad_idoufkir/why-render

[![npm version](https://img.shields.io/npm/v/@mouaad_idoufkir/why-render.svg)](https://www.npmjs.com/package/@mouaad_idoufkir/why-render)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![React 19](https://img.shields.io/badge/React-19-61dafb)

A comprehensive, lightweight developer tool for React 19 that detects unnecessary re-renders, visualizes performance with a Flame Graph, and helps you optimize your application.

## 🚀 Why use this?

React is fast, but unnecessary re-renders can slow down your app. Identifying *why* a component re-rendered (was it a prop change? a state update? a parent render?) can be difficult.

**@mouaad_idoufkir/why-render** solves this by:
1.  **Tracking** every render and its cause.
2.  **Diffing** props to show exactly what changed (value vs. reference).
3.  **Visualizing** performance with an interactive Flame Graph and Timeline.
4.  **Zero Overhead** in production (fully tree-shakeable).

---

## 📦 Installation

```bash
npm install @mouaad_idoufkir/why-render
# or
yarn add @mouaad_idoufkir/why-render
# or
pnpm add @mouaad_idoufkir/why-render
```

---

## 🏁 Quick Start

### 1. Add the DevTools (Optional but Recommended)

Add the `<WhyRenderDevTools />` component to the root of your application (e.g., in `App.tsx` or `main.tsx`).

```tsx
import React from 'react';
import { WhyRenderDevTools } from '@mouaad_idoufkir/why-render/ui';

const App = () => {
  return (
    <>
      <MyComponent />
      {/* Only renders in development */}
      <WhyRenderDevTools />
    </>
  );
};
```

### 2. Track a Component

Use the `useWhyRender` hook inside any component you want to debug.

```tsx
import { useWhyRender } from '@mouaad_idoufkir/why-render';

const UserProfile = (props) => {
  // 1. Pass props
  // 2. Pass a unique name for the component
  useWhyRender(props, 'UserProfile');

  return <div>{props.name}</div>;
};
```

Open your browser console or the **WhyRender DevTools** panel to see the logs!

---

## 🛠 Features & Usage

### Hooks & HOCs

#### `useWhyRender(props, componentName, options?)`

The primary hook for functional components.

```tsx
useWhyRender(props, 'MyComponent', {
  verbose: true, // Log full diffs to console
  compareStrategy: 'deep' // 'shallow' | 'deep' | 'fast-deep'
});
```

#### `withWhyRender(Component, options?)`

A Higher-Order Component (HOC) for class components or when you prefer wrapping exports.

```tsx
import { withWhyRender } from '@mouaad_idoufkir/why-render';

const MyComponent = (props) => <div>...</div>;

export default withWhyRender(MyComponent, { verbose: true });
```

### DevTools UI

The library comes with a powerful DevTools UI that overlays your application.

*   **Toggle**: Click the floating "WR" badge or press `Ctrl+Shift+X`.
*   **Flame Graph**: Visualize which components are taking the most time to render.
*   **Component Tree**: See the hierarchy of tracked components.
*   **Timeline**: View a chronological history of all render events.
*   **Diff Viewer**: Inspect exactly which props changed between renders.

### Diffing Strategies

You can configure how the library compares props to detect changes:

1.  **`shallow`** (Default): Uses `Object.is`. Fast and standard for React.
2.  **`fast-deep`**: Recursive comparison with a depth limit (default 3). Good for checking if nested data changed structure.
3.  **`deep`**: Full deep equality check. Useful for finding "reference stability" issues (e.g., a new object with the same content is passed every time).
4.  **`custom`**: Provide your own comparison function.

```tsx
useWhyRender(props, 'ComplexData', {
  compareStrategy: 'deep'
});
```

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `compareStrategy` | `'shallow' \| 'deep' \| 'fast-deep'` | `'shallow'` | How to compare props. |
| `verbose` | `boolean` | `false` | If true, logs detailed diffs to the console. |
| `skipKeys` | `string[]` | `[]` | List of prop names to ignore during comparison. |
| `trackHooks` | `boolean` | `true` | (Experimental) Attempt to track hook changes. |

---

## 🚀 Production Optimization

This library is designed to be **Zero Overhead** in production.

1.  **Tree Shaking**: The `package.json` is marked with `"sideEffects": false`.
2.  **Dev-Only Guards**: All logic is wrapped in `process.env.NODE_ENV !== 'production'` checks.
3.  **Empty Exports**: In production builds, hooks and HOCs are replaced with no-ops.

Ensure your bundler (Vite, Webpack, etc.) is configured to handle `process.env.NODE_ENV`.

---

## 🤝 Contributing

Contributions are welcome! Please read our [Architecture Guide](ARCHITECTURE.md) to understand the internals.

1.  Fork the repo.
2.  Install dependencies: `npm install`
3.  Run tests: `npm test`
4.  Submit a PR.

---

## 📄 License

MIT © [Mouaad Idoufkir](https://github.com/mouuuuaad)

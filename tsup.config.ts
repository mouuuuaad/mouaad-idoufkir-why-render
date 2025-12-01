import { defineConfig } from 'tsup';

export default defineConfig([
    // Core library
    {
        entry: {
            index: 'src/index.ts',
            'cli/index': 'src/cli/index.ts',
        },
        format: ['cjs', 'esm'],
        dts: true,
        sourcemap: true,
        clean: true,
        external: ['react', 'react-dom'],
    },
    // UI components (optional import)
    {
        entry: {
            ui: 'src/ui/index.ts',
        },
        format: ['cjs', 'esm'],
        dts: true,
        sourcemap: true,
        external: ['react', 'react-dom', 'zustand'],
    },
    // Overlays (optional import)
    {
        entry: {
            overlays: 'src/overlays/index.ts',
        },
        format: ['cjs', 'esm'],
        dts: true,
        sourcemap: true,
        external: ['react', 'react-dom', 'zustand'],
    },
]);

import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        'cli/index': 'src/cli/index.ts',
        ui: 'src/ui/index.ts',
        overlays: 'src/overlays/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: true,
    external: ['react', 'react-dom', 'zustand'],
    // Inject CSS into the JS bundle
    injectStyle: true,
    // Process CSS files
    loader: {
        '.css': 'local-css',
    },
});

import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/cli/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false, // Keep it readable for now, or true for prod
    treeshake: true,
    external: ['react', 'react-dom'],
    splitting: false,
});

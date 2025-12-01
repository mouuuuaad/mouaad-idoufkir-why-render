/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/ui/**/*.{ts,tsx}',
        './src/overlays/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                'why-render': {
                    bg: 'rgb(var(--why-render-bg) / <alpha-value>)',
                    surface: 'rgb(var(--why-render-surface) / <alpha-value>)',
                    border: 'rgb(var(--why-render-border) / <alpha-value>)',
                    text: 'rgb(var(--why-render-text) / <alpha-value>)',
                    'text-muted': 'rgb(var(--why-render-text-muted) / <alpha-value>)',
                    primary: 'rgb(var(--why-render-primary) / <alpha-value>)',
                    success: 'rgb(var(--why-render-success) / <alpha-value>)',
                    warning: 'rgb(var(--why-render-warning) / <alpha-value>)',
                    danger: 'rgb(var(--why-render-danger) / <alpha-value>)',
                },
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
            },
        },
    },
    plugins: [],
};

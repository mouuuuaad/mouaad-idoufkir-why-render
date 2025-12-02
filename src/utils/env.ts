export function shouldInstrument(): boolean {
    // Check Vite environment variable (import.meta.env)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
        return true;
    }
    // Check Node.js environment variable (process.env)
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
        return true;
    }
    // Check manual override flag
    if (typeof window !== 'undefined' && (window as any).__WHY_RENDER__ === true) {
        return true;
    }
    return false;
}

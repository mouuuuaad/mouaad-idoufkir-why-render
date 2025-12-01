export function shouldInstrument(): boolean {
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
        return true;
    }
    if (typeof window !== 'undefined' && (window as any).__WHY_RENDER__ === true) {
        return true;
    }
    return false;
}

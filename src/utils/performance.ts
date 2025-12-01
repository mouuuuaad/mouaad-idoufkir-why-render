/**
 * Performance timing utilities
 */

export interface PerformanceMark {
    name: string;
    startTime: number;
}

export interface PerformanceMeasure {
    name: string;
    duration: number;
    startTime: number;
    endTime: number;
}

const marks = new Map<string, number>();
const measures: PerformanceMeasure[] = [];

/**
 * Mark the start of a performance measurement
 */
export function markStart(name: string): void {
    marks.set(name, performance.now());

    if (typeof performance.mark === 'function') {
        performance.mark(`${name}:start`);
    }
}

/**
 * Mark the end and measure duration
 */
export function markEnd(name: string): number {
    const startTime = marks.get(name);
    if (!startTime) {
        console.warn(`[performance] No start mark found for: ${name}`);
        return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    measures.push({
        name,
        duration,
        startTime,
        endTime,
    });

    marks.delete(name);

    if (typeof performance.mark === 'function' && typeof performance.measure === 'function') {
        performance.mark(`${name}:end`);
        performance.measure(name, `${name}:start`, `${name}:end`);
    }

    return duration;
}

/**
 * Measure a synchronous function
 */
export function measure<T>(name: string, fn: () => T): T {
    markStart(name);
    try {
        return fn();
    } finally {
        markEnd(name);
    }
}

/**
 * Measure an async function
 */
export async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    markStart(name);
    try {
        return await fn();
    } finally {
        markEnd(name);
    }
}

/**
 * Get all performance measures
 */
export function getMeasures(): PerformanceMeasure[] {
    return [...measures];
}

/**
 * Clear all marks and measures
 */
export function clearPerformance(): void {
    marks.clear();
    measures.length = 0;

    if (typeof performance.clearMarks === 'function') {
        performance.clearMarks();
    }
    if (typeof performance.clearMeasures === 'function') {
        performance.clearMeasures();
    }
}

/**
 * Get average duration for a specific measure name
 */
export function getAverageDuration(name: string): number {
    const matching = measures.filter(m => m.name === name);
    if (matching.length === 0) return 0;

    const total = matching.reduce((sum, m) => sum + m.duration, 0);
    return total / matching.length;
}

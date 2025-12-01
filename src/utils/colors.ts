/**
 * Color generation utilities for component visualization
 */

/**
 * Generate a consistent HSL color from a string (component name)
 */
export function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Convert to 32-bit integer
    }

    const hue = Math.abs(hash % 360);
    const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
    const lightness = 50 + (Math.abs(hash >> 8) % 15); // 50-65%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generate a heatmap color based on intensity (0-1)
 */
export function intensityToColor(intensity: number, alpha: number = 1): string {
    // Clamp intensity between 0 and 1
    const normalized = Math.max(0, Math.min(1, intensity));

    // Cool (blue) -> Warm (yellow) -> Hot (red)
    if (normalized < 0.5) {
        // Blue to yellow
        const t = normalized * 2;
        const hue = 180 + (t * 60); // 180 (cyan) to 240 (blue) to 60 (yellow)
        return `hsla(${hue}, 100%, 50%, ${alpha})`;
    } else {
        // Yellow to red
        const t = (normalized - 0.5) * 2;
        const hue = 60 - (t * 60); // 60 (yellow) to 0 (red)
        return `hsla(${hue}, 100%, 50%, ${alpha})`;
    }
}

/**
 * Generate a performance-based color (green -> yellow -> red)
 */
export function performanceToColor(
    value: number,
    threshold: { good: number; warning: number }
): string {
    if (value <= threshold.good) {
        return '#10b981'; // Green
    } else if (value <= threshold.warning) {
        return '#f59e0b'; // Yellow/Orange
    } else {
        return '#ef4444'; // Red
    }
}

/**
 * Convert hex color to RGBA
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0, 0, 0, ${alpha})`;

    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
}

/**
 * Adjust color lightness
 */
export function adjustLightness(hsl: string, amount: number): string {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return hsl;

    const h = parseInt(match[1]);
    const s = parseInt(match[2]);
    const l = Math.max(0, Math.min(100, parseInt(match[3]) + amount));

    return `hsl(${h}, ${s}%, ${l}%)`;
}

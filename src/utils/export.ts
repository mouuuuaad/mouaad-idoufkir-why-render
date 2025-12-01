/**
 * Export utilities for debugging data
 */

import type { RenderEvent, ComponentHierarchyNode } from '../engine/RenderTracker';
import type { PerformanceMetrics } from '../engine/PerformanceMonitor';

export interface ExportData {
    timestamp: string;
    renders: RenderEvent[];
    hierarchy: ComponentHierarchyNode[];
    metrics: PerformanceMetrics[];
    summary: {
        totalRenders: number;
        totalComponents: number;
        slowestComponent: string;
        mostRenderedComponent: string;
    };
}

/**
 * Export render data as JSON
 */
export function exportAsJson(data: ExportData): string {
    return JSON.stringify(data, null, 2);
}

/**
 * Download data as JSON file
 */
export function downloadJson(data: ExportData, filename: string = 'why-render-report.json'): void {
    const json = exportAsJson(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

/**
 * Copy data to clipboard
 */
export async function copyToClipboard(data: ExportData): Promise<boolean> {
    try {
        const json = exportAsJson(data);
        await navigator.clipboard.writeText(json);
        return true;
    } catch (error) {
        console.error('[why-render] Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Export SVG element as file
 */
export function downloadSvg(svgElement: SVGElement, filename: string = 'flame-graph.svg'): void {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

/**
 * Generate markdown report
 */
export function exportAsMarkdown(data: ExportData): string {
    const lines: string[] = [];

    lines.push('# Why Render Report');
    lines.push('');
    lines.push(`Generated: ${data.timestamp}`);
    lines.push('');

    lines.push('## Summary');
    lines.push('');
    lines.push(`- **Total Renders**: ${data.summary.totalRenders}`);
    lines.push(`- **Total Components**: ${data.summary.totalComponents}`);
    lines.push(`- **Slowest Component**: ${data.summary.slowestComponent}`);
    lines.push(`- **Most Rendered Component**: ${data.summary.mostRenderedComponent}`);
    lines.push('');

    lines.push('## Top 10 Slowest Components');
    lines.push('');
    lines.push('| Component | Renders | Avg Time | Max Time | Total Time |');
    lines.push('|-----------|---------|----------|----------|------------|');

    const sorted = [...data.metrics]
        .sort((a, b) => b.totalTime - a.totalTime)
        .slice(0, 10);

    sorted.forEach(metric => {
        lines.push(
            `| ${metric.componentName} | ${metric.renderCount} | ` +
            `${metric.averageTime.toFixed(2)}ms | ${metric.maxRenderTime.toFixed(2)}ms | ` +
            `${metric.totalTime.toFixed(2)}ms |`
        );
    });

    lines.push('');

    return lines.join('\n');
}

/**
 * Download markdown report
 */
export function downloadMarkdown(data: ExportData, filename: string = 'why-render-report.md'): void {
    const markdown = exportAsMarkdown(data);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

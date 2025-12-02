/**
 * UI Components Entry Point
 */

// Import styles - will be bundled and injected automatically
import './styles/tailwind.css';

export { WhyRenderDevTools } from './WhyRenderDevTools';
export type { WhyRenderDevToolsProps } from './WhyRenderDevTools';

export { PerformanceBadge } from './components/PerformanceBadge';
export type { PerformanceBadgeProps } from './components/PerformanceBadge';

export { RenderTimeline } from './panels/RenderTimeline';
export type { RenderTimelineProps } from './panels/RenderTimeline';

export { ComponentStats } from './panels/ComponentStats';
export type { ComponentStatsProps } from './panels/ComponentStats';

export { DiffViewer } from './panels/DiffViewer';
export type { DiffViewerProps } from './panels/DiffViewer';

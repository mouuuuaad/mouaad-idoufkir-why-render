import { useWhyRender } from './hooks/useWhyRender';
import { withWhyRender } from './hoc/withWhyRender';
import { Options, CompareStrategy, Change } from './types';

// Augment the function type to include track
export type UseWhyRender = typeof useWhyRender & { track: () => symbol };

const useWhyRenderExport = useWhyRender as UseWhyRender;

export { useWhyRenderExport as useWhyRender };
export { withWhyRender };
export type { Options, CompareStrategy, Change };

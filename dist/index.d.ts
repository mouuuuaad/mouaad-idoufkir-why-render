import { O as Options, C as Change } from './types-D18qxgqb.js';
export { a as CompareStrategy } from './types-D18qxgqb.js';
import React from 'react';

declare function useWhyRender<TProps = any>(props: TProps, componentName?: string, options?: Options): {
    lastProps: TProps | null;
    changes: Change[];
    componentId: string;
};

declare function withWhyRender<TProps extends object>(Component: React.ComponentType<TProps>, options?: Options): React.FC<TProps>;

type UseWhyRender = typeof useWhyRender & {
    track: () => symbol;
};
declare const useWhyRenderExport: UseWhyRender;

export { Change, Options, type UseWhyRender, useWhyRenderExport as useWhyRender, withWhyRender };

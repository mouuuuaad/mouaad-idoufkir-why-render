import React from 'react';

type CompareStrategy = "shallow" | "deep" | "fast-deep" | "custom";
interface Options {
    compareStrategy?: CompareStrategy;
    verbose?: boolean;
    skipKeys?: string[];
    thresholdMs?: number;
    customCompare?: (a: any, b: any) => boolean;
}
type Change = {
    key: string;
    reason: "value" | "type" | "function" | "reference" | "length";
    oldValue: any;
    newValue: any;
};

declare function useWhyRender<TProps = any>(props: TProps, componentName?: string, options?: Options): {
    lastProps: TProps | null;
    changes: Change[];
};

declare function withWhyRender<TProps extends object>(Component: React.ComponentType<TProps>, options?: Options): React.FC<TProps>;

type UseWhyRender = typeof useWhyRender & {
    track: () => symbol;
};
declare const useWhyRenderExport: UseWhyRender;

export { type Change, type CompareStrategy, type Options, type UseWhyRender, useWhyRenderExport as useWhyRender, withWhyRender };

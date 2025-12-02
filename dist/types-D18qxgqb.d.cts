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
interface RenderEvent {
    id: string;
    componentName: string;
    componentId: string;
    timestamp: number;
    duration: number;
    changes: Change[];
    props: any;
    renderCount: number;
}

export type { Change as C, Options as O, RenderEvent as R, CompareStrategy as a };

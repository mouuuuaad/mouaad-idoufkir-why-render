export type CompareStrategy = "shallow" | "deep" | "fast-deep" | "custom";

export interface Options {
    compareStrategy?: CompareStrategy;
    verbose?: boolean;
    skipKeys?: string[];
    thresholdMs?: number;
    customCompare?: (a: any, b: any) => boolean;
}

export type Change = {
    key: string;
    reason: "value" | "type" | "function" | "reference" | "length";
    oldValue: any;
    newValue: any;
};

export interface RenderEvent {
    id: string;
    componentName: string;
    componentId: string;
    timestamp: number;
    duration: number;
    changes: Change[];
    props: any;
    renderCount: number;
}

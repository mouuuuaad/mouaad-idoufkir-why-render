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

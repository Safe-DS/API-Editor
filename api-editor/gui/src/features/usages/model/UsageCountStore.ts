export interface UsageCountJson {
    class_counts: {
        [target: string]: number;
    };
    function_counts: {
        [target: string]: number;
    };
    parameter_counts: {
        [target: string]: number;
    };
    value_counts: {
        [target: string]: {
            [stringifiedValue: string]: number;
        };
    };
}

export class UsageCountStore {
    static fromJson(json: UsageCountJson): UsageCountStore {
        return new UsageCountStore(
            new Map(Object.entries(json.class_counts)),
            new Map(Object.entries(json.function_counts)),
            new Map(Object.entries(json.parameter_counts)),
            new Map(Object.entries(json.value_counts).map((entry) => [entry[0], new Map(Object.entries(entry[1]))])),
        );
    }

    readonly classMaxUsages: number;
    readonly functionMaxUsages: number;
    readonly parameterMaxUsages: number;

    readonly parameterUsefulness: Map<string, number>;
    readonly parameterMaxUsefulness: number;

    constructor(
        readonly classUsages: Map<string, number> = new Map(),
        readonly functionUsages: Map<string, number> = new Map(),
        readonly parameterUsages: Map<string, number> = new Map(),
        readonly valueUsages: Map<string, Map<string, number>> = new Map(),
    ) {
        this.classMaxUsages = Math.max(...classUsages.values());
        this.functionMaxUsages = Math.max(...functionUsages.values());
        this.parameterMaxUsages = Math.max(...parameterUsages.values());

        this.parameterUsefulness = new Map(
            [...parameterUsages.keys()].map((it) => [it, this.computeParameterUsefulness(it)]),
        );
        this.parameterMaxUsefulness = Math.max(...this.parameterUsefulness.values());
    }

    toJson(): UsageCountJson {
        return {
            class_counts: Object.fromEntries(this.classUsages),
            function_counts: Object.fromEntries(this.functionUsages),
            parameter_counts: Object.fromEntries(this.parameterUsages),
            value_counts: Object.fromEntries(
                [...this.valueUsages.entries()].map((entry) => [entry[0], Object.fromEntries(entry[1])]),
            ),
        };
    }

    private computeParameterUsefulness(pythonParameterQualifiedName: string): number {
        const valueUsages = this.valueUsages.get(pythonParameterQualifiedName);
        if (valueUsages === undefined || valueUsages.size === 0) {
            return 0;
        }

        const maxValueUsage = Math.max(...valueUsages.values());
        const totalValueUsages = [...valueUsages.values()].reduce((a, b) => a + b, 0);

        return totalValueUsages - maxValueUsage;
    }
}

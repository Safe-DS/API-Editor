import { PythonPackage } from '../../packageData/model/PythonPackage';
import { PythonParameter } from '../../packageData/model/PythonParameter';

export interface UsageCountJson {
    module_counts?: {
        [target: string]: number;
    };
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
    static fromJson(json: UsageCountJson, api?: PythonPackage): UsageCountStore {
        return new UsageCountStore(
            new Map(Object.entries(json.module_counts ?? {})),
            new Map(Object.entries(json.class_counts)),
            new Map(Object.entries(json.function_counts)),
            new Map(Object.entries(json.parameter_counts)),
            new Map(Object.entries(json.value_counts).map((entry) => [entry[0], new Map(Object.entries(entry[1]))])),
            api,
        );
    }

    readonly moduleMaxUsages: number;
    readonly classMaxUsages: number;
    readonly functionMaxUsages: number;
    readonly parameterMaxUsages: number;

    readonly parameterUsefulness: Map<string, number>;
    readonly parameterMaxUsefulness: number;

    constructor(
        readonly moduleUsages: Map<string, number> = new Map(),
        readonly classUsages: Map<string, number> = new Map(),
        readonly functionUsages: Map<string, number> = new Map(),
        readonly parameterUsages: Map<string, number> = new Map(),
        readonly valueUsages: Map<string, Map<string, number>> = new Map(),
        api?: PythonPackage,
    ) {
        if (api) {
            this.addImplicitUsagesOfDefaultValues(api);
            this.computeModuleUsages(api);
        }

        this.moduleMaxUsages = moduleUsages.size === 0 ? 0 : Math.max(...moduleUsages.values());
        this.classMaxUsages = classUsages.size === 0 ? 0 : Math.max(...classUsages.values());
        this.functionMaxUsages = functionUsages.size === 0 ? 0 : Math.max(...functionUsages.values());
        this.parameterMaxUsages = parameterUsages.size === 0 ? 0 : Math.max(...parameterUsages.values());

        this.parameterUsefulness = new Map(
            [...parameterUsages.keys()].map((it) => [it, this.computeParameterUsefulness(it)]),
        );
        this.parameterMaxUsefulness =
            this.parameterUsefulness.size === 0 ? 0 : Math.max(...this.parameterUsefulness.values());
    }

    toJson(): UsageCountJson {
        return {
            module_counts: Object.fromEntries(this.moduleUsages),
            class_counts: Object.fromEntries(this.classUsages),
            function_counts: Object.fromEntries(this.functionUsages),
            parameter_counts: Object.fromEntries(this.parameterUsages),
            value_counts: Object.fromEntries(
                [...this.valueUsages.entries()].map((entry) => [entry[0], Object.fromEntries(entry[1])]),
            ),
        };
    }

    /**
     * Adds the implicit usages of a parameters default value. When a function is called and a parameter is used with
     * its default value, that usage of a value is not part of the UsageStore, so  we need to add it.
     *
     * @param api Description of the API
     * @private
     */
    private addImplicitUsagesOfDefaultValues(api: PythonPackage) {
        for (const [parameterId, parameterUsageCount] of this.parameterUsages.entries()) {
            const parameter = api.getDeclarationById(parameterId);
            if (!(parameter instanceof PythonParameter)) {
                continue;
            }

            const defaultValue = parameter.defaultValue;
            if (defaultValue === undefined || defaultValue === null) {
                // defaultValue could be an empty string
                continue;
            }

            const containingFunction = parameter.containingFunction;
            if (!containingFunction) {
                continue;
            }

            const functionUsageCount = this.functionUsages.get(containingFunction.id) ?? 0;
            const nImplicitUsages = functionUsageCount - parameterUsageCount;
            if (nImplicitUsages === 0) {
                continue;
            }

            const nExplicitUsage = this.valueUsages.get(parameterId)?.get(defaultValue) ?? 0;

            if (!this.valueUsages.has(parameterId)) {
                this.valueUsages.set(parameterId, new Map());
            }
            if (!this.valueUsages.get(parameterId)!.has(defaultValue)) {
                this.valueUsages.get(parameterId)!.set(defaultValue, 0);
            }
            this.valueUsages.get(parameterId)!.set(defaultValue, nImplicitUsages + nExplicitUsage);
        }
    }

    private computeModuleUsages(api: PythonPackage) {
        for (const module of api.modules) {
            let moduleUsageCount = 0;
            for (const cls of module.classes) {
                moduleUsageCount += this.classUsages.get(cls.id) ?? 0;
            }
            for (const func of module.functions) {
                moduleUsageCount += this.functionUsages.get(func.id) ?? 0;
            }
            this.moduleUsages.set(module.id, moduleUsageCount);
        }
    }

    private computeParameterUsefulness(pythonParameterId: string): number {
        const valueUsages = this.valueUsages.get(pythonParameterId);
        if (valueUsages === undefined || valueUsages.size === 0) {
            return 0;
        }

        const maxValueUsage = Math.max(...valueUsages.values());
        const totalValueUsages = [...valueUsages.values()].reduce((a, b) => a + b, 0);

        return totalValueUsages - maxValueUsage;
    }
}

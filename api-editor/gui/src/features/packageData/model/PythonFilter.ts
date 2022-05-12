export type FilterString = string;

export class PythonFilter {
    constructor(
        readonly pythonModule: FilterString | void,
        readonly pythonClass: FilterString | void,
        readonly pythonFunction: FilterString | void,
        readonly pythonParameter: FilterString | void,
    ) {}

    static fromFilterBoxInput(filterBoxInput: string): PythonFilter | void {
        let pythonModule;
        let pythonClass;
        let pythonFunction;
        let pythonParameter;

        for (const match of filterBoxInput.matchAll(/(\w+):([^\s:]+)/gu)) {
            if (match.length === 3) {
                const [, scope, filterString] = match;

                switch (scope) {
                    case 'module':
                        if (pythonModule) {
                            return undefined;
                        } else {
                            pythonModule = filterString;
                        }
                        break;
                    case 'class':
                        if (pythonClass) {
                            return undefined;
                        } else {
                            pythonClass = filterString;
                        }
                        break;
                    case 'function':
                        if (pythonFunction) {
                            return undefined;
                        } else {
                            pythonFunction = filterString;
                        }
                        break;
                    case 'parameter':
                        if (pythonParameter) {
                            return undefined;
                        } else {
                            pythonParameter = filterString;
                        }
                        break;
                    // no default
                }
            }
        }

        return new PythonFilter(
            pythonModule,
            pythonClass,
            pythonFunction,
            pythonParameter,
        );
    }

    isFilteringModules(): boolean {
        return (
            Boolean(this.pythonModule) ||
            Boolean(this.pythonClass) ||
            Boolean(this.pythonFunction) ||
            Boolean(this.pythonParameter)
        );
    }

    isFilteringClasses(): boolean {
        return (
            Boolean(this.pythonClass) ||
            Boolean(this.pythonFunction) ||
            Boolean(this.pythonParameter)
        );
    }

    isFilteringFunctions(): boolean {
        return Boolean(this.pythonFunction) || Boolean(this.pythonParameter);
    }

    isFilteringParameters(): boolean {
        return Boolean(this.pythonParameter);
    }
}

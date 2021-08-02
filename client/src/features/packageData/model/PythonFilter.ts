export type FilterString = string;

export class PythonFilter {
    readonly pythonModule: FilterString | void;
    readonly pythonClass: FilterString | void;
    readonly pythonFunction: FilterString | void;
    readonly pythonParameter: FilterString | void;

    constructor(
        pythonModule: FilterString | void,
        pythonClass: FilterString | void,
        pythonFunction: FilterString | void,
        pythonParameter: FilterString | void,
    ) {
        this.pythonModule = pythonModule;
        this.pythonClass = pythonClass;
        this.pythonFunction = pythonFunction;
        this.pythonParameter = pythonParameter;
    }

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

    isFiltering(): boolean {
        return (
            Boolean(this.pythonModule) ||
            Boolean(this.pythonClass) ||
            Boolean(this.pythonFunction) ||
            Boolean(this.pythonParameter)
        );
    }
}

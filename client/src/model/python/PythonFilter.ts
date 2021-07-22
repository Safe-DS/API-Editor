export type FilterString = string

export class PythonFilter {
    readonly pythonModule: FilterString | void
    readonly pythonClass: FilterString | void
    readonly pythonFunction: FilterString | void
    readonly pythonParameter: FilterString | void

    constructor(
        pythonModule: FilterString | void,
        pythonClass: FilterString | void,
        pythonFunction: FilterString | void,
        pythonParameter: FilterString | void
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

        for (const match of filterBoxInput.matchAll(/(\w+):([^\s:]+)/g)) {
            if (match.length === 3) {
                const [, scope, filterString] = match;

                switch (scope) {
                    case "module":
                        if (pythonModule) {
                            return;
                        } else {
                            pythonModule = filterString;
                        }
                        break;
                    case "class":
                        if (pythonClass) {
                            return;
                        } else {
                            pythonClass = filterString;
                        }
                        break;
                    case "function":
                        if (pythonFunction) {
                            return;
                        } else {
                            pythonFunction = filterString;
                        }
                        break;
                    case "parameter":
                        if (pythonParameter) {
                            return;
                        } else {
                            pythonParameter = filterString;
                        }
                        break;
                }
            }
        }

        return new PythonFilter(pythonModule, pythonClass, pythonFunction, pythonParameter);
    }
}

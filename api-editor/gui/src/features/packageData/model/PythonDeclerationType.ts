import PythonClass from './PythonClass';
import PythonFunction from './PythonFunction';
import PythonModule from "./PythonModule";
import PythonParameter from "./PythonParameter";
import AbstractPythonFilter from "./AbstractPythonFilter";

export default class PythonDeclerationTypeFilter extends AbstractPythonFilter {
    constructor(
        readonly type: DeclerationType,
    ) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule): boolean {
        return this.type == DeclerationType.module;
    }

    shouldKeepClass(pythonClass: PythonClass): boolean {
        return this.type == DeclerationType.class;
    }

    shouldKeepFunction(pythonFunction: PythonFunction): boolean {
        return this.type == DeclerationType.function
    }

    shouldKeepParameter(pythonParameter: PythonParameter): boolean {
        return this.type == DeclerationType.parameter;
    }

    isFilteringModules(): boolean {
        return this.type != DeclerationType.module;
    }

    isFilteringClasses(): boolean {
        return this.type != DeclerationType.class;
    }

    isFilteringFunctions(): boolean {
        return this.type != DeclerationType.function
    }

    isFilteringParameters(): boolean {
        return this.type != DeclerationType.parameter;
    }
}

export enum DeclerationType {
    module, class, function, parameter
}

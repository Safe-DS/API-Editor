import AbstractPythonFilter from "./AbstractPythonFilter";
import PythonClass from "./PythonClass";
import PythonFunction from "./PythonFunction";
import PythonParameter from "./PythonParameter";
import PythonModule from "./PythonModule";

export type FilterString = string;

export class CompoundFilter extends AbstractPythonFilter {
    constructor(
        readonly filters: AbstractPythonFilter[]
    ) {
        super();
    }

    shouldKeepClass(pythonClass: PythonClass): boolean {
        return this.filters.every(
            (it) => it.shouldKeepClass(pythonClass)
        );
    }

    shouldKeepFunction(pythonFunction: PythonFunction): boolean {
        return this.filters.every(
            (it) => it.shouldKeepFunction(pythonFunction)
        );
    }

    shouldKeepModule(pythonModule: PythonModule): boolean {
        return this.filters.every(
            (it) => it.shouldKeepModule(pythonModule)
        );
    }

    shouldKeepParameter(pythonParameter: PythonParameter): boolean {
        return this.filters.every(
            (it) => it.shouldKeepParameter(pythonParameter)
        );
    }

    isFilteringModules(): boolean {
        return this.filters.some(
            (it) => it.isFilteringModules()
        );
    }

    isFilteringClasses(): boolean {
        return this.filters.some(
            (it) => it.isFilteringClasses()
        );
    }

    isFilteringFunctions(): boolean {
        return this.filters.some(
            (it) => it.isFilteringFunctions()
        );
    }

    isFilteringParameters(): boolean {
        return this.filters.some(
            (it) => it.isFilteringParameters()
        );
    }
}

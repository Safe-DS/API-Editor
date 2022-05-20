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

    filterClasses(pythonClass: PythonClass): boolean {
        return this.filters.every(
            (it) => it.filterClasses(pythonClass)
        );
    }

    filterFunctions(pythonFunction: PythonFunction): boolean {
        return this.filters.every(
            (it) => it.filterFunctions(pythonFunction)
        );
    }

    filterModules(pythonModule: PythonModule): boolean {
        return this.filters.every(
            (it) => it.filterModules(pythonModule)
        );
    }

    filterParameters(pythonParameter: PythonParameter): boolean {
        return this.filters.every(
            (it) => it.filterParameters(pythonParameter)
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

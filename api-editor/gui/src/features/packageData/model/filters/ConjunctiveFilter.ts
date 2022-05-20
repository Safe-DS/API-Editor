import AbstractPythonFilter from "./AbstractPythonFilter";
import PythonClass from "../PythonClass";
import PythonFunction from "../PythonFunction";
import PythonParameter from "../PythonParameter";
import PythonModule from "../PythonModule";

/**
 * Keeps declarations iff all contained filters want to keep it.
 */
export class ConjunctiveFilter extends AbstractPythonFilter {
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

    canSkipPackageUpdate(): boolean {
        return this.filters.every(
            (it) => it.canSkipPackageUpdate()
        );
    }

    canSkipModuleUpdate(): boolean {
        return this.filters.every(
            (it) => it.canSkipModuleUpdate()
        );
    }

    canSkipClassUpdate(): boolean {
        return this.filters.every(
            (it) => it.canSkipClassUpdate()
        );
    }

    canSkipFunctionUpdate(): boolean {
        return this.filters.every(
            (it) => it.canSkipFunctionUpdate()
        );
    }
}

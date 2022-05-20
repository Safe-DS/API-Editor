import PythonClass from './PythonClass';
import PythonFunction from './PythonFunction';
import PythonModule from "./PythonModule";
import PythonParameter from "./PythonParameter";

export default abstract class AbstractPythonFilter {
    abstract filterModules(pythonModule: PythonModule): boolean

    abstract filterClasses(pythonClass: PythonClass): boolean

    abstract filterFunctions(pythonFunction: PythonFunction): boolean

    abstract filterParameters(pythonParameter: PythonParameter): boolean

    isFilteringModules(): boolean {
        return true;
    }

    isFilteringClasses(): boolean {
        return true;
    }

    isFilteringFunctions(): boolean {
        return true;
    }

    isFilteringParameters(): boolean {
        return true;
    }
}

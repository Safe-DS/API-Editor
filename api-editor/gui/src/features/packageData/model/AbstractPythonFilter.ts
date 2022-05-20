import PythonClass from './PythonClass';
import PythonFunction from './PythonFunction';
import PythonModule from "./PythonModule";
import PythonParameter from "./PythonParameter";

export default abstract class AbstractPythonFilter {
    abstract shouldKeepModule(pythonModule: PythonModule): boolean

    abstract shouldKeepClass(pythonClass: PythonClass): boolean

    abstract shouldKeepFunction(pythonFunction: PythonFunction): boolean

    abstract shouldKeepParameter(pythonParameter: PythonParameter): boolean

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

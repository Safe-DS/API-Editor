import PythonClass from './PythonClass';
import PythonFunction from './PythonFunction';
import PythonModule from "./PythonModule";
import PythonParameter from "./PythonParameter";
import AbstractPythonFilter from "./AbstractPythonFilter";

export default class NullFilter extends AbstractPythonFilter {
    shouldKeepModule(pythonModule: PythonModule): boolean {
        return true;
    }

    shouldKeepClass(pythonClass: PythonClass): boolean {
        return true;
    }

    shouldKeepFunction(pythonFunction: PythonFunction): boolean {
        return true;
    }

    shouldKeepParameter(pythonParameter: PythonParameter): boolean {
        return true;
    }

    isFilteringModules(): boolean {
        return false;
    }

    isFilteringClasses(): boolean {
        return false;
    }

    isFilteringFunctions(): boolean {
        return false;
    }

    isFilteringParameters(): boolean {
        return false;
    }
}

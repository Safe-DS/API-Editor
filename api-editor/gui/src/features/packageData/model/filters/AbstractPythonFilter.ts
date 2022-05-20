import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';

/**
 * An abstract base class for filters of Python declarations.
 */
export default abstract class AbstractPythonFilter {
    /**
     * Whether the given module should be kept after filtering.
     */
    abstract shouldKeepModule(pythonModule: PythonModule): boolean;

    /**
     * Whether the given module should be kept after filtering.
     */
    abstract shouldKeepClass(pythonClass: PythonClass): boolean;

    /**
     * Whether the given module should be kept after filtering.
     */
    abstract shouldKeepFunction(pythonFunction: PythonFunction): boolean;

    /**
     * Whether the given module should be kept after filtering.
     */
    abstract shouldKeepParameter(pythonParameter: PythonParameter): boolean;

    /**
     * Returns whether the package can be returned unchanged after filtering.
     */
    canSkipPackageUpdate(): boolean {
        return false;
    }

    /**
     * Returns whether the module can be returned unchanged after filtering.
     */
    canSkipModuleUpdate(): boolean {
        return false;
    }

    /**
     * Returns whether the class can be returned unchanged after filtering.
     */
    canSkipClassUpdate(): boolean {
        return false;
    }

    /**
     * Returns whether the function can be returned unchanged after filtering.
     */
    canSkipFunctionUpdate(): boolean {
        return false;
    }
}

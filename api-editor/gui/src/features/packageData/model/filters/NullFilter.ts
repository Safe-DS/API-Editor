import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import AbstractPythonFilter from './AbstractPythonFilter';

/**
 * Keeps all declarations.
 */
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
}

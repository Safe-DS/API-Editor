import AbstractPythonFilter from './AbstractPythonFilter';
import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonParameter from '../PythonParameter';
import PythonModule from '../PythonModule';

/**
 * Keeps declarations iff the contained filter wants to remove it.
 */
export class NegatedFilter extends AbstractPythonFilter {
    constructor(readonly filter: AbstractPythonFilter) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule): boolean {
        return !this.filter.shouldKeepModule(pythonModule);
    }

    shouldKeepClass(pythonClass: PythonClass): boolean {
        return !this.filter.shouldKeepClass(pythonClass);
    }

    shouldKeepFunction(pythonFunction: PythonFunction): boolean {
        return !this.filter.shouldKeepFunction(pythonFunction);
    }

    shouldKeepParameter(pythonParameter: PythonParameter): boolean {
        return !this.filter.shouldKeepParameter(pythonParameter);
    }
}

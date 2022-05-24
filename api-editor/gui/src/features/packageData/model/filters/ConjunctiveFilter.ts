import AbstractPythonFilter from './AbstractPythonFilter';
import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonParameter from '../PythonParameter';
import PythonModule from '../PythonModule';
import { AnnotationsState } from '../../../annotations/annotationSlice';

/**
 * Keeps declarations iff all contained filters keep it.
 */
export class ConjunctiveFilter extends AbstractPythonFilter {

    /**
     * @param filters The filters that should all be applied.
     */
    constructor(readonly filters: AbstractPythonFilter[]) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationsState): boolean {
        return this.filters.every((it) => it.shouldKeepModule(pythonModule, annotations));
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationsState): boolean {
        return this.filters.every((it) => it.shouldKeepClass(pythonClass, annotations));
    }

    shouldKeepFunction(pythonFunction: PythonFunction, annotations: AnnotationsState): boolean {
        return this.filters.every((it) => it.shouldKeepFunction(pythonFunction, annotations));
    }

    shouldKeepParameter(pythonParameter: PythonParameter, annotations: AnnotationsState): boolean {
        return this.filters.every((it) => it.shouldKeepParameter(pythonParameter, annotations));
    }
}

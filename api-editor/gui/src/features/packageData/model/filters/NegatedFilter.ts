import AbstractPythonFilter from './AbstractPythonFilter';
import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonParameter from '../PythonParameter';
import PythonModule from '../PythonModule';
import {AnnotationsState} from "../../../annotations/annotationSlice";

/**
 * Keeps declarations iff the contained filter wants to remove it.
 */
export class NegatedFilter extends AbstractPythonFilter {
    constructor(readonly filter: AbstractPythonFilter) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationsState): boolean {
        return !this.filter.shouldKeepModule(pythonModule, annotations);
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationsState): boolean {
        return !this.filter.shouldKeepClass(pythonClass, annotations);
    }

    shouldKeepFunction(pythonFunction: PythonFunction, annotations: AnnotationsState): boolean {
        return !this.filter.shouldKeepFunction(pythonFunction, annotations);
    }

    shouldKeepParameter(pythonParameter: PythonParameter, annotations: AnnotationsState): boolean {
        return !this.filter.shouldKeepParameter(pythonParameter, annotations);
    }
}

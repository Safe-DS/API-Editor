import { AbstractPythonFilter } from './AbstractPythonFilter';
import { PythonClass } from '../PythonClass';
import { PythonFunction } from '../PythonFunction';
import { PythonParameter } from '../PythonParameter';
import { PythonModule } from '../PythonModule';
import {AnnotationSlice, AnnotationStore} from '../../../annotations/annotationSlice';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';

/**
 * Keeps declarations iff the contained filter discards it.
 */
export class NegatedFilter extends AbstractPythonFilter {
    /**
     * @param filter The filter to negate.
     */
    constructor(readonly filter: AbstractPythonFilter) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        return !this.filter.shouldKeepModule(pythonModule, annotations, usages);
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        return !this.filter.shouldKeepClass(pythonClass, annotations, usages);
    }

    shouldKeepFunction(pythonFunction: PythonFunction, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        return !this.filter.shouldKeepFunction(pythonFunction, annotations, usages);
    }

    shouldKeepParameter(
        pythonParameter: PythonParameter,
        annotations: AnnotationStore,
        usages: UsageCountStore,
    ): boolean {
        return !this.filter.shouldKeepParameter(pythonParameter, annotations, usages);
    }
}

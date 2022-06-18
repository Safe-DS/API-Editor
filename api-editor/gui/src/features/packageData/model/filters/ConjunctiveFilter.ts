import { AbstractPythonFilter } from './AbstractPythonFilter';
import { PythonClass } from '../PythonClass';
import { PythonFunction } from '../PythonFunction';
import { PythonParameter } from '../PythonParameter';
import { PythonModule } from '../PythonModule';
import { AnnotationStore } from '../../../annotations/annotationSlice';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';

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

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        return this.filters.every((it) => it.shouldKeepModule(pythonModule, annotations, usages));
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        return this.filters.every((it) => it.shouldKeepClass(pythonClass, annotations, usages));
    }

    shouldKeepFunction(pythonFunction: PythonFunction, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        return this.filters.every((it) => it.shouldKeepFunction(pythonFunction, annotations, usages));
    }

    shouldKeepParameter(
        pythonParameter: PythonParameter,
        annotations: AnnotationStore,
        usages: UsageCountStore,
    ): boolean {
        return this.filters.every((it) => it.shouldKeepParameter(pythonParameter, annotations, usages));
    }
}

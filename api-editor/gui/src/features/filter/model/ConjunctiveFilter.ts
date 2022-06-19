import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonModule } from '../../packageData/model/PythonModule';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { AnnotationStore } from '../../annotations/annotationSlice';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { AbstractPythonFilter } from './AbstractPythonFilter';

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

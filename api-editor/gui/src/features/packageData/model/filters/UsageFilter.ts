import { PythonClass } from '../PythonClass';
import { PythonFunction } from '../PythonFunction';
import { PythonModule } from '../PythonModule';
import { PythonParameter } from '../PythonParameter';
import { AbstractPythonFilter } from './AbstractPythonFilter';
import {AnnotationSlice, AnnotationStore} from '../../../annotations/annotationSlice';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';

/**
 * Keeps only declarations are used a certain number of times.
 */
export class UsageFilter extends AbstractPythonFilter {
    /**
     * @param comparison How actual and expected usages should be compared.
     * @param expectedUsage The expected number of usages.
     */
    constructor(
        readonly comparison: (actualUsage: number, expectedUsage: number) => boolean,
        readonly expectedUsage: number,
    ) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        const moduleUsages = usages.moduleUsages.get(pythonModule.id);
        return this.shouldKeepWithUsages(moduleUsages);
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        const classUsages = usages.classUsages.get(pythonClass.id);
        return this.shouldKeepWithUsages(classUsages);
    }

    shouldKeepFunction(pythonFunction: PythonFunction, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        const functionUsages = usages.functionUsages.get(pythonFunction.id);
        return this.shouldKeepWithUsages(functionUsages);
    }

    shouldKeepParameter(
        pythonParameter: PythonParameter,
        annotations: AnnotationStore,
        usages: UsageCountStore,
    ): boolean {
        const parameterUsages = usages.parameterUsages.get(pythonParameter.id);
        return this.shouldKeepWithUsages(parameterUsages);
    }

    private shouldKeepWithUsages(actualUsages: number | undefined) {
        if (actualUsages === undefined) {
            return false;
        }

        return this.comparison(actualUsages, this.expectedUsage);
    }
}

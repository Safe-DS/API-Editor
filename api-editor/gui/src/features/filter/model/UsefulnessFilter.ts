import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonModule } from '../../packageData/model/PythonModule';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { AnnotationStore } from '../../annotations/annotationSlice';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { AbstractPythonFilter } from './AbstractPythonFilter';

/**
 * Keeps only declarations have a certain usefulness.
 */
export class UsefulnessFilter extends AbstractPythonFilter {
    /**
     * @param comparison How actual and expected usefulness should be compared.
     * @param expectedUsefulness The expected usefulness.
     */
    constructor(
        readonly comparison: (actualUsefulness: number, expectedUsefulness: number) => boolean,
        readonly expectedUsefulness: number,
    ) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        const moduleUsefulness = usages.moduleUsages.get(pythonModule.id);
        return this.shouldKeepWithUsefulness(moduleUsefulness);
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        const classUsefulness = usages.classUsages.get(pythonClass.id);
        return this.shouldKeepWithUsefulness(classUsefulness);
    }

    shouldKeepFunction(pythonFunction: PythonFunction, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        const functionUsefulness = usages.functionUsages.get(pythonFunction.id);
        return this.shouldKeepWithUsefulness(functionUsefulness);
    }

    shouldKeepParameter(
        pythonParameter: PythonParameter,
        annotations: AnnotationStore,
        usages: UsageCountStore,
    ): boolean {
        const parameterUsefulness = usages.parameterUsefulness.get(pythonParameter.id);
        return this.shouldKeepWithUsefulness(parameterUsefulness);
    }

    private shouldKeepWithUsefulness(actualUsefulness: number | undefined) {
        if (actualUsefulness === undefined) {
            return false;
        }

        return this.comparison(actualUsefulness, this.expectedUsefulness);
    }
}

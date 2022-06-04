import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import AbstractPythonFilter from './AbstractPythonFilter';
import { AnnotationsState } from '../../../annotations/annotationSlice';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';

/**
 * Keeps only declarations have a certain usefulness.
 */
export default class UsefulnessFilter extends AbstractPythonFilter {
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

    shouldKeepModule(_pythonModule: PythonModule, _annotations: AnnotationsState, _usages: UsageCountStore): boolean {
        return false;
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationsState, usages: UsageCountStore): boolean {
        const classUsefulness = usages.classUsages.get(pythonClass.qualifiedName);
        return this.shouldKeepWithUsefulness(classUsefulness);
    }

    shouldKeepFunction(
        pythonFunction: PythonFunction,
        annotations: AnnotationsState,
        usages: UsageCountStore,
    ): boolean {
        const functionUsefulness = usages.functionUsages.get(pythonFunction.qualifiedName);
        return this.shouldKeepWithUsefulness(functionUsefulness);
    }

    shouldKeepParameter(
        pythonParameter: PythonParameter,
        annotations: AnnotationsState,
        usages: UsageCountStore,
    ): boolean {
        const valueUsages = usages.valueUsages.get(pythonParameter.qualifiedName());
        if (valueUsages === undefined) {
            return false;
        }

        const maxValueUsage = Math.max(...valueUsages.values());
        const totalValueUsages = [...valueUsages.values()].reduce((a, b) => a + b, 0);
        const parameterUsefulness = totalValueUsages - maxValueUsage;

        return this.shouldKeepWithUsefulness(parameterUsefulness);
    }

    private shouldKeepWithUsefulness(actualUsefulness: number | undefined) {
        if (actualUsefulness === undefined) {
            return false;
        }

        return this.comparison(actualUsefulness, this.expectedUsefulness);
    }
}

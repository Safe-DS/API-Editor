import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import AbstractPythonFilter from './AbstractPythonFilter';
import {AnnotationsState} from '../../../annotations/annotationSlice';
import {UsageCountStore} from "../../../usages/model/UsageCountStore";

/**
 * Keeps only declarations have a certain usefulness.
 */
export default class UsefulnessFilter extends AbstractPythonFilter {

    /**
     * @param comparison How actual and expected usefulness should be compared.
     * @param expectedUsage The expected usefulness.
     */
    constructor(
        readonly comparison: (actualUsage: number, expectedUsage: number) => boolean,
        readonly expectedUsage: number
    ) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationsState, usages: UsageCountStore): boolean {
        return false;
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationsState, usages: UsageCountStore): boolean {
        return false; // TODO
    }

    shouldKeepFunction(pythonFunction: PythonFunction, annotations: AnnotationsState, usages: UsageCountStore): boolean {
        return false; // TODO
    }

    shouldKeepParameter(pythonParameter: PythonParameter, annotations: AnnotationsState, usages: UsageCountStore): boolean {
        return false; // TODO
    }
}

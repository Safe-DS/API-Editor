import AbstractPythonFilter from './AbstractPythonFilter';
import PythonModule from '../PythonModule';
import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import { AnnotationsState } from '../../../annotations/annotationSlice';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';
import PythonParameter, { PythonParameterAssignment } from '../PythonParameter';

export default class ParameterAssignmentFilter extends AbstractPythonFilter {
    constructor(readonly assignedBy: PythonParameterAssignment) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationsState, usages: UsageCountStore): boolean {
        return false;
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationsState, usages: UsageCountStore): boolean {
        return false;
    }

    shouldKeepFunction(
        pythonFunction: PythonFunction,
        annotations: AnnotationsState,
        usages: UsageCountStore,
    ): boolean {
        return false;
    }

    shouldKeepParameter(
        pythonParameter: PythonParameter,
        annotations: AnnotationsState,
        usages: UsageCountStore,
    ): boolean {
        if (this.assignedBy === PythonParameterAssignment.IMPLICIT) {
            return !pythonParameter.isExplicitParameter();
        } else if (!pythonParameter.isExplicitParameter()) {
            return false;
        } else {
            return pythonParameter.assignedBy === this.assignedBy;
        }
    }
}

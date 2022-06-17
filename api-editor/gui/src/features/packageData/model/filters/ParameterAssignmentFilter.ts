import { AbstractPythonFilter } from './AbstractPythonFilter';
import { PythonModule } from '../PythonModule';
import { PythonClass } from '../PythonClass';
import { PythonFunction } from '../PythonFunction';
import {AnnotationSlice, AnnotationStore} from '../../../annotations/annotationSlice';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';
import { PythonParameter, PythonParameterAssignment } from '../PythonParameter';

export class ParameterAssignmentFilter extends AbstractPythonFilter {
    constructor(readonly assignedBy: PythonParameterAssignment) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        return false;
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        return false;
    }

    shouldKeepFunction(
        pythonFunction: PythonFunction,
        annotations: AnnotationStore,
        usages: UsageCountStore,
    ): boolean {
        return false;
    }

    shouldKeepParameter(
        pythonParameter: PythonParameter,
        annotations: AnnotationStore,
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

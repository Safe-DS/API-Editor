import { AnnotationStore } from '../../annotations/versioning/AnnotationStoreV2';
import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonModule } from '../../packageData/model/PythonModule';
import { PythonParameter, PythonParameterAssignment } from '../../packageData/model/PythonParameter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { AbstractPythonFilter } from './AbstractPythonFilter';

export class ParameterAssignmentFilter extends AbstractPythonFilter {
    constructor(readonly assignedBy: PythonParameterAssignment) {
        super();
    }

    shouldKeepModule(_pythonModule: PythonModule, _annotations: AnnotationStore, _usages: UsageCountStore): boolean {
        return false;
    }

    shouldKeepClass(_pythonClass: PythonClass, _annotations: AnnotationStore, _usages: UsageCountStore): boolean {
        return false;
    }

    shouldKeepFunction(
        _pythonFunction: PythonFunction,
        _annotations: AnnotationStore,
        _usages: UsageCountStore,
    ): boolean {
        return false;
    }

    shouldKeepParameter(
        pythonParameter: PythonParameter,
        _annotations: AnnotationStore,
        _usages: UsageCountStore,
    ): boolean {
        return pythonParameter.assignedBy === this.assignedBy;
    }
}

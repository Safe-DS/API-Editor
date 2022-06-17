import { AbstractPythonFilter } from './AbstractPythonFilter';
import { PythonClass } from '../PythonClass';
import {AnnotationSlice, AnnotationStore} from '../../../annotations/annotationSlice';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';
import { PythonFunction } from '../PythonFunction';
import { PythonModule } from '../PythonModule';
import { PythonParameter } from '../PythonParameter';

export class RequiredOrOptionalFilter extends AbstractPythonFilter {
    constructor(readonly keepOnly: RequiredOrOptional) {
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
        return (pythonParameter.defaultValue === null) === (this.keepOnly === RequiredOrOptional.Required);
    }
}

export enum RequiredOrOptional {
    Required,
    Optional,
}

import { AbstractPythonFilter } from './AbstractPythonFilter';
import { PythonClass } from '../PythonClass';
import { AnnotationStore } from '../../../annotations/annotationSlice';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';
import { PythonFunction } from '../PythonFunction';
import { PythonModule } from '../PythonModule';
import { PythonParameter } from '../PythonParameter';

export class RequiredOrOptionalFilter extends AbstractPythonFilter {
    constructor(readonly keepOnly: RequiredOrOptional) {
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
        return (pythonParameter.defaultValue === null) === (this.keepOnly === RequiredOrOptional.Required);
    }
}

export enum RequiredOrOptional {
    Required,
    Optional,
}

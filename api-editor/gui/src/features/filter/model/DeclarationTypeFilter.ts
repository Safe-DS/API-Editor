import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonModule } from '../../packageData/model/PythonModule';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { AnnotationStore } from '../../annotations/annotationSlice';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { AbstractPythonFilter } from './AbstractPythonFilter';

/**
 * Keeps only declarations of a specified type (module/class/function/parameter).
 */
export class DeclarationTypeFilter extends AbstractPythonFilter {
    /**
     * @param type Which declarations to keep.
     */
    constructor(readonly type: DeclarationType) {
        super();
    }

    shouldKeepModule(_pythonModule: PythonModule, _annotations: AnnotationStore, _usages: UsageCountStore): boolean {
        return this.type === DeclarationType.Module;
    }

    shouldKeepClass(_pythonClass: PythonClass, _annotations: AnnotationStore, _usages: UsageCountStore): boolean {
        return this.type === DeclarationType.Class;
    }

    shouldKeepFunction(
        _pythonFunction: PythonFunction,
        _annotations: AnnotationStore,
        _usages: UsageCountStore,
    ): boolean {
        return this.type === DeclarationType.Function;
    }

    shouldKeepParameter(
        _pythonParameter: PythonParameter,
        _annotations: AnnotationStore,
        _usages: UsageCountStore,
    ): boolean {
        return this.type === DeclarationType.Parameter;
    }
}

export enum DeclarationType {
    Module,
    Class,
    Function,
    Parameter,
}

import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import { AbstractPythonFilter } from './AbstractPythonFilter';
import { AnnotationStore } from '../../../annotations/annotationSlice';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';

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

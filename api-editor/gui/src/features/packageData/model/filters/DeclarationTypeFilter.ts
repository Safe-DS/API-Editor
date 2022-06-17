import { PythonClass } from '../PythonClass';
import { PythonFunction } from '../PythonFunction';
import { PythonModule } from '../PythonModule';
import { PythonParameter } from '../PythonParameter';
import { AbstractPythonFilter } from './AbstractPythonFilter';
import {AnnotationSlice, AnnotationStore} from '../../../annotations/annotationSlice';
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

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        return this.type === DeclarationType.Module;
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        return this.type === DeclarationType.Class;
    }

    shouldKeepFunction(
        pythonFunction: PythonFunction,
        annotations: AnnotationStore,
        usages: UsageCountStore,
    ): boolean {
        return this.type === DeclarationType.Function;
    }

    shouldKeepParameter(
        pythonParameter: PythonParameter,
        annotations: AnnotationStore,
        usages: UsageCountStore,
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

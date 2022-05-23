import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import AbstractPythonFilter from './AbstractPythonFilter';
import { AnnotationsState } from '../../../annotations/annotationSlice';

export default class DeclarationTypeFilter extends AbstractPythonFilter {
    constructor(readonly type: DeclarationType) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationsState): boolean {
        return this.type == DeclarationType.Module;
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationsState): boolean {
        return this.type == DeclarationType.Class;
    }

    shouldKeepFunction(pythonFunction: PythonFunction, annotations: AnnotationsState): boolean {
        return this.type == DeclarationType.Function;
    }

    shouldKeepParameter(pythonParameter: PythonParameter, annotations: AnnotationsState): boolean {
        return this.type == DeclarationType.Parameter;
    }
}

export enum DeclarationType {
    Module,
    Class,
    Function,
    Parameter,
}

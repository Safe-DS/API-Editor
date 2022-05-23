import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import AbstractPythonFilter from './AbstractPythonFilter';
import PythonDeclaration from '../PythonDeclaration';
import { AnnotationsState } from '../../../annotations/annotationSlice';

export default class VisibilityFilter extends AbstractPythonFilter {
    constructor(readonly visibility: Visibility) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationsState): boolean {
        return this.shouldKeepDeclaration(pythonModule, annotations);
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationsState): boolean {
        return this.shouldKeepDeclaration(pythonClass, annotations);
    }

    shouldKeepFunction(pythonFunction: PythonFunction, annotations: AnnotationsState): boolean {
        return this.shouldKeepDeclaration(pythonFunction, annotations);
    }

    shouldKeepParameter(pythonParameter: PythonParameter, annotations: AnnotationsState): boolean {
        return this.shouldKeepDeclaration(pythonParameter, annotations);
    }

    shouldKeepDeclaration(declaration: PythonDeclaration, annotations: AnnotationsState): boolean {
        return declaration.isPublicDeclaration() == (this.visibility == Visibility.Public);
    }
}

export enum Visibility {
    Public,
    Internal,
}

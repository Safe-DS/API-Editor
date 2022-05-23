import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import AbstractPythonFilter from './AbstractPythonFilter';
import PythonDeclaration from '../PythonDeclaration';
import { AnnotationsState } from '../../../annotations/annotationSlice';

export default class NameFilter extends AbstractPythonFilter {
    constructor(readonly name: string) {
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
        return declaration.name.toLowerCase().includes(this.name.toLowerCase());
    }
}

import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import AbstractPythonFilter from './AbstractPythonFilter';
import PythonDeclaration from '../PythonDeclaration';
import { AnnotationsState } from '../../../annotations/annotationSlice';

/**
 * Keeps only declarations that have a given string in their name.
 */
export default class NameFilter extends AbstractPythonFilter {
    /**
     * @param substring The string that must be part of the name of the declaration.
     */
    constructor(readonly substring: string) {
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
        return declaration.name.toLowerCase().includes(this.substring.toLowerCase());
    }
}

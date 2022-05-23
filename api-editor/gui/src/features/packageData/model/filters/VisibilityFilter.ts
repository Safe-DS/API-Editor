import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import AbstractPythonFilter from './AbstractPythonFilter';
import PythonDeclaration from '../PythonDeclaration';

export default class VisibilityFilter extends AbstractPythonFilter {
    constructor(readonly visibility: Visibility) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule): boolean {
        return this.shouldKeepDeclaration(pythonModule);
    }

    shouldKeepClass(pythonClass: PythonClass): boolean {
        return this.shouldKeepDeclaration(pythonClass);
    }

    shouldKeepFunction(pythonFunction: PythonFunction): boolean {
        return this.shouldKeepDeclaration(pythonFunction);
    }

    shouldKeepParameter(pythonParameter: PythonParameter): boolean {
        return this.shouldKeepDeclaration(pythonParameter);
    }

    shouldKeepDeclaration(declaration: PythonDeclaration): boolean {
        return declaration.isPublicDeclaration() == (this.visibility == Visibility.Public)
    }
}

export enum Visibility {
    Public,
    Internal
}

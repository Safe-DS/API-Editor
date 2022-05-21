import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import AbstractPythonFilter from './AbstractPythonFilter';

export default class DeclarationTypeFilter extends AbstractPythonFilter {
    constructor(readonly type: DeclarationType) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule): boolean {
        return this.type == DeclarationType.Module;
    }

    shouldKeepClass(pythonClass: PythonClass): boolean {
        return this.type == DeclarationType.Class;
    }

    shouldKeepFunction(pythonFunction: PythonFunction): boolean {
        return this.type == DeclarationType.Function;
    }

    shouldKeepParameter(pythonParameter: PythonParameter): boolean {
        return this.type == DeclarationType.Parameter;
    }
}

export enum DeclarationType {
    Module,
    Class,
    Function,
    Parameter,
}

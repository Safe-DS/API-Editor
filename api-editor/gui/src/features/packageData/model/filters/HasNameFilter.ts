import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from "../PythonModule";
import PythonParameter from "../PythonParameter";
import AbstractPythonFilter from "./AbstractPythonFilter";
import PythonDeclaration from "../PythonDeclaration";

export default class HasNameFilter extends AbstractPythonFilter {
    constructor(
        readonly name: string,
    ) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule): boolean {
        return this.filter(pythonModule)
    }

    shouldKeepClass(pythonClass: PythonClass): boolean {
        return this.filter(pythonClass)
    }

    shouldKeepFunction(pythonFunction: PythonFunction): boolean {
        return this.filter(pythonFunction)
    }

    shouldKeepParameter(pythonParameter: PythonParameter): boolean {
        return this.filter(pythonParameter)
    }

    private filter(declaration: PythonDeclaration): boolean {
        return declaration.name
            .toLowerCase()
            .includes(
                this.name.toLowerCase()
            )
    }
}

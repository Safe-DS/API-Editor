import { Optional } from '../../../common/util/types';
import PythonClass from './PythonClass';
import PythonFunction from './PythonFunction';
import PythonPackage from './PythonPackage';
import PythonModule from "./PythonModule";
import PythonParameter from "./PythonParameter";
import AbstractPythonFilter from "./AbstractPythonFilter";

export default class PythonHasNameFilter extends AbstractPythonFilter {
    containingPackage: Optional<PythonPackage>;

    constructor(
        readonly name: string,
    ) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule): boolean {
        return this.filter(pythonModule.name)
    }

    shouldKeepClass(pythonClass: PythonClass): boolean {
        return this.filter(pythonClass.name)
    }

    shouldKeepFunction(pythonFunction: PythonFunction): boolean {
        return this.filter(pythonFunction.name)
    }

    shouldKeepParameter(pythonParameter: PythonParameter): boolean {
        return this.filter(pythonParameter.name)
    }

    private filter(declerationName: string): boolean {
        return declerationName
            .toLowerCase()
            .includes(
                this.name.toLowerCase()
            )
    }
}

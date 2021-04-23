import PythonParameter from "./PythonParameter";
import PythonReturnType from "./PythonReturnType";

export default class PythonFunction {

    readonly name: string;
    readonly decorators: string[];
    // TODO: Implementieren
    readonly parameters: PythonParameter[];
    readonly hasReturnType: boolean;
    // TODO: Implementieren
    readonly returnType: PythonReturnType;
    readonly docstring: string;

    constructor(name: string, decorators: string[], parameters: PythonParameter[], hasReturnType: boolean, returnType: PythonReturnType, docstring: string) {
        this.name = name;
        this.decorators = decorators;
        this.parameters = parameters;
        this.hasReturnType = hasReturnType;
        this.returnType = returnType;
        this.docstring = docstring;
    }
}
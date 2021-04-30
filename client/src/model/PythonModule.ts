import PythonFunction from "./PythonFunction";
import PythonClass from "./PythonClass";

export default class PythonModule {

    readonly name: string; // "sklearn.base"
    readonly imports: string[]; // ["import copy", "import warnings"]
    readonly classes: PythonClass[];
    readonly functions: PythonFunction[];

    constructor(name: string, imports: string[], classes: PythonClass[], functions: PythonFunction[]) {
        this.name = name;
        this.imports = imports;
        this.classes = classes;
        this.functions = functions;
    }
}
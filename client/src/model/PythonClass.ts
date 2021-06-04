import PythonFunction from "./PythonFunction";

export default class PythonClass {

    readonly name: string;
    readonly decorators: string[];
    // TODO Superclasses zum Typ string machen
    readonly superclasses: PythonClass[];
    readonly docstring: string;
    readonly methods: PythonFunction[];

    constructor(name: string, decorators: string[], superclasses: PythonClass[], docstring: string, methods: PythonFunction[]) {
        this.name = name;
        this.decorators = decorators;
        this.superclasses = superclasses;
        this.docstring = docstring;
        this.methods = methods;
    }
}
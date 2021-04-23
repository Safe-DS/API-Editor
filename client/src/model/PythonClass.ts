export default class PythonClass {

    readonly name: string;
    readonly decorators: string[];
    readonly superclasses: PythonClass[];
    readonly docstring: string;

    constructor(name: string, decorators: string[], superclasses: PythonClass[], docstring: string) {
        this.name = name;
        this.decorators = decorators;
        this.superclasses = superclasses;
        this.docstring = docstring;
    }
}
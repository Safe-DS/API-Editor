export default class PythonParameter {

    readonly name: string;
    readonly type: string;//Todo Typeclass? instead of returnType etc abstraction to type class
    readonly hasDefault: boolean;
    readonly defaultValue: string;//ToDo maybe new default class
    readonly limitation: null;//Todo ueberall null??
    readonly ignored: boolean;
    readonly docstring: string;

    constructor(name: string, type: string, hasDefault: boolean, defaultValue: string, limitation: null, ignored: boolean, docstring: string) {
        this.name = name;
        this.type = type;
        this.hasDefault = hasDefault;
        this.defaultValue = defaultValue;
        this.limitation = limitation;
        this.ignored = ignored;
        this.docstring = docstring;
    }
}
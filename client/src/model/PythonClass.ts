import PythonFunction from "./PythonFunction";

export default class PythonClass {

    readonly name: string;
    readonly decorators: string[];
    readonly superclasses: string[];
    readonly methods: PythonFunction[];
    readonly summary: string;
    readonly description: string;
    readonly fullDocstring: string;

    constructor(
        name: string,
        decorators: string[] = [],
        superclasses: string[] = [],
        methods: PythonFunction[] = [],
        summary: string = "",
        description: string = "",
        fullDocstring: string = "",
    ) {
        this.name = name;
        this.decorators = decorators;
        this.superclasses = superclasses;
        this.methods = methods;
        this.summary = summary;
        this.description = description;
        this.fullDocstring = fullDocstring;
    }

    toString() {
        let result = ""

        if (this.decorators.length > 0) {
            result += this.decorators.map(it => `@${it}`).join(" ")
            result += " "
        }

        result += `class ${this.name}`

        if (this.superclasses.length > 0) {
            result += `(${this.superclasses.join(", ")})`
        }

        return result
    }
}
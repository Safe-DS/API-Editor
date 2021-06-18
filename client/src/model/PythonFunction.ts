import PythonParameter from "./PythonParameter";
import PythonResult from "./PythonResult";

export default class PythonFunction {

    readonly name: string;
    readonly decorators: string[];
    readonly parameters: PythonParameter[];
    readonly results: PythonResult[];
    readonly returnType: string;
    readonly summary: string;
    readonly description: string;
    readonly fullDocstring: string;

    constructor(
        name: string,
        decorators: string[] = [],
        parameters: PythonParameter[] = [],
        results: PythonResult[] = [],
        returnType: string = "Any",
        summary: string = "",
        description: string = "",
        fullDocstring: string = "",
    ) {
        this.name = name;
        this.decorators = decorators;
        this.parameters = parameters;
        this.results = results;
        this.returnType = returnType;
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

        result += `def ${this.name}(${this.parameters.map(it => it.name).join(", ")})`

        return result
    }
}
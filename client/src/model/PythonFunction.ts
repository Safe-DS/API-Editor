import PythonParameter from "./PythonParameter";
import PythonResult from "./PythonResult";
import PythonClass from "./PythonClass";
import PythonModule from "./PythonModule";
import PythonDeclaration from "./PythonDeclaration";

export default class PythonFunction extends PythonDeclaration {

    readonly name: string;
    readonly decorators: string[];
    readonly parameters: PythonParameter[];
    readonly results: PythonResult[];
    readonly returnType: string;
    readonly summary: string;
    readonly description: string;
    readonly fullDocstring: string;
    containingModuleOrClass: Nullable<PythonModule | PythonClass>;

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
        super();

        this.name = name;
        this.decorators = decorators;
        this.parameters = parameters;
        this.results = results;
        this.returnType = returnType;
        this.summary = summary;
        this.description = description;
        this.fullDocstring = fullDocstring;
        this.containingModuleOrClass = null;

        this.parameters.forEach(it => {
            it.containingFunction = this
        })

        this.results.forEach(it => {
            it.containingFunction = this
        })
    }

    parent(): Nullable<PythonModule | PythonClass> {
        return this.containingModuleOrClass;
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
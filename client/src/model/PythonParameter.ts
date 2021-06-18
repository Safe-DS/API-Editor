import PythonFunction from "./PythonFunction";
import PythonDeclaration from "./PythonDeclaration";

export default class PythonParameter extends PythonDeclaration {

    readonly name: string;
    readonly type: string;
    readonly typeInDocs: string;
    readonly hasDefault: boolean;
    readonly defaultValue: string;
    readonly limitation: null;
    readonly ignored: boolean;
    readonly description: string;
    containingFunction: Nullable<PythonFunction>;

    constructor(
        name: string,
        type: string = "Any",
        typeInDocs: string = "",
        hasDefault: boolean = false,
        defaultValue: string = "",
        limitation: null = null,
        ignored: boolean = false,
        description: string = ""
    ) {
        super();

        this.name = name;
        this.type = type;
        this.typeInDocs = typeInDocs;
        this.hasDefault = hasDefault;
        this.defaultValue = defaultValue;
        this.limitation = limitation;
        this.ignored = ignored;
        this.description = description;
        this.containingFunction = null;
    }

    parent(): Nullable<PythonFunction> {
        return this.containingFunction;
    }

    toString() {
        return `Parameter "${this.name}"`;
    }
}
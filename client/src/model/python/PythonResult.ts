import {Nullable} from "../../util/types";
import PythonDeclaration from "./PythonDeclaration";
import PythonFunction from "./PythonFunction";

export default class PythonResult extends PythonDeclaration {

    readonly name: string;
    readonly type: string;
    readonly typeInDocs: string;
    readonly description: string;
    containingFunction: Nullable<PythonFunction>;

    constructor(
        name: string,
        type = "Any",
        typeInDocs = "",
        description = ""
    ) {
        super();

        this.name = name;
        this.type = type;
        this.typeInDocs = typeInDocs;
        this.description = description;
        this.containingFunction = null;
    }

    parent(): Nullable<PythonFunction> {
        return this.containingFunction;
    }

    toString(): string {
        return `Result "${this.name}"`;
    }
}

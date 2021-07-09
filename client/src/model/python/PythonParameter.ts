import {Nullable} from "../../util/types";
import PythonDeclaration from "./PythonDeclaration";
import PythonFunction from "./PythonFunction";

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
        type = "Any",
        typeInDocs = "",
        hasDefault = false,
        defaultValue = "",
        limitation = null,
        ignored = false,
        description = ""
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

    children(): PythonDeclaration[] {
        return [];
    }

    toString(): string {
        return `Parameter "${this.name}"`;
    }
}

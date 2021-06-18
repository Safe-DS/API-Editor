export default class PythonParameter {

    readonly name: string;
    readonly type: string;
    readonly typeInDocs: string;
    readonly hasDefault: boolean;
    readonly defaultValue: string;
    readonly limitation: null;
    readonly ignored: boolean;
    readonly description: string;

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
        this.name = name;
        this.type = type;
        this.typeInDocs = typeInDocs;
        this.hasDefault = hasDefault;
        this.defaultValue = defaultValue;
        this.limitation = limitation;
        this.ignored = ignored;
        this.description = description;
    }

    toString() {
        return `Parameter "${this.name}"`
    }
}
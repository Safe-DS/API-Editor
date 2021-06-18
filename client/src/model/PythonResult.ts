export default class PythonResult {

    readonly name: string;
    readonly type: string;
    readonly typeInDocs: string;
    readonly description: string;

    constructor(
        name: string,
        type: string = "Any",
        typeInDocs: string = "",
        description: string = ""
    ) {
        this.name = name;
        this.type = type;
        this.typeInDocs = typeInDocs;
        this.description = description;
    }

    toString() {
        return `Result "${this.name}"`
    }
}
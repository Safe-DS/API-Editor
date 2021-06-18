export default class PythonFromImport {

    readonly module: string;
    readonly declaration: string;
    readonly alias: Nullable<string>

    constructor(module: string, declaration: string, alias: Nullable<string> = null) {
        this.module = module;
        this.declaration = declaration;
        this.alias = alias;
    }

    toString() {
        if (this.alias === null) {
            return `from ${this.module} import ${this.declaration}`
        } else {
            return `from ${this.module} import ${this.declaration} as ${this.alias}`
        }
    }
}
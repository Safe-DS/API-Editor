export default class PythonImport {

    readonly module: string;
    readonly alias: Nullable<string>

    constructor(module: string, alias: Nullable<string> = null) {
        this.module = module;
        this.alias = alias;
    }

    toString() {
        if (this.alias === null) {
            return `import ${this.module}`
        } else {
            return `import ${this.module} as ${this.alias}`
        }
    }
}
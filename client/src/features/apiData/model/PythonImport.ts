import { Optional } from '../../../common/util/types'

export default class PythonImport {
    readonly module: string
    readonly alias: Optional<string>

    constructor(module: string, alias: Optional<string> = null) {
        this.module = module
        this.alias = alias
    }

    toString(): string {
        if (this.alias === null) {
            return `import ${this.module}`
        } else {
            return `import ${this.module} as ${this.alias}`
        }
    }
}

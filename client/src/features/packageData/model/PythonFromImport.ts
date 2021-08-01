import { Optional } from '../../../common/util/types';

export default class PythonFromImport {
    readonly module: string;
    readonly declaration: string;
    readonly alias: Optional<string>;

    constructor(module: string, declaration: string, alias: Optional<string> = null) {
        this.module = module;
        this.declaration = declaration;
        this.alias = alias;
    }

    toString(): string {
        if (this.alias === null) {
            return `from ${this.module} import ${this.declaration}`;
        } else {
            return `from ${this.module} import ${this.declaration} as ${this.alias}`;
        }
    }
}

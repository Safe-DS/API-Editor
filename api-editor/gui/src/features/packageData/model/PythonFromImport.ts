import { Optional } from '../../../common/util/types';

export class PythonFromImport {
    constructor(readonly module: string, readonly declaration: string, readonly alias: Optional<string> = null) {}

    toString(): string {
        if (this.alias === null) {
            return `from ${this.module} import ${this.declaration}`;
        } else {
            return `from ${this.module} import ${this.declaration} as ${this.alias}`;
        }
    }
}

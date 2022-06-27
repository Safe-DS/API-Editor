import { Optional } from '../../../common/util/types';
import {PythonFromImportJson} from "./PythonPackageBuilder";

export class PythonFromImport {
    constructor(readonly module: string, readonly declaration: string, readonly alias: Optional<string> = null) {}

    toString(): string {
        if (this.alias === null) {
            return `from ${this.module} import ${this.declaration}`;
        } else {
            return `from ${this.module} import ${this.declaration} as ${this.alias}`;
        }
    }

    toJson(): PythonFromImportJson {
        return {
            module: this.module,
            declaration: this.declaration,
            alias: this.alias
        }
    }
}

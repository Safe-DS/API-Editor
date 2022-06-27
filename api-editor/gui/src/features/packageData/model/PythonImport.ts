import { Optional } from '../../../common/util/types';
import {PythonImportJson} from "./APIJsonData";

export class PythonImport {
    constructor(readonly module: string, readonly alias: Optional<string> = null) {}

    toString(): string {
        if (this.alias === null) {
            return `import ${this.module}`;
        } else {
            return `import ${this.module} as ${this.alias}`;
        }
    }

    toJson(): PythonImportJson {
        return {
            module: this.module,
            alias: this.alias,
        };
    }
}

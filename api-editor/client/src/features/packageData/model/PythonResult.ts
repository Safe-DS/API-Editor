import { Optional } from '../../../common/util/types';
import PythonDeclaration from './PythonDeclaration';
import PythonFunction from './PythonFunction';

export default class PythonResult extends PythonDeclaration {
    readonly name: string;
    readonly type: string;
    readonly typeInDocs: string;
    readonly description: string;
    containingFunction: Optional<PythonFunction>;

    constructor(name: string, type = 'Any', typeInDocs = '', description = '') {
        super();

        this.name = name;
        this.type = type;
        this.typeInDocs = typeInDocs;
        this.description = description;
        this.containingFunction = null;
    }

    parent(): Optional<PythonFunction> {
        return this.containingFunction;
    }

    children(): PythonDeclaration[] {
        return [];
    }

    toString(): string {
        return `Result "${this.name}"`;
    }

    clone(): PythonResult {
        return new PythonResult(
            this.name,
            this.type,
            this.typeInDocs,
            this.description,
        );
    }
}

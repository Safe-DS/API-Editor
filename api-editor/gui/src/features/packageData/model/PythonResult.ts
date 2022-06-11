import { Optional } from '../../../common/util/types';
import { PythonDeclaration } from './PythonDeclaration';
import { PythonFunction } from './PythonFunction';

export class PythonResult extends PythonDeclaration {
    containingFunction: Optional<PythonFunction>;

    constructor(
        readonly name: string,
        readonly typeInDocs: string = '',
        readonly description: string = '',
    ) {
        super();

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
            this.typeInDocs,
            this.description,
        );
    }
}

import { Optional } from '../../../common/util/types';
import { PythonDeclaration } from './PythonDeclaration';
import { PythonFunction } from './PythonFunction';
import { PythonResultJson } from './PythonPackageBuilder';

export class PythonResult extends PythonDeclaration {
    readonly id: string;
    readonly isPublic: boolean;

    containingFunction: Optional<PythonFunction>;

    constructor(readonly name: string, readonly typeInDocs: string = '', readonly description: string = '') {
        super();

        this.id = name;
        this.isPublic = true;

        this.containingFunction = null;
    }

    parent(): Optional<PythonFunction> {
        return this.containingFunction;
    }

    children(): PythonDeclaration[] {
        return [];
    }

    preferredQualifiedName(): string {
        if (this.containingFunction) {
            return `${this.containingFunction.preferredQualifiedName()}.${this.name}`;
        } else {
            return this.name;
        }
    }

    toString(): string {
        return `Result "${this.name}"`;
    }

    toJson(): PythonResultJson {
        return {
            name: this.name,
            docstring: {
                type: this.typeInDocs,
                description: this.description,
            },
        };
    }

    clone(): PythonResult {
        const result = new PythonResult(this.name, this.typeInDocs, this.description);
        result.containingFunction = this.containingFunction;
        return result;
    }
}

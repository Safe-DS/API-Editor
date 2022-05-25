import { Optional } from '../../../common/util/types';
import PythonDeclaration from './PythonDeclaration';
import PythonFunction from './PythonFunction';
import PythonModule from './PythonModule';

export enum PythonParameterAssignment {
    POSITION_ONLY,
    POSITION_OR_NAME,
    NAME_ONLY,
}

export default class PythonParameter extends PythonDeclaration {
    containingFunction: Optional<PythonFunction>;

    /**
     * @param defaultValue If this is `null` or `undefined` the parameter is required.
     */
    constructor(
        readonly name: string,
        readonly defaultValue: Optional<string> = null,
        readonly assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME,
        readonly isPublic: boolean = false,
        readonly typeInDocs: string = '',
        readonly description: string = '',
        readonly index: number = 0,
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

    isPublicDeclaration(): boolean {
        return this.isPublic;
    }

    isExplicitParameter(): boolean {
        const containingFunction = this.parent();
        if (!containingFunction) {
            return false;
        }

        // This is parameter of global function
        if (containingFunction.parent() instanceof PythonModule) {
            return true;
        }

        // This is parameter of a method but not the first
        return this.index > 0
    }

    toString(): string {
        return `Parameter "${this.name}"`;
    }

    clone(): PythonParameter {
        return new PythonParameter(
            this.name,
            this.defaultValue,
            this.assignedBy,
            this.isPublic,
            this.typeInDocs,
            this.description,
        );
    }
}

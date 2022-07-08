import { Optional } from '../../../common/util/types';
import { PythonDeclaration } from './PythonDeclaration';
import { PythonFunction } from './PythonFunction';
import { PythonParameterJson } from './APIJsonData';

export enum PythonParameterAssignment {
    IMPLICIT = 'IMPLICIT',
    POSITION_ONLY = 'POSITION_ONLY',
    POSITION_OR_NAME = 'POSITION_OR_NAME',
    POSITIONAL_VARARG = 'POSITIONAL_VARARG',
    NAME_ONLY = 'NAME_ONLY',
    NAMED_VARARG = 'NAMED_VARARG',
}

export class PythonParameter extends PythonDeclaration {
    containingFunction: Optional<PythonFunction>;

    // noinspection JSCommentMatchesSignature
    /**
     * @param defaultValue If this is `null` or `undefined` the parameter is required.
     */
    constructor(
        readonly id: string,
        readonly name: string,
        readonly qualifiedName: string,
        readonly defaultValue: Optional<string> = null,
        readonly assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME,
        readonly isPublic: boolean = false,
        readonly typeInDocs: string = '',
        readonly description: string = '',
        readonly type: object = {},
        readonly defaultValueInDocs: Optional<string> = null,
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

    getUniqueName(): string {
        switch (this.assignedBy) {
            case PythonParameterAssignment.POSITIONAL_VARARG:
                return `*${this.name}`;
            case PythonParameterAssignment.NAMED_VARARG:
                return `**${this.name}`;
            default:
                return this.name;
        }
    }

    preferredQualifiedName(): string {
        if (this.containingFunction) {
            return `${this.containingFunction.preferredQualifiedName()}.${this.name}`;
        } else {
            return this.name;
        }
    }

    isExplicitParameter(): boolean {
        return (
            this.assignedBy !== PythonParameterAssignment.IMPLICIT &&
            this.assignedBy !== PythonParameterAssignment.POSITIONAL_VARARG &&
            this.assignedBy !== PythonParameterAssignment.NAMED_VARARG
        );
    }

    toString(): string {
        return `Parameter "${this.name}"`;
    }

    toJson(): PythonParameterJson {
        return {
            id: this.id,
            name: this.name,
            qname: this.qualifiedName,
            default_value: this.defaultValue,
            assigned_by: this.assignedBy,
            is_public: this.isPublic,
            docstring: {
                type: this.typeInDocs,
                description: this.description,
                default_value: this.defaultValueInDocs,
            },
            type: this.type,
        };
    }

    clone(): PythonParameter {
        const result = new PythonParameter(
            this.id,
            this.name,
            this.qualifiedName,
            this.defaultValue,
            this.assignedBy,
            this.isPublic,
            this.typeInDocs,
            this.description,
            this.type,
            this.defaultValueInDocs,
        );
        result.containingFunction = this.containingFunction;
        return result;
    }
}

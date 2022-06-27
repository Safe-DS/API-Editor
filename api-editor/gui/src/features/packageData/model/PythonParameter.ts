import { Optional } from '../../../common/util/types';
import { PythonDeclaration } from './PythonDeclaration';
import { PythonFunction } from './PythonFunction';
import {PythonParameterJson} from "./APIJsonData";

export enum PythonParameterAssignment {
    IMPLICIT = 'IMPLICIT',
    POSITION_ONLY = 'POSITION_ONLY',
    POSITION_OR_NAME = 'POSITION_OR_NAME',
    NAME_ONLY = 'NAME_ONLY',
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

    preferredQualifiedName(): string {
        if (this.containingFunction) {
            return `${this.containingFunction.preferredQualifiedName()}.${this.name}`;
        } else {
            return this.name;
        }
    }

    isExplicitParameter(): boolean {
        return this.assignedBy !== PythonParameterAssignment.IMPLICIT;
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
        );
        result.containingFunction = this.containingFunction;
        return result;
    }
}

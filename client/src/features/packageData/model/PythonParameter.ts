import { Optional } from '../../../common/util/types';
import PythonDeclaration from './PythonDeclaration';
import PythonFunction from './PythonFunction';

export enum PythonParameterAssignment {
    POSITION_ONLY,
    POSITION_OR_NAME,
    NAME_ONLY,
}

export default class PythonParameter extends PythonDeclaration {
    readonly name: string;
    readonly defaultValue: string;
    readonly assignedBy: PythonParameterAssignment;
    readonly isPublic: boolean;
    readonly typeInDocs: string;
    readonly description: string;
    containingFunction: Optional<PythonFunction>;

    constructor(
        name: string,
        defaultValue: string = '',
        assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME,
        isPublic: boolean = false,
        typeInDocs: string = '',
        description: string = '',
    ) {
        super();

        this.name = name;
        this.defaultValue = defaultValue ?? '';
        this.assignedBy = assignedBy;
        this.isPublic = isPublic;
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

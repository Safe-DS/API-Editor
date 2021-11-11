import { PythonParameterAssignment } from '../packageData/model/PythonParameter';
import { InferableAnnotation } from './InferableAnnotation';

export default class InferablePythonParameter {
    readonly name: string;
    readonly defaultValue: string;
    readonly assignedBy: PythonParameterAssignment;
    readonly isPublic: boolean;
    readonly typeInDocs: string;
    readonly description: string;
    readonly annotations: InferableAnnotation[];

    constructor(
        name: string,
        defaultValue: string = '',
        assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME,
        isPublic: boolean = false,
        typeInDocs: string = '',
        description: string = '',
        annotations: InferableAnnotation[] = [],
    ) {
        this.name = name;
        this.defaultValue = defaultValue ?? '';
        this.assignedBy = assignedBy;
        this.isPublic = isPublic;
        this.typeInDocs = typeInDocs;
        this.description = description;
        this.annotations = annotations;
    }
}

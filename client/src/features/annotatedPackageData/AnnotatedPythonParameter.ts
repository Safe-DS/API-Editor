import { PythonParameterAssignment } from '../packageData/model/PythonParameter';
import { InferableAnnotation } from './InferableAnnotation';

export default class AnnotatedPythonParameter {
    readonly name: string;
    readonly qualifiedName: string;
    readonly defaultValue: string;
    readonly assignedBy: string;
    readonly isPublic: boolean;
    readonly typeInDocs: string;
    readonly description: string;
    readonly annotations: InferableAnnotation[];

    constructor(
        name: string,
        qualifiedName: string,
        defaultValue: string = '',
        assignedBy: PythonParameterAssignment = PythonParameterAssignment.POSITION_OR_NAME,
        isPublic: boolean = false,
        typeInDocs: string = '',
        description: string = '',
        annotations: InferableAnnotation[] = [],
    ) {
        this.name = name;
        this.qualifiedName = qualifiedName;
        this.defaultValue = defaultValue ?? '';
        switch (assignedBy) {
            case PythonParameterAssignment.NAME_ONLY:
                this.assignedBy = 'NAME_ONLY';
                break;
            case PythonParameterAssignment.POSITION_ONLY:
                this.assignedBy = 'POSITION_ONLY';
                break;
            case PythonParameterAssignment.POSITION_OR_NAME:
                this.assignedBy = 'POSITION_OR_NAME';
                break;
        }
        this.isPublic = isPublic;
        this.typeInDocs = typeInDocs;
        this.description = description;
        this.annotations = annotations;
    }
}

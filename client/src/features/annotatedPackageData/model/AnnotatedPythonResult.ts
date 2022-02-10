import { InferableAnnotation } from './InferableAnnotation';

export default class AnnotatedPythonResult {
    readonly name: string;
    readonly type: string;
    readonly typeInDocs: string;
    readonly description: string;
    readonly annotations: InferableAnnotation[];

    constructor(
        name: string,
        type: string = 'Any',
        typeInDocs: string = '',
        description: string = '',
        annotations: InferableAnnotation[] = [],
    ) {
        this.name = name;
        this.type = type;
        this.typeInDocs = typeInDocs;
        this.description = description;
        this.annotations = annotations;
    }
}

import { InferableAnnotation } from './InferableAnnotation';
import InferablePythonParameter from './InferablePythonParameter';
import InferablePythonResult from './InferablePythonResult';

export default class InferablePythonFunction {
    readonly name: string;
    readonly qualifiedName: string;
    readonly decorators: string[];
    readonly parameters: InferablePythonParameter[];
    readonly results: InferablePythonResult[];
    readonly isPublic: boolean;
    readonly description: string;
    readonly fullDocstring: string;
    readonly annotations: InferableAnnotation[];

    constructor(
        name: string,
        qualifiedName: string,
        decorators: string[] = [],
        parameters: InferablePythonParameter[] = [],
        results: InferablePythonResult[] = [],
        isPublic: boolean = false,
        description: string = '',
        fullDocstring: string = '',
        annotations: InferableAnnotation[] = [],
    ) {
        this.name = name;
        this.qualifiedName = qualifiedName;
        this.decorators = decorators;
        this.parameters = parameters;
        this.results = results;
        this.isPublic = isPublic;
        this.description = description;
        this.fullDocstring = fullDocstring;
        this.annotations = annotations;
    }
}

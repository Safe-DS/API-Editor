import { InferableAnnotation } from './InferableAnnotation';
import AnnotatedPythonParameter from './AnnotatedPythonParameter';
import AnnotatedPythonResult from './AnnotatedPythonResult';

export default class AnnotatedPythonFunction {
    readonly name: string;
    readonly qualifiedName: string;
    readonly decorators: string[];
    readonly parameters: AnnotatedPythonParameter[];
    readonly results: AnnotatedPythonResult[];
    readonly isPublic: boolean;
    readonly description: string;
    readonly fullDocstring: string;
    readonly annotations: InferableAnnotation[];

    constructor(
        name: string,
        qualifiedName: string,
        decorators: string[] = [],
        parameters: AnnotatedPythonParameter[] = [],
        results: AnnotatedPythonResult[] = [],
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

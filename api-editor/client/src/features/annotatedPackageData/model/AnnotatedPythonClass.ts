import { InferableAnnotation } from './InferableAnnotation';
import AnnotatedPythonFunction from './AnnotatedPythonFunction';

export default class AnnotatedPythonClass {
    readonly name: string;
    readonly qualifiedName: string;
    readonly decorators: string[];
    readonly superclasses: string[];
    readonly methods: AnnotatedPythonFunction[];
    readonly isPublic: boolean;
    readonly description: string;
    readonly fullDocstring: string;
    readonly annotations: InferableAnnotation[];

    constructor(
        name: string,
        qualifiedName: string,
        decorators: string[] = [],
        superclasses: string[] = [],
        methods: AnnotatedPythonFunction[] = [],
        isPublic: boolean = true,
        description: string = '',
        fullDocstring: string = '',
        annotations: InferableAnnotation[] = [],
    ) {
        this.name = name;
        this.qualifiedName = qualifiedName;
        this.decorators = decorators;
        this.superclasses = superclasses;
        this.methods = methods;
        this.isPublic = isPublic;
        this.description = description;
        this.fullDocstring = fullDocstring;
        this.annotations = annotations;
    }
}

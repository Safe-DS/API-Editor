import { InferableAnnotation } from './InferableAnnotation';
import InferablePythonFunction from './InferablePythonFunction';

export default class InferablePythonClass {
    readonly name: string;
    readonly qualifiedName: string;
    readonly decorators: string[];
    readonly superclasses: string[];
    readonly methods: InferablePythonFunction[];
    readonly description: string;
    readonly fullDocstring: string;
    readonly annotations: InferableAnnotation[];

    constructor(
        name: string,
        qualifiedName: string,
        decorators: string[] = [],
        superclasses: string[] = [],
        methods: InferablePythonFunction[] = [],
        description: string = '',
        fullDocstring: string = '',
        annotations: InferableAnnotation[] = [],
    ) {
        this.name = name;
        this.qualifiedName = qualifiedName;
        this.decorators = decorators;
        this.superclasses = superclasses;
        this.methods = methods;
        this.description = description;
        this.fullDocstring = fullDocstring;
        this.annotations = annotations;
    }
}

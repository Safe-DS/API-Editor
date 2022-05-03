import {InferableAnnotation} from './InferableAnnotation';
import AnnotatedPythonFunction from './AnnotatedPythonFunction';

export default class AnnotatedPythonClass {
    constructor(
        readonly name: string,
        readonly qualifiedName: string,
        readonly decorators: string[] = [],
        readonly superclasses: string[] = [],
        readonly methods: AnnotatedPythonFunction[] = [],
        readonly isPublic: boolean = true,
        readonly description: string = '',
        readonly fullDocstring: string = '',
        readonly annotations: InferableAnnotation[] = [],
    ) {}
}

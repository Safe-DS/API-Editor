import { InferableAnnotation } from './InferableAnnotation';
import { AnnotatedPythonParameter } from './AnnotatedPythonParameter';
import { AnnotatedPythonResult } from './AnnotatedPythonResult';

export class AnnotatedPythonFunction {
    constructor(
        readonly name: string,
        readonly qualifiedName: string,
        readonly decorators: string[] = [],
        readonly parameters: AnnotatedPythonParameter[] = [],
        readonly results: AnnotatedPythonResult[] = [],
        readonly isPublic: boolean = false,
        readonly description: string = '',
        readonly fullDocstring: string = '',
        readonly annotations: InferableAnnotation[] = [],
    ) {}
}

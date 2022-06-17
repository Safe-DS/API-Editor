import { InferableAnnotation } from './InferableAnnotation';
import { AnnotatedPythonModule } from './AnnotatedPythonModule';

export class AnnotatedPythonPackage {
    constructor(
        readonly distribution: string,
        readonly name: string,
        readonly version: string,
        readonly modules: AnnotatedPythonModule[] = [],
        readonly annotations: InferableAnnotation[] = [],
    ) {}
}

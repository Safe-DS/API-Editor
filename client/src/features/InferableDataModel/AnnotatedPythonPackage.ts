import { InferableAnnotation } from './InferableAnnotation';
import AnnotatedPythonModule from './AnnotatedPythonModule';

export default class AnnotatedPythonPackage {
    readonly distribution: string;
    readonly name: string;
    readonly version: string;
    readonly modules: AnnotatedPythonModule[];
    readonly annotations: InferableAnnotation[];

    constructor(
        distribution: string,
        name: string,
        version: string,
        modules: AnnotatedPythonModule[] = [],
        annotations: InferableAnnotation[] = [],
    ) {
        this.distribution = distribution;
        this.name = name;
        this.version = version;
        this.modules = modules;
        this.annotations = annotations;
    }
}

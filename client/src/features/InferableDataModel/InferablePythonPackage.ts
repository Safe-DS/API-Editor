import { InferableAnnotation } from './InferableAnnotation';
import InferablePythonModule from './InferablePythonModule';

export default class InferablePythonPackage {
    readonly distribution: string;
    readonly name: string;
    readonly version: string;
    readonly modules: InferablePythonModule[];
    readonly annotations: InferableAnnotation[];

    constructor(
        distribution: string,
        name: string,
        version: string,
        modules: InferablePythonModule[] = [],
        annotations: InferableAnnotation[] = [],
    ) {
        this.distribution = distribution;
        this.name = name;
        this.version = version;
        this.modules = modules;
        this.annotations = annotations;
    }
}

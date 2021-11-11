import PythonFromImport from '../packageData/model/PythonFromImport';
import PythonImport from '../packageData/model/PythonImport';
import { InferableAnnotation } from './InferableAnnotation';
import InferablePythonClass from './InferablePythonClass';
import InferablePythonFunction from './InferablePythonFunction';

export default class InferablePythonModule {
    readonly name: string;
    readonly imports: PythonImport[];
    readonly fromImports: PythonFromImport[];
    readonly classes: InferablePythonClass[];
    readonly functions: InferablePythonFunction[];
    readonly annotations: InferableAnnotation[];

    constructor(
        name: string,
        imports: PythonImport[] = [],
        fromImports: PythonFromImport[] = [],
        classes: InferablePythonClass[] = [],
        functions: InferablePythonFunction[] = [],
        annotations: InferableAnnotation[] = [],
    ) {
        this.name = name;
        this.imports = imports;
        this.fromImports = fromImports;
        this.classes = classes;
        this.functions = functions;
        this.annotations = annotations;
    }
}

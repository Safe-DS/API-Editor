import PythonFromImport from '../packageData/model/PythonFromImport';
import PythonImport from '../packageData/model/PythonImport';
import { InferableAnnotation } from './InferableAnnotation';
import AnnotatedPythonClass from './AnnotatedPythonClass';
import AnnotatedPythonFunction from './AnnotatedPythonFunction';

export default class AnnotatedPythonModule {
    readonly name: string;
    readonly imports: PythonImport[];
    readonly fromImports: PythonFromImport[];
    readonly classes: AnnotatedPythonClass[];
    readonly functions: AnnotatedPythonFunction[];
    readonly annotations: InferableAnnotation[];

    constructor(
        name: string,
        imports: PythonImport[] = [],
        fromImports: PythonFromImport[] = [],
        classes: AnnotatedPythonClass[] = [],
        functions: AnnotatedPythonFunction[] = [],
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

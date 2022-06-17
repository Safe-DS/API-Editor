import { PythonFromImport } from '../../packageData/model/PythonFromImport';
import { PythonImport } from '../../packageData/model/PythonImport';
import { InferableAnnotation } from './InferableAnnotation';
import { AnnotatedPythonClass } from './AnnotatedPythonClass';
import { AnnotatedPythonFunction } from './AnnotatedPythonFunction';

export class AnnotatedPythonModule {
    constructor(
        readonly name: string,
        readonly imports: PythonImport[] = [],
        readonly fromImports: PythonFromImport[] = [],
        readonly classes: AnnotatedPythonClass[] = [],
        readonly functions: AnnotatedPythonFunction[] = [],
        readonly annotations: InferableAnnotation[] = [],
    ) {}
}

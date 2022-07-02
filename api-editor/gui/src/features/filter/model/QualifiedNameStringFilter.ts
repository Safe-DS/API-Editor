import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonModule } from '../../packageData/model/PythonModule';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { AbstractPythonFilter } from './AbstractPythonFilter';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import {AnnotationStore} from "../../annotations/versioning/AnnotationStoreV2";

/**
 * Keeps only declarations that have a given string in their qualified name.
 */
export class QualifiedNameStringFilter extends AbstractPythonFilter {
    /**
     * @param string The string that must be part of the qualified name of the declaration.
     * @param matchExactly Whether the qualified name must match the substring exactly.
     */
    constructor(readonly string: string, readonly matchExactly: boolean) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        // For modules the qualified name is the same as the name.
        return this.shouldKeepDeclaration(pythonModule, annotations, usages);
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        return this.shouldKeepDeclaration(pythonClass, annotations, usages);
    }

    shouldKeepFunction(pythonFunction: PythonFunction, annotations: AnnotationStore, usages: UsageCountStore): boolean {
        return this.shouldKeepDeclaration(pythonFunction, annotations, usages);
    }

    shouldKeepParameter(
        pythonParameter: PythonParameter,
        annotations: AnnotationStore,
        usages: UsageCountStore,
    ): boolean {
        return this.shouldKeepDeclaration(pythonParameter, annotations, usages);
    }

    shouldKeepDeclaration(
        pythonDeclaration: PythonDeclaration,
        _annotations: AnnotationStore,
        _usages: UsageCountStore,
    ): boolean {
        if (this.matchExactly) {
            return pythonDeclaration.preferredQualifiedName() === this.string;
        } else {
            return pythonDeclaration.preferredQualifiedName().includes(this.string);
        }
    }
}

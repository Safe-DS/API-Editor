import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonModule } from '../../packageData/model/PythonModule';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { AnnotationStore } from '../../annotations/annotationSlice';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { AbstractPythonFilter } from './AbstractPythonFilter';

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

    shouldKeepModule(pythonModule: PythonModule, _annotations: AnnotationStore, _usages: UsageCountStore): boolean {
        // For modules the qualified name is the same as the name.
        return this.shouldKeepQualifiedName(pythonModule.name);
    }

    shouldKeepClass(pythonClass: PythonClass, _annotations: AnnotationStore, _usages: UsageCountStore): boolean {
        return this.shouldKeepQualifiedName(pythonClass.qualifiedName);
    }

    shouldKeepFunction(
        pythonFunction: PythonFunction,
        _annotations: AnnotationStore,
        _usages: UsageCountStore,
    ): boolean {
        return this.shouldKeepQualifiedName(pythonFunction.qualifiedName);
    }

    shouldKeepParameter(
        pythonParameter: PythonParameter,
        _annotations: AnnotationStore,
        _usages: UsageCountStore,
    ): boolean {
        return this.shouldKeepQualifiedName(pythonParameter.qualifiedName);
    }

    private shouldKeepQualifiedName(qualifiedName: string): boolean {
        if (this.matchExactly) {
            return qualifiedName === this.string;
        } else {
            return qualifiedName.includes(this.string);
        }
    }
}

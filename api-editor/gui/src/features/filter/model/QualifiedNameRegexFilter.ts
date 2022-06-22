import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonModule } from '../../packageData/model/PythonModule';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { AnnotationStore } from '../../annotations/annotationSlice';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { AbstractPythonFilter } from './AbstractPythonFilter';

/**
 * Keeps only declarations that have a qualified name matching the given regex.
 */
export class QualifiedNameRegexFilter extends AbstractPythonFilter {
    readonly regex: RegExp;

    /**
     * @param regex The regex that must match the qualified name of the declaration.
     */
    constructor(regex: string) {
        super();

        this.regex = RegExp(regex, 'u');
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
        return this.regex.test(qualifiedName);
    }
}

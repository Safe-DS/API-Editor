import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonModule } from '../../packageData/model/PythonModule';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { AnnotationStore } from '../../annotations/annotationSlice';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { AbstractPythonFilter } from './AbstractPythonFilter';
import {PythonDeclaration} from "../../packageData/model/PythonDeclaration";

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
        return this.regex.test(pythonDeclaration.preferredQualifiedName());
    }
}

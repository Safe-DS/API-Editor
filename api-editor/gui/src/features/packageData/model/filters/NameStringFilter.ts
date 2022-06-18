import { PythonClass } from '../PythonClass';
import { PythonFunction } from '../PythonFunction';
import { PythonModule } from '../PythonModule';
import { PythonParameter } from '../PythonParameter';
import { AbstractPythonFilter } from './AbstractPythonFilter';
import { PythonDeclaration } from '../PythonDeclaration';
import { AnnotationStore } from '../../../annotations/annotationSlice';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';

/**
 * Keeps only declarations that have a given string in their name.
 */
export class NameStringFilter extends AbstractPythonFilter {
    /**
     * @param string The string that must be part of the name of the declaration.
     * @param matchExactly Whether the name must match the substring exactly.
     */
    constructor(readonly string: string, readonly matchExactly: boolean) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationStore, usages: UsageCountStore): boolean {
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
            return pythonDeclaration.name === this.string;
        } else {
            return pythonDeclaration.name.includes(this.string);
        }
    }
}

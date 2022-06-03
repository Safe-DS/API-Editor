import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import AbstractPythonFilter from './AbstractPythonFilter';
import PythonDeclaration from '../PythonDeclaration';
import {AnnotationsState} from '../../../annotations/annotationSlice';
import {UsageCountStore} from "../../../usages/model/UsageCountStore";

/**
 * Keeps only declarations that have a given string in their name.
 */
export default class NameFilter extends AbstractPythonFilter {
    /**
     * @param substring The string that must be part of the name of the declaration.
     */
    constructor(readonly substring: string) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationsState, usages: UsageCountStore): boolean {
        return this.shouldKeepDeclaration(pythonModule, annotations, usages);
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationsState, usages: UsageCountStore): boolean {
        return this.shouldKeepDeclaration(pythonClass, annotations, usages);
    }

    shouldKeepFunction(pythonFunction: PythonFunction, annotations: AnnotationsState, usages: UsageCountStore): boolean {
        return this.shouldKeepDeclaration(pythonFunction, annotations, usages);
    }

    shouldKeepParameter(pythonParameter: PythonParameter, annotations: AnnotationsState, usages: UsageCountStore): boolean {
        return this.shouldKeepDeclaration(pythonParameter, annotations, usages);
    }

    shouldKeepDeclaration(pythonDeclaration: PythonDeclaration, annotations: AnnotationsState, usages: UsageCountStore): boolean {
        return pythonDeclaration.name.toLowerCase().includes(this.substring.toLowerCase());
    }
}

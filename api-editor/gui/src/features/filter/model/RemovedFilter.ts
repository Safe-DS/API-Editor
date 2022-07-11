import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonModule } from '../../packageData/model/PythonModule';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { AbstractPythonFilter } from './AbstractPythonFilter';
import { AnnotationStore, ReviewResult } from '../../annotations/versioning/AnnotationStoreV2';

/**
 * Keeps only declarations that have the @remove annotation directly or have an ancestor with this annotation.
 */
export class RemovedFilter extends AbstractPythonFilter {
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
        annotations: AnnotationStore,
        _usages: UsageCountStore,
    ): boolean {
        return [...pythonDeclaration.ancestorsOrSelf()].some((ancestor) => {
            const annotation = annotations.removeAnnotations[ancestor.id];
            return annotation && !annotation.isRemoved && annotation.reviewResult !== ReviewResult.Wrong;
        });
    }
}

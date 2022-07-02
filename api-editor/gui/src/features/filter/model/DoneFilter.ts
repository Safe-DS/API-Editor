import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonModule } from '../../packageData/model/PythonModule';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { AbstractPythonFilter } from './AbstractPythonFilter';
import {Annotation, AnnotationStore} from "../../annotations/versioning/AnnotationStoreV2";

/**
 * Keeps only declarations that are marked as complete and all annotations as correct.
 */
export class DoneFilter extends AbstractPythonFilter {
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
        return (
            pythonDeclaration.id in (annotations.completeAnnotations ?? {}) &&
            this.getAnnotationsForTarget(pythonDeclaration.id, annotations).every(
                (annotation) => annotation.isRemoved || (annotation.reviewers?.length ?? 0) > 0,
            )
        );
    }

    private getAnnotationsForTarget(target: string, annotationStore: AnnotationStore): Annotation[] {
        return Object.entries(annotationStore).flatMap(([key, value]) => {
            if (!(target in value)) {
                return [];
            }

            if (key === 'calledAfters' || key === 'groups') {
                return Object.values(value[target]);
            } else if (key === 'completes') {
                return [];
            } else {
                return [value[target]];
            }
        });
    }
}

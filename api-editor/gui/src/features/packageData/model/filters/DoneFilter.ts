import { PythonClass } from '../PythonClass';
import { PythonFunction } from '../PythonFunction';
import { PythonModule } from '../PythonModule';
import { PythonParameter } from '../PythonParameter';
import { AbstractPythonFilter } from './AbstractPythonFilter';
import { PythonDeclaration } from '../PythonDeclaration';
import { Annotation, AnnotationStore } from '../../../annotations/annotationSlice';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';

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
            pythonDeclaration.id in annotations.completes &&
            this.getAnnotationsForTarget(pythonDeclaration.id, annotations).every(
                (annotation) => (annotation.reviewers?.length ?? 0) > 0,
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

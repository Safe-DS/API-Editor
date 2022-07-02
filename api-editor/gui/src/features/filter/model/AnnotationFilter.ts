import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonModule } from '../../packageData/model/PythonModule';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { Annotation, AnnotationStore } from '../../annotations/versioning/AnnotationStoreV2';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { AbstractPythonFilter } from './AbstractPythonFilter';

/**
 * Keeps only declarations with either an arbitrary or a specific annotation.
 */
export class AnnotationFilter extends AbstractPythonFilter {
    /**
     * @param type The annotations to look for. If this is set to `AnnotationType.Any` all annotated declarations are
     * kept. For other values only declarations with the specified annotation are kept.
     */
    constructor(readonly type: AnnotationType) {
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
        annotations: AnnotationStore,
        _usages: UsageCountStore,
    ): boolean {
        const id = pythonDeclaration.id;

        switch (this.type) {
            case AnnotationType.Any:
                return (
                    hasSingleUseAnnotation(id, annotations.boundaryAnnotations) ||
                    hasMultiUseAnnotation(id, annotations.calledAfterAnnotations) ||
                    // Deliberately not checking annotations.complete. It should be transparent it's an annotation.
                    hasSingleUseAnnotation(id, annotations.descriptionAnnotations) ||
                    hasSingleUseAnnotation(id, annotations.enumAnnotations) ||
                    hasMultiUseAnnotation(id, annotations.groupAnnotations) ||
                    hasSingleUseAnnotation(id, annotations.moveAnnotations) ||
                    hasSingleUseAnnotation(id, annotations.pureAnnotations) ||
                    hasSingleUseAnnotation(id, annotations.removeAnnotations) ||
                    hasSingleUseAnnotation(id, annotations.renameAnnotations) ||
                    hasSingleUseAnnotation(id, annotations.todoAnnotations) ||
                    hasSingleUseAnnotation(id, annotations.valueAnnotations)
                );
            case AnnotationType.Boundary:
                return hasSingleUseAnnotation(id, annotations.boundaryAnnotations);
            case AnnotationType.CalledAfter:
                return hasMultiUseAnnotation(id, annotations.calledAfterAnnotations);
            case AnnotationType.Complete:
                return hasSingleUseAnnotation(id, annotations.completeAnnotations);
            case AnnotationType.Description:
                return hasSingleUseAnnotation(id, annotations.descriptionAnnotations);
            case AnnotationType.Enum:
                return hasSingleUseAnnotation(id, annotations.enumAnnotations);
            case AnnotationType.Group:
                return hasMultiUseAnnotation(id, annotations.groupAnnotations);
            case AnnotationType.Move:
                return hasSingleUseAnnotation(id, annotations.moveAnnotations);
            case AnnotationType.Pure:
                return hasSingleUseAnnotation(id, annotations.pureAnnotations);
            case AnnotationType.Remove:
                return hasSingleUseAnnotation(id, annotations.removeAnnotations);
            case AnnotationType.Rename:
                return hasSingleUseAnnotation(id, annotations.renameAnnotations);
            case AnnotationType.Todo:
                return hasSingleUseAnnotation(id, annotations.todoAnnotations);
            case AnnotationType.Value:
                return hasSingleUseAnnotation(id, annotations.valueAnnotations);
            default:
                return true;
        }
    }
}

const hasSingleUseAnnotation = function (target: string, annotations: { [target: string]: Annotation }): boolean {
    const annotationOnTarget = annotations[target];
    return annotationOnTarget && !annotationOnTarget.isRemoved;
};

const hasMultiUseAnnotation = function (
    target: string,
    annotations: { [target: string]: { [key: string]: Annotation } },
): boolean {
    const annotationsOnTarget = Object.values(annotations[target] ?? {});
    return annotationsOnTarget.some((annotation) => !annotation.isRemoved);
};

export enum AnnotationType {
    Any,
    Boundary,
    CalledAfter,
    Complete,
    Description,
    Enum,
    Group,
    Move,
    Pure,
    Remove,
    Rename,
    Todo,
    Value,
}

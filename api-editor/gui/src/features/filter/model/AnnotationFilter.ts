import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonModule } from '../../packageData/model/PythonModule';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { Annotation, AnnotationStore } from '../../annotations/annotationSlice';
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
                    hasSingleUseAnnotation(id, annotations.attributes) ||
                    hasSingleUseAnnotation(id, annotations.boundaries) ||
                    hasMultiUseAnnotation(id, annotations.calledAfters) ||
                    // Deliberately not checking annotations.complete. It should be transparent it's an annotation.
                    hasSingleUseAnnotation(id, annotations.constants) ||
                    hasSingleUseAnnotation(id, annotations.descriptions) ||
                    hasSingleUseAnnotation(id, annotations.enums) ||
                    hasMultiUseAnnotation(id, annotations.groups) ||
                    hasSingleUseAnnotation(id, annotations.moves) ||
                    hasSingleUseAnnotation(id, annotations.optionals) ||
                    hasSingleUseAnnotation(id, annotations.pures) ||
                    hasSingleUseAnnotation(id, annotations.removes) ||
                    hasSingleUseAnnotation(id, annotations.renamings) ||
                    hasSingleUseAnnotation(id, annotations.requireds) ||
                    hasSingleUseAnnotation(id, annotations.todos)
                );
            case AnnotationType.Attribute:
                return hasSingleUseAnnotation(id, annotations.attributes);
            case AnnotationType.Boundary:
                return hasSingleUseAnnotation(id, annotations.boundaries);
            case AnnotationType.CalledAfter:
                return hasMultiUseAnnotation(id, annotations.calledAfters);
            case AnnotationType.Complete:
                return hasSingleUseAnnotation(id, annotations.completes);
            case AnnotationType.Constant:
                return hasSingleUseAnnotation(id, annotations.constants);
            case AnnotationType.Description:
                return hasSingleUseAnnotation(id, annotations.descriptions);
            case AnnotationType.Enum:
                return hasSingleUseAnnotation(id, annotations.enums);
            case AnnotationType.Group:
                return hasMultiUseAnnotation(id, annotations.groups);
            case AnnotationType.Move:
                return hasSingleUseAnnotation(id, annotations.moves);
            case AnnotationType.Optional:
                return hasSingleUseAnnotation(id, annotations.optionals);
            case AnnotationType.Pure:
                return hasSingleUseAnnotation(id, annotations.pures);
            case AnnotationType.Remove:
                return hasSingleUseAnnotation(id, annotations.removes);
            case AnnotationType.Rename:
                return hasSingleUseAnnotation(id, annotations.renamings);
            case AnnotationType.Required:
                return hasSingleUseAnnotation(id, annotations.requireds);
            case AnnotationType.Todo:
                return hasSingleUseAnnotation(id, annotations.todos);
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
    Attribute,
    Boundary,
    CalledAfter,
    Complete,
    Constant,
    Description,
    Enum,
    Group,
    Move,
    Optional,
    Pure,
    Remove,
    Rename,
    Required,
    Todo,
}

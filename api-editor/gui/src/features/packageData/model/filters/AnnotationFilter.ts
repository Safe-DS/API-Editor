import { PythonClass } from '../PythonClass';
import { PythonFunction } from '../PythonFunction';
import { PythonModule } from '../PythonModule';
import { PythonParameter } from '../PythonParameter';
import { AbstractPythonFilter } from './AbstractPythonFilter';
import { PythonDeclaration } from '../PythonDeclaration';
import { AnnotationStore } from '../../../annotations/annotationSlice';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';

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
        const id = pythonDeclaration.pathAsString();

        switch (this.type) {
            case AnnotationType.Any:
                return (
                    id in annotations.attributes ||
                    id in annotations.boundaries ||
                    id in annotations.calledAfters ||
                    id in annotations.constants ||
                    id in annotations.descriptions ||
                    // Deliberately not checking annotations.done. It should be transparent to users it's an annotation.
                    id in annotations.enums ||
                    id in annotations.groups ||
                    id in annotations.moves ||
                    id in annotations.optionals ||
                    id in annotations.pures ||
                    id in annotations.removes ||
                    id in annotations.renamings ||
                    id in annotations.requireds ||
                    id in annotations.todos
                );
            case AnnotationType.Attribute:
                return id in annotations.attributes;
            case AnnotationType.Boundary:
                return id in annotations.boundaries;
            case AnnotationType.CalledAfter:
                return id in annotations.calledAfters;
            case AnnotationType.Constant:
                return id in annotations.constants;
            case AnnotationType.Description:
                return id in annotations.descriptions;
            case AnnotationType.Done:
                return id in annotations.dones;
            case AnnotationType.Enum:
                return id in annotations.enums;
            case AnnotationType.Group:
                return id in annotations.groups;
            case AnnotationType.Move:
                return id in annotations.moves;
            case AnnotationType.Optional:
                return id in annotations.optionals;
            case AnnotationType.Pure:
                return id in annotations.pures;
            case AnnotationType.Remove:
                return id in annotations.removes;
            case AnnotationType.Rename:
                return id in annotations.renamings;
            case AnnotationType.Required:
                return id in annotations.requireds;
            case AnnotationType.Todo:
                return id in annotations.todos;
            default:
                return true;
        }
    }
}

export enum AnnotationType {
    Any,
    Attribute,
    Boundary,
    CalledAfter,
    Constant,
    Description,
    Done,
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

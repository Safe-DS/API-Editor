import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import AbstractPythonFilter from './AbstractPythonFilter';
import PythonDeclaration from '../PythonDeclaration';
import { AnnotationsState } from '../../../annotations/annotationSlice';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';

/**
 * Keeps only declarations with either an arbitrary or a specific annotation.
 */
export default class AnnotationFilter extends AbstractPythonFilter {
    /**
     * @param type The annotations to look for. If this is set to `AnnotationType.Any` all annotated declarations are
     * kept. For other values only declarations with the specified annotation are kept.
     */
    constructor(readonly type: AnnotationType) {
        super();
    }

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationsState, usages: UsageCountStore): boolean {
        return this.shouldKeepDeclaration(pythonModule, annotations, usages);
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationsState, usages: UsageCountStore): boolean {
        return this.shouldKeepDeclaration(pythonClass, annotations, usages);
    }

    shouldKeepFunction(
        pythonFunction: PythonFunction,
        annotations: AnnotationsState,
        usages: UsageCountStore,
    ): boolean {
        return this.shouldKeepDeclaration(pythonFunction, annotations, usages);
    }

    shouldKeepParameter(
        pythonParameter: PythonParameter,
        annotations: AnnotationsState,
        usages: UsageCountStore,
    ): boolean {
        return this.shouldKeepDeclaration(pythonParameter, annotations, usages);
    }

    shouldKeepDeclaration(
        pythonDeclaration: PythonDeclaration,
        annotations: AnnotationsState,
        usages: UsageCountStore,
    ): boolean {
        const id = pythonDeclaration.pathAsString();

        switch (this.type) {
            case AnnotationType.Any:
                return (
                    id in annotations.attributes ||
                    id in annotations.boundaries ||
                    id in annotations.calledAfters ||
                    id in annotations.constants ||
                    id in annotations.enums ||
                    id in annotations.groups ||
                    id in annotations.moves ||
                    id in annotations.optionals ||
                    id in annotations.pures ||
                    id in annotations.removes ||
                    id in annotations.renamings ||
                    id in annotations.requireds
                );
            case AnnotationType.Attribute:
                return id in annotations.attributes;
            case AnnotationType.Boundary:
                return id in annotations.boundaries;
            case AnnotationType.CalledAfter:
                return id in annotations.calledAfters;
            case AnnotationType.Constant:
                return id in annotations.constants;
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
    Enum,
    Group,
    Move,
    Optional,
    Pure,
    Remove,
    Rename,
    Required,
}

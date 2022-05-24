import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import AbstractPythonFilter from './AbstractPythonFilter';
import PythonDeclaration from '../PythonDeclaration';
import { AnnotationsState } from '../../../annotations/annotationSlice';

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

    shouldKeepModule(pythonModule: PythonModule, annotations: AnnotationsState): boolean {
        return this.shouldKeepDeclaration(pythonModule, annotations);
    }

    shouldKeepClass(pythonClass: PythonClass, annotations: AnnotationsState): boolean {
        return this.shouldKeepDeclaration(pythonClass, annotations);
    }

    shouldKeepFunction(pythonFunction: PythonFunction, annotations: AnnotationsState): boolean {
        return this.shouldKeepDeclaration(pythonFunction, annotations);
    }

    shouldKeepParameter(pythonParameter: PythonParameter, annotations: AnnotationsState): boolean {
        return this.shouldKeepDeclaration(pythonParameter, annotations);
    }

    shouldKeepDeclaration(declaration: PythonDeclaration, annotations: AnnotationsState): boolean {
        const id = declaration.pathAsString();

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
                    id in annotations.renamings ||
                    id in annotations.requireds ||
                    id in annotations.unuseds
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
            case AnnotationType.Rename:
                return id in annotations.renamings;
            case AnnotationType.Required:
                return id in annotations.requireds;
            case AnnotationType.Unused:
                return id in annotations.unuseds;

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
    Rename,
    Required,
    Unused,
}

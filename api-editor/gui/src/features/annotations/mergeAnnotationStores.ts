import {
    AnnotationStore,
    AttributeAnnotation,
    BoundaryAnnotation,
    CalledAfterAnnotation,
    CompleteAnnotation,
    ConstantAnnotation,
    DescriptionAnnotation,
    EnumAnnotation, GroupAnnotation,
    MoveAnnotation,
    OptionalAnnotation, PureAnnotation, RemoveAnnotation, RenameAnnotation, RequiredAnnotation, TodoAnnotation,
} from './annotationSlice';

export const mergeAnnotationStores = function (mine: AnnotationStore, theirs: AnnotationStore): AnnotationStore {
    return {
        attributes: mergeAttributeAnnotations(mine, theirs),
        boundaries: mergeBoundaryAnnotations(mine, theirs),
        calledAfters: mergeCalledAfterAnnotations(mine, theirs),
        completes: mergeCompletesAnnotations(mine, theirs),
        constants: mergeConstantAnnotations(mine, theirs),
        descriptions: mergeDescriptionAnnotations(mine, theirs),
        enums: mergeEnumAnnotations(mine, theirs),
        groups: mergeGroupAnnotations(mine, theirs),
        moves: mergeMoveAnnotations(mine, theirs),
        optionals: mergeOptionalAnnotations(mine, theirs),
        pures: mergePureAnnotations(mine, theirs),
        removes: mergeRemoveAnnotations(mine, theirs),
        renamings: mergeRenamingAnnotations(mine, theirs),
        requireds: mergeRequiredAnnotations(mine, theirs),
        todos: mergeTodoAnnotations(mine, theirs),
    };
};

const mergeAttributeAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: AttributeAnnotation } {
    return mine.attributes
};

const mergeBoundaryAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: BoundaryAnnotation } {
    return mine.boundaries
};

const mergeCalledAfterAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: { [calledAfterName: string]: CalledAfterAnnotation } } {
    return mine.calledAfters
};

const mergeCompletesAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: CompleteAnnotation } {
    return mine.completes
};

const mergeConstantAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: ConstantAnnotation } {
    return mine.constants
};

const mergeDescriptionAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: DescriptionAnnotation } {
    return mine.descriptions
};

const mergeEnumAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: EnumAnnotation } {
    return mine.enums
};

const mergeGroupAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: { [groupName: string]: GroupAnnotation } } {
    return mine.groups
}

const mergeMoveAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: MoveAnnotation } {
    return mine.moves
}

const mergeOptionalAnnotations = function (
    mine : AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: OptionalAnnotation } {
    return mine.optionals
}

const mergePureAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: PureAnnotation } {
    return {
        ...theirs.pures,
        ...mine.pures
    }
}

const mergeRemoveAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: RemoveAnnotation } {
    return mine.removes
}

const mergeRenamingAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: RenameAnnotation } {
    return mine.renamings
}

const mergeRequiredAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: RequiredAnnotation } {
    return mine.requireds
}

const mergeTodoAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: TodoAnnotation } {
    return mine.todos
}

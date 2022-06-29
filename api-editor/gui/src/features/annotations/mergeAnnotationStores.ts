import {
    Annotation,
    AnnotationStore,
    AttributeAnnotation,
    BoundaryAnnotation,
    CalledAfterAnnotation,
    CompleteAnnotation,
    ConstantAnnotation,
    DescriptionAnnotation,
    EnumAnnotation,
    GroupAnnotation,
    MoveAnnotation,
    OptionalAnnotation,
    PureAnnotation,
    RemoveAnnotation,
    RenameAnnotation,
    RequiredAnnotation,
    TodoAnnotation,
} from './annotationSlice';

export const mergeAnnotationStores = function (mine: AnnotationStore, theirs: AnnotationStore): AnnotationStore {
    return {
        attributes: mergeAttributeAnnotations(mine, theirs),
        boundaries: mergeBoundaryAnnotations(mine, theirs),
        calledAfters: mergeCalledAfterAnnotations(mine, theirs),
        completes: mergeCompleteAnnotations(mine, theirs),
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
    return mine.attributes;
};

const mergeBoundaryAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: BoundaryAnnotation } {
    return mine.boundaries;
};

const mergeCalledAfterAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: { [calledAfterName: string]: CalledAfterAnnotation } } {
    const result = { ...theirs.calledAfters };
    for (const target of Object.keys(mine.calledAfters)) {
        for (const calledAfterName of Object.keys(mine.calledAfters[target])) {
            if (!result[target]) {
                result[target] = {};
            }

            const theirCalledAfterAnnotation: CalledAfterAnnotation | undefined = result[target][calledAfterName];
            const myCalledAfterAnnotation: CalledAfterAnnotation = mine.calledAfters[target][calledAfterName];
            if (!(theirCalledAfterAnnotation && isReviewed(theirCalledAfterAnnotation)) || isReviewed(myCalledAfterAnnotation)) {
                result[target][calledAfterName] = myCalledAfterAnnotation;
            }
        }
    }
    return result;
};

const mergeCompleteAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: CompleteAnnotation } {
    return {
        ...theirs.completes,
        ...mine.completes,
    };
};

const mergeConstantAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: ConstantAnnotation } {
    return mine.constants;
};

const mergeDescriptionAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: DescriptionAnnotation } {
    return mine.descriptions;
};

const mergeEnumAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: EnumAnnotation } {
    return mine.enums;
};

const mergeGroupAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: { [groupName: string]: GroupAnnotation } } {
    return mine.groups;
};

const mergeMoveAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: MoveAnnotation } {
    return mine.moves;
};

const mergeOptionalAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: OptionalAnnotation } {
    return mine.optionals;
};

const mergePureAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: PureAnnotation } {
    const result = { ...theirs.pures };
    for (const target of Object.keys(mine.pures)) {
        const theirPureAnnotation: PureAnnotation | undefined = result[target];
        const myPureAnnotation: PureAnnotation = mine.pures[target];
        if (!(theirPureAnnotation && isReviewed(theirPureAnnotation)) || isReviewed(myPureAnnotation)) {
            result[target] = myPureAnnotation;
        }
    }
    return result;
};

const mergeRemoveAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: RemoveAnnotation } {
    const result = { ...theirs.removes };
    for (const target of Object.keys(mine.removes)) {
        const theirRemoveAnnotation: RemoveAnnotation | undefined = result[target];
        const myRemoveAnnotation: RemoveAnnotation = mine.removes[target];
        if (!(theirRemoveAnnotation && isReviewed(theirRemoveAnnotation)) || isReviewed(myRemoveAnnotation)) {
            result[target] = myRemoveAnnotation;
        }
    }
    return result;
};

const mergeRenamingAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: RenameAnnotation } {
    return mine.renamings;
};

const mergeRequiredAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: RequiredAnnotation } {
    return mine.requireds;
};

const mergeTodoAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: TodoAnnotation } {
    return mine.todos;
};

const isAutogenerated = function (annotation: Annotation) {
    return annotation.authors?.includes('$autogen$');
};

const isReviewed = function (annotation: Annotation) {
    return (annotation.reviewers?.length ?? 0) > 0;
};

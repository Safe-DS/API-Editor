import {
    Annotation,
    AnnotationStore,
    AttributeAnnotation,
    CalledAfterAnnotation,
    CompleteAnnotation,
    ConstantAnnotation,
    GroupAnnotation,
    OptionalAnnotation,
    RequiredAnnotation,
} from './annotationSlice';

export const mergeAnnotationStores = function (mine: AnnotationStore, theirs: AnnotationStore): AnnotationStore {
    return {
        attributes: mergeAttributeAnnotations(mine, theirs),
        boundaries: defaultMergeOneAnnotationType(mine.boundaries, theirs.boundaries),
        calledAfters: mergeCalledAfterAnnotations(mine, theirs),
        completes: mergeCompleteAnnotations(mine, theirs),
        constants: mergeConstantAnnotations(mine, theirs),
        descriptions: defaultMergeOneAnnotationType(mine.descriptions, theirs.descriptions),
        enums: defaultMergeOneAnnotationType(mine.enums, theirs.enums),
        groups: mergeGroupAnnotations(mine, theirs),
        moves: defaultMergeOneAnnotationType(mine.moves, theirs.moves),
        optionals: mergeOptionalAnnotations(mine, theirs),
        pures: defaultMergeOneAnnotationType(mine.pures, theirs.pures),
        removes: defaultMergeOneAnnotationType(mine.removes, theirs.removes),
        renamings: defaultMergeOneAnnotationType(mine.renamings, theirs.renamings),
        requireds: mergeRequiredAnnotations(mine, theirs),
        todos: defaultMergeOneAnnotationType(mine.todos, theirs.todos),
    };
};

const mergeAttributeAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: AttributeAnnotation } {
    return mine.attributes;
};

const mergeCalledAfterAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: { [calledAfterName: string]: CalledAfterAnnotation } } {
    const result = { ...theirs.calledAfters };
    for (const target of Object.keys(mine.calledAfters)) {
        result[target] = defaultMergeOneAnnotationType(
            mine.calledAfters[target],
            theirs.calledAfters[target],
        )
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

const mergeGroupAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: { [groupName: string]: GroupAnnotation } } {
    const result = { ...theirs.groups };
    for (const target of Object.keys(mine.groups)) {
        result[target] = defaultMergeOneAnnotationType(
            mine.groups[target],
            theirs.groups[target],
        )
    }
    return result;
};

const mergeOptionalAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: OptionalAnnotation } {
    return mine.optionals;
};

const mergeRequiredAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: RequiredAnnotation } {
    return mine.requireds;
};

const isAutogenerated = function (annotation: Annotation) {
    return annotation.authors?.includes('$autogen$');
};

const isReviewed = function (annotation: Annotation) {
    return (annotation.reviewers?.length ?? 0) > 0;
};

const defaultMergeOneAnnotationType = function <T extends Annotation>(
    mine: { [target: string]: T },
    theirs: { [target: string]: T },
): { [target: string]: T } {
    const result = { ...theirs };
    for (const target of Object.keys(mine)) {
        const theirBoundaryAnnotation: T | undefined = result[target];
        const myBoundaryAnnotation: T = mine[target];

        // No conflict
        if (!theirBoundaryAnnotation) {
            result[target] = myBoundaryAnnotation;
            continue;
        }

        // Prefer reviewed annotations in case of conflicts
        if (isReviewed(theirBoundaryAnnotation) && !isReviewed(myBoundaryAnnotation)) {
            continue;
        } else if (!isReviewed(theirBoundaryAnnotation) && isReviewed(myBoundaryAnnotation)) {
            result[target] = myBoundaryAnnotation;
            continue;
        }

        // Prefer manually created annotations in case of conflicts if value differ
        if (!isAutogenerated(theirBoundaryAnnotation) && isAutogenerated(myBoundaryAnnotation)) {
            continue;
        } else if (isAutogenerated(theirBoundaryAnnotation) && !isAutogenerated(myBoundaryAnnotation)) {
            result[target] = myBoundaryAnnotation;
            continue;
        }

        // Prefer my annotations
        result[target] = myBoundaryAnnotation;
    }
    return result;
};

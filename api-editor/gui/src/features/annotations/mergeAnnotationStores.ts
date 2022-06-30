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
    return mergeParameterValueAnnotations(mine.attributes, theirs.attributes, [
        mine.constants,
        mine.optionals,
        mine.requireds,
        theirs.constants,
        theirs.optionals,
        theirs.requireds,
    ]);
};

const mergeCalledAfterAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: { [calledAfterName: string]: CalledAfterAnnotation } } {
    const result = { ...theirs.calledAfters };
    for (const target of Object.keys(mine.calledAfters)) {
        result[target] = defaultMergeOneAnnotationType(mine.calledAfters[target], theirs.calledAfters[target] ?? {});
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
    return mergeParameterValueAnnotations(mine.constants, theirs.constants, [
        mine.attributes,
        mine.optionals,
        mine.requireds,
        theirs.attributes,
        theirs.optionals,
        theirs.requireds,
    ]);
};

const mergeGroupAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: { [groupName: string]: GroupAnnotation } } {
    const result = { ...theirs.groups };
    for (const target of Object.keys(mine.groups)) {
        result[target] = defaultMergeOneAnnotationType(mine.groups[target], theirs.groups[target] ?? {});
    }
    return result;
};

const mergeOptionalAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: OptionalAnnotation } {
    return mergeParameterValueAnnotations(mine.optionals, theirs.optionals, [
        mine.attributes,
        mine.constants,
        mine.requireds,
        theirs.attributes,
        theirs.constants,
        theirs.requireds,
    ]);
};

const mergeRequiredAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: RequiredAnnotation } {
    return mergeParameterValueAnnotations(mine.requireds, theirs.requireds, [
        mine.attributes,
        mine.constants,
        mine.optionals,
        theirs.attributes,
        theirs.constants,
        theirs.optionals,
    ]);
};

const isDefinitelyManuallyCreated = function (annotation: Annotation | undefined) {
    const authors = annotation?.authors ?? [];
    if (authors.length === 0) {
        return false;
    }

    return !authors.includes('$autogen$');
};

const isDefinitelyReviewed = function (annotation: Annotation | undefined) {
    const reviewers = annotation?.reviewers ?? [];
    return reviewers.length > 0;
};

const defaultMergeOneAnnotationType = function <T extends Annotation>(
    mine: { [target: string]: T },
    theirs: { [target: string]: T },
): { [target: string]: T } {
    const result = { ...theirs };
    for (const target of Object.keys(mine)) {
        const myAnnotation: T = mine[target];
        const theirAnnotation: T | undefined = theirs[target];

        // No conflict
        if (!theirAnnotation) {
            result[target] = myAnnotation;
            continue;
        }

        // Prefer reviewed annotations in case of conflicts
        if (isDefinitelyReviewed(theirAnnotation) && !isDefinitelyReviewed(myAnnotation)) {
            continue;
        } else if (!isDefinitelyReviewed(theirAnnotation) && isDefinitelyReviewed(myAnnotation)) {
            result[target] = myAnnotation;
            continue;
        }

        // Prefer manually created annotations in case of conflicts if value differ
        if (isDefinitelyManuallyCreated(theirAnnotation) && !isDefinitelyManuallyCreated(myAnnotation)) {
            continue;
        } else if (!isDefinitelyManuallyCreated(theirAnnotation) && isDefinitelyManuallyCreated(myAnnotation)) {
            result[target] = myAnnotation;
            continue;
        }

        // Prefer my annotations
        result[target] = myAnnotation;
    }
    return result;
};

const mergeParameterValueAnnotations = function <T extends Annotation>(
    mine: { [target: string]: T },
    theirs: { [target: string]: T },
    potentialConflicts: { [target: string]: Annotation }[],
): { [target: string]: T } {
    const result: { [target: string]: T } = {};
    const allTargets = [...Object.keys(mine), ...Object.keys(theirs)];

    for (const target of allTargets) {
        const myAnnotation: T | undefined = mine[target];
        const theirAnnotation: T | undefined = theirs[target];
        const conflictingAnnotations: Annotation[] = potentialConflicts.flatMap((potentialConflict) => {
            return target in potentialConflict ? [potentialConflict[target]] : [];
        });

        // No conflict
        if (conflictingAnnotations.length === 0) {
            if (!theirAnnotation && myAnnotation) {
                result[target] = myAnnotation;
                continue;
            } else if (!myAnnotation && theirAnnotation) {
                result[target] = theirAnnotation;
                continue;
            }
        }

        // Prefer reviewed annotations in case of conflicts
        if (conflictingAnnotations.every((annotation) => !isDefinitelyReviewed(annotation))) {
            if (!isDefinitelyReviewed(theirAnnotation) && isDefinitelyReviewed(myAnnotation)) {
                result[target] = myAnnotation;
                continue;
            } else if (isDefinitelyReviewed(theirAnnotation) && !isDefinitelyReviewed(myAnnotation)) {
                result[target] = theirAnnotation;
                continue;
            }
        }

        // Prefer manually created annotations in case of conflicts if value differ
        if (conflictingAnnotations.every((annotation) => !isDefinitelyManuallyCreated(annotation))) {
            if (!isDefinitelyManuallyCreated(theirAnnotation) && isDefinitelyManuallyCreated(myAnnotation)) {
                result[target] = myAnnotation;
                continue;
            } else if (isDefinitelyManuallyCreated(theirAnnotation) && !isDefinitelyManuallyCreated(myAnnotation)) {
                result[target] = theirAnnotation;
                continue;
            }
        }

        // Prefer my annotations
    }

    return result;
};

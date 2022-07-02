import {
    Annotation,
    AnnotationStore,
    CalledAfterAnnotation,
    CompleteAnnotation,
    GroupAnnotation,
} from './versioning/AnnotationStoreV2';

export const mergeAnnotationStores = function (mine: AnnotationStore, theirs: AnnotationStore): AnnotationStore {
    return {
        schemaVersion: mine.schemaVersion,
        boundaryAnnotations: defaultMergeOneAnnotationType(mine.boundaryAnnotations, theirs.boundaryAnnotations),
        calledAfterAnnotations: mergeCalledAfterAnnotations(mine, theirs),
        completeAnnotations: mergeCompleteAnnotations(mine, theirs),
        descriptionAnnotations: defaultMergeOneAnnotationType(
            mine.descriptionAnnotations,
            theirs.descriptionAnnotations,
        ),
        enumAnnotations: defaultMergeOneAnnotationType(mine.enumAnnotations, theirs.enumAnnotations),
        groupAnnotations: mergeGroupAnnotations(mine, theirs),
        moveAnnotations: defaultMergeOneAnnotationType(mine.moveAnnotations, theirs.moveAnnotations),
        pureAnnotations: defaultMergeOneAnnotationType(mine.pureAnnotations, theirs.pureAnnotations),
        removeAnnotations: defaultMergeOneAnnotationType(mine.removeAnnotations, theirs.removeAnnotations),
        renameAnnotations: defaultMergeOneAnnotationType(mine.renameAnnotations, theirs.renameAnnotations),
        todoAnnotations: defaultMergeOneAnnotationType(mine.todoAnnotations, theirs.todoAnnotations),
        valueAnnotations: defaultMergeOneAnnotationType(mine.valueAnnotations, theirs.valueAnnotations),
    };
};

const mergeCalledAfterAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: { [calledAfterName: string]: CalledAfterAnnotation } } {
    const result = { ...theirs.calledAfterAnnotations };
    for (const target of Object.keys(mine.calledAfterAnnotations)) {
        result[target] = defaultMergeOneAnnotationType(
            mine.calledAfterAnnotations[target],
            theirs.calledAfterAnnotations[target],
        );
    }
    return result;
};

const mergeCompleteAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: CompleteAnnotation } {
    return {
        ...theirs.completeAnnotations,
        ...mine.completeAnnotations,
    };
};

const mergeGroupAnnotations = function (
    mine: AnnotationStore,
    theirs: AnnotationStore,
): { [target: string]: { [groupName: string]: GroupAnnotation } } {
    const result = { ...theirs.groupAnnotations };
    for (const target of Object.keys(mine.groupAnnotations)) {
        result[target] = defaultMergeOneAnnotationType(
            mine.groupAnnotations[target],
            theirs.groupAnnotations[target] ?? {},
        );
    }
    return result;
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

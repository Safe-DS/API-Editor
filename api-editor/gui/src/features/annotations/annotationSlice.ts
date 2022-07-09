import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as idb from 'idb-keyval';
import { RootState } from '../../app/store';
import { isValidUsername } from '../../common/util/validation';
import { mergeAnnotationStores } from './mergeAnnotationStores';
import {
    Annotation,
    AnnotationStore,
    BoundaryAnnotation,
    CalledAfterAnnotation,
    CalledAfterTarget,
    CompleteAnnotation,
    DescriptionAnnotation,
    EnumAnnotation,
    GroupAnnotation,
    GroupTarget,
    MoveAnnotation,
    PureAnnotation,
    RemoveAnnotation,
    RenameAnnotation,
    ReviewResult,
    TodoAnnotation,
    ValueAnnotation,
} from './versioning/AnnotationStoreV2';
import { migrateAnnotationStoreToCurrentVersion } from './versioning/migrations';
import { isEqual } from 'lodash/fp';

export const EXPECTED_ANNOTATION_SLICE_SCHEMA_VERSION = 1;

/**
 * How many annotations can be applied to a class at once.
 */
export const maximumNumberOfClassAnnotations = 5;

/**
 * How many annotations can be applied to a function at once.
 */
export const maximumNumberOfFunctionAnnotations = 8;

/**
 * How many annotations can be applied to a parameter at once.
 */
export const maximumNumberOfParameterAnnotations = 9;

const maximumUndoHistoryLength = 10;

export interface AnnotationSlice {
    schemaVersion?: number;
    annotations: AnnotationStore;
    queue: AnnotationStore[];
    queueIndex: number;
    username: string;

    // Metrics for achievements
    numberOfElementsMarkedAsComplete: number;
    numberOfAnnotationsMarkedAsCorrect: number;
    numberOfAnnotationsCreated: number;
    numberOfAnnotationsChanged: number;
    numberOfAnnotationsDeleted: number;
}

// Initial state -------------------------------------------------------------------------------------------------------

export const initialAnnotationStore: AnnotationStore = {
    schemaVersion: 2,
    boundaryAnnotations: {},
    calledAfterAnnotations: {},
    completeAnnotations: {},
    descriptionAnnotations: {},
    enumAnnotations: {},
    groupAnnotations: {},
    moveAnnotations: {},
    pureAnnotations: {},
    renameAnnotations: {},
    removeAnnotations: {},
    todoAnnotations: {},
    valueAnnotations: {},
};

export const initialAnnotationSlice: AnnotationSlice = {
    annotations: initialAnnotationStore,
    queue: [initialAnnotationStore],
    queueIndex: -1, // The index that contains the state after an undo
    username: '',

    numberOfElementsMarkedAsComplete: 0,
    numberOfAnnotationsMarkedAsCorrect: 0,
    numberOfAnnotationsCreated: 0,
    numberOfAnnotationsChanged: 0,
    numberOfAnnotationsDeleted: 0,
};

// Thunks --------------------------------------------------------------------------------------------------------------

export const initializeAnnotations = createAsyncThunk('annotations/initialize', async () => {
    try {
        const storedAnnotations = (await idb.get('annotations')) as AnnotationSlice;
        if ((storedAnnotations.schemaVersion ?? 1) !== EXPECTED_ANNOTATION_SLICE_SCHEMA_VERSION) {
            return initialAnnotationSlice;
        }

        return {
            ...initialAnnotationSlice,
            ...storedAnnotations,
            annotations: {
                ...initialAnnotationStore,
                ...migrateAnnotationStoreToCurrentVersion(storedAnnotations.annotations),
            },
        };
    } catch {
        return initialAnnotationSlice;
    }
});

export const persistAnnotations = createAsyncThunk('annotations/persist', async (state: AnnotationSlice) => {
    try {
        await idb.set('annotations', state);
    } catch {
        // ignore
    }
});

// Slice ---------------------------------------------------------------------------------------------------------------

const annotationsSlice = createSlice({
    name: 'annotations',
    initialState: initialAnnotationSlice,
    reducers: {
        undo(state) {
            if (0 <= state.queueIndex && state.queueIndex < state.queue.length) {
                return {
                    ...state,
                    annotations: state.queue[state.queueIndex],
                    queueIndex: state.queueIndex - 1,
                };
            }
            return state;
        },
        redo(state) {
            if (0 <= state.queueIndex + 2 && state.queueIndex + 2 < state.queue.length) {
                return {
                    ...state,
                    annotations: state.queue[state.queueIndex + 2],
                    queueIndex: state.queueIndex + 1,
                };
            }
            return state;
        },
        setAnnotationStore(state, action: PayloadAction<AnnotationStore>) {
            state.annotations = {
                ...initialAnnotationStore,
                ...action.payload,
            };

            updateQueue(state);
        },
        mergeAnnotationStore(state, action: PayloadAction<AnnotationStore>) {
            state.annotations = mergeAnnotationStores(state.annotations, {
                ...initialAnnotationStore,
                ...action.payload,
            });

            updateQueue(state);
        },
        resetAnnotationStore(state) {
            state.annotations = initialAnnotationStore;

            updateQueue(state);
        },
        upsertBoundaryAnnotation(state, action: PayloadAction<BoundaryAnnotation>) {
            updateCreationOrChangedCount(
                state,
                state.annotations.boundaryAnnotations[action.payload.target],
                action.payload,
            );

            state.annotations.boundaryAnnotations[action.payload.target] = withAuthorAndReviewers(
                state.annotations.boundaryAnnotations[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        removeBoundaryAnnotation(state, action: PayloadAction<string>) {
            removeAnnotation(state, state.annotations.boundaryAnnotations, action.payload);
            updateQueue(state);
        },
        reviewBoundaryAnnotation(state, action: PayloadAction<{ target: string; reviewResult: ReviewResult }>) {
            state.annotations.boundaryAnnotations[action.payload.target] = withToggledReviewer(
                state,
                state.annotations.boundaryAnnotations[action.payload.target],
                state.username,
                action.payload.reviewResult,
            );

            updateQueue(state);
        },
        upsertCalledAfterAnnotation(
            state,
            action: PayloadAction<{ annotation: CalledAfterAnnotation; previousCalledAfterName?: string }>,
        ) {
            const oldAnnotation =
                state.annotations.calledAfterAnnotations[action.payload.annotation.target][
                    action.payload.previousCalledAfterName ?? ''
                ];

            if (!state.annotations.calledAfterAnnotations[action.payload.annotation.target]) {
                state.annotations.calledAfterAnnotations[action.payload.annotation.target] = {};
            }

            updateCreationOrChangedCount(state, oldAnnotation, action.payload.annotation);

            state.annotations.calledAfterAnnotations[action.payload.annotation.target][
                action.payload.annotation.calledAfterName
            ] = withAuthorAndReviewers(oldAnnotation, action.payload.annotation, state.username);

            // Delete old annotation
            if (action.payload.previousCalledAfterName !== action.payload.annotation.calledAfterName) {
                delete state.annotations.calledAfterAnnotations[action.payload.annotation.target][
                    action.payload.previousCalledAfterName ?? ''
                ];
            }

            updateQueue(state);
        },
        removeCalledAfterAnnotation(state, action: PayloadAction<CalledAfterTarget>) {
            removeAnnotation(
                state,
                state.annotations.calledAfterAnnotations[action.payload.target],
                action.payload.calledAfterName,
            );

            if (Object.keys(state.annotations.calledAfterAnnotations[action.payload.target]).length === 0) {
                delete state.annotations.calledAfterAnnotations[action.payload.target];
                state.numberOfAnnotationsDeleted++;
            }

            updateQueue(state);
        },
        reviewCalledAfterAnnotation(
            state,
            action: PayloadAction<{ target: CalledAfterTarget; reviewResult: ReviewResult }>,
        ) {
            state.annotations.calledAfterAnnotations[action.payload.target.target][
                action.payload.target.calledAfterName
            ] = withToggledReviewer(
                state,
                state.annotations.calledAfterAnnotations[action.payload.target.target][
                    action.payload.target.calledAfterName
                ],
                state.username,
                action.payload.reviewResult,
            );

            updateQueue(state);
        },
        addComplete(state, action: PayloadAction<CompleteAnnotation>) {
            state.annotations.completeAnnotations[action.payload.target] = withAuthorAndReviewers(
                state.annotations.completeAnnotations[action.payload.target],
                action.payload,
                state.username,
            );
            state.numberOfElementsMarkedAsComplete++;

            updateQueue(state);
        },
        removeComplete(state, action: PayloadAction<string>) {
            delete state.annotations.completeAnnotations[action.payload];
            // We deliberately don't update numberOfAnnotationsDeleted

            updateQueue(state);
        },
        toggleComplete(state, action: PayloadAction<string>) {
            if (state.annotations.completeAnnotations[action.payload]) {
                delete state.annotations.completeAnnotations[action.payload];
            } else {
                state.annotations.completeAnnotations[action.payload] = withAuthorAndReviewers(
                    state.annotations.completeAnnotations[action.payload],
                    { target: action.payload },
                    state.username,
                );
                state.numberOfElementsMarkedAsComplete++;
            }

            updateQueue(state);
        },
        // Cannot review complete annotations
        upsertDescriptionAnnotation(state, action: PayloadAction<DescriptionAnnotation>) {
            updateCreationOrChangedCount(
                state,
                state.annotations.descriptionAnnotations[action.payload.target],
                action.payload,
            );

            state.annotations.descriptionAnnotations[action.payload.target] = withAuthorAndReviewers(
                state.annotations.descriptionAnnotations[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        removeDescriptionAnnotation(state, action: PayloadAction<string>) {
            removeAnnotation(state, state.annotations.descriptionAnnotations, action.payload);
            updateQueue(state);
        },
        reviewDescriptionAnnotation(state, action: PayloadAction<{ target: string; reviewResult: ReviewResult }>) {
            state.annotations.descriptionAnnotations[action.payload.target] = withToggledReviewer(
                state,
                state.annotations.descriptionAnnotations[action.payload.target],
                state.username,
                action.payload.reviewResult,
            );

            updateQueue(state);
        },
        upsertEnumAnnotation(state, action: PayloadAction<EnumAnnotation>) {
            updateCreationOrChangedCount(
                state,
                state.annotations.enumAnnotations[action.payload.target],
                action.payload,
            );

            state.annotations.enumAnnotations[action.payload.target] = withAuthorAndReviewers(
                state.annotations.enumAnnotations[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        removeEnumAnnotation(state, action: PayloadAction<string>) {
            removeAnnotation(state, state.annotations.enumAnnotations, action.payload);
            updateQueue(state);
        },
        reviewEnumAnnotation(state, action: PayloadAction<{ target: string; reviewResult: ReviewResult }>) {
            state.annotations.enumAnnotations[action.payload.target] = withToggledReviewer(
                state,
                state.annotations.enumAnnotations[action.payload.target],
                state.username,
                action.payload.reviewResult,
            );

            updateQueue(state);
        },
        upsertGroupAnnotation(
            state,
            action: PayloadAction<{ previousGroupName?: string; annotation: GroupAnnotation }>,
        ) {
            const oldAnnotation =
                state.annotations.groupAnnotations[action.payload.annotation.target][
                    action.payload.previousGroupName ?? ''
                ];

            if (!state.annotations.groupAnnotations[action.payload.annotation.target]) {
                state.annotations.groupAnnotations[action.payload.annotation.target] = {};
            } else {
                const targetGroups = state.annotations.groupAnnotations[action.payload.annotation.target];
                const otherGroupNames = Object.values(targetGroups)
                    .filter((group) => group.groupName !== action.payload.annotation.groupName)
                    .map((group) => group.groupName);

                for (const nameOfGroup of otherGroupNames) {
                    let needsChange = false;
                    const group = targetGroups[nameOfGroup];
                    const currentAnnotationParameter = action.payload.annotation.parameters;
                    const currentGroupParameter = [...group.parameters];
                    for (const parameter of currentAnnotationParameter) {
                        const index = currentGroupParameter.indexOf(parameter);
                        if (index > -1) {
                            needsChange = true;
                            currentGroupParameter.splice(index, 1);
                        }
                    }
                    if (currentGroupParameter.length < 1) {
                        removeGroupAnnotation({
                            target: action.payload.annotation.target,
                            groupName: group.groupName,
                        });
                    } else if (needsChange) {
                        state.annotations.groupAnnotations[group.target][group.groupName] = withAuthorAndReviewers(
                            state.annotations.groupAnnotations[group.target][group.groupName],
                            {
                                parameters: currentGroupParameter,
                                groupName: group.groupName,
                                target: group.target,
                            },
                            state.username,
                        );
                    }
                }
            }

            updateCreationOrChangedCount(state, oldAnnotation, action.payload.annotation);

            state.annotations.groupAnnotations[action.payload.annotation.target][action.payload.annotation.groupName] =
                withAuthorAndReviewers(oldAnnotation, action.payload.annotation, state.username);

            // Delete old annotation
            if (action.payload.previousGroupName !== action.payload.annotation.groupName) {
                delete state.annotations.groupAnnotations[action.payload.annotation.target][
                    action.payload.previousGroupName ?? ''
                ];
            }

            updateQueue(state);
        },
        removeGroupAnnotation(state, action: PayloadAction<GroupTarget>) {
            removeAnnotation(
                state,
                state.annotations.groupAnnotations[action.payload.target],
                action.payload.groupName,
            );

            if (Object.keys(state.annotations.groupAnnotations[action.payload.target]).length === 0) {
                delete state.annotations.groupAnnotations[action.payload.target];
                state.numberOfAnnotationsDeleted++;
            }

            updateQueue(state);
        },
        reviewGroupAnnotation(state, action: PayloadAction<{ target: GroupTarget; reviewResult: ReviewResult }>) {
            state.annotations.groupAnnotations[action.payload.target.target][action.payload.target.groupName] =
                withToggledReviewer(
                    state,
                    state.annotations.groupAnnotations[action.payload.target.target][action.payload.target.groupName],
                    state.username,
                    action.payload.reviewResult,
                );

            updateQueue(state);
        },
        upsertMoveAnnotation(state, action: PayloadAction<MoveAnnotation>) {
            updateCreationOrChangedCount(
                state,
                state.annotations.moveAnnotations[action.payload.target],
                action.payload,
            );

            state.annotations.moveAnnotations[action.payload.target] = withAuthorAndReviewers(
                state.annotations.moveAnnotations[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        upsertMoveAnnotations(state, action: PayloadAction<MoveAnnotation[]>) {
            action.payload.forEach((annotation) => {
                updateCreationOrChangedCount(state, state.annotations.moveAnnotations[annotation.target], annotation);

                state.annotations.moveAnnotations[annotation.target] = withAuthorAndReviewers(
                    state.annotations.moveAnnotations[annotation.target],
                    annotation,
                    state.username,
                );
            });

            updateQueue(state);
        },
        removeMoveAnnotation(state, action: PayloadAction<string>) {
            removeAnnotation(state, state.annotations.moveAnnotations, action.payload);
            updateQueue(state);
        },
        reviewMoveAnnotation(state, action: PayloadAction<{ target: string; reviewResult: ReviewResult }>) {
            state.annotations.moveAnnotations[action.payload.target] = withToggledReviewer(
                state,
                state.annotations.moveAnnotations[action.payload.target],
                state.username,
                action.payload.reviewResult,
            );

            updateQueue(state);
        },
        upsertPureAnnotation(state, action: PayloadAction<PureAnnotation>) {
            updateCreationOrChangedCount(
                state,
                state.annotations.pureAnnotations[action.payload.target],
                action.payload,
            );

            state.annotations.pureAnnotations[action.payload.target] = withAuthorAndReviewers(
                state.annotations.pureAnnotations[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        removePureAnnotation(state, action: PayloadAction<string>) {
            removeAnnotation(state, state.annotations.pureAnnotations, action.payload);
            updateQueue(state);
        },
        reviewPureAnnotation(state, action: PayloadAction<{ target: string; reviewResult: ReviewResult }>) {
            state.annotations.pureAnnotations[action.payload.target] = withToggledReviewer(
                state,
                state.annotations.pureAnnotations[action.payload.target],
                state.username,
                action.payload.reviewResult,
            );

            updateQueue(state);
        },
        upsertRemoveAnnotation(state, action: PayloadAction<RemoveAnnotation>) {
            updateCreationOrChangedCount(
                state,
                state.annotations.removeAnnotations[action.payload.target],
                action.payload,
            );

            state.annotations.removeAnnotations[action.payload.target] = withAuthorAndReviewers(
                state.annotations.removeAnnotations[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        upsertRemoveAnnotations(state, action: PayloadAction<RemoveAnnotation[]>) {
            action.payload.forEach((annotation) => {
                updateCreationOrChangedCount(state, state.annotations.removeAnnotations[annotation.target], annotation);

                state.annotations.removeAnnotations[annotation.target] = withAuthorAndReviewers(
                    state.annotations.removeAnnotations[annotation.target],
                    annotation,
                    state.username,
                );
            });

            updateQueue(state);
        },
        removeRemoveAnnotation(state, action: PayloadAction<string>) {
            removeAnnotation(state, state.annotations.removeAnnotations, action.payload);
            updateQueue(state);
        },
        reviewRemoveAnnotation(state, action: PayloadAction<{ target: string; reviewResult: ReviewResult }>) {
            state.annotations.removeAnnotations[action.payload.target] = withToggledReviewer(
                state,
                state.annotations.removeAnnotations[action.payload.target],
                state.username,
                action.payload.reviewResult,
            );

            updateQueue(state);
        },
        upsertRenameAnnotation(state, action: PayloadAction<RenameAnnotation>) {
            updateCreationOrChangedCount(
                state,
                state.annotations.renameAnnotations[action.payload.target],
                action.payload,
            );

            state.annotations.renameAnnotations[action.payload.target] = withAuthorAndReviewers(
                state.annotations.renameAnnotations[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        upsertRenameAnnotations(state, action: PayloadAction<RenameAnnotation[]>) {
            action.payload.forEach((annotation) => {
                updateCreationOrChangedCount(state, state.annotations.renameAnnotations[annotation.target], annotation);

                state.annotations.renameAnnotations[annotation.target] = withAuthorAndReviewers(
                    state.annotations.renameAnnotations[annotation.target],
                    annotation,
                    state.username,
                );
            });

            updateQueue(state);
        },
        removeRenameAnnotation(state, action: PayloadAction<string>) {
            removeAnnotation(state, state.annotations.renameAnnotations, action.payload);
            updateQueue(state);
        },
        reviewRenameAnnotation(state, action: PayloadAction<{ target: string; reviewResult: ReviewResult }>) {
            state.annotations.renameAnnotations[action.payload.target] = withToggledReviewer(
                state,
                state.annotations.renameAnnotations[action.payload.target],
                state.username,
                action.payload.reviewResult,
            );

            updateQueue(state);
        },
        upsertTodoAnnotation(state, action: PayloadAction<TodoAnnotation>) {
            updateCreationOrChangedCount(
                state,
                state.annotations.todoAnnotations[action.payload.target],
                action.payload,
            );

            state.annotations.todoAnnotations[action.payload.target] = withAuthorAndReviewers(
                state.annotations.todoAnnotations[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        removeTodoAnnotation(state, action: PayloadAction<string>) {
            removeAnnotation(state, state.annotations.todoAnnotations, action.payload);
            updateQueue(state);
        },
        reviewTodoAnnotation(state, action: PayloadAction<{ target: string; reviewResult: ReviewResult }>) {
            state.annotations.todoAnnotations[action.payload.target] = withToggledReviewer(
                state,
                state.annotations.todoAnnotations[action.payload.target],
                state.username,
                action.payload.reviewResult,
            );

            updateQueue(state);
        },
        upsertValueAnnotation(state, action: PayloadAction<ValueAnnotation>) {
            updateCreationOrChangedCount(
                state,
                state.annotations.valueAnnotations[action.payload.target],
                action.payload,
            );

            if (action.payload.variant === 'required' || action.payload.variant === 'omitted') {
                // @ts-ignore
                delete action.payload.defaultValue;
                // @ts-ignore
                delete action.payload.defaultValueType;
            }

            if (action.payload.defaultValueType === 'number' && typeof action.payload.defaultValue === 'string') {
                // @ts-ignore
                action.payload.defaultValue = parseFloat(action.payload.defaultValue);
            }

            state.annotations.valueAnnotations[action.payload.target] = withAuthorAndReviewers(
                state.annotations.valueAnnotations[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        upsertValueAnnotations(state, action: PayloadAction<ValueAnnotation[]>) {
            action.payload.forEach((annotation) => {
                updateCreationOrChangedCount(state, state.annotations.valueAnnotations[annotation.target], annotation);

                if (annotation.variant === 'required' || annotation.variant === 'omitted') {
                    // @ts-ignore
                    delete annotation.defaultValue;
                    // @ts-ignore
                    delete annotation.defaultValueType;
                }

                if (annotation.defaultValueType === 'number' && typeof annotation.defaultValue === 'string') {
                    // @ts-ignore
                    annotation.defaultValue = parseFloat(annotation.defaultValue);
                }

                state.annotations.valueAnnotations[annotation.target] = withAuthorAndReviewers(
                    state.annotations.valueAnnotations[annotation.target],
                    annotation,
                    state.username,
                );
            });

            updateQueue(state);
        },
        removeValueAnnotation(state, action: PayloadAction<string>) {
            removeAnnotation(state, state.annotations.valueAnnotations, action.payload);
            updateQueue(state);
        },
        reviewValueAnnotation(state, action: PayloadAction<{ target: string; reviewResult: ReviewResult }>) {
            state.annotations.valueAnnotations[action.payload.target] = withToggledReviewer(
                state,
                state.annotations.valueAnnotations[action.payload.target],
                state.username,
                action.payload.reviewResult,
            );

            updateQueue(state);
        },

        setUsername(state, action: PayloadAction<string>) {
            state.username = action.payload;
        },
    },
    extraReducers(builder) {
        builder.addCase(initializeAnnotations.fulfilled, (state, action) => action.payload);
    },
});

const removeAnnotation = (state: AnnotationSlice, parent: { [key: string]: Annotation }, key: string) => {
    const annotation = parent[key];
    if (!annotation) {
        return;
    }

    if (isAutogenerated(annotation)) {
        parent[key] = { ...annotation, isRemoved: true };
    } else {
        delete parent[key];
    }

    state.numberOfAnnotationsDeleted++;
};

const isAutogenerated = (annotation: Annotation) => {
    const authors = annotation.authors ?? [];
    return authors.includes('$autogen$');
};

const updateQueue = function (state: AnnotationSlice) {
    const annotations = JSON.parse(JSON.stringify(state.annotations)) as AnnotationStore;

    if (state.queueIndex >= maximumUndoHistoryLength - 2) {
        state.queue.shift();
        state.queueIndex = state.queueIndex - 1;
    }

    state.queue = [...state.queue.slice(0, state.queueIndex + 2), annotations];
    state.queueIndex = state.queueIndex + 1;
};

const updateCreationOrChangedCount = function (
    state: AnnotationSlice,
    oldAnnotation: Annotation | null,
    newAnnotation: Annotation,
) {
    if (oldAnnotation) {
        if (annotationWasChanged(oldAnnotation, newAnnotation)) {
            state.numberOfAnnotationsChanged++;
        }
    } else {
        state.numberOfAnnotationsCreated++;
    }
};

const withAuthorAndReviewers = function <T extends Annotation>(
    oldAnnotation: T | void,
    newAnnotation: T,
    author: string,
): T {
    let authors = oldAnnotation?.authors ?? [];
    const reviewers = oldAnnotation?.reviewers ?? [];

    if (!oldAnnotation || annotationWasChanged(oldAnnotation, newAnnotation)) {
        authors = [...authors.filter((it) => it !== author), author];
    }

    return {
        ...newAnnotation,
        authors,
        reviewers,
    };
};

const annotationWasChanged = function <T extends Annotation>(oldAnnotation: T, newAnnotation: T): boolean {
    // Unify the metadata, so we only compare the actual annotation data
    const oldAnnotationWithoutMetadata = annotationWithoutMetadata(oldAnnotation);
    const newAnnotationWithoutMetadata = annotationWithoutMetadata(newAnnotation);

    return !isEqual(oldAnnotationWithoutMetadata, newAnnotationWithoutMetadata);
};

const annotationWithoutMetadata = function <T extends Annotation>(annotation: T): T {
    return {
        ...annotation,
        authors: undefined,
        reviewers: undefined,
        reviewResult: undefined,
        comment: undefined,
    };
};

const withToggledReviewer = function <T extends Annotation>(
    state: AnnotationSlice,
    oldAnnotation: T,
    reviewer: string,
    reviewResult: ReviewResult,
): T {
    if ((oldAnnotation.reviewers?.length ?? 0) > 0 || oldAnnotation.reviewResult) {
        return {
            ...oldAnnotation,
            reviewers: [],
            reviewResult: null,
        };
    } else {
        state.numberOfAnnotationsMarkedAsCorrect++;
        return {
            ...oldAnnotation,
            reviewers: [reviewer],
            reviewResult,
        };
    }
};

const { actions, reducer } = annotationsSlice;
export const {
    setAnnotationStore,
    mergeAnnotationStore,
    resetAnnotationStore,

    upsertBoundaryAnnotation,
    removeBoundaryAnnotation,
    reviewBoundaryAnnotation,
    upsertCalledAfterAnnotation,
    removeCalledAfterAnnotation,
    reviewCalledAfterAnnotation,
    addComplete,
    removeComplete,
    toggleComplete,
    upsertDescriptionAnnotation,
    removeDescriptionAnnotation,
    reviewDescriptionAnnotation,
    upsertEnumAnnotation,
    removeEnumAnnotation,
    reviewEnumAnnotation,
    upsertGroupAnnotation,
    removeGroupAnnotation,
    reviewGroupAnnotation,
    upsertMoveAnnotation,
    upsertMoveAnnotations,
    removeMoveAnnotation,
    reviewMoveAnnotation,
    upsertPureAnnotation,
    removePureAnnotation,
    reviewPureAnnotation,
    upsertRemoveAnnotation,
    upsertRemoveAnnotations,
    removeRemoveAnnotation,
    reviewRemoveAnnotation,
    upsertRenameAnnotation,
    upsertRenameAnnotations,
    removeRenameAnnotation,
    reviewRenameAnnotation,
    upsertTodoAnnotation,
    removeTodoAnnotation,
    reviewTodoAnnotation,
    upsertValueAnnotation,
    upsertValueAnnotations,
    removeValueAnnotation,
    reviewValueAnnotation,

    undo,
    redo,

    setUsername,
} = actions;
export const annotationsReducer = reducer;

export const selectAnnotationSlice = (state: RootState) => state.annotations;
export const selectAnnotationStore = (state: RootState) => state.annotations.annotations;
export const selectBoundaryAnnotation =
    (target: string) =>
    (state: RootState): BoundaryAnnotation | undefined =>
        validAnnotation(selectAnnotationStore(state).boundaryAnnotations[target]);
export const selectCalledAfterAnnotations =
    (target: string) =>
    (state: RootState): { [calledAfter: string]: CalledAfterAnnotation } => {
        const candidates = selectAnnotationStore(state).calledAfterAnnotations[target] ?? {};
        const result: { [calledAfter: string]: CalledAfterAnnotation } = {};
        for (const [calledAfterName, calledAfter] of Object.entries(candidates)) {
            if (!calledAfter.isRemoved) {
                result[calledAfterName] = calledAfter;
            }
        }
        return result;
    };
export const selectComplete =
    (target: string) =>
    (state: RootState): CompleteAnnotation | undefined =>
        selectAnnotationStore(state).completeAnnotations[target];
export const selectDescriptionAnnotation =
    (target: string) =>
    (state: RootState): DescriptionAnnotation | undefined =>
        validAnnotation(selectAnnotationStore(state).descriptionAnnotations[target]);
export const selectEnumAnnotation =
    (target: string) =>
    (state: RootState): EnumAnnotation | undefined =>
        validAnnotation(selectAnnotationStore(state).enumAnnotations[target]);
export const selectGroupAnnotations =
    (target: string) =>
    (state: RootState): { [groupName: string]: GroupAnnotation } => {
        const candidates = selectAnnotationStore(state).groupAnnotations[target] ?? {};
        const result: { [groupName: string]: GroupAnnotation } = {};
        for (const [groupName, group] of Object.entries(candidates)) {
            if (!group.isRemoved) {
                result[groupName] = group;
            }
        }
        return result;
    };
export const selectMoveAnnotation =
    (target: string) =>
    (state: RootState): MoveAnnotation | undefined =>
        validAnnotation(selectAnnotationStore(state).moveAnnotations[target]);
export const selectPureAnnotation =
    (target: string) =>
    (state: RootState): PureAnnotation | undefined =>
        validAnnotation(selectAnnotationStore(state).pureAnnotations[target]);
export const selectRenameAnnotation =
    (target: string) =>
    (state: RootState): RenameAnnotation | undefined =>
        validAnnotation(selectAnnotationStore(state).renameAnnotations[target]);
export const selectRemoveAnnotation =
    (target: string) =>
    (state: RootState): RemoveAnnotation | undefined =>
        validAnnotation(selectAnnotationStore(state).removeAnnotations[target]);
export const selectTodoAnnotation =
    (target: string) =>
    (state: RootState): TodoAnnotation | undefined =>
        validAnnotation(selectAnnotationStore(state).todoAnnotations[target]);
export const selectValueAnnotation =
    (target: string) =>
    (state: RootState): ValueAnnotation | undefined =>
        validAnnotation(selectAnnotationStore(state).valueAnnotations[target]);

const validAnnotation = function <T extends Annotation>(annotation: T | undefined): T | undefined {
    if (annotation && !annotation.isRemoved) {
        return annotation;
    } else {
        return undefined;
    }
};
export const selectNumberOfAnnotationsOnTarget =
    (target: string) =>
    (state: RootState): number => {
        let result = 0;
        if (selectBoundaryAnnotation(target)(state)) {
            result++;
        }
        result += Object.keys(selectCalledAfterAnnotations(target)(state)).length;
        if (selectDescriptionAnnotation(target)(state)) {
            result++;
        }
        if (selectEnumAnnotation(target)(state)) {
            result++;
        }
        result += Object.keys(selectGroupAnnotations(target)(state)).length;
        if (selectMoveAnnotation(target)(state)) {
            result++;
        }
        if (selectPureAnnotation(target)(state)) {
            result++;
        }
        if (selectRemoveAnnotation(target)(state)) {
            result++;
        }
        if (selectRenameAnnotation(target)(state)) {
            result++;
        }
        if (selectTodoAnnotation(target)(state)) {
            result++;
        }
        if (selectValueAnnotation(target)(state)) {
            result++;
        }

        return result;
    };
export const selectAllAnnotationsOnTargets =
    (targets: string[]) =>
    (state: RootState): Annotation[] =>
        targets.flatMap((target) => selectAllAnnotationsOnTarget(target)(state));
const selectAllAnnotationsOnTarget =
    (target: string) =>
    (state: RootState): Annotation[] => {
        const boundaryAnnotation = selectBoundaryAnnotation(target)(state);
        const calledAfterAnnotations = selectCalledAfterAnnotations(target)(state);
        const descriptionAnnotation = selectDescriptionAnnotation(target)(state);
        const enumAnnotation = selectEnumAnnotation(target)(state);
        const groupAnnotations = selectGroupAnnotations(target)(state);
        const moveAnnotation = selectMoveAnnotation(target)(state);
        const pureAnnotation = selectPureAnnotation(target)(state);
        const removeAnnotation1 = selectRemoveAnnotation(target)(state);
        const renameAnnotation = selectRenameAnnotation(target)(state);
        const todoAnnotation = selectTodoAnnotation(target)(state);
        const valueAnnotation = selectValueAnnotation(target)(state);

        let result: Annotation[] = [];
        if (boundaryAnnotation) {
            result.push(boundaryAnnotation);
        }
        result.push(...Object.values(calledAfterAnnotations));
        if (descriptionAnnotation) {
            result.push(descriptionAnnotation);
        }
        if (enumAnnotation) {
            result.push(enumAnnotation);
        }
        result.push(...Object.values(groupAnnotations));
        if (moveAnnotation) {
            result.push(moveAnnotation);
        }
        if (pureAnnotation) {
            result.push(pureAnnotation);
        }
        if (removeAnnotation1) {
            result.push(removeAnnotation1);
        }
        if (renameAnnotation) {
            result.push(renameAnnotation);
        }
        if (todoAnnotation) {
            result.push(todoAnnotation);
        }
        if (valueAnnotation) {
            result.push(valueAnnotation);
        }

        return result;
    };
export const selectUsername = (state: RootState): string => selectAnnotationSlice(state).username;
export const selectUsernameIsValid = (state: RootState): boolean => isValidUsername(selectUsername(state));

export const selectNumberOfElementsMarkedAsComplete = (state: RootState): number =>
    selectAnnotationSlice(state).numberOfElementsMarkedAsComplete;
export const selectNumberOfAnnotationsMarkedAsCorrect = (state: RootState): number =>
    selectAnnotationSlice(state).numberOfAnnotationsMarkedAsCorrect;
export const selectNumberOfAnnotationsCreated = (state: RootState): number =>
    selectAnnotationSlice(state).numberOfAnnotationsCreated;
export const selectNumberOfAnnotationsChanged = (state: RootState): number =>
    selectAnnotationSlice(state).numberOfAnnotationsChanged;
export const selectNumberOfAnnotationsDeleted = (state: RootState): number =>
    selectAnnotationSlice(state).numberOfAnnotationsDeleted;

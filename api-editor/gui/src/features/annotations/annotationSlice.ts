import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as idb from 'idb-keyval';
import { RootState } from '../../app/store';
import { isValidUsername } from '../../common/util/validation';

export const EXPECTED_ANNOTATION_STORE_SCHEMA_VERSION = 1;
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

export interface AnnotationStore {
    attributes: {
        [target: string]: AttributeAnnotation;
    };
    boundaries: {
        [target: string]: BoundaryAnnotation;
    };
    calledAfters: {
        [target: string]: { [calledAfterName: string]: CalledAfterAnnotation };
    };
    completes: {
        [target: string]: CompleteAnnotation;
    };
    constants: {
        [target: string]: ConstantAnnotation;
    };
    descriptions: {
        [target: string]: DescriptionAnnotation;
    };
    enums: {
        [target: string]: EnumAnnotation;
    };
    groups: {
        [target: string]: { [groupName: string]: GroupAnnotation };
    };
    moves: {
        [target: string]: MoveAnnotation;
    };
    optionals: {
        [target: string]: OptionalAnnotation;
    };
    pures: {
        [target: string]: PureAnnotation;
    };
    renamings: {
        [target: string]: RenameAnnotation;
    };
    requireds: {
        [target: string]: RequiredAnnotation;
    };
    removes: {
        [target: string]: RemoveAnnotation;
    };
    todos: {
        [target: string]: TodoAnnotation;
    };
}

export interface VersionedAnnotationStore extends AnnotationStore {
    schemaVersion?: number;
}

export interface Annotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;

    /**
     * Usernames of people who created or changed the annotation.
     */
    readonly authors?: string[];

    /**
     * Usernames of people who marked the annotation as correct.
     */
    readonly reviewers?: string[];
}

export interface AttributeAnnotation extends Annotation {
    /**
     * Type of default value
     */
    readonly defaultType: DefaultType;

    /**
     * Default value
     */
    readonly defaultValue: DefaultValue;
}

export type DefaultType = 'string' | 'number' | 'boolean' | 'none';
export type DefaultValue = string | number | boolean | null;

export interface BoundaryAnnotation extends Annotation {
    /**
     * The interval specifying possible numeric values
     */
    readonly interval: Interval;
}

export interface Interval {
    /**
     * Whether the type of the interval is discrete or continuous
     */
    readonly isDiscrete: boolean;

    /**
     * Lower interval limit
     */
    readonly lowerIntervalLimit: number;

    /**
     * Whether the lower interval limit is inclusive or exclusive
     */
    readonly lowerLimitType: ComparisonOperator;

    /**
     * Upper interval limit
     */
    readonly upperIntervalLimit: number;

    /**
     * Whether the upper interval limit is inclusive or exclusive
     */
    readonly upperLimitType: ComparisonOperator;
}

export enum ComparisonOperator {
    LESS_THAN_OR_EQUALS,
    LESS_THAN,
    UNRESTRICTED,
}

export interface CalledAfterAnnotation extends Annotation {
    /**
     * Name of the callable to be called first
     */
    readonly calledAfterName: string;
}

export interface CalledAfterTarget {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;

    /**
     * Name of the callable to be called first
     */
    readonly calledAfterName: string;
}

/**
 * The element is fully annotated and all annotations are checked.
 *
 * **Important:** While this is implemented as an annotation it should **not** be counted in the heat map or the
 * statistics.
 */
export interface CompleteAnnotation extends Annotation {}

export interface ConstantAnnotation extends Annotation {
    /**
     * Type of default value
     */
    readonly defaultType: DefaultType;

    /**
     * Default value
     */
    readonly defaultValue: DefaultValue;
}

export interface DescriptionAnnotation extends Annotation {
    /**
     * Description for the declaration.
     */
    readonly newDescription: string;
}

export interface EnumAnnotation extends Annotation {
    /**
     * Name of the enum class that should be created.
     */
    readonly enumName: string;
    readonly pairs: EnumPair[];
}

export interface EnumPair {
    readonly stringValue: string;
    readonly instanceName: string;
}

export interface GroupAnnotation extends Annotation {
    /**
     * Name of the grouped object
     */
    readonly groupName: string;

    /**
     * Parameters to group
     */
    readonly parameters: string[];
}

export interface GroupTarget {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;

    /**
     * Name of the grouped object
     */
    readonly groupName: string;
}

export interface MoveAnnotation extends Annotation {
    /**
     * Qualified path to the destination
     */
    readonly destination: string;
}

export interface OptionalAnnotation extends Annotation {
    /**
     * Type of default value
     */
    readonly defaultType: DefaultType;

    /**
     * Default value
     */
    readonly defaultValue: DefaultValue;
}

export interface PureAnnotation extends Annotation {}

export interface RenameAnnotation extends Annotation {
    /**
     * New name for the declaration.
     */
    readonly newName: string;
}

export interface RequiredAnnotation extends Annotation {}

export interface RemoveAnnotation extends Annotation {}

export interface TodoAnnotation extends Annotation {
    /**
     * A Todo for the declaration.
     */
    readonly newTodo: string;
}

// Initial state -------------------------------------------------------------------------------------------------------

export const initialAnnotationStore: AnnotationStore = {
    attributes: {},
    boundaries: {},
    calledAfters: {},
    completes: {},
    constants: {},
    descriptions: {},
    enums: {},
    groups: {},
    moves: {},
    optionals: {},
    pures: {},
    renamings: {},
    requireds: {},
    removes: {},
    todos: {},
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
            for (const annotationType of Object.keys(action.payload)) {
                if (annotationType === 'calledAfters' || annotationType === 'groups') {
                    for (const target of Object.keys(action.payload[annotationType])) {
                        // @ts-ignore
                        state.annotations[annotationType][target] = {
                            // @ts-ignore
                            ...(state.annotations[annotationType][target] ?? {}),
                            // @ts-ignore
                            ...action.payload[annotationType][target],
                        };
                    }
                } else {
                    // @ts-ignore
                    state.annotations[annotationType] = {
                        // @ts-ignore
                        ...state.annotations[annotationType],
                        // @ts-ignore
                        ...action.payload[annotationType],
                    };
                }
            }

            updateQueue(state);
        },
        resetAnnotationStore(state) {
            state.annotations = initialAnnotationStore;

            updateQueue(state);
        },
        upsertAttribute(state, action: PayloadAction<AttributeAnnotation>) {
            state.annotations.attributes[action.payload.target] = withAuthorAndReviewers(
                state.annotations.attributes[action.payload.target],
                action.payload,
                state.username,
            );

            delete state.annotations.constants[action.payload.target];
            delete state.annotations.optionals[action.payload.target];
            delete state.annotations.requireds[action.payload.target];

            updateQueue(state);
        },
        removeAttribute(state, action: PayloadAction<string>) {
            delete state.annotations.attributes[action.payload];
            state.numberOfAnnotationsDeleted++;

            updateQueue(state);
        },
        reviewAttribute(state, action: PayloadAction<string>) {
            state.annotations.attributes[action.payload] = withToggledReviewer(
                state.annotations.attributes[action.payload],
                state.username,
            );
            state.numberOfAnnotationsMarkedAsCorrect++;

            updateQueue(state);
        },
        upsertBoundary(state, action: PayloadAction<BoundaryAnnotation>) {
            state.annotations.boundaries[action.payload.target] = withAuthorAndReviewers(
                state.annotations.boundaries[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        removeBoundary(state, action: PayloadAction<string>) {
            delete state.annotations.boundaries[action.payload];
            state.numberOfAnnotationsDeleted++;

            updateQueue(state);
        },
        reviewBoundary(state, action: PayloadAction<string>) {
            state.annotations.boundaries[action.payload] = withToggledReviewer(
                state.annotations.boundaries[action.payload],
                state.username,
            );
            state.numberOfAnnotationsMarkedAsCorrect++;

            updateQueue(state);
        },
        upsertCalledAfter(state, action: PayloadAction<CalledAfterAnnotation>) {
            if (!state.annotations.calledAfters[action.payload.target]) {
                state.annotations.calledAfters[action.payload.target] = {};
            }
            state.annotations.calledAfters[action.payload.target][action.payload.calledAfterName] =
                withAuthorAndReviewers(
                    state.annotations.calledAfters[action.payload.target][action.payload.calledAfterName],
                    action.payload,
                    state.username,
                );
            updateQueue(state);
        },
        removeCalledAfter(state, action: PayloadAction<CalledAfterTarget>) {
            delete state.annotations.calledAfters[action.payload.target][action.payload.calledAfterName];
            if (Object.keys(state.annotations.calledAfters[action.payload.target]).length === 0) {
                delete state.annotations.calledAfters[action.payload.target];
                state.numberOfAnnotationsDeleted++;
            }

            updateQueue(state);
        },
        reviewCalledAfter(state, action: PayloadAction<CalledAfterTarget>) {
            state.annotations.calledAfters[action.payload.target][action.payload.calledAfterName] = withToggledReviewer(
                state.annotations.calledAfters[action.payload.target][action.payload.calledAfterName],
                state.username,
            );
            state.numberOfAnnotationsMarkedAsCorrect++;

            updateQueue(state);
        },
        addComplete(state, action: PayloadAction<CompleteAnnotation>) {
            state.annotations.completes[action.payload.target] = withAuthorAndReviewers(
                state.annotations.completes[action.payload.target],
                action.payload,
                state.username,
            );
            state.numberOfElementsMarkedAsComplete++;

            updateQueue(state);
        },
        removeComplete(state, action: PayloadAction<string>) {
            delete state.annotations.completes[action.payload];
            // We don't update numberOfAnnotationsDeleted deliberately

            updateQueue(state);
        },
        toggleComplete(state, action: PayloadAction<string>) {
            if (state.annotations.completes[action.payload]) {
                delete state.annotations.completes[action.payload];
            } else {
                state.annotations.completes[action.payload] = withAuthorAndReviewers(
                    state.annotations.completes[action.payload],
                    { target: action.payload },
                    state.username,
                );
                state.numberOfElementsMarkedAsComplete++;
            }

            updateQueue(state);
        },
        // Cannot review complete annotations
        upsertConstant(state, action: PayloadAction<ConstantAnnotation>) {
            state.annotations.constants[action.payload.target] = withAuthorAndReviewers(
                state.annotations.constants[action.payload.target],
                action.payload,
                state.username,
            );

            delete state.annotations.attributes[action.payload.target];
            delete state.annotations.optionals[action.payload.target];
            delete state.annotations.requireds[action.payload.target];

            updateQueue(state);
        },
        upsertConstants(state, action: PayloadAction<ConstantAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.annotations.constants[annotation.target] = withAuthorAndReviewers(
                    state.annotations.constants[annotation.target],
                    annotation,
                    state.username,
                );

                delete state.annotations.attributes[annotation.target];
                delete state.annotations.optionals[annotation.target];
                delete state.annotations.requireds[annotation.target];
            });

            updateQueue(state);
        },
        removeConstant(state, action: PayloadAction<string>) {
            delete state.annotations.constants[action.payload];
            state.numberOfAnnotationsDeleted++;

            updateQueue(state);
        },
        reviewConstant(state, action: PayloadAction<string>) {
            state.annotations.constants[action.payload] = withToggledReviewer(
                state.annotations.constants[action.payload],
                state.username,
            );
            state.numberOfAnnotationsMarkedAsCorrect++;

            updateQueue(state);
        },
        upsertDescription(state, action: PayloadAction<DescriptionAnnotation>) {
            state.annotations.descriptions[action.payload.target] = withAuthorAndReviewers(
                state.annotations.descriptions[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        removeDescription(state, action: PayloadAction<string>) {
            delete state.annotations.descriptions[action.payload];
            state.numberOfAnnotationsDeleted++;

            updateQueue(state);
        },
        reviewDescription(state, action: PayloadAction<string>) {
            state.annotations.descriptions[action.payload] = withToggledReviewer(
                state.annotations.descriptions[action.payload],
                state.username,
            );
            state.numberOfAnnotationsMarkedAsCorrect++;

            updateQueue(state);
        },
        upsertEnum(state, action: PayloadAction<EnumAnnotation>) {
            state.annotations.enums[action.payload.target] = withAuthorAndReviewers(
                state.annotations.enums[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        removeEnum(state, action: PayloadAction<string>) {
            delete state.annotations.enums[action.payload];
            state.numberOfAnnotationsDeleted++;

            updateQueue(state);
        },
        reviewEnum(state, action: PayloadAction<string>) {
            state.annotations.enums[action.payload] = withToggledReviewer(
                state.annotations.enums[action.payload],
                state.username,
            );
            state.numberOfAnnotationsMarkedAsCorrect++;

            updateQueue(state);
        },
        upsertGroup(state, action: PayloadAction<GroupAnnotation>) {
            if (!state.annotations.groups[action.payload.target]) {
                state.annotations.groups[action.payload.target] = {};
            } else {
                const targetGroups = state.annotations.groups[action.payload.target];
                const otherGroupNames = Object.values(targetGroups)
                    .filter((group) => group.groupName !== action.payload.groupName)
                    .map((group) => group.groupName);

                for (const nameOfGroup of otherGroupNames) {
                    let needsChange = false;
                    const group = targetGroups[nameOfGroup];
                    const currentAnnotationParameter = action.payload.parameters;
                    const currentGroupParameter = [...group.parameters];
                    for (const parameter of currentAnnotationParameter) {
                        const index = currentGroupParameter.indexOf(parameter);
                        if (index > -1) {
                            needsChange = true;
                            currentGroupParameter.splice(index, 1);
                        }
                    }
                    if (currentGroupParameter.length < 1) {
                        removeGroup({
                            target: action.payload.target,
                            groupName: group.groupName,
                        });
                    } else if (needsChange) {
                        state.annotations.groups[group.target][group.groupName] = withAuthorAndReviewers(
                            state.annotations.groups[group.target][group.groupName],
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
            state.annotations.groups[action.payload.target][action.payload.groupName] = withAuthorAndReviewers(
                state.annotations.groups[action.payload.target][action.payload.groupName],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        removeGroup(state, action: PayloadAction<GroupTarget>) {
            delete state.annotations.groups[action.payload.target][action.payload.groupName];
            if (Object.keys(state.annotations.groups[action.payload.target]).length === 0) {
                delete state.annotations.groups[action.payload.target];
                state.numberOfAnnotationsDeleted++;
            }

            updateQueue(state);
        },
        reviewGroup(state, action: PayloadAction<GroupTarget>) {
            state.annotations.groups[action.payload.target][action.payload.groupName] = withToggledReviewer(
                state.annotations.groups[action.payload.target][action.payload.groupName],
                state.username,
            );
            state.numberOfAnnotationsMarkedAsCorrect++;

            updateQueue(state);
        },
        upsertMove(state, action: PayloadAction<MoveAnnotation>) {
            state.annotations.moves[action.payload.target] = withAuthorAndReviewers(
                state.annotations.moves[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        upsertMoves(state, action: PayloadAction<MoveAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.annotations.moves[annotation.target] = withAuthorAndReviewers(
                    state.annotations.moves[annotation.target],
                    annotation,
                    state.username,
                );
            });

            updateQueue(state);
        },
        removeMove(state, action: PayloadAction<string>) {
            delete state.annotations.moves[action.payload];
            state.numberOfAnnotationsDeleted++;

            updateQueue(state);
        },
        reviewMove(state, action: PayloadAction<string>) {
            state.annotations.moves[action.payload] = withToggledReviewer(
                state.annotations.moves[action.payload],
                state.username,
            );
            state.numberOfAnnotationsMarkedAsCorrect++;

            updateQueue(state);
        },
        upsertOptional(state, action: PayloadAction<OptionalAnnotation>) {
            state.annotations.optionals[action.payload.target] = withAuthorAndReviewers(
                state.annotations.optionals[action.payload.target],
                action.payload,
                state.username,
            );

            delete state.annotations.attributes[action.payload.target];
            delete state.annotations.constants[action.payload.target];
            delete state.annotations.requireds[action.payload.target];

            updateQueue(state);
        },
        upsertOptionals(state, action: PayloadAction<OptionalAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.annotations.optionals[annotation.target] = withAuthorAndReviewers(
                    state.annotations.optionals[annotation.target],
                    annotation,
                    state.username,
                );

                delete state.annotations.attributes[annotation.target];
                delete state.annotations.constants[annotation.target];
                delete state.annotations.requireds[annotation.target];
            });

            updateQueue(state);
        },
        removeOptional(state, action: PayloadAction<string>) {
            delete state.annotations.optionals[action.payload];
            state.numberOfAnnotationsDeleted++;

            updateQueue(state);
        },
        reviewOptional(state, action: PayloadAction<string>) {
            state.annotations.optionals[action.payload] = withToggledReviewer(
                state.annotations.optionals[action.payload],
                state.username,
            );
            state.numberOfAnnotationsMarkedAsCorrect++;

            updateQueue(state);
        },
        addPure(state, action: PayloadAction<PureAnnotation>) {
            state.annotations.pures[action.payload.target] = withAuthorAndReviewers(
                state.annotations.pures[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        removePure(state, action: PayloadAction<string>) {
            delete state.annotations.pures[action.payload];
            state.numberOfAnnotationsDeleted++;

            updateQueue(state);
        },
        reviewPure(state, action: PayloadAction<string>) {
            state.annotations.pures[action.payload] = withToggledReviewer(
                state.annotations.pures[action.payload],
                state.username,
            );
            state.numberOfAnnotationsMarkedAsCorrect++;

            updateQueue(state);
        },
        upsertRenaming(state, action: PayloadAction<RenameAnnotation>) {
            state.annotations.renamings[action.payload.target] = withAuthorAndReviewers(
                state.annotations.renamings[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        upsertRenamings(state, action: PayloadAction<RenameAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.annotations.renamings[annotation.target] = withAuthorAndReviewers(
                    state.annotations.renamings[annotation.target],
                    annotation,
                    state.username,
                );
            });

            updateQueue(state);
        },
        removeRenaming(state, action: PayloadAction<string>) {
            delete state.annotations.renamings[action.payload];
            state.numberOfAnnotationsDeleted++;

            updateQueue(state);
        },
        reviewRenaming(state, action: PayloadAction<string>) {
            state.annotations.renamings[action.payload] = withToggledReviewer(
                state.annotations.renamings[action.payload],
                state.username,
            );
            state.numberOfAnnotationsMarkedAsCorrect++;

            updateQueue(state);
        },
        addRequired(state, action: PayloadAction<RequiredAnnotation>) {
            state.annotations.requireds[action.payload.target] = withAuthorAndReviewers(
                state.annotations.requireds[action.payload.target],
                action.payload,
                state.username,
            );

            delete state.annotations.attributes[action.payload.target];
            delete state.annotations.constants[action.payload.target];
            delete state.annotations.optionals[action.payload.target];

            updateQueue(state);
        },
        addRequireds(state, action: PayloadAction<RequiredAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.annotations.requireds[annotation.target] = withAuthorAndReviewers(
                    state.annotations.requireds[annotation.target],
                    annotation,
                    state.username,
                );

                delete state.annotations.attributes[annotation.target];
                delete state.annotations.constants[annotation.target];
                delete state.annotations.optionals[annotation.target];
            });

            updateQueue(state);
        },
        removeRequired(state, action: PayloadAction<string>) {
            delete state.annotations.requireds[action.payload];
            state.numberOfAnnotationsDeleted++;

            updateQueue(state);
        },
        reviewRequired(state, action: PayloadAction<string>) {
            state.annotations.requireds[action.payload] = withToggledReviewer(
                state.annotations.requireds[action.payload],
                state.username,
            );
            state.numberOfAnnotationsMarkedAsCorrect++;

            updateQueue(state);
        },
        addRemove(state, action: PayloadAction<RemoveAnnotation>) {
            state.annotations.removes[action.payload.target] = withAuthorAndReviewers(
                state.annotations.removes[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        upsertRemoves(state, action: PayloadAction<RemoveAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.annotations.removes[annotation.target] = withAuthorAndReviewers(
                    state.annotations.removes[annotation.target],
                    annotation,
                    state.username,
                );
            });

            updateQueue(state);
        },
        removeRemove(state, action: PayloadAction<string>) {
            delete state.annotations.removes[action.payload];
            state.numberOfAnnotationsDeleted++;

            updateQueue(state);
        },
        reviewRemove(state, action: PayloadAction<string>) {
            state.annotations.removes[action.payload] = withToggledReviewer(
                state.annotations.removes[action.payload],
                state.username,
            );
            state.numberOfAnnotationsMarkedAsCorrect++;

            updateQueue(state);
        },
        upsertTodo(state, action: PayloadAction<TodoAnnotation>) {
            state.annotations.todos[action.payload.target] = withAuthorAndReviewers(
                state.annotations.todos[action.payload.target],
                action.payload,
                state.username,
            );

            updateQueue(state);
        },
        removeTodo(state, action: PayloadAction<string>) {
            delete state.annotations.todos[action.payload];
            state.numberOfAnnotationsDeleted++;

            updateQueue(state);
        },
        reviewTodo(state, action: PayloadAction<string>) {
            state.annotations.todos[action.payload] = withToggledReviewer(
                state.annotations.todos[action.payload],
                state.username,
            );
            state.numberOfAnnotationsMarkedAsCorrect++;

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

const updateQueue = function (state: AnnotationSlice) {
    const annotations = JSON.parse(JSON.stringify(state.annotations)) as AnnotationStore;

    if (state.queueIndex >= maximumUndoHistoryLength - 2) {
        state.queue.shift();
        state.queueIndex = state.queueIndex - 1;
    }

    state.queue = [...state.queue.slice(0, state.queueIndex + 2), annotations];
    state.queueIndex = state.queueIndex + 1;
};

const withAuthorAndReviewers = function <T extends Annotation>(
    oldAnnotation: T | void,
    newAnnotation: T,
    author: string,
): T {
    let authors = oldAnnotation?.authors ?? [];
    const reviewers = oldAnnotation?.reviewers ?? [];

    authors = [...authors.filter((it) => it !== author), author];

    return {
        ...newAnnotation,
        authors,
        reviewers,
    };
};

const withToggledReviewer = function <T extends Annotation>(oldAnnotation: T, reviewer: string): T {
    if (oldAnnotation.reviewers?.includes(reviewer) ?? false) {
        return {
            ...oldAnnotation,
            reviewers: [],
        };
    } else {
        return {
            ...oldAnnotation,
            reviewers: [reviewer],
        };
    }
};

const { actions, reducer } = annotationsSlice;
export const {
    setAnnotationStore,
    mergeAnnotationStore,
    resetAnnotationStore,

    upsertAttribute,
    removeAttribute,
    reviewAttribute,
    upsertBoundary,
    removeBoundary,
    reviewBoundary,
    upsertCalledAfter,
    removeCalledAfter,
    reviewCalledAfter,
    addComplete,
    removeComplete,
    toggleComplete,
    upsertConstant,
    upsertConstants,
    removeConstant,
    reviewConstant,
    upsertDescription,
    removeDescription,
    reviewDescription,
    upsertEnum,
    removeEnum,
    reviewEnum,
    upsertGroup,
    removeGroup,
    reviewGroup,
    upsertMove,
    upsertMoves,
    removeMove,
    reviewMove,
    upsertOptional,
    upsertOptionals,
    removeOptional,
    reviewOptional,
    addPure,
    removePure,
    reviewPure,
    upsertRenaming,
    upsertRenamings,
    removeRenaming,
    reviewRenaming,
    addRequired,
    addRequireds,
    removeRequired,
    reviewRequired,
    upsertTodo,
    removeTodo,
    reviewTodo,
    addRemove,
    upsertRemoves,
    removeRemove,
    reviewRemove,

    undo,
    redo,

    setUsername,
} = actions;
export const annotationsReducer = reducer;

export const selectAnnotationSlice = (state: RootState) => state.annotations;
export const selectAnnotationStore = (state: RootState) => state.annotations.annotations;
export const selectAttribute =
    (target: string) =>
    (state: RootState): AttributeAnnotation | undefined =>
        selectAnnotationStore(state).attributes[target];
export const selectBoundary =
    (target: string) =>
    (state: RootState): BoundaryAnnotation | undefined =>
        selectAnnotationStore(state).boundaries[target];
export const selectCalledAfters =
    (target: string) =>
    (state: RootState): { [calledAfter: string]: CalledAfterAnnotation } =>
        selectAnnotationStore(state).calledAfters[target] ?? {};
export const selectComplete =
    (target: string) =>
    (state: RootState): CompleteAnnotation | undefined =>
        selectAnnotationStore(state).completes[target];
export const selectConstant =
    (target: string) =>
    (state: RootState): ConstantAnnotation | undefined =>
        selectAnnotationStore(state).constants[target];
export const selectDescription =
    (target: string) =>
    (state: RootState): DescriptionAnnotation | undefined =>
        selectAnnotationStore(state).descriptions[target];
export const selectEnum =
    (target: string) =>
    (state: RootState): EnumAnnotation | undefined =>
        selectAnnotationStore(state).enums[target];
export const selectGroups =
    (target: string) =>
    (state: RootState): { [groupName: string]: GroupAnnotation } =>
        selectAnnotationStore(state).groups[target] ?? {};
export const selectMove =
    (target: string) =>
    (state: RootState): MoveAnnotation | undefined =>
        selectAnnotationStore(state).moves[target];
export const selectOptional =
    (target: string) =>
    (state: RootState): OptionalAnnotation | undefined =>
        selectAnnotationStore(state).optionals[target];
export const selectPure =
    (target: string) =>
    (state: RootState): PureAnnotation | undefined =>
        selectAnnotationStore(state).pures[target];
export const selectRenaming =
    (target: string) =>
    (state: RootState): RenameAnnotation | undefined =>
        selectAnnotationStore(state).renamings[target];
export const selectRequired =
    (target: string) =>
    (state: RootState): RequiredAnnotation | undefined =>
        selectAnnotationStore(state).requireds[target];
export const selectRemove =
    (target: string) =>
    (state: RootState): RemoveAnnotation | undefined =>
        selectAnnotationStore(state).removes[target];
export const selectTodo =
    (target: string) =>
    (state: RootState): TodoAnnotation | undefined =>
        selectAnnotationStore(state).todos[target];
export const selectNumberOfAnnotationsOnTarget =
    (target: string) =>
    (state: RootState): number => {
        return Object.entries(selectAnnotationStore(state)).reduce((acc, [annotationType, annotations]) => {
            if (annotationType === 'completes') {
                return acc;
            } else if (target in annotations) {
                return acc + 1;
            } else {
                return acc;
            }
        }, 0);
    };
export const selectAllAnnotationsOnTargets =
    (targets: string[]) =>
    (state: RootState): Annotation[] =>
        targets.flatMap((target) => selectAllAnnotationsOnTarget(target)(state));
const selectAllAnnotationsOnTarget =
    (target: string) =>
    (state: RootState): Annotation[] => {
        return Object.entries(selectAnnotationStore(state)).flatMap(([annotationType, targetToAnnotations]) => {
            switch (annotationType) {
                case 'completes':
                    return [];
                case 'calledAfters':
                case 'groups':
                    return Object.values(targetToAnnotations[target] ?? {});
                default:
                    return targetToAnnotations[target] ?? [];
            }
        });
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

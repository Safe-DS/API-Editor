import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as idb from 'idb-keyval';
import { RootState } from '../../app/store';

/**
 * How many annotations can be applied to a class at once.
 */
export const maximumNumberOfClassAnnotations = 5;

/**
 * How many annotations can be applied to a function at once.
 */
export const maximumNumberOfFunctionAnnotations = 7;

/**
 * How many annotations can be applied to a parameter at once.
 */
export const maximumNumberOfParameterAnnotations = 8;

const maximumUndoHistoryLength = 10;

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

export interface AnnotationSlice {
    annotations: AnnotationStore;
    queue: AnnotationStore[];
    queueIndex: number;
}

export interface AttributeAnnotation {
    /**
     * ID of the annotated Python declaration
     */
    readonly target: string;

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

export interface BoundaryAnnotation {
    /**
     * ID of the annotated Python declaration
     */
    readonly target: string;

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

export interface CalledAfterAnnotation {
    /**
     * ID of the annotated Python declaration
     */
    readonly target: string;

    /**
     * Name of the callable to be called first
     */
    readonly calledAfterName: string;
}

export interface CalledAfterTarget {
    /**
     * ID of the annotated Python declaration
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
export interface CompleteAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;
}

export interface ConstantAnnotation {
    /**
     * ID of the annotated Python declaration
     */
    readonly target: string;

    /**
     * Type of default value
     */
    readonly defaultType: DefaultType;

    /**
     * Default value
     */
    readonly defaultValue: DefaultValue;
}

export interface DescriptionAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;

    /**
     * Description for the declaration.
     */
    readonly newDescription: string;
}

export interface EnumAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    target: string;

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

export interface GroupAnnotation {
    /**
     * ID of the annotated Python declaration
     */
    readonly target: string;

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
     * ID of the annotated Python declaration
     */
    readonly target: string;

    /**
     * Name of the grouped object
     */
    readonly groupName: string;
}

export interface MoveAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;

    /**
     * Qualified path to the destination
     */
    readonly destination: string;
}

export interface OptionalAnnotation {
    /**
     * ID of the annotated Python declaration
     */
    readonly target: string;

    /**
     * Type of default value
     */
    readonly defaultType: DefaultType;

    /**
     * Default value
     */
    readonly defaultValue: DefaultValue;
}

export interface PureAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;
}

export interface RenameAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;

    /**
     * New name for the declaration.
     */
    readonly newName: string;
}

export interface RequiredAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;
}

export interface RemoveAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;
}

export interface TodoAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;

    /**
     * A Todo for the declaration.
     */
    readonly newTodo: string;
}

// Initial state -------------------------------------------------------------------------------------------------------

export const initialAnnotationStore = {
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

export const initialState: AnnotationSlice = {
    annotations: initialAnnotationStore,
    queue: [initialAnnotationStore],
    /** The index that contains the state after an undo */
    queueIndex: -1,
};

// Thunks --------------------------------------------------------------------------------------------------------------

export const initializeAnnotations = createAsyncThunk('annotations/initialize', async () => {
    try {
        const storedAnnotations = (await idb.get('annotations')) as AnnotationSlice;
        return {
            ...initialState,
            ...storedAnnotations,
        };
    } catch {
        return initialState;
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
    initialState,
    reducers: {
        undo(state) {
            if (0 <= state.queueIndex && state.queueIndex < state.queue.length) {
                return {
                    annotations: state.queue[state.queueIndex],
                    queue: state.queue,
                    queueIndex: state.queueIndex - 1,
                };
            }
            return state;
        },
        redo(state) {
            if (-1 <= state.queueIndex && state.queueIndex + 2 < state.queue.length) {
                return {
                    annotations: state.queue[state.queueIndex + 2],
                    queue: state.queue,
                    queueIndex: state.queueIndex + 1,
                };
            }
            return state;
        },
        setAnnotations(_state, action: PayloadAction<AnnotationStore>) {
            return {
                ...initialState,
                annotations: action.payload,
            };
        },
        mergeAnnotations(state, action: PayloadAction<AnnotationStore>) {
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
        },
        resetAnnotations() {
            return initialState;
        },
        upsertAttribute(state, action: PayloadAction<AttributeAnnotation>) {
            state.annotations.attributes[action.payload.target] = action.payload;

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        removeAttribute(state, action: PayloadAction<string>) {
            delete state.annotations.attributes[action.payload];

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        upsertBoundary(state, action: PayloadAction<BoundaryAnnotation>) {
            state.annotations.boundaries[action.payload.target] = action.payload;

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        removeBoundary(state, action: PayloadAction<string>) {
            delete state.annotations.boundaries[action.payload];

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        upsertCalledAfter(state, action: PayloadAction<CalledAfterAnnotation>) {
            if (!state.annotations.calledAfters[action.payload.target]) {
                state.annotations.calledAfters[action.payload.target] = {};
            }
            state.annotations.calledAfters[action.payload.target][action.payload.calledAfterName] = action.payload;

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        removeCalledAfter(state, action: PayloadAction<CalledAfterTarget>) {
            delete state.annotations.calledAfters[action.payload.target][action.payload.calledAfterName];
            if (Object.keys(state.annotations.calledAfters[action.payload.target]).length === 0) {
                delete state.annotations.calledAfters[action.payload.target];
            }

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        addComplete(state, action: PayloadAction<CompleteAnnotation>) {
            state.annotations.completes[action.payload.target] = action.payload;
        },
        removeComplete(state, action: PayloadAction<string>) {
            delete state.annotations.completes[action.payload];
        },
        upsertConstant(state, action: PayloadAction<ConstantAnnotation>) {
            state.annotations.constants[action.payload.target] = action.payload;

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        upsertConstants(state, action: PayloadAction<ConstantAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.constants[annotation.target] = annotation;
            });
        },
        removeConstant(state, action: PayloadAction<string>) {
            delete state.annotations.constants[action.payload];

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        upsertDescription(state, action: PayloadAction<DescriptionAnnotation>) {
            state.annotations.descriptions[action.payload.target] = action.payload;

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        removeDescription(state, action: PayloadAction<string>) {
            delete state.annotations.descriptions[action.payload];

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        upsertEnum(state, action: PayloadAction<EnumAnnotation>) {
            state.annotations.enums[action.payload.target] = action.payload;

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        removeEnum(state, action: PayloadAction<string>) {
            delete state.annotations.enums[action.payload];

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
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
                        state.annotations.groups[group.target][group.groupName] = {
                            parameters: currentGroupParameter,
                            groupName: group.groupName,
                            target: group.target,
                        };
                    }
                }
            }
            state.annotations.groups[action.payload.target][action.payload.groupName] = action.payload;

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        removeGroup(state, action: PayloadAction<GroupTarget>) {
            delete state.annotations.groups[action.payload.target][action.payload.groupName];
            if (Object.keys(state.annotations.groups[action.payload.target]).length === 0) {
                delete state.annotations.groups[action.payload.target];
            }

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        upsertMove(state, action: PayloadAction<MoveAnnotation>) {
            state.annotations.moves[action.payload.target] = action.payload;

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        upsertMoves(state, action: PayloadAction<MoveAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.moves[annotation.target] = annotation;
            });
        },
        removeMove(state, action: PayloadAction<string>) {
            delete state.annotations.moves[action.payload];

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        upsertOptional(state, action: PayloadAction<OptionalAnnotation>) {
            state.annotations.optionals[action.payload.target] = action.payload;

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        upsertOptionals(state, action: PayloadAction<OptionalAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.optionals[annotation.target] = annotation;
            });
        },
        removeOptional(state, action: PayloadAction<string>) {
            delete state.annotations.optionals[action.payload];

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        addPure(state, action: PayloadAction<PureAnnotation>) {
            state.annotations.pures[action.payload.target] = action.payload;

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        removePure(state, action: PayloadAction<string>) {
            delete state.annotations.pures[action.payload];

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        upsertRenaming(state, action: PayloadAction<RenameAnnotation>) {
            state.annotations.renamings[action.payload.target] = action.payload;

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        upsertRenamings(state, action: PayloadAction<RenameAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.renamings[annotation.target] = annotation;
            });
        },
        removeRenaming(state, action: PayloadAction<string>) {
            delete state.annotations.renamings[action.payload];

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        addRequired(state, action: PayloadAction<RequiredAnnotation>) {
            state.annotations.requireds[action.payload.target] = action.payload;

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        upsertRequireds(state, action: PayloadAction<RequiredAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.requireds[annotation.target] = annotation;
            });
        },
        removeRequired(state, action: PayloadAction<string>) {
            delete state.annotations.requireds[action.payload];

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        addRemove(state, action: PayloadAction<RemoveAnnotation>) {
            state.annotations.removes[action.payload.target] = action.payload;

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        upsertRemoves(state, action: PayloadAction<RemoveAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.removes[annotation.target] = annotation;
            });
        },
        removeRemove(state, action: PayloadAction<string>) {
            delete state.annotations.removes[action.payload];

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        upsertTodo(state, action: PayloadAction<TodoAnnotation>) {
            state.annotations.todos[action.payload.target] = action.payload;

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
        removeTodo(state, action: PayloadAction<string>) {
            delete state.annotations.todos[action.payload];

            const [newQueue, newQueueIndex] = updatedQueue(state);
            state.queue = newQueue;
            state.queueIndex = newQueueIndex;
        },
    },
    extraReducers(builder) {
        builder.addCase(initializeAnnotations.fulfilled, (state, action) => action.payload);
    },
});

const updatedQueue = function (state: AnnotationSlice): [AnnotationStore[], number] {
    const annotations = JSON.parse(JSON.stringify(state.annotations));

    if (state.queueIndex >= maximumUndoHistoryLength - 2) {
        state.queue.shift();
        state.queueIndex = state.queueIndex - 1;
    }

    return [[...state.queue.slice(0, state.queueIndex + 2), annotations], state.queueIndex + 1];
};

const { actions, reducer } = annotationsSlice;
export const {
    setAnnotations,
    mergeAnnotations,
    resetAnnotations,

    upsertAttribute,
    removeAttribute,
    upsertBoundary,
    removeBoundary,
    upsertCalledAfter,
    removeCalledAfter,
    addComplete,
    removeComplete,
    upsertConstant,
    upsertConstants,
    removeConstant,
    upsertDescription,
    removeDescription,
    upsertEnum,
    removeEnum,
    upsertGroup,
    removeGroup,
    upsertMove,
    upsertMoves,
    removeMove,
    upsertOptional,
    upsertOptionals,
    removeOptional,
    addPure,
    removePure,
    upsertRenaming,
    upsertRenamings,
    removeRenaming,
    addRequired,
    upsertRequireds,
    removeRequired,
    upsertTodo,
    removeTodo,
    addRemove,
    upsertRemoves,
    removeRemove,
    undo,
    redo,
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
export const selectNumberOfAnnotations =
    (target: string) =>
    (state: RootState): number => {
        return Object.values(selectAnnotationStore(state)).reduce((acc, annotations) => {
            if (target in annotations) {
                return acc + 1;
            } else {
                return acc;
            }
        }, 0);
    };

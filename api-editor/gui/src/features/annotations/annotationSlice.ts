import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as idb from 'idb-keyval';
import { RootState } from '../../app/store';
import PythonDeclaration from "../packageData/model/PythonDeclaration";

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
    constants: {
        [target: string]: ConstantAnnotation;
    };
    descriptions: {
        [target: string]: DescriptionAnnotation;
    };
    dones: {
        [target: string]: DoneAnnotation;
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

/**
 * The element is fully annotated and all annotations are checked.
 *
 * **Important:** While this is implemented as an annotation it should **not** be counted in the heat map or the
 * statistics.
 */
export interface DoneAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;
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

export const initialState: AnnotationStore = {
    attributes: {},
    boundaries: {},
    calledAfters: {},
    constants: {},
    descriptions: {},
    dones: {},
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

// Thunks --------------------------------------------------------------------------------------------------------------

export const initializeAnnotations = createAsyncThunk('annotations/initialize', async () => {
    try {
        const storedAnnotations = (await idb.get('annotations')) as AnnotationStore;
        return {
            ...initialState,
            ...storedAnnotations,
        };
    } catch {
        return initialState;
    }
});

export const persistAnnotations = createAsyncThunk('annotations/persist', async (state: AnnotationStore) => {
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
        setAnnotations(_state, action: PayloadAction<AnnotationStore>) {
            return {
                ...initialState,
                ...action.payload,
            };
        },
        mergeAnnotations(state, action: PayloadAction<AnnotationStore>) {
            for (const annotationType of Object.keys(action.payload)) {
                if (annotationType === 'calledAfters' || annotationType === 'groups') {
                    for (const target of Object.keys(action.payload[annotationType])) {
                        // @ts-ignore
                        state[annotationType][target] = {
                            // @ts-ignore
                            ...(state[annotationType][target] ?? {}),
                            // @ts-ignore
                            ...action.payload[annotationType][target],
                        };
                    }
                } else {
                    // @ts-ignore
                    state[annotationType] = {
                        // @ts-ignore
                        ...state[annotationType],
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
            state.attributes[action.payload.target] = action.payload;
        },
        removeAttribute(state, action: PayloadAction<string>) {
            delete state.attributes[action.payload];
        },
        upsertBoundary(state, action: PayloadAction<BoundaryAnnotation>) {
            state.boundaries[action.payload.target] = action.payload;
        },
        removeBoundary(state, action: PayloadAction<string>) {
            delete state.boundaries[action.payload];
        },
        upsertCalledAfter(state, action: PayloadAction<CalledAfterAnnotation>) {
            if (!state.calledAfters[action.payload.target]) {
                state.calledAfters[action.payload.target] = {};
            }
            state.calledAfters[action.payload.target][action.payload.calledAfterName] = action.payload;
        },
        removeCalledAfter(state, action: PayloadAction<CalledAfterTarget>) {
            delete state.calledAfters[action.payload.target][action.payload.calledAfterName];
            if (Object.keys(state.calledAfters[action.payload.target]).length === 0) {
                delete state.calledAfters[action.payload.target];
            }
        },
        upsertConstant(state, action: PayloadAction<ConstantAnnotation>) {
            state.constants[action.payload.target] = action.payload;
        },
        upsertConstants(state, action: PayloadAction<ConstantAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.constants[annotation.target] = annotation;
            });
        },
        removeConstant(state, action: PayloadAction<string>) {
            delete state.constants[action.payload];
        },
        upsertDescription(state, action: PayloadAction<DescriptionAnnotation>) {
            state.descriptions[action.payload.target] = action.payload;
        },
        removeDescription(state, action: PayloadAction<string>) {
            delete state.descriptions[action.payload];
        },
        addDone(state, action: PayloadAction<DoneAnnotation>) {
            state.dones[action.payload.target] = action.payload;
        },
        removeDone(state, action: PayloadAction<string>) {
            delete state.dones[action.payload];
        },
        upsertEnum(state, action: PayloadAction<EnumAnnotation>) {
            state.enums[action.payload.target] = action.payload;
        },
        removeEnum(state, action: PayloadAction<string>) {
            delete state.enums[action.payload];
        },
        upsertGroup(state, action: PayloadAction<GroupAnnotation>) {
            if (!state.groups[action.payload.target]) {
                state.groups[action.payload.target] = {};
            } else {
                const targetGroups = state.groups[action.payload.target];
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
                        state.groups[group.target][group.groupName] = {
                            parameters: currentGroupParameter,
                            groupName: group.groupName,
                            target: group.target,
                        };
                    }
                }
            }
            state.groups[action.payload.target][action.payload.groupName] = action.payload;
        },
        removeGroup(state, action: PayloadAction<GroupTarget>) {
            delete state.groups[action.payload.target][action.payload.groupName];
            if (Object.keys(state.groups[action.payload.target]).length === 0) {
                delete state.groups[action.payload.target];
            }
        },
        upsertMove(state, action: PayloadAction<MoveAnnotation>) {
            state.moves[action.payload.target] = action.payload;
        },
        upsertMoves(state, action: PayloadAction<MoveAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.moves[annotation.target] = annotation;
            });
        },
        removeMove(state, action: PayloadAction<string>) {
            delete state.moves[action.payload];
        },
        upsertOptional(state, action: PayloadAction<OptionalAnnotation>) {
            state.optionals[action.payload.target] = action.payload;
        },
        upsertOptionals(state, action: PayloadAction<OptionalAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.optionals[annotation.target] = annotation;
            });
        },
        removeOptional(state, action: PayloadAction<string>) {
            delete state.optionals[action.payload];
        },
        addPure(state, action: PayloadAction<PureAnnotation>) {
            state.pures[action.payload.target] = action.payload;
        },
        removePure(state, action: PayloadAction<string>) {
            delete state.pures[action.payload];
        },
        upsertRenaming(state, action: PayloadAction<RenameAnnotation>) {
            state.renamings[action.payload.target] = action.payload;
        },
        upsertRenamings(state, action: PayloadAction<RenameAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.renamings[annotation.target] = annotation;
            });
        },
        removeRenaming(state, action: PayloadAction<string>) {
            delete state.renamings[action.payload];
        },
        batchAnnotateRename(state, action: PayloadAction<PythonDeclaration[]>) {
            const newRenamings: { [p: string]: RenameAnnotation } = {};
            for (const declaration of action.payload) {
                newRenamings[declaration.name] = {
                    target: "",//TODO übergeben und fixen
                    newName: "",//TODO
                };
            }
            state.renamings = {
                ...state.renamings,
                ...newRenamings,
            };
        },
        addRequired(state, action: PayloadAction<RequiredAnnotation>) {
            state.requireds[action.payload.target] = action.payload;
        },
        addRequireds(state, action: PayloadAction<RequiredAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.requireds[annotation.target] = annotation;
            });
        },
        removeRequired(state, action: PayloadAction<string>) {
            delete state.requireds[action.payload];
        },
        addRemove(state, action: PayloadAction<RemoveAnnotation>) {
            state.removes[action.payload.target] = action.payload;
        },
        addRemoves(state, action: PayloadAction<RemoveAnnotation[]>) {
            action.payload.forEach((annotation) => {
                state.removes[annotation.target] = annotation;
            });
        },
        removeRemove(state, action: PayloadAction<string>) {
            delete state.removes[action.payload];
        },
        upsertTodo(state, action: PayloadAction<TodoAnnotation>) {
            state.todos[action.payload.target] = action.payload;
        },
        removeTodo(state, action: PayloadAction<string>) {
            delete state.todos[action.payload];
        },
    },
    extraReducers(builder) {
        builder.addCase(initializeAnnotations.fulfilled, (state, action) => action.payload);
    },
});

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
    upsertConstant,
    removeConstant,
    upsertDescription,
    removeDescription,
    addDone,
    removeDone,
    upsertEnum,
    removeEnum,
    upsertGroup,
    removeGroup,
    upsertMove,
    removeMove,
    upsertOptional,
    removeOptional,
    addPure,
    removePure,
    upsertRenaming,
    removeRenaming,
    addRequired,
    removeRequired,
    upsertTodo,
    removeTodo,
    addRemove,
    removeRemove,
} = actions;
export const annotationsReducer = reducer;

export const selectAnnotations = (state: RootState) => state.annotations;
export const selectAttribute =
    (target: string) =>
    (state: RootState): AttributeAnnotation | undefined =>
        selectAnnotations(state).attributes[target];
export const selectBoundary =
    (target: string) =>
    (state: RootState): BoundaryAnnotation | undefined =>
        selectAnnotations(state).boundaries[target];
export const selectCalledAfters =
    (target: string) =>
    (state: RootState): { [calledAfter: string]: CalledAfterAnnotation } =>
        selectAnnotations(state).calledAfters[target] ?? {};
export const selectConstant =
    (target: string) =>
    (state: RootState): ConstantAnnotation | undefined =>
        selectAnnotations(state).constants[target];
export const selectDescription =
    (target: string) =>
    (state: RootState): DescriptionAnnotation | undefined =>
        selectAnnotations(state).descriptions[target];
export const selectDone =
    (target: string) =>
    (state: RootState): DoneAnnotation | undefined =>
        selectAnnotations(state).dones[target];
export const selectEnum =
    (target: string) =>
    (state: RootState): EnumAnnotation | undefined =>
        selectAnnotations(state).enums[target];
export const selectGroups =
    (target: string) =>
    (state: RootState): { [groupName: string]: GroupAnnotation } =>
        selectAnnotations(state).groups[target] ?? {};
export const selectMove =
    (target: string) =>
    (state: RootState): MoveAnnotation | undefined =>
        selectAnnotations(state).moves[target];
export const selectOptional =
    (target: string) =>
    (state: RootState): OptionalAnnotation | undefined =>
        selectAnnotations(state).optionals[target];
export const selectPure =
    (target: string) =>
    (state: RootState): PureAnnotation | undefined =>
        selectAnnotations(state).pures[target];
export const selectRenaming =
    (target: string) =>
    (state: RootState): RenameAnnotation | undefined =>
        selectAnnotations(state).renamings[target];
export const selectRequired =
    (target: string) =>
    (state: RootState): RequiredAnnotation | undefined =>
        selectAnnotations(state).requireds[target];
export const selectRemove =
    (target: string) =>
    (state: RootState): RemoveAnnotation | undefined =>
        selectAnnotations(state).removes[target];
export const selectTodo =
    (target: string) =>
    (state: RootState): TodoAnnotation | undefined =>
        selectAnnotations(state).todos[target];
export const selectNumberOfAnnotations =
    (target: string) =>
    (state: RootState): number => {
        return Object.values(selectAnnotations(state)).reduce((acc, annotations) => {
            if (target in annotations) {
                return acc + 1;
            } else {
                return acc;
            }
        }, 0);
    };

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as idb from 'idb-keyval';
import { RootState } from '../../app/store';

export interface AnnotationsState {
    constants: {
        [target: string]: ConstantAnnotation;
    };
    currentUserAction: UserAction;
    enums: {
        [target: string]: EnumAnnotation;
    };
    groups: {
        [target: string]: GroupAnnotation;
    }
    optionals: {
        [target: string]: OptionalAnnotation;
    };
    renamings: {
        [target: string]: RenameAnnotation;
    };
    requireds: {
        [target: string]: RequiredAnnotation;
    };
    unuseds: {
        [target: string]: UnusedAnnotation;
    };
    showImportDialog: boolean;
}

interface ConstantAnnotation {
    /**
     * ID of the annotated Python declaration
     */
    readonly target: string;

    /**
     * Type of default value
     */
    readonly defaultType: string;

    /**
     * Default value
     */
    readonly defaultValue: string | number | boolean;
}

interface GroupAnnotation {
    /**
     * ID of the annotated Python declaration
     */
    readonly target: string;

    /**
     * Name of the grouped object
     */
    readonly groupName: string,

    /**
     * Parameters to group
     */
    readonly parameters: string[];
}

interface EnumAnnotation {
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

interface EnumPair {
    readonly stringValue: string;
    readonly instanceName: string;
}

interface OptionalAnnotation {
    /**
     * ID of the annotated Python declaration
     */
    readonly target: string;

    /**
     * Type of default value
     */
    readonly defaultType: string;

    /**
     * Default value
     */
    readonly defaultValue: string | number | boolean;
}

interface RenameAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;

    /**
     * New name for the declaration.
     */
    readonly newName: string;
}

interface RequiredAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;
}

interface UnusedAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;
}

type UserAction =
    | typeof NoUserAction
    | ConstantUserAction
    | EnumUserAction
    | RenameUserAction
    | OptionalUserAction;

const NoUserAction = {
    type: 'none',
    target: '',
};

interface ConstantUserAction {
    readonly type: 'optional';
    readonly target: string;
}

interface EnumUserAction {
    readonly type: 'enum';
    readonly target: string;
}

interface OptionalUserAction {
    readonly type: 'optional';
    readonly target: string;
}

interface RenameUserAction {
    readonly type: 'rename';
    readonly target: string;
}

// Initial state -------------------------------------------------------------------------------------------------------

const initialState: AnnotationsState = {
    constants: {},
    currentUserAction: NoUserAction,
    enums: {},
    groups: {},
    optionals: {},
    renamings: {},
    requireds: {},
    showImportDialog: false,
    unuseds: {},
};

// Thunks --------------------------------------------------------------------------------------------------------------

export const initializeAnnotations = createAsyncThunk(
    'annotations/initialize',
    async () => {
        try {
            return (await idb.get('annotations')) as AnnotationsState;
        } catch {
            return initialState;
        }
    },
);

// Slice ---------------------------------------------------------------------------------------------------------------

const annotationsSlice = createSlice({
    name: 'annotations',
    initialState,
    reducers: {
        set(_state, action: PayloadAction<AnnotationsState>) {
            return action.payload;
        },
        reset() {
            return initialState;
        },
        upsertConstant(state, action: PayloadAction<ConstantAnnotation>) {
            state.constants[action.payload.target] = action.payload;
        },
        removeConstant(state, action: PayloadAction<string>) {
            delete state.constants[action.payload];
        },
        upsertEnum(state, action: PayloadAction<EnumAnnotation>) {
            state.enums[action.payload.target] = action.payload;
        },
        removeEnum(state, action: PayloadAction<string>) {
            delete state.enums[action.payload];
        },
        upsertGroup(state, action: PayloadAction<GroupAnnotation>) {
            state.groups[action.payload.target] = action.payload;
        },
        removeGroup(state, action: PayloadAction<string>) {
            delete state.groups[action.payload];
        },
        upsertOptional(state, action: PayloadAction<OptionalAnnotation>) {
            state.optionals[action.payload.target] = action.payload;
        },
        removeOptional(state, action: PayloadAction<string>) {
            delete state.optionals[action.payload];
        },
        upsertRenaming(state, action: PayloadAction<RenameAnnotation>) {
            state.renamings[action.payload.target] = action.payload;
        },
        removeRenaming(state, action: PayloadAction<string>) {
            delete state.renamings[action.payload];
        },
        addRequired(state, action: PayloadAction<RequiredAnnotation>) {
            state.requireds[action.payload.target] = action.payload;
        },
        removeRequired(state, action: PayloadAction<string>) {
            delete state.requireds[action.payload];
        },
        addUnused(state, action: PayloadAction<UnusedAnnotation>) {
            state.unuseds[action.payload.target] = action.payload;
        },
        removeUnused(state, action: PayloadAction<string>) {
            delete state.unuseds[action.payload];
        },
        showConstantAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'constant',
                target: action.payload,
            };
        },
        showGroupAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'group',
                target: action.payload,
            };
        },
        showEnumAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'enum',
                target: action.payload,
            };
        },
        showOptionalAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'optional',
                target: action.payload,
            };
        },
        showRenameAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'rename',
                target: action.payload,
            };
        },
        hideAnnotationForms(state) {
            state.currentUserAction = NoUserAction;
        },
        toggleImportDialog(state) {
            state.showImportDialog = !state.showImportDialog;
        },
    },
    extraReducers(builder) {
        builder.addCase(
            initializeAnnotations.fulfilled,
            (state, action) => action.payload,
        );
    },
});

const { actions, reducer } = annotationsSlice;
export const {
    set: setAnnotations,
    reset: resetAnnotations,

    upsertConstant,
    removeConstant,
    upsertEnum,
    removeEnum,
    upsertGroup,
    removeGroup,
    upsertOptional,
    removeOptional,
    upsertRenaming,
    removeRenaming,
    addRequired,
    removeRequired,
    addUnused,
    removeUnused,

    showConstantAnnotationForm,
    showEnumAnnotationForm,
    showGroupAnnotationForm,
    showOptionalAnnotationForm,
    showRenameAnnotationForm,
    hideAnnotationForms,

    toggleImportDialog: toggleAnnotationImportDialog,
} = actions;
export default reducer;

export const selectAnnotations = (state: RootState) => state.annotations;
export const selectConstant =
    (target: string) =>
    (state: RootState): ConstantAnnotation | undefined =>
        selectAnnotations(state).constants[target];
export const selectCurrentUserAction = (state: RootState): UserAction =>
    selectAnnotations(state).currentUserAction;
export const selectEnum =
    (target: string) =>
    (state: RootState): EnumAnnotation | undefined =>
        selectAnnotations(state).enums[target];
export const selectGroups =
    (target: string) =>
        (state: RootState): GroupAnnotation | undefined =>
            selectAnnotations(state).groups[target];
export const selectOptional =
    (target: string) =>
    (state: RootState): OptionalAnnotation | undefined =>
        selectAnnotations(state).optionals[target];
export const selectRenaming =
    (target: string) =>
    (state: RootState): RenameAnnotation | undefined =>
        selectAnnotations(state).renamings[target];
export const selectRequired =
    (target: string) =>
    (state: RootState): RequiredAnnotation | undefined =>
        selectAnnotations(state).requireds[target];
export const selectShowAnnotationImportDialog = (state: RootState): boolean =>
    selectAnnotations(state).showImportDialog;
export const selectUnused =
    (target: string) =>
    (state: RootState): UnusedAnnotation | undefined =>
        selectAnnotations(state).unuseds[target];

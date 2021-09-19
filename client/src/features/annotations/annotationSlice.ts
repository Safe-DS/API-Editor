import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as idb from 'idb-keyval';
import { RootState } from '../../app/store';

export interface AnnotationsState {
    enums: {
        [target: string]: EnumAnnotation;
    };
    renamings: {
        [target: string]: RenameAnnotation;
    };
    unuseds: {
        [target: string]: UnusedAnnotation;
    };
    requireds: {
        [target: string]: RequiredAnnotation;
    };
    optionals: {
        [target: string]: OptionalAnnotation;
    };
    currentUserAction: UserAction;
    showImportDialog: boolean;
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

interface UnusedAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;
}

interface RequiredAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string;
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

type UserAction =
    | typeof NoUserAction
    | EnumUserAction
    | RenameUserAction
    | OptionalUserAction;

const NoUserAction = {
    type: 'none',
    target: '',
};

interface EnumUserAction {
    readonly type: 'enum';
    readonly target: string;
}

interface RenameUserAction {
    readonly type: 'rename';
    readonly target: string;
}

interface OptionalUserAction {
    readonly type: 'optional';
    readonly target: string;
}

// Initial state -------------------------------------------------------------------------------------------------------

const initialState: AnnotationsState = {
    enums: {},
    renamings: {},
    unuseds: {},
    requireds: {},
    optionals: {},
    currentUserAction: NoUserAction,
    showImportDialog: false,
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
        upsertEnum(state, action: PayloadAction<EnumAnnotation>) {
            state.enums[action.payload.target] = action.payload;
        },
        removeEnum(state, action: PayloadAction<string>) {
            delete state.enums[action.payload];
        },
        upsertRenaming(state, action: PayloadAction<RenameAnnotation>) {
            state.renamings[action.payload.target] = action.payload;
        },
        removeRenaming(state, action: PayloadAction<string>) {
            delete state.renamings[action.payload];
        },
        upsertOptional(state, action: PayloadAction<OptionalAnnotation>) {
            state.optionals[action.payload.target] = action.payload;
        },
        removeOptional(state, action: PayloadAction<string>) {
            delete state.optionals[action.payload];
        },
        addUnused(state, action: PayloadAction<UnusedAnnotation>) {
            state.unuseds[action.payload.target] = action.payload;
        },
        removeUnused(state, action: PayloadAction<string>) {
            delete state.unuseds[action.payload];
        },
        addRequired(state, action: PayloadAction<RequiredAnnotation>) {
            state.requireds[action.payload.target] = action.payload;
        },
        removeRequired(state, action: PayloadAction<string>) {
            delete state.requireds[action.payload];
        },
        showEnumAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'enum',
                target: action.payload,
            };
        },
        showRenameAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'rename',
                target: action.payload,
            };
        },
        showOptionalAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'optional',
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

    upsertEnum,
    removeEnum,
    upsertRenaming,
    removeRenaming,
    addUnused,
    removeUnused,
    addRequired,
    removeRequired,
    upsertOptional,
    removeOptional,

    showEnumAnnotationForm,
    showRenameAnnotationForm,
    showOptionalAnnotationForm,
    hideAnnotationForms,

    toggleImportDialog: toggleAnnotationImportDialog,
} = actions;
export default reducer;

export const selectAnnotations = (state: RootState) => state.annotations;
export const selectEnum =
    (target: string) =>
    (state: RootState): EnumAnnotation | undefined =>
        selectAnnotations(state).enums[target];
export const selectRenaming =
    (target: string) =>
    (state: RootState): RenameAnnotation | undefined =>
        selectAnnotations(state).renamings[target];
export const selectUnused =
    (target: string) =>
    (state: RootState): UnusedAnnotation | undefined =>
        selectAnnotations(state).unuseds[target];
export const selectRequired =
    (target: string) =>
    (state: RootState): RequiredAnnotation | undefined =>
        selectAnnotations(state).requireds[target];
export const selectOptional =
    (target: string) =>
    (state: RootState): OptionalAnnotation | undefined =>
        selectAnnotations(state).optionals[target];
export const selectCurrentUserAction = (state: RootState): UserAction =>
    selectAnnotations(state).currentUserAction;
export const selectShowAnnotationImportDialog = (state: RootState): boolean =>
    selectAnnotations(state).showImportDialog;

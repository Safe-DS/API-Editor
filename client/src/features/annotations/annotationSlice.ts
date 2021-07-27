import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import * as idb from 'idb-keyval'
import { RootState } from '../../app/store'

interface AnnotationsState {
    enums: {
        [target: string]: EnumAnnotation
    }
    renamings: {
        [target: string]: RenameAnnotation
    }
    unuseds: {
        [target: string]: UnusedAnnotation
    }
    currentUserAction: UserAction
}

interface EnumAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    target: string

    /**
     * Name of the enum class that should be created.
     */
    readonly enumName: string
    readonly pairs: EnumPair[]
}

interface EnumPair {
    readonly stringValue: string
    readonly instanceName: string
}

interface RenameAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string

    /**
     * New name for the declaration.
     */
    readonly newName: string
}

interface UnusedAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string
}

type UserAction = typeof NoUserAction | EnumUserAction | RenameUserAction

const NoUserAction = {
    type: 'none',
    target: '',
}

interface EnumUserAction {
    readonly type: 'enum'
    readonly target: string
}

interface RenameUserAction {
    readonly type: 'rename'
    readonly target: string
}

// Initial state -------------------------------------------------------------------------------------------------------

const initialState: AnnotationsState = {
    enums: {},
    renamings: {},
    unuseds: {},
    currentUserAction: NoUserAction,
}

// Thunks --------------------------------------------------------------------------------------------------------------

export const initializeAnnotations = createAsyncThunk('annotations/initialize', async () => {
    return (await idb.get('annotations')) as AnnotationsState
})

// Slice ---------------------------------------------------------------------------------------------------------------

const annotationsSlice = createSlice({
    name: 'annotations',
    initialState,
    reducers: {
        set(_state, action: PayloadAction<AnnotationsState>) {
            return action.payload
        },
        reset() {
            return initialState
        },
        upsertEnum(state, action: PayloadAction<EnumAnnotation>) {
            state.enums[action.payload.target] = action.payload
        },
        removeEnum(state, action: PayloadAction<string>) {
            delete state.enums[action.payload]
        },
        upsertRenaming(state, action: PayloadAction<RenameAnnotation>) {
            state.renamings[action.payload.target] = action.payload
        },
        removeRenaming(state, action: PayloadAction<string>) {
            delete state.renamings[action.payload]
        },
        addUnused(state, action: PayloadAction<UnusedAnnotation>) {
            state.unuseds[action.payload.target] = action.payload
        },
        removeUnused(state, action: PayloadAction<string>) {
            delete state.unuseds[action.payload]
        },
        showEnumAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'enum',
                target: action.payload,
            }
        },
        showRenameAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'rename',
                target: action.payload,
            }
        },
        hideAnnotationForms(state) {
            state.currentUserAction = NoUserAction
        },
    },
    extraReducers: (builder) => {
        builder.addCase(initializeAnnotations.fulfilled, (state, action) => {
            return action.payload
        })
    },
})

const { actions, reducer } = annotationsSlice
export const {
    set: setAnnotations,
    reset: resetAnnotations,

    upsertEnum,
    removeEnum,
    upsertRenaming,
    removeRenaming,
    addUnused,
    removeUnused,

    showEnumAnnotationForm,
    showRenameAnnotationForm,
    hideAnnotationForms,
} = actions
export default reducer

const selectAnnotations = (state: RootState) => state.annotations
export const selectEnum =
    (target: string) =>
    (state: RootState): EnumAnnotation | undefined =>
        selectAnnotations(state).enums[target]
export const selectRenaming =
    (target: string) =>
    (state: RootState): RenameAnnotation | undefined =>
        selectAnnotations(state).renamings[target]
export const selectUnused =
    (target: string) =>
    (state: RootState): UnusedAnnotation | undefined =>
        selectAnnotations(state).unuseds[target]
export const selectCurrentUserAction = (state: RootState): UserAction => selectAnnotations(state).currentUserAction

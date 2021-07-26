import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import * as idb from 'idb-keyval'
import { RootState } from '../../app/store'

export interface AnnotationsState {
    enums: {
        [target: string]: EnumAnnotation
    }
    renamings: {
        [target: string]: RenameAnnotation
    }
    currentUserAction: UserAction
}

export interface EnumAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    target: string

    /**
     * Name of the enum class that should be created.
     */
    readonly enumName: string
    readonly enumPairs: EnumPair[]
}

export interface EnumPair {
    stringValue: string // TODO: should be readonly
    instanceName: string // TODO: should be readonly
}

export interface RenameAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    readonly target: string

    /**
     * New name for the declaration.
     */
    readonly newName: string
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
        set(_state, action: PayloadAction<AnnotationsState>) {
            return action.payload
        },
        reset() {
            return initialState
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
    upsertEnum,
    removeEnum,
    upsertRenaming,
    removeRenaming,
    set: setAnnotations,
    reset: resetAnnotations,
    showEnumAnnotationForm,
    showRenameAnnotationForm,
    hideAnnotationForms,
} = actions
export default reducer

const selectAnnotations = (state: RootState) => state.annotations
export const selectEnum =
    (target: string) =>
    (state: RootState): EnumAnnotation | void =>
        selectAnnotations(state).enums[target]
export const selectRenaming =
    (target: string) =>
    (state: RootState): RenameAnnotation | void =>
        selectAnnotations(state).renamings[target]
export const selectCurrentUserAction = (state: RootState): UserAction => selectAnnotations(state).currentUserAction

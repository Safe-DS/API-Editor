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
}

export interface EnumAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    target: string

    /**
     * Name of the enum class that should be created.
     */
    enumName: string
    enumPairs: EnumPair[]
}

export interface EnumPair {
    stringValue: string
    instanceName: string
}

export interface RenameAnnotation {
    /**
     * ID of the annotated Python declaration.
     */
    target: string

    /**
     * New name for the declaration.
     */
    newName: string
}

// Initial state -------------------------------------------------------------------------------------------------------

const initialState: AnnotationsState = {
    enums: {},
    renamings: {},
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

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
}

interface EnumAnnotation {
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

interface EnumPair {
    stringValue: string
    instanceName: string
}

interface RenameAnnotation {
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

export const initialize = createAsyncThunk('annotations/initialize', async () => {
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
    },
    extraReducers: (builder) => {
        builder.addCase(initialize.fulfilled, (state, action) => {
            return action.payload
        })
    },
})

const { actions, reducer } = annotationsSlice
export const { upsertEnum, removeEnum, upsertRenaming, removeRenaming } = actions
export default reducer

const selectAnnotations = (state: RootState) => state.annotations
export const selectEnum = (id: string) => (state: RootState) => selectAnnotations(state).enums[id]
export const selectRenaming = (id: string) => (state: RootState) => selectAnnotations(state).renamings[id]

// TODO: use createSelector whenever a computation actually is expensive (and only then)
// See https://react-redux.js.org/api/hooks#using-memoizing-selectors

// TODO: this should probably also contain the python package, since it only contains the annotations for the current
//  python package? or we could store all annotations so we can work on multiple packages in parallel? in the latter case
//  the separation would actually make sense. the latter case would be a decent idea if we also support to load multiple
//  python packages at once

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

export interface ApiDataState {
    expandedInTreeView: {
        [target: string]: true
    }
    showImportDialog: boolean
}

// Initial state -------------------------------------------------------------------------------------------------------

const initialState: ApiDataState = {
    expandedInTreeView: {},
    showImportDialog: false,
}

// Slice ---------------------------------------------------------------------------------------------------------------

const apiDataSlice = createSlice({
    name: 'apiData',
    initialState,
    reducers: {
        toggleExpandedInTreeView(state, action: PayloadAction<string>) {
            if (state.expandedInTreeView[action.payload]) {
                delete state.expandedInTreeView[action.payload]
            } else {
                state.expandedInTreeView[action.payload] = true
            }
        },
        toggleImportDialog(state) {
            state.showImportDialog = !state.showImportDialog
        },
    },
})

const { actions, reducer } = apiDataSlice
export const { toggleImportDialog: toggleApiDataImportDialog } = actions
export default reducer

const selectApiData = (state: RootState) => state.apiData
export const selectIsExpandedInTreeView =
    (target: string) =>
    (state: RootState): boolean =>
        Boolean(selectApiData(state).expandedInTreeView[target])
export const selectShowApiDataImportDialog = (state: RootState): boolean => selectApiData(state).showImportDialog

import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

export interface ApiDataState {
    showImportDialog: boolean
}

// Initial state -------------------------------------------------------------------------------------------------------

const initialState: ApiDataState = {
    showImportDialog: false,
}

// Slice ---------------------------------------------------------------------------------------------------------------

const apiDataSlice = createSlice({
    name: 'apiData',
    initialState,
    reducers: {
        toggleImportDialog(state) {
            state.showImportDialog = !state.showImportDialog
        },
    },
})

const { actions, reducer } = apiDataSlice
export const { toggleImportDialog: toggleApiDataImportDialog } = actions
export default reducer

const selectApiData = (state: RootState) => state.apiData
export const selectShowApiDataImportDialog = (state: RootState): boolean => selectApiData(state).showImportDialog

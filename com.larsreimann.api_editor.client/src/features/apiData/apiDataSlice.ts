import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

export interface ApiDataState {
    expandedInTreeView: {
        [target: string]: true
    }
    treeViewScrollOffset: number
    showImportDialog: boolean
}

// Initial state -------------------------------------------------------------------------------------------------------

const initialState: ApiDataState = {
    expandedInTreeView: {},
    treeViewScrollOffset: 0,
    showImportDialog: false,
}

// Slice ---------------------------------------------------------------------------------------------------------------

const apiDataSlice = createSlice({
    name: 'apiData',
    initialState,
    reducers: {
        toggleIsExpanded(state, action: PayloadAction<string>) {
            if (state.expandedInTreeView[action.payload]) {
                delete state.expandedInTreeView[action.payload]
            } else {
                state.expandedInTreeView[action.payload] = true
            }
        },
        setScrollOffset(state, action: PayloadAction<number>) {
            state.treeViewScrollOffset = action.payload
        },
        toggleImportDialog(state) {
            state.showImportDialog = !state.showImportDialog
        },
    },
})

const { actions, reducer } = apiDataSlice
export const {
    toggleIsExpanded: toggleIsExpandedInTreeView,
    setScrollOffset: setTreeViewScrollOffset,
    toggleImportDialog: toggleApiDataImportDialog,
} = actions
export default reducer

const selectApiData = (state: RootState) => state.apiData
export const selectIsExpandedInTreeView =
    (target: string) =>
    (state: RootState): boolean =>
        Boolean(selectApiData(state).expandedInTreeView[target])
export const selectAllExpandedInTreeView = (state: RootState): { [target: string]: true } =>
    selectApiData(state).expandedInTreeView
export const selectTreeViewScrollOffset = (state: RootState): number => selectApiData(state).treeViewScrollOffset
export const selectShowApiDataImportDialog = (state: RootState): boolean => selectApiData(state).showImportDialog

import {createSlice} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';

export interface UsageState {
    showImportDialog: boolean;
}

// Initial state -------------------------------------------------------------------------------------------------------

const initialState: UsageState = {
    showImportDialog: false,
};

// Slice ---------------------------------------------------------------------------------------------------------------

const usageSlice = createSlice({
    name: 'usages',
    initialState,
    reducers: {
        toggleImportDialog(state) {
            state.showImportDialog = !state.showImportDialog;
        },
    },
});

const { actions, reducer } = usageSlice;
export const {
    toggleImportDialog: toggleUsageImportDialog,
} = actions;
export default reducer;

const selectUsage = (state: RootState) => state.usages;
export const selectShowUsageImportDialog = (state: RootState): boolean =>
    selectUsage(state).showImportDialog;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface PackageDataState {
    expandedInTreeView: {
        [target: string]: true;
    };
    treeViewScrollOffset: number;
    showImportDialog: boolean;
}

// Initial state -------------------------------------------------------------------------------------------------------

const initialState: PackageDataState = {
    expandedInTreeView: {},
    treeViewScrollOffset: 0,
    showImportDialog: false,
};

// Slice ---------------------------------------------------------------------------------------------------------------

const packageDataSlice = createSlice({
    name: 'packageData',
    initialState,
    reducers: {
        toggleIsExpanded(state, action: PayloadAction<string>) {
            if (state.expandedInTreeView[action.payload]) {
                delete state.expandedInTreeView[action.payload];
            } else {
                state.expandedInTreeView[action.payload] = true;
            }
        },
        expandParents(state, action: PayloadAction<string[]>) {
            const parents = action.payload;
            for (const parent of parents) {
                state.expandedInTreeView[parent] = true;
            }
        },
        setScrollOffset(state, action: PayloadAction<number>) {
            state.treeViewScrollOffset = action.payload;
        },
        toggleImportDialog(state) {
            state.showImportDialog = !state.showImportDialog;
        },
    },
});

const { actions, reducer } = packageDataSlice;
export const {
    toggleIsExpanded: toggleIsExpandedInTreeView,
    expandParents: expandParentsInTreeView,
    setScrollOffset: setTreeViewScrollOffset,
    toggleImportDialog: togglePackageDataImportDialog,
} = actions;
export default reducer;

const selectPackageData = (state: RootState) => state.packageData;
export const selectIsExpandedInTreeView =
    (target: string) =>
    (state: RootState): boolean =>
        Boolean(selectPackageData(state).expandedInTreeView[target]);
export const selectAllExpandedInTreeView = (state: RootState): { [target: string]: true } =>
    selectPackageData(state).expandedInTreeView;
export const selectTreeViewScrollOffset = (state: RootState): number => selectPackageData(state).treeViewScrollOffset;
export const selectShowPackageDataImportDialog = (state: RootState): boolean =>
    selectPackageData(state).showImportDialog;

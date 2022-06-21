import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as idb from 'idb-keyval';
import { RootState } from '../../app/store';
import { CalledAfterTarget, GroupTarget } from '../annotations/annotationSlice';
import { AbstractPythonFilter } from '../filter/model/AbstractPythonFilter';
import { createFilterFromString, isValidFilterToken } from '../filter/model/filterFactory';

export interface Filter {
    filter: string;
    name: string;
}

export interface UIState {
    showAnnotationImportDialog: boolean;
    showAPIImportDialog: boolean;
    showUsageImportDialog: boolean;
    showAddFilterDialog: boolean;

    currentUserAction: UserAction;
    expandedInTreeView: {
        [target: string]: true;
    };
    treeViewScrollOffset: number;
    heatMapMode: HeatMapMode;
    filterString: string;
    filterList: Filter[];
    sortingMode: SortingMode;
    batchMode: BatchMode;
    showStatistics: boolean;
}

type UserAction =
    | typeof NoUserAction
    | AttributeUserAction
    | BoundaryUserAction
    | CalledAfterUserAction
    | ConstantUserAction
    | DescriptionUserAction
    | GroupUserAction
    | EnumUserAction
    | RenameUserAction
    | OptionalUserAction
    | TodoUserAction;

const NoUserAction = {
    type: 'none',
    target: '',
};

interface AttributeUserAction {
    readonly type: 'attribute';
    readonly target: string;
}

interface BoundaryUserAction {
    readonly type: 'boundary';
    readonly target: string;
}

interface CalledAfterUserAction {
    readonly type: 'calledAfter';
    readonly target: string;
    readonly calledAfterName: string;
}

interface ConstantUserAction {
    readonly type: 'constant';
    readonly target: string;
}

interface DescriptionUserAction {
    readonly type: 'description';
    readonly target: string;
}

interface EnumUserAction {
    readonly type: 'enum';
    readonly target: string;
}

export interface GroupUserAction {
    readonly type: 'group';
    readonly target: string;
    readonly groupName: string;
}

interface OptionalUserAction {
    readonly type: 'optional';
    readonly target: string;
}

interface RenameUserAction {
    readonly type: 'rename';
    readonly target: string;
}

interface DescriptionUserAction {
    readonly type: 'description';
    readonly target: string;
}

interface TodoUserAction {
    readonly type: 'todo';
    readonly target: string;
}

export enum HeatMapMode {
    None = 'none',
    Usages = 'usages',
    Usefulness = 'usefulness',
    Annotations = 'annotations',
}

export enum SortingMode {
    Alphabetical = 'alphabetical',
    Usages = 'usages',
}

export enum BatchMode {
    None,
    Rename,
    Move,
    Remove,
    Constant,
    Optional,
    Required,
}

// Initial state -------------------------------------------------------------------------------------------------------

export const initialState: UIState = {
    showAnnotationImportDialog: false,
    showAPIImportDialog: false,
    showAddFilterDialog: false,
    showUsageImportDialog: false,

    currentUserAction: NoUserAction,

    expandedInTreeView: {},
    treeViewScrollOffset: 0,

    filterString: 'is:public',
    filterList: [
        { filter: 'is:public', name: 'default' },
        { filter: 'is:public usefulness:>0 !name:=X !name:=y', name: 'sklearn' },
    ],

    heatMapMode: HeatMapMode.None,
    sortingMode: SortingMode.Alphabetical,
    batchMode: BatchMode.None,
    showStatistics: true,
};

// Thunks --------------------------------------------------------------------------------------------------------------

export const initializeUI = createAsyncThunk('ui/initialize', async () => {
    try {
        const storedState = (await idb.get('ui')) as UIState;
        return {
            ...initialState,
            ...storedState,
        };
    } catch {
        return initialState;
    }
});

export const persistUI = createAsyncThunk('ui/persist', async (state: UIState) => {
    try {
        await idb.set('ui', state);
    } catch {
        // ignore
    }
});

// Slice ---------------------------------------------------------------------------------------------------------------

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setUI(_state, action: PayloadAction<UIState>) {
            return {
                ...initialState,
                ...action.payload,
            };
        },
        resetUI() {
            return initialState;
        },
        resetUIAfterAPIImport(state) {
            return {
                ...state,

                showAnnotationImportDialog: initialState.showAnnotationImportDialog,
                showAPIImportDialog: initialState.showAPIImportDialog,
                showUsageImportDialog: initialState.showUsageImportDialog,

                currentUserAction: initialState.currentUserAction,

                expandedInTreeView: initialState.expandedInTreeView,
                treeViewScrollOffset: initialState.treeViewScrollOffset,

                filterString: initialState.filterString,
            };
        },

        toggleAnnotationImportDialog(state) {
            state.showAnnotationImportDialog = !state.showAnnotationImportDialog;
        },
        hideAnnotationImportDialog(state) {
            state.showAnnotationImportDialog = false;
        },
        toggleAPIImportDialog(state) {
            state.showAPIImportDialog = !state.showAPIImportDialog;
        },
        toggleUsageImportDialog(state) {
            state.showUsageImportDialog = !state.showUsageImportDialog;
        },
        toggleAddFilterDialog(state) {
            state.showAddFilterDialog = !state.showAddFilterDialog;
        },
        showAttributeAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'attribute',
                target: action.payload,
            };
        },
        showBoundaryAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'boundary',
                target: action.payload,
            };
        },
        showCalledAfterAnnotationForm(state, action: PayloadAction<CalledAfterTarget>) {
            state.currentUserAction = {
                type: 'calledAfter',
                target: action.payload.target,
                calledAfterName: action.payload.calledAfterName,
            };
        },
        showConstantAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'constant',
                target: action.payload,
            };
        },
        showDescriptionAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'description',
                target: action.payload,
            };
        },
        showGroupAnnotationForm(state, action: PayloadAction<GroupTarget>) {
            state.currentUserAction = {
                type: 'group',
                target: action.payload.target,
                groupName: action.payload.groupName,
            };
        },
        showEnumAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'enum',
                target: action.payload,
            };
        },
        showMoveAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'move',
                target: action.payload,
            };
        },
        showOptionalAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'optional',
                target: action.payload,
            };
        },
        showRenameAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'rename',
                target: action.payload,
            };
        },
        showTodoAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'todo',
                target: action.payload,
            };
        },
        hideAnnotationForm(state) {
            state.currentUserAction = NoUserAction;
            state.batchMode = BatchMode.None;
        },
        toggleIsExpandedInTreeView(state, action: PayloadAction<string>) {
            if (state.expandedInTreeView[action.payload]) {
                delete state.expandedInTreeView[action.payload];
            } else {
                state.expandedInTreeView[action.payload] = true;
            }
        },
        setAllExpandedInTreeView(state, action: PayloadAction<string[]>) {
            const all = action.payload;
            for (const item of all) {
                state.expandedInTreeView[item] = true;
            }
        },
        setAllCollapsedInTreeView(state, action: PayloadAction<string[]>) {
            const all = action.payload;
            for (const item of all) {
                delete state.expandedInTreeView[item];
            }
        },
        setTreeViewScrollOffset(state, action: PayloadAction<number>) {
            state.treeViewScrollOffset = action.payload;
        },
        setHeatMapMode(state, action: PayloadAction<HeatMapMode>) {
            state.heatMapMode = action.payload;
        },
        setFilterString(state, action: PayloadAction<string>) {
            state.filterString = action.payload;
        },
        addFilter(state, action: PayloadAction<Filter>) {
            state.filterList.push(action.payload);
        },
        removeFilter(state, action: PayloadAction<string>) {
            state.filterList = state.filterList.filter((filter) => filter.filter !== action.payload);
        },
        setSortingMode(state, action: PayloadAction<SortingMode>) {
            state.sortingMode = action.payload;
        },
        setBatchMode(state, action: PayloadAction<BatchMode>) {
            state.batchMode = action.payload;
        },
        toggleStatisticsView(state) {
            state.showStatistics = !state.showStatistics;
        },
    },
    extraReducers(builder) {
        builder.addCase(initializeUI.fulfilled, (state, action) => action.payload);
    },
});

const { actions, reducer } = uiSlice;
export const {
    setUI,
    resetUI,
    resetUIAfterAPIImport,

    toggleAnnotationImportDialog,
    hideAnnotationImportDialog,
    toggleAPIImportDialog,
    toggleUsageImportDialog,
    toggleAddFilterDialog,

    showAttributeAnnotationForm,
    showBoundaryAnnotationForm,
    showCalledAfterAnnotationForm,
    showConstantAnnotationForm,
    showDescriptionAnnotationForm,
    showEnumAnnotationForm,
    showGroupAnnotationForm,
    showMoveAnnotationForm,
    showOptionalAnnotationForm,
    showRenameAnnotationForm,
    showTodoAnnotationForm,
    hideAnnotationForm,

    toggleIsExpandedInTreeView,
    setAllExpandedInTreeView,
    setAllCollapsedInTreeView,
    setTreeViewScrollOffset,
    setHeatMapMode,
    setFilterString,
    addFilter,
    removeFilter,
    setSortingMode,
    setBatchMode,
    toggleStatisticsView,
} = actions;
export const uiReducer = reducer;

export const selectUI = (state: RootState) => state.ui;
export const selectShowAnnotationImportDialog = (state: RootState): boolean =>
    selectUI(state).showAnnotationImportDialog;
export const selectShowAPIImportDialog = (state: RootState): boolean => selectUI(state).showAPIImportDialog;
export const selectShowUsageImportDialog = (state: RootState): boolean => selectUI(state).showUsageImportDialog;
export const selectShowAddFilterDialog = (state: RootState): boolean => selectUI(state).showAddFilterDialog;
export const selectCurrentUserAction = (state: RootState): UserAction => selectUI(state).currentUserAction;
export const selectIsExpandedInTreeView =
    (target: string) =>
    (state: RootState): boolean =>
        Boolean(selectUI(state).expandedInTreeView[target]);
export const selectAllExpandedInTreeView = (state: RootState): { [target: string]: true } =>
    selectUI(state).expandedInTreeView;
export const selectTreeViewScrollOffset = (state: RootState): number => selectUI(state).treeViewScrollOffset;
export const selectHeatMapMode = (state: RootState): HeatMapMode => selectUI(state).heatMapMode;
export const selectFilterString = (state: RootState): string => selectUI(state).filterString;
export const selectFilterList = (state: RootState): Filter[] => selectUI(state).filterList;

/**
 * Keep only the valid parts of the filter string to improve caching of selectFilter.
 */
const selectLongestValidFilterString = createSelector([selectFilterString], (filterString: string): string => {
    return filterString.split(' ').filter(isValidFilterToken).join(' ');
});
export const selectFilter = createSelector(
    [selectLongestValidFilterString],
    (filterString: string): AbstractPythonFilter => {
        return createFilterFromString(filterString);
    },
);
export const selectSortingMode = (state: RootState): SortingMode => selectUI(state).sortingMode;
export const selectBatchMode = (state: RootState): BatchMode => selectUI(state).batchMode;
export const selectShowStatistics = (state: RootState): boolean => selectUI(state).showStatistics;

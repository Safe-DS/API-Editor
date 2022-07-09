import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as idb from 'idb-keyval';
import { RootState } from '../../app/store';
import { AbstractPythonFilter } from '../filter/model/AbstractPythonFilter';
import { createFilterFromString, isValidFilterToken } from '../filter/model/filterFactory';
import { PythonDeclaration } from '../packageData/model/PythonDeclaration';
import { UsageCountStore } from '../usages/model/UsageCountStore';
import { selectUsages } from '../usages/usageSlice';
import { CalledAfterTarget, GroupTarget } from '../annotations/versioning/AnnotationStoreV2';

const EXPECTED_UI_SCHEMA_VERSION = 1;

export interface Filter {
    filter: string;
    name: string;
}

export interface UIState {
    schemaVersion?: number;
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
    expandDocumentationByDefault: boolean;

    celebratedTitles: string[];
    isLoaded: boolean;
}

type UserAction =
    | typeof NoUserAction
    | BoundaryUserAction
    | CalledAfterUserAction
    | DescriptionUserAction
    | EnumUserAction
    | GroupUserAction
    | MoveUserAction
    | PureUserAction
    | RemoveUserAction
    | RenameUserAction
    | TodoUserAction
    | ValueUserAction;

export const NoUserAction = {
    type: 'none',
    target: '',
};

interface BoundaryUserAction {
    readonly type: 'boundary';
    readonly target: string;
}

interface CalledAfterUserAction {
    readonly type: 'calledAfter';
    readonly target: string;
    readonly calledAfterName: string;
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

interface MoveUserAction {
    readonly type: 'move';
    readonly target: string;
}

interface PureUserAction {
    readonly type: 'pure';
    readonly target: string;
}

interface RemoveUserAction {
    readonly type: 'remove';
    readonly target: string;
}

interface RenameUserAction {
    readonly type: 'rename';
    readonly target: string;
}

interface TodoUserAction {
    readonly type: 'todo';
    readonly target: string;
}

interface ValueUserAction {
    readonly type: 'value';
    readonly target: string;
}

export enum HeatMapMode {
    None = 'none',
    Usages = 'usages',
    Usefulness = 'usefulness',
    Annotations = 'annotations',
}

export enum SortingMode {
    Default = 'default',
    Alphabetical = 'alphabetical',
    Usages = 'usages',
}

export enum BatchMode {
    None,
    Rename,
    Move,
    Remove,
    Value,
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

    filterString: 'is:public !is:removed',
    filterList: [
        { filter: 'is:public !is:removed', name: 'Default' },
        { filter: 'is:public', name: 'Any Public Declaration' },
        { filter: 'is:public usefulness:>0', name: 'Public & Useful Declarations' },
    ],

    heatMapMode: HeatMapMode.None,
    sortingMode: SortingMode.Default,
    batchMode: BatchMode.None,
    showStatistics: true,
    expandDocumentationByDefault: false,

    celebratedTitles: [],
    isLoaded: false,
};

// Thunks --------------------------------------------------------------------------------------------------------------

export const initializeUI = createAsyncThunk('ui/initialize', async () => {
    try {
        const storedState = (await idb.get('ui')) as UIState;
        if ((storedState.schemaVersion ?? 1) !== EXPECTED_UI_SCHEMA_VERSION) {
            return {
                ...initialState,
                isLoaded: true,
            };
        }

        return {
            ...initialState,
            ...storedState,
            isLoaded: true,
        };
    } catch {
        return {
            ...initialState,
            isLoaded: true,
        };
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
        showPureAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'pure',
                target: action.payload,
            };
        },
        showRemoveAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'remove',
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
        showValueAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'value',
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
        upsertFilter(state, action: PayloadAction<Filter>) {
            state.filterList = [
                ...state.filterList.filter((filter) => filter.name !== action.payload.name),
                action.payload,
            ];
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
        toggleExpandDocumentationByDefault(state) {
            state.expandDocumentationByDefault = !state.expandDocumentationByDefault;
        },

        rememberTitle(state, action: PayloadAction<string>) {
            state.celebratedTitles.push(action.payload);
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

    showBoundaryAnnotationForm,
    showCalledAfterAnnotationForm,
    showDescriptionAnnotationForm,
    showEnumAnnotationForm,
    showGroupAnnotationForm,
    showMoveAnnotationForm,
    showPureAnnotationForm,
    showRemoveAnnotationForm,
    showRenameAnnotationForm,
    showTodoAnnotationForm,
    showValueAnnotationForm,
    hideAnnotationForm,

    toggleIsExpandedInTreeView,
    setAllExpandedInTreeView,
    setAllCollapsedInTreeView,
    setTreeViewScrollOffset,
    setHeatMapMode,
    setFilterString,
    upsertFilter,
    removeFilter,
    setSortingMode,
    setBatchMode,
    toggleStatisticsView,
    toggleExpandDocumentationByDefault,
    rememberTitle,
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
export const selectSorter = (state: RootState): ((a: PythonDeclaration, b: PythonDeclaration) => number) => {
    const sortingMode = selectSortingMode(state);
    const usages = selectUsages(state);
    switch (sortingMode) {
        case SortingMode.Default:
            return sortInSameOrder;
        case SortingMode.Alphabetical:
            return sortAlphabetically;
        case SortingMode.Usages: // Descending
            return sortByUsages(usages);
    }
};
export const selectBatchMode = (state: RootState): BatchMode => selectUI(state).batchMode;
export const selectShowStatistics = (state: RootState): boolean => selectUI(state).showStatistics;
export const selectExpandDocumentationByDefault = (state: RootState): boolean =>
    selectUI(state).expandDocumentationByDefault;

const sortInSameOrder = (_a: PythonDeclaration, _b: PythonDeclaration) => {
    return 1;
};

const sortAlphabetically = (a: PythonDeclaration, b: PythonDeclaration) => {
    return a.name.localeCompare(b.name);
};

const sortByUsages = (usages: UsageCountStore) => (a: PythonDeclaration, b: PythonDeclaration) => {
    return usages.getUsageCount(b) - usages.getUsageCount(a);
};

export const selectCelebratedTitles = (state: RootState): string[] => selectUI(state).celebratedTitles;
export const selectUIIsLoaded = (state: RootState): boolean => selectUI(state).isLoaded;

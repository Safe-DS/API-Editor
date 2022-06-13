import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as idb from 'idb-keyval';
import { RootState } from '../../app/store';
import { CalledAfterTarget, GroupTarget } from '../annotations/annotationSlice';
import { AbstractPythonFilter } from '../packageData/model/filters/AbstractPythonFilter';
import { createFilterFromString, isValidFilterToken } from '../packageData/model/filters/filterFactory';

export interface UIState {
    showAnnotationImportDialog: boolean;
    showAPIImportDialog: boolean;
    showUsageImportDialog: boolean;

    currentUserAction: UserAction;
    expandedInTreeView: {
        [target: string]: true;
    };
    treeViewScrollOffset: number;
    heatMapMode: HeatMapMode;
    filterString: string;
}

type UserAction =
    | typeof NoUserAction
    | AttributeUserAction
    | BoundaryUserAction
    | CalledAfterUserAction
    | ConstantUserAction
    | GroupUserAction
    | EnumUserAction
    | RenameUserAction
    | OptionalUserAction
    | DescriptionUserAction;

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

export enum HeatMapMode {
    None,
    Usages,
    Usefulness,
    Annotations,
}

// Initial state -------------------------------------------------------------------------------------------------------

export const initialState: UIState = {
    showAnnotationImportDialog: false,
    showAPIImportDialog: false,
    showUsageImportDialog: false,

    currentUserAction: NoUserAction,
    expandedInTreeView: {},
    treeViewScrollOffset: 0,
    heatMapMode: HeatMapMode.None,
    filterString: 'is:public',
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
        showDescriptionAnnotationForm(state, action: PayloadAction<string>) {
            state.currentUserAction = {
                type: 'description',
                target: action.payload,
            };
        },
        hideAnnotationForm(state) {
            state.currentUserAction = NoUserAction;
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
        setExactlyExpandedInTreeView(state, action: PayloadAction<string[]>) {
            const all = action.payload;
            state.expandedInTreeView = {};
            for (const item of all) {
                state.expandedInTreeView[item] = true;
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
    },
    extraReducers(builder) {
        builder.addCase(initializeUI.fulfilled, (state, action) => action.payload);
    },
});

const { actions, reducer } = uiSlice;
export const {
    setUI,
    resetUI,

    toggleAnnotationImportDialog,
    hideAnnotationImportDialog,
    toggleAPIImportDialog,
    toggleUsageImportDialog,

    showAttributeAnnotationForm,
    showBoundaryAnnotationForm,
    showCalledAfterAnnotationForm,
    showConstantAnnotationForm,
    showEnumAnnotationForm,
    showGroupAnnotationForm,
    showMoveAnnotationForm,
    showOptionalAnnotationForm,
    showRenameAnnotationForm,
    showDescriptionAnnotationForm,
    hideAnnotationForm,

    toggleIsExpandedInTreeView,
    setAllExpandedInTreeView,
    setAllCollapsedInTreeView,
    setExactlyExpandedInTreeView,
    setTreeViewScrollOffset,
    setHeatMapMode,

    setFilterString,
} = actions;
export const uiReducer = reducer;

export const selectUI = (state: RootState) => state.ui;
export const selectShowAnnotationImportDialog = (state: RootState): boolean =>
    selectUI(state).showAnnotationImportDialog;
export const selectShowAPIImportDialog = (state: RootState): boolean => selectUI(state).showAPIImportDialog;
export const selectShowUsageImportDialog = (state: RootState): boolean => selectUI(state).showUsageImportDialog;
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

import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import * as idb from 'idb-keyval';
import {RootState} from '../../app/store';
import {CalledAfterTarget, GroupTarget} from "../annotations/annotationSlice";

export interface UIState {
    currentUserAction: UserAction;
    showAnnotationImportDialog: boolean;
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
    | OptionalUserAction;

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

// Initial state -------------------------------------------------------------------------------------------------------

export const initialState: UIState = {
    currentUserAction: NoUserAction,
    showAnnotationImportDialog: false,
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

// Slice ---------------------------------------------------------------------------------------------------------------

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        set(_state, action: PayloadAction<UIState>) {
            return {
                ...initialState,
                ...action.payload,
            };
        },
        reset() {
            return initialState;
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
        hideAnnotationForm(state) {
            state.currentUserAction = NoUserAction;
        },
        toggleAnnotationImportDialog(state) {
            state.showAnnotationImportDialog = !state.showAnnotationImportDialog;
        },
        hideAnnotationImportDialog(state) {
            state.showAnnotationImportDialog = false;
        },
    },
    extraReducers(builder) {
        builder.addCase(initializeUI.fulfilled, (state, action) => action.payload);
    },
});

const {actions, reducer} = uiSlice;
export const {
    set: setUI,
    reset: resetUI,

    showAttributeAnnotationForm,
    showBoundaryAnnotationForm,
    showCalledAfterAnnotationForm,
    showConstantAnnotationForm,
    showEnumAnnotationForm,
    showGroupAnnotationForm,
    showMoveAnnotationForm,
    showOptionalAnnotationForm,
    showRenameAnnotationForm,
    hideAnnotationForm,

    toggleAnnotationImportDialog,
    hideAnnotationImportDialog,
} = actions;
export const uiReducer = reducer;

export const selectUI = (state: RootState) => state.ui;
export const selectCurrentUserAction = (state: RootState): UserAction => selectUI(state).currentUserAction;
export const selectShowAnnotationImportDialog = (state: RootState): boolean =>
    selectUI(state).showAnnotationImportDialog;

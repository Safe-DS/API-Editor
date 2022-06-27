import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { PythonPackage } from './model/PythonPackage';
import { parsePythonPackageJson} from './model/PythonPackageBuilder';
import * as idb from 'idb-keyval';
import { selectFilter, selectSorter } from '../ui/uiSlice';
import { selectUsages } from '../usages/usageSlice';
import { selectAnnotationStore } from '../annotations/annotationSlice';
import { PythonDeclaration } from './model/PythonDeclaration';
import {EXPECTED_API_SCHEMA_VERSION, PythonPackageJson} from "./model/APIJsonData";

export interface APIState {
    pythonPackage: PythonPackage;
}

// Initial state -------------------------------------------------------------------------------------------------------

const initialPythonPackageJson: PythonPackageJson = {
    schemaVersion: EXPECTED_API_SCHEMA_VERSION,
    distribution: 'empty',
    package: 'empty',
    version: '0.0.1',
    modules: [],
    classes: [],
    functions: [],
};

const initialPythonPackage = new PythonPackage('empty', 'empty', '0.0.1');

const initialState: APIState = {
    pythonPackage: initialPythonPackage,
};

// Thunks --------------------------------------------------------------------------------------------------------------

export const initializePythonPackage = createAsyncThunk('api/initialize', async () => {
    try {
        const storedPythonPackageJson = (await idb.get('api')) as PythonPackageJson;
        const pythonPackage = parsePythonPackageJson(storedPythonPackageJson);
        if (!pythonPackage) {
            await idb.set('api', initialPythonPackageJson);
            return initialState;
        }

        return {
            pythonPackage,
        };
    } catch {
        return initialState;
    }
});

export const persistPythonPackage = createAsyncThunk('api/persist', async (state: PythonPackageJson) => {
    try {
        await idb.set('api', state);
    } catch {
        // ignore
    }
});

// Slice ---------------------------------------------------------------------------------------------------------------

const apiSlice = createSlice({
    name: 'api',
    initialState,
    reducers: {
        setPythonPackage(state, action: PayloadAction<PythonPackage>) {
            state.pythonPackage = action.payload;
        },
        resetPythonPackage() {
            return initialState;
        },
    },
    extraReducers(builder) {
        builder.addCase(initializePythonPackage.fulfilled, (state, action) => action.payload);
    },
});

const { actions, reducer } = apiSlice;
export const { setPythonPackage, resetPythonPackage } = actions;
export const apiReducer = reducer;

const selectAPI = (state: RootState) => state.api;
export const selectRawPythonPackage = (state: RootState) => selectAPI(state).pythonPackage;
export const selectFlatSortedDeclarationList = createSelector(
    [selectRawPythonPackage, selectSorter],
    (pythonPackage, sorter) => {
        return walkChildrenInPreorder(pythonPackage, sorter);
    },
);
export const selectFilteredPythonPackage = createSelector(
    [selectRawPythonPackage, selectAnnotationStore, selectUsages, selectFilter],
    (pythonPackage, annotations, usages, filter) => {
        return filter.applyToPackage(pythonPackage, annotations, usages);
    },
);
export const selectMatchedNodes = createSelector(
    [selectFilteredPythonPackage, selectAnnotationStore, selectUsages, selectFilter],
    (pythonPackage, annotations, usages, filter) => {
        const result = [];
        for (const declaration of pythonPackage.descendantsOrSelf()) {
            if (
                !(declaration instanceof PythonPackage) &&
                filter.shouldKeepDeclaration(declaration, annotations, usages)
            ) {
                result.push(declaration);
            }
        }
        return result;
    },
);
export const selectNumberOfMatchedNodes = createSelector([selectMatchedNodes], (matchedNodes) => {
    return matchedNodes.length;
});
export const selectFlatFilteredAndSortedDeclarationList = createSelector(
    [selectFilteredPythonPackage, selectSorter],
    (pythonPackage, sorter) => {
        return walkChildrenInPreorder(pythonPackage, sorter);
    },
);

const walkChildrenInPreorder = function (
    declaration: PythonDeclaration,
    sorter: (a: PythonDeclaration, b: PythonDeclaration) => number,
): PythonDeclaration[] {
    return [...declaration.children()].sort(sorter).flatMap((it) => {
        return [it, ...walkChildrenInPreorder(it, sorter)];
    });
};

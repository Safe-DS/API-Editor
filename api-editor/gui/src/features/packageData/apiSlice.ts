import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { PythonPackage } from './model/PythonPackage';
import { parsePythonPackageJson, PythonPackageJson } from './model/PythonPackageBuilder';
import * as idb from 'idb-keyval';
import { selectFilter, selectSortingMode, SortingMode } from '../ui/uiSlice';
import { selectUsages } from '../usages/usageSlice';
import { selectAnnotations } from '../annotations/annotationSlice';

export interface APIState {
    pythonPackage: PythonPackage;
}

// Initial state -------------------------------------------------------------------------------------------------------

const initialState: APIState = {
    pythonPackage: new PythonPackage('empty', 'empty', '0.0.1'),
};

// Thunks --------------------------------------------------------------------------------------------------------------

export const initializePythonPackage = createAsyncThunk('api/initialize', async () => {
    try {
        const storedPythonPackageJson = (await idb.get('api')) as PythonPackageJson;
        return {
            pythonPackage: parsePythonPackageJson(storedPythonPackageJson),
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
const selectSortedPythonPackages = createSelector(
    [selectRawPythonPackage, selectSortingMode, selectUsages],
    (pythonPackage, sortingMode, usages) => {
        switch (sortingMode) {
            case SortingMode.Alphabetical:
                return pythonPackage;
            case SortingMode.Usages: // Descending
                return pythonPackage.shallowCopy({
                    modules: pythonPackage.modules
                        .map((module) =>
                            module.shallowCopy({
                                classes: module.classes
                                    .map((cls) =>
                                        cls.shallowCopy({
                                            methods: [...cls.methods].sort(
                                                (a, b) =>
                                                    (usages.functionUsages.get(b.id) ?? 0) -
                                                    (usages.functionUsages.get(a.id) ?? 0),
                                            ),
                                        }),
                                    )
                                    .sort(
                                        (a, b) =>
                                            (usages.classUsages.get(b.id) ?? 0) - (usages.classUsages.get(a.id) ?? 0),
                                    ),
                                functions: [...module.functions].sort(
                                    (a, b) =>
                                        (usages.functionUsages.get(b.id) ?? 0) - (usages.functionUsages.get(a.id) ?? 0),
                                ),
                            }),
                        )
                        .sort((a, b) => (usages.moduleUsages.get(b.id) ?? 0) - (usages.moduleUsages.get(a.id) ?? 0)),
                });
        }
    },
);
export const selectFilteredPythonPackage = createSelector(
    [selectSortedPythonPackages, selectAnnotations, selectUsages, selectFilter],
    (pythonPackage, annotations, usages, filter) => {
        return filter.applyToPackage(pythonPackage, annotations, usages);
    },
);
export const selectNumberOfMatchedNodes = createSelector(
    [selectFilteredPythonPackage, selectAnnotations, selectUsages, selectFilter],
    (pythonPackage, annotations, usages, filter) => {
        let result = -1; // We start with -1, since the PythonPackage is always kept but should not be counted
        for (const declaration of pythonPackage.descendantsOrSelf()) {
            if (filter.shouldKeepDeclaration(declaration, annotations, usages)) {
                result++;
            }
        }
        return result;
    },
);

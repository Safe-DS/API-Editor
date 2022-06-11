import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import PythonPackage from './model/PythonPackage';
import { parsePythonPackageJson, PythonPackageJson } from './model/PythonPackageBuilder';
import * as idb from 'idb-keyval';

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
export const selectPythonPackage = (state: RootState) => selectAPI(state).pythonPackage;

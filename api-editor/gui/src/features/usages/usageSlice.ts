import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { UsageCountJson, UsageCountStore } from './model/UsageCountStore';
import * as idb from 'idb-keyval';

export const EXPECTED_USAGES_SCHEMA_VERSION = 1;

export interface UsageState {
    usages: UsageCountStore;
}

// Initial state -------------------------------------------------------------------------------------------------------

const initialState: UsageState = {
    usages: new UsageCountStore(),
};

// Thunks --------------------------------------------------------------------------------------------------------------

export const initializeUsages = createAsyncThunk('usages/initialize', async () => {
    try {
        const storedUsageCountStoreJson = (await idb.get('usages')) as UsageCountJson;
        return {
            usages: UsageCountStore.fromJson(storedUsageCountStoreJson) ?? new UsageCountStore(),
        };
    } catch {
        return initialState;
    }
});

export const persistUsages = createAsyncThunk('usages/persist', async (state: UsageCountStore) => {
    try {
        await idb.set('usages', state.toJson());
    } catch {
        // ignore
    }
});

// Slice ---------------------------------------------------------------------------------------------------------------

const usageSlice = createSlice({
    name: 'usages',
    initialState,
    reducers: {
        setUsages(state, action: PayloadAction<UsageCountStore>) {
            state.usages = action.payload;
        },
        resetUsages() {
            return initialState;
        },
    },
    extraReducers(builder) {
        builder.addCase(initializeUsages.fulfilled, (state, action) => action.payload);
    },
});

const { actions, reducer } = usageSlice;
export const { setUsages, resetUsages } = actions;
export const usageReducer = reducer;

const selectUsage = (state: RootState) => state.usages;
export const selectUsages = (state: RootState) => selectUsage(state).usages;

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';
import {UsageCountStore} from "./model/UsageCountStore";
import {UIState} from "../ui/uiSlice";

export interface UsageState {
    usages: UsageCountStore;
}

// Initial state -------------------------------------------------------------------------------------------------------

const initialState: UsageState = {
    usages: new UsageCountStore()
};

// Slice ---------------------------------------------------------------------------------------------------------------

const usageSlice = createSlice({
    name: 'usages',
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
    },
});

const {actions, reducer} = usageSlice;
export const {} = actions;
export const usageReducer = reducer;

const selectUsage = (state: RootState) => state.usages;
export const selectUsages = (state: RootState) => selectUsage(state).usages;

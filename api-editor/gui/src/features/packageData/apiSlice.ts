import {createSlice} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';

export interface APIState {

}

// Initial state -------------------------------------------------------------------------------------------------------

const initialState: APIState = {};

// Slice ---------------------------------------------------------------------------------------------------------------

const apiSlice = createSlice({
    name: 'api',
    initialState,
    reducers: {},
});

const {actions, reducer} = apiSlice;
export const {} = actions;
export const apiReducer = reducer;

export const selectAPI = (state: RootState) => state.api;

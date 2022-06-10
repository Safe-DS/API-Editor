import {configureStore} from '@reduxjs/toolkit';
import {setupListeners} from '@reduxjs/toolkit/query';
import {annotationsReducer} from '../features/annotations/annotationSlice';
import packageDataReducer from '../features/packageData/packageDataSlice';
import usageReducer from '../features/usages/usageSlice';

export const store = configureStore({
    reducer: {
        annotations: annotationsReducer,
        packageData: packageDataReducer,
        usages: usageReducer,
    },
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

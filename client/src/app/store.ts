import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import annotationReducer from '../features/annotations/annotationSlice';
import packageDataReducer from '../features/packageData/packageDataSlice';
import { apiEditorApi } from '../services/apiEditorApi';

export const store = configureStore({
    reducer: {
        annotations: annotationReducer,
        packageData: packageDataReducer,
        [apiEditorApi.reducerPath]: apiEditorApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiEditorApi.middleware),
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

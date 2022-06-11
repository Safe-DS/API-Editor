import {configureStore} from '@reduxjs/toolkit';
import {setupListeners} from '@reduxjs/toolkit/query';
import {annotationsReducer} from '../features/annotations/annotationSlice';
import {apiReducer} from '../features/packageData/apiSlice';
import {usageReducer} from '../features/usages/usageSlice';
import {uiReducer} from "../features/ui/uiSlice";

export const store = configureStore({
    reducer: {
        annotations: annotationsReducer,
        api: apiReducer,
        ui: uiReducer,
        usages: usageReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: [
                    'usages/initialize',
                    'usages/initialize/fulfilled',
                    'usages/set'
                ],
                // Ignore these paths in the state
                ignoredPaths: ['usages.usages'],
            },
        }),
    devTools: {
        serialize: {
            options: true
        }
    }
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

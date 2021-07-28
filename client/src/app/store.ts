import { configureStore } from '@reduxjs/toolkit'
import AnnotationReducer from '../features/annotations/annotationSlice'
import ApiDataReducer from '../features/apiData/apiDataSlice'

export const store = configureStore({
    reducer: {
        annotations: AnnotationReducer,
        apiData: ApiDataReducer,
    },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>

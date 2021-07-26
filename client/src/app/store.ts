import { configureStore } from '@reduxjs/toolkit'
import AnnotationReducer from '../features/annotations/annotationSlice'

export const store = configureStore({
    reducer: {
        annotations: AnnotationReducer,
    },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>

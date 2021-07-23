import { configureStore } from '@reduxjs/toolkit'
import NotificationReducer from '../features/notifications/notificationSlice'

export const store = configureStore({
    reducer: {
        notifications: NotificationReducer,
    },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>

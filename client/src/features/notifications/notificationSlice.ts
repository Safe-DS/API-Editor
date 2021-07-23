import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'
import { RootState } from '../../app/store'

export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error'

export interface Notification {
    severity: NotificationSeverity
    message: string
}

export interface NotificationWithId extends Notification {
    id: string
}

export interface NotificationState {
    notifications: NotificationWithId[]
}

const initialState: NotificationState = {
    notifications: [],
}

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        queue(state, action: PayloadAction<Notification>) {
            state.notifications.push({
                ...action.payload,
                id: uuidv4(),
            })
        },
        dequeue(state) {
            state.notifications.shift()
        },
    },
})

const { actions, reducer } = notificationSlice
export const { queue: queueNotification, dequeue: dequeueNotification } = actions
export default reducer

const selectNotifications = (state: RootState) => state.notifications
export const selectNextNotification = createSelector(selectNotifications, (state) => {
    if (state.notifications.length > 0) {
        return state.notifications[0]
    }
})

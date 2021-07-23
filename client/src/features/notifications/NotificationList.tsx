import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../app/hooks'
import { dequeueNotification, Notification as NotificationType, selectNextNotification } from './notificationSlice'

const NotificationList: React.FC = () => {
    const nextNotification = useSelector(selectNextNotification)

    if (nextNotification) {
        return <Notification notification={nextNotification} />
    } else {
        return <></>
    }
}

interface NotificationProps {
    notification: NotificationType
}

const Notification: React.FC<NotificationProps> = (props) => {
    const dispatch = useAppDispatch()
    useEffect(() => {
        setTimeout(() => {
            dispatch(dequeueNotification())
        }, 5000)
    })

    return (
        <Snackbar open={true} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Alert severity={props.notification.severity}>{props.notification.message}</Alert>
        </Snackbar>
    )
}

export default NotificationList

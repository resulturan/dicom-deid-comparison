/**
 * Notification Handler Component
 * Listens to Redux notification state and displays notifications using Ant Design
 */

import { useEffect } from 'react';
import { notification } from 'antd';
import { useAppDispatch, useAppSelector } from '@store';
import { removeNotification } from '@store/slices/uiSlice';
import { NOTIFICATION_DURATION } from '@utils/constants';

const NotificationHandler = () => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.ui);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    notifications.forEach((notif) => {
      // Get duration based on notification type
      const duration =
        notif.duration !== undefined
          ? notif.duration / 1000 // Convert ms to seconds
          : NOTIFICATION_DURATION[notif.type.toUpperCase() as keyof typeof NOTIFICATION_DURATION] / 1000;

      // Show notification
      api[notif.type]({
        message: notif.message,
        description: notif.description,
        duration,
        key: notif.id,
        onClose: () => {
          dispatch(removeNotification(notif.id));
        },
      });

      // Auto-remove from Redux after showing
      setTimeout(() => {
        dispatch(removeNotification(notif.id));
      }, 100);
    });
  }, [notifications, api, dispatch]);

  return <>{contextHolder}</>;
};

export default NotificationHandler;

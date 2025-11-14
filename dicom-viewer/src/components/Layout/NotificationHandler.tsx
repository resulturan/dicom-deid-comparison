/**
 * Notification Handler Component
 * Shows summary notifications instead of individual ones
 */

import { useEffect, useRef } from 'react';
import { notification } from 'antd';
import { useAppDispatch, useAppSelector } from '@store';
import { removeNotification } from '@store/slices/uiSlice';
import { NOTIFICATION_DURATION } from '@utils/constants';

const NotificationHandler = () => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.ui);
  const [api, contextHolder] = notification.useNotification();
  const lastNotificationCountRef = useRef(0);
  const shownNotificationIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Only show summary notification when new notifications arrive
    const newNotifications = notifications.filter((n) => !shownNotificationIdsRef.current.has(n.id));
    
    if (newNotifications.length === 0) {
      return;
    }

    // Mark new notifications as shown
    newNotifications.forEach((n) => shownNotificationIdsRef.current.add(n.id));

    // Group new notifications by type
    const grouped = {
      success: newNotifications.filter((n) => n.type === 'success'),
      error: newNotifications.filter((n) => n.type === 'error'),
      warning: newNotifications.filter((n) => n.type === 'warning'),
      info: newNotifications.filter((n) => n.type === 'info'),
    };

    const successCount = grouped.success.length;
    const errorCount = grouped.error.length;
    const warningCount = grouped.warning.length;
    const infoCount = grouped.info.length;

    // Show summary notification
    if (newNotifications.length === 1) {
      // Single notification - show it normally
      const notif = newNotifications[0];
      const duration =
        notif.duration !== undefined
          ? notif.duration / 1000
          : NOTIFICATION_DURATION[notif.type.toUpperCase() as keyof typeof NOTIFICATION_DURATION] / 1000;

      api[notif.type]({
        message: notif.message,
        description: notif.description,
        duration,
        key: `summary-${notif.id}`,
        onClose: () => {
          dispatch(removeNotification(notif.id));
        },
      });
    } else {
      // Multiple notifications - show summary
      const parts: string[] = [];
      if (successCount > 0) parts.push(`${successCount} successful`);
      if (errorCount > 0) parts.push(`${errorCount} error${errorCount > 1 ? 's' : ''}`);
      if (warningCount > 0) parts.push(`${warningCount} warning${warningCount > 1 ? 's' : ''}`);
      if (infoCount > 0) parts.push(`${infoCount} info`);

      const summaryMessage = parts.join(', ');
      const primaryType = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : successCount > 0 ? 'success' : 'info';

      api[primaryType]({
        message: `${newNotifications.length} file${newNotifications.length > 1 ? 's' : ''} processed`,
        description: summaryMessage,
        duration: 4,
        key: `summary-${Date.now()}`,
      });
    }

    // Clean up old notification IDs (keep only last 100)
    if (shownNotificationIdsRef.current.size > 100) {
      const allIds = notifications.map((n) => n.id);
      const currentIds = new Set(allIds);
      shownNotificationIdsRef.current.forEach((id) => {
        if (!currentIds.has(id)) {
          shownNotificationIdsRef.current.delete(id);
        }
      });
    }

    lastNotificationCountRef.current = notifications.length;
  }, [notifications, api, dispatch]);

  return <>{contextHolder}</>;
};

export default NotificationHandler;

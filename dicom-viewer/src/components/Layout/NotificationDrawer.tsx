/**
 * Notification Drawer Component
 * Displays all notifications in a drawer with summary view
 */

import { Drawer, List, Badge, Button, Space, Typography, Empty, Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@store';
import { removeNotification, clearNotifications, toggleNotificationDrawer } from '@store/slices/uiSlice';
import type { Notification } from '@store/types';
import styles from './NotificationDrawer.module.scss';

const { Text, Title } = Typography;

const NotificationDrawer = () => {
  const dispatch = useAppDispatch();
  const { notifications, notificationDrawerOpen } = useAppSelector((state) => state.ui);

  // Group notifications by type
  const groupedNotifications = {
    success: notifications.filter((n) => n.type === 'success'),
    error: notifications.filter((n) => n.type === 'error'),
    warning: notifications.filter((n) => n.type === 'warning'),
    default: notifications.filter((n) => n.type === 'default'),
  };

  const totalCount = notifications.length;
  const successCount = groupedNotifications.success.length;
  const errorCount = groupedNotifications.error.length;
  const warningCount = groupedNotifications.warning.length;
  const defaultCount = groupedNotifications.default.length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'default':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'default':
        return 'processing';
    }
  };

  const handleRemove = (id: string) => {
    dispatch(removeNotification(id));
  };

  const handleClearAll = () => {
    dispatch(clearNotifications());
  };

  return (
    <Drawer
      className={styles.drawer}
      title={
        <Space>
          <BellOutlined style={{ color: '#ffffff' }} />
          <Title level={5} style={{ margin: 0, color: '#ffffff' }}>
            Notifications
          </Title>
          {totalCount > 0 && (
            <Badge count={totalCount} showZero style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
          )}
        </Space>
      }
      placement="right"
      width={400}
      open={notificationDrawerOpen}
      onClose={() => dispatch(toggleNotificationDrawer())}
      extra={
        totalCount > 0 && (
          <Button type="link" danger size="small" onClick={handleClearAll} style={{ color: '#ffffff' }}>
            Clear All
          </Button>
        )
      }
    >
      {totalCount === 0 ? (
        <Empty
          description="No notifications"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: 60 }}
        />
      ) : (
        <>
          {/* Summary Section */}
          <div className={styles.summarySection}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong style={{ fontSize: 13 }}>
                Summary
              </Text>
              <Space size="middle" wrap>
                {successCount > 0 && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    {successCount} successful
                  </Tag>
                )}
                {errorCount > 0 && (
                  <Tag color="error" icon={<CloseCircleOutlined />}>
                    {errorCount} error{errorCount > 1 ? 's' : ''}
                  </Tag>
                )}
                {warningCount > 0 && (
                  <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                    {warningCount} warning{warningCount > 1 ? 's' : ''}
                  </Tag>
                )}
                {defaultCount > 0 && (
                  <Tag color="processing" icon={<InfoCircleOutlined />}>
                    {defaultCount} default
                  </Tag>
                )}
              </Space>
            </Space>
          </div>

          {/* Notifications List */}
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item
                className={styles.notificationItem}
                actions={[
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(notification.id)}
                    danger
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={getIcon(notification.type)}
                  title={
                    <Space>
                      <Text strong style={{ fontSize: 13 }}>
                        {notification.message}
                      </Text>
                      <Tag color={getColor(notification.type)}>
                        {notification.type}
                      </Tag>
                    </Space>
                  }
                  description={
                    notification.description && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {notification.description}
                      </Text>
                    )
                  }
                />
              </List.Item>
            )}
          />
        </>
      )}
    </Drawer>
  );
};

export default NotificationDrawer;


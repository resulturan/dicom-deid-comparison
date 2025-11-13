/**
 * Empty State Component
 * Displays friendly empty states with call-to-action
 */

import { Empty, Button, Typography } from 'antd';
import type { ReactNode } from 'react';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  style?: React.CSSProperties;
}

const EmptyState = ({
  icon = <InboxOutlined style={{ fontSize: 72, color: '#bfbfbf' }} />,
  title = 'No data available',
  description = 'Get started by uploading files',
  action,
  style,
}: EmptyStateProps) => {
  return (
    <div
      className="empty-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        minHeight: '400px',
        ...style,
      }}
    >
      <Empty
        image={icon}
        imageStyle={{
          height: 'auto',
        }}
        description={
          <div style={{ marginTop: 24 }}>
            <Text
              strong
              style={{
                fontSize: 18,
                color: '#262626',
                display: 'block',
                marginBottom: 8,
              }}
            >
              {title}
            </Text>
            <Paragraph
              type="secondary"
              style={{
                fontSize: 14,
                marginBottom: 24,
                maxWidth: 400,
              }}
            >
              {description}
            </Paragraph>
            {action && (
              <Button
                type="primary"
                size="large"
                icon={action.icon || <UploadOutlined />}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
};

export default EmptyState;

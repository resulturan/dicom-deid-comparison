/**
 * Global Loading Overlay Component
 * Enhanced with smooth animations and better visual feedback
 */

import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAppSelector } from '@store';

const { Text } = Typography;

const LoadingOverlay = () => {
  const { loading, loadingMessage } = useAppSelector((state) => state.ui);

  if (!loading) {
    return null;
  }

  const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />;

  return (
    <div className="loading-overlay">
      <div
        style={{
          textAlign: 'center',
          background: '#fff',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          minWidth: '320px',
        }}
      >
        <Spin indicator={antIcon} size="large" />
        {loadingMessage && (
          <div style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 16, color: '#262626', fontWeight: 500 }}>
              {loadingMessage}
            </Text>
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Please wait...
          </Text>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;

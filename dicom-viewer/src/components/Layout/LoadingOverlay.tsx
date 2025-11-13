/**
 * Global Loading Overlay Component
 */

import { Spin } from 'antd';
import { useAppSelector } from '@store';

const LoadingOverlay = () => {
  const { loading, loadingMessage } = useAppSelector((state) => state.ui);

  if (!loading) {
    return null;
  }

  return (
    <div className="loading-overlay">
      <div style={{ textAlign: 'center' }}>
        <Spin size="large" />
        {loadingMessage && (
          <div style={{ marginTop: 16, color: '#fff', fontSize: 16 }}>
            {loadingMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;

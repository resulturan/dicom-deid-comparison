/**
 * Viewer Controls Component
 * Provides UI controls for DICOM viewer tools
 */

import { Space, Button, Tooltip, Divider } from 'antd';
import {
  DragOutlined,
  ZoomInOutlined,
  BorderOutlined,
  ReloadOutlined,
  ColumnWidthOutlined,
  LineOutlined,
} from '@ant-design/icons';

interface ViewerControlsProps {
  onToolChange?: (tool: string) => void;
  onReset?: () => void;
  activeTool?: string;
}

const ViewerControls = ({ onToolChange, onReset, activeTool = 'WindowLevel' }: ViewerControlsProps) => {
  const handleToolClick = (tool: string) => {
    onToolChange?.(tool);
  };

  const tools = [
    { name: 'Pan', icon: <DragOutlined />, tooltip: 'Pan (Middle Mouse)' },
    { name: 'Zoom', icon: <ZoomInOutlined />, tooltip: 'Zoom (Right Mouse)' },
    { name: 'WindowLevel', icon: <ColumnWidthOutlined />, tooltip: 'Window/Level (Left Mouse)' },
    { name: 'Length', icon: <LineOutlined />, tooltip: 'Measure Length' },
    { name: 'RectangleROI', icon: <BorderOutlined />, tooltip: 'Rectangle ROI' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '8px 16px',
        borderRadius: '8px',
        zIndex: 100,
        backdropFilter: 'blur(8px)',
      }}
    >
      <Space split={<Divider type="vertical" style={{ background: '#444' }} />}>
        <Space>
          {tools.map((tool) => (
            <Tooltip key={tool.name} title={tool.tooltip} placement="top">
              <Button
                type={activeTool === tool.name ? 'primary' : 'default'}
                icon={tool.icon}
                size="small"
                onClick={() => handleToolClick(tool.name)}
                style={{
                  background: activeTool === tool.name ? undefined : 'rgba(255, 255, 255, 0.1)',
                  borderColor: activeTool === tool.name ? undefined : '#444',
                  color: activeTool === tool.name ? undefined : '#ccc',
                }}
              />
            </Tooltip>
          ))}
        </Space>

        <Tooltip title="Reset Viewport" placement="top">
          <Button
            icon={<ReloadOutlined />}
            size="small"
            onClick={onReset}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderColor: '#444',
              color: '#ccc',
            }}
          />
        </Tooltip>
      </Space>
    </div>
  );
};

export default ViewerControls;

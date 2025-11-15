/**
 * Viewer Controls Component
 * Provides UI controls for DICOM viewer tools
 */

import { Space, Button, Tooltip, Divider, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  DragOutlined,
  ZoomInOutlined,
  BorderOutlined,
  ReloadOutlined,
  ColumnWidthOutlined,
  LineOutlined,
  PlusOutlined,
  MinusOutlined,
  DownOutlined,
  UpOutlined,
  DownOutlined as DownOutlinedIcon,
} from '@ant-design/icons';
import { useState } from 'react';
import styles from './ViewerControls.module.scss';

interface ViewerControlsProps {
  onToolChange?: (tool: string) => void;
  onReset?: () => void;
  onZoomChange?: (scale: number) => void;
  activeTool?: string;
  currentZoom?: number;
}

const ViewerControls = ({
  onToolChange,
  onReset,
  onZoomChange,
  activeTool = 'WindowLevel',
  currentZoom = 1.0
}: ViewerControlsProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToolClick = (tool: string) => {
    onToolChange?.(tool);
  };

  const handleZoomIn = () => {
    onZoomChange?.(Math.min(10, currentZoom + 0.25));
  };

  const handleZoomOut = () => {
    onZoomChange?.(Math.max(0.1, currentZoom - 0.25));
  };

  const zoomPresets: MenuProps['items'] = [
    { key: '0.25', label: '25%', onClick: () => onZoomChange?.(0.25) },
    { key: '0.5', label: '50%', onClick: () => onZoomChange?.(0.5) },
    { key: '0.75', label: '75%', onClick: () => onZoomChange?.(0.75) },
    { key: '1', label: '100%', onClick: () => onZoomChange?.(1.0) },
    { key: '1.5', label: '150%', onClick: () => onZoomChange?.(1.5) },
    { key: '2', label: '200%', onClick: () => onZoomChange?.(2.0) },
    { key: '3', label: '300%', onClick: () => onZoomChange?.(3.0) },
  ];

  const tools = [
    { name: 'Pan', icon: <DragOutlined />, tooltip: 'Pan (P)' },
    { name: 'Zoom', icon: <ZoomInOutlined />, tooltip: 'Zoom Tool (Z)' },
    { name: 'WindowLevel', icon: <ColumnWidthOutlined />, tooltip: 'Window/Level (W)' },
    { name: 'Length', icon: <LineOutlined />, tooltip: 'Measure Length (L)' },
    { name: 'RectangleROI', icon: <BorderOutlined />, tooltip: 'Rectangle ROI (R)' },
  ];

  return (
    <div className={`${styles.toolbar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.toolbarContent}>
        <Space split={<Divider type="vertical" className={styles.divider} />} size="middle">
          {/* Tools */}
          <Space size="small">
            {tools.map((tool) => (
              <Tooltip key={tool.name} title={tool.tooltip} placement="top">
                <Button
                  type={activeTool === tool.name ? 'primary' : 'default'}
                  icon={tool.icon}
                  size="small"
                  onClick={() => handleToolClick(tool.name)}
                  className={styles.toolButton}
                  style={{
                    background: activeTool === tool.name ? undefined : 'rgba(255, 255, 255, 0.15)',
                    borderColor: activeTool === tool.name ? undefined : 'rgba(166, 127, 205, 0.5)',
                    color: activeTool === tool.name ? undefined : '#f3edf7',
                  }}
                />
              </Tooltip>
            ))}
          </Space>

          {/* Zoom Controls */}
          <Space size="small">
            <Tooltip title="Zoom Out (-)" placement="top">
              <Button
                icon={<MinusOutlined />}
                size="small"
                onClick={handleZoomOut}
                disabled={currentZoom <= 0.1}
                className={styles.toolButton}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(166, 127, 205, 0.5)',
                  color: '#f3edf7',
                }}
              />
            </Tooltip>

            <Dropdown menu={{ items: zoomPresets }} placement="top" trigger={['click']}>
              <Button
                size="small"
                className={styles.zoomButton}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderColor: 'rgba(166, 127, 205, 0.6)',
                  color: '#ffffff',
                  fontWeight: 600,
                  minWidth: 60,
                }}
              >
                {(currentZoom * 100).toFixed(0)}% <DownOutlined style={{ fontSize: 10 }} />
              </Button>
            </Dropdown>

            <Tooltip title="Zoom In (+)" placement="top">
              <Button
                icon={<PlusOutlined />}
                size="small"
                onClick={handleZoomIn}
                disabled={currentZoom >= 10}
                className={styles.toolButton}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(166, 127, 205, 0.5)',
                  color: '#f3edf7',
                }}
              />
            </Tooltip>
          </Space>

          {/* Reset */}
          <Tooltip title="Reset Viewport (Ctrl+Shift+R)" placement="top">
            <Button
              icon={<ReloadOutlined />}
              size="small"
              onClick={onReset}
              className={styles.toolButton}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(166, 127, 205, 0.5)',
                color: '#f3edf7',
              }}
            />
          </Tooltip>
        </Space>
      </div>
      <Button
        className={styles.collapseButton}
        icon={isCollapsed ? <DownOutlinedIcon /> : <UpOutlined />}
        size="small"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expand toolbar' : 'Collapse toolbar'}
      />
    </div>
  );
};

export default ViewerControls;

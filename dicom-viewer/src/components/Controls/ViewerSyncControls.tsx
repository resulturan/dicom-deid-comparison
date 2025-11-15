/**
 * Viewer Synchronization Controls Component
 * Allows users to toggle synchronization settings between dual viewers
 */

import { Card, Switch, Space, Typography, Divider, Tooltip, Row, Col, Button } from 'antd';
import {
  SyncOutlined,
  ArrowsAltOutlined,
  ZoomInOutlined,
  ColumnWidthOutlined,
  ReloadOutlined,
  FileImageOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@store';
import { toggleSync, updateSyncSettings, resetViewports } from '@store/slices/viewerSlice';
import { useState } from 'react';

const { Text, Title } = Typography;

const ViewerSyncControls = () => {
  const dispatch = useAppDispatch();
  const { sync } = useAppSelector((state) => state.viewer);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleSync = () => {
    dispatch(toggleSync());
  };

  const handleSyncSettingChange = (setting: string, value: boolean) => {
    console.log('Updating sync setting:', setting, 'to', value, 'Current sync state:', sync);
    dispatch(updateSyncSettings({ [setting]: value }));
  };

  const handleResetViewports = () => {
    dispatch(resetViewports());
  };

  return (
    <Card
      size="small"
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 300,
        zIndex: 100,
        background: 'rgba(26, 26, 26, 0.95)',
        border: '1px solid #333',
      }}
      bodyStyle={{ padding: 12 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* Header */}
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <SyncOutlined spin={sync.isEnabled} style={{ color: sync.isEnabled ? '#52c41a' : '#999' }} />
              <Title level={5} style={{ margin: 0, color: '#ccc' }}>
                Viewer Sync
              </Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Reset all viewports">
                <ReloadOutlined
                  onClick={handleResetViewports}
                  style={{ color: '#999', cursor: 'pointer', fontSize: 16 }}
                />
              </Tooltip>
              <Tooltip title={isCollapsed ? 'Expand' : 'Collapse'}>
                <Button
                  type="text"
                  size="small"
                  icon={isCollapsed ? <DownOutlined /> : <UpOutlined />}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  style={{ color: '#999' }}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>

        {!isCollapsed && (
          <>
            <Divider style={{ margin: '8px 0', borderColor: '#333' }} />

        {/* Master Sync Toggle */}
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <SyncOutlined />
              <Text style={{ color: '#ccc', fontWeight: 500 }}>Enable Sync</Text>
            </Space>
          </Col>
          <Col>
            <Switch
              checked={sync.isEnabled}
              onChange={handleToggleSync}
              checkedChildren="ON"
              unCheckedChildren="OFF"
            />
          </Col>
        </Row>

        <Divider style={{ margin: '8px 0', borderColor: '#333' }} />

        {/* Individual Sync Options */}
        <Space direction="vertical" style={{ width: '100%', opacity: sync.isEnabled ? 1 : 0.5 }} size="small">
          {/* Scroll Sync */}
          <Row justify="space-between" align="middle">
            <Col>
              <Tooltip title="Synchronize slice scrolling between viewers">
                <Space size="small">
                  <FileImageOutlined style={{ fontSize: 14, color: '#999' }} />
                  <Text style={{ color: '#aaa', fontSize: 13 }}>Scroll</Text>
                </Space>
              </Tooltip>
            </Col>
            <Col>
              <Switch
                size="small"
                checked={sync.syncScroll}
                onChange={(checked) => handleSyncSettingChange('syncScroll', checked)}
                disabled={!sync.isEnabled}
              />
            </Col>
          </Row>

          {/* Pan Sync */}
          <Row justify="space-between" align="middle">
            <Col>
              <Tooltip title="Synchronize pan/translation between viewers">
                <Space size="small">
                  <ArrowsAltOutlined style={{ fontSize: 14, color: '#999' }} />
                  <Text style={{ color: '#aaa', fontSize: 13 }}>Pan</Text>
                </Space>
              </Tooltip>
            </Col>
            <Col>
              <Switch
                size="small"
                checked={sync.syncPan}
                onChange={(checked) => handleSyncSettingChange('syncPan', checked)}
                disabled={!sync.isEnabled}
              />
            </Col>
          </Row>

          {/* Zoom Sync */}
          <Row justify="space-between" align="middle">
            <Col>
              <Tooltip title="Synchronize zoom level between viewers">
                <Space size="small">
                  <ZoomInOutlined style={{ fontSize: 14, color: '#999' }} />
                  <Text style={{ color: '#aaa', fontSize: 13 }}>Zoom</Text>
                </Space>
              </Tooltip>
            </Col>
            <Col>
              <Switch
                size="small"
                checked={sync.syncZoom}
                onChange={(checked) => handleSyncSettingChange('syncZoom', checked)}
                disabled={!sync.isEnabled}
              />
            </Col>
          </Row>

          {/* Window/Level Sync */}
          <Row justify="space-between" align="middle">
            <Col>
              <Tooltip title="Synchronize window width and level between viewers">
                <Space size="small">
                  <ColumnWidthOutlined style={{ fontSize: 14, color: '#999' }} />
                  <Text style={{ color: '#aaa', fontSize: 13 }}>Window/Level</Text>
                </Space>
              </Tooltip>
            </Col>
            <Col>
              <Switch
                size="small"
                checked={sync.syncWindowLevel}
                onChange={(checked) => handleSyncSettingChange('syncWindowLevel', checked)}
                disabled={!sync.isEnabled}
              />
            </Col>
          </Row>
        </Space>

            {/* Info Text */}
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8, color: '#fff' }}>
              {sync.isEnabled
                ? 'Viewers are synchronized. Interactions on one viewer will affect the other.'
                : 'Synchronization is disabled. Viewers can be controlled independently.'}
            </Text>
          </>
        )}
      </Space>
    </Card>
  );
};

export default ViewerSyncControls;

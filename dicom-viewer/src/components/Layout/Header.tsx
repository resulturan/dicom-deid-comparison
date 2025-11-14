import { Layout, Button, Space, Typography, Tooltip, Badge } from 'antd';
import {
  UploadOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  SafetyOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@store';
import { toggleUploadDrawer, toggleMetadataDrawer, toggleSettingsDrawer, toggleExportDrawer, toggleNotificationDrawer } from '@store/slices/uiSlice';
import { deidentifyAllFiles } from '@store/slices/dicomThunks';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = () => {
  const dispatch = useAppDispatch();
  const { originalFiles, deidentifiedFiles, isProcessing } = useAppSelector((state) => state.dicom);
  const { notifications } = useAppSelector((state) => state.ui);

  const handleDeidentify = () => {
    dispatch(deidentifyAllFiles());
  };

  const handleShowShortcuts = () => {
    window.dispatchEvent(new CustomEvent('shortcuts-modal-requested'));
  };

  const hasFiles = originalFiles.length > 0;
  const hasDeidentified = deidentifiedFiles.length > 0;
  const notificationCount = notifications.length;

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        height: 64,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <InfoCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
        <Title level={4} style={{ margin: 0 }}>
          DICOM Deidentification Viewer
        </Title>
      </div>

      <Space size="middle">
        <Tooltip title="Upload DICOM files (Ctrl+U)">
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => dispatch(toggleUploadDrawer())}
          >
            Upload DICOM
          </Button>
        </Tooltip>
        <Tooltip title="Deidentify all files (Ctrl+D)">
          <Button
            type={hasDeidentified ? 'default' : 'primary'}
            icon={<SafetyOutlined />}
            onClick={handleDeidentify}
            disabled={!hasFiles || isProcessing}
            danger={!hasDeidentified}
          >
            {hasDeidentified ? 'Re-Deidentify' : 'Deidentify'}
          </Button>
        </Tooltip>
        <Tooltip title="Export files (Ctrl+E)">
          <Button
            icon={<DownloadOutlined />}
            onClick={() => dispatch(toggleExportDrawer())}
            disabled={!hasDeidentified}
          >
            Export
          </Button>
        </Tooltip>
        <Tooltip title="View metadata comparison (Ctrl+M)">
          <Button
            icon={<FileTextOutlined />}
            onClick={() => dispatch(toggleMetadataDrawer())}
          >
            Metadata
          </Button>
        </Tooltip>
        <Tooltip title="Deidentification settings (Ctrl+,)">
          <Button
            icon={<SettingOutlined />}
            onClick={() => dispatch(toggleSettingsDrawer())}
          >
            Settings
          </Button>
        </Tooltip>
        <Tooltip title="Keyboard shortcuts (Shift+?)">
          <Button
            icon={<QuestionCircleOutlined />}
            onClick={handleShowShortcuts}
          >
            Help
          </Button>
        </Tooltip>
        <Tooltip title="View notifications">
          <Badge count={notificationCount} showZero={false} offset={[-2, 2]}>
            <Button
              icon={<BellOutlined />}
              onClick={() => dispatch(toggleNotificationDrawer())}
            >
              Notifications
            </Button>
          </Badge>
        </Tooltip>
      </Space>
    </AntHeader>
  );
};

export default Header;

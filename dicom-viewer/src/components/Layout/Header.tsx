import { Layout, Button, Space, Typography } from 'antd';
import {
  UploadOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@store';
import { toggleUploadDrawer, toggleMetadataDrawer, toggleSettingsDrawer } from '@store/slices/uiSlice';
import { deidentifyAllFiles } from '@store/slices/dicomThunks';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = () => {
  const dispatch = useAppDispatch();
  const { originalFiles, deidentifiedFiles, isProcessing } = useAppSelector((state) => state.dicom);

  const handleDeidentify = () => {
    dispatch(deidentifyAllFiles());
  };

  const hasFiles = originalFiles.length > 0;
  const hasDeidentified = deidentifiedFiles.length > 0;

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
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => dispatch(toggleUploadDrawer())}
        >
          Upload DICOM
        </Button>
        <Button
          type={hasDeidentified ? 'default' : 'primary'}
          icon={<SafetyOutlined />}
          onClick={handleDeidentify}
          disabled={!hasFiles || isProcessing}
          danger={!hasDeidentified}
        >
          {hasDeidentified ? 'Re-Deidentify' : 'Deidentify'}
        </Button>
        <Button
          icon={<FileTextOutlined />}
          onClick={() => dispatch(toggleMetadataDrawer())}
        >
          Metadata
        </Button>
        <Button
          icon={<SettingOutlined />}
          onClick={() => dispatch(toggleSettingsDrawer())}
        >
          Settings
        </Button>
      </Space>
    </AntHeader>
  );
};

export default Header;

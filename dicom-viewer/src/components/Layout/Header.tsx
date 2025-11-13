import { Layout, Button, Space, Typography } from 'antd';
import {
  UploadOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useAppDispatch } from '@store';
import { toggleUploadDrawer, toggleMetadataDrawer, toggleSettingsDrawer } from '@store/slices/uiSlice';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = () => {
  const dispatch = useAppDispatch();

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

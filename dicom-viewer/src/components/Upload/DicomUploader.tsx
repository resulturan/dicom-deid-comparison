import { Drawer, Upload, Typography, List, Button, Space } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useAppDispatch, useAppSelector } from '@store';
import { closeUploadDrawer } from '@store/slices/uiSlice';
import { addFiles, removeFile, clearFiles } from '@store/slices/dicomSlice';

const { Dragger } = Upload;
const { Title, Text } = Typography;

const DicomUploader = () => {
  const dispatch = useAppDispatch();
  const { uploadDrawerOpen } = useAppSelector((state) => state.ui);
  const { originalFiles } = useAppSelector((state) => state.dicom);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: '.dcm,.dicom',
    beforeUpload: (file) => {
      // Add file to Redux store instead of uploading
      dispatch(addFiles([file]));
      return false; // Prevent auto upload
    },
    showUploadList: false,
  };

  return (
    <Drawer
      title="Upload DICOM Files"
      placement="right"
      width={500}
      onClose={() => dispatch(closeUploadDrawer())}
      open={uploadDrawerOpen}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag DICOM files to this area</p>
            <p className="ant-upload-hint">
              Support for single or multiple file upload. Accepts .dcm and .dicom files.
            </p>
          </Dragger>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Title level={5} style={{ margin: 0 }}>
              Uploaded Files ({originalFiles.length})
            </Title>
            {originalFiles.length > 0 && (
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => dispatch(clearFiles())}
              >
                Clear All
              </Button>
            )}
          </div>

          <List
            size="small"
            bordered
            dataSource={originalFiles}
            locale={{ emptyText: 'No files uploaded yet' }}
            renderItem={(file) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => dispatch(removeFile(file.id))}
                  >
                    Remove
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={file.fileName}
                  description={
                    <Space size="small">
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {file.status}
                      </Text>
                      {file.status === 'processing' && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          - {file.progress}%
                        </Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </Space>
    </Drawer>
  );
};

export default DicomUploader;

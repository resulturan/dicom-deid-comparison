import { Drawer, Upload, Typography, List, Button, Space, Progress, Tag, Statistic, Row, Col } from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useAppDispatch, useAppSelector } from '@store';
import { closeUploadDrawer } from '@store/slices/uiSlice';
import { useDicomUpload } from '@hooks/useDicomUpload';
import { formatFileSize } from '@services/dicom/validator';
import { formatDicomDate } from '@services/dicom/parser';

const { Dragger } = Upload;
const { Title, Text } = Typography;

const DicomUploader = () => {
  const dispatch = useAppDispatch();
  const { uploadDrawerOpen } = useAppSelector((state) => state.ui);
  const {
    files,
    statistics,
    handleFileUpload,
    handleRemoveFile,
    handleClearFiles,
  } = useDicomUpload();

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: '.dcm,.dicom',
    beforeUpload: (_file, fileList) => {
      // Process all files
      handleFileUpload(fileList);
      return false; // Prevent auto upload
    },
    showUploadList: false,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case 'processing':
      case 'uploading':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      default:
        return <FileImageOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'default', text: 'Pending' },
      uploading: { color: 'processing', text: 'Uploading' },
      processing: { color: 'processing', text: 'Processing' },
      complete: { color: 'success', text: 'Complete' },
      error: { color: 'error', text: 'Error' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <Drawer
      title="Upload DICOM Files"
      placement="right"
      width={600}
      onClose={() => dispatch(closeUploadDrawer())}
      open={uploadDrawerOpen}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Upload Area */}
        <div>
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag DICOM files to this area</p>
            <p className="ant-upload-hint">
              Support for single or multiple file upload. Accepts .dcm and .dicom files (max 100MB per file).
            </p>
          </Dragger>
        </div>

        {/* Statistics */}
        {files.length > 0 && (
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="Total" value={statistics.total} />
            </Col>
            <Col span={6}>
              <Statistic
                title="Complete"
                value={statistics.complete}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Processing"
                value={statistics.processing}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Errors"
                value={statistics.error}
                valueStyle={{ color: '#f5222d' }}
              />
            </Col>
          </Row>
        )}

        {/* File List */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              Files ({files.length})
            </Title>
            {files.length > 0 && (
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleClearFiles}
              >
                Clear All
              </Button>
            )}
          </div>

          <List
            size="small"
            bordered
            dataSource={files}
            locale={{ emptyText: 'No files uploaded yet' }}
            renderItem={(file) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveFile(file.id)}
                  >
                    Remove
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={getStatusIcon(file.status)}
                  title={
                    <Space>
                      <Text strong>{file.fileName}</Text>
                      {getStatusTag(file.status)}
                    </Space>
                  }
                  description={
                    <div>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Size: {formatFileSize(file.file.size)}
                        </Text>
                        {file.metadata && (
                          <>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Patient: {file.metadata.patientName || 'N/A'}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Modality: {file.metadata.modality || 'N/A'} | Date:{' '}
                              {formatDicomDate(file.metadata.studyDate)}
                            </Text>
                            {file.metadata.rows && file.metadata.columns && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Dimensions: {file.metadata.columns} × {file.metadata.rows}
                              </Text>
                            )}
                          </>
                        )}
                        {(file.status === 'processing' || file.status === 'uploading') && (
                          <Progress
                            percent={file.progress}
                            size="small"
                            status="active"
                          />
                        )}
                        {file.error && (
                          <Text type="danger" style={{ fontSize: 12 }}>
                            {file.error}
                          </Text>
                        )}
                      </Space>
                    </div>
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

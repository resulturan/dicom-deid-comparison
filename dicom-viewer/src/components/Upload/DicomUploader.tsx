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
import { useRef, useEffect } from 'react';

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
  const uploadedFilesRef = useRef<Set<string>>(new Set());

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: '.dcm,.dicom',
    beforeUpload: (file, fileList) => {
      console.log('beforeUpload called - file:', file.name, 'fileList length:', fileList.length);

      // Only process when we have the full list (this is the last file)
      if (file === fileList[fileList.length - 1]) {
        console.log('Processing batch of', fileList.length, 'files');

        // Filter out duplicates based on name and size
        const newFiles = fileList.filter(f => {
          const key = `${f.name}-${f.size}-${f.lastModified}`;
          if (uploadedFilesRef.current.has(key)) {
            console.log('Skipping duplicate:', f.name);
            return false;
          }
          uploadedFilesRef.current.add(key);
          return true;
        });

        if (newFiles.length > 0) {
          console.log('Uploading', newFiles.length, 'new files:', newFiles.map(f => f.name));
          handleFileUpload(newFiles);
        }
      }

      // Prevent default upload behavior
      return false;
    },
    showUploadList: false,
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup handled by component
    };
  }, []);

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
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FileImageOutlined style={{ fontSize: 20, color: '#4096ff' }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>Upload DICOM Files</span>
        </div>
      }
      placement="right"
      width={650}
      onClose={() => dispatch(closeUploadDrawer())}
      open={uploadDrawerOpen}
      styles={{
        header: {
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderBottom: '1px solid rgba(64, 150, 255, 0.3)',
        },
        body: {
          background: '#0a0a0a',
          padding: '24px',
        },
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Upload Area */}
        <div>
          <Dragger
            {...uploadProps}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: '2px dashed rgba(64, 150, 255, 0.4)',
              borderRadius: 12,
              padding: '40px 20px',
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 64, color: '#4096ff' }} />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 16 }}>
              Click or drag DICOM files here
            </p>
            <p className="ant-upload-hint" style={{ fontSize: 14, color: '#aaa', marginTop: 8 }}>
              Support for single or multiple file upload
              <br />
              Accepts <Text code style={{ background: 'rgba(64, 150, 255, 0.2)', color: '#4096ff', padding: '2px 8px', borderRadius: 4 }}>.dcm</Text> and{' '}
              <Text code style={{ background: 'rgba(64, 150, 255, 0.2)', color: '#4096ff', padding: '2px 8px', borderRadius: 4 }}>.dicom</Text> files (max 100MB per file)
            </p>
          </Dragger>
        </div>

        {/* Statistics */}
        {files.length > 0 && (
          <div
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: 12,
              padding: '20px',
              border: '1px solid rgba(64, 150, 255, 0.2)',
            }}
          >
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title={<span style={{ color: '#999' }}>Total</span>}
                  value={statistics.total}
                  valueStyle={{ color: '#fff', fontWeight: 600 }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title={<span style={{ color: '#999' }}>Complete</span>}
                  value={statistics.complete}
                  valueStyle={{ color: '#52c41a', fontWeight: 600 }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title={<span style={{ color: '#999' }}>Processing</span>}
                  value={statistics.processing}
                  valueStyle={{ color: '#1890ff', fontWeight: 600 }}
                  prefix={<LoadingOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title={<span style={{ color: '#999' }}>Errors</span>}
                  value={statistics.error}
                  valueStyle={{ color: '#f5222d', fontWeight: 600 }}
                  prefix={<CloseCircleOutlined />}
                />
              </Col>
            </Row>
          </div>
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
                onClick={() => {
                  uploadedFilesRef.current.clear();
                  handleClearFiles();
                }}
              >
                Clear All
              </Button>
            )}
          </div>

          <List
            size="small"
            bordered
            style={{
              background: '#1a1a1a',
              borderColor: 'rgba(64, 150, 255, 0.2)',
              borderRadius: 8,
            }}
            dataSource={files}
            locale={{ emptyText: 'No files uploaded yet' }}
            renderItem={(file) => (
              <List.Item
                style={{
                  background: file.status === 'complete' ? 'rgba(82, 196, 26, 0.05)' :
                             file.status === 'error' ? 'rgba(245, 34, 45, 0.05)' :
                             'transparent',
                  borderBottom: '1px solid rgba(64, 150, 255, 0.1)',
                  padding: '12px 16px',
                }}
                actions={[
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveFile(file.id)}
                    style={{ color: '#ff4d4f' }}
                  >
                    Remove
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={getStatusIcon(file.status)}
                  title={
                    <Space>
                      <Text strong style={{ color: '#fff' }}>{file.fileName}</Text>
                      {getStatusTag(file.status)}
                    </Space>
                  }
                  description={
                    <div>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Text type="secondary" style={{ fontSize: 12, color: '#999' }}>
                          Size: {formatFileSize(file.file.size)}
                        </Text>
                        {file.metadata && (
                          <>
                            <Text type="secondary" style={{ fontSize: 12, color: '#999' }}>
                              Patient: {file.metadata.patientName || 'N/A'}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12, color: '#999' }}>
                              Modality: {file.metadata.modality || 'N/A'} | Date:{' '}
                              {formatDicomDate(file.metadata.studyDate)}
                            </Text>
                            {file.metadata.rows && file.metadata.columns && (
                              <Text type="secondary" style={{ fontSize: 12, color: '#999' }}>
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
                            strokeColor={{
                              '0%': '#4096ff',
                              '100%': '#1677ff',
                            }}
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

import { Drawer, Upload, Typography, List, Button, Space, Progress, Tag, Statistic, Row, Col } from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import { useAppDispatch, useAppSelector } from '@store';
import { closeUploadDrawer } from '@store/slices/uiSlice';
import { useDicomUpload } from '@hooks/useDicomUpload';
import { formatFileSize } from '@services/dicom/validator';
import { formatDicomDate } from '@services/dicom/parser';
import { useRef, useEffect, useCallback } from 'react';

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const processedFilesRef = useRef<Set<string>>(new Set());

  // Handle file selection from native input
  const handleNativeFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      console.log('Native file input: Selected', files.length, 'files:', files.map(f => f.name));
      
      // Filter out already processed files
      const newFiles = files.filter(file => {
        const key = `${file.name}-${file.size}`;
        if (processedFilesRef.current.has(key)) {
          console.log('Skipping already processed file:', file.name);
          return false;
        }
        processedFilesRef.current.add(key);
        return true;
      });
      
      if (newFiles.length > 0) {
        console.log('Processing', newFiles.length, 'new files');
        handleFileUpload(newFiles);
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [handleFileUpload]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: '.dcm,.dicom',
    customRequest: ({ file, onSuccess, onError }) => {
      // Custom request handler - we don't actually upload, just mark as success
      // This allows files to stay in fileList
      console.log('customRequest called with file:', (file as File).name);
      setTimeout(() => {
        onSuccess?.({});
      }, 10);
    },
    beforeUpload: () => {
      // Don't return false - let customRequest handle it
      // This ensures files are added to fileList
      return true;
    },
    onChange: (info) => {
      console.log('onChange - fileList length:', info.fileList.length);
      console.log('onChange - fileList details:', info.fileList.map(f => ({
        name: f.name,
        uid: f.uid,
        status: f.status,
        hasOriginFileObj: !!f.originFileObj,
        originFileObjType: f.originFileObj ? typeof f.originFileObj : 'none'
      })));
      
      // Wait a bit to ensure all files are in the fileList
      setTimeout(() => {
        // Extract all files from fileList
        const allFiles: File[] = [];
        info.fileList.forEach((fileItem: UploadFile) => {
          // Try to get the File object
          let file = fileItem.originFileObj;
          if (!file) {
            file = (fileItem as any).file;
          }
          if (!file && (fileItem as any).response) {
            file = (fileItem as any).response.file;
          }
          
          if (file instanceof File) {
            const key = `${file.name}-${file.size}`;
            if (!processedFilesRef.current.has(key)) {
              allFiles.push(file);
              processedFilesRef.current.add(key);
              console.log('Extracted file from fileList:', file.name);
            }
          } else {
            console.warn('Could not extract File for:', fileItem.name, {
              hasOriginFileObj: !!fileItem.originFileObj,
              fileItemKeys: Object.keys(fileItem)
            });
          }
        });
        
        if (allFiles.length > 0) {
          console.log('=== PROCESSING FILES FROM onChange ===');
          console.log('Total files to process:', allFiles.length);
          console.log('File names:', allFiles.map(f => f.name));
          handleFileUpload(allFiles);
        } else {
          console.log('No new files to process');
        }
      }, 200); // Delay to collect all files
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
                onClick={() => {
                  processedFilesRef.current.clear();
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

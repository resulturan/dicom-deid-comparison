import { Row, Col, Card, Typography, Space, Tag, Select, Descriptions } from 'antd';
import { EyeOutlined, SafetyOutlined, FileImageOutlined, InboxOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@store';
import { useDicomUpload } from '@hooks/useDicomUpload';
import { formatDicomDate, formatDicomTime } from '@services/dicom/parser';
import { toggleUploadDrawer } from '@store/slices/uiSlice';
import DicomViewer from './DicomViewer';
import ViewerSyncControls from '@components/Controls/ViewerSyncControls';
import EmptyState from '@components/Layout/EmptyState';

const { Text } = Typography;

const DualViewerContainer = () => {
  const dispatch = useAppDispatch();
  const { originalFiles, deidentifiedFiles, currentFileIndex } = useAppSelector((state) => state.dicom);
  const { handleSelectFile } = useDicomUpload();

  const hasFiles = originalFiles.length > 0;
  const currentFile = originalFiles[currentFileIndex];
  const currentDeidentifiedFile = deidentifiedFiles[currentFileIndex];
  const hasMetadata = currentFile?.metadata;
  const hasDeidentified = deidentifiedFiles.length > 0;

  return (
    <div style={{ height: 'calc(100vh - 64px)', padding: '16px', background: '#000' }}>
      <Row gutter={16} style={{ height: '100%' }}>
        {/* Original Viewer */}
        <Col span={12} style={{ height: '100%' }}>
          <Card
            style={{ height: '100%', background: '#1a1a1a' }}
            bodyStyle={{
              height: 'calc(100% - 57px)',
              display: 'flex',
              flexDirection: 'column',
              background: '#000',
              padding: hasFiles ? '24px' : '0',
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <EyeOutlined />
                <span>Original DICOM</span>
              </div>
            }
          >
            {!hasFiles ? (
              <EmptyState
                icon={<InboxOutlined style={{ fontSize: 72, color: '#666' }} />}
                title="No DICOM Files"
                description="Upload DICOM files to get started with deidentification and comparison. Supports .dcm and .dicom file formats."
                action={{
                  label: 'Upload DICOM Files',
                  onClick: () => dispatch(toggleUploadDrawer()),
                  icon: <FileImageOutlined />,
                }}
                style={{ padding: '40px 24px' }}
              />
            ) : (
              <>
                {/* File Selector */}
                {originalFiles.length > 1 && (
                  <div style={{ marginBottom: 16 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text style={{ color: '#888', fontSize: 12 }}>Select File:</Text>
                      <Select
                        style={{ width: '100%' }}
                        value={currentFileIndex}
                        onChange={handleSelectFile}
                        options={originalFiles.map((file, index) => ({
                          value: index,
                          label: (
                            <Space>
                              <FileImageOutlined />
                              {file.fileName}
                              {file.status === 'complete' && (
                                <Tag color="success" style={{ marginLeft: 8 }}>Ready</Tag>
                              )}
                            </Space>
                          ),
                        }))}
                      />
                    </Space>
                  </div>
                )}

                {/* DICOM Viewer */}
                <div style={{ flex: 1, minHeight: '300px' }}>
                  <DicomViewer file={currentFile} viewerId="left" />
                </div>

                {/* File Metadata */}
                {hasMetadata && currentFile?.metadata && (
                  <div style={{ marginTop: 16, maxHeight: '200px', overflowY: 'auto' }}>
                    <Descriptions
                      size="small"
                      column={2}
                      bordered
                      style={{ background: '#1a1a1a' }}
                      labelStyle={{ background: '#252525', color: '#999', fontWeight: 500 }}
                      contentStyle={{ background: '#1a1a1a', color: '#ccc' }}
                    >
                      <Descriptions.Item label="Patient Name" span={2}>
                        {currentFile.metadata?.patientName || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Patient ID">
                        {currentFile.metadata?.patientID || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Modality">
                        <Tag color="processing">{currentFile.metadata?.modality || 'N/A'}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Study Date">
                        {formatDicomDate(currentFile.metadata?.studyDate)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Study Time">
                        {formatDicomTime(currentFile.metadata?.studyTime)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Dimensions" span={2}>
                        {currentFile.metadata?.columns && currentFile.metadata?.rows
                          ? `${currentFile.metadata.columns} × ${currentFile.metadata.rows} pixels`
                          : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Study Description" span={2}>
                        {currentFile.metadata?.studyDescription || 'N/A'}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                )}
              </>
            )}
          </Card>
        </Col>

        {/* Deidentified Viewer */}
        <Col span={12} style={{ height: '100%' }}>
          <Card
            style={{ height: '100%', background: '#1a1a1a' }}
            bodyStyle={{
              height: 'calc(100% - 57px)',
              display: 'flex',
              flexDirection: 'column',
              background: '#000',
              padding: hasFiles ? '24px' : '0',
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SafetyOutlined />
                <span>Deidentified DICOM</span>
                {hasDeidentified && (
                  <Tag color="success" style={{ marginLeft: 8 }}>
                    {deidentifiedFiles.length} file(s) deidentified
                  </Tag>
                )}
              </div>
            }
          >
            {!hasFiles ? (
              <EmptyState
                icon={<InboxOutlined style={{ fontSize: 72, color: '#666' }} />}
                title="No DICOM Files"
                description="Upload DICOM files to get started with deidentification and comparison."
                action={{
                  label: 'Upload DICOM Files',
                  onClick: () => dispatch(toggleUploadDrawer()),
                  icon: <FileImageOutlined />,
                }}
                style={{ padding: '40px 24px' }}
              />
            ) : !hasDeidentified ? (
              <EmptyState
                icon={<SafetyOutlined style={{ fontSize: 72, color: '#666' }} />}
                title="No Deidentified Files Yet"
                description="Deidentify your DICOM files to remove protected health information (PHI) while preserving clinical utility. The deidentified version will appear here for comparison."
                style={{ padding: '40px 24px' }}
              />
            ) : (
              <>
                {/* Deidentified Viewer */}
                <div style={{ flex: 1, minHeight: '300px' }}>
                  <DicomViewer file={currentDeidentifiedFile} viewerId="right" />
                </div>

                {/* Deidentified Metadata */}
                {currentDeidentifiedFile?.metadata && (
                  <div style={{ marginTop: 16, maxHeight: '200px', overflowY: 'auto' }}>
                    <Descriptions
                      size="small"
                      column={2}
                      bordered
                      style={{ background: '#1a1a1a' }}
                      labelStyle={{ background: '#252525', color: '#999', fontWeight: 500 }}
                      contentStyle={{ background: '#1a1a1a', color: '#ccc' }}
                    >
                      <Descriptions.Item label="Patient Name" span={2}>
                        <Tag color="success">{currentDeidentifiedFile.metadata?.patientName || 'N/A'}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Patient ID">
                        <Tag color="success">{currentDeidentifiedFile.metadata?.patientID || 'N/A'}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Modality">
                        <Tag color="processing">{currentDeidentifiedFile.metadata?.modality || 'N/A'}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Study Date">
                        {formatDicomDate(currentDeidentifiedFile.metadata?.studyDate)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Study Time">
                        {formatDicomTime(currentDeidentifiedFile.metadata?.studyTime)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Dimensions" span={2}>
                        {currentDeidentifiedFile.metadata?.columns && currentDeidentifiedFile.metadata?.rows
                          ? `${currentDeidentifiedFile.metadata.columns} × ${currentDeidentifiedFile.metadata.rows} pixels`
                          : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Study Description" span={2}>
                        {currentDeidentifiedFile.metadata?.studyDescription || 'N/A'}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* Viewer Synchronization Controls */}
      {hasFiles && <ViewerSyncControls />}
    </div>
  );
};

export default DualViewerContainer;

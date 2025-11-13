import { Row, Col, Card, Typography, Empty, Space, Tag, Select, Descriptions } from 'antd';
import { EyeOutlined, SafetyOutlined, FileImageOutlined } from '@ant-design/icons';
import { useAppSelector } from '@store';
import { useDicomUpload } from '@hooks/useDicomUpload';
import { formatDicomDate, formatDicomTime } from '@services/dicom/parser';

const { Title, Text } = Typography;

const DualViewerContainer = () => {
  const { originalFiles, currentFileIndex } = useAppSelector((state) => state.dicom);
  const { handleSelectFile } = useDicomUpload();

  const hasFiles = originalFiles.length > 0;
  const currentFile = originalFiles[currentFileIndex];
  const hasMetadata = currentFile?.metadata;

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
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty
                  description={
                    <Text style={{ color: '#888' }}>
                      Upload DICOM files to start viewing
                    </Text>
                  }
                />
              </div>
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

                {/* Viewer Placeholder */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0a0a0a',
                  border: '1px dashed #333',
                  borderRadius: '8px',
                  minHeight: '300px',
                }}>
                  <Space direction="vertical" align="center">
                    <Title level={4} style={{ color: '#666', margin: 0 }}>
                      Viewer Loading Area
                    </Title>
                    <Text style={{ color: '#555' }}>
                      OHIF Viewer will be integrated in Phase 3
                    </Text>
                    {currentFile && (
                      <Tag color="blue" style={{ marginTop: 8 }}>
                        {currentFile.fileName}
                      </Tag>
                    )}
                  </Space>
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
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000',
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SafetyOutlined />
                <span>Deidentified DICOM</span>
              </div>
            }
          >
            {!hasFiles ? (
              <Empty
                description={
                  <Text style={{ color: '#888' }}>
                    Upload DICOM files to start viewing
                  </Text>
                }
              />
            ) : (
              <Space direction="vertical" align="center">
                <Title level={4} style={{ color: '#666', margin: 0 }}>
                  Deidentified Viewer
                </Title>
                <Text style={{ color: '#555' }}>
                  Will be implemented in Phase 5
                </Text>
                <Text style={{ color: '#444', fontSize: 12 }}>
                  Synchronized with original viewer
                </Text>
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DualViewerContainer;

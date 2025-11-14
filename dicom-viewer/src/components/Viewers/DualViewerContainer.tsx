import { Row, Col, Card, Typography, Space, Tag, Select, Descriptions, Button } from 'antd';
import { EyeOutlined, SafetyOutlined, FileImageOutlined, InboxOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useEffect, useCallback, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@store';
import { useDicomUpload } from '@hooks/useDicomUpload';
import { formatDicomDate, formatDicomTime } from '@services/dicom/parser';
import { toggleUploadDrawer } from '@store/slices/uiSlice';
import { setCurrentFileIndex } from '@store/slices/dicomSlice';
import DicomViewer from './DicomViewer';
import ViewerSyncControls from '@components/Controls/ViewerSyncControls';
import EmptyState from '@components/Layout/EmptyState';

const { Text } = Typography;

const DualViewerContainer = () => {
  const dispatch = useAppDispatch();
  const { originalFiles, deidentifiedFiles, currentFileIndex } = useAppSelector((state) => state.dicom);
  const { handleSelectFile } = useDicomUpload();
  const containerRef = useRef<HTMLDivElement>(null);

  const hasFiles = originalFiles.length > 0;
  const currentFile = originalFiles[currentFileIndex];
  const currentDeidentifiedFile = deidentifiedFiles[currentFileIndex];
  const hasMetadata = currentFile?.metadata;
  const hasDeidentified = deidentifiedFiles.length > 0;
  const hasMultipleFiles = originalFiles.length > 1;

  // Debug: Log file count to help diagnose
  useEffect(() => {
    if (hasFiles) {
      console.log('DualViewerContainer: Files loaded', {
        totalFiles: originalFiles.length,
        currentIndex: currentFileIndex,
        hasMultipleFiles,
        fileNames: originalFiles.map(f => f.fileName)
      });
    }
  }, [hasFiles, originalFiles.length, currentFileIndex, hasMultipleFiles]);

  // Navigation functions
  const handlePreviousFile = useCallback(() => {
    if (hasMultipleFiles) {
      const prevIndex = currentFileIndex > 0 ? currentFileIndex - 1 : originalFiles.length - 1;
      dispatch(setCurrentFileIndex(prevIndex));
    }
  }, [dispatch, currentFileIndex, originalFiles.length, hasMultipleFiles]);

  const handleNextFile = useCallback(() => {
    if (hasMultipleFiles) {
      const nextIndex = currentFileIndex < originalFiles.length - 1 ? currentFileIndex + 1 : 0;
      dispatch(setCurrentFileIndex(nextIndex));
    }
  }, [dispatch, currentFileIndex, originalFiles.length, hasMultipleFiles]);

  // Get active tool state from both viewers
  const leftActiveTool = useAppSelector((state) => state.viewer.leftViewer.tools.activeTool);
  const rightActiveTool = useAppSelector((state) => state.viewer.rightViewer.tools.activeTool);
  const hasActiveTool = leftActiveTool !== null || rightActiveTool !== null;

  // Mouse wheel navigation - change images when no tool is active
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!hasMultipleFiles) return;

      // Check if we're over a viewer container
      const isOverViewer = (e.target as HTMLElement)?.closest('.viewer-container');
      
      // Only handle if we're over a viewer
      if (!isOverViewer) return;

      // If Ctrl or Shift is held, always navigate files
      if (e.ctrlKey || e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY > 0) {
          handleNextFile();
        } else {
          handlePreviousFile();
        }
        return;
      }

      // If no tool is active, navigate files
      if (!hasActiveTool) {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY > 0) {
          handleNextFile();
        } else {
          handlePreviousFile();
        }
      }
      // If a tool is active, let the viewer handle it (zoom/pan/etc) - don't prevent default
    };

    const container = containerRef.current;
    if (container) {
      // Use capture phase to check first, but don't always prevent
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleNextFile, handlePreviousFile, hasMultipleFiles, hasActiveTool, leftActiveTool, rightActiveTool]);

  return (
    <div ref={containerRef} style={{ height: 'calc(100vh - 64px)', padding: '16px', background: '#000' }}>
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
                {/* File Selector and Navigation - Always show when files exist */}
                <div style={{ 
                  marginBottom: 16, 
                  padding: '12px 16px', 
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  borderRadius: 8,
                  border: '1px solid rgba(64, 150, 255, 0.2)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {/* Navigation Controls Row */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      gap: 12,
                      padding: '8px 0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileImageOutlined style={{ color: '#4096ff', fontSize: 16 }} />
                        <Text strong style={{ color: '#fff', fontSize: 14 }}>
                          {hasMultipleFiles ? `File ${currentFileIndex + 1} of ${originalFiles.length}` : 'Current File'}
                        </Text>
                      </div>
                      
                      {hasMultipleFiles ? (
                        <Space size="middle">
                          <Button
                            type="primary"
                            size="middle"
                            icon={<LeftOutlined />}
                            onClick={handlePreviousFile}
                            title="Previous file (←)"
                            style={{
                              background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                              border: 'none',
                              boxShadow: '0 2px 4px rgba(64, 150, 255, 0.3)',
                              fontWeight: 600,
                              minWidth: 80
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(64, 150, 255, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(64, 150, 255, 0.3)';
                            }}
                          >
                            ← Prev
                          </Button>
                          
                          <div style={{
                            padding: '6px 16px',
                            background: 'rgba(64, 150, 255, 0.1)',
                            borderRadius: 6,
                            border: '1px solid rgba(64, 150, 255, 0.3)',
                            minWidth: 80,
                            textAlign: 'center'
                          }}>
                            <Text strong style={{ color: '#4096ff', fontSize: 14 }}>
                              {currentFileIndex + 1} / {originalFiles.length}
                            </Text>
                          </div>
                          
                          <Button
                            type="primary"
                            size="middle"
                            icon={<RightOutlined />}
                            onClick={handleNextFile}
                            title="Next file (→)"
                            style={{
                              background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                              border: 'none',
                              boxShadow: '0 2px 4px rgba(64, 150, 255, 0.3)',
                              fontWeight: 600,
                              minWidth: 80
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(64, 150, 255, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(64, 150, 255, 0.3)';
                            }}
                          >
                            Next →
                          </Button>
                        </Space>
                      ) : (
                        <Tag color="blue" style={{ padding: '4px 12px', fontSize: 12 }}>
                          1 file loaded
                        </Tag>
                      )}
                    </div>
                    
                    {/* File Selector Dropdown */}
                    <Select
                      style={{ width: '100%' }}
                      value={currentFileIndex}
                      onChange={handleSelectFile}
                      disabled={!hasMultipleFiles}
                      placeholder="Select a file"
                      size="large"
                      options={originalFiles.map((file, index) => ({
                        value: index,
                        label: (
                          <Space>
                            <FileImageOutlined style={{ color: file.status === 'complete' ? '#52c41a' : '#faad14' }} />
                            <span style={{ color: index === currentFileIndex ? '#4096ff' : 'inherit' }}>
                              {file.fileName}
                            </span>
                            {file.status === 'complete' && (
                              <Tag color="success" style={{ marginLeft: 8 }}>Ready</Tag>
                            )}
                            {file.status === 'processing' && (
                              <Tag color="processing" style={{ marginLeft: 8 }}>Processing</Tag>
                            )}
                          </Space>
                        ),
                      }))}
                    />
                  </Space>
                </div>

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

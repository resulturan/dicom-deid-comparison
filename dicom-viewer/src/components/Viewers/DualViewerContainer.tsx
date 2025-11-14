import { Row, Col, Card, Typography, Space, Tag, Select, Descriptions, Button, Collapse } from 'antd';
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
import styles from './DualViewerContainer.module.scss';

const { Text } = Typography;

const DualViewerContainer = () => {
  const dispatch = useAppDispatch();
  const { originalFiles, deidentifiedFiles, currentFileIndex } = useAppSelector((state) => state.dicom);
  const { handleSelectFile } = useDicomUpload();
  const containerRef = useRef<HTMLDivElement>(null);
  const leftScrollbarRef = useRef<HTMLDivElement>(null);
  const rightScrollbarRef = useRef<HTMLDivElement>(null);

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

  // Mouse wheel navigation - scroll to change images
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!hasMultipleFiles) return;

      // Check if we're over a viewer container
      const isOverViewer = (e.target as HTMLElement)?.closest('.viewer-container');
      
      // Only handle if we're over a viewer
      if (!isOverViewer) return;

      // If Zoom tool is active and Ctrl is held, let the viewer handle zoom (don't prevent default)
      const isZoomTool = leftActiveTool === 'Zoom' || rightActiveTool === 'Zoom';
      if (isZoomTool && e.ctrlKey) {
        // Let the viewer handle zoom - don't prevent default here
        return;
      }

      // Default behavior: scroll changes images
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY > 0) {
        handleNextFile();
      } else {
        handlePreviousFile();
      }
    };

    const container = containerRef.current;
    if (container) {
      // Use capture phase to handle before viewer's listener
      container.addEventListener('wheel', handleWheel, { passive: false, capture: true });
      return () => {
        container.removeEventListener('wheel', handleWheel, { capture: true } as EventListenerOptions);
      };
    }
  }, [handleNextFile, handlePreviousFile, hasMultipleFiles, leftActiveTool, rightActiveTool]);

  // Sync scrollbar position with current file index
  useEffect(() => {
    if (!hasMultipleFiles) return;

    const updateScrollbar = (scrollbar: HTMLDivElement | null) => {
      if (!scrollbar) return;
      const scrollHeight = scrollbar.scrollHeight - scrollbar.clientHeight;
      if (scrollHeight > 0) {
        const scrollTop = (currentFileIndex / (originalFiles.length - 1)) * scrollHeight;
        if (Math.abs(scrollbar.scrollTop - scrollTop) > 1) {
          scrollbar.scrollTop = scrollTop;
        }
      }
    };

    updateScrollbar(leftScrollbarRef.current);
    updateScrollbar(rightScrollbarRef.current);
  }, [currentFileIndex, hasMultipleFiles, originalFiles.length]);

  return (
    <div ref={containerRef} className={styles.container}>
      <Row gutter={16} className={styles.row}>
        {/* Original Viewer */}
        <Col span={12} className={styles.col}>
          <Card
            className={styles.card}
            title={
              <div className={styles.cardTitle}>
                <div className={styles.titleLeft}>
                  <EyeOutlined />
                  <span>Original DICOM</span>
                </div>
                {hasFiles && (
                  <div className={styles.titleRight}>
                    <FileImageOutlined className={styles.navigationIcon} />
                    <Select
                      className={styles.fileSelect}
                      value={currentFileIndex}
                      onChange={handleSelectFile}
                      disabled={!hasMultipleFiles}
                      placeholder="Select a file"
                      size="small"
                      options={originalFiles.map((file, index) => ({
                        value: index,
                        label: (
                          <Space>
                            <FileImageOutlined
                              style={{ color: file.status === 'complete' ? '#52c41a' : '#faad14' }}
                            />
                            <span className={index === currentFileIndex ? styles.fileNameActive : styles.fileNameInactive}>
                              {file.fileName}
                            </span>
                            {file.status === 'complete' && (
                              <Tag color="success" className={styles.tagMargin}>Ready</Tag>
                            )}
                            {file.status === 'processing' && (
                              <Tag color="processing" className={styles.tagMargin}>Processing</Tag>
                            )}
                          </Space>
                        ),
                      }))}
                    />
                    {hasMultipleFiles && (
                      <Text className={styles.fileCounterText}>
                        {currentFileIndex + 1} / {originalFiles.length}
                      </Text>
                    )}
                    {hasMultipleFiles && (
                      <Space size="small" className={styles.navigationButtons}>
                        <Button
                          type="primary"
                          size="small"
                          icon={<LeftOutlined />}
                          onClick={handlePreviousFile}
                          title="Previous file (←)"
                          className={styles.navButton}
                        />
                        <Button
                          type="primary"
                          size="small"
                          icon={<RightOutlined />}
                          onClick={handleNextFile}
                          title="Next file (→)"
                          className={styles.navButton}
                        />
                      </Space>
                    )}
                  </div>
                )}
              </div>
            }
          >
            {!hasFiles ? (
              <EmptyState
                icon={<InboxOutlined style={{ fontSize: 72 }} className={styles.emptyStateIcon} />}
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
                {/* DICOM Viewer - Full Height */}
                <div className={styles.viewerWrapper}>
                  <DicomViewer file={currentFile} viewerId="left" />
                  {hasMultipleFiles && (
                    <div 
                      className={styles.nativeScrollbar}
                      onScroll={(e) => {
                        const scrollContainer = e.currentTarget;
                        const scrollTop = scrollContainer.scrollTop;
                        const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
                        if (scrollHeight > 0) {
                          const scrollPercentage = scrollTop / scrollHeight;
                          const newIndex = Math.round(scrollPercentage * (originalFiles.length - 1));
                          const clampedIndex = Math.max(0, Math.min(originalFiles.length - 1, newIndex));
                          if (clampedIndex !== currentFileIndex) {
                            dispatch(setCurrentFileIndex(clampedIndex));
                          }
                        }
                      }}
                      ref={leftScrollbarRef}
                    >
                      <div style={{ height: `${originalFiles.length * 100}px` }} />
                    </div>
                  )}

                  {/* File Metadata - Collapsible Overlay at Bottom */}
                  {hasMetadata && currentFile?.metadata && (
                    <div className={styles.metadataOverlay}>
                      <Collapse
                        ghost
                        size="small"
                        className={styles.metadataCollapse}
                        items={[
                          {
                            key: 'metadata',
                            label: (
                              <Space>
                                <FileImageOutlined className={styles.metadataLabelIcon} />
                                <Text strong className={styles.metadataLabelText}>
                                  Metadata
                                </Text>
                              </Space>
                            ),
                            children: (
                              <div className={styles.metadataContent}>
                                <Descriptions
                                  size="small"
                                  column={2}
                                  bordered
                                >
                                  {/* Patient Information */}
                                  <Descriptions.Item label="Patient Name" span={2}>
                                    {currentFile.metadata?.patientName || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Patient ID">
                                    {currentFile.metadata?.patientID || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Patient Birth Date">
                                    {formatDicomDate(currentFile.metadata?.patientBirthDate) || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Patient Sex">
                                    {currentFile.metadata?.patientSex || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Patient Age">
                                    {currentFile.metadata?.patientAge || 'N/A'}
                                  </Descriptions.Item>

                                  {/* Study Information */}
                                  <Descriptions.Item label="Study Date">
                                    {formatDicomDate(currentFile.metadata?.studyDate)}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Study Time">
                                    {formatDicomTime(currentFile.metadata?.studyTime)}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Study Description" span={2}>
                                    {currentFile.metadata?.studyDescription || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Accession Number">
                                    {currentFile.metadata?.accessionNumber || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Study Instance UID" span={2}>
                                    <Text className={styles.uidText}>
                                      {currentFile.metadata?.studyInstanceUID || 'N/A'}
                                    </Text>
                                  </Descriptions.Item>

                                  {/* Series Information */}
                                  <Descriptions.Item label="Modality">
                                    <Tag color="processing">{currentFile.metadata?.modality || 'N/A'}</Tag>
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Series Number">
                                    {currentFile.metadata?.seriesNumber || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Series Description" span={2}>
                                    {currentFile.metadata?.seriesDescription || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Series Instance UID" span={2}>
                                    <Text className={styles.uidText}>
                                      {currentFile.metadata?.seriesInstanceUID || 'N/A'}
                                    </Text>
                                  </Descriptions.Item>

                                  {/* Image Information */}
                                  <Descriptions.Item label="Instance Number">
                                    {currentFile.metadata?.instanceNumber !== undefined
                                      ? currentFile.metadata.instanceNumber
                                      : 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Number of Frames">
                                    {currentFile.metadata?.numberOfFrames || '1'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Dimensions">
                                    {currentFile.metadata?.columns && currentFile.metadata?.rows
                                      ? `${currentFile.metadata.columns} × ${currentFile.metadata.rows} pixels`
                                      : 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="SOP Instance UID" span={2}>
                                    <Text className={styles.uidText}>
                                      {currentFile.metadata?.sopInstanceUID || 'N/A'}
                                    </Text>
                                  </Descriptions.Item>

                                  {/* Institution Information */}
                                  {(currentFile.metadata?.institutionName ||
                                    currentFile.metadata?.referringPhysicianName ||
                                    currentFile.metadata?.performingPhysicianName) && (
                                    <>
                                      {currentFile.metadata?.institutionName && (
                                        <Descriptions.Item label="Institution Name" span={2}>
                                          {currentFile.metadata.institutionName}
                                        </Descriptions.Item>
                                      )}
                                      {currentFile.metadata?.referringPhysicianName && (
                                        <Descriptions.Item label="Referring Physician" span={2}>
                                          {currentFile.metadata.referringPhysicianName}
                                        </Descriptions.Item>
                                      )}
                                      {currentFile.metadata?.performingPhysicianName && (
                                        <Descriptions.Item label="Performing Physician" span={2}>
                                          {currentFile.metadata.performingPhysicianName}
                                        </Descriptions.Item>
                                      )}
                                    </>
                                  )}
                                </Descriptions>
                              </div>
                            ),
                          },
                        ]}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* Deidentified Viewer */}
        <Col span={12} className={styles.col}>
          <Card
            className={styles.card}
            title={
              <div className={styles.cardTitle}>
                <div className={styles.titleLeft}>
                  <SafetyOutlined />
                  <span>Deidentified DICOM</span>
                  {hasDeidentified && (
                    <Tag color="success" className={styles.tagMargin}>
                      {deidentifiedFiles.length} file(s) deidentified
                    </Tag>
                  )}
                </div>
                {hasFiles && hasDeidentified && (
                  <div className={styles.titleRight}>
                    <FileImageOutlined className={styles.navigationIcon} />
                    <Select
                      className={styles.fileSelect}
                      value={currentFileIndex}
                      onChange={handleSelectFile}
                      disabled={!hasMultipleFiles}
                      placeholder="Select a file"
                      size="small"
                      options={deidentifiedFiles.map((file, index) => ({
                        value: index,
                        label: (
                          <Space>
                            <FileImageOutlined
                              style={{ color: file.status === 'complete' ? '#52c41a' : '#faad14' }}
                            />
                            <span className={index === currentFileIndex ? styles.fileNameActive : styles.fileNameInactive}>
                              {file.fileName}
                            </span>
                            {file.status === 'complete' && (
                              <Tag color="success" className={styles.tagMargin}>Ready</Tag>
                            )}
                            {file.status === 'processing' && (
                              <Tag color="processing" className={styles.tagMargin}>Processing</Tag>
                            )}
                          </Space>
                        ),
                      }))}
                    />
                    {hasMultipleFiles && (
                      <Text className={styles.fileCounterText}>
                        {currentFileIndex + 1} / {originalFiles.length}
                      </Text>
                    )}
                    {hasMultipleFiles && (
                      <Space size="small" className={styles.navigationButtons}>
                        <Button
                          type="primary"
                          size="small"
                          icon={<LeftOutlined />}
                          onClick={handlePreviousFile}
                          title="Previous file (←)"
                          className={styles.navButton}
                        />
                        <Button
                          type="primary"
                          size="small"
                          icon={<RightOutlined />}
                          onClick={handleNextFile}
                          title="Next file (→)"
                          className={styles.navButton}
                        />
                      </Space>
                    )}
                  </div>
                )}
              </div>
            }
          >
            {!hasFiles ? (
              <EmptyState
                icon={<InboxOutlined style={{ fontSize: 72 }} className={styles.emptyStateIcon} />}
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
                icon={<SafetyOutlined style={{ fontSize: 72 }} className={styles.emptyStateIcon} />}
                title="No Deidentified Files Yet"
                description="Deidentify your DICOM files to remove protected health information (PHI) while preserving clinical utility. The deidentified version will appear here for comparison."
                style={{ padding: '40px 24px' }}
              />
            ) : (
              <>
                {/* Deidentified Viewer - Full Height */}
                <div className={styles.viewerWrapper}>
                  <DicomViewer file={currentDeidentifiedFile} viewerId="right" />
                  {hasMultipleFiles && (
                    <div 
                      className={styles.nativeScrollbar}
                      onScroll={(e) => {
                        const scrollContainer = e.currentTarget;
                        const scrollTop = scrollContainer.scrollTop;
                        const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
                        if (scrollHeight > 0) {
                          const scrollPercentage = scrollTop / scrollHeight;
                          const newIndex = Math.round(scrollPercentage * (originalFiles.length - 1));
                          const clampedIndex = Math.max(0, Math.min(originalFiles.length - 1, newIndex));
                          if (clampedIndex !== currentFileIndex) {
                            dispatch(setCurrentFileIndex(clampedIndex));
                          }
                        }
                      }}
                      ref={rightScrollbarRef}
                    >
                      <div style={{ height: `${originalFiles.length * 100}px` }} />
                    </div>
                  )}

                  {/* Deidentified Metadata - Collapsible Overlay at Bottom */}
                  {currentDeidentifiedFile?.metadata && (
                    <div className={styles.metadataOverlay}>
                      <Collapse
                        ghost
                        size="small"
                        className={styles.metadataCollapse}
                        items={[
                          {
                            key: 'metadata',
                            label: (
                              <Space>
                                <FileImageOutlined className={styles.deidentifiedMetadataLabelIcon} />
                                <Text strong className={styles.deidentifiedMetadataLabelText}>
                                  Metadata
                                </Text>
                              </Space>
                            ),
                            children: (
                              <div className={styles.metadataContent}>
                                <Descriptions
                                  size="small"
                                  column={2}
                                  bordered
                                >
                                  {/* Patient Information */}
                                  <Descriptions.Item label="Patient Name" span={2}>
                                    <Tag color="success">{currentDeidentifiedFile.metadata?.patientName || 'N/A'}</Tag>
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Patient ID">
                                    <Tag color="success">{currentDeidentifiedFile.metadata?.patientID || 'N/A'}</Tag>
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Patient Birth Date">
                                    {formatDicomDate(currentDeidentifiedFile.metadata?.patientBirthDate) || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Patient Sex">
                                    {currentDeidentifiedFile.metadata?.patientSex || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Patient Age">
                                    {currentDeidentifiedFile.metadata?.patientAge || 'N/A'}
                                  </Descriptions.Item>

                                  {/* Study Information */}
                                  <Descriptions.Item label="Study Date">
                                    {formatDicomDate(currentDeidentifiedFile.metadata?.studyDate)}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Study Time">
                                    {formatDicomTime(currentDeidentifiedFile.metadata?.studyTime)}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Study Description" span={2}>
                                    {currentDeidentifiedFile.metadata?.studyDescription || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Accession Number">
                                    {currentDeidentifiedFile.metadata?.accessionNumber || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Study Instance UID" span={2}>
                                    <Text className={styles.uidText}>
                                      {currentDeidentifiedFile.metadata?.studyInstanceUID || 'N/A'}
                                    </Text>
                                  </Descriptions.Item>

                                  {/* Series Information */}
                                  <Descriptions.Item label="Modality">
                                    <Tag color="processing">{currentDeidentifiedFile.metadata?.modality || 'N/A'}</Tag>
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Series Number">
                                    {currentDeidentifiedFile.metadata?.seriesNumber || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Series Description" span={2}>
                                    {currentDeidentifiedFile.metadata?.seriesDescription || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Series Instance UID" span={2}>
                                    <Text className={styles.uidText}>
                                      {currentDeidentifiedFile.metadata?.seriesInstanceUID || 'N/A'}
                                    </Text>
                                  </Descriptions.Item>

                                  {/* Image Information */}
                                  <Descriptions.Item label="Instance Number">
                                    {currentDeidentifiedFile.metadata?.instanceNumber !== undefined
                                      ? currentDeidentifiedFile.metadata.instanceNumber
                                      : 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Number of Frames">
                                    {currentDeidentifiedFile.metadata?.numberOfFrames || '1'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Dimensions">
                                    {currentDeidentifiedFile.metadata?.columns && currentDeidentifiedFile.metadata?.rows
                                      ? `${currentDeidentifiedFile.metadata.columns} × ${currentDeidentifiedFile.metadata.rows} pixels`
                                      : 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="SOP Instance UID" span={2}>
                                    <Text className={styles.uidText}>
                                      {currentDeidentifiedFile.metadata?.sopInstanceUID || 'N/A'}
                                    </Text>
                                  </Descriptions.Item>

                                  {/* Institution Information */}
                                  {(currentDeidentifiedFile.metadata?.institutionName ||
                                    currentDeidentifiedFile.metadata?.referringPhysicianName ||
                                    currentDeidentifiedFile.metadata?.performingPhysicianName) && (
                                    <>
                                      {currentDeidentifiedFile.metadata?.institutionName && (
                                        <Descriptions.Item label="Institution Name" span={2}>
                                          {currentDeidentifiedFile.metadata.institutionName}
                                        </Descriptions.Item>
                                      )}
                                      {currentDeidentifiedFile.metadata?.referringPhysicianName && (
                                        <Descriptions.Item label="Referring Physician" span={2}>
                                          {currentDeidentifiedFile.metadata.referringPhysicianName}
                                        </Descriptions.Item>
                                      )}
                                      {currentDeidentifiedFile.metadata?.performingPhysicianName && (
                                        <Descriptions.Item label="Performing Physician" span={2}>
                                          {currentDeidentifiedFile.metadata.performingPhysicianName}
                                        </Descriptions.Item>
                                      )}
                                    </>
                                  )}
                                </Descriptions>
                              </div>
                            ),
                          },
                        ]}
                      />
                    </div>
                  )}
                </div>
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

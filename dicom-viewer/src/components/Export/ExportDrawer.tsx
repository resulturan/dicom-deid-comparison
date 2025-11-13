/**
 * Export Drawer Component
 * Provides export and download options for deidentified DICOM files
 */

import { Drawer, Button, Space, Typography, Divider, List, Tag, Alert, Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import {
  DownloadOutlined,
  FileZipOutlined,
  FileTextOutlined,
  SettingOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store';
import { closeExportDrawer } from '@store/slices/uiSlice';
import { addNotification } from '@store/slices/uiSlice';
import {
  exportDicomFile,
  exportDicomFilesAsZip,
  exportComparisonReport,
  exportDeidentificationSettings,
  exportMetadataAsCSV,
  validateFileForExport,
} from '@services/export/exportService';

const { Title, Text, Paragraph } = Typography;

const ExportDrawer = () => {
  const dispatch = useAppDispatch();
  const { exportDrawerOpen } = useAppSelector((state) => state.ui);
  const { originalFiles, deidentifiedFiles, deidentificationOptions, currentFileIndex } = useAppSelector(
    (state) => state.dicom
  );
  const [exportFormat, setExportFormat] = useState<'single' | 'zip' | 'csv'>('zip');
  const [isExporting, setIsExporting] = useState(false);

  const hasDeidentifiedFiles = deidentifiedFiles.length > 0;
  const currentFile = deidentifiedFiles[currentFileIndex];

  const handleExportSingle = async () => {
    if (!currentFile) {
      dispatch(
        addNotification({
          type: 'error',
          message: 'No file selected',
          description: 'Please select a file to export',
        })
      );
      return;
    }

    const validation = validateFileForExport(currentFile);
    if (!validation.valid) {
      dispatch(
        addNotification({
          type: 'error',
          message: 'Export failed',
          description: validation.error || 'File validation failed',
        })
      );
      return;
    }

    try {
      setIsExporting(true);
      await exportDicomFile(currentFile);
      dispatch(
        addNotification({
          type: 'success',
          message: 'Export successful',
          description: `Downloaded ${currentFile.fileName}`,
        })
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          message: 'Export failed',
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    if (deidentifiedFiles.length === 0) {
      dispatch(
        addNotification({
          type: 'error',
          message: 'No files to export',
          description: 'Please deidentify files first',
        })
      );
      return;
    }

    try {
      setIsExporting(true);

      if (exportFormat === 'zip') {
        await exportDicomFilesAsZip(deidentifiedFiles);
        dispatch(
          addNotification({
            type: 'success',
            message: 'Export successful',
            description: `Downloaded ${deidentifiedFiles.length} file(s) as ZIP`,
          })
        );
      } else if (exportFormat === 'csv') {
        exportMetadataAsCSV(deidentifiedFiles);
        dispatch(
          addNotification({
            type: 'success',
            message: 'Export successful',
            description: 'Metadata exported as CSV',
          })
        );
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          message: 'Export failed',
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportReport = () => {
    try {
      exportComparisonReport(originalFiles, deidentifiedFiles);
      dispatch(
        addNotification({
          type: 'success',
          message: 'Report exported',
          description: 'Comparison report downloaded as JSON',
        })
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          message: 'Export failed',
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      );
    }
  };

  const handleExportSettings = () => {
    try {
      exportDeidentificationSettings(deidentificationOptions);
      dispatch(
        addNotification({
          type: 'success',
          message: 'Settings exported',
          description: 'Deidentification settings downloaded as JSON',
        })
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          message: 'Export failed',
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      );
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <DownloadOutlined />
          <span>Export & Download</span>
        </Space>
      }
      placement="right"
      width={500}
      onClose={() => dispatch(closeExportDrawer())}
      open={exportDrawerOpen}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Alert */}
        {!hasDeidentifiedFiles ? (
          <Alert
            message="No deidentified files"
            description="Please deidentify files before exporting"
            type="warning"
            showIcon
          />
        ) : (
          <Alert
            message={`${deidentifiedFiles.length} file(s) ready for export`}
            type="info"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        )}

        {/* Export Format Selection */}
        <div>
          <Title level={5}>Export Format</Title>
          <Radio.Group
            value={exportFormat}
            onChange={(e: RadioChangeEvent) => setExportFormat(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value="single">
                <Space>
                  <DownloadOutlined />
                  <Text>Single DICOM File</Text>
                </Space>
              </Radio>
              <Radio value="zip">
                <Space>
                  <FileZipOutlined />
                  <Text>ZIP Archive (All Files)</Text>
                </Space>
              </Radio>
              <Radio value="csv">
                <Space>
                  <FileTextOutlined />
                  <Text>CSV Metadata</Text>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        <Divider />

        {/* Export Actions */}
        <div>
          <Title level={5}>Export Actions</Title>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {exportFormat === 'single' ? (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportSingle}
                loading={isExporting}
                disabled={!currentFile}
                block
              >
                Download Current File
              </Button>
            ) : (
              <Button
                type="primary"
                icon={exportFormat === 'zip' ? <FileZipOutlined /> : <FileTextOutlined />}
                onClick={handleExportAll}
                loading={isExporting}
                disabled={!hasDeidentifiedFiles}
                block
              >
                {exportFormat === 'zip'
                  ? `Download All as ZIP (${deidentifiedFiles.length} files)`
                  : 'Export Metadata as CSV'}
              </Button>
            )}

            <Button
              icon={<FileTextOutlined />}
              onClick={handleExportReport}
              disabled={!hasDeidentifiedFiles}
              block
            >
              Export Comparison Report (JSON)
            </Button>

            <Button icon={<SettingOutlined />} onClick={handleExportSettings} block>
              Export Deidentification Settings
            </Button>
          </Space>
        </div>

        <Divider />

        {/* File List */}
        {hasDeidentifiedFiles && (
          <div>
            <Title level={5}>Deidentified Files</Title>
            <List
              size="small"
              bordered
              dataSource={deidentifiedFiles}
              renderItem={(file, _index) => (
                <List.Item>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text ellipsis style={{ maxWidth: 300 }}>
                      {file.fileName}
                    </Text>
                    <Tag color={file.status === 'complete' ? 'success' : 'default'}>
                      {file.status}
                    </Tag>
                  </Space>
                </List.Item>
              )}
              style={{ maxHeight: 300, overflow: 'auto' }}
            />
          </div>
        )}

        {/* Information */}
        <Alert
          type="info"
          showIcon
          message="Export Information"
          description={
            <div>
              <Paragraph style={{ fontSize: 12, margin: 0 }}>
                • DICOM files contain deidentified metadata
              </Paragraph>
              <Paragraph style={{ fontSize: 12, margin: 0 }}>
                • ZIP export includes metadata.json file
              </Paragraph>
              <Paragraph style={{ fontSize: 12, margin: 0 }}>
                • Original files are never modified
              </Paragraph>
            </div>
          }
        />
      </Space>
    </Drawer>
  );
};

export default ExportDrawer;

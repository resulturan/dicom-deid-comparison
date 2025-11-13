/**
 * Metadata Comparison Component
 * Side-by-side comparison of original and deidentified DICOM metadata
 */

import { Table, Tag, Input, Space, Typography, Alert, Button, Tooltip } from 'antd';
import type { ColumnType } from 'antd/es/table';
import {
  SearchOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useState, useMemo } from 'react';
import type { DicomMetadata } from '@store/types';

const { Text } = Typography;

interface MetadataComparisonProps {
  originalMetadata: DicomMetadata;
  deidentifiedMetadata: DicomMetadata;
}

interface ComparisonRow {
  key: string;
  tag: string;
  originalValue: string | number | Record<string, any> | undefined;
  deidentifiedValue: string | number | Record<string, any> | undefined;
  status: 'unchanged' | 'modified' | 'removed';
}

const MetadataComparison = ({ originalMetadata, deidentifiedMetadata }: MetadataComparisonProps) => {
  const [searchText, setSearchText] = useState('');

  // Build comparison data
  const comparisonData = useMemo(() => {
    const rows: ComparisonRow[] = [];

    const tagMappings: Record<string, keyof DicomMetadata> = {
      'Patient Name': 'patientName',
      'Patient ID': 'patientID',
      'Patient Birth Date': 'patientBirthDate',
      'Patient Sex': 'patientSex',
      'Patient Age': 'patientAge',
      'Study Date': 'studyDate',
      'Study Time': 'studyTime',
      'Study Description': 'studyDescription',
      'Study Instance UID': 'studyInstanceUID',
      'Accession Number': 'accessionNumber',
      'Series Description': 'seriesDescription',
      'Series Number': 'seriesNumber',
      'Series Instance UID': 'seriesInstanceUID',
      'SOP Instance UID': 'sopInstanceUID',
      'Instance Number': 'instanceNumber',
      'Modality': 'modality',
      'Institution Name': 'institutionName',
      'Referring Physician': 'referringPhysicianName',
      'Performing Physician': 'performingPhysicianName',
      'Rows': 'rows',
      'Columns': 'columns',
      'Number of Frames': 'numberOfFrames',
    };

    Object.entries(tagMappings).forEach(([tagName, key]) => {
      const originalValue = originalMetadata[key];
      const deidentifiedValue = deidentifiedMetadata[key];

      let status: 'unchanged' | 'modified' | 'removed' = 'unchanged';

      if (originalValue !== undefined && deidentifiedValue === undefined) {
        status = 'removed';
      } else if (originalValue !== deidentifiedValue) {
        status = 'modified';
      }

      rows.push({
        key: tagName,
        tag: tagName,
        originalValue,
        deidentifiedValue,
        status,
      });
    });

    return rows;
  }, [originalMetadata, deidentifiedMetadata]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchText) return comparisonData;

    const lowerSearch = searchText.toLowerCase();
    return comparisonData.filter(
      (row) =>
        row.tag.toLowerCase().includes(lowerSearch) ||
        String(row.originalValue || '').toLowerCase().includes(lowerSearch) ||
        String(row.deidentifiedValue || '').toLowerCase().includes(lowerSearch)
    );
  }, [comparisonData, searchText]);

  // Export comparison to JSON
  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      original: originalMetadata,
      deidentified: deidentifiedMetadata,
      changes: comparisonData.filter((row) => row.status !== 'unchanged'),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metadata-comparison-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns: ColumnType<ComparisonRow>[] = [
    {
      title: 'Tag',
      dataIndex: 'tag',
      key: 'tag',
      width: '30%',
      render: (tag: string, record) => (
        <Space>
          {record.status === 'unchanged' && (
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 14 }} />
          )}
          {record.status === 'modified' && (
            <EditOutlined style={{ color: '#faad14', fontSize: 14 }} />
          )}
          {record.status === 'removed' && (
            <MinusCircleOutlined style={{ color: '#ff4d4f', fontSize: 14 }} />
          )}
          <Text strong>{tag}</Text>
        </Space>
      ),
    },
    {
      title: 'Original',
      dataIndex: 'originalValue',
      key: 'originalValue',
      width: '35%',
      render: (value: string | number | Record<string, any> | undefined) => (
        <Text style={{ color: '#ccc' }}>
          {value !== undefined ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : '-'}
        </Text>
      ),
    },
    {
      title: 'Deidentified',
      dataIndex: 'deidentifiedValue',
      key: 'deidentifiedValue',
      width: '35%',
      render: (value: string | number | Record<string, any> | undefined, record) => {
        if (value === undefined) {
          return <Tag color="error">REMOVED</Tag>;
        }

        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

        if (record.status === 'modified') {
          return (
            <Space>
              <Text style={{ color: '#ccc' }}>{displayValue}</Text>
              <Tag color="warning">MODIFIED</Tag>
            </Space>
          );
        }

        return <Text style={{ color: '#ccc' }}>{displayValue}</Text>;
      },
    },
  ];

  const changedCount = comparisonData.filter((row) => row.status !== 'unchanged').length;
  const removedCount = comparisonData.filter((row) => row.status === 'removed').length;
  const modifiedCount = comparisonData.filter((row) => row.status === 'modified').length;

  return (
    <div style={{ padding: '16px 0' }}>
      {/* Stats Alert */}
      <Alert
        message="Metadata Comparison Summary"
        description={
          <div>
            <Text style={{ fontSize: 12 }}>
              Total changes: <strong>{changedCount}</strong> tags •{' '}
              <Tag color="error" style={{ margin: '0 4px' }}>
                {removedCount} removed
              </Tag>
              <Tag color="warning" style={{ margin: '0 4px' }}>
                {modifiedCount} modified
              </Tag>
            </Text>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Search and Export */}
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Input
          placeholder="Search tags..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        <Tooltip title="Export comparison as JSON">
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Export
          </Button>
        </Tooltip>
      </Space>

      {/* Comparison Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{
          pageSize: 10,
          size: 'small',
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tags`,
        }}
        size="small"
        bordered
        rowClassName={(record) => {
          if (record.status === 'removed') return 'row-removed';
          if (record.status === 'modified') return 'row-modified';
          return '';
        }}
      />

      {/* Legend */}
      <div style={{ marginTop: 16, padding: '12px', background: '#1a1a1a', borderRadius: 4 }}>
        <Text type="secondary" style={{ fontSize: 12, marginRight: 16 }}>
          Legend:
        </Text>
        <Space size="large">
          <Space size="small">
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Unchanged
            </Text>
          </Space>
          <Space size="small">
            <EditOutlined style={{ color: '#faad14' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Modified
            </Text>
          </Space>
          <Space size="small">
            <MinusCircleOutlined style={{ color: '#ff4d4f' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Removed
            </Text>
          </Space>
        </Space>
      </div>
    </div>
  );
};

export default MetadataComparison;

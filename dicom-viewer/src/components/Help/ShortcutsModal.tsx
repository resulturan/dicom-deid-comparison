/**
 * Keyboard Shortcuts Modal
 * Displays all available keyboard shortcuts grouped by category
 */

import { Modal, Typography, Table, Tag, Input, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, KeyOutlined } from '@ant-design/icons';
import { useState, useEffect, useMemo } from 'react';
import { useKeyboardShortcuts, getShortcutDisplay } from '@hooks/useKeyboardShortcuts';
import type { ShortcutConfig } from '@hooks/useKeyboardShortcuts';

const { Title, Text } = Typography;

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const ShortcutsModal = ({ open, onClose }: ShortcutsModalProps) => {
  const shortcuts = useKeyboardShortcuts();
  const [searchQuery, setSearchQuery] = useState('');

  // Listen for custom event to open modal
  useEffect(() => {
    const handleOpenModal = () => {
      if (!open) {
        // Modal opening will be handled by parent component
        window.dispatchEvent(new CustomEvent('shortcuts-modal-requested'));
      }
    };

    window.addEventListener('open-shortcuts-modal', handleOpenModal);
    return () => window.removeEventListener('open-shortcuts-modal', handleOpenModal);
  }, [open]);

  // Filter shortcuts based on search query
  const filteredShortcuts = useMemo(() => {
    if (!searchQuery.trim()) {
      return shortcuts;
    }

    const query = searchQuery.toLowerCase();
    return shortcuts.filter(
      (shortcut) =>
        shortcut.description.toLowerCase().includes(query) ||
        shortcut.category.toLowerCase().includes(query) ||
        getShortcutDisplay(shortcut).toLowerCase().includes(query)
    );
  }, [shortcuts, searchQuery]);

  // Group shortcuts by category
  const groupedShortcuts = useMemo(() => {
    const groups: Record<string, ShortcutConfig[]> = {
      file: [],
      view: [],
      navigation: [],
      help: [],
    };

    filteredShortcuts.forEach((shortcut) => {
      groups[shortcut.category].push(shortcut);
    });

    return groups;
  }, [filteredShortcuts]);

  const categoryNames = {
    file: 'File Operations',
    view: 'View Operations',
    navigation: 'Navigation',
    help: 'Help',
  };

  const categoryColors = {
    file: 'blue',
    view: 'green',
    navigation: 'orange',
    help: 'purple',
  };

  const columns: ColumnsType<ShortcutConfig> = [
    {
      title: 'Shortcut',
      dataIndex: 'key',
      key: 'shortcut',
      width: 200,
      render: (_text, record) => (
        <Tag
          color="default"
          style={{
            fontFamily: 'monospace',
            fontSize: 13,
            padding: '4px 12px',
            background: '#f5f5f5',
            border: '1px solid #d9d9d9',
            color: '#262626',
          }}
        >
          {getShortcutDisplay(record)}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category: keyof typeof categoryColors) => (
        <Tag color={categoryColors[category]}>
          {categoryNames[category]}
        </Tag>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <KeyOutlined />
          <span>Keyboard Shortcuts</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 40 }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Search */}
        <Input
          placeholder="Search shortcuts..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          size="large"
        />

        {/* Shortcuts by Category */}
        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => {
          if (categoryShortcuts.length === 0) return null;

          return (
            <div key={category}>
              <Title level={5} style={{ marginBottom: 12 }}>
                <Tag color={categoryColors[category as keyof typeof categoryColors]}>
                  {categoryNames[category as keyof typeof categoryNames]}
                </Tag>
              </Title>
              <Table
                columns={columns}
                dataSource={categoryShortcuts}
                pagination={false}
                size="small"
                rowKey={(record) => `${record.category}-${record.key}`}
                showHeader={false}
              />
            </div>
          );
        })}

        {/* No results */}
        {filteredShortcuts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
            <Text type="secondary">No shortcuts found matching "{searchQuery}"</Text>
          </div>
        )}

        {/* Footer note */}
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 16 }}>
          Tip: Press <Tag style={{ fontFamily: 'monospace' }}>Shift + ?</Tag> anytime to open
          this dialog
        </Text>
      </Space>
    </Modal>
  );
};

export default ShortcutsModal;

/**
 * Deidentification Settings Component
 * Allows users to configure DICOM deidentification options
 */

import { Drawer, Form, Switch, InputNumber, Divider, Typography, Space, Alert, Tag, Button } from 'antd';
import { SafetyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@store';
import { closeSettingsDrawer } from '@store/slices/uiSlice';
import { updateDeidentificationOptions } from '@store/slices/dicomSlice';
import { getModifiedTags } from '@services/dicom/deidentifier';

const { Title, Text, Paragraph } = Typography;

const DeidentificationSettings = () => {
  const dispatch = useAppDispatch();
  const { settingsDrawerOpen } = useAppSelector((state) => state.ui);
  const { deidentificationOptions } = useAppSelector((state) => state.dicom);
  const [form] = Form.useForm();

  const handleValuesChange = (changedValues: any, allValues: any) => {
    // Prevent both removeDates and shiftDates from being true
    if (changedValues.removeDates === true) {
      allValues.shiftDates = false;
      form.setFieldValue('shiftDates', false);
    } else if (changedValues.shiftDates === true) {
      allValues.removeDates = false;
      form.setFieldValue('removeDates', false);
    }

    dispatch(updateDeidentificationOptions(allValues));
  };

  const modifiedTags = getModifiedTags(deidentificationOptions);

  return (
    <Drawer
      title={
        <Space>
          <SafetyOutlined />
          <span>Deidentification Settings</span>
        </Space>
      }
      placement="right"
      width={500}
      onClose={() => dispatch(closeSettingsDrawer())}
      open={settingsDrawerOpen}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Warning Alert */}
        <Alert
          message="HIPAA Compliance Notice"
          description="This tool follows DICOM PS3.15 standards for deidentification. However, always review deidentified data before sharing to ensure all PHI is removed."
          type="warning"
          showIcon
          icon={<InfoCircleOutlined />}
        />

        {/* Settings Form */}
        <Form
          form={form}
          layout="vertical"
          initialValues={deidentificationOptions}
          onValuesChange={handleValuesChange}
        >
          {/* Patient Information */}
          <Title level={5}>Patient Information</Title>
          <Form.Item
            name="removePatientName"
            valuePropName="checked"
            tooltip="Replace patient name with 'ANONYMOUS'"
          >
            <Space>
              <Switch />
              <Text>Remove Patient Name</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="removePatientID"
            valuePropName="checked"
            tooltip="Replace patient ID with anonymous ID"
          >
            <Space>
              <Switch />
              <Text>Remove Patient ID</Text>
            </Space>
          </Form.Item>

          <Divider />

          {/* Date Handling */}
          <Title level={5}>Date Handling</Title>
          <Form.Item
            name="removeDates"
            valuePropName="checked"
            tooltip="Completely remove all dates from DICOM metadata"
          >
            <Space>
              <Switch />
              <Text>Remove All Dates</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="shiftDates"
            valuePropName="checked"
            tooltip="Shift dates by specified number of days while maintaining relative intervals"
          >
            <Space>
              <Switch />
              <Text>Shift Dates</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="dateShiftDays"
            label="Date Shift (days)"
            tooltip="Number of days to shift dates backward"
            hidden={!deidentificationOptions.shiftDates}
          >
            <InputNumber
              min={1}
              max={3650}
              style={{ width: '100%' }}
              disabled={!deidentificationOptions.shiftDates}
            />
          </Form.Item>

          <Divider />

          {/* Institution & Staff */}
          <Title level={5}>Institution & Staff</Title>
          <Form.Item
            name="removeInstitution"
            valuePropName="checked"
            tooltip="Remove institution name and address"
          >
            <Space>
              <Switch />
              <Text>Remove Institution Information</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="removePhysicians"
            valuePropName="checked"
            tooltip="Remove referring and performing physician names"
          >
            <Space>
              <Switch />
              <Text>Remove Physician Names</Text>
            </Space>
          </Form.Item>

          <Divider />

          {/* Technical Settings */}
          <Title level={5}>Technical Settings</Title>
          <Form.Item
            name="anonymizeUIDs"
            valuePropName="checked"
            tooltip="Generate new UIDs while maintaining relationships"
          >
            <Space>
              <Switch />
              <Text>Anonymize UIDs</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="keepSeriesInfo"
            valuePropName="checked"
            tooltip="Keep series description and modality for clinical utility"
          >
            <Space>
              <Switch />
              <Text>Keep Series Information</Text>
            </Space>
          </Form.Item>
        </Form>

        <Divider />

        {/* Preview of Changes */}
        <div>
          <Title level={5}>Tags to be Modified</Title>
          <Paragraph type="secondary" style={{ fontSize: 12 }}>
            The following DICOM tags will be removed or modified:
          </Paragraph>
          <div style={{ marginTop: 12 }}>
            {modifiedTags.map((tag) => (
              <Tag key={tag} color="orange" style={{ marginBottom: 8 }}>
                {tag}
              </Tag>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 16 }}>
          <Button
            type="primary"
            block
            onClick={() => {
              // This will trigger deidentification when implemented
              dispatch(closeSettingsDrawer());
            }}
          >
            Apply Settings
          </Button>
        </div>

        {/* Information */}
        <Alert
          message="Information"
          description={
            <div>
              <Paragraph style={{ fontSize: 12, margin: 0 }}>
                • Patient Address, Telephone, and Accession Number are always removed
              </Paragraph>
              <Paragraph style={{ fontSize: 12, margin: 0 }}>
                • Deidentification notes are added to the metadata
              </Paragraph>
              <Paragraph style={{ fontSize: 12, margin: 0 }}>
                • Original files are never modified
              </Paragraph>
            </div>
          }
          type="info"
          showIcon
        />
      </Space>
    </Drawer>
  );
};

export default DeidentificationSettings;

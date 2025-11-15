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
import type { DeidentifyOptions } from '@store/types';
import { useEffect, useRef } from 'react';

const { Title, Text, Paragraph } = Typography;

const DeidentificationSettings = () => {
  const dispatch = useAppDispatch();
  const { settingsDrawerOpen } = useAppSelector((state) => state.ui);
  const { deidentificationOptions } = useAppSelector((state) => state.dicom);
  const [form] = Form.useForm();
  const isInitializingRef = useRef(false);
  const lastDrawerStateRef = useRef(false);

  // Sync form with Redux state when drawer opens
  useEffect(() => {
    if (settingsDrawerOpen) {
      // Only sync when drawer transitions from closed to open
      const wasClosed = !lastDrawerStateRef.current;
      
      if (wasClosed) {
        isInitializingRef.current = true;
        console.log('Drawer opened - initializing form with values:', deidentificationOptions);
        
        // Use setTimeout to ensure drawer and form are fully rendered
        const initTimer = setTimeout(() => {
          // Set all form values explicitly with proper defaults
          const formValues = {
            removePatientName: deidentificationOptions.removePatientName ?? false,
            removePatientID: deidentificationOptions.removePatientID ?? false,
            removeDates: deidentificationOptions.removeDates ?? false,
            shiftDates: deidentificationOptions.shiftDates ?? false,
            dateShiftDays: deidentificationOptions.dateShiftDays ?? 365,
            removeInstitution: deidentificationOptions.removeInstitution ?? false,
            removePhysicians: deidentificationOptions.removePhysicians ?? false,
            anonymizeUIDs: deidentificationOptions.anonymizeUIDs ?? false,
            keepSeriesInfo: deidentificationOptions.keepSeriesInfo ?? false,
          };
          
          console.log('Setting form values:', formValues);
          
          // Reset form first to clear any stale values
          form.resetFields();
          
          // Set values
          form.setFieldsValue(formValues);
          
          // Verify form values were set
          const actualFormValues = form.getFieldsValue();
          console.log('Form values after setFieldsValue:', actualFormValues);
          
          // Check if values match
          const valuesMatch = Object.keys(formValues).every(key => {
            const formValue = actualFormValues[key];
            const expectedValue = formValues[key as keyof typeof formValues];
            const matches = formValue === expectedValue;
            if (!matches) {
              console.warn(`Form value mismatch for ${key}: expected ${expectedValue}, got ${formValue}`);
            }
            return matches;
          });
          
          if (!valuesMatch) {
            console.error('Form values did not match! Retrying...');
            // Retry once more with a longer delay
            setTimeout(() => {
              form.setFieldsValue(formValues);
              const retryValues = form.getFieldsValue();
              console.log('Retry - Form values after setFieldsValue:', retryValues);
            }, 200);
          }
          
          isInitializingRef.current = false;
        }, 150); // Delay to ensure form is mounted
        
        return () => clearTimeout(initTimer);
      }
    }
    lastDrawerStateRef.current = settingsDrawerOpen;
  }, [settingsDrawerOpen, deidentificationOptions, form]); // Include deidentificationOptions to use latest values

  // Handler for individual switch changes - this will trigger form update
  const handleSwitchChange = (fieldName: string, checked: boolean) => {
    // Don't update Redux if we're initializing (to prevent loops)
    if (isInitializingRef.current) {
      return;
    }

    console.log(`Switch changed: ${fieldName} = ${checked}`);
    // Update form field directly
    form.setFieldValue(fieldName, checked);
    
    // Use setTimeout to ensure form has updated
    setTimeout(() => {
      // Get all form values and update Redux
      const formValues = form.getFieldsValue();
      console.log('All form values after switch change:', formValues);
      
      // Build final values
      const finalValues: DeidentifyOptions = {
        removePatientName: formValues.removePatientName ?? false,
        removePatientID: formValues.removePatientID ?? false,
        removeDates: formValues.removeDates ?? false,
        shiftDates: formValues.shiftDates ?? false,
        dateShiftDays: formValues.dateShiftDays,
        removeInstitution: formValues.removeInstitution ?? false,
        removePhysicians: formValues.removePhysicians ?? false,
        anonymizeUIDs: formValues.anonymizeUIDs ?? false,
        keepSeriesInfo: formValues.keepSeriesInfo ?? false,
      };

      // Prevent both removeDates and shiftDates from being true
      if (fieldName === 'removeDates' && checked === true) {
        finalValues.shiftDates = false;
        form.setFieldValue('shiftDates', false);
      } else if (fieldName === 'shiftDates' && checked === true) {
        finalValues.removeDates = false;
        form.setFieldValue('removeDates', false);
      }

      // Ensure dateShiftDays is set if shiftDates is enabled
      if (finalValues.shiftDates === true && !finalValues.dateShiftDays) {
        finalValues.dateShiftDays = deidentificationOptions.dateShiftDays || 365;
        form.setFieldValue('dateShiftDays', finalValues.dateShiftDays);
      }

      console.log('Final values to save to Redux:', finalValues);
      dispatch(updateDeidentificationOptions(finalValues));
    }, 0);
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    console.log('=== handleValuesChange called ===');
    console.log('changedValues:', changedValues);
    console.log('allValues:', allValues);
    console.log('Current Redux state:', deidentificationOptions);
    
    // Get all current form values
    const formValues = form.getFieldsValue();
    console.log('Form values from getFieldsValue():', formValues);
    
    // Start with current Redux state, then apply form values
    const mergedValues: DeidentifyOptions = {
      ...deidentificationOptions,
      ...formValues,
    };

    // Prevent both removeDates and shiftDates from being true
    if (changedValues.removeDates === true) {
      mergedValues.shiftDates = false;
      form.setFieldValue('shiftDates', false);
    } else if (changedValues.shiftDates === true) {
      mergedValues.removeDates = false;
      form.setFieldValue('removeDates', false);
    }

    // Ensure dateShiftDays is set if shiftDates is enabled
    if (mergedValues.shiftDates === true && !mergedValues.dateShiftDays) {
      mergedValues.dateShiftDays = deidentificationOptions.dateShiftDays || 365;
      form.setFieldValue('dateShiftDays', mergedValues.dateShiftDays);
    }

    // Build final values
    const finalValues: DeidentifyOptions = {
      removePatientName: mergedValues.removePatientName ?? false,
      removePatientID: mergedValues.removePatientID ?? false,
      removeDates: mergedValues.removeDates ?? false,
      shiftDates: mergedValues.shiftDates ?? false,
      dateShiftDays: mergedValues.dateShiftDays,
      removeInstitution: mergedValues.removeInstitution ?? false,
      removePhysicians: mergedValues.removePhysicians ?? false,
      anonymizeUIDs: mergedValues.anonymizeUIDs ?? false,
      keepSeriesInfo: mergedValues.keepSeriesInfo ?? false,
    };

    console.log('Final values to save to Redux:', finalValues);
    dispatch(updateDeidentificationOptions(finalValues));
  };

  // Note: We don't need to sync form values when Redux changes because
  // the Switches are now controlled directly from Redux state via the `checked` prop

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
          preserve={false}
          onValuesChange={handleValuesChange}
        >
          {/* Patient Information */}
          <Title level={5}>Patient Information</Title>
          <Form.Item
            name="removePatientName"
            // valuePropName="checked"
            tooltip="Replace patient name with 'ANONYMOUS'"
          >
            <Space>
              <Switch checked={deidentificationOptions.removePatientName} defaultChecked={deidentificationOptions.removePatientName} onChange={(checked) => handleSwitchChange('removePatientName', checked)} />
              <Text>Remove Patient Name</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="removePatientID"
            // valuePropName="checked"
            tooltip="Replace patient ID with anonymous ID"
          >
            <Space>
              <Switch checked={deidentificationOptions.removePatientID} defaultChecked={deidentificationOptions.removePatientID} onChange={(checked) => handleSwitchChange('removePatientID', checked)} />
              <Text>Remove Patient ID</Text>
            </Space>
          </Form.Item>

          <Divider />

          {/* Date Handling */}
          <Title level={5}>Date Handling</Title>
          <Form.Item
            name="removeDates"
            // valuePropName="checked"
            tooltip="Completely remove all dates from DICOM metadata"
          >
            <Space>
              <Switch checked={deidentificationOptions.removeDates} onChange={(checked) => handleSwitchChange('removeDates', checked)} />
              <Text>Remove All Dates</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="shiftDates"
            valuePropName="checked"
            tooltip="Shift dates by specified number of days while maintaining relative intervals"
          >
            <Space>
              <Switch checked={deidentificationOptions.shiftDates} onChange={(checked) => handleSwitchChange('shiftDates', checked)} />
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
              <Switch checked={deidentificationOptions.removeInstitution} onChange={(checked) => handleSwitchChange('removeInstitution', checked)} />
              <Text>Remove Institution Information</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="removePhysicians"
            valuePropName="checked"
            tooltip="Remove referring and performing physician names"
          >
            <Space>
              <Switch checked={deidentificationOptions.removePhysicians} onChange={(checked) => handleSwitchChange('removePhysicians', checked)} />
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
              <Switch checked={deidentificationOptions.anonymizeUIDs} onChange={(checked) => handleSwitchChange('anonymizeUIDs', checked)} />
              <Text>Anonymize UIDs</Text>
            </Space>
          </Form.Item>

          <Form.Item
            name="keepSeriesInfo"
            valuePropName="checked"
            tooltip="Keep series description and modality for clinical utility"
          >
            <Space>
              <Switch checked={deidentificationOptions.keepSeriesInfo} onChange={(checked) => handleSwitchChange('keepSeriesInfo', checked)} />
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
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            block
            onClick={() => {
              // Explicitly save all form values to Redux
              const formValues = form.getFieldsValue();
              const finalValues: DeidentifyOptions = {
                removePatientName: formValues.removePatientName ?? false,
                removePatientID: formValues.removePatientID ?? false,
                removeDates: formValues.removeDates ?? false,
                shiftDates: formValues.shiftDates ?? false,
                dateShiftDays: formValues.dateShiftDays,
                removeInstitution: formValues.removeInstitution ?? false,
                removePhysicians: formValues.removePhysicians ?? false,
                anonymizeUIDs: formValues.anonymizeUIDs ?? false,
                keepSeriesInfo: formValues.keepSeriesInfo ?? false,
              };
              console.log('Saving deidentification settings:', finalValues);
              dispatch(updateDeidentificationOptions(finalValues));
              dispatch(closeSettingsDrawer());
            }}
          >
            Save Changes
          </Button>
          <Button
            block
            onClick={() => {
              dispatch(closeSettingsDrawer());
            }}
          >
            Cancel
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

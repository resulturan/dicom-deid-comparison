/**
 * Application Constants
 */

// File Upload
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const ACCEPTED_FILE_TYPES = ['.dcm', '.dicom'];
export const ACCEPTED_MIME_TYPES = [
  'application/dicom',
  'application/octet-stream',
];

// Date Formats
export const DICOM_DATE_FORMAT = 'YYYYMMDD';
export const DICOM_TIME_FORMAT = 'HHmmss';
export const DISPLAY_DATE_FORMAT = 'YYYY-MM-DD';
export const DISPLAY_TIME_FORMAT = 'HH:mm:ss';

// Deidentification
export const DEFAULT_DATE_SHIFT_DAYS = 365;
export const ANONYMOUS_PATIENT_NAME = 'ANONYMOUS';
export const ANONYMOUS_PATIENT_ID_PREFIX = 'ANON-';

// Viewer Settings
export const DEFAULT_VIEWPORT_SCALE = 1.0;
export const MIN_VIEWPORT_SCALE = 0.1;
export const MAX_VIEWPORT_SCALE = 10.0;
export const ZOOM_STEP = 0.1;

// Window/Level Presets
export const WINDOW_LEVEL_PRESETS = {
  CT_BRAIN: { windowWidth: 80, windowCenter: 40 },
  CT_LUNG: { windowWidth: 1500, windowCenter: -600 },
  CT_ABDOMEN: { windowWidth: 400, windowCenter: 50 },
  CT_BONE: { windowWidth: 2000, windowCenter: 500 },
  CT_LIVER: { windowWidth: 150, windowCenter: 30 },
} as const;

// Notification Durations (milliseconds)
export const NOTIFICATION_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const;

// Storage Keys (for localStorage)
export const STORAGE_KEYS = {
  DEIDENTIFICATION_OPTIONS: 'dicom-viewer:deidentification-options',
  VIEWER_SYNC_STATE: 'dicom-viewer:viewer-sync-state',
  USER_PREFERENCES: 'dicom-viewer:user-preferences',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
  INVALID_FILE_TYPE: 'Invalid file type. Please upload DICOM files (.dcm, .dicom)',
  PARSING_FAILED: 'Failed to parse DICOM file. The file may be corrupted.',
  NO_FILES_UPLOADED: 'No files uploaded. Please upload DICOM files first.',
  DEIDENTIFICATION_FAILED: 'Failed to deidentify DICOM file.',
  EXPORT_FAILED: 'Failed to export DICOM file.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  FILES_UPLOADED: 'Files uploaded successfully',
  DEIDENTIFICATION_COMPLETE: 'Deidentification completed successfully',
  EXPORT_COMPLETE: 'Files exported successfully',
} as const;

// DICOM Transfer Syntaxes
export const TRANSFER_SYNTAXES = {
  IMPLICIT_VR_LITTLE_ENDIAN: '1.2.840.10008.1.2',
  EXPLICIT_VR_LITTLE_ENDIAN: '1.2.840.10008.1.2.1',
  EXPLICIT_VR_BIG_ENDIAN: '1.2.840.10008.1.2.2',
  JPEG_BASELINE: '1.2.840.10008.1.2.4.50',
  JPEG_LOSSLESS: '1.2.840.10008.1.2.4.70',
  JPEG_2000_LOSSLESS: '1.2.840.10008.1.2.4.90',
  RLE_LOSSLESS: '1.2.840.10008.1.2.5',
} as const;

// DICOM Modalities
export const MODALITIES = {
  CT: 'CT',
  MR: 'MR',
  CR: 'CR',
  DX: 'DX',
  US: 'US',
  XA: 'XA',
  MG: 'MG',
  PT: 'PT',
  NM: 'NM',
  OT: 'OT',
} as const;

export type Modality = keyof typeof MODALITIES;

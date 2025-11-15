// Store type definitions for DICOM Deidentification Viewer

export interface DicomFile {
  id: string;
  file: File;
  fileName: string;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  metadata?: DicomMetadata;
  imageData?: ArrayBuffer;
  error?: string;
}

export interface DicomMetadata {
  // Patient Information
  patientName?: string;
  patientID?: string;
  patientBirthDate?: string;
  patientSex?: string;
  patientAge?: string;

  // Study Information
  studyInstanceUID?: string;
  studyDate?: string;
  studyTime?: string;
  studyDescription?: string;
  accessionNumber?: string;

  // Series Information
  seriesInstanceUID?: string;
  seriesNumber?: string;
  seriesDescription?: string;
  modality?: string;

  // Image Information
  sopInstanceUID?: string;
  instanceNumber?: number;
  rows?: number;
  columns?: number;
  numberOfFrames?: number;

  // Additional metadata
  institutionName?: string;
  referringPhysicianName?: string;
  performingPhysicianName?: string;

  // Store all tags for comparison
  allTags?: Record<string, any>;
}

export interface DeidentifyOptions {
  removePatientName: boolean;
  removePatientID: boolean;
  removeDates: boolean;
  shiftDates: boolean;
  dateShiftDays?: number;
  removeInstitution: boolean;
  removePhysicians: boolean;
  anonymizeUIDs: boolean;
  keepSeriesInfo: boolean;
  customRules?: DeidentificationRule[];
}

export interface DeidentificationRule {
  tag: string;
  action: 'remove' | 'replace' | 'keep' | 'hash';
  replacement?: string;
}

export interface Viewport {
  scale: number;
  translation: { x: number; y: number };
  rotation: number;
  hflip: boolean;
  vflip: boolean;
  windowWidth?: number;
  windowCenter?: number;
  sliceIndex: number;
}

export interface ToolState {
  activeTool: string | null;
  measurements: any[];
  annotations: any[];
}

export interface ViewerSyncState {
  isEnabled: boolean;
  syncScroll: boolean;
  syncPan: boolean;
  syncZoom: boolean;
  syncWindowLevel: boolean;
  syncRotation: boolean;
}

// Redux State Interfaces
export interface DicomState {
  originalFiles: DicomFile[];
  deidentifiedFiles: DicomFile[];
  currentFileIndex: number;
  metadata: {
    original: DicomMetadata | null;
    deidentified: DicomMetadata | null;
  };
  deidentificationOptions: DeidentifyOptions;
  isProcessing: boolean;
}

export interface ViewerState {
  leftViewer: {
    viewport: Viewport;
    tools: ToolState;
    fileIndex?: number; // Separate file index for left viewer when sync is disabled
  };
  rightViewer: {
    viewport: Viewport;
    tools: ToolState;
    fileIndex?: number; // Separate file index for right viewer when sync is disabled
  };
  sync: ViewerSyncState;
}

export interface UIState {
  uploadDrawerOpen: boolean;
  metadataDrawerOpen: boolean;
  settingsDrawerOpen: boolean;
  exportDrawerOpen: boolean;
  notificationDrawerOpen: boolean;
  loading: boolean;
  loadingMessage: string;
  errors: string[];
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
  duration?: number;
}

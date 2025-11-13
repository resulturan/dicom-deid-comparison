import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DicomState, DicomFile, DicomMetadata, DeidentifyOptions } from '../types';

const initialState: DicomState = {
  originalFiles: [],
  deidentifiedFiles: [],
  currentFileIndex: 0,
  metadata: {
    original: null,
    deidentified: null,
  },
  deidentificationOptions: {
    removePatientName: true,
    removePatientID: true,
    removeDates: false,
    shiftDates: true,
    dateShiftDays: 365,
    removeInstitution: true,
    removePhysicians: true,
    anonymizeUIDs: false,
    keepSeriesInfo: true,
  },
  isProcessing: false,
};

const dicomSlice = createSlice({
  name: 'dicom',
  initialState,
  reducers: {
    // File management
    addFiles: (state, action: PayloadAction<File[]>) => {
      const timestamp = Date.now();
      const newFiles: DicomFile[] = action.payload.map((file, index) => ({
        id: `${timestamp}-${index}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        fileName: file.name,
        status: 'pending',
        progress: 0,
      }));
      console.log('addFiles: Adding', newFiles.length, 'files with IDs:', newFiles.map(f => f.id));
      state.originalFiles.push(...newFiles);
    },

    updateFileStatus: (
      state,
      action: PayloadAction<{ id: string; status: DicomFile['status']; progress?: number }>
    ) => {
      const file = state.originalFiles.find((f) => f.id === action.payload.id);
      if (file) {
        file.status = action.payload.status;
        if (action.payload.progress !== undefined) {
          file.progress = action.payload.progress;
        }
      }
    },

    updateFileMetadata: (
      state,
      action: PayloadAction<{ id: string; metadata: DicomMetadata; imageData?: ArrayBuffer }>
    ) => {
      const file = state.originalFiles.find((f) => f.id === action.payload.id);
      if (file) {
        file.metadata = action.payload.metadata;
        file.imageData = action.payload.imageData;
        file.status = 'complete';
        file.progress = 100;
      }
    },

    setCurrentFileIndex: (state, action: PayloadAction<number>) => {
      state.currentFileIndex = action.payload;
      const currentFile = state.originalFiles[action.payload];
      const deidentifiedFile = state.deidentifiedFiles[action.payload];

      state.metadata.original = currentFile?.metadata || null;
      state.metadata.deidentified = deidentifiedFile?.metadata || null;
    },

    removeFile: (state, action: PayloadAction<string>) => {
      state.originalFiles = state.originalFiles.filter((f) => f.id !== action.payload);
      state.deidentifiedFiles = state.deidentifiedFiles.filter((f) => f.id !== action.payload);
    },

    clearFiles: (state) => {
      state.originalFiles = [];
      state.deidentifiedFiles = [];
      state.currentFileIndex = 0;
      state.metadata = { original: null, deidentified: null };
    },

    // Deidentification
    setDeidentifiedFiles: (state, action: PayloadAction<DicomFile[]>) => {
      state.deidentifiedFiles = action.payload;
    },

    updateDeidentificationOptions: (state, action: PayloadAction<Partial<DeidentifyOptions>>) => {
      state.deidentificationOptions = {
        ...state.deidentificationOptions,
        ...action.payload,
      };
    },

    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },

    // Metadata
    setOriginalMetadata: (state, action: PayloadAction<DicomMetadata>) => {
      state.metadata.original = action.payload;
    },

    setDeidentifiedMetadata: (state, action: PayloadAction<DicomMetadata>) => {
      state.metadata.deidentified = action.payload;
    },
  },
});

export const {
  addFiles,
  updateFileStatus,
  updateFileMetadata,
  setCurrentFileIndex,
  removeFile,
  clearFiles,
  setDeidentifiedFiles,
  updateDeidentificationOptions,
  setProcessing,
  setOriginalMetadata,
  setDeidentifiedMetadata,
} = dicomSlice.actions;

export default dicomSlice.reducer;

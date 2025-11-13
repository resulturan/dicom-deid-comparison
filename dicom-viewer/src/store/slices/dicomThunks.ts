/**
 * Redux Thunks for DICOM file processing
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import type { DicomFile } from '../types';
import { parseDicomFile } from '@services/dicom/parser';
import { validateFile } from '@services/dicom/validator';
import { updateFileStatus, updateFileMetadata } from './dicomSlice';
import { addNotification } from './uiSlice';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@utils/constants';

/**
 * Process a single DICOM file
 */
export const processDicomFile = createAsyncThunk(
  'dicom/processDicomFile',
  async (
    { id, file }: { id: string; file: File },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Update status to uploading
      dispatch(updateFileStatus({ id, status: 'uploading', progress: 0 }));

      // Validate file
      const validation = await validateFile(file);
      if (!validation.valid) {
        dispatch(updateFileStatus({ id, status: 'error', progress: 0 }));
        dispatch(
          addNotification({
            type: 'error',
            message: 'File validation failed',
            description: validation.error || ERROR_MESSAGES.INVALID_FILE_TYPE,
          })
        );
        return rejectWithValue(validation.error);
      }

      // Update status to processing
      dispatch(updateFileStatus({ id, status: 'processing', progress: 50 }));

      // Parse DICOM file
      const { metadata, imageData } = await parseDicomFile(file);

      // Update file with metadata
      dispatch(
        updateFileMetadata({
          id,
          metadata,
          imageData,
        })
      );

      dispatch(
        addNotification({
          type: 'success',
          message: 'File processed successfully',
          description: `${file.name} has been loaded`,
        })
      );

      return { id, metadata, imageData };
    } catch (error) {
      dispatch(updateFileStatus({ id, status: 'error', progress: 0 }));
      dispatch(
        addNotification({
          type: 'error',
          message: 'Failed to process DICOM file',
          description: error instanceof Error ? error.message : ERROR_MESSAGES.PARSING_FAILED,
        })
      );
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * Process multiple DICOM files in batch
 */
export const processDicomFiles = createAsyncThunk(
  'dicom/processDicomFiles',
  async (files: DicomFile[], { dispatch }) => {
    const results = await Promise.allSettled(
      files.map((dicomFile) =>
        dispatch(
          processDicomFile({
            id: dicomFile.id,
            file: dicomFile.file,
          })
        )
      )
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failureCount = results.filter((r) => r.status === 'rejected').length;

    if (successCount > 0) {
      dispatch(
        addNotification({
          type: 'success',
          message: SUCCESS_MESSAGES.FILES_UPLOADED,
          description: `${successCount} file(s) processed successfully${
            failureCount > 0 ? `, ${failureCount} failed` : ''
          }`,
        })
      );
    }

    return {
      successCount,
      failureCount,
      total: files.length,
    };
  }
);

/**
 * Reload/reprocess a single file
 */
export const reprocessDicomFile = createAsyncThunk(
  'dicom/reprocessDicomFile',
  async (
    { id, file }: { id: string; file: File },
    { dispatch }
  ) => {
    return dispatch(processDicomFile({ id, file }));
  }
);

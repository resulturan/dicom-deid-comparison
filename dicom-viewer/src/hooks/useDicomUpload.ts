/**
 * Custom hook for DICOM file upload operations
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@store';
import {
  addFiles,
  removeFile,
  clearFiles,
  setCurrentFileIndex,
} from '@store/slices/dicomSlice';
import {
  processDicomFile,
  processDicomFiles,
} from '@store/slices/dicomThunks';
import { addNotification } from '@store/slices/uiSlice';
import type { DicomFile } from '@store/types';

export function useDicomUpload() {
  const dispatch = useAppDispatch();
  const { originalFiles, currentFileIndex, isProcessing } = useAppSelector(
    (state) => state.dicom
  );

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback(
    async (files: File[]) => {
      // Add files to store
      dispatch(addFiles(files));

      // Create file objects for processing
      const newFiles: DicomFile[] = files.map((file, index) => ({
        id: `${Date.now()}-${Math.random()}-${index}`,
        file,
        fileName: file.name,
        status: 'pending',
        progress: 0,
      }));

      // Process files
      await dispatch(processDicomFiles(newFiles));
    },
    [dispatch]
  );

  /**
   * Handle single file processing
   */
  const handleProcessFile = useCallback(
    async (id: string, file: File) => {
      await dispatch(processDicomFile({ id, file }));
    },
    [dispatch]
  );

  /**
   * Remove a file
   */
  const handleRemoveFile = useCallback(
    (id: string) => {
      dispatch(removeFile(id));

      // Notify user
      dispatch(
        addNotification({
          type: 'info',
          message: 'File removed',
        })
      );
    },
    [dispatch]
  );

  /**
   * Clear all files
   */
  const handleClearFiles = useCallback(() => {
    dispatch(clearFiles());

    dispatch(
      addNotification({
        type: 'info',
        message: 'All files cleared',
      })
    );
  },  [dispatch]
  );

  /**
   * Select a file by index
   */
  const handleSelectFile = useCallback(
    (index: number) => {
      if (index >= 0 && index < originalFiles.length) {
        dispatch(setCurrentFileIndex(index));
      }
    },
    [dispatch, originalFiles.length]
  );

  /**
   * Get current file
   */
  const currentFile = originalFiles[currentFileIndex] || null;

  /**
   * Get file statistics
   */
  const statistics = {
    total: originalFiles.length,
    pending: originalFiles.filter((f) => f.status === 'pending').length,
    processing: originalFiles.filter((f) => f.status === 'processing').length,
    complete: originalFiles.filter((f) => f.status === 'complete').length,
    error: originalFiles.filter((f) => f.status === 'error').length,
  };

  return {
    // State
    files: originalFiles,
    currentFile,
    currentFileIndex,
    isProcessing,
    statistics,

    // Actions
    handleFileUpload,
    handleProcessFile,
    handleRemoveFile,
    handleClearFiles,
    handleSelectFile,
  };
}

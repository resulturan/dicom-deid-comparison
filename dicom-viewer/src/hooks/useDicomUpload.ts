/**
 * Custom hook for DICOM file upload operations
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@store';
import {
  addFiles,
  removeFile,
  clearFiles,
  setCurrentFileIndex,
} from '@store/slices/dicomSlice';
import {
  processDicomFile,
} from '@store/slices/dicomThunks';
import { addNotification } from '@store/slices/uiSlice';

export function useDicomUpload() {
  const dispatch = useAppDispatch();
  const { originalFiles, currentFileIndex, isProcessing } = useAppSelector(
    (state) => state.dicom
  );
  const previousFilesCount = useRef(0);

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback(
    (files: File[]) => {
      // Add files to store - this will add them with generated IDs
      dispatch(addFiles(files));
      // The processing will happen in the useEffect below
    },
    [dispatch]
  );

  /**
   * Process newly added files automatically
   */
  useEffect(() => {
    const currentCount = originalFiles.length;
    
    // If new files were added (count increased)
    if (currentCount > previousFilesCount.current) {
      const newFilesCount = currentCount - previousFilesCount.current;
      const newFiles = originalFiles.slice(-newFilesCount);
      
      // Process each newly added file that's in pending status
      newFiles.forEach((dicomFile) => {
        if (dicomFile.status === 'pending') {
          dispatch(processDicomFile({ id: dicomFile.id, file: dicomFile.file }));
        }
      });
    }
    
    previousFilesCount.current = currentCount;
  }, [originalFiles, dispatch]);

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

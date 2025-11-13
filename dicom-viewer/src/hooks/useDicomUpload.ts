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
  const processedFileIds = useRef<Set<string>>(new Set());

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback(
    (files: File[]) => {
      console.log('handleFileUpload called with', files.length, 'files');
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
    // Find all files that are pending and haven't been processed yet
    const pendingFiles = originalFiles.filter(
      (file) => file.status === 'pending' && !processedFileIds.current.has(file.id)
    );

    if (pendingFiles.length > 0) {
      console.log('Found', pendingFiles.length, 'pending files to process:', 
        pendingFiles.map(f => ({ id: f.id, fileName: f.fileName }))
      );

      // Process each pending file
      pendingFiles.forEach((dicomFile) => {
        // Mark as being processed
        processedFileIds.current.add(dicomFile.id);
        console.log('Processing file:', dicomFile.fileName, dicomFile.id);
        dispatch(processDicomFile({ id: dicomFile.id, file: dicomFile.file }));
      });
    }

    // Clean up processed IDs for files that no longer exist
    const currentFileIds = new Set(originalFiles.map(f => f.id));
    processedFileIds.current.forEach(id => {
      if (!currentFileIds.has(id)) {
        processedFileIds.current.delete(id);
      }
    });
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

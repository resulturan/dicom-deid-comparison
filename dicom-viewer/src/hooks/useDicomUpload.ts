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
  updateFileStatus,
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
      const processingPromises = pendingFiles.map((dicomFile) => {
        // Mark as being processed
        processedFileIds.current.add(dicomFile.id);
        console.log('Processing file:', dicomFile.fileName, dicomFile.id);
        return dispatch(processDicomFile({ id: dicomFile.id, file: dicomFile.file }));
      });

      // Wait for all files to complete, then show batch notification
      Promise.allSettled(processingPromises).then((results) => {
        const successCount = results.filter((r) => r.status === 'fulfilled').length;
        const failureCount = results.filter((r) => r.status === 'rejected').length;

        if (pendingFiles.length > 1) {
          // Batch notification for multiple files
          const parts: string[] = [];
          if (successCount > 0) parts.push(`${successCount} successful`);
          if (failureCount > 0) parts.push(`${failureCount} error${failureCount > 1 ? 's' : ''}`);
          
          dispatch(
            addNotification({
              type: failureCount > 0 ? 'warning' : 'success',
              message: `${pendingFiles.length} file${pendingFiles.length > 1 ? 's' : ''} processed`,
              description: parts.join(', '),
            })
          );
        } else if (pendingFiles.length === 1) {
          // Single file - show individual notification
          const result = results[0];
          if (result.status === 'fulfilled') {
            dispatch(
              addNotification({
                type: 'success',
                message: 'File processed successfully',
                description: `${pendingFiles[0].fileName} has been loaded`,
              })
            );
          } else {
            dispatch(
              addNotification({
                type: 'error',
                message: 'Failed to process file',
                description: `${pendingFiles[0].fileName}: ${result.reason || 'Unknown error'}`,
              })
            );
          }
        }
      });
    }

    // Clean up processed IDs for files that no longer exist
    const currentFileIds = new Set(originalFiles.map(f => f.id));
    processedFileIds.current.forEach(id => {
      if (!currentFileIds.has(id)) {
        processedFileIds.current.delete(id);
      }
    });

    // Check for files stuck in processing/uploading status
    // If a file has been processing for more than 30 seconds, it might be stuck
    const stuckFiles = originalFiles.filter((file) => {
      if (file.status === 'processing' || file.status === 'uploading') {
        // Check if file has metadata but is still marked as processing
        // This can happen if updateFileMetadata was called but status wasn't updated
        if (file.metadata && file.imageData) {
          console.warn('File stuck in processing but has metadata:', file.fileName);
          return true;
        }
      }
      return false;
    });

    // Fix stuck files by updating their status to complete if they have metadata
    if (stuckFiles.length > 0) {
      stuckFiles.forEach((file) => {
        if (file.metadata && file.imageData && (file.status === 'processing' || file.status === 'uploading')) {
          console.log('Fixing stuck file:', file.fileName, 'status:', file.status);
          dispatch(updateFileStatus({ id: file.id, status: 'complete', progress: 100 }));
        }
      });
    }
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
    processing: originalFiles.filter((f) => f.status === 'processing' || f.status === 'uploading').length,
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

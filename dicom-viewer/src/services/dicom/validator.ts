/**
 * DICOM File Validation Service
 */

import {
  MAX_FILE_SIZE,
  ACCEPTED_FILE_TYPES,
  ERROR_MESSAGES,
} from '@utils/constants';
import { validateDicomFile } from './parser';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a file before upload
 */
export async function validateFile(file: File): Promise<ValidationResult> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE,
    };
  }

  // Check file extension
  const fileExtension = getFileExtension(file.name);
  if (!isAcceptedFileType(fileExtension)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE,
    };
  }

  // Validate DICOM structure
  try {
    const arrayBuffer = await file.arrayBuffer();
    const isDicom = validateDicomFile(arrayBuffer);

    if (!isDicom) {
      return {
        valid: false,
        error: 'File is not a valid DICOM file',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: ERROR_MESSAGES.PARSING_FAILED,
    };
  }
}

/**
 * Validate multiple files
 */
export async function validateFiles(files: File[]): Promise<{
  validFiles: File[];
  invalidFiles: Array<{ file: File; error: string }>;
}> {
  const validFiles: File[] = [];
  const invalidFiles: Array<{ file: File; error: string }> = [];

  for (const file of files) {
    const result = await validateFile(file);

    if (result.valid) {
      validFiles.push(file);
    } else {
      invalidFiles.push({
        file,
        error: result.error || 'Unknown error',
      });
    }
  }

  return { validFiles, invalidFiles };
}

/**
 * Check if file extension is accepted
 */
function isAcceptedFileType(extension: string): boolean {
  return ACCEPTED_FILE_TYPES.some(
    (type) => type.toLowerCase() === extension.toLowerCase()
  );
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if file is too large
 */
export function isFileTooLarge(file: File): boolean {
  return file.size > MAX_FILE_SIZE;
}

/**
 * Get validation error message for a file
 */
export function getFileValidationError(file: File): string | null {
  if (isFileTooLarge(file)) {
    return ERROR_MESSAGES.FILE_TOO_LARGE;
  }

  const extension = getFileExtension(file.name);
  if (!isAcceptedFileType(extension)) {
    return ERROR_MESSAGES.INVALID_FILE_TYPE;
  }

  return null;
}

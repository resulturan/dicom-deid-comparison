/**
 * Export Service
 * Handles exporting deidentified DICOM files and metadata
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { DicomFile } from '@store/types';

/**
 * Download a single file
 */
export function downloadFile(blob: Blob, filename: string): void {
  saveAs(blob, filename);
}

/**
 * Export deidentified DICOM file
 */
export async function exportDicomFile(file: DicomFile): Promise<void> {
  if (!file.imageData) {
    throw new Error('No image data available for export');
  }

  const blob = new Blob([file.imageData], { type: 'application/dicom' });
  const filename = file.fileName.replace(/\.dcm$/i, '_deidentified.dcm');

  downloadFile(blob, filename);
}

/**
 * Export multiple DICOM files as ZIP
 */
export async function exportDicomFilesAsZip(
  files: DicomFile[],
  zipFilename: string = 'deidentified_dicoms.zip'
): Promise<void> {
  if (files.length === 0) {
    throw new Error('No files to export');
  }

  const zip = new JSZip();

  // Add each DICOM file to the ZIP
  files.forEach((file, _index) => {
    if (file.imageData) {
      const filename = file.fileName.replace(/\.dcm$/i, '_deidentified.dcm');
      zip.file(filename, file.imageData);
    }
  });

  // Add metadata JSON file
  const metadataJson = JSON.stringify(
    files.map((file) => ({
      fileName: file.fileName,
      metadata: file.metadata,
      status: file.status,
    })),
    null,
    2
  );
  zip.file('metadata.json', metadataJson);

  // Generate and download ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  downloadFile(content, zipFilename);
}

/**
 * Export metadata comparison report as JSON
 */
export function exportComparisonReport(
  originalFiles: DicomFile[],
  deidentifiedFiles: DicomFile[],
  filename: string = 'comparison_report.json'
): void {
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: originalFiles.length,
    deidentifiedFiles: deidentifiedFiles.length,
    files: originalFiles.map((originalFile, index) => {
      const deidentifiedFile = deidentifiedFiles[index];
      return {
        fileName: originalFile.fileName,
        original: originalFile.metadata,
        deidentified: deidentifiedFile?.metadata,
        changes: getMetadataChanges(originalFile.metadata, deidentifiedFile?.metadata),
      };
    }),
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  downloadFile(blob, filename);
}

/**
 * Get list of changed metadata fields
 */
function getMetadataChanges(
  original: any,
  deidentified: any
): { field: string; originalValue: any; deidentifiedValue: any }[] {
  if (!original || !deidentified) return [];

  const changes: { field: string; originalValue: any; deidentifiedValue: any }[] = [];

  Object.keys(original).forEach((key) => {
    if (original[key] !== deidentified[key]) {
      changes.push({
        field: key,
        originalValue: original[key],
        deidentifiedValue: deidentified[key],
      });
    }
  });

  return changes;
}

/**
 * Export deidentification settings as JSON
 */
export function exportDeidentificationSettings(
  settings: any,
  filename: string = 'deidentification_settings.json'
): void {
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
  downloadFile(blob, filename);
}

/**
 * Generate CSV report
 */
export function exportMetadataAsCSV(
  files: DicomFile[],
  filename: string = 'metadata.csv'
): void {
  if (files.length === 0) {
    throw new Error('No files to export');
  }

  // Get all unique metadata keys
  const allKeys = new Set<string>();
  files.forEach((file) => {
    if (file.metadata) {
      Object.keys(file.metadata).forEach((key) => allKeys.add(key));
    }
  });

  const keys = Array.from(allKeys).sort();

  // Create CSV header
  const header = ['File Name', ...keys].join(',');

  // Create CSV rows
  const rows = files.map((file) => {
    const values = [file.fileName];
    keys.forEach((key) => {
      const value = file.metadata?.[key as keyof typeof file.metadata];
      // Escape commas and quotes in values
      const escapedValue = value !== undefined ? `"${String(value).replace(/"/g, '""')}"` : '';
      values.push(escapedValue);
    });
    return values.join(',');
  });

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
}

/**
 * Validate file before export
 */
export function validateFileForExport(file: DicomFile): { valid: boolean; error?: string } {
  if (!file.imageData) {
    return { valid: false, error: 'No image data available' };
  }

  if (file.status !== 'complete') {
    return { valid: false, error: 'File processing not complete' };
  }

  if (!file.metadata) {
    return { valid: false, error: 'No metadata available' };
  }

  return { valid: true };
}

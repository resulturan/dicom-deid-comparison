/**
 * DICOM Parser Service
 * Handles parsing of DICOM files and extraction of metadata
 */

import * as dcmjs from 'dcmjs';
import * as dicomParser from 'dicom-parser';
import type { DicomMetadata } from '@store/types';
import { DICOM_TAGS } from '@utils/dicomTags';

const { DicomMessage } = dcmjs.data;

/**
 * Parse a DICOM file and extract metadata
 */
export async function parseDicomFile(file: File): Promise<{
  metadata: DicomMetadata;
  dataset: any;
  imageData: ArrayBuffer;
}> {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Parse using dicom-parser first for validation
    const byteArray = new Uint8Array(arrayBuffer);
    dicomParser.parseDicom(byteArray); // Validates DICOM structure

    // Parse using dcmjs for easier data access
    const dicomData = DicomMessage.readFile(arrayBuffer);
    const dataset = dcmjs.data.DicomMetaData.naturalizeDataset(dicomData.dict);

    // Extract metadata
    const metadata = extractMetadata(dataset);

    return {
      metadata,
      dataset,
      imageData: arrayBuffer,
    };
  } catch (error) {
    console.error('Error parsing DICOM file:', error);
    throw new Error(`Failed to parse DICOM file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract structured metadata from DICOM dataset
 */
export function extractMetadata(dataset: any): DicomMetadata {
  const metadata: DicomMetadata = {
    // Patient Information
    patientName: getString(dataset.PatientName),
    patientID: getString(dataset.PatientID),
    patientBirthDate: getString(dataset.PatientBirthDate),
    patientSex: getString(dataset.PatientSex),
    patientAge: getString(dataset.PatientAge),

    // Study Information
    studyInstanceUID: getString(dataset.StudyInstanceUID),
    studyDate: getString(dataset.StudyDate),
    studyTime: getString(dataset.StudyTime),
    studyDescription: getString(dataset.StudyDescription),
    accessionNumber: getString(dataset.AccessionNumber),

    // Series Information
    seriesInstanceUID: getString(dataset.SeriesInstanceUID),
    seriesNumber: getString(dataset.SeriesNumber),
    seriesDescription: getString(dataset.SeriesDescription),
    modality: getString(dataset.Modality),

    // Image Information
    sopInstanceUID: getString(dataset.SOPInstanceUID),
    instanceNumber: getNumber(dataset.InstanceNumber),
    rows: getNumber(dataset.Rows),
    columns: getNumber(dataset.Columns),
    numberOfFrames: getNumber(dataset.NumberOfFrames),

    // Additional metadata
    institutionName: getString(dataset.InstitutionName),
    referringPhysicianName: getString(dataset.ReferringPhysicianName),
    performingPhysicianName: getString(dataset.PerformingPhysicianName),

    // Store all tags for comparison
    allTags: dataset,
  };

  return metadata;
}

/**
 * Safely get string value from DICOM dataset
 */
function getString(value: any): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'object' && value.Alphabetic) {
    return value.Alphabetic.trim();
  }

  return String(value).trim();
}

/**
 * Safely get number value from DICOM dataset
 */
function getNumber(value: any): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

/**
 * Validate if file is a valid DICOM file
 */
export function validateDicomFile(arrayBuffer: ArrayBuffer): boolean {
  try {
    const byteArray = new Uint8Array(arrayBuffer);

    // Check for DICOM magic number "DICM" at offset 128
    if (byteArray.length < 132) {
      return false;
    }

    const magic = String.fromCharCode(
      byteArray[128],
      byteArray[129],
      byteArray[130],
      byteArray[131]
    );

    return magic === 'DICM';
  } catch (error) {
    return false;
  }
}

/**
 * Get tag value by tag string
 */
export function getTagValue(dataset: any, tag: string): any {
  // Convert tag format if needed
  const tagName = Object.keys(DICOM_TAGS).find(
    (key) => DICOM_TAGS[key as keyof typeof DICOM_TAGS] === tag
  );

  if (tagName) {
    return dataset[tagName];
  }

  return undefined;
}

/**
 * Get all DICOM tags as key-value pairs
 */
export function getAllTags(dataset: any): Record<string, any> {
  const tags: Record<string, any> = {};

  for (const key in dataset) {
    if (dataset.hasOwnProperty(key)) {
      tags[key] = dataset[key];
    }
  }

  return tags;
}

/**
 * Format DICOM date (YYYYMMDD) to readable format
 */
export function formatDicomDate(dicomDate?: string): string {
  if (!dicomDate || dicomDate.length !== 8) {
    return 'N/A';
  }

  const year = dicomDate.substring(0, 4);
  const month = dicomDate.substring(4, 6);
  const day = dicomDate.substring(6, 8);

  return `${year}-${month}-${day}`;
}

/**
 * Format DICOM time (HHmmss) to readable format
 */
export function formatDicomTime(dicomTime?: string): string {
  if (!dicomTime || dicomTime.length < 6) {
    return 'N/A';
  }

  const hours = dicomTime.substring(0, 2);
  const minutes = dicomTime.substring(2, 4);
  const seconds = dicomTime.substring(4, 6);

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Get image dimensions from metadata
 */
export function getImageDimensions(metadata: DicomMetadata): {
  width: number;
  height: number;
  frames: number;
} {
  return {
    width: metadata.columns || 0,
    height: metadata.rows || 0,
    frames: metadata.numberOfFrames || 1,
  };
}

/**
 * DICOM Parser Service
 * Handles parsing of DICOM files and extraction of metadata
 */

import * as dicomParser from 'dicom-parser';
import type { DicomMetadata } from '@store/types';
import { DICOM_TAGS } from '@utils/dicomTags';

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

    // Parse using dicom-parser
    const byteArray = new Uint8Array(arrayBuffer);
    const dataSet = dicomParser.parseDicom(byteArray);

    // Extract metadata directly from dicom-parser dataset
    const metadata = extractMetadataFromDicomParser(dataSet);

    return {
      metadata,
      dataset: dataSet,
      imageData: arrayBuffer,
    };
  } catch (error) {
    console.error('Error parsing DICOM file:', error);
    throw new Error(`Failed to parse DICOM file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract structured metadata from dicom-parser dataset
 */
export function extractMetadataFromDicomParser(dataSet: any): DicomMetadata {
  const getStringFromTag = (tag: string): string | undefined => {
    try {
      const element = dataSet.elements[tag];
      if (!element) return undefined;
      return dataSet.string(tag)?.trim();
    } catch {
      return undefined;
    }
  };

  const getNumberFromTag = (tag: string): number | undefined => {
    try {
      const str = getStringFromTag(tag);
      if (!str) return undefined;
      const num = Number(str);
      return isNaN(num) ? undefined : num;
    } catch {
      return undefined;
    }
  };

  const metadata: DicomMetadata = {
    // Patient Information
    patientName: getStringFromTag('x00100010'),
    patientID: getStringFromTag('x00100020'),
    patientBirthDate: getStringFromTag('x00100030'),
    patientSex: getStringFromTag('x00100040'),
    patientAge: getStringFromTag('x00101010'),

    // Study Information
    studyInstanceUID: getStringFromTag('x0020000d'),
    studyDate: getStringFromTag('x00080020'),
    studyTime: getStringFromTag('x00080030'),
    studyDescription: getStringFromTag('x00081030'),
    accessionNumber: getStringFromTag('x00080050'),

    // Series Information
    seriesInstanceUID: getStringFromTag('x0020000e'),
    seriesNumber: getStringFromTag('x00200011'),
    seriesDescription: getStringFromTag('x0008103e'),
    modality: getStringFromTag('x00080060'),

    // Image Information
    sopInstanceUID: getStringFromTag('x00080018'),
    instanceNumber: getNumberFromTag('x00200013'),
    rows: getNumberFromTag('x00280010'),
    columns: getNumberFromTag('x00280011'),
    numberOfFrames: getNumberFromTag('x00280008'),

    // Additional metadata
    institutionName: getStringFromTag('x00080080'),
    referringPhysicianName: getStringFromTag('x00080090'),
    performingPhysicianName: getStringFromTag('x00081050'),

    // Store all tags for comparison - only serializable data
    allTags: extractSerializableTags(dataSet),
  };

  return metadata;
}

/**
 * Extract serializable tag data from DICOM dataset
 */
function extractSerializableTags(dataSet: any): Record<string, any> {
  const tags: Record<string, any> = {};
  
  try {
    // Iterate through all elements and extract their values
    for (const tag in dataSet.elements) {
      if (!dataSet.elements.hasOwnProperty(tag)) continue;
      
      const element = dataSet.elements[tag];
      if (!element) continue;
      
      try {
        // Try to get string value
        const stringValue = dataSet.string(tag);
        if (stringValue !== undefined) {
          tags[tag] = stringValue;
          continue;
        }
      } catch {}
      
      try {
        // Try to get number value
        const uint16Value = dataSet.uint16(tag);
        if (uint16Value !== undefined) {
          tags[tag] = uint16Value;
          continue;
        }
      } catch {}
      
      try {
        // Try to get float value
        const floatValue = dataSet.floatString(tag);
        if (floatValue !== undefined) {
          tags[tag] = parseFloat(floatValue);
          continue;
        }
      } catch {}
      
      // If we can't extract a value, store the element info (without functions)
      tags[tag] = {
        length: element.length,
        dataOffset: element.dataOffset,
        vr: element.vr,
      };
    }
  } catch (error) {
    console.warn('Error extracting serializable tags:', error);
  }
  
  return tags;
}

/**
 * Extract structured metadata from DICOM dataset (legacy - for dcmjs format)
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

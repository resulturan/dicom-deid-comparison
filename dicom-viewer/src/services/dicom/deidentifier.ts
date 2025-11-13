/**
 * DICOM Deidentification Service
 * Implements DICOM PS3.15 standards for removing PHI (Protected Health Information)
 */

import type { DicomMetadata, DeidentifyOptions } from '@store/types';
import { ANONYMOUS_PATIENT_NAME, ANONYMOUS_PATIENT_ID_PREFIX } from '@utils/constants';

// Session-based UID mapping for consistency
const uidMappingCache = new Map<string, string>();

/**
 * Generate anonymous patient ID
 */
export function generateAnonymousID(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${ANONYMOUS_PATIENT_ID_PREFIX}${timestamp}-${random}`;
}

/**
 * Generate anonymous UID with session consistency
 * Same original UID will always map to the same anonymous UID within a session
 */
export function generateAnonymousUID(originalUID?: string): string {
  if (!originalUID) {
    return `2.25.${Date.now()}${Math.floor(Math.random() * 1000000)}`;
  }

  // Check if we've already anonymized this UID in this session
  if (uidMappingCache.has(originalUID)) {
    return uidMappingCache.get(originalUID)!;
  }

  // Create a deterministic hash from the original UID
  const hash = originalUID.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);

  // Generate anonymous UID with hash-based suffix for uniqueness
  const anonymousUID = `2.25.${Math.abs(hash)}${Math.floor(Math.random() * 100000)}`;

  // Cache the mapping for consistency
  uidMappingCache.set(originalUID, anonymousUID);

  return anonymousUID;
}

/**
 * Clear UID mapping cache (useful when starting a new deidentification session)
 */
export function clearUIDCache(): void {
  uidMappingCache.clear();
}

/**
 * Shift a DICOM date by a specified number of days
 * Format: YYYYMMDD
 */
export function shiftDicomDate(dicomDate: string | undefined, days: number): string | undefined {
  if (!dicomDate || dicomDate.length !== 8) {
    return undefined;
  }

  try {
    const year = parseInt(dicomDate.substring(0, 4));
    const month = parseInt(dicomDate.substring(4, 6)) - 1; // JS months are 0-indexed
    const day = parseInt(dicomDate.substring(6, 8));

    const date = new Date(year, month, day);
    date.setDate(date.getDate() + days);

    const newYear = date.getFullYear().toString();
    const newMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    const newDay = date.getDate().toString().padStart(2, '0');

    return `${newYear}${newMonth}${newDay}`;
  } catch (error) {
    console.error('Error shifting date:', error);
    return undefined;
  }
}

/**
 * Deidentify DICOM metadata according to options
 */
export function deidentifyMetadata(
  metadata: DicomMetadata,
  options: DeidentifyOptions
): DicomMetadata {
  const deidentified: DicomMetadata = { ...metadata };

  // Remove or anonymize patient name
  if (options.removePatientName) {
    deidentified.patientName = ANONYMOUS_PATIENT_NAME;
  }

  // Remove or anonymize patient ID
  if (options.removePatientID) {
    deidentified.patientID = generateAnonymousID();
  }

  // Handle dates
  if (options.removeDates) {
    deidentified.patientBirthDate = undefined;
    deidentified.studyDate = undefined;
    deidentified.studyTime = undefined;
  } else if (options.shiftDates && options.dateShiftDays) {
    deidentified.patientBirthDate = shiftDicomDate(
      metadata.patientBirthDate,
      -options.dateShiftDays
    );
    deidentified.studyDate = shiftDicomDate(
      metadata.studyDate,
      -options.dateShiftDays
    );
    // Note: Time is not shifted, only dates
  }

  // Remove institution information
  if (options.removeInstitution) {
    deidentified.institutionName = undefined;
  }

  // Remove physician names
  if (options.removePhysicians) {
    deidentified.referringPhysicianName = undefined;
    deidentified.performingPhysicianName = undefined;
  }

  // Anonymize UIDs
  if (options.anonymizeUIDs) {
    deidentified.studyInstanceUID = generateAnonymousUID(metadata.studyInstanceUID);
    deidentified.seriesInstanceUID = generateAnonymousUID(metadata.seriesInstanceUID);
    deidentified.sopInstanceUID = generateAnonymousUID(metadata.sopInstanceUID);
  }

  // Keep series info if requested
  if (options.keepSeriesInfo) {
    deidentified.seriesDescription = metadata.seriesDescription;
    deidentified.seriesNumber = metadata.seriesNumber;
    deidentified.modality = metadata.modality;
  }

  return deidentified;
}

/**
 * Deidentify a complete DICOM dataset
 */
export function deidentifyDataset(
  dataset: any,
  options: DeidentifyOptions
): any {
  const deidentified = { ...dataset };

  // Remove PHI tags
  if (options.removePatientName) {
    deidentified.PatientName = ANONYMOUS_PATIENT_NAME;
  }

  if (options.removePatientID) {
    deidentified.PatientID = generateAnonymousID();
  }

  // Remove patient birth date
  if (options.removeDates) {
    delete deidentified.PatientBirthDate;
    delete deidentified.StudyDate;
    delete deidentified.StudyTime;
    delete deidentified.SeriesDate;
    delete deidentified.SeriesTime;
    delete deidentified.AcquisitionDate;
    delete deidentified.AcquisitionTime;
    delete deidentified.ContentDate;
    delete deidentified.ContentTime;
  } else if (options.shiftDates && options.dateShiftDays) {
    // Shift dates
    if (deidentified.PatientBirthDate) {
      deidentified.PatientBirthDate = shiftDicomDate(
        deidentified.PatientBirthDate,
        -options.dateShiftDays
      );
    }
    if (deidentified.StudyDate) {
      deidentified.StudyDate = shiftDicomDate(
        deidentified.StudyDate,
        -options.dateShiftDays
      );
    }
    if (deidentified.SeriesDate) {
      deidentified.SeriesDate = shiftDicomDate(
        deidentified.SeriesDate,
        -options.dateShiftDays
      );
    }
    if (deidentified.AcquisitionDate) {
      deidentified.AcquisitionDate = shiftDicomDate(
        deidentified.AcquisitionDate,
        -options.dateShiftDays
      );
    }
    if (deidentified.ContentDate) {
      deidentified.ContentDate = shiftDicomDate(
        deidentified.ContentDate,
        -options.dateShiftDays
      );
    }
  }

  // Remove additional PHI
  if (options.removeInstitution) {
    delete deidentified.InstitutionName;
    delete deidentified.InstitutionAddress;
    delete deidentified.InstitutionalDepartmentName;
  }

  if (options.removePhysicians) {
    delete deidentified.ReferringPhysicianName;
    delete deidentified.PerformingPhysicianName;
    delete deidentified.OperatorsName;
    delete deidentified.PhysiciansOfRecord;
  }

  // Remove other common PHI tags
  delete deidentified.PatientAddress;
  delete deidentified.PatientTelephoneNumbers;
  delete deidentified.PatientAge;
  delete deidentified.PatientSize;
  delete deidentified.PatientWeight;
  delete deidentified.PatientComments;
  delete deidentified.AdditionalPatientHistory;

  // Anonymize UIDs if requested
  if (options.anonymizeUIDs) {
    if (deidentified.StudyInstanceUID) {
      deidentified.StudyInstanceUID = generateAnonymousUID(deidentified.StudyInstanceUID);
    }
    if (deidentified.SeriesInstanceUID) {
      deidentified.SeriesInstanceUID = generateAnonymousUID(deidentified.SeriesInstanceUID);
    }
    if (deidentified.SOPInstanceUID) {
      deidentified.SOPInstanceUID = generateAnonymousUID(deidentified.SOPInstanceUID);
    }
  }

  // Keep description fields if keeping series info
  if (!options.keepSeriesInfo) {
    delete deidentified.SeriesDescription;
    delete deidentified.StudyDescription;
    delete deidentified.ProtocolName;
  }

  // Remove accession number (contains PHI)
  delete deidentified.AccessionNumber;

  // Add deidentification notes
  deidentified.PatientIdentityRemoved = 'YES';
  deidentified.DeidentificationMethod = 'DICOM Deidentification Viewer v1.0';
  deidentified.DeidentificationMethodCodeSequence = [
    {
      CodeValue: '113100',
      CodingSchemeDesignator: 'DCM',
      CodeMeaning: 'Basic Application Confidentiality Profile',
    },
  ];

  return deidentified;
}

/**
 * Get list of tags that will be modified
 */
export function getModifiedTags(options: DeidentifyOptions): string[] {
  const tags: string[] = [];

  if (options.removePatientName) {
    tags.push('PatientName');
  }
  if (options.removePatientID) {
    tags.push('PatientID');
  }
  if (options.removeDates) {
    tags.push('PatientBirthDate', 'StudyDate', 'StudyTime');
  }
  if (options.shiftDates) {
    tags.push('Dates (shifted)');
  }
  if (options.removeInstitution) {
    tags.push('InstitutionName', 'InstitutionAddress');
  }
  if (options.removePhysicians) {
    tags.push('ReferringPhysicianName', 'PerformingPhysicianName');
  }
  if (options.anonymizeUIDs) {
    tags.push('StudyInstanceUID', 'SeriesInstanceUID', 'SOPInstanceUID');
  }

  // Always removed
  tags.push('PatientAddress', 'PatientTelephoneNumbers', 'AccessionNumber');

  return tags;
}

/**
 * Validate deidentification options
 */
export function validateDeidentificationOptions(options: DeidentifyOptions): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (options.shiftDates && !options.dateShiftDays) {
    errors.push('Date shift is enabled but no shift days specified');
  }

  if (options.shiftDates && options.removeDates) {
    errors.push('Cannot both shift and remove dates');
  }

  if (options.dateShiftDays && options.dateShiftDays < 0) {
    errors.push('Date shift days must be positive');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

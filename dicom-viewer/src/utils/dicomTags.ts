/**
 * DICOM Tag Definitions
 * Based on DICOM Standard PS3.6
 */

export const DICOM_TAGS = {
  // Patient Information (0010,xxxx)
  PatientName: 'x00100010',
  PatientID: 'x00100020',
  PatientBirthDate: 'x00100030',
  PatientSex: 'x00100040',
  PatientAge: 'x00101010',
  PatientAddress: 'x00101040',
  PatientTelephoneNumbers: 'x00102154',

  // Study Information (0008,xxxx and 0020,xxxx)
  StudyInstanceUID: 'x0020000d',
  StudyDate: 'x00080020',
  StudyTime: 'x00080030',
  StudyDescription: 'x00081030',
  AccessionNumber: 'x00080050',
  ReferringPhysicianName: 'x00080090',
  StudyID: 'x00200010',

  // Series Information (0008,xxxx and 0020,xxxx)
  SeriesInstanceUID: 'x0020000e',
  SeriesNumber: 'x00200011',
  SeriesDescription: 'x0008103e',
  Modality: 'x00080060',
  PerformingPhysicianName: 'x00081050',
  OperatorsName: 'x00081070',

  // Instance Information (0008,xxxx and 0020,xxxx)
  SOPInstanceUID: 'x00080018',
  InstanceNumber: 'x00200013',

  // Image Information (0028,xxxx)
  Rows: 'x00280010',
  Columns: 'x00280011',
  PixelSpacing: 'x00280030',
  BitsAllocated: 'x00280100',
  BitsStored: 'x00280101',
  HighBit: 'x00280102',
  PixelRepresentation: 'x00280103',
  WindowCenter: 'x00281050',
  WindowWidth: 'x00281051',
  RescaleIntercept: 'x00281052',
  RescaleSlope: 'x00281053',
  PhotometricInterpretation: 'x00280004',
  NumberOfFrames: 'x00280008',

  // Institution Information
  InstitutionName: 'x00080080',
  InstitutionAddress: 'x00080081',
  InstitutionalDepartmentName: 'x00081040',

  // Equipment Information
  Manufacturer: 'x00080070',
  ManufacturerModelName: 'x00081090',
  DeviceSerialNumber: 'x00181000',
  SoftwareVersions: 'x00181020',
  StationName: 'x00081010',

  // Pixel Data
  PixelData: 'x7fe00010',
} as const;

/**
 * Tags that contain PHI (Protected Health Information)
 * These should be removed or modified during deidentification
 */
export const PHI_TAGS = [
  DICOM_TAGS.PatientName,
  DICOM_TAGS.PatientID,
  DICOM_TAGS.PatientBirthDate,
  DICOM_TAGS.PatientAddress,
  DICOM_TAGS.PatientTelephoneNumbers,
  DICOM_TAGS.ReferringPhysicianName,
  DICOM_TAGS.PerformingPhysicianName,
  DICOM_TAGS.OperatorsName,
  DICOM_TAGS.InstitutionName,
  DICOM_TAGS.InstitutionAddress,
  DICOM_TAGS.StationName,
  DICOM_TAGS.AccessionNumber,
] as const;

/**
 * Date/Time tags that may need to be shifted
 */
export const DATE_TIME_TAGS = [
  DICOM_TAGS.StudyDate,
  DICOM_TAGS.StudyTime,
  DICOM_TAGS.PatientBirthDate,
] as const;

/**
 * UID tags that may need to be anonymized
 */
export const UID_TAGS = [
  DICOM_TAGS.StudyInstanceUID,
  DICOM_TAGS.SeriesInstanceUID,
  DICOM_TAGS.SOPInstanceUID,
] as const;

/**
 * Tags that should be kept for clinical utility
 */
export const CLINICAL_TAGS = [
  DICOM_TAGS.Modality,
  DICOM_TAGS.SeriesDescription,
  DICOM_TAGS.StudyDescription,
  DICOM_TAGS.PixelSpacing,
  DICOM_TAGS.WindowCenter,
  DICOM_TAGS.WindowWidth,
  DICOM_TAGS.Rows,
  DICOM_TAGS.Columns,
] as const;

/**
 * Get human-readable tag name
 */
export function getTagName(tag: string): string {
  const entry = Object.entries(DICOM_TAGS).find(([_, value]) => value === tag);
  return entry ? entry[0] : tag;
}

/**
 * Check if a tag contains PHI
 */
export function isPHITag(tag: string): boolean {
  return PHI_TAGS.includes(tag as any);
}

/**
 * Check if a tag is a date/time tag
 */
export function isDateTimeTag(tag: string): boolean {
  return DATE_TIME_TAGS.includes(tag as any);
}

/**
 * Check if a tag is a UID tag
 */
export function isUIDTag(tag: string): boolean {
  return UID_TAGS.includes(tag as any);
}

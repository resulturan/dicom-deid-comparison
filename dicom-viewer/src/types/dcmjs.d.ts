/**
 * Type declarations for dcmjs library
 * dcmjs is a JavaScript implementation of DICOM for use in the web browser and node.js
 */

declare module 'dcmjs' {
  export namespace data {
    class DicomMessage {
      static readFile(arrayBuffer: ArrayBuffer): any;
      static readPart10(arrayBuffer: ArrayBuffer): any;
      dict: any;
    }

    class DicomMetaData {
      static naturalizeDataset(dataset: any): any;
      static denaturalizeDataset(dataset: any): any;
    }

    class DicomDict {
      static dict: any;
    }
  }

  export namespace normalizers {
    class Normalizer {
      static normalizeToDataset(instance: any): any;
    }
  }

  export namespace derivations {
    class Segmentation {
      static generateToolState(
        dataset: any,
        imageDataObject: any,
        tolerance?: number
      ): any;
      static generateSegmentation(
        imageIds: string[],
        toolState: any,
        options?: any
      ): any;
    }
  }

  const dcmjs: {
    data: typeof data;
    normalizers: typeof normalizers;
    derivations: typeof derivations;
  };

  export default dcmjs;
}

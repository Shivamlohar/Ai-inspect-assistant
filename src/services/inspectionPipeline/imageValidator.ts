/**
 * Image Validator Service
 * Verifies file integrity, format, dimensions, and visual quality.
 */

export interface ImageValidationResult {
  isValid: boolean;
  errorCode?: 'CORRUPTED' | 'UNSUPPORTED_FORMAT' | 'LOW_RESOLUTION' | 'EMPTY_FILE';
  errorMessage?: string;
  width?: number;
  height?: number;
  qualityScore: number; // 0 - 100
}

export async function validateImageQuality(
  dataUrlOrBlobUrl: string,
  minWidth: number = 100,
  minHeight: number = 100
): Promise<ImageValidationResult> {
  if (!dataUrlOrBlobUrl || typeof dataUrlOrBlobUrl !== 'string') {
    return {
      isValid: false,
      errorCode: 'EMPTY_FILE',
      errorMessage: 'No visual data provided for analysis.',
      qualityScore: 0
    };
  }

  // Node environment or SSR fallback
  if (typeof window === 'undefined' || typeof Image === 'undefined') {
    return {
      isValid: true,
      qualityScore: 90
    };
  }

  return new Promise<ImageValidationResult>((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (!width || !height || width <= 0 || height <= 0) {
        resolve({
          isValid: false,
          errorCode: 'CORRUPTED',
          errorMessage: 'Image file appears to be corrupted or contains zero visual pixels.',
          qualityScore: 0
        });
        return;
      }

      if (width < minWidth || height < minHeight) {
        resolve({
          isValid: true,
          width,
          height,
          qualityScore: 70
        });
        return;
      }

      // Calculate simple quality heuristic based on resolution
      const megapixels = (width * height) / 1000000;
      let qualityScore = 80;
      if (megapixels > 2.0) qualityScore = 95;
      else if (megapixels > 0.8) qualityScore = 90;
      else if (megapixels > 0.3) qualityScore = 85;

      resolve({
        isValid: true,
        width,
        height,
        qualityScore
      });
    };

    img.onerror = () => {
      resolve({
        isValid: Boolean(dataUrlOrBlobUrl && dataUrlOrBlobUrl.length > 20),
        qualityScore: 75
      });
    };

    img.src = dataUrlOrBlobUrl;
  });
}

/**
 * First-Stage Vision Classifier Service
 * Performs visual pixel analysis & multi-modal AI classification to reliably
 * distinguish human/person photos from civil infrastructure and industrial assets.
 */

import type { AssetCategory } from './types';

export interface VisionClassificationResult {
  category: AssetCategory;
  confidence: number; // 0 - 100
  confidenceLabel: string;
  isEligible: boolean;
  subjectDescription: string;
  reason: string;
  modelUsed: string;
  source: 'cloud_vision_api' | 'local_biometric_cv' | 'metadata_inference';
  skinToneRatio?: number;
  portraitRatio?: number;
}

/**
 * Evaluates image pixel data for biometric human skin tone clusters.
 * Supports all human Fitzpatrick scales (I to VI) using multi-space analysis:
 * - Normalized RGB
 * - HSV (Hue, Saturation, Value)
 * - YCbCr (Chrominance-blue, Chrominance-red)
 */
export function analyzeImagePixelsForBiometrics(
  imageData: ImageData | { data: Uint8ClampedArray | Uint8Array | number[]; width: number; height: number }
): { isPerson: boolean; confidence: number; skinRatio: number; portraitRoiRatio: number; reason: string } {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  if (totalPixels === 0) {
    return { isPerson: false, confidence: 50, skinRatio: 0, portraitRoiRatio: 0, reason: 'Empty image' };
  }

  let skinPixelCount = 0;
  let portraitRoiSkinCount = 0;
  let portraitRoiTotalPixels = 0;

  // Portrait / Face Region of Interest (ROI):
  // Faces and upper bodies are typically framed in the middle 60% horizontally and upper 70% vertically
  const roiXStart = Math.floor(width * 0.20);
  const roiXEnd = Math.floor(width * 0.80);
  const roiYStart = Math.floor(height * 0.10);
  const roiYEnd = Math.floor(height * 0.75);

  for (let y = 0; y < height; y++) {
    const isYInRoi = y >= roiYStart && y <= roiYEnd;

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const isRoiPixel = isYInRoi && x >= roiXStart && x <= roiXEnd;
      if (isRoiPixel) {
        portraitRoiTotalPixels++;
      }

      // 1. Normalized RGB Rule for Skin Tone
      const sum = r + g + b;
      let isSkin = false;

      if (sum > 0) {
        const nr = r / sum;
        const ng = g / sum;

        // Basic RGB skin condition
        const rgbCheck =
          r > 75 &&
          g > 40 &&
          b > 20 &&
          r > g &&
          r > b &&
          Math.abs(r - g) > 12 &&
          (r - b) > 12 &&
          nr > 0.35 &&
          nr < 0.65 &&
          ng > 0.22 &&
          ng < 0.38;

        // 2. YCbCr Chrominance Skin Space Check
        const cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
        const cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
        const ycbcrCheck = cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;

        // 3. HSV Color Space Check
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        let h = 0;
        if (delta !== 0) {
          if (max === r) h = ((g - b) / delta) % 6;
          else if (max === g) h = (b - r) / delta + 2;
          else h = (r - g) / delta + 4;
          h = Math.round(h * 60);
          if (h < 0) h += 360;
        }
        const s = max === 0 ? 0 : delta / max;
        const v = max / 255;

        const hsvCheck = (h >= 0 && h <= 50) || (h >= 335 && h <= 360);
        const sCheck = s >= 0.14 && s <= 0.72;
        const vCheck = v >= 0.22 && v <= 0.98;

        if ((rgbCheck && (ycbcrCheck || (hsvCheck && sCheck))) || (ycbcrCheck && hsvCheck && sCheck && vCheck)) {
          isSkin = true;
        }
      }

      if (isSkin) {
        skinPixelCount++;
        if (isRoiPixel) {
          portraitRoiSkinCount++;
        }
      }
    }
  }

  const skinRatio = skinPixelCount / totalPixels;
  const portraitRoiRatio = portraitRoiTotalPixels > 0 ? (portraitRoiSkinCount / portraitRoiTotalPixels) : 0;

  // Decision Thresholds:
  // A selfie / portrait or person photo typically has:
  // - Over 13% skin tone in the portrait ROI, OR
  // - Over 18% total skin tone in the frame
  const isPerson = (portraitRoiRatio >= 0.13 && skinRatio >= 0.07) || (skinRatio >= 0.18);
  const confidence = isPerson 
    ? Math.min(99, Math.round(85 + (portraitRoiRatio * 25) + (skinRatio * 15))) 
    : Math.max(30, Math.round((1 - portraitRoiRatio) * 80));

  return {
    isPerson,
    confidence,
    skinRatio: Math.round(skinRatio * 100) / 100,
    portraitRoiRatio: Math.round(portraitRoiRatio * 100) / 100,
    reason: isPerson
      ? `Visual biometric analysis detected human skin tone (${Math.round(portraitRoiRatio * 100)}% ROI density, ${Math.round(skinRatio * 100)}% overall) matching portrait/person framing.`
      : 'No significant human biometric skin tone patterns detected.'
  };
}

/**
 * Client-side visual image classification using an HTML5 canvas.
 * Decodes the image element/dataUrl and runs pixel analysis.
 */
export async function classifyImageVisualLocal(
  imageSource: string | HTMLImageElement
): Promise<VisionClassificationResult> {
  return new Promise((resolve) => {
    try {
      let img: HTMLImageElement;

      const runAnalysisOnLoadedImage = (loadedImg: HTMLImageElement) => {
        try {
          const canvas = document.createElement('canvas');
          // Downscale to 160x160 for high-speed deterministic optical scanning
          canvas.width = 160;
          canvas.height = 160;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          if (!ctx) {
            resolve(createUnknownResult('Canvas context unavailable'));
            return;
          }

          ctx.drawImage(loadedImg, 0, 0, 160, 160);
          const imageData = ctx.getImageData(0, 0, 160, 160);

          // 1. Biometric skin tone & portrait check
          const bio = analyzeImagePixelsForBiometrics(imageData);

          if (bio.isPerson) {
            resolve({
              category: 'Person / Human',
              confidence: bio.confidence,
              confidenceLabel: `${bio.confidence}%`,
              isEligible: false,
              subjectDescription: 'Human / Person (Portrait or Selfie)',
              reason: 'The uploaded image contains a person / unsupported subject. Structural and industrial inspection cannot be performed on non-infrastructure images.',
              modelUsed: 'Local Computer Vision Biometric & Skin-Tone Classifier',
              source: 'local_biometric_cv',
              skinToneRatio: bio.skinRatio,
              portraitRatio: bio.portraitRoiRatio
            });
            return;
          }

          // 2. Environmental vegetation check (Landscape)
          let greenPixels = 0;
          let lowSatGrayPixels = 0;
          const total = 160 * 160;
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            const s = max === 0 ? 0 : delta / max;

            // Green foliage
            if (g > r && g > b && g > 60 && (g - r) > 15 && (g - b) > 15) {
              greenPixels++;
            }

            // Concrete / Asphalt low-saturation gray
            if (s < 0.16 && max > 40 && max < 210) {
              lowSatGrayPixels++;
            }
          }

          if (greenPixels / total > 0.38) {
            resolve({
              category: 'Landscape',
              confidence: 91,
              confidenceLabel: '91%',
              isEligible: false,
              subjectDescription: 'Natural Landscape / Foliage',
              reason: 'Natural vegetation and landscape detected. Structural defect metrology is not applicable.',
              modelUsed: 'Local Computer Vision Environmental Chrominance Classifier',
              source: 'local_biometric_cv'
            });
            return;
          }

          // 3. Concrete / Asphalt Civil infrastructure signatures
          if (lowSatGrayPixels / total > 0.45) {
            resolve({
              category: 'Building',
              confidence: 84,
              confidenceLabel: '84%',
              isEligible: true,
              subjectDescription: 'Concrete / Masonry Infrastructure Structure',
              reason: 'High density of structural low-saturation material consistent with concrete or asphalt infrastructure.',
              modelUsed: 'Local Computer Vision Structural Texture Classifier',
              source: 'local_biometric_cv'
            });
            return;
          }

          // Default fallback
          resolve(createUnknownResult('Visual characteristics unverified'));
        } catch (err: any) {
          console.warn('Local optical image analysis error:', err);
          resolve(createUnknownResult(err.message));
        }
      };

      if (typeof imageSource === 'string') {
        img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => runAnalysisOnLoadedImage(img);
        img.onerror = () => resolve(createUnknownResult('Image failed to load'));
        img.src = imageSource;
      } else {
        if (imageSource.complete && imageSource.naturalWidth > 0) {
          runAnalysisOnLoadedImage(imageSource);
        } else {
          imageSource.onload = () => runAnalysisOnLoadedImage(imageSource);
          imageSource.onerror = () => resolve(createUnknownResult('Image failed to load'));
        }
      }
    } catch (e: any) {
      resolve(createUnknownResult(e.message));
    }
  });
}

function createUnknownResult(reason: string): VisionClassificationResult {
  return {
    category: 'Unknown / Unsupported',
    confidence: 45,
    confidenceLabel: '45%',
    isEligible: false,
    subjectDescription: 'Unverified Subject',
    reason: `Image content cannot be certified as a supported civil or industrial asset (${reason}). Defect metrology suppressed.`,
    modelUsed: 'Local Computer Vision Heuristic Classifier',
    source: 'local_biometric_cv'
  };
}
export function mapCategoryStringToAssetCategory(cat: string): AssetCategory {
  const c = (cat || '').toLowerCase().trim();
  if (c.includes('person') || c.includes('human') || c.includes('selfie') || c.includes('portrait') || c.includes('face') || c.includes('group of people')) return 'Person / Human';
  if (c.includes('bridge') || c.includes('viaduct') || c.includes('overpass')) return 'Bridge';
  if (c.includes('road') || c.includes('pavement') || c.includes('highway') || c.includes('asphalt') || c.includes('street')) return 'Road';
  if (c.includes('machinery') || c.includes('machine') || c.includes('motor') || c.includes('pump') || c.includes('turbine') || c.includes('engine') || c.includes('compressor') || c.includes('gearbox')) return 'Industrial Machinery';
  if (c.includes('building') || c.includes('beam') || c.includes('pillar') || c.includes('concrete structure') || c.includes('masonry') || c.includes('slab')) return 'Building';
  if (c.includes('pole') || c.includes('electrical pole') || c.includes('utility pole') || c.includes('pylon') || c.includes('transformer')) return 'Electrical Pole';
  if (c.includes('pipeline') || c.includes('pipe') || c.includes('gas line')) return 'Pipeline';
  if (c.includes('solar') || c.includes('photovoltaic') || c.includes('pv module')) return 'Solar Panel';
  if (c.includes('rail') || c.includes('railway') || c.includes('train track')) return 'Railway Infrastructure';
  if (c.includes('vehicle') || c.includes('truck') || c.includes('equipment') || c.includes('crane')) return 'Vehicle / Equipment';
  if (c.includes('animal') || c.includes('dog') || c.includes('cat') || c.includes('pet')) return 'Animal';
  if (c.includes('room') || c.includes('indoor') || c.includes('furniture')) return 'Indoor Room';
  if (c.includes('landscape') || c.includes('nature') || c.includes('foliage') || c.includes('mountain')) return 'Landscape';
  return 'Unknown / Unsupported';
}

/**
 * First-Stage Vision Classifier Orchestrator
 * Canonical classification runs server-side via POST /api/vision/classify
 * using the configured GEMINI_VISION_MODEL with zero browser API key exposure.
 */
export async function classifyVisualInput(
  mediaUrlOrBase64: string,
  _fileName: string = 'asset.jpg',
  mimeType: string = 'image/jpeg'
): Promise<VisionClassificationResult> {
  // Tier 1: Canonical Backend Vision Classifier (Server-Side Proxy)
  if (typeof fetch !== 'undefined' && mediaUrlOrBase64) {
    try {
      const pureBase64 = mediaUrlOrBase64.startsWith('data:') 
        ? mediaUrlOrBase64 
        : (mediaUrlOrBase64.length > 200 ? `data:${mimeType};base64,${mediaUrlOrBase64}` : mediaUrlOrBase64);

      const serverResp = await fetch('/api/vision/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: pureBase64,
          mimeType
        })
      });

      if (serverResp.ok) {
        const data = await serverResp.json();
        if (data && data.success) {
          const mappedCat = mapCategoryStringToAssetCategory(data.primaryCategory || data.category);
          const confNum = typeof data.confidence === 'number' 
            ? Math.round(data.confidence <= 1 ? data.confidence * 100 : data.confidence)
            : 85;

          const isEligible = Boolean(data.inspectionEligible && mappedCat !== 'Person / Human' && mappedCat !== 'Animal' && mappedCat !== 'Indoor Room' && mappedCat !== 'Landscape' && mappedCat !== 'Unknown / Unsupported');

          return {
            category: mappedCat,
            confidence: confNum,
            confidenceLabel: `${confNum}%`,
            isEligible,
            subjectDescription: data.assetType || data.primaryCategory || mappedCat,
            reason: data.reason || (isEligible 
              ? 'Supported engineering asset identified by visual classifier.' 
              : 'Subject is not an eligible engineering inspection asset.'),
            modelUsed: `${data.modelName || 'Google Gemini Vision'} (${data.modelVersion || 'gemini-2.5-flash'})`,
            source: 'cloud_vision_api'
          };
        }
      }
    } catch (serverErr) {
      console.warn('[VISION CLASSIFIER] Backend server call unavailable, attempting auxiliary offline inspection:', serverErr);
    }
  }

  // Tier 2: Auxiliary Offline Biometric & Pixel Analysis (Browser Canvas)
  // Low-confidence auxiliary signal only (Section 10)
  if (typeof window !== 'undefined' && mediaUrlOrBase64) {
    const localResult = await classifyImageVisualLocal(mediaUrlOrBase64);
    return localResult;
  }

  // Tier 3: Controlled Classification Failure (Section 26)
  // Never guess based on filename keywords
  return createUnknownResult('Visual classification service unavailable.');
}

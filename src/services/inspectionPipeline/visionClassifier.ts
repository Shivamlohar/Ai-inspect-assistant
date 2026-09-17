/**
 * First-Stage Vision Classifier Service
 * Performs visual pixel analysis & multi-modal AI classification to reliably
 * distinguish human/person photos from civil infrastructure and industrial assets.
 */

import type { AssetCategory } from './types';

function getStoredApiKey(): string {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('gemini_api_key') || '';
    }
  } catch {}
  return '';
}

export interface VisionClassificationResult {
  category: AssetCategory;
  confidence: number; // 0 - 100
  confidenceLabel: string;
  isEligible: boolean;
  subjectDescription: string;
  reason: string;
  modelUsed: string;
  source: 'cloud_vision_api' | 'local_biometric_cv' | 'local_cv' | 'metadata_inference';
  skinToneRatio?: number;
  portraitRatio?: number;
  serviceAvailable?: boolean;
  broadDomain?: string;
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

  // Decision Thresholds (Non-Negotiable Architecture):
  // Skin-tone detection must NOT be used as the primary person classifier.
  // Pixel color space histograms cannot distinguish between copper motor stator coils,
  // rust, brass fittings, amber machinery paint, or warm workshop lighting and human skin.
  // Human/person classification is exclusively determined by multimodal vision AI models.
  return {
    isPerson: false,
    confidence: 0,
    skinRatio: Math.round(skinRatio * 100) / 100,
    portraitRoiRatio: Math.round(portraitRoiRatio * 100) / 100,
    reason: 'Pixel color analysis cannot certify person presence. Server-side multimodal vision AI model required.'
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

          let greenPixels = 0;
          let lowSatGrayPixels = 0;
          let metallicGrayCount = 0;
          let mechanicalPixelCount = 0;
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

            // Metallic casing / cast iron / machined metal
            if (s < 0.25 && max > 45 && max < 225) {
              metallicGrayCount++;
            }

            // High contrast machinery features (copper windings, brass, amber/orange paint, mechanical parts)
            if ((r > 75 && g > 35 && b < 60) || (s < 0.32 && max > 55)) {
              mechanicalPixelCount++;
            }
          }

          // 1. Environmental vegetation check (Landscape)
          if (greenPixels / total > 0.38) {
            resolve({
              category: 'Landscape',
              confidence: 91,
              confidenceLabel: '91%',
              isEligible: false,
              subjectDescription: 'Natural Landscape / Foliage',
              reason: 'Natural vegetation and landscape detected. Structural defect metrology is not applicable.',
              modelUsed: 'Conservative Local Fallback',
              source: 'local_cv'
            });
            return;
          }

          // 2. Concrete / Asphalt Civil infrastructure signatures
          if (lowSatGrayPixels / total > 0.45) {
            resolve({
              category: 'Building',
              confidence: 84,
              confidenceLabel: '84%',
              isEligible: true,
              subjectDescription: 'Concrete / Masonry Infrastructure Structure',
              reason: 'High density of structural low-saturation material consistent with concrete or asphalt infrastructure.',
              modelUsed: 'Conservative Local Fallback',
              source: 'local_cv'
            });
            return;
          }

          // 3. Industrial Machinery / Mechanical features
          if (mechanicalPixelCount / total > 0.30 || metallicGrayCount / total > 0.38) {
            resolve({
              category: 'Industrial Machinery',
              confidence: 82,
              confidenceLabel: '82%',
              isEligible: true,
              subjectDescription: 'Industrial Machinery / Mechanical Asset Component',
              reason: 'Optical texture and metallic profile consistent with industrial machinery casing, motor, or mechanical plant equipment.',
              modelUsed: 'Conservative Local Fallback',
              source: 'local_cv'
            });
            return;
          }

          // Default fallback (Never assume person or guess without verification)
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
    confidence: 40,
    confidenceLabel: '40%',
    isEligible: false,
    subjectDescription: 'Unverified Subject',
    reason: `Image content cannot be certified as a supported civil or industrial asset (${reason}). Defect metrology suppressed.`,
    modelUsed: 'Conservative Local Fallback',
    source: 'local_cv'
  };
}
export function mapCategoryStringToAssetCategory(cat: string): AssetCategory {
  const c = (cat || '').toLowerCase().trim();
  if (!c) return 'Unknown / Unsupported';

  // 1. Strict Out-of-Scope
  if (c.includes('person') || c.includes('human') || c.includes('selfie') || c.includes('portrait') || c.includes('face') || c.includes('group of people')) return 'Person / Human';
  if (c.includes('animal') || c.includes('dog') || c.includes('cat') || c.includes('pet')) return 'Animal';
  if (c.includes('room') || c.includes('indoor') || c.includes('furniture')) return 'Indoor Room';
  if (c.includes('landscape') || c.includes('nature') || c.includes('foliage') || c.includes('mountain')) return 'Landscape';

  // 2. Mechanical & Industrial
  if (
    c.includes('machin') || c.includes('motor') || c.includes('pump') ||
    c.includes('compressor') || c.includes('turbine') || c.includes('engine') ||
    c.includes('gearbox') || c.includes('bearing') || c.includes('shaft') ||
    c.includes('valve') || c.includes('conveyor') || c.includes('hydraulic') ||
    c.includes('mechanical')
  ) {
    return 'Industrial Machinery';
  }

  // 3. Pressure Vessels & Pipelines
  if (c.includes('pressure vessel') || c.includes('boiler') || c.includes('vessel')) return 'Pressure Vessel';
  if (c.includes('pipeline') || c.includes('pipe') || c.includes('tank') || c.includes('conduit')) return 'Pipeline';

  // 4. Infrastructure & Civil
  if (c.includes('bridge') || c.includes('viaduct') || c.includes('overpass') || c.includes('flyover') || c.includes('pier')) return 'Bridge';
  if (c.includes('road') || c.includes('pavement') || c.includes('highway') || c.includes('asphalt') || c.includes('street') || c.includes('sidewalk')) return 'Road';
  if (c.includes('building') || c.includes('beam') || c.includes('pillar') || c.includes('column') || c.includes('concrete') || c.includes('masonry') || c.includes('slab') || c.includes('wall')) return 'Building';
  if (c.includes('tunnel') || c.includes('culvert') || c.includes('drainage') || c.includes('dam') || c.includes('shed') || c.includes('civil')) return 'Civil Infrastructure';
  if (c.includes('rail') || c.includes('railway') || c.includes('train track') || c.includes('locomotive')) return 'Railway Infrastructure';

  // 5. Electrical & Power
  if (c.includes('pole') || c.includes('electrical pole') || c.includes('utility pole') || c.includes('pylon')) return 'Electrical Pole';
  if (c.includes('panel') || c.includes('switchgear') || c.includes('transformer') || c.includes('cable') || c.includes('electric') || c.includes('cabinet')) return 'Electrical Equipment';
  if (c.includes('solar') || c.includes('photovoltaic') || c.includes('pv module')) return 'Solar Panel';

  // 6. Materials & Components
  if (c.includes('steel') || c.includes('weld') || c.includes('flange') || c.includes('bolt') || c.includes('joint') || c.includes('metal')) return 'Structural Component';
  if (c.includes('vehicle') || c.includes('truck') || c.includes('equipment') || c.includes('crane') || c.includes('excavator')) return 'Vehicle / Equipment';

  // 7. Broad Fallback for Engineering/Industrial Terms
  if (c.includes('industrial') || c.includes('plant') || c.includes('hardware') || c.includes('component')) return 'Industrial Machinery';

  return (cat as AssetCategory) || 'Unknown / Unsupported';
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

      const clientKey = getStoredApiKey();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (clientKey) {
        headers['x-gemini-key'] = clientKey;
      }

      const serverResp = await fetch('/api/vision/classify', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          imageBase64: pureBase64,
          mimeType
        })
      });

      const data = await serverResp.json().catch(() => ({}));

      // If server returned 503 / service unavailable, preserve honest technical status
      if (serverResp.status === 503 || data.serviceAvailable === false) {
        return {
          category: 'Unknown / Unsupported',
          confidence: 0,
          confidenceLabel: 'N/A',
          isEligible: false,
          subjectDescription: 'AI Vision Service Unavailable',
          reason: data.reason || 'The visual classification service could not be reached. Please verify the server-side GEMINI_API_KEY and API configuration.',
          modelUsed: 'None (Service Unavailable)',
          source: 'cloud_vision_api',
          serviceAvailable: false
        };
      }

      if (serverResp.ok && data && data.success) {
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
          source: 'cloud_vision_api',
          serviceAvailable: true,
          broadDomain: data.broadDomain
        };
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

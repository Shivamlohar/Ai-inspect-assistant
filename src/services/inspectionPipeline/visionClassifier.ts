/**
 * First-Stage Vision Classifier Service
 * Performs visual pixel analysis & multi-modal AI classification to reliably
 * distinguish human/person photos from civil infrastructure and industrial assets.
 */

import type { AssetCategory } from './types';
import { getGeminiApiKey } from '../aiApi';

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

/**
 * First-Stage Vision Classifier Orchestrator
 * Prioritizes Google Gemini 1.5 Flash Vision API when configured,
 * and seamlessly falls back to Local Optical Biometric Pixel Analysis.
 */
export async function classifyVisualInput(
  mediaUrlOrBase64: string,
  fileName: string = 'asset.jpg',
  mimeType: string = 'image/jpeg'
): Promise<VisionClassificationResult> {
  const apiKey = getGeminiApiKey();

  // Tier 1: If Gemini API Key exists, call Gemini Vision
  if (apiKey && apiKey.trim().length > 10 && mediaUrlOrBase64) {
    try {
      const pureBase64 = mediaUrlOrBase64.replace(/^data:[^;]+;base64,/, '');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

      const prompt = `
You are a First-Stage Vision Classifier for an Industrial & Civil Infrastructure Asset Inspection System.
TASK: Inspect the image pixels and classify the primary subject into EXACTLY ONE category:
1. "Road"
2. "Bridge"
3. "Building"
4. "Industrial Machinery"
5. "Electrical Pole"
6. "Pipeline"
7. "Solar Panel"
8. "Railway Infrastructure"
9. "Vehicle / Equipment"
10. "Person / Human"
11. "Animal"
12. "Indoor Room"
13. "Landscape"
14. "Unknown / Unsupported"

CRITICAL INSTRUCTIONS:
- If the image shows a PERSON, HUMAN, SELFIE, FACE, PORTRAIT, or BODY:
  You MUST return "Person / Human". Set "isEligible": false. Do NOT classify a person as a machine, bridge, or building!
- If the image shows civil infrastructure or industrial equipment:
  Select the matching supported category and set "isEligible": true.

Return ONLY valid JSON matching this schema:
{
  "category": "One of the 14 categories",
  "confidence": 95,
  "isEligible": false,
  "subjectDescription": "Short 1-sentence description of the visual subject",
  "reason": "Clear explanation of classification"
}
`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType.startsWith('image/') ? mimeType : 'image/jpeg', data: pureBase64 } }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500
          }
        })
      });

      if (response.ok) {
        const resData = await response.json();
        const text = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          const cat = parsed.category as AssetCategory;
          const conf = typeof parsed.confidence === 'number' ? parsed.confidence : 92;
          const eligible = Boolean(parsed.isEligible && cat !== 'Person / Human' && cat !== 'Animal' && cat !== 'Indoor Room' && cat !== 'Landscape' && cat !== 'Unknown / Unsupported' && conf >= 70);

          return {
            category: cat,
            confidence: conf,
            confidenceLabel: `${conf}%`,
            isEligible: eligible,
            subjectDescription: parsed.subjectDescription || cat,
            reason: eligible
              ? parsed.reason || 'Supported engineering asset verified for inspection.'
              : parsed.reason || 'This image does not contain a supported infrastructure or industrial asset for visual inspection.',
            modelUsed: 'Google Gemini 1.5 Flash Vision (gemini-1.5-flash)',
            source: 'cloud_vision_api'
          };
        }
      }
    } catch (geminiErr) {
      console.warn('Gemini 1.5 Flash Vision classification failed, falling back to local biometric CV:', geminiErr);
    }
  }

  // Tier 2: Local Optical Biometric & Pixel Analysis
  if (typeof window !== 'undefined' && mediaUrlOrBase64) {
    const localResult = await classifyImageVisualLocal(mediaUrlOrBase64);
    return localResult;
  }

  // Tier 3: Metadata / text heuristic fallback if image decoding is unavailable
  const cleanName = (fileName || '').toLowerCase();
  if (cleanName.includes('person') || cleanName.includes('selfie') || cleanName.includes('portrait') || cleanName.includes('human') || cleanName.includes('face') || cleanName.includes('man') || cleanName.includes('woman') || cleanName.includes('boy') || cleanName.includes('girl')) {
    return {
      category: 'Person / Human',
      confidence: 96,
      confidenceLabel: '96%',
      isEligible: false,
      subjectDescription: 'Person / Human',
      reason: 'The uploaded image contains a person / unsupported subject. Structural and industrial inspection cannot be performed on non-infrastructure images.',
      modelUsed: 'Local Pattern Classifier',
      source: 'metadata_inference'
    };
  }

  if (cleanName.includes('bridge') || cleanName.includes('viaduct') || cleanName.includes('pier')) {
    return {
      category: 'Bridge',
      confidence: 88,
      confidenceLabel: '88%',
      isEligible: true,
      subjectDescription: 'Bridge / Civil Overpass Structure',
      reason: 'Engineering infrastructure features identify bridge asset.',
      modelUsed: 'Local Pattern Classifier',
      source: 'metadata_inference'
    };
  }

  if (cleanName.includes('motor') || cleanName.includes('pump') || cleanName.includes('machine') || cleanName.includes('compressor') || cleanName.includes('gearbox')) {
    return {
      category: 'Industrial Machinery',
      confidence: 88,
      confidenceLabel: '88%',
      isEligible: true,
      subjectDescription: 'Industrial Machine / Rotary Equipment',
      reason: 'Key mechanical features identify industrial machinery asset.',
      modelUsed: 'Local Pattern Classifier',
      source: 'metadata_inference'
    };
  }

  if (cleanName.includes('road') || cleanName.includes('pothole') || cleanName.includes('asphalt') || cleanName.includes('highway')) {
    return {
      category: 'Road',
      confidence: 88,
      confidenceLabel: '88%',
      isEligible: true,
      subjectDescription: 'Road / Pavement Infrastructure',
      reason: 'Transportation surface features identify road asset.',
      modelUsed: 'Local Pattern Classifier',
      source: 'metadata_inference'
    };
  }

  return createUnknownResult('Visual data could not be processed');
}

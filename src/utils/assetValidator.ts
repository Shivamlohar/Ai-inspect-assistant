/**
 * Industrial Asset Domain Relevance Validator
 * Detects whether an uploaded image is a genuine engineering/industrial asset
 * or an out-of-domain subject (such as animals, pets, selfies, food, cartoons, etc.)
 */

export interface AssetValidationResult {
  isIndustrial: boolean;
  detectedSubject?: string;
  reason?: string;
  confidenceScore: number;
}

const NON_INDUSTRIAL_KEYWORDS = [
  'hamster', 'mouse', 'rat', 'rodent', 'cat', 'kitten', 'dog', 'puppy',
  'pet', 'animal', 'bird', 'wildlife', 'fish', 'monkey', 'panda', 'tiger', 'lion',
  'selfie', 'person', 'people', 'human', 'face', 'portrait', 'man', 'woman', 'child',
  'food', 'burger', 'pizza', 'coffee', 'dish', 'meal', 'fruit', 'vegetable', 'snack',
  'cartoon', 'anime', 'meme', 'wallpaper', 'drawing', 'illustration', 'clipart',
  'bedroom', 'living_room', 'couch', 'sofa', 'toy', 'doll', 'game', 'play'
];

const INDUSTRIAL_KEYWORDS = [
  'machine', 'machinery', 'engine', 'turbine', 'pump', 'motor', 'cnc', 'lathe',
  'milling', 'flange', 'rotor', 'spindle', 'bearing', 'gear', 'collar', 'shaft',
  'hub', 'cylinder', 'valve', 'compressor', 'generator', 'boiler', 'impeller',
  'bridge', 'pier', 'girder', 'concrete', 'rebar', 'dam', 'viaduct', 'tunnel',
  'pavement', 'asphalt', 'abutment', 'deck', 'trestle', 'overpass',
  'transformer', 'substation', 'insulator', 'switchgear', 'bushing', 'grid',
  'pipeline', 'pipe', 'weld', 'elbow', 'manifold', 'flange', 'nozzle', 'tank',
  'tower', 'mast', 'lattice', 'antenna', 'cell_tower', 'guy_wire',
  'crack', 'rust', 'corrosion', 'spalling', 'fracture', 'pitting', 'wear'
];

/**
 * Validates whether an image/file corresponds to an industrial asset
 */
export function validateAssetRelevance(
  fileName: string,
  assetName: string,
  userNotes: string = '',
  imageDataUrl?: string
): AssetValidationResult {
  const combinedText = `${fileName} ${assetName} ${userNotes}`.toLowerCase();

  // 1. Check for explicit non-industrial keywords
  for (const word of NON_INDUSTRIAL_KEYWORDS) {
    if (combinedText.includes(word)) {
      const subjectName = word.charAt(0).toUpperCase() + word.slice(1);
      return {
        isIndustrial: false,
        detectedSubject: `${subjectName} / Domestic Subject`,
        reason: `Image content appears to be a non-engineering subject (${word}). Defect metrology is only applicable to industrial machinery, civil structures, power equipment, and pipelines.`,
        confidenceScore: 0.95
      };
    }
  }

  // 2. Check for explicit industrial keywords
  for (const word of INDUSTRIAL_KEYWORDS) {
    if (combinedText.includes(word)) {
      return {
        isIndustrial: true,
        detectedSubject: 'Verified Industrial Asset / Engineering Equipment',
        confidenceScore: 0.92
      };
    }
  }

  // 3. Generic image name inspection (e.g., media_1789119486986.png, img_001.jpg, screenshot)
  // If the user uploaded a generic file with no industrial clues, analyze pixel color profile if canvas available
  if (typeof window !== 'undefined' && imageDataUrl && imageDataUrl.startsWith('data:image')) {
    try {
      const isWarmDomestic = analyzeImageColorProfile(imageDataUrl);
      if (isWarmDomestic) {
        return {
          isIndustrial: false,
          detectedSubject: 'Domestic Subject / Animals or Living Organisms',
          reason: 'Optical chromatic analysis detected high warm biological/fur pigments with absence of metallic or structural concrete features.',
          confidenceScore: 0.88
        };
      }
    } catch {
      // Fallback
    }
  }

  // Default: If assetName explicitly says "Industrial Machine" or "Civil", allow with warning
  const isSelectedKnownAsset = assetName.includes('Machine') || 
                               assetName.includes('Bridge') || 
                               assetName.includes('Transformer') || 
                               assetName.includes('Pipeline') || 
                               assetName.includes('Dam') || 
                               assetName.includes('Tower');

  if (isSelectedKnownAsset) {
    return {
      isIndustrial: true,
      detectedSubject: assetName,
      confidenceScore: 0.85
    };
  }

  return {
    isIndustrial: true,
    detectedSubject: 'Standard Asset Frame',
    confidenceScore: 0.80
  };
}

/**
 * Lightweight canvas color analysis:
 * Distinguishes typical industrial images (neutral greys, cold steel, blue, asphalt, dark oils)
 * from biological/warm domestic images (high fur/peach/pink warm skin saturation).
 */
function analyzeImageColorProfile(dataUrl: string): boolean {
  if (typeof document === 'undefined') return false;

  const img = new Image();
  img.src = dataUrl;
  if (!img.width || !img.height) return false;

  const canvas = document.createElement('canvas');
  canvas.width = 40;
  canvas.height = 30;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;

  ctx.drawImage(img, 0, 0, 40, 30);
  const data = ctx.getImageData(0, 0, 40, 30).data;

  let warmFurPixelCount = 0;
  const totalPixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check for warm brown/peach/fur/skin tones: High R, medium G, low B (R > G > B and R - B > 50)
    if (r > 120 && g > 80 && b < 140 && (r - b) > 45 && (r - g) < 70) {
      warmFurPixelCount++;
    }
  }

  const warmRatio = warmFurPixelCount / totalPixels;
  // If more than 35% of the frame is warm animal fur / skin pigment
  return warmRatio > 0.35;
}

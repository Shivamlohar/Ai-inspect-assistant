/**
 * Asset Classifier Service
 * Classifies an uploaded frame into one of the 14 standardized asset categories.
 */

import type { AssetCategory } from './types';

export interface AssetClassificationResult {
  category: AssetCategory;
  confidence: number; // 0 - 100
  confidenceLabel: string;
  source: 'ai_model' | 'visual_heuristic' | 'metadata_inference';
  reasoning: string;
}

import { classifyVisualInput, analyzeImagePixelsForBiometrics, type VisionClassificationResult } from './visionClassifier.ts';

export { classifyVisualInput, analyzeImagePixelsForBiometrics };

/**
 * Classifies an asset based on visual heuristics, text context, or model feedback.
 */
export function classifyAsset(
  _fileName: string,
  userSelectedAsset: string = '',
  _userNotes: string = '',
  modelClassification?: { category: string; confidence: number },
  visualClassification?: VisionClassificationResult
): AssetClassificationResult {
  // 1. If visual classification result is provided from the vision classifier, prioritize it!
  if (visualClassification && visualClassification.category && visualClassification.category !== 'Unknown / Unsupported') {
    const matchedCategory = normalizeCategoryName(visualClassification.category);
    const conf = Math.max(10, Math.min(100, Math.round(visualClassification.confidence)));
    return {
      category: matchedCategory,
      confidence: conf,
      confidenceLabel: `${conf}%`,
      source: visualClassification.source === 'cloud_vision_api' ? 'ai_model' : 'visual_heuristic',
      reasoning: visualClassification.reason || `Visual classifier determined subject as ${matchedCategory} (${conf}% confidence).`
    };
  }

  // 2. If real AI model classification exists, normalize it
  if (modelClassification && modelClassification.category) {
    const rawCat = modelClassification.category.trim();
    const matchedCategory = normalizeCategoryName(rawCat);
    const conf = Math.max(10, Math.min(100, Math.round(modelClassification.confidence)));
    return {
      category: matchedCategory,
      confidence: conf,
      confidenceLabel: `${conf}%`,
      source: 'ai_model',
      reasoning: `AI visual model classified the image as ${matchedCategory} with ${conf}% confidence.`
    };
  }

  // Filter out auto-detect strings and non-inspectable tags from userSelectedAsset
  const isAutoDetect = !userSelectedAsset || 
                       userSelectedAsset.toLowerCase().includes('auto-detect') ||
                       userSelectedAsset.toLowerCase().includes('unspecified');

  const cleanSelectedAsset = isAutoDetect ? '' : userSelectedAsset;

  // 3. If visual classification was explicitly unknown, honor uncertainty (Rule 9)
  if (visualClassification && visualClassification.category === 'Unknown / Unsupported') {
    return {
      category: 'Unknown / Unsupported',
      confidence: 40,
      confidenceLabel: '40%',
      source: 'visual_heuristic',
      reasoning: visualClassification.reason || 'Visual characteristics unverified. Inspection blocked by zero-fabrication policy.'
    };
  }

  // 4. If user explicitly specified a verified engineering asset in metadata (post-classification confirmation only)
  if (cleanSelectedAsset && cleanSelectedAsset.trim().length > 3) {
    const clean = cleanSelectedAsset.toLowerCase();
    if (clean.includes('motor') || clean.includes('pump') || clean.includes('compressor') || clean.includes('gearbox')) {
      return {
        category: 'Industrial Machinery',
        confidence: 75,
        confidenceLabel: '75%',
        source: 'metadata_inference',
        reasoning: `User-specified asset registry metadata (${cleanSelectedAsset}).`
      };
    }
    if (clean.includes('bridge') || clean.includes('viaduct') || clean.includes('pier')) {
      return {
        category: 'Bridge',
        confidence: 75,
        confidenceLabel: '75%',
        source: 'metadata_inference',
        reasoning: `User-specified asset registry metadata (${cleanSelectedAsset}).`
      };
    }
    if (clean.includes('pillar') || clean.includes('beam') || clean.includes('joint') || clean.includes('concrete')) {
      return {
        category: 'Building',
        confidence: 75,
        confidenceLabel: '75%',
        source: 'metadata_inference',
        reasoning: `User-specified structural metadata (${cleanSelectedAsset}).`
      };
    }
    if (clean.includes('tank') || clean.includes('pipe') || clean.includes('vessel')) {
      return {
        category: 'Pipeline',
        confidence: 75,
        confidenceLabel: '75%',
        source: 'metadata_inference',
        reasoning: `User-specified piping metadata (${cleanSelectedAsset}).`
      };
    }
  }

  // 5. Unknown / Low Confidence Fallback (Rule 1 & Rule 9: Never guess engineering asset from filename)
  return {
    category: 'Unknown / Unsupported',
    confidence: 40,
    confidenceLabel: '40%',
    source: 'metadata_inference',
    reasoning: 'Visual content cannot be confirmed as a supported engineering asset. Inspection suppressed.'
  };
}

function normalizeCategoryName(raw: string): AssetCategory {
  const lower = raw.toLowerCase();
  if (lower.includes('road') || lower.includes('pothole')) return 'Road';
  if (lower.includes('bridge') || lower.includes('viaduct')) return 'Bridge';
  if (lower.includes('building') || lower.includes('concrete') || lower.includes('beam') || lower.includes('ceiling') || lower.includes('wall')) return 'Building';
  if (lower.includes('machine') || lower.includes('machinery') || lower.includes('motor') || lower.includes('pump') || lower.includes('compressor')) return 'Industrial Machinery';
  if (lower.includes('pole') || lower.includes('transformer') || lower.includes('power line')) return 'Electrical Pole';
  if (lower.includes('pipe') || lower.includes('pipeline') || lower.includes('tank')) return 'Pipeline';
  if (lower.includes('solar')) return 'Solar Panel';
  if (lower.includes('rail') || lower.includes('train')) return 'Railway Infrastructure';
  if (lower.includes('vehicle') || lower.includes('equipment') || lower.includes('truck')) return 'Vehicle / Equipment';
  if (lower.includes('person') || lower.includes('human') || lower.includes('face') || lower.includes('selfie')) return 'Person / Human';
  if (lower.includes('animal') || lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) return 'Animal';
  if (lower.includes('room') || lower.includes('bedroom') || lower.includes('interior')) return 'Indoor Room';
  if (lower.includes('landscape') || lower.includes('nature') || lower.includes('scenery')) return 'Landscape';
  return 'Unknown / Unsupported';
}

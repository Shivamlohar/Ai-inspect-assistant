/**
 * Historical Comparator Service
 * Compares current inspection strictly against real past audits from storage.
 * Never invents fake historical dates or delta metrics.
 */

import type { HistoricalComparisonResult } from './types';
import { getOfficerInspections, type SavedInspectionRecord } from '../../utils/officerStore';

export function compareWithHistoricalAudits(
  assetId: string,
  assetName: string,
  currentScore: number,
  currentDefectsCount: number,
  currentInspectionId?: string
): HistoricalComparisonResult {
  if (!assetId || !assetName) {
    return {
      hasHistoricalData: false,
      message: 'No historical inspection available: No asset identifier provided.'
    };
  }

  const allSaved = getOfficerInspections();
  
  // Filter for genuine past inspections matching this asset ID or name, excluding current one
  const cleanId = assetId.toLowerCase().trim();
  const cleanName = assetName.toLowerCase().trim();

  const pastRecords = allSaved.filter((record: SavedInspectionRecord) => {
    if (currentInspectionId && record.id === currentInspectionId) return false;
    const recName = (record.assetName || '').toLowerCase().trim();
    const recId = (record.id || '').toLowerCase().trim();
    return recId.includes(cleanId) || recName === cleanName;
  });

  // If no prior records exist in localStorage for this asset:
  if (pastRecords.length === 0) {
    return {
      hasHistoricalData: false,
      message: 'No historical inspection available. This is the initial baseline inspection for this asset.'
    };
  }

  // Sort by timestamp descending to get the most recent prior audit
  pastRecords.sort((a: SavedInspectionRecord, b: SavedInspectionRecord) => b.timestamp - a.timestamp);
  const mostRecentPrior = pastRecords[0];

  const deltaScore = currentScore - mostRecentPrior.healthScore;
  const deltaDefects = currentDefectsCount - mostRecentPrior.defectsCount;

  let trend: 'improving' | 'stable' | 'deteriorating' = 'stable';
  if (deltaScore > 3) trend = 'improving';
  else if (deltaScore < -3) trend = 'deteriorating';

  const sign = deltaScore > 0 ? `+${deltaScore}` : `${deltaScore}`;
  const trendDetails = `Compared to audit on ${mostRecentPrior.formattedDate} by ${mostRecentPrior.officerName}. Health score shifted by ${sign} points; defect delta: ${deltaDefects >= 0 ? `+${deltaDefects}` : deltaDefects}.`;

  return {
    hasHistoricalData: true,
    message: `Historical audit found (${mostRecentPrior.formattedDate}).`,
    previousAudit: {
      id: mostRecentPrior.id,
      date: mostRecentPrior.formattedDate,
      score: mostRecentPrior.healthScore,
      defectsCount: mostRecentPrior.defectsCount,
      inspectorName: mostRecentPrior.officerName
    },
    deltaScore,
    deltaDefects,
    conditionTrend: trend,
    trendDetails
  };
}

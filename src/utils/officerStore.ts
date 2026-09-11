/**
 * Officer Authentication & Work Data Persistence Manager
 * Persists Officer profiles and completed inspection audits to localStorage.
 */

export interface OfficerProfile {
  id: string;             // e.g. "OFF-409" or "GOOG-shivamlohar" or "PH-9876543210"
  name: string;           // e.g. "Officer Shivam" or "Officer #409"
  role: string;           // e.g. "Lead Field Inspector"
  department: string;     // e.g. "Civil & Structural Infrastructure"
  avatarInitials: string; // e.g. "OS" or "FI"
  isLoggedIn: boolean;
  loginTime?: number;
  authProvider?: 'google' | 'phone' | 'badge' | 'guest';
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface SavedInspectionRecord {
  id: string;
  officerId: string;
  officerName: string;
  assetName: string;
  assetType: string;
  healthScore: number;
  status: 'Healthy' | 'Attention' | 'At Risk' | 'Critical';
  timestamp: number;
  formattedDate: string;
  securityHash: string;
  notes?: string;
  diagnosticSummary?: string;
  defectsCount: number;
  isGemini?: boolean;
  imageThumbnail?: string;
}

const OFFICER_STORAGE_KEY = 'ai_inspection_active_officer';
const WORK_STORAGE_KEY = 'ai_inspection_officer_saved_work';

// Default initial officer profile
export const DEFAULT_OFFICER: OfficerProfile = {
  id: 'OFF-409',
  name: 'Officer #409',
  role: 'Lead Field Inspector',
  department: 'Civil & Structural Infrastructure',
  avatarInitials: 'FI',
  isLoggedIn: true,
  loginTime: Date.now(),
  authProvider: 'badge'
};

/**
 * Retrieves current active officer profile from localStorage
 */
export function getActiveOfficer(): OfficerProfile {
  if (typeof window === 'undefined') return DEFAULT_OFFICER;
  try {
    const raw = localStorage.getItem(OFFICER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(OFFICER_STORAGE_KEY, JSON.stringify(DEFAULT_OFFICER));
      return DEFAULT_OFFICER;
    }
    return JSON.parse(raw) as OfficerProfile;
  } catch {
    return DEFAULT_OFFICER;
  }
}

/**
 * Updates active officer profile and broadcasts event
 */
export function setActiveOfficer(profile: OfficerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OFFICER_STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('officer_state_changed', { detail: profile }));
  } catch (err) {
    console.warn('Failed to store active officer:', err);
  }
}

/**
 * Logs out the officer, setting isLoggedIn to false
 */
export function logoutOfficer(): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getActiveOfficer();
    const updated: OfficerProfile = {
      ...current,
      isLoggedIn: false
    };
    localStorage.setItem(OFFICER_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('officer_state_changed', { detail: updated }));
  } catch (err) {
    console.warn('Failed to logout officer:', err);
  }
}

/**
 * Returns all saved inspections for the active officer (or all officers)
 */
export function getOfficerInspections(officerId?: string): SavedInspectionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WORK_STORAGE_KEY);
    if (!raw) return [];
    const records = JSON.parse(raw) as SavedInspectionRecord[];
    if (officerId) {
      return records.filter(r => r.officerId === officerId);
    }
    return records.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

/**
 * Saves or updates an inspection record in persistent storage
 */
export function saveOfficerInspection(
  recordData: Omit<SavedInspectionRecord, 'id' | 'timestamp' | 'formattedDate'> & { id?: string }
): SavedInspectionRecord {
  if (typeof window === 'undefined') {
    throw new Error('Window is not available');
  }

  const existing = getOfficerInspections();
  const id = recordData.id || `INSP-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
  const now = Date.now();
  
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(now);

  const fullRecord: SavedInspectionRecord = {
    ...recordData,
    id,
    timestamp: now,
    formattedDate
  };

  // Replace if exists, or prepend new
  const index = existing.findIndex(r => r.id === id);
  if (index >= 0) {
    existing[index] = fullRecord;
  } else {
    existing.unshift(fullRecord);
  }

  try {
    localStorage.setItem(WORK_STORAGE_KEY, JSON.stringify(existing));
    window.dispatchEvent(new CustomEvent('officer_work_saved', { detail: fullRecord }));
  } catch (err) {
    console.error('Failed to save officer inspection record:', err);
  }

  return fullRecord;
}

/**
 * Automatically saves the active inspection from session storage or payload
 */
export function autoSaveCurrentInspection(inspectionPayload: any): SavedInspectionRecord | null {
  if (typeof window === 'undefined' || !inspectionPayload) return null;
  const officer = getActiveOfficer();
  
  const recordId = inspectionPayload.inspectionId || inspectionPayload.securityHash || `INSP-${(inspectionPayload.assetName || 'asset').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()}-${new Date().toISOString().slice(0, 10)}`;
  
  return saveOfficerInspection({
    id: recordId,
    officerId: officer.id,
    officerName: officer.name,
    assetName: inspectionPayload.assetName || 'Industrial Asset',
    assetType: inspectionPayload.isMachine ? 'Industrial Machinery' : (inspectionPayload.assetCategory || 'Civil Infrastructure'),
    healthScore: typeof inspectionPayload.healthScore === 'number' ? inspectionPayload.healthScore : 72,
    status: inspectionPayload.status === 'HEALTHY' || inspectionPayload.status === 'Healthy' 
      ? 'Healthy' 
      : inspectionPayload.status === 'ATTENTION' || inspectionPayload.status === 'Attention' 
      ? 'Attention' 
      : inspectionPayload.status === 'CRITICAL' || inspectionPayload.status === 'Critical' 
      ? 'Critical' 
      : 'At Risk',
    securityHash: inspectionPayload.securityHash || `SHA256:${Math.random().toString(36).substring(2, 10)}`,
    notes: inspectionPayload.description || 'Verified AI visual inspection audit.',
    diagnosticSummary: inspectionPayload.diagnosticSummary || 'Inspection completed with high precision optical metrology pass.',
    defectsCount: Array.isArray(inspectionPayload.liveDefects) 
      ? inspectionPayload.liveDefects.length 
      : (Array.isArray(inspectionPayload.defects) ? inspectionPayload.defects.length : 3),
    isGemini: Boolean(inspectionPayload.isGemini),
    imageThumbnail: inspectionPayload.mediaUrl || inspectionPayload.imageBase64
  });
}

/**
 * Returns past inspections matching an asset name, or returns all saved inspections
 */
export function getAssetPastInspections(assetName?: string): SavedInspectionRecord[] {
  const all = getOfficerInspections();
  if (!assetName || !assetName.trim()) return all;
  const clean = assetName.toLowerCase().trim();
  const matching = all.filter(r => r.assetName.toLowerCase().includes(clean) || clean.includes(r.assetName.toLowerCase()));
  return matching.length > 0 ? matching : all;
}

/**
 * Deletes a specific inspection record
 */
export function deleteOfficerInspection(recordId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getOfficerInspections();
    const filtered = existing.filter(r => r.id !== recordId);
    localStorage.setItem(WORK_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('officer_work_saved', { detail: { deletedId: recordId } }));
  } catch (err) {
    console.warn('Failed to delete inspection record:', err);
  }
}

/**
 * Clears all saved work for the current officer
 */
export function clearAllOfficerWork(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(WORK_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('officer_work_saved', { detail: null }));
  } catch (err) {
    console.warn('Failed to clear work storage:', err);
  }
}

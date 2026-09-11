/**
 * Officer Authentication & Work Data Persistence Manager
 * Persists Officer profiles and completed inspection audits to localStorage.
 */

export interface OfficerProfile {
  id: string;             // e.g. "OFF-409"
  name: string;           // e.g. "Officer Shivam" or "Officer #409"
  role: string;           // e.g. "Lead Field Inspector"
  department: string;     // e.g. "Civil & Structural Infrastructure"
  avatarInitials: string; // e.g. "OS" or "FI"
  isLoggedIn: boolean;
  loginTime?: number;
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
  loginTime: Date.now()
};

/**
 * Retrieves current active officer profile from localStorage
 */
export function getActiveOfficer(): OfficerProfile {
  if (typeof window === 'undefined') return DEFAULT_OFFICER;
  try {
    const raw = localStorage.getItem(OFFICER_STORAGE_KEY);
    if (!raw) {
      // Store default officer if none exists
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

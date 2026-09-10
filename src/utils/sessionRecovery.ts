/**
 * Session Recovery & State Persistence Manager
 * Solves accidental page refresh (F5) or browser closure by persisting
 * ongoing inspection drafts to localStorage in real-time.
 */

const STORAGE_KEY = 'ai_inspection_active_session_draft';

export interface InspectionDraft {
  selectedAsset: string;
  description: string;
  mediaFile: {
    url: string;
    type: 'image' | 'video';
    name: string;
    size: string;
    securityHash?: string;
    base64?: string;
    mimeType?: string;
  } | null;
  savedAt: number;
}

export function saveSessionDraft(draft: Omit<InspectionDraft, 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: InspectionDraft = {
      ...draft,
      savedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to persist session draft:', err);
  }
}

export function loadSessionDraft(): InspectionDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InspectionDraft;
    // Expire drafts older than 24 hours
    if (Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) {
      clearSessionDraft();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSessionDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasSessionDraft(): boolean {
  return Boolean(loadSessionDraft());
}

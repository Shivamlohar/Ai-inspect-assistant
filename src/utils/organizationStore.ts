/**
 * Organization State & Multi-tenant Store
 * Manages active organization, team members, and synchronizes with the backend.
 */

import { type PlanTier } from './planConfig';

export interface OrgMember {
  id: string;
  organization_id: string;
  user_id: string;
  name: string;
  email: string | null;
  role: 'Owner' | 'Admin' | 'Lead Inspector' | 'Field Engineer' | 'Inspector';
  status: 'ACTIVE' | 'INVITED' | 'INACTIVE';
  joined_at: string;
}

export interface OrganizationInfo {
  id: string;
  name: string;
  plan_tier: PlanTier;
  industry: string;
  pilot_started_at: string;
  created_at: string;
}

export interface OrgUsageMetrics {
  totalInspections: number;
  completedInspections: number;
  reportsGenerated: number;
  aiAnalyses: number;
  evidenceUploads: number;
  activeMembers: number;
  recentActivity: Array<{
    event_type: string;
    performed_by: string;
    resource_id?: string;
    created_at: string;
    metadata?: any;
  }>;
  inspectionTimeline?: Array<{ day: string; count: number }>;
  severityBreakdown?: Array<{ severity: string; count: number }>;
}

const ORG_STORAGE_KEY = 'inspectra_active_organization';

export const DEFAULT_ORG: OrganizationInfo = {
  id: 'org-inspectra-default',
  name: 'Inspectra Engineering Solutions',
  plan_tier: 'FREE_PILOT',
  industry: 'Infrastructure & Heavy Machinery',
  pilot_started_at: '2026-09-01T00:00:00.000Z',
  created_at: '2026-09-01T00:00:00.000Z'
};

/**
 * Returns currently selected active organization from localStorage
 */
export function getActiveOrganization(): OrganizationInfo {
  if (typeof window === 'undefined') return DEFAULT_ORG;
  try {
    const raw = localStorage.getItem(ORG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(DEFAULT_ORG));
      return DEFAULT_ORG;
    }
    return JSON.parse(raw) as OrganizationInfo;
  } catch {
    return DEFAULT_ORG;
  }
}

/**
 * Sets active organization and broadcasts event
 */
export function setActiveOrganization(org: OrganizationInfo): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(org));
    window.dispatchEvent(new CustomEvent('organization_state_changed', { detail: org }));
  } catch (err) {
    console.warn('Failed to store active organization:', err);
  }
}

/**
 * Checks if current organization is running on the Free Pilot plan
 */
export function isFreePilot(): boolean {
  const org = getActiveOrganization();
  return org.plan_tier === 'FREE_PILOT';
}

/**
 * Helper text for Free Pilot banner and tooltips
 */
export const FREE_PILOT_NOTICE = 'Your organization is currently using Inspectra under the Free Pilot program.';

/**
 * Fetches organization details, member list, and real usage metrics from the backend API
 */
export async function fetchCurrentOrganizationData(orgId?: string): Promise<{
  organization: OrganizationInfo;
  members: OrgMember[];
  usage: OrgUsageMetrics;
  pilotStatus: {
    isFreePilot: boolean;
    planTier: PlanTier;
    badge: string;
    notice: string;
  };
} | null> {
  const targetId = orgId || getActiveOrganization().id;
  try {
    const res = await fetch(`/api/organization/current?orgId=${encodeURIComponent(targetId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && data.organization) {
      setActiveOrganization(data.organization);
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch organization data from server, using local fallback:', err);
    return null;
  }
}

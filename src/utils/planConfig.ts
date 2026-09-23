/**
 * Inspectra Centralized Plan Configuration & Feature Flag Manager
 * Defines plan structures, feature matrices, and capabilities.
 * Free Pilot model during prototype/evaluation phase with future-ready tier scaffolding.
 */

export type PlanTier = 'FREE_PILOT' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  includedIn: PlanTier[];
}

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  tagline: string;
  description: string;
  priceDisplay: string;
  billingPeriod: string;
  ctaText: string;
  ctaAction: 'start_pilot' | 'request_demo' | 'contact_sales';
  badge?: string;
  badgeColor?: string;
  isPopular?: boolean;
  limits: {
    inspectionsPerMonth: number | 'Unlimited';
    teamMembers: number | 'Unlimited';
    storageGb: number | 'Unlimited';
    reportExportPages: string;
    retentionDays: number | 'Unlimited';
  };
  features: string[];
  highlightFeatures: string[];
}

export const PLANS_CONFIG: Record<PlanTier, PlanDefinition> = {
  FREE_PILOT: {
    id: 'FREE_PILOT',
    name: 'Free Pilot',
    tagline: 'Full-featured prototype evaluation for industrial engineering teams',
    description: 'Completely free during the active prototype phase. Evaluate computer vision defect metrology and defensible reporting with zero billing commitments.',
    priceDisplay: 'Free Pilot',
    billingPeriod: 'No credit card required',
    ctaText: 'Start Free Pilot',
    ctaAction: 'start_pilot',
    badge: 'ACTIVE PILOT',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    isPopular: true,
    limits: {
      inspectionsPerMonth: 100,
      teamMembers: 10,
      storageGb: 25,
      reportExportPages: '2 to 3 Pages Standard',
      retentionDays: 180
    },
    features: [
      'Voice & video evidence capture with real-time speech recognition',
      'AI visual defect detection with sub-millimeter metrology bounding boxes',
      'Precision optical CV engine (zero external cloud dependencies required)',
      'Statutory 2-to-3 page engineering reports with PE certification seal',
      'Transparent 4-factor condition scoring formula ($S = 100 - \\sum w_i d_i$)',
      'Organization work vault & multi-member team collaboration',
      'Non-destructive testing (NDT) secondary validation protocols',
      'Authoritative knowledge base with ISO 17359 / ASME / ACI engineering codes'
    ],
    highlightFeatures: [
      'Zero commercial charges during pilot',
      'Real-time optical defect analysis',
      'Statutory 2 to 3 page engineering reports'
    ]
  },
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    tagline: 'Designed for small inspection teams starting out',
    description: 'Ideal for independent inspectors and specialized safety teams needing fast optical defect identification and digital reports.',
    priceDisplay: 'Free Pilot',
    billingPeriod: 'Free during pilot program',
    ctaText: 'Start Free Pilot',
    ctaAction: 'start_pilot',
    badge: 'STARTER TIER',
    badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    limits: {
      inspectionsPerMonth: 50,
      teamMembers: 5,
      storageGb: 10,
      reportExportPages: '2 Pages',
      retentionDays: 90
    },
    features: [
      'Single-site asset registry & inspection logging',
      'Optical surface fracture and wear metrology',
      'Standard 2-page statutory audit report generator',
      'Up to 5 field inspector team logins',
      'Standard email & portal support'
    ],
    highlightFeatures: [
      'Single-site asset registry',
      'Standard 2-page audit generator',
      'Up to 5 team inspectors'
    ]
  },
  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: 'Professional',
    tagline: 'Tailored for growing, multi-site organizations',
    description: 'Comprehensive inspection management for infrastructure authorities, industrial plants, and construction contractors.',
    priceDisplay: 'Pilot / Custom',
    billingPeriod: 'Custom pilot discussion',
    ctaText: 'Request Demo',
    ctaAction: 'request_demo',
    badge: 'MULTI-SITE',
    badgeColor: 'bg-primary/10 text-primary border-primary/30',
    isPopular: true,
    limits: {
      inspectionsPerMonth: 500,
      teamMembers: 25,
      storageGb: 100,
      reportExportPages: '2 to 3 Pages Dynamic',
      retentionDays: 365
    },
    features: [
      'Multi-site asset hierarchies & cross-facility fleet analytics',
      'Phased Array Ultrasonic (PAUT) & Eddy Current (ECA) secondary matrices',
      'Dynamic 2-to-3 page engineering dossiers with custom logo branding',
      'Defensible 4-factor scoring with historical degradation tracking',
      'Automated ISO / IRC statutory compliance checks',
      'Priority engineering support & custom calibration targets'
    ],
    highlightFeatures: [
      'Multi-site asset hierarchies',
      'Comprehensive 3-page technical dossiers',
      'Advanced NDT secondary matrices'
    ]
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    tagline: 'Custom solutions for large-scale operations & infrastructure networks',
    description: 'High-assurance corporate deployments with custom AI model training, air-gapped security, and direct ERP/CMMS integration.',
    priceDisplay: 'Custom',
    billingPeriod: 'Tailored enterprise contract',
    ctaText: 'Contact Sales',
    ctaAction: 'contact_sales',
    badge: 'ENTERPRISE',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    limits: {
      inspectionsPerMonth: 'Unlimited',
      teamMembers: 'Unlimited',
      storageGb: 'Unlimited',
      reportExportPages: 'Unlimited / Custom Dossiers',
      retentionDays: 'Unlimited'
    },
    features: [
      'Unlimited inspections & video streaming telemetry',
      'Dedicated on-premise or private cloud (VPC) air-gapped deployment',
      'Custom fine-tuned vision models for specialized proprietary machinery',
      'Enterprise REST & WebSocket API access with dedicated service keys',
      'Integration with SAP PM, IBM Maximo, and Oracle Primavera CMMS',
      'Custom SLA, 24/7 dedicated support & assigned Solutions Engineer'
    ],
    highlightFeatures: [
      'Air-gapped on-premise deployment',
      'Enterprise API integration (Coming Soon)',
      'Dedicated Solutions Engineer & custom SLA'
    ]
  }
};

/**
 * Centralized Feature Flag Checker
 * Checks whether the specified plan tier includes a given capability.
 */
export function hasFeature(currentTier: PlanTier = 'FREE_PILOT', featureKey: string): boolean {
  // During the Free Pilot phase, all current in-product features are fully enabled!
  const activeFeatures = [
    'voice_video_evidence',
    'optical_metrology',
    'ai_analysis',
    'statutory_reports',
    '2_to_3_page_reports',
    'team_collaboration',
    'usage_tracking',
    'knowledge_base',
    'historical_comparison',
    'lead_generation',
    'real_time_diagnostics'
  ];

  if (activeFeatures.includes(featureKey)) {
    return true;
  }

  // Future features reserved for enterprise
  if (featureKey === 'enterprise_api_keys' || featureKey === 'custom_sap_integration') {
    return currentTier === 'ENTERPRISE';
  }

  return false;
}

export function getPlanDetails(tier: PlanTier = 'FREE_PILOT'): PlanDefinition {
  return PLANS_CONFIG[tier] || PLANS_CONFIG.FREE_PILOT;
}

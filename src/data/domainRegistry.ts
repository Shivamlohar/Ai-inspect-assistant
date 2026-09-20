/**
 * Multi-Domain Visual Inspection Architecture Registry
 * Defines the 8 supported engineering domains, equipment categories,
 * 7-step inspection workflow, domain-aware standards resolution, and validation rules.
 *
 * 8 Major Domains:
 * A. Industrial Machinery
 * B. Civil / Structural Infrastructure
 * C. Transport Infrastructure
 * D. Electrical Infrastructure
 * E. Water / Drainage Infrastructure
 * F. Energy Infrastructure
 * G. Telecom / Utility Infrastructure
 * H. Other Recognizable Infrastructure
 */

export interface InspectionDomainConfig {
  id: string;
  name: string;
  shortName: string;
  color: {
    primary: string;
    bg: string;
    border: string;
    badge: string;
    text: string;
    darkText: string;
  };
  iconName: string;
  description: string;
  equipment: string[];
  sampleDefects: string[];
  exampleAsset: {
    title: string;
    defect: string;
    tag: string;
  };
  standards: string[];
}

export const SUPPORTED_DOMAINS: InspectionDomainConfig[] = [
  {
    id: 'industrial-machinery',
    name: 'Industrial Machinery',
    shortName: 'Machinery',
    color: {
      primary: '#0284c7',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/40',
      badge: 'bg-sky-500 text-white',
      text: 'text-sky-600 dark:text-sky-400',
      darkText: 'text-sky-300'
    },
    iconName: 'Factory',
    description: 'Rotary, reciprocating, and heavy industrial plant machinery',
    equipment: [
      'Electric Motors',
      'Centrifugal & Positive Displacement Pumps',
      'Air & Gas Compressors',
      'Generators & Alternators',
      'Gearboxes & Speed Reducers',
      'Industrial Fans & Blowers',
      'Steam & Gas Turbines',
      'Machine Tools (Lathes, Mills, CNC)',
      'Drive Shafts, Belts & Couplings',
      'Heavy Production Machinery'
    ],
    sampleDefects: [
      'Surface oxidation & protective coat blister',
      'Oil seal weepage & fluid leakage',
      'Mechanical fretting & interface wear',
      'Cooling fin blockage & debris accumulation',
      'Loose mounting fasteners & bolt fatigue'
    ],
    exampleAsset: {
      title: 'Electric Motor M-401',
      defect: 'Flange Oxidation & Seal Weepage',
      tag: 'Rotary Mechanical'
    },
    standards: ['ISO 17359', 'ISO 10816', 'ASME B73.1', 'API 610']
  },
  {
    id: 'civil-structural',
    name: 'Civil / Structural Infrastructure',
    shortName: 'Civil / Structural',
    color: {
      primary: '#059669',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/40',
      badge: 'bg-emerald-600 text-white',
      text: 'text-emerald-600 dark:text-emerald-400',
      darkText: 'text-emerald-300'
    },
    iconName: 'Building2',
    description: 'Load-bearing concrete, masonry, and civil structural components',
    equipment: [
      'Commercial & Industrial Buildings',
      'Concrete Columns, Pillars & Piers',
      'Structural Beams & Girders',
      'Reinforced Slabs & Decks',
      'Load-Bearing Shear Walls',
      'Foundations, Footings & Piles',
      'Retaining Walls & Earth Embankments',
      'Tunnels, Culverts & Abutments',
      'Concrete Dams & Spillways',
      'Brick & Stone Masonry Structures'
    ],
    sampleDefects: [
      'Structural flexural & shear cracks',
      'Concrete spalling & exposed steel rebar',
      'Efflorescence & moisture ingress leaching',
      'Expansion joint sealant failure',
      'Surface honeycombing & delamination'
    ],
    exampleAsset: {
      title: 'Structural Column CP-021',
      defect: 'Concrete Micro-Crack & Spalling',
      tag: 'Reinforced Concrete'
    },
    standards: ['IS 456', 'ACI 318', 'CPWD Maintenance Manual', 'BS 8110']
  },
  {
    id: 'transport-infrastructure',
    name: 'Transport Infrastructure',
    shortName: 'Transport',
    color: {
      primary: '#c2410c',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/40',
      badge: 'bg-orange-600 text-white',
      text: 'text-orange-600 dark:text-orange-400',
      darkText: 'text-orange-300'
    },
    iconName: 'Truck',
    description: 'Bridges, roads, highways, flyovers, tunnels, pavements, and railways',
    equipment: [
      'Highway Bridges & Overpasses',
      'Flyovers, Viaducts & Elevated Corridors',
      'Asphalt & Concrete Roadways',
      'Highway Pavements & Expressways',
      'Railway Tracks, Sleepers & Ballast',
      'Road Tunnels & Underpasses',
      'Culverts & Drainage Channels',
      'Airport Runways & Taxiways',
      'Traffic Barriers & Guardrails',
      'Pedestrian Walkways & Overbridges'
    ],
    sampleDefects: [
      'Roadway potholes & asphalt cavity depressions',
      'Alligator fatigue cracking on bituminous surface',
      'Bridge pier deck joint spalling & fissure',
      'Expansion joint dislocation & gap erosion',
      'Rail track wear, ballast voiding & shoulder settlement'
    ],
    exampleAsset: {
      title: 'National Highway Pavement Section #NH-48',
      defect: 'Asphalt Pothole & Alligator Cracking',
      tag: 'Flexible Pavement'
    },
    standards: ['IRC:82', 'IRC:SP:40', 'ASTM D6433', 'AASHTO Bridge Design']
  },
  {
    id: 'electrical-infrastructure',
    name: 'Electrical Infrastructure',
    shortName: 'Electrical',
    color: {
      primary: '#d97706',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/40',
      badge: 'bg-amber-600 text-white',
      text: 'text-amber-600 dark:text-amber-400',
      darkText: 'text-amber-300'
    },
    iconName: 'Zap',
    description: 'Power transmission, distribution, switchgear, and substations',
    equipment: [
      'Power & Distribution Transformers',
      'Medium & Low-Voltage Switchgear',
      'Motor Control Centers (MCC) & Panels',
      'Transmission Towers & Pylons',
      'Ceramic & Polymer Insulators',
      'High-Voltage Busbars & Terminal Lugs',
      'Substations & Switchyards',
      'Industrial Cabling, Conduits & Wire Trays',
      'Capacitor Banks & Surge Arresters',
      'Distribution Boards & Circuit Breakers'
    ],
    sampleDefects: [
      'Terminal lug thermal discoloration & scorching',
      'Insulator flashover tracking & hairline fracture',
      'Corroded conductor terminations & oxidation',
      'Transformer cooling fin oil seep / leakage',
      'Cable insulation sheath degradation & ozone cracking'
    ],
    exampleAsset: {
      title: 'Distribution Transformer TR-009',
      defect: 'Lug Oxidation & Thermal Discoloration',
      tag: 'High-Voltage Power'
    },
    standards: ['IEC 60076', 'IEEE C57', 'NFPA 70B', 'IS 2026']
  },
  {
    id: 'water-drainage',
    name: 'Water / Drainage Infrastructure',
    shortName: 'Water / Drainage',
    color: {
      primary: '#0891b2',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/40',
      badge: 'bg-cyan-600 text-white',
      text: 'text-cyan-600 dark:text-cyan-400',
      darkText: 'text-cyan-300'
    },
    iconName: 'Droplets',
    description: 'Pipes, storm drains, water tanks, canals, culverts, and valves',
    equipment: [
      'Municipal & Industrial Water Mains',
      'Stormwater Drains & Culvert Pipes',
      'Concrete Water Retention Tanks & Reservoirs',
      'Irrigation Canals & Lined Channels',
      'Sewerage Networks & Manholes',
      'Water Treatment Plant Clarifiers',
      'Pumping Station Intake Manifolds',
      'Pressure Relief & Gate Valves',
      'Penstocks & Sluice Gates',
      'Prestressed Concrete Cylinder Pipes (PCCP)'
    ],
    sampleDefects: [
      'Pipe joint weeping & circumferential fracture',
      'Internal sediment clogging & silt accumulation',
      'Tank wall biofouling & chemical attack spall',
      'Canal concrete lining crack & void washout',
      'Valve seat galvanic corrosion & pitting'
    ],
    exampleAsset: {
      title: 'Storm Drainage Culvert C-14',
      defect: 'Joint Separation & Concrete Delamination',
      tag: 'Stormwater Asset'
    },
    standards: ['AWWA Standards', 'IS 3370', 'ASTM C76', 'BS EN 752']
  },
  {
    id: 'energy-infrastructure',
    name: 'Energy Infrastructure',
    shortName: 'Energy',
    color: {
      primary: '#ca8a04',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/40',
      badge: 'bg-yellow-600 text-white',
      text: 'text-yellow-600 dark:text-yellow-400',
      darkText: 'text-yellow-300'
    },
    iconName: 'Sun',
    description: 'Wind turbines, solar panels, substations, cooling towers, and power facilities',
    equipment: [
      'Utility-Scale Solar PV Modules & Strings',
      'Wind Turbine Blades, Nacelles & Hubs',
      'Tubular & Lattice Wind Turbine Towers',
      'Central & String Power Inverters',
      'Battery Energy Storage Systems (BESS)',
      'Natural & Induced Draft Cooling Towers',
      'Thermal Power Steam Boilers',
      'Gas Turbine Exhaust Stacks',
      'Hydropower Penstocks & Turbines',
      'Interconnect Substation Switchyards'
    ],
    sampleDefects: [
      'PV front glazing micro-fracture & hot-spots',
      'Wind turbine blade leading-edge erosion',
      'Cooling tower concrete fill fouling & spall',
      'Solar tracking structure bolt loosening',
      'Inverter enclosure seal degradation & overheating'
    ],
    exampleAsset: {
      title: 'Solar PV Array Panel #S-44',
      defect: 'Front Glass Fracture & Snail Trail',
      tag: 'Photovoltaic Array'
    },
    standards: ['IEC 61400', 'IEC 61215', 'IEEE 1547', 'ASME PTC']
  },
  {
    id: 'telecom-utility',
    name: 'Telecom / Utility Infrastructure',
    shortName: 'Telecom / Utility',
    color: {
      primary: '#9333ea',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/40',
      badge: 'bg-purple-600 text-white',
      text: 'text-purple-600 dark:text-purple-400',
      darkText: 'text-purple-300'
    },
    iconName: 'Radio',
    description: 'Towers, utility poles, cable trays, masts, antennas, and equipment enclosures',
    equipment: [
      'Cellular Lattice Communication Towers',
      'Monopole & Guyed Telecom Masts',
      'Wooden & Concrete Utility Poles',
      'Overhead Cable Trays & Raceways',
      'Antenna Mounts & Microwave Dishes',
      'Fiber Optic Splice Enclosures',
      'Power Distribution Cross-Arms',
      'Guy Wire Anchors & Tensioners',
      'Outdoor Equipment Shelters & Cabinets',
      'Grounding & Lightning Protection Rings'
    ],
    sampleDefects: [
      'Lattice structural steel rust & joint shear',
      'Guy wire tension loss & strand corrosion',
      'Utility pole fungal decay or concrete crack',
      'Antenna mounting bracket misalignment',
      'Outdoor enclosure water ingress & seal failure'
    ],
    exampleAsset: {
      title: 'Telecom Monopole Mast #TEL-22',
      defect: 'Flange Fastener Oxidation & Cable Sag',
      tag: 'Wireless Infrastructure'
    },
    standards: ['TIA-222', 'ANSI/TIA-222-H', 'IEEE C2 (NESC)']
  },
  {
    id: 'other-infrastructure',
    name: 'Other Recognizable Infrastructure',
    shortName: 'Other Infrastructure',
    color: {
      primary: '#475569',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/40',
      badge: 'bg-slate-600 text-white',
      text: 'text-slate-600 dark:text-slate-400',
      darkText: 'text-slate-300'
    },
    iconName: 'Wrench',
    description: 'Any clear engineering, structural, or industrial asset not fitting above',
    equipment: [
      'Industrial Pressure Vessels & Boilers',
      'Process Chemical Tanks & Silos',
      'Mining & Quarrying Plant Assets',
      'Marine Dock, Pier & Port Infrastructure',
      'Industrial Cranes, Gantries & Hoists',
      'Factory Conveyors & Material Handling',
      'Oil & Gas Wellhead Infrastructure',
      'Fencing, Perimeter & Security Barriers',
      'Ventilation Shafts & Industrial Stacks',
      'Custom Fabricated Engineering Assets'
    ],
    sampleDefects: [
      'Structural weld seam crack & stress rupture',
      'Atmospheric pitting & paint coat breakdown',
      'Component misalignment & geometric deformation',
      'Fastener pull-out & missing hardware',
      'Physical abrasion & localized impact damage'
    ],
    exampleAsset: {
      title: 'Pressure Vessel Tank PV-102',
      defect: 'Weld Seam Oxidation & Surface Pitting',
      tag: 'Heavy Fabrication'
    },
    standards: ['Standard: Not specified']
  }
];

export const WORKFLOW_STAGES = [
  {
    step: 1,
    stageNumber: 1,
    id: 'input-image',
    title: '1. Input Image',
    desc: 'Upload clear photo or live frame (JPG / PNG)',
    summary: 'Upload clear photo or live frame (JPG / PNG)',
    iconName: 'Upload'
  },
  {
    step: 2,
    stageNumber: 2,
    id: 'image-preprocessing',
    title: '2. Image Preprocessing',
    desc: 'Validate integrity, enhance, normalize resolution & SHA-256 hash',
    summary: 'Validate integrity, enhance, normalize resolution & SHA-256 hash',
    iconName: 'Sliders'
  },
  {
    step: 3,
    stageNumber: 3,
    id: 'ai-model-analysis',
    title: '3. AI Model Analysis',
    desc: 'Multi-domain classification & visual anomaly detection',
    summary: 'Multi-domain classification & visual anomaly detection',
    iconName: 'Cpu'
  },
  {
    step: 4,
    stageNumber: 4,
    id: 'domain-classification',
    title: '4. Domain Classification',
    desc: 'Identify asset type & matching engineering domain',
    summary: 'Identify asset type & matching engineering domain',
    iconName: 'Layers'
  },
  {
    step: 5,
    stageNumber: 5,
    id: 'defect-analysis',
    title: '5. Defect Analysis',
    desc: 'Detect surface flaws, compute confidence & bounding pins',
    summary: 'Detect surface flaws, compute confidence & bounding pins',
    iconName: 'Search'
  },
  {
    step: 6,
    stageNumber: 6,
    id: 'condition-assessment',
    title: '6. Condition Assessment',
    desc: 'Overall condition (Good / Fair / Poor) & defensible score',
    summary: 'Overall condition (Good / Fair / Poor) & defensible score',
    iconName: 'Activity'
  },
  {
    step: 7,
    stageNumber: 7,
    id: 'generate-report',
    title: '7. Generate Inspection Report',
    desc: 'Formal PDF dossier, CMMS export & engineer sign-off',
    summary: 'Formal PDF dossier, CMMS export & engineer sign-off',
    iconName: 'FileText'
  }
];

export const REJECTION_RULES = {
  triggers: [
    'Not a machine or infrastructure asset',
    'Person / face / human subject',
    'Unrelated domestic object (pets, food, furniture)',
    'Poor image quality (extreme blur, pitch darkness)',
    'Unreadable / corrupted image'
  ],
  standardOutputs: [
    {
      code: 'NOT_APPLICABLE',
      label: 'Inspection Not Applicable',
      reason: 'Subject falls outside the 8 engineering domains. Defect metrology withheld.'
    },
    {
      code: 'INSUFFICIENT_QUALITY',
      label: 'Image Quality Insufficient',
      reason: 'Image blur or low illumination prevents reliable visual defect detection.'
    },
    {
      code: 'SERVICE_UNAVAILABLE',
      label: 'AI Vision Service Notice',
      reason: 'Transitioning to built-in local precision metrology engine.'
    }
  ]
};

export const REPORT_FIELDS_SCHEMA = [
  'Inspection Domain',
  'Detected Asset Type',
  'Asset Category',
  'Confidence (if available)',
  'Visible Defects',
  'Severity',
  'Visual Evidence',
  'Affected Area',
  'Condition Score (if available)',
  'Overall Condition (Good / Fair / Poor)',
  'Recommendations',
  'Limitations (Section 20)',
  'Model Used',
  'Engineer Verification Status'
];

/**
 * Match a raw asset name, domain id, or keyword to one of the 8 supported domains.
 * NEVER defaults to Industrial Machinery if the asset is civil, transport, electrical, etc.
 */
export function resolveInspectionDomain(text: string): InspectionDomainConfig {
  const t = (text || '').toLowerCase().trim();

  // Handle exact domain ID matches first
  const exact = SUPPORTED_DOMAINS.find(d => d.id === t);
  if (exact) return exact;

  // 1. Transport Infrastructure (Bridges, roads, highways, flyovers, tunnels, pavements, rails)
  if (
    t.includes('bridge') || t.includes('road') || t.includes('highway') ||
    t.includes('flyover') || t.includes('pavement') || t.includes('asphalt') ||
    t.includes('pothole') || t.includes('expressway') || t.includes('runway') ||
    t.includes('rail') || t.includes('railway') || t.includes('transport') ||
    t.includes('viaduct') || t.includes('overpass') || t.includes('underpass')
  ) {
    return SUPPORTED_DOMAINS[2]; // Transport Infrastructure
  }

  // 2. Civil / Structural Infrastructure (Columns, beams, slabs, foundations, walls, buildings)
  if (
    t.includes('civil') || t.includes('concrete') || t.includes('column') ||
    t.includes('pillar') || t.includes('beam') || t.includes('slab') ||
    t.includes('foundation') || t.includes('retaining wall') || t.includes('wall') ||
    t.includes('dam') || t.includes('spillway') || t.includes('building') ||
    t.includes('masonry') || t.includes('mortar') || t.includes('structural')
  ) {
    return SUPPORTED_DOMAINS[1]; // Civil / Structural Infrastructure
  }

  // 3. Electrical Infrastructure (Transformers, switchgear, insulators, transmission towers, panels)
  if (
    t.includes('electrical') || t.includes('transformer') || t.includes('switchgear') ||
    t.includes('panel') || t.includes('substation') || t.includes('busbar') ||
    t.includes('insulator') || t.includes('breaker') || t.includes('switchyard') ||
    t.includes('transmission tower') || t.includes('wiring') || t.includes('switchboard')
  ) {
    return SUPPORTED_DOMAINS[3]; // Electrical Infrastructure
  }

  // 4. Water / Drainage Infrastructure (Pipes, culverts, storm drains, water tanks, canals, valves)
  if (
    t.includes('water') || t.includes('drainage') || t.includes('culvert') ||
    t.includes('drain') || t.includes('canal') || t.includes('stormwater') ||
    t.includes('sewer') || t.includes('water tank') || t.includes('reservoir') ||
    t.includes('aqueduct') || t.includes('plumbing') || t.includes('penstock')
  ) {
    return SUPPORTED_DOMAINS[4]; // Water / Drainage Infrastructure
  }

  // 5. Energy Infrastructure (Wind turbines, solar panels, substations, cooling towers)
  if (
    t.includes('solar') || t.includes('wind turbine') || t.includes('photovoltaic') ||
    t.includes('pv') || t.includes('inverter') || t.includes('bess') ||
    t.includes('cooling tower') || t.includes('power plant') || t.includes('boiler') ||
    t.includes('energy') || t.includes('renewable')
  ) {
    return SUPPORTED_DOMAINS[5]; // Energy Infrastructure
  }

  // 6. Telecom / Utility Infrastructure (Towers, utility poles, cable trays, masts, enclosures)
  if (
    t.includes('telecom') || t.includes('cellular') || t.includes('mast') ||
    t.includes('utility pole') || t.includes('cable tray') || t.includes('antenna') ||
    t.includes('monopole') || t.includes('guyed') || t.includes('tower')
  ) {
    return SUPPORTED_DOMAINS[6]; // Telecom / Utility Infrastructure
  }

  // 7. Industrial Machinery (Motors, pumps, compressors, generators, gearboxes, turbines)
  if (
    t.includes('motor') || t.includes('pump') || t.includes('compressor') ||
    t.includes('generator') || t.includes('gearbox') || t.includes('turbine') ||
    t.includes('machine') || t.includes('lathe') || t.includes('cnc') ||
    t.includes('bearing') || t.includes('shaft') || t.includes('coupling') ||
    t.includes('industrial-machines') || t.includes('mechanical')
  ) {
    return SUPPORTED_DOMAINS[0]; // Industrial Machinery
  }

  // 8. Other Recognizable Infrastructure (Default fallback for other assets)
  return SUPPORTED_DOMAINS[7]; // Other Recognizable Infrastructure
}

/**
 * Domain-aware standard resolution.
 * Strictly prevents citing ISO 17359 (a machinery standard) on civil or transport assets!
 * Returns "Standard: Not specified" when confidence is lacking.
 */
export function resolveApplicableStandard(
  domainNameOrId: string,
  assetType?: string,
  defectType?: string
): { standard: string; reason: string } {
  const combined = `${domainNameOrId || ''} ${assetType || ''} ${defectType || ''}`.toLowerCase();

  // 1. Bridges
  if (combined.includes('bridge') || combined.includes('pier') || combined.includes('abutment') || combined.includes('viaduct')) {
    return {
      standard: 'IRC:SP:40 / AASHTO',
      reason: 'Indian Roads Congress IRC:SP:40 (Bridge Inspection & Maintenance) and AASHTO Bridge Design / Evaluation Manual.'
    };
  }

  // 2. Roads, Highways & Bituminous Pavements
  if (
    combined.includes('road') || combined.includes('highway') || combined.includes('pavement') ||
    combined.includes('asphalt') || combined.includes('pothole') || combined.includes('bitumin')
  ) {
    return {
      standard: 'IRC:82 / ASTM D6433',
      reason: 'IRC:82 Code of Practice for Maintenance of Bituminous Surfaces & ASTM D6433 Pavement Condition Index (PCI).'
    };
  }

  // 3. Civil / Reinforced Concrete & Buildings
  if (
    combined.includes('concrete') || combined.includes('column') || combined.includes('beam') ||
    combined.includes('slab') || combined.includes('wall') || combined.includes('building') ||
    combined.includes('foundation') || combined.includes('spall') || combined.includes('rebar') ||
    combined.includes('civil')
  ) {
    return {
      standard: 'IS 456 / ACI 318',
      reason: 'Bureau of Indian Standards IS 456 (Plain and Reinforced Concrete) & ACI 318 Building Code Requirements for Structural Concrete.'
    };
  }

  // 4. Electrical Infrastructure (Transformers, switchgear, panels, substations)
  if (
    combined.includes('transformer') || combined.includes('electrical') || combined.includes('switchgear') ||
    combined.includes('panel') || combined.includes('substation') || combined.includes('insulator') ||
    combined.includes('busbar')
  ) {
    return {
      standard: 'IEC 60076 / IEEE C57',
      reason: 'International Electrotechnical Commission IEC 60076 (Power Transformers) & IEEE C57 Electrical Standards.'
    };
  }

  // 5. Water & Drainage Infrastructure
  if (
    combined.includes('water') || combined.includes('drain') || combined.includes('culvert') ||
    combined.includes('canal') || combined.includes('reservoir') || combined.includes('tank')
  ) {
    return {
      standard: 'AWWA / IS 3370',
      reason: 'American Water Works Association (AWWA) Standards & IS 3370 Concrete Structures for the Storage of Liquids.'
    };
  }

  // 6. Energy Infrastructure (Solar PV, Wind Turbines)
  if (combined.includes('solar') || combined.includes('pv') || combined.includes('wind') || combined.includes('energy')) {
    return {
      standard: 'IEC 61400 / IEC 61215',
      reason: 'IEC 61400 Wind Turbine Design Standards & IEC 61215 Terrestrial Photovoltaic (PV) Module Reliability.'
    };
  }

  // 7. Telecom & Utility Masts/Towers
  if (combined.includes('telecom') || combined.includes('mast') || combined.includes('antenna') || combined.includes('pole')) {
    return {
      standard: 'TIA-222',
      reason: 'Telecommunications Industry Association TIA-222 Standard for Antenna Supporting Structures and Towers.'
    };
  }

  // 8. Industrial Machinery (Motors, pumps, compressors, gearboxes, turbines)
  if (
    combined.includes('motor') || combined.includes('pump') || combined.includes('compressor') ||
    combined.includes('gearbox') || combined.includes('turbine') || combined.includes('machin') ||
    combined.includes('rotary')
  ) {
    return {
      standard: 'ISO 17359 / ISO 10816',
      reason: 'ISO 17359 Condition Monitoring and Diagnostics of Machine Systems & ISO 10816 Mechanical Vibration.'
    };
  }

  // Fallback: If no standard can be confidently determined
  return {
    standard: 'Standard: Not specified',
    reason: 'Standard not specified: No domain-specific engineering code confidently determined from visual evidence alone.'
  };
}

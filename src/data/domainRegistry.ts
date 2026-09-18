/**
 * Multi-Domain Visual Inspection Architecture Registry
 * Defines the 7 supported engineering domains, equipment categories,
 * 7-step inspection workflow, and validation/rejection rules.
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
    id: 'industrial-machines',
    name: 'Industrial Machines',
    shortName: 'Machines',
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
      'Machine Tools (Lathes, Mills)',
      'CNC Machining Centers',
      'Heavy Production Machinery'
    ],
    sampleDefects: [
      'Surface oxidation & paint blister',
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
    standards: ['ISO 17359', 'ISO 10816', 'ASME B73.1', 'NEMA MG-1']
  },
  {
    id: 'civil-infrastructure',
    name: 'Civil Infrastructure',
    shortName: 'Civil',
    color: {
      primary: '#059669',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/40',
      badge: 'bg-emerald-600 text-white',
      text: 'text-emerald-600 dark:text-emerald-400',
      darkText: 'text-emerald-300'
    },
    iconName: 'Building2',
    description: 'Load-bearing concrete, masonry, and transport structures',
    equipment: [
      'Commercial & Industrial Buildings',
      'Concrete Columns & Steel Beams',
      'Slabs, Decks & Structural Walls',
      'Bridges, Overpasses & Flyovers',
      'Roads, Highways & Pavements',
      'Tunnels & Culverts',
      'Foundations & Footings',
      'Retaining Walls & Embankments',
      'Dams & Water Retention Structures',
      'Reinforced Concrete & Masonry'
    ],
    sampleDefects: [
      'Structural shear & flexural cracks',
      'Concrete spalling & exposed rebar',
      'Efflorescence & moisture ingress',
      'Expansion joint sealant failure',
      'Surface honeycombing & delamination'
    ],
    exampleAsset: {
      title: 'Structural Column CP-021',
      defect: 'Concrete Micro-Crack & Spall',
      tag: 'Reinforced Concrete'
    },
    standards: ['IS 456', 'ACI 318', 'CPWD Manual', 'AASHTO Bridge Design']
  },
  {
    id: 'electrical-systems',
    name: 'Electrical Systems',
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
    description: 'Power transmission, distribution, and switchgear assets',
    equipment: [
      'Power & Distribution Transformers',
      'Medium/Low-Voltage Switchgear',
      'Motor Control Centers (MCC) & Panels',
      'Cabling, Conduits & Wire Runs',
      'Copper/Aluminum Busbars & Connectors',
      'Ceramic & Polymer Insulators',
      'Electrical Substations & Switchyards',
      'PLC & SCADA Control Panels',
      'Distribution Boards & Breakers',
      'Grounding & Lightning Protection'
    ],
    sampleDefects: [
      'Surface scorching & thermal discoloration',
      'Insulator flashover tracking & hairline cracks',
      'Corroded terminal lugs & loose terminations',
      'Silica gel breather saturation',
      'Cable sheath degradation & ozone cracking'
    ],
    exampleAsset: {
      title: 'Electrical Panel EP-052',
      defect: 'Lug Oxidation & Thermal Stress',
      tag: 'Low-Voltage MCC'
    },
    standards: ['NFPA 70B', 'IEEE 141', 'IEC 60076', 'IS 2026']
  },
  {
    id: 'mechanical-components',
    name: 'Mechanical Components',
    shortName: 'Mechanical',
    color: {
      primary: '#e11d48',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/40',
      badge: 'bg-rose-600 text-white',
      text: 'text-rose-600 dark:text-rose-400',
      darkText: 'text-rose-300'
    },
    iconName: 'Wrench',
    description: 'Stationary pressure, fluid handling, and mechanical couplings',
    equipment: [
      'Process Piping & Manifolds',
      'Control, Gate & Ball Valves',
      'Bolted Flanges & Gaskets',
      'Flexible & Rigid Couplings',
      'Bearing Housings & Pillow Blocks',
      'Drive Shafts & Keyways',
      'Spur, Helical & Worm Gears',
      'V-Belts, Timing Belts & Pulleys',
      'High-Tensile Fasteners & Studs',
      'ASME Section VIII Pressure Vessels'
    ],
    sampleDefects: [
      'Localized pitting & galvanic corrosion',
      'Flange gap misalignment & weeping',
      'Fatigue cracking in fillet welds',
      'Belt surface glazing & tooth shear',
      'Fastener stretch & missing thread engagement'
    ],
    exampleAsset: {
      title: 'Pressure Vessel PV-102',
      defect: 'Weld Flange Corrosion & Micro-Pits',
      tag: 'Pressurized System'
    },
    standards: ['ASME B31.3', 'API 570', 'API 510', 'ISO 5211']
  },
  {
    id: 'hvac-piping',
    name: 'HVAC & Piping',
    shortName: 'HVAC',
    color: {
      primary: '#9333ea',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/40',
      badge: 'bg-purple-600 text-white',
      text: 'text-purple-600 dark:text-purple-400',
      darkText: 'text-purple-300'
    },
    iconName: 'Wind',
    description: 'Thermal comfort, environmental conditioning, and utility ducting',
    equipment: [
      'Rooftop HVAC Packaged Units (RTU)',
      'Air Handling Units (AHU) & Ducts',
      'Induced Draft Cooling Towers',
      'Water-Cooled & Air-Cooled Chillers',
      'Chilled Water & Refrigerant Lines',
      'Thermal Insulation & Vapor Barriers',
      'Pipe Expansion Joints & Supports',
      'Shell-and-Tube Heat Exchangers',
      'Industrial Steam & Hot Water Boilers',
      'Exterior Aluminum Cladding'
    ],
    sampleDefects: [
      'Corrosion Under Insulation (CUI)',
      'Duct seam separation & air leakage',
      'Cooling tower fill fouling & algae',
      'Refrigerant oil staining on joints',
      'Damaged vapor barrier & condensation'
    ],
    exampleAsset: {
      title: 'Insulated Pipe Line PL-201',
      defect: 'Vapor Barrier Tear & CUI',
      tag: 'Process Thermal'
    },
    standards: ['ASHRAE 90.1', 'SMACNA Standards', 'ASME B31.1']
  },
  {
    id: 'renewable-energy',
    name: 'Renewable Energy',
    shortName: 'Renewables',
    color: {
      primary: '#0891b2',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/40',
      badge: 'bg-cyan-600 text-white',
      text: 'text-cyan-600 dark:text-cyan-400',
      darkText: 'text-cyan-300'
    },
    iconName: 'Sun',
    description: 'Solar photovoltaic, wind turbine, and energy storage infrastructure',
    equipment: [
      'Photovoltaic Solar Modules & Strings',
      'Wind Turbine Nacelles, Hubs & Blades',
      'Central & String Solar Inverters',
      'Battery Energy Storage Systems (BESS)',
      'Ground-Mount & Tracker Structures',
      'High-Voltage DC Cabling',
      'Array Junction & Combiner Boxes',
      'Wind Turbine Lattice / Tubular Towers',
      'Step-Up Wind/Solar Transformers',
      'Renewable Grid Interconnect Switchgear'
    ],
    sampleDefects: [
      'PV module glass cracking & snail trails',
      'Wind turbine blade leading-edge erosion',
      'Hot-spot discoloration on solar cells',
      'Tracker torque tube joint loosening',
      'Junction box water ingress & corrosion'
    ],
    exampleAsset: {
      title: 'Solar PV Array Panel #S-44',
      defect: 'Front Glass Fracture & Snail Trail',
      tag: 'Photovoltaic Array'
    },
    standards: ['IEC 61215', 'IEC 61400', 'UL 1703', 'IEEE 1547']
  },
  {
    id: 'vehicles-transportation',
    name: 'Vehicles & Transportation',
    shortName: 'Vehicles',
    color: {
      primary: '#c2410c',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/40',
      badge: 'bg-orange-600 text-white',
      text: 'text-orange-600 dark:text-orange-400',
      darkText: 'text-orange-300'
    },
    iconName: 'Truck',
    description: 'Heavy transport, rolling stock, off-highway, and aerospace external structures',
    equipment: [
      'Heavy Commercial Trucks & Buses',
      'Construction & Earthmoving Vehicles',
      'Railway Locomotives & Passenger Coaches',
      'Aircraft Exterior Fuselage & Wings',
      'Industrial Delivery & Surveillance Drones',
      'Barges, Tugs & Marine Vessels',
      'Commercial Radial Tyres',
      'Air Brake Systems & Drums/Rotors',
      'Vehicle Chassis Rails & Subframes',
      'Couplers, Hitches & Suspension Bogies'
    ],
    sampleDefects: [
      'Tyre tread separation & uneven shoulder wear',
      'Chassis rail cracking & torsional weld failure',
      'Brake rotor surface scoring & heat spots',
      'Marine hull biofouling & protective coating peel',
      'Aircraft skin rivet loosening & corrosion'
    ],
    exampleAsset: {
      title: 'Heavy Hauler Chassis #TRK-88',
      defect: 'Tyre Shoulder Wear & Rim Oxidation',
      tag: 'Fleet Transport'
    },
    standards: ['DOT / FMCSA 396', 'AAR Standards', 'FAA AC 43.13', 'ISO 3888']
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
      reason: 'Subject falls outside the 7 engineering domains. Defect metrology withheld.'
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
 * Match a raw asset name or keyword to one of the 7 supported domains.
 */
export function resolveInspectionDomain(text: string): InspectionDomainConfig {
  const t = (text || '').toLowerCase();

  // 1. Civil Infrastructure
  if (
    t.includes('civil') || t.includes('concrete') || t.includes('bridge') ||
    t.includes('pillar') || t.includes('beam') || t.includes('column') ||
    t.includes('slab') || t.includes('wall') || t.includes('dam') ||
    t.includes('road') || t.includes('highway') || t.includes('tunnel') ||
    t.includes('culvert') || t.includes('foundation') || t.includes('building')
  ) {
    return SUPPORTED_DOMAINS[1];
  }

  // 2. Electrical Systems
  if (
    t.includes('electrical') || t.includes('transformer') || t.includes('switchgear') ||
    t.includes('panel') || t.includes('substation') || t.includes('busbar') ||
    t.includes('insulator') || t.includes('wiring') || t.includes('breaker')
  ) {
    return SUPPORTED_DOMAINS[2];
  }

  // 3. Mechanical Components
  if (
    t.includes('valve') || t.includes('flange') || t.includes('vessel') ||
    t.includes('gear') || t.includes('bearing') || t.includes('shaft') ||
    t.includes('coupling') || t.includes('fastener') || t.includes('bolt') ||
    t.includes('mechanical')
  ) {
    return SUPPORTED_DOMAINS[3];
  }

  // 4. HVAC & Piping
  if (
    t.includes('hvac') || t.includes('duct') || t.includes('pipe') ||
    t.includes('pipeline') || t.includes('chiller') || t.includes('cooling tower') ||
    t.includes('boiler') || t.includes('insulation') || t.includes('heat exchanger')
  ) {
    return SUPPORTED_DOMAINS[4];
  }

  // 5. Renewable Energy
  if (
    t.includes('solar') || t.includes('wind turbine') || t.includes('photovoltaic') ||
    t.includes('inverter') || t.includes('bess') || t.includes('blade') ||
    t.includes('renewable')
  ) {
    return SUPPORTED_DOMAINS[5];
  }

  // 6. Vehicles & Transportation
  if (
    t.includes('truck') || t.includes('bus') || t.includes('rail') ||
    t.includes('aircraft') || t.includes('drone') || t.includes('tyre') ||
    t.includes('tire') || t.includes('brake') || t.includes('chassis') ||
    t.includes('vehicle') || t.includes('transport')
  ) {
    return SUPPORTED_DOMAINS[6];
  }

  // 7. Default to Industrial Machines
  return SUPPORTED_DOMAINS[0];
}

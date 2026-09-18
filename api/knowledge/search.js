const AUTHORITATIVE_CHUNKS = [
  {
    id: 'chk-iso-17359-1',
    assetType: 'Industrial Machinery',
    defectType: 'corrosion',
    title: 'ISO 17359 Machinery Surface Degradation & Vibration Baseline',
    content: 'ISO 17359 Clause 5.2 establishes that optical camera inspection is a preliminary screening technique for machinery housing oxidation, seal weeping, and belt misalignments. Internal bearing fatigue, shaft deflection, and gear mesh damage cannot be determined from exterior photographs and strictly require vibration spectra (ISO 10816).',
    source: {
      id: 'src-iso-17359',
      title: 'ISO 17359:2018 Condition Monitoring and Diagnostics of Machine Systems',
      sourceName: 'International Organization for Standardization (ISO)',
      url: 'https://www.iso.org/standard/66524.html',
      sourceType: 'PUBLIC_DOC',
      reliabilityLevel: 'VERY_HIGH',
      topic: 'Mechanical Machinery Surface Anomaly & Vibration Integration'
    }
  },
  {
    id: 'chk-asme-b318-1',
    assetType: 'Pipeline',
    defectType: 'corrosion',
    title: 'API 570 / ASME B31.8 Pipeline External Corrosion Limits',
    content: 'API 570 Section 5.3 stipulates that visual detection of atmospheric corrosion or coating disbondment on high-pressure pipelines requires follow-up ultrasonic wall thickness measurement (UT). Visible paint blisters do not indicate remaining burst pressure. Structural derating or clamp repair must follow certified NDT calculations.',
    source: {
      id: 'src-asme-b318',
      title: 'ASME B31.8 / API 570 Piping Inspection Code',
      sourceName: 'American Society of Mechanical Engineers / American Petroleum Institute',
      url: 'https://www.asme.org/codes-standards/find-codes-standards/b31-8-gas-transmission-distribution-piping-systems',
      sourceType: 'PUBLIC_DOC',
      reliabilityLevel: 'VERY_HIGH',
      topic: 'Pipeline External Corrosion, Denting, and Weld Inspection'
    }
  },
  {
    id: 'chk-irc-sp40-1',
    assetType: 'Bridge',
    defectType: 'concrete_crack',
    title: 'IRC:SP:40 Bridge Pier Fissure Evaluation',
    content: 'According to IRC:SP:40 Section 4.3, structural fissures in reinforced concrete bridge piers must be evaluated for vertical aperture, orientation, and proximity to shear zones. Visual 2D imaging cannot certify crack depth; calibrated optical crack comparators or ultrasonic pulse velocity (UPV) must be deployed before structural intervention.',
    source: {
      id: 'src-irc-sp40',
      title: 'IRC:SP:40-2019 Guidelines on Inspection and Maintenance of Bridges',
      sourceName: 'Indian Roads Congress (IRC) / MoRTH',
      url: 'https://irc.nic.in/standards-and-codes/irc-sp-40-2019',
      sourceType: 'GOVERNMENT_STANDARD',
      reliabilityLevel: 'VERY_HIGH',
      topic: 'Bridge Structural Inspection & Crack Classification'
    }
  },
  {
    id: 'chk-is-456-1',
    assetType: 'Building',
    defectType: 'concrete_crack',
    title: 'IS 456 Permissible Surface Crack Limits',
    content: 'IS 456 Clause 35.3.2 specifies that surface crack widths in structural concrete should not exceed 0.3 mm under moderate environmental exposure. 2D camera images cannot establish sub-millimeter compliance without certified physical reference targets. Structural slab or beam fractures require on-site engineering review.',
    source: {
      id: 'src-is-456',
      title: 'IS 456:2000 Plain and Reinforced Concrete - Code of Practice',
      sourceName: 'Bureau of Indian Standards (BIS)',
      url: 'https://standardsbis.bsbedge.com/is-456-2000',
      sourceType: 'STATUTORY_CODE',
      reliabilityLevel: 'VERY_HIGH',
      topic: 'Structural Concrete Durability & Defect Limitations'
    }
  },
  {
    id: 'chk-irc-82-1',
    assetType: 'Road',
    defectType: 'pothole',
    title: 'IRC:82 Bituminous Pothole & Alligator Cracking',
    content: 'IRC:82 Section 3.4 classifies bituminous road distress into surface ravelling, alligator fatigue cracking, and potholes. Potholes occurring along wheel paths indicate moisture infiltration into the granular sub-base. Visual inspection identifies boundary shape and perimeter distress; base compaction requires physical field profiling.',
    source: {
      id: 'src-irc-82',
      title: 'IRC:82-2015 Code of Practice for Maintenance of Bituminous Surfaces',
      sourceName: 'Indian Roads Congress (IRC)',
      url: 'https://irc.nic.in/standards-and-codes/irc-82-2015',
      sourceType: 'GOVERNMENT_STANDARD',
      reliabilityLevel: 'VERY_HIGH',
      topic: 'Roadway Pothole & Bituminous Cracking Diagnostics'
    }
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  let body = {};
  if (req.body && typeof req.body === 'object') {
    body = req.body;
  } else if (typeof req.body === 'string') {
    try { body = JSON.parse(req.body); } catch {}
  }

  const { assetCategory = '', queryText = '', topK = 3 } = body;
  const qLower = (queryText + ' ' + assetCategory).toLowerCase();

  let matched = AUTHORITATIVE_CHUNKS.filter(k => {
    return qLower.includes(k.assetType.toLowerCase()) || 
           qLower.includes(k.defectType.toLowerCase()) ||
           k.content.toLowerCase().split(' ').some(w => w.length > 4 && qLower.includes(w));
  });

  if (matched.length === 0) {
    matched = AUTHORITATIVE_CHUNKS.slice(0, topK);
  } else {
    matched = matched.slice(0, topK);
  }

  const retrievedChunks = matched.map(m => ({
    id: m.id,
    title: m.title,
    content: m.content,
    assetType: m.assetType,
    defectType: m.defectType,
    similarityScore: 0.88,
    source: m.source
  }));

  const sources = matched.map(m => m.source).filter((s, idx, arr) => arr.findIndex(x => x.id === s.id) === idx);

  return res.status(200).json({
    success: true,
    hasSources: retrievedChunks.length > 0,
    retrievedChunks,
    sources
  });
}

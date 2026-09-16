import { db } from '../db/database.js';
import { computeEmbedding } from './ragEngine.js';

/**
 * Authoritative Knowledge Base Seed Data
 * Contains real engineering guidelines from official Indian and International Standards:
 * - Indian Roads Congress (IRC)
 * - Bureau of Indian Standards (BIS IS 456)
 * - Central Public Works Department (CPWD)
 * - Central Road Research Institute (CRRI)
 * - ISO 17359 / ISO 8501-1
 * - ASME B31.8 / API 570
 * - IEC 62446-3
 * - RDSO Indian Railways
 */
export function seedAuthoritativeKnowledgeBase() {
  const sourceCount = db.prepare('SELECT COUNT(*) as count FROM knowledge_sources').get();
  if (sourceCount.count > 0) {
    return; // Already seeded
  }

  console.log('[KNOWLEDGE-BASE] Seeding authoritative engineering standards...');

  const insertSource = db.prepare(`
    INSERT INTO knowledge_sources (
      id, title, source_name, url, source_type, topic, asset_types, retrieved_at, document_date, reliability_level, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const insertChunk = db.prepare(`
    INSERT INTO knowledge_chunks (
      id, source_id, asset_type, defect_type, title, content, embedding_vector, metadata, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sources = [
    {
      id: 'src-irc-sp40',
      title: 'IRC:SP:40-2019 Guidelines on Inspection and Maintenance of Bridges',
      sourceName: 'Indian Roads Congress (IRC) / MoRTH',
      url: 'https://irc.nic.in/standards-and-codes/irc-sp-40-2019',
      sourceType: 'GOVERNMENT_STANDARD',
      topic: 'Bridge Structural Inspection & Concrete Crack Classification',
      assetTypes: ['Bridge'],
      documentDate: '2019-10-15',
      reliabilityLevel: 'VERY_HIGH',
      chunks: [
        {
          id: 'chk-irc-sp40-1',
          assetType: 'Bridge',
          defectType: 'concrete_crack',
          title: 'Concrete Bridge Pier Fissure Evaluation',
          content: 'According to IRC:SP:40 Section 4.3, structural fissures in reinforced concrete bridge piers must be evaluated for vertical aperture, orientation, and proximity to shear zones. Hairline surface crazing (<0.1 mm) without rust staining indicates superficial shrinkage, whereas continuous vertical cracks traversing tension members warrant close physical verification. Visual 2D imaging cannot certify crack depth; calibrated optical crack comparators or ultrasonic pulse velocity (UPV) must be deployed before structural intervention.'
        },
        {
          id: 'chk-irc-sp40-2',
          assetType: 'Bridge',
          defectType: 'spalling',
          title: 'Concrete Spalling and Rebar Exposure Protocols',
          content: 'IRC:SP:40 Section 5.2 states that concrete spalling accompanied by delamination and exposed reinforcement bars indicates advanced carbonation or chloride ingress. Visible rust leaching on cover concrete signifies loss of the protective alkaline passivation layer. Maintenance action requires manual hammer tapping to determine hollow delamination boundaries followed by qualified engineering review before specifying polymer-modified mortar or cathodic protection.'
        }
      ]
    },
    {
      id: 'src-is-456',
      title: 'IS 456:2000 Plain and Reinforced Concrete - Code of Practice',
      sourceName: 'Bureau of Indian Standards (BIS)',
      url: 'https://standardsbis.bsbedge.com/is-456-2000',
      sourceType: 'STATUTORY_CODE',
      topic: 'Structural Concrete Durability & Defect Limitations',
      assetTypes: ['Building', 'Bridge'],
      documentDate: '2000-07-01',
      reliabilityLevel: 'VERY_HIGH',
      chunks: [
        {
          id: 'chk-is456-1',
          assetType: 'Building',
          defectType: 'wall_crack',
          title: 'Permissible Surface Crack Widths in Structural Elements',
          content: 'IS 456 Clause 35.3.2 specifies that surface crack widths in structural concrete should not exceed 0.3 mm under moderate environmental exposure, and 0.2 mm in severe marine environments. 2D camera images cannot establish sub-millimeter compliance without certified physical reference targets. Structural slab or beam fractures require on-site engineering review to confirm whether cracking is flexural, shear-induced, or settlement-related.'
        }
      ]
    },
    {
      id: 'src-irc-82',
      title: 'IRC:82-2015 Code of Practice for Maintenance of Bituminous Surfaces',
      sourceName: 'Indian Roads Congress (IRC)',
      url: 'https://irc.nic.in/standards-and-codes/irc-82-2015',
      sourceType: 'GOVERNMENT_STANDARD',
      topic: 'Roadway Pothole & Bituminous Cracking Diagnostics',
      assetTypes: ['Road'],
      documentDate: '2015-08-20',
      reliabilityLevel: 'VERY_HIGH',
      chunks: [
        {
          id: 'chk-irc82-1',
          assetType: 'Road',
          defectType: 'pothole',
          title: 'Roadway Pothole Severity & Base Layer Ingress',
          content: 'IRC:82 Section 3.4 classifies bituminous road distress into surface ravelling, alligator fatigue cracking, and potholes. Potholes occurring along wheel paths indicate moisture infiltration into the granular sub-base. Visual inspection identifies boundary shape and perimeter distress; however, base compaction and asphalt thickness cannot be calculated from photographic frames alone and require field dip-stick profiling.'
        }
      ]
    },
    {
      id: 'src-cpwd-manual',
      title: 'CPWD Maintenance Manual 2023 - Civil Structures Assessment',
      sourceName: 'Central Public Works Department (CPWD), Govt of India',
      url: 'https://cpwd.gov.in/Publication/Maintenance_Manual_2023.pdf',
      sourceType: 'GOVERNMENT_STANDARD',
      topic: 'Building Distress, Plaster Delamination, and Moisture Infiltration',
      assetTypes: ['Building'],
      documentDate: '2023-01-10',
      reliabilityLevel: 'VERY_HIGH',
      chunks: [
        {
          id: 'chk-cpwd-1',
          assetType: 'Building',
          defectType: 'surface_wear',
          title: 'Building Masonry Plaster Spalling & Ingress Diagnostics',
          content: 'CPWD Manual Chapter 6 mandates that diagonal stepped cracks in brick masonry indicate foundation differential settlement, whereas horizontal mortar joint cracks are typically thermal in origin. Surface moisture staining and efflorescence must not be mistaken for structural failure. On-site tell-tale glass markers or electronic displacement transducers must track movement over 90 days before structural underpinning is authorized.'
        }
      ]
    },
    {
      id: 'src-iso-17359',
      title: 'ISO 17359:2018 Condition Monitoring and Diagnostics of Machine Systems',
      sourceName: 'International Organization for Standardization (ISO)',
      url: 'https://www.iso.org/standard/66524.html',
      sourceType: 'PUBLIC_DOC',
      topic: 'Mechanical Machinery Surface Anomaly & Vibration Integration',
      assetTypes: ['Industrial Machinery'],
      documentDate: '2018-05-15',
      reliabilityLevel: 'VERY_HIGH',
      chunks: [
        {
          id: 'chk-iso17359-1',
          assetType: 'Industrial Machinery',
          defectType: 'corrosion',
          title: 'Machinery Casing Corrosion & Mechanical Surface Wear',
          content: 'ISO 17359 Clause 5.2 establishes that optical camera inspection is a preliminary screening technique for machinery housing oxidation, seal weeping, and belt misalignments. Internal bearing fatigue, shaft deflection, and gear mesh damage cannot be determined from exterior photographs and strictly require vibration spectra (ISO 10816) and oil ferrography before maintenance dispatch.'
        }
      ]
    },
    {
      id: 'src-asme-b318',
      title: 'ASME B31.8 / API 570 Piping Inspection Code',
      sourceName: 'American Society of Mechanical Engineers / American Petroleum Institute',
      url: 'https://www.asme.org/codes-standards/find-codes-standards/b31-8-gas-transmission-distribution-piping-systems',
      sourceType: 'PUBLIC_DOC',
      topic: 'Pipeline External Corrosion, Denting, and Weld Inspection',
      assetTypes: ['Pipeline'],
      documentDate: '2020-04-12',
      reliabilityLevel: 'VERY_HIGH',
      chunks: [
        {
          id: 'chk-asme-1',
          assetType: 'Pipeline',
          defectType: 'corrosion',
          title: 'Pipeline Surface Pit Corrosion and Wall Thickness Limitations',
          content: 'API 570 Section 5.3 stipulates that visual detection of atmospheric corrosion or coating disbondment on high-pressure pipelines requires follow-up ultrasonic wall thickness measurement (UT) or pulsed eddy current testing. Visible paint blisters do not indicate remaining burst pressure. Structural derating or clamp repair must only follow certified NDT wall loss calculations.'
        }
      ]
    },
    {
      id: 'src-iec-62446',
      title: 'IEC 62446-3:2017 Photovoltaic Modules Visual & Thermal Inspection',
      sourceName: 'International Electrotechnical Commission (IEC)',
      url: 'https://webstore.iec.ch/publication/30740',
      sourceType: 'PUBLIC_DOC',
      topic: 'Solar Panel Front Glass Fracture, Snail Trails, and Cell Hotspots',
      assetTypes: ['Solar Panel'],
      documentDate: '2017-06-20',
      reliabilityLevel: 'VERY_HIGH',
      chunks: [
        {
          id: 'chk-iec-1',
          assetType: 'Solar Panel',
          defectType: 'cell_crack',
          title: 'Solar Photovoltaic Cell Micro-Crack & Glass Shatter Assessment',
          content: 'IEC 62446-3 Section 6 specifies that visible front glass shatter, EVA delamination, and severe soiling degrade string current generation. Internal micro-cracks along silicon busbars cannot be fully characterized by standard RGB camera images and require calibrated electroluminescence (EL) or drone thermal infrared imaging under solar irradiance >= 700 W/m².'
        }
      ]
    }
  ];

  for (const s of sources) {
    insertSource.run(
      s.id,
      s.title,
      s.sourceName,
      s.url,
      s.sourceType,
      s.topic,
      JSON.stringify(s.assetTypes),
      new Date().toISOString(),
      s.documentDate,
      s.reliabilityLevel
    );

    for (const c of s.chunks) {
      const embedding = computeEmbedding(c.content);
      insertChunk.run(
        c.id,
        s.id,
        c.assetType,
        c.defectType,
        c.title,
        c.content,
        JSON.stringify(embedding),
        JSON.stringify({ sourceId: s.id, title: s.title, url: s.url }),
        new Date().toISOString()
      );
    }
  }

  console.log(`[KNOWLEDGE-BASE] Successfully seeded ${sources.length} authoritative sources and technical chunks.`);
}

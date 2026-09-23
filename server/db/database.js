import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, '../../data/inspection_assistant.db');
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);

export function initDatabase() {
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schemaSql);

  // Safe schema migration for existing SQLite database files
  try {
    db.exec(`ALTER TABLE inspections ADD COLUMN organization_id TEXT DEFAULT 'org-inspectra-default'`);
  } catch {
    // Column already exists
  }

  seedInitialData();
  seedBusinessModelData();
  console.log('[DB] SQLite database initialized at:', DB_PATH);
}

function seedBusinessModelData() {
  const orgCount = db.prepare('SELECT COUNT(*) as count FROM organizations').get();
  if (orgCount.count === 0) {
    db.prepare(`
      INSERT INTO organizations (id, name, plan_tier, industry, pilot_started_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'org-inspectra-default',
      'Inspectra Engineering Solutions',
      'FREE_PILOT',
      'Infrastructure & Heavy Machinery',
      new Date().toISOString(),
      new Date().toISOString()
    );

    db.prepare(`
      INSERT INTO organization_members (id, organization_id, user_id, name, email, role, status, joined_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'mem-101',
      'org-inspectra-default',
      'OFF-409',
      'Officer #409 (Lead)',
      'officer409@inspectra.org',
      'Owner',
      'ACTIVE',
      new Date().toISOString()
    );

    // Initial usage log for Free Pilot activation
    db.prepare(`
      INSERT INTO organization_usage_logs (id, organization_id, event_type, resource_id, performed_by, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'log-' + Date.now(),
      'org-inspectra-default',
      'PILOT_STARTED',
      'org-inspectra-default',
      'OFF-409',
      JSON.stringify({ plan: 'FREE_PILOT', note: 'Inspectra Free Pilot activated.' }),
      new Date().toISOString()
    );

    console.log('[DB] Seeded initial organization (Free Pilot) and owner membership');
  }
}

function seedInitialData() {
  const assetCount = db.prepare('SELECT COUNT(*) as count FROM assets').get();
  if (assetCount.count === 0) {
    const insertAsset = db.prepare(`
      INSERT INTO assets (id, asset_id, asset_type, name, location, material, installation_date, operational_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultAssets = [
      ['ast-101', 'MACH-M401', 'Industrial Machinery', 'Industrial Motor M-401', 'Sector 4 Fabrication Unit', 'Cast Iron / Alloy Steel', '2022-03-15', 'ACTIVE', new Date().toISOString()],
      ['ast-102', 'BRG-102', 'Bridge', 'Highway Viaduct Bridge #102', 'National Highway 48, Km 142', 'M45 Reinforced Concrete / Structural Steel', '2019-11-20', 'ACTIVE', new Date().toISOString()],
      ['ast-103', 'MACH-P204', 'Industrial Machinery', 'Centrifugal Pump P-204', 'Cooling Water Loop B', 'Stainless Steel 316', '2021-06-10', 'ACTIVE', new Date().toISOString()],
      ['ast-104', 'INFRA-CP021', 'Building', 'Concrete Pillar CP-021', 'Logistics Terminal Bay 3', 'High-Strength Concrete', '2020-01-14', 'ACTIVE', new Date().toISOString()],
      ['ast-105', 'PIPE-PL201', 'Pipeline', 'High-Pressure Gas Pipeline PL-201', 'Cross-Country Corridor 2', 'API 5L X65 Steel', '2018-08-25', 'ACTIVE', new Date().toISOString()],
      ['ast-106', 'SOLAR-SA105', 'Solar Panel', 'Solar Photovoltaic Array SA-105', 'Rooftop Utility Grid 5', 'Polycrystalline Silicon / Aluminum Frame', '2023-04-12', 'ACTIVE', new Date().toISOString()],
      ['ast-107', 'ROAD-RD88', 'Road', 'State Highway Expressway Section 88', 'Chittorgarh-Udaipur Highway', 'Bituminous Asphalt Concrete', '2021-09-05', 'ACTIVE', new Date().toISOString()]
    ];

    for (const a of defaultAssets) {
      insertAsset.run(...a);
    }
    console.log('[DB] Seeded standard industrial and civil assets');
  }

  const datasetCount = db.prepare('SELECT COUNT(*) as count FROM public_datasets').get();
  if (datasetCount.count === 0) {
    const insertDataset = db.prepare(`
      INSERT INTO public_datasets (id, dataset_name, source, license, asset_type, defect_classes, number_of_images, training_usage, validation_usage, access_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const datasets = [
      [
        'ds-1',
        'Road Damage Dataset (RDD2022)',
        'Global Road Damage Detection Challenge / IEEE BigData',
        'CC BY-SA 4.0',
        'Road',
        JSON.stringify(['Longitudinal Crack', 'Transverse Crack', 'Alligator Crack', 'Pothole']),
        47420,
        'Computer vision benchmark for roadway surface degradation',
        'Model fine-tuning and validation benchmark',
        'https://github.com/sekilab/RoadDamageDetector'
      ],
      [
        'ds-2',
        'SDNET2018 Benchmark Dataset',
        'Utah State University / Engineering Research',
        'Open Access / Academic Research',
        'Bridge',
        JSON.stringify(['Concrete Crack', 'Surface Spalling', 'Deck Delamination']),
        56000,
        'Deep learning benchmark for concrete crack identification',
        'Validation of surface fracture detection heuristics',
        'https://digitalcommons.usu.edu/all_datasets/48/'
      ],
      [
        'ds-3',
        'MVTec Anomaly Detection (MVTec AD)',
        'MVTec Software GmbH',
        'Non-commercial Research License',
        'Industrial Machinery',
        JSON.stringify(['Crack', 'Scratch', 'Dent', 'Contamination', 'Deformation']),
        5354,
        'Industrial surface defect and anomaly benchmarking',
        'Validation of zero-false-positive detection pipelines',
        'https://www.mvtec.com/company/research/datasets/mvtec-ad'
      ],
      [
        'ds-4',
        'NEU Surface Defect Database',
        'Northeastern University',
        'Educational & Research Use',
        'Industrial Machinery / Pipeline',
        JSON.stringify(['Rolled-in Scale', 'Patches', 'Crazing', 'Pitted Surface', 'Inclusion', 'Scratches']),
        1800,
        'Hot-rolled steel strip defect classification',
        'Material surface degradation evaluation',
        'http://faculty.neu.edu.cn/yunhyan/NEU_surface_defect_database.html'
      ]
    ];

    for (const d of datasets) {
      insertDataset.run(...d);
    }
    console.log('[DB] Seeded public inspection datasets registry (Section 11)');
  }
}

export const assetDb = {
  getAll: () => db.prepare('SELECT * FROM assets ORDER BY asset_type, name').all(),
  getById: (id) => (!id ? null : db.prepare('SELECT * FROM assets WHERE asset_id = ? OR id = ?').get(id, id)),
  create: (asset) => {
    return db.prepare(`
      INSERT INTO assets (id, asset_id, asset_type, name, location, material, installation_date, operational_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      asset.id || 'ast-' + Date.now(),
      asset.asset_id,
      asset.asset_type,
      asset.name,
      asset.location,
      asset.material,
      asset.installation_date || null,
      asset.operational_status || 'ACTIVE',
      new Date().toISOString()
    );
  }
};

export const inspectionDb = {
  create: (insp) => {
    return db.prepare(`
      INSERT INTO inspections (
        id, asset_id, asset_name, inspection_date, input_type, image_url, video_url,
        status, detected_category, overall_confidence, health_score, safety_factor,
        inspector_name, inspector_id, summary_observation, engineering_notice, is_demo_data, organization_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      insp.id,
      insp.asset_id,
      insp.asset_name,
      insp.inspection_date,
      insp.input_type || 'static_image',
      insp.image_url || null,
      insp.video_url || null,
      insp.status,
      insp.detected_category,
      insp.overall_confidence,
      insp.health_score ?? null,
      insp.safety_factor || null,
      insp.inspector_name || 'Inspector',
      insp.inspector_id || 'OFFICER-001',
      insp.summary_observation || '',
      insp.engineering_notice || '',
      insp.is_demo_data ? 1 : 0,
      insp.organization_id || 'org-inspectra-default',
      insp.created_at || new Date().toISOString()
    );
  },
  getById: (id, orgId) => {
    if (!id) return null;
    let query = 'SELECT * FROM inspections WHERE id = ?';
    const params = [id];
    if (orgId) {
      query += ' AND (organization_id = ? OR organization_id IS NULL)';
      params.push(orgId);
    }
    const inspection = db.prepare(query).get(...params);
    if (!inspection) return null;
    const defects = db.prepare('SELECT * FROM defects WHERE inspection_id = ?').all(id);
    const trace = db.prepare('SELECT * FROM audit_traces WHERE inspection_id = ?').get(id);
    return { ...inspection, defects, trace };
  },
  getByAssetId: (assetId, orgId) => {
    if (!assetId) return [];
    const asset = assetDb.getById(assetId);
    const targetId = asset ? asset.asset_id : assetId;
    let query = 'SELECT * FROM inspections WHERE asset_id = ?';
    const params = [targetId];
    if (orgId) {
      query += ' AND (organization_id = ? OR organization_id IS NULL)';
      params.push(orgId);
    }
    query += ' ORDER BY inspection_date DESC';
    return db.prepare(query).all(...params);
  },
  getAll: (orgId, limit = 50) => {
    let query = 'SELECT * FROM inspections';
    const params = [];
    if (orgId) {
      query += ' WHERE organization_id = ? OR organization_id IS NULL';
      params.push(orgId);
    }
    query += ' ORDER BY inspection_date DESC LIMIT ?';
    params.push(limit);
    return db.prepare(query).all(...params);
  }
};

export const defectDb = {
  createBatch: (inspectionId, defects) => {
    const stmt = db.prepare(`
      INSERT INTO defects (
        id, inspection_id, defect_type, name, confidence, severity,
        visual_evidence, limitations, color, icon, tag, bounding_box, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const d of defects) {
      stmt.run(
        d.id || 'def-' + Math.random().toString(36).substring(2, 9),
        inspectionId,
        d.type || d.defect_type || 'visual_anomaly',
        d.name,
        d.confidence,
        d.severity || 'MEDIUM',
        d.visualEvidence || d.visual_evidence || '',
        d.limitations || 'Physical dimensions require calibrated measurement.',
        d.color || 'attention',
        d.icon || '🟡',
        d.tag || 'Observation',
        d.boundingBox ? JSON.stringify(d.boundingBox) : null,
        new Date().toISOString()
      );
    }
  },
  getByInspectionId: (inspectionId) => {
    return db.prepare('SELECT * FROM defects WHERE inspection_id = ?').all(inspectionId);
  }
};

export const traceDb = {
  log: (trace) => {
    return db.prepare(`
      INSERT INTO audit_traces (
        id, inspection_id, asset_detected, defects_detected, confidence,
        retrieved_knowledge_ids, source_ids, rules_applied, final_recommendation, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      trace.id || 'tr-' + Date.now(),
      trace.inspection_id,
      trace.asset_detected,
      JSON.stringify(trace.defects_detected || []),
      trace.confidence,
      JSON.stringify(trace.retrieved_knowledge_ids || []),
      JSON.stringify(trace.source_ids || []),
      JSON.stringify(trace.rules_applied || []),
      trace.final_recommendation || '',
      new Date().toISOString()
    );
  },
  getByInspectionId: (inspectionId) => {
    return db.prepare('SELECT * FROM audit_traces WHERE inspection_id = ?').get(inspectionId);
  }
};

export const datasetDb = {
  getAll: () => db.prepare('SELECT * FROM public_datasets ORDER BY asset_type').all()
};

export const orgDb = {
  getById: (id) => db.prepare('SELECT * FROM organizations WHERE id = ?').get(id),
  getAll: () => db.prepare('SELECT * FROM organizations ORDER BY created_at DESC').all(),
  create: (org) => {
    const id = org.id || 'org-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    db.prepare(`
      INSERT INTO organizations (id, name, plan_tier, industry, pilot_started_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      org.name,
      org.plan_tier || 'FREE_PILOT',
      org.industry || 'General Industry',
      new Date().toISOString(),
      new Date().toISOString()
    );
    return orgDb.getById(id);
  },
  updatePlan: (id, planTier) => {
    db.prepare('UPDATE organizations SET plan_tier = ? WHERE id = ?').run(planTier, id);
    return orgDb.getById(id);
  }
};

export const orgMemberDb = {
  getByOrgId: (orgId) => db.prepare('SELECT * FROM organization_members WHERE organization_id = ? ORDER BY joined_at ASC').all(orgId),
  addMember: (member) => {
    const id = member.id || 'mem-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    db.prepare(`
      INSERT INTO organization_members (id, organization_id, user_id, name, email, role, status, joined_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      member.organization_id,
      member.user_id || 'USR-' + Date.now().toString(36).toUpperCase(),
      member.name,
      member.email || null,
      member.role || 'Inspector',
      member.status || 'ACTIVE',
      new Date().toISOString()
    );
    return db.prepare('SELECT * FROM organization_members WHERE id = ?').get(id);
  },
  removeMember: (id) => db.prepare('DELETE FROM organization_members WHERE id = ?').run(id)
};

export const leadDb = {
  create: (lead) => {
    const id = 'lead-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    db.prepare(`
      INSERT INTO enterprise_leads (
        id, name, work_email, company, industry, company_size,
        inspectors_count, expected_volume, requirements, message, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      lead.name,
      lead.work_email,
      lead.company,
      lead.industry || 'Infrastructure',
      lead.company_size || '50-200',
      lead.inspectors_count || '5-20',
      lead.expected_volume || '100-500/mo',
      lead.requirements || '',
      lead.message || '',
      'NEW',
      new Date().toISOString()
    );
    return db.prepare('SELECT * FROM enterprise_leads WHERE id = ?').get(id);
  },
  getAll: () => db.prepare('SELECT * FROM enterprise_leads ORDER BY created_at DESC').all(),
  getById: (id) => db.prepare('SELECT * FROM enterprise_leads WHERE id = ?').get(id),
  updateStatus: (id, status) => {
    db.prepare('UPDATE enterprise_leads SET status = ? WHERE id = ?').run(status, id);
    return leadDb.getById(id);
  }
};

export const usageDb = {
  logEvent: (orgId, eventType, performedBy = 'System', resourceId = null, metadata = {}) => {
    const id = 'log-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    return db.prepare(`
      INSERT INTO organization_usage_logs (id, organization_id, event_type, resource_id, performed_by, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      orgId || 'org-inspectra-default',
      eventType,
      resourceId,
      performedBy,
      JSON.stringify(metadata),
      new Date().toISOString()
    );
  },
  getMetrics: (orgId = 'org-inspectra-default') => {
    // Real counts directly from SQLite
    const totalInspections = db.prepare('SELECT COUNT(*) as c FROM inspections WHERE organization_id = ? OR organization_id IS NULL').get(orgId).c;
    const completedInspections = db.prepare(`SELECT COUNT(*) as c FROM inspections WHERE (organization_id = ? OR organization_id IS NULL) AND status != 'NOT_APPLICABLE'`).get(orgId).c;
    const reportsGenerated = db.prepare(`SELECT COUNT(*) as c FROM organization_usage_logs WHERE organization_id = ? AND event_type = 'REPORT_GENERATED'`).get(orgId).c;
    const aiAnalyses = db.prepare(`SELECT COUNT(*) as c FROM organization_usage_logs WHERE organization_id = ? AND event_type = 'AI_ANALYZED'`).get(orgId).c;
    const evidenceUploads = db.prepare(`SELECT COUNT(*) as c FROM inspections WHERE (organization_id = ? OR organization_id IS NULL) AND (image_url IS NOT NULL OR video_url IS NOT NULL)`).get(orgId).c;
    const activeMembers = db.prepare(`SELECT COUNT(*) as c FROM organization_members WHERE organization_id = ? AND status = 'ACTIVE'`).get(orgId).c;

    // Activity timeline over past days
    const recentActivity = db.prepare(`
      SELECT event_type, performed_by, resource_id, metadata, created_at 
      FROM organization_usage_logs 
      WHERE organization_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all(orgId);

    // Inspections over time (grouped by date)
    const inspectionTimeline = db.prepare(`
      SELECT substr(inspection_date, 1, 10) as day, COUNT(*) as count
      FROM inspections
      WHERE organization_id = ? OR organization_id IS NULL
      GROUP BY substr(inspection_date, 1, 10)
      ORDER BY day ASC
      LIMIT 14
    `).all(orgId);

    // Issue severity breakdown from real defects
    const severityBreakdown = db.prepare(`
      SELECT d.severity, COUNT(*) as count
      FROM defects d
      JOIN inspections i ON d.inspection_id = i.id
      WHERE i.organization_id = ? OR i.organization_id IS NULL
      GROUP BY d.severity
    `).all(orgId);

    return {
      totalInspections,
      completedInspections,
      reportsGenerated,
      aiAnalyses: Math.max(aiAnalyses, totalInspections),
      evidenceUploads: Math.max(evidenceUploads, totalInspections),
      activeMembers: Math.max(activeMembers, 1),
      recentActivity,
      inspectionTimeline,
      severityBreakdown
    };
  }
};


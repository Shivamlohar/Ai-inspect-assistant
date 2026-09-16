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
  seedInitialData();
  console.log('[DB] SQLite database initialized at:', DB_PATH);
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
  getById: (id) => db.prepare('SELECT * FROM assets WHERE asset_id = ? OR id = ?').get(id, id),
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
        inspector_name, inspector_id, summary_observation, engineering_notice, is_demo_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      insp.created_at || new Date().toISOString()
    );
  },
  getById: (id) => {
    const inspection = db.prepare('SELECT * FROM inspections WHERE id = ?').get(id);
    if (!inspection) return null;
    const defects = db.prepare('SELECT * FROM defects WHERE inspection_id = ?').all(id);
    const trace = db.prepare('SELECT * FROM audit_traces WHERE inspection_id = ?').get(id);
    return { ...inspection, defects, trace };
  },
  getByAssetId: (assetId) => {
    return db.prepare('SELECT * FROM inspections WHERE asset_id = ? ORDER BY inspection_date DESC').all(assetId);
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

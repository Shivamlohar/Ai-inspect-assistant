-- AI-Powered Real-Time Asset Inspection Assistant
-- Relational Schema for SQLite (node:sqlite)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  badge_number TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  asset_id TEXT UNIQUE NOT NULL,
  asset_type TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  material TEXT NOT NULL,
  installation_date TEXT,
  operational_status TEXT DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inspections (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  inspection_date TEXT NOT NULL,
  input_type TEXT NOT NULL, -- 'static_image', 'video', 'camera'
  image_url TEXT,
  video_url TEXT,
  status TEXT NOT NULL, -- 'SUPPORTED', 'NOT_SUPPORTED', 'MANUAL_VERIFICATION_REQUIRED'
  detected_category TEXT NOT NULL,
  overall_confidence REAL NOT NULL,
  health_score REAL,
  safety_factor TEXT,
  inspector_name TEXT,
  inspector_id TEXT,
  summary_observation TEXT,
  engineering_notice TEXT,
  is_demo_data INTEGER DEFAULT 0,
  organization_id TEXT DEFAULT 'org-inspectra-default',
  created_at TEXT NOT NULL,
  FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
);

CREATE TABLE IF NOT EXISTS defects (
  id TEXT PRIMARY KEY,
  inspection_id TEXT NOT NULL,
  defect_type TEXT NOT NULL,
  name TEXT NOT NULL,
  confidence REAL NOT NULL,
  severity TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH'
  visual_evidence TEXT NOT NULL,
  limitations TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  tag TEXT,
  bounding_box TEXT, -- JSON {x, y, width, height}
  created_at TEXT NOT NULL,
  FOREIGN KEY (inspection_id) REFERENCES inspections(id)
);

CREATE TABLE IF NOT EXISTS knowledge_sources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source_name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'GOVERNMENT_STANDARD', 'STATUTORY_CODE', 'RESEARCH_PAPER', 'PUBLIC_DOC'
  topic TEXT NOT NULL,
  asset_types TEXT NOT NULL, -- JSON array of supported asset types
  retrieved_at TEXT NOT NULL,
  document_date TEXT,
  reliability_level TEXT NOT NULL, -- 'HIGH', 'VERY_HIGH', 'MEDIUM'
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  defect_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding_vector TEXT NOT NULL, -- JSON array of normalized float weights
  metadata TEXT NOT NULL, -- JSON object with full citation information
  created_at TEXT NOT NULL,
  FOREIGN KEY (source_id) REFERENCES knowledge_sources(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS maintenance_records (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  inspection_id TEXT,
  action TEXT NOT NULL,
  status TEXT NOT NULL, -- 'PENDING_REVIEW', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'
  date TEXT NOT NULL,
  assigned_to TEXT,
  notes TEXT,
  FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
  FOREIGN KEY (inspection_id) REFERENCES inspections(id)
);

CREATE TABLE IF NOT EXISTS sensor_data (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  sensor_type TEXT NOT NULL, -- 'vibration', 'temperature', 'humidity', 'ultrasonic_thickness', 'pressure'
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  source TEXT NOT NULL,
  calibration_status TEXT NOT NULL, -- 'CALIBRATED', 'UNCALIBRATED', 'PENDING'
  FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
);

CREATE TABLE IF NOT EXISTS public_datasets (
  id TEXT PRIMARY KEY,
  dataset_name TEXT NOT NULL,
  source TEXT NOT NULL,
  license TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  defect_classes TEXT NOT NULL,
  number_of_images INTEGER NOT NULL,
  training_usage TEXT NOT NULL,
  validation_usage TEXT NOT NULL,
  access_url TEXT
);

CREATE TABLE IF NOT EXISTS audit_traces (
  id TEXT PRIMARY KEY,
  inspection_id TEXT NOT NULL,
  asset_detected TEXT NOT NULL,
  defects_detected TEXT NOT NULL, -- JSON array
  confidence REAL NOT NULL,
  retrieved_knowledge_ids TEXT NOT NULL, -- JSON array
  source_ids TEXT NOT NULL, -- JSON array
  rules_applied TEXT NOT NULL, -- JSON array
  final_recommendation TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (inspection_id) REFERENCES inspections(id)
);

-- =========================================================================
-- Business Model: Free Pilot, Organizations, Usage Tracking & Enterprise Leads
-- =========================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan_tier TEXT DEFAULT 'FREE_PILOT', -- 'FREE_PILOT', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'
  industry TEXT,
  pilot_started_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organization_members (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL, -- 'Owner', 'Admin', 'Lead Inspector', 'Field Engineer'
  status TEXT DEFAULT 'ACTIVE',
  joined_at TEXT NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enterprise_leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  company TEXT NOT NULL,
  industry TEXT NOT NULL,
  company_size TEXT NOT NULL,
  inspectors_count TEXT NOT NULL,
  expected_volume TEXT NOT NULL,
  requirements TEXT,
  message TEXT,
  status TEXT DEFAULT 'NEW', -- 'NEW', 'CONTACTED', 'PILOT_SCHEDULED', 'DEMO_COMPLETED'
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organization_usage_logs (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'INSPECTION_CREATED', 'AI_ANALYZED', 'REPORT_GENERATED', 'EVIDENCE_UPLOADED', 'MEMBER_ADDED'
  resource_id TEXT,
  performed_by TEXT,
  metadata TEXT, -- JSON
  created_at TEXT NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

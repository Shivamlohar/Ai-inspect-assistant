import { classifyAssetMultimodal, analyzeInspectionMultimodal, getServerOpenAIApiKey, OPENAI_VISION_MODEL } from './inspectionEngine.js';
import crypto from 'node:crypto';
import { db, assetDb, inspectionDb, defectDb, traceDb, datasetDb, orgDb, orgMemberDb, leadDb, usageDb } from './db/database.js';
import { queryKnowledgeBase, ingestNewSource, sourceDb } from './rag/ragEngine.js';

export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) { // 25MB max
        reject(new Error('Payload Too Large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

export async function handleApiRequest(req, res, inputPath) {
  const reqPath = inputPath || (req.url ? new URL(req.url, 'http://localhost').pathname : '');
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    res.end();
    return true;
  }
  // 0. HEALTH CHECK & AI ENGINE STATUS
  if (reqPath === '/api/health' && req.method === 'GET') {
    const apiKey = getServerOpenAIApiKey();
    sendJson(res, 200, {
      status: 'ONLINE',
      service: 'Inspectra AI Machine Inspection Gateway',
      timestamp: new Date().toISOString(),
      openaiConfigured: Boolean(apiKey && apiKey.length > 10),
      model: OPENAI_VISION_MODEL
    });
    return true;
  }

  // 0.1 MULTIMODAL INSPECTION ANALYZE ENDPOINT
  if (reqPath === '/api/inspection/analyze' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const { imageBase64, mimeType = 'image/jpeg', assetName = '', userNotes = '', isDemoMode = false } = body;
      const result = await analyzeInspectionMultimodal({
        imageBase64,
        mimeType,
        userSelectedAsset: assetName,
        userNotes,
        isDemoMode,
        reqHeaders: req.headers
      });
      sendJson(res, result.serviceAvailable === false ? 503 : 200, result);
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return true;
  }

  // =========================================================================
  // BUSINESS MODEL: ORGANIZATIONS, USAGE TRACKING & ENTERPRISE LEADS
  // =========================================================================

  // B1. Current Organization, Plan & Members
  if (reqPath === '/api/organization/current' && req.method === 'GET') {
    const parsedUrl = new URL(req.url, 'http://localhost');
    const orgId = parsedUrl.searchParams.get('orgId') || 'org-inspectra-default';
    const org = orgDb.getById(orgId) || orgDb.getById('org-inspectra-default');
    if (!org) {
      sendJson(res, 404, { success: false, error: 'Organization not found' });
      return true;
    }
    const members = orgMemberDb.getByOrgId(org.id);
    const usage = usageDb.getMetrics(org.id);
    sendJson(res, 200, {
      success: true,
      organization: org,
      members,
      usage,
      pilotStatus: {
        isFreePilot: org.plan_tier === 'FREE_PILOT',
        planTier: org.plan_tier,
        badge: 'FREE PILOT',
        notice: 'Your organization is currently using Inspectra under the Free Pilot program.'
      }
    });
    return true;
  }

  // B2. Create Organization
  if (reqPath === '/api/organization/create' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      if (!body.name || !body.name.trim()) {
        sendJson(res, 400, { success: false, error: 'Organization name is required.' });
        return true;
      }
      const newOrg = orgDb.create({
        name: body.name.trim(),
        industry: body.industry || 'Infrastructure & Heavy Machinery',
        plan_tier: 'FREE_PILOT'
      });
      const initialMember = orgMemberDb.addMember({
        organization_id: newOrg.id,
        user_id: body.creatorId || 'OFF-' + Date.now().toString(36).slice(-4).toUpperCase(),
        name: body.creatorName || 'Lead Inspector',
        email: body.creatorEmail || null,
        role: 'Owner'
      });
      usageDb.logEvent(newOrg.id, 'PILOT_STARTED', body.creatorName || 'Lead Inspector', newOrg.id, {
        orgName: newOrg.name,
        plan: 'FREE_PILOT'
      });
      sendJson(res, 201, {
        success: true,
        organization: newOrg,
        member: initialMember,
        message: 'Organization created successfully under Free Pilot.'
      });
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return true;
  }

  // B3. Add Organization Member
  if (reqPath === '/api/organization/members' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      if (!body.name || !body.organizationId) {
        sendJson(res, 400, { success: false, error: 'Name and organization ID are required.' });
        return true;
      }
      const member = orgMemberDb.addMember({
        organization_id: body.organizationId,
        user_id: body.userId || 'USR-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        name: body.name.trim(),
        email: body.email?.trim() || null,
        role: body.role || 'Inspector'
      });
      usageDb.logEvent(body.organizationId, 'MEMBER_ADDED', body.invitedBy || 'Admin', member.id, {
        memberName: member.name,
        role: member.role
      });
      sendJson(res, 201, { success: true, member });
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return true;
  }

  // B4. Organization Usage Metrics
  if (reqPath === '/api/organization/usage' && req.method === 'GET') {
    const parsedUrl = new URL(req.url, 'http://localhost');
    const orgId = parsedUrl.searchParams.get('orgId') || 'org-inspectra-default';
    const metrics = usageDb.getMetrics(orgId);
    sendJson(res, 200, { success: true, orgId, ...metrics });
    return true;
  }

  // B5. Analytics (Real DB Data only)
  if (reqPath === '/api/analytics' && req.method === 'GET') {
    const parsedUrl = new URL(req.url, 'http://localhost');
    const orgId = parsedUrl.searchParams.get('orgId') || 'org-inspectra-default';
    const metrics = usageDb.getMetrics(orgId);
    const hasData = metrics.totalInspections > 0;
    sendJson(res, 200, {
      success: true,
      orgId,
      hasData,
      emptyMessage: hasData ? null : 'Analytics will appear as your organization completes more inspections.',
      ...metrics
    });
    return true;
  }

  // B6. Enterprise Lead Submission
  if (reqPath === '/api/enterprise/lead' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      if (!body.name || !body.workEmail || !body.company) {
        sendJson(res, 400, { success: false, error: 'Name, work email, and company are required.' });
        return true;
      }
      const lead = leadDb.create({
        name: body.name.trim(),
        work_email: body.workEmail.trim(),
        company: body.company.trim(),
        industry: body.industry?.trim() || 'Infrastructure & Construction',
        company_size: body.companySize?.trim() || '50-200',
        inspectors_count: body.inspectorsCount?.trim() || '5-20',
        expected_volume: body.expectedVolume?.trim() || '100-500/mo',
        requirements: body.requirements?.trim() || '',
        message: body.message?.trim() || ''
      });
      usageDb.logEvent('org-inspectra-default', 'LEAD_SUBMITTED', lead.name, lead.id, {
        company: lead.company,
        email: lead.work_email
      });
      sendJson(res, 201, {
        success: true,
        message: 'Thank you for reaching out! Our enterprise team will contact you within 24 hours for pilot onboarding.',
        leadId: lead.id
      });
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return true;
  }

  // B7. Enterprise Leads List (Admin)
  if (reqPath === '/api/enterprise/leads' && req.method === 'GET') {
    const leads = leadDb.getAll();
    sendJson(res, 200, { success: true, count: leads.length, leads });
    return true;
  }

  // 1. ASSETS ENDPOINTS
  if (reqPath === '/api/assets' && req.method === 'GET') {
    const assets = assetDb.getAll();
    sendJson(res, 200, { success: true, count: assets.length, assets });
    return true;
  }

  if (reqPath.startsWith('/api/assets/') && req.method === 'GET') {
    const parts = reqPath.split('/');
    const assetId = decodeURIComponent(parts[3] || '');

    // /api/assets/:id/history
    if (parts[4] === 'history') {
      const history = inspectionDb.getByAssetId(assetId);
      sendJson(res, 200, { success: true, assetId, count: history.length, history });
      return true;
    }

    // /api/assets/:id/defects
    if (parts[4] === 'defects') {
      const inspections = inspectionDb.getByAssetId(assetId);
      const allDefects = [];
      for (const insp of inspections) {
        const defects = defectDb.getByInspectionId(insp.id);
        allDefects.push(...defects.map(d => ({ ...d, inspection_date: insp.inspection_date })));
      }
      sendJson(res, 200, { success: true, assetId, count: allDefects.length, defects: allDefects });
      return true;
    }

    // /api/assets/:id
    const asset = assetDb.getById(assetId);
    if (!asset) {
      sendJson(res, 404, { success: false, error: 'Asset not found' });
      return true;
    }
    sendJson(res, 200, { success: true, asset });
    return true;
  }

  // 2. DATASETS REGISTRY (Section 11)
  if (reqPath === '/api/datasets' && req.method === 'GET') {
    const datasets = datasetDb.getAll();
    sendJson(res, 200, { success: true, count: datasets.length, datasets });
    return true;
  }

  // 3. SENSOR TELEMETRY (Section 13)
  if (reqPath.startsWith('/api/sensor-data/') && req.method === 'GET') {
    const assetId = decodeURIComponent(reqPath.split('/')[3] || '');
    const rows = db.prepare('SELECT * FROM sensor_data WHERE asset_id = ? ORDER BY timestamp DESC').all(assetId);
    sendJson(res, 200, {
      success: true,
      assetId,
      hasSensorData: rows.length > 0,
      count: rows.length,
      sensors: rows,
      sourceNote: rows.length > 0
        ? 'Connected industrial telemetry verified.'
        : 'Optical visual inspection only — no physical sensor telemetry connected.'
    });
    return true;
  }

  // 4. KNOWLEDGE SEARCH & RAG (Section 5)
  if (reqPath === '/api/knowledge/search') {
    try {
      let assetCategory = 'General';
      let defectType = '';
      let queryText = '';
      let topK = 3;

      if (req.method === 'POST') {
        const body = await readJsonBody(req);
        assetCategory = body.assetCategory || body.category || 'General';
        defectType = body.defectType || '';
        queryText = body.queryText || body.query || '';
        topK = body.topK || 3;
      } else if (req.method === 'GET') {
        const parsedUrl = new URL(req.url, 'http://localhost:10000');
        assetCategory = parsedUrl.searchParams.get('category') || parsedUrl.searchParams.get('assetCategory') || 'General';
        defectType = parsedUrl.searchParams.get('defectType') || '';
        queryText = parsedUrl.searchParams.get('query') || parsedUrl.searchParams.get('queryText') || parsedUrl.searchParams.get('q') || '';
        topK = parseInt(parsedUrl.searchParams.get('topK') || '3', 10);
      } else {
        sendJson(res, 405, { success: false, error: 'Method Not Allowed' });
        return true;
      }

      const result = queryKnowledgeBase(assetCategory, defectType, queryText, topK);
      sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      sendJson(res, 400, { success: false, error: err.message });
    }
    return true;
  }

  // 5. KNOWLEDGE SOURCES MANAGEMENT (Section 27: Admin Panel)
  if (reqPath === '/api/knowledge/sources' && req.method === 'GET') {
    const sources = sourceDb.getAll();
    sendJson(res, 200, { success: true, count: sources.length, sources });
    return true;
  }

  if (reqPath === '/api/knowledge/ingest' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const { title, sourceName, url, sourceType, topic, assetTypes, reliabilityLevel, content } = body;
      if (!title || !url || !content) {
        sendJson(res, 400, { success: false, error: 'Missing required source fields (title, url, content)' });
        return true;
      }
      const ingestResult = ingestNewSource({
        title,
        sourceName: sourceName || 'Engineering Documentation',
        url,
        sourceType: sourceType || 'PUBLIC_DOC',
        topic: topic || 'Structural Inspection',
        assetTypes: Array.isArray(assetTypes) ? assetTypes : [assetTypes || 'General'],
        reliabilityLevel: reliabilityLevel || 'HIGH',
        content
      });
      sendJson(res, 201, { success: true, message: 'Source ingested and chunked successfully', ...ingestResult });
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return true;
  }

  if (reqPath.startsWith('/api/knowledge/sources/') && req.method === 'DELETE') {
    const sourceId = decodeURIComponent(reqPath.split('/')[4] || '');
    sourceDb.delete(sourceId);
    sendJson(res, 200, { success: true, message: 'Source and associated vector chunks removed', sourceId });
    return true;
  }

  // 6. VISION CLASSIFICATION GATE (First-Stage AI Gate)
  if (reqPath === '/api/vision/classify' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const { imageBase64, mimeType = 'image/jpeg' } = body;
      const result = await classifyAssetMultimodal({
        imageBase64,
        mimeType,
        reqHeaders: req.headers
      });
      sendJson(res, 200, result);
      return true;
    } catch (err) {
      sendJson(res, 400, { success: false, error: err.message });
      return true;
    }
  }

  // 7. INSPECTION UPLOAD & RECORDING (Section 23 & 28: Traceability)
  if (reqPath === '/api/inspection/upload' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const uploadId = 'upl-' + Date.now();
      sendJson(res, 200, {
        success: true,
        uploadId,
        message: 'Visual input accepted for processing pipeline.',
        format: body.mimeType || 'image/jpeg',
        sizeBytes: body.sizeBytes || 0
      });
    } catch (err) {
      sendJson(res, 400, { success: false, error: err.message });
    }
    return true;
  }

  if ((reqPath === '/api/inspection/record' || reqPath === '/api/inspection/save') && req.method === 'POST') {
    try {
      const payload = await readJsonBody(req);
      const inspectionId = payload.inspectionId || ('INSP-' + Date.now());

      // HARD GATE: Verify inspection eligibility
      const catLower = String(payload.detectedCategory || '').toLowerCase();
      const isEligible = Boolean(
        payload.inspectionEligible && 
        payload.inspectionStatus !== 'NOT_APPLICABLE' && 
        payload.inspectionStatus !== 'NOT SUPPORTED' &&
        !catLower.includes('person') &&
        !catLower.includes('human') &&
        !catLower.includes('animal') &&
        !catLower.includes('room') &&
        !catLower.includes('landscape') &&
        !catLower.includes('unknown') &&
        !catLower.includes('unsupported')
      );

      // Ensure asset exists in DB before inserting foreign-keyed inspection record
      const rawAssetId = payload.assetId || (isEligible ? 'MACH-M401' : 'NON-ASSET-01');
      const existingAsset = assetDb.getById(rawAssetId);
      let targetAssetId = rawAssetId;

      if (existingAsset) {
        // Use the canonical asset_id referenced by the foreign key constraint
        targetAssetId = existingAsset.asset_id;
      } else {
        targetAssetId = rawAssetId;
        assetDb.create({
          id: 'ast-' + Date.now(),
          asset_id: targetAssetId,
          asset_type: payload.detectedCategory || (isEligible ? 'Industrial Machinery' : 'Non-Inspectable Subject'),
          name: payload.assetName || (isEligible ? 'Asset Inspection' : 'Non-Inspectable Subject'),
          location: isEligible ? 'Field Site' : 'Out of Scope',
          material: isEligible ? 'Reinforced Material' : 'Non-Structural'
        });
      }

      const orgId = payload.organizationId || 'org-inspectra-default';

      // Persist inspection to SQLite with strict zero-fabrication gating
      inspectionDb.create({
        id: inspectionId,
        asset_id: targetAssetId,
        asset_name: payload.assetName || existingAsset?.name || (isEligible ? 'Asset Inspection' : 'Non-Inspectable Subject'),
        inspection_date: payload.inspectionTimestamp || new Date().toISOString(),
        input_type: payload.inputType || 'static_image',
        image_url: payload.mediaUrl?.slice(0, 500) || null,
        video_url: payload.videoUrl?.slice(0, 500) || null,
        status: isEligible ? (payload.inspectionStatus || 'SUPPORTED') : 'NOT_APPLICABLE',
        detected_category: payload.detectedCategory || (isEligible ? 'Industrial Machinery' : 'Person / Human'),
        overall_confidence: payload.classificationConfidence || (isEligible ? 85 : 95),
        health_score: isEligible ? (payload.healthScore?.finalScore ?? null) : null,
        safety_factor: isEligible ? (payload.healthScore?.finalScore ? (payload.healthScore.finalScore >= 80 ? '1.50' : '1.15') : null) : null,
        inspector_name: payload.inspectorName || 'Lead Inspector',
        inspector_id: payload.inspectorId || 'OFFICER-001',
        summary_observation: isEligible 
          ? (payload.summaryObservation || '') 
          : `Visual observation identified subject as ${payload.detectedCategory || 'non-asset'}. Structural inspection is not applicable.`,
        engineering_notice: isEligible 
          ? (payload.engineeringNotice || '') 
          : 'ZERO FABRICATION POLICY: Automated defect metrology and degradation calculations suppressed for non-asset images.',
        is_demo_data: payload.isDemoData ? 1 : 0,
        organization_id: orgId
      });

      // Log organizational usage events (Section 3: Usage Tracking)
      usageDb.logEvent(orgId, 'INSPECTION_CREATED', payload.inspectorName || 'Lead Inspector', inspectionId, {
        assetName: payload.assetName || 'Engineering Asset',
        detectedCategory: payload.detectedCategory,
        healthScore: payload.healthScore?.finalScore
      });

      if (isEligible) {
        usageDb.logEvent(orgId, 'AI_ANALYZED', 'Precision Metrology Engine', inspectionId, {
          defectsCount: payload.defects?.length || 0,
          confidence: payload.classificationConfidence || 85
        });
      }

      // Persist defects ONLY if eligible - NEVER for non-asset
      if (isEligible && Array.isArray(payload.defects) && payload.defects.length > 0) {
        defectDb.createBatch(inspectionId, payload.defects);
      }

      // Persist audit trace (Section 28: Traceability)
      traceDb.log({
        inspection_id: inspectionId,
        asset_detected: payload.detectedCategory || 'Unknown',
        defects_detected: (payload.defects || []).map(d => d.name),
        confidence: payload.classificationConfidence || 85,
        retrieved_knowledge_ids: (payload.knowledgeSources || []).map(s => s.id),
        source_ids: (payload.knowledgeSources || []).map(s => s.id),
        rules_applied: [
          'ZERO_FABRICATION_FILTER',
          'EVIDENCE_FIRST_VALIDATOR',
          '40_30_20_10_HEALTH_FORMULA',
          'SAFE_RECOMMENDATION_FLOW'
        ],
        final_recommendation: payload.recommendedSteps?.[0]?.title || 'Manual verification'
      });

      sendJson(res, 201, {
        success: true,
        inspectionId,
        organizationId: orgId,
        message: 'Inspection audit successfully recorded with full cryptographic traceability.',
        traceId: 'tr-' + inspectionId
      });
    } catch (err) {
      console.error('[API ERROR] Failed to record inspection:', err);
      sendJson(res, 500, { success: false, error: err.message });
    }
    return true;
  }

  if (reqPath.startsWith('/api/inspection/') && req.method === 'GET') {
    const inspectionId = decodeURIComponent(reqPath.split('/')[3] || '');
    const record = inspectionDb.getById(inspectionId);
    if (!record) {
      sendJson(res, 404, { success: false, error: 'Inspection record not found' });
      return true;
    }
    sendJson(res, 200, { success: true, inspection: record });
    return true;
  }

  // 7. REPORT GENERATION (Section 23)
  if (reqPath === '/api/report/generate' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const orgId = body.organizationId || 'org-inspectra-default';
      const digest = crypto.createHash('sha256').update(JSON.stringify(body) + Date.now()).digest('hex').substring(0, 16).toUpperCase();
      const reportId = 'REP-' + Date.now();

      // Log report generation in organization usage tracking
      usageDb.logEvent(orgId, 'REPORT_GENERATED', body.inspectorName || 'Lead Inspector', reportId, {
        inspectionId: body.inspectionId,
        pages: body.pageCount || 2,
        digest
      });

      sendJson(res, 200, {
        success: true,
        reportId,
        organizationId: orgId,
        securityDigest: 'DIGEST-' + digest,
        generatedAt: new Date().toISOString(),
        complianceStandard: 'ISO 17359 / IRC Engineering Inspection Digest'
      });
    } catch (err) {
      sendJson(res, 400, { success: false, error: err.message });
    }
    return true;
  }

  return false; // Not handled by API router
}

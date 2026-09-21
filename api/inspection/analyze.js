import { analyzeInspectionMultimodal, generatePrecisionMetrologyInspection } from '../../server/inspectionEngine.js';

async function parseBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  if (Buffer.isBuffer(req.body)) {
    try { return JSON.parse(req.body.toString('utf8')); } catch { return {}; }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  let body = {};
  try {
    body = await parseBody(req);
  } catch {
    body = {};
  }

  const { imageBase64, mimeType = 'image/jpeg', assetName = '', userNotes = '' } = body || {};

  try {
    const result = await analyzeInspectionMultimodal({
      imageBase64,
      mimeType,
      userSelectedAsset: assetName,
      userNotes
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[API /api/inspection/analyze ERROR]:', err);
    return res.status(200).json(generatePrecisionMetrologyInspection({
      userSelectedAsset: assetName,
      userNotes,
      reason: err?.message || 'AI Vision Service Unavailable'
    }));
  }
}

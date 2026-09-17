import { analyzeInspectionMultimodal } from '../../server/inspectionEngine.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-key');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { imageBase64, mimeType = 'image/jpeg', assetName, userNotes, isDemoMode } = body;

    const result = await analyzeInspectionMultimodal({
      imageBase64,
      mimeType,
      userSelectedAsset: assetName,
      userNotes,
      isDemoMode,
      reqHeaders: req.headers
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[VERCEL API /api/inspection/analyze ERROR]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

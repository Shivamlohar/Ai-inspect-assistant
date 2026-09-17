import { getServerGeminiApiKey, GEMINI_VISION_MODEL } from '../server/inspectionEngine.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const apiKey = getServerGeminiApiKey(req.headers);
  const isConfigured = Boolean(apiKey && apiKey.length > 10);

  return res.status(200).json({
    status: 'ONLINE',
    service: 'Inspectra AI Inspection Gateway',
    timestamp: new Date().toISOString(),
    geminiConfigured: isConfigured,
    model: GEMINI_VISION_MODEL,
    environment: process.env.VERCEL ? 'Vercel Serverless' : 'Node Server'
  });
}

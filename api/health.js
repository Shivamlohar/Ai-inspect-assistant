import { getServerOpenAIApiKey, OPENAI_VISION_MODEL } from '../server/inspectionEngine.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const apiKey = getServerOpenAIApiKey(req.headers);
  const isConfigured = Boolean(apiKey && apiKey.length > 10);

  return res.status(200).json({
    status: 'ONLINE',
    service: 'Inspectra AI Machine Inspection Gateway',
    timestamp: new Date().toISOString(),
    openaiConfigured: isConfigured,
    geminiConfigured: isConfigured,
    model: OPENAI_VISION_MODEL,
    environment: process.env.VERCEL ? 'Vercel Serverless' : 'Node Server'
  });
}

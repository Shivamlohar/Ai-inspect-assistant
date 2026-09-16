import { db } from '../db/database.js';

/**
 * Lightweight deterministic embedding vector generator (32-dimensional semantic frequency projection)
 * Produces normalized float vectors suitable for high-speed cosine similarity without external heavy libraries.
 */
export function computeEmbedding(text) {
  if (!text || typeof text !== 'string') return new Array(32).fill(0);
  
  const tokens = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  const vector = new Array(32).fill(0);
  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash << 5) - hash + token.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % 32;
    vector[idx] += 1;
  }

  // L2 Normalize
  let sumSq = 0;
  for (let i = 0; i < 32; i++) sumSq += vector[i] * vector[i];
  const mag = Math.sqrt(sumSq) || 1;
  return vector.map(v => parseFloat((v / mag).toFixed(5)));
}

/**
 * Calculates Cosine Similarity between two normalized vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) return 0;
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dot));
}

/**
 * Queries the Knowledge Base for authoritative technical guidance using RAG vector similarity
 */
export function queryKnowledgeBase(assetCategory, defectType = '', queryText = '', topK = 3) {
  const allChunks = db.prepare(`
    SELECT c.*, s.title as source_title, s.source_name, s.url, s.source_type, s.reliability_level
    FROM knowledge_chunks c
    JOIN knowledge_sources s ON c.source_id = s.id
    WHERE s.is_active = 1
  `).all();

  if (allChunks.length === 0) {
    return {
      hasSources: false,
      retrievedChunks: [],
      sources: []
    };
  }

  const queryCombined = `${assetCategory} ${defectType} ${queryText}`.trim();
  const queryVec = computeEmbedding(queryCombined);

  const scored = allChunks.map(chunk => {
    let chunkVec;
    try {
      chunkVec = JSON.parse(chunk.embedding_vector);
    } catch {
      chunkVec = computeEmbedding(chunk.content);
    }

    let sim = cosineSimilarity(queryVec, chunkVec);

    // Metadata keyword boost if matching asset category or defect type
    if (assetCategory && chunk.asset_type.toLowerCase() === assetCategory.toLowerCase()) {
      sim += 0.20;
    }
    if (defectType && chunk.defect_type.toLowerCase().includes(defectType.toLowerCase())) {
      sim += 0.25;
    }

    return {
      id: chunk.id,
      sourceId: chunk.source_id,
      title: chunk.title,
      assetType: chunk.asset_type,
      defectType: chunk.defect_type,
      content: chunk.content,
      similarityScore: parseFloat(Math.min(1.0, sim).toFixed(4)),
      source: {
        id: chunk.source_id,
        title: chunk.source_title,
        sourceName: chunk.source_name,
        url: chunk.url,
        sourceType: chunk.source_type,
        reliabilityLevel: chunk.reliability_level
      }
    };
  });

  // Sort descending by similarity score
  scored.sort((a, b) => b.similarityScore - a.similarityScore);

  // Minimum relevance threshold (0.45) ensures out-of-scope queries do not return fake citations
  const RELEVANCE_THRESHOLD = 0.45;
  const filteredChunks = scored.filter(c => c.similarityScore >= RELEVANCE_THRESHOLD);
  const topChunks = filteredChunks.slice(0, topK);

  if (topChunks.length === 0) {
    return {
      hasSources: false,
      retrievedChunks: [],
      sources: []
    };
  }

  // Extract unique sources
  const sourceMap = new Map();
  for (const c of topChunks) {
    if (!sourceMap.has(c.source.id)) {
      sourceMap.set(c.source.id, c.source);
    }
  }

  return {
    hasSources: true,
    retrievedChunks: topChunks,
    sources: Array.from(sourceMap.values())
  };
}

/**
 * Ingests a new document/source into the Knowledge Base
 */
export function ingestNewSource({
  title,
  sourceName,
  url,
  sourceType = 'PUBLIC_DOC',
  topic,
  assetTypes = [],
  documentDate = new Date().toISOString().split('T')[0],
  reliabilityLevel = 'HIGH',
  content = ''
}) {
  const sourceId = 'src-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

  db.prepare(`
    INSERT INTO knowledge_sources (
      id, title, source_name, url, source_type, topic, asset_types, retrieved_at, document_date, reliability_level, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
    sourceId,
    title,
    sourceName,
    url,
    sourceType,
    topic,
    JSON.stringify(assetTypes),
    new Date().toISOString(),
    documentDate,
    reliabilityLevel
  );

  // Split into chunks of ~100-200 words
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 20);
  const chunks = [];

  const insertChunk = db.prepare(`
    INSERT INTO knowledge_chunks (
      id, source_id, asset_type, defect_type, title, content, embedding_vector, metadata, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    const chunkId = `${sourceId}-chk-${i + 1}`;
    const primaryAsset = assetTypes[0] || 'General Infrastructure';
    const embedding = computeEmbedding(p);

    insertChunk.run(
      chunkId,
      sourceId,
      primaryAsset,
      topic,
      `${title} (Section ${i + 1})`,
      p,
      JSON.stringify(embedding),
      JSON.stringify({ sourceId, title, url, chunkIndex: i + 1 }),
      new Date().toISOString()
    );

    chunks.push({ id: chunkId, title: `${title} (Section ${i + 1})`, content: p });
  }

  return { sourceId, chunksCreated: chunks.length };
}

export const sourceDb = {
  getAll: () => db.prepare(`
    SELECT s.*, COUNT(c.id) as chunk_count
    FROM knowledge_sources s
    LEFT JOIN knowledge_chunks c ON s.id = c.source_id
    GROUP BY s.id
    ORDER BY s.retrieved_at DESC
  `).all(),
  getById: (id) => db.prepare('SELECT * FROM knowledge_sources WHERE id = ?').get(id),
  delete: (id) => {
    db.prepare('DELETE FROM knowledge_chunks WHERE source_id = ?').run(id);
    return db.prepare('DELETE FROM knowledge_sources WHERE id = ?').run(id);
  }
};

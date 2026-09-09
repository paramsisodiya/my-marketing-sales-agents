import { KnowledgeService } from '../core/knowledge/knowledge.service';

function sendJson(res: any, status: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const knowledgeService = new KnowledgeService();
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const slug = (req.query && req.query.slug) || urlObj.searchParams.get('slug');

  if (req.method === 'GET') {
    if (slug) {
      const doc = knowledgeService.getDocument(slug);
      if (!doc) return sendJson(res, 404, { success: false, error: `Document ${slug} not found` });
      return sendJson(res, 200, { success: true, document: doc });
    }
    const documents = knowledgeService.getAllDocuments();
    return sendJson(res, 200, { success: true, documents, count: documents.length });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const targetSlug = slug || body.slug;
      const { content } = body;

      if (!targetSlug || content === undefined) {
        return sendJson(res, 400, { success: false, error: 'slug and content are required' });
      }

      const updated = knowledgeService.updateDocument(targetSlug, content);
      return sendJson(res, 200, { success: true, document: updated });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to update document' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

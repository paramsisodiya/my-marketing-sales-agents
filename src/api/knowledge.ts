import { KnowledgeService } from '../core/knowledge/knowledge.service';
import { LoggerService } from '../core/observability/logger.service';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const knowledgeService = new KnowledgeService();
  const logger = LoggerService.getInstance();

  if (req.method === 'GET') {
    try {
      const slug = req.query?.slug as string;
      if (slug) {
        const doc = knowledgeService.getBySlug(slug);
        if (!doc) return sendJson(res, 404, { success: false, error: 'Document not found' });
        return sendJson(res, 200, { success: true, document: doc });
      }
      const docs = knowledgeService.getAll();
      return sendJson(res, 200, { success: true, documents: docs });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const slug = (req.query?.slug || req.body?.slug) as string;
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      body = body || {};
      const { content } = body;

      if (!slug || !content) {
        return sendJson(res, 400, { success: false, error: 'Slug and content required' });
      }

      const saved = knowledgeService.saveDocument(slug, content);
      logger.info(`Knowledge document updated: ${saved.title}`);
      return sendJson(res, 200, { success: true, document: saved });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

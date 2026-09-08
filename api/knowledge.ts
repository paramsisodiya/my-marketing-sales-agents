import { KnowledgeService } from '../src/core/knowledge/knowledge.service';
import { LoggerService } from '../src/core/observability/logger.service';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const knowledgeService = new KnowledgeService();
  const logger = LoggerService.getInstance();

  if (req.method === 'GET') {
    try {
      const slug = req.query?.slug as string;
      if (slug) {
        const doc = knowledgeService.getBySlug(slug);
        if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });
        return res.status(200).json({ success: true, document: doc });
      }
      const docs = knowledgeService.getAll();
      return res.status(200).json({ success: true, documents: docs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const slug = (req.query?.slug || req.body?.slug) as string;
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { content } = body;

      if (!slug || !content) {
        return res.status(400).json({ success: false, error: 'Slug and content required' });
      }

      const saved = knowledgeService.saveDocument(slug, content);
      logger.info(`Knowledge document updated: ${saved.title}`);
      return res.status(200).json({ success: true, document: saved });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

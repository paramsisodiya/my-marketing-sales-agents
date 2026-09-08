import { DatabaseService } from '../src/core/database/db.service';
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

  const db = DatabaseService.getInstance();
  const logger = LoggerService.getInstance();

  if (req.method === 'GET') {
    try {
      const filter: any = {};
      if (req.query?.industry) filter.industry = String(req.query.industry);
      if (req.query?.qualificationStatus) filter.qualificationStatus = String(req.query.qualificationStatus);
      if (req.query?.outreachStatus) filter.outreachStatus = String(req.query.outreachStatus);
      if (req.query?.search) filter.searchQuery = String(req.query.search);

      const leads = db.getLeads(filter);
      return res.status(200).json({ success: true, count: leads.length, leads });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const saved = db.saveLead(body);
      logger.info(`Lead saved: ${saved.businessName} (${saved.id})`);
      return res.status(200).json({ success: true, lead: saved });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query?.id as string;
      if (!id) return res.status(400).json({ success: false, error: 'Lead ID required' });
      const ok = db.deleteLead(id);
      return res.status(200).json({ success: ok });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

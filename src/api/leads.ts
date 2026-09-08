import { DatabaseService } from '../core/database/db.service';
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
      return sendJson(res, 200, { success: true, count: leads.length, leads });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      body = body || {};
      const saved = db.saveLead(body);
      logger.info(`Lead saved: ${saved.businessName} (${saved.id})`);
      return sendJson(res, 200, { success: true, lead: saved });
    } catch (err: any) {
      return sendJson(res, 400, { success: false, error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query?.id as string;
      if (!id) return sendJson(res, 400, { success: false, error: 'Lead ID required' });
      const ok = db.deleteLead(id);
      return sendJson(res, 200, { success: ok });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

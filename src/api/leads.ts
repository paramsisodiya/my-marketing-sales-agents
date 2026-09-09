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
      const id = req.query?.id as string;
      if (id) {
        const lead = db.getLeadById(id);
        if (!lead) return sendJson(res, 404, { success: false, error: 'Lead not found' });
        return sendJson(res, 200, { success: true, lead });
      }

      const filter: any = {};
      if (req.query?.industry) filter.industry = String(req.query.industry);
      if (req.query?.businessCategory) filter.businessCategory = String(req.query.businessCategory);
      if (req.query?.qualificationStatus) filter.qualificationStatus = String(req.query.qualificationStatus);
      if (req.query?.growthStatus) filter.growthStatus = String(req.query.growthStatus);
      if (req.query?.temperature) filter.temperature = String(req.query.temperature);
      if (req.query?.outreachStatus) filter.outreachStatus = String(req.query.outreachStatus);
      if (req.query?.source) filter.source = String(req.query.source);
      if (req.query?.search) filter.searchQuery = String(req.query.search);
      if (req.query?.minScore) filter.minScore = Number(req.query.minScore);

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

      const action = (req.query?.action || body.action) as string;

      // 1. Add Note to Lead
      if (action === 'note') {
        const leadId = req.query?.id || body.leadId;
        const { content, author } = body;
        if (!leadId || !content) {
          return sendJson(res, 400, { success: false, error: 'leadId and content are required' });
        }
        const note = db.addLeadNote(leadId, content, author || 'Team Member');
        return sendJson(res, 200, { success: true, note });
      }

      // 2. Update Status
      if (action === 'status') {
        const leadId = req.query?.id || body.leadId;
        const { status, notes } = body;
        if (!leadId || !status) {
          return sendJson(res, 400, { success: false, error: 'leadId and status are required' });
        }
        const updated = db.updateLeadStatus(leadId, status, notes);
        return sendJson(res, 200, { success: true, lead: updated });
      }

      // 3. Save / Upsert Lead
      if (!body.businessName) {
        return sendJson(res, 400, { success: false, error: 'businessName is required' });
      }

      const saved = db.saveLead(body);
      logger.info(`Lead saved: ${saved.businessName} (${saved.id})`);
      return sendJson(res, 200, { success: true, lead: saved });
    } catch (err: any) {
      return sendJson(res, 400, { success: false, error: err.message });
    }
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const id = (req.query?.id || req.body?.id) as string;
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      body = body || {};

      if (!id) return sendJson(res, 400, { success: false, error: 'Lead ID required' });

      const updated = db.saveLead({ ...body, id });
      return sendJson(res, 200, { success: true, lead: updated });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
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

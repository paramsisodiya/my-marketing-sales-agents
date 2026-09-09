import { LeadIntelligenceService } from '../core/research/lead-intelligence.service';
import { DatabaseService } from '../core/database/db.service';

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

  const db = DatabaseService.getInstance();
  const leadIntelligenceService = LeadIntelligenceService.getInstance();
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const leadId = (req.query && req.query.leadId) || urlObj.searchParams.get('leadId');

  if (req.method === 'GET') {
    if (leadId) {
      const runs = db.getResearchRuns(leadId);
      return sendJson(res, 200, { success: true, runs, count: runs.length });
    }
    const allRuns = db.getResearchRuns();
    return sendJson(res, 200, { success: true, runs: allRuns, count: allRuns.length });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const targetLeadId = leadId || body.leadId || body.id;

      if (!targetLeadId) {
        return sendJson(res, 400, { success: false, error: 'leadId is required' });
      }

      const lead = db.getLeadById(targetLeadId);
      if (!lead) {
        return sendJson(res, 404, { success: false, error: `Lead ${targetLeadId} not found` });
      }

      const updatedLead = await leadIntelligenceService.researchLead(targetLeadId);
      return sendJson(res, 200, {
        success: true,
        lead: updatedLead,
        intelligenceProfile: updatedLead.intelligenceProfile,
      });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to conduct lead research' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

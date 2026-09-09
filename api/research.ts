import { LeadIntelligenceService } from '../src/core/research/lead-intelligence.service';
import { DatabaseService } from '../src/core/database/db.service';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
  const urlObj = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
  const leadId = (req.query && req.query.leadId) || urlObj.searchParams.get('leadId');
  const type = (req.query && req.query.type) || urlObj.searchParams.get('type');

  if (req.method === 'GET') {
    if (leadId) {
      if (type === 'profile') {
        const lead = db.getLeadById(leadId);
        if (!lead || !lead.intelligenceProfile) {
          return sendJson(res, 404, { success: false, error: 'Lead intelligence profile not found' });
        }
        return sendJson(res, 200, { success: true, profile: lead.intelligenceProfile });
      }

      const runs = db.getResearchRuns(leadId);
      return sendJson(res, 200, { success: true, runs });
    }

    const runs = db.getResearchRuns();
    return sendJson(res, 200, { success: true, runs });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const result = await leadIntelligenceService.executeResearch(body);
      return sendJson(res, 200, result);
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Research execution failed' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

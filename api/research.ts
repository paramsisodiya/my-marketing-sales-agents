import { DatabaseService } from '../src/core/database/db.service';
import { LeadIntelligenceService } from '../src/core/research/lead-intelligence.service';

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

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const result = await leadIntelligenceService.executeResearch(body);
      return sendJson(res, 200, result);
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const leadId = req.query?.leadId as string;
      const type = req.query?.type as string; // 'runs' | 'profile'

      if (!leadId) {
        return sendJson(res, 400, { success: false, error: 'leadId is required' });
      }

      if (type === 'profile') {
        const lead = db.getLeadById(leadId);
        if (!lead || !lead.intelligenceProfile) {
          return sendJson(res, 404, { success: false, error: 'Lead profile not found' });
        }
        return sendJson(res, 200, { success: true, profile: lead.intelligenceProfile });
      }

      const runs = db.getResearchRuns(leadId);
      return sendJson(res, 200, { success: true, runs });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

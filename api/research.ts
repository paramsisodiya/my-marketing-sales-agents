import { DatabaseService } from '../src/core/database/db.service';
import { LeadIntelligenceService } from '../src/core/research/lead-intelligence.service';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const db = DatabaseService.getInstance();
  const leadIntelligenceService = LeadIntelligenceService.getInstance();

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const result = await leadIntelligenceService.executeResearch(body);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const leadId = req.query?.leadId as string;
      const type = req.query?.type as string; // 'runs' | 'profile'

      if (!leadId) {
        return res.status(400).json({ success: false, error: 'leadId is required' });
      }

      if (type === 'profile') {
        const lead = db.getLeadById(leadId);
        if (!lead || !lead.intelligenceProfile) {
          return res.status(404).json({ success: false, error: 'Lead profile not found' });
        }
        return res.status(200).json({ success: true, profile: lead.intelligenceProfile });
      }

      const runs = db.getResearchRuns(leadId);
      return res.status(200).json({ success: true, runs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

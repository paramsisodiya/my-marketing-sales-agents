import { DatabaseService } from '../src/core/database/db.service';
import { GrowthScoringEngine } from '../src/core/growth/scoring.engine';
import { EventService } from '../src/core/growth/event.service';

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
  const eventService = EventService.getInstance();
  const urlObj = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
  const id = (req.query && req.query.id) || urlObj.searchParams.get('id');

  if (req.method === 'GET') {
    if (id) {
      const lead = db.getLeadById(id);
      if (!lead) return sendJson(res, 404, { success: false, error: 'Lead not found' });
      return sendJson(res, 200, { success: true, lead });
    }

    const industry = (req.query && req.query.industry) || urlObj.searchParams.get('industry') || undefined;
    const qualificationStatus = (req.query && req.query.qualificationStatus) || urlObj.searchParams.get('qualificationStatus') || undefined;
    const outreachStatus = (req.query && req.query.outreachStatus) || urlObj.searchParams.get('outreachStatus') || undefined;
    const searchQuery = (req.query && req.query.search) || urlObj.searchParams.get('search') || undefined;
    const growthStatus = (req.query && req.query.growthStatus) || urlObj.searchParams.get('growthStatus') || undefined;

    const leads = db.getLeads({
      industry,
      qualificationStatus: qualificationStatus as any,
      outreachStatus: outreachStatus as any,
      growthStatus: growthStatus as any,
      searchQuery,
    });

    return sendJson(res, 200, { success: true, count: leads.length, leads });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      if (!body.businessName) {
        return sendJson(res, 400, { success: false, error: 'Business name is required' });
      }

      const scoreResult = GrowthScoringEngine.calculateScore({
        phone: body.phone,
        email: body.email,
        requirement: body.requirement,
        timeline: body.timeline,
        hasViewedAuditResult: Boolean(body.auditId || body.source === 'AUDIT'),
        hasClickedContactCta: Boolean(body.requirement || body.growthStatus === 'QUALIFIED'),
        hasCreatedQrMenu: Boolean(body.restaurantId || body.source === 'QR_MENU'),
        hasRequestedDemo: Boolean(body.growthStatus === 'DEMO' || body.requirement === 'PrimeOMS'),
      });

      const saved = db.saveLead({
        ...body,
        leadScore: body.leadScore ?? scoreResult.score,
        leadTemperature: body.leadTemperature ?? scoreResult.temperature,
      });

      eventService.logEvent('lead_captured', {
        leadId: saved.id,
        metadata: {
          source: saved.source,
          score: saved.leadScore,
          temperature: saved.leadTemperature,
          businessName: saved.businessName,
        },
      });

      return sendJson(res, 200, { success: true, lead: saved });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to save lead' });
    }
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const leadId = id || body.id;
      if (!leadId) {
        return sendJson(res, 400, { success: false, error: 'Lead ID is required' });
      }

      if (body.growthStatus || body.notes) {
        const updated = db.updateLeadStatus(leadId, body.growthStatus, body.notes);
        return sendJson(res, 200, { success: true, lead: updated });
      }

      const saved = db.saveLead({ ...body, id: leadId });
      return sendJson(res, 200, { success: true, lead: saved });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to update lead' });
    }
  }

  if (req.method === 'DELETE') {
    if (!id) return sendJson(res, 400, { success: false, error: 'Lead ID required' });
    const ok = db.deleteLead(id);
    return sendJson(res, 200, { success: ok });
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

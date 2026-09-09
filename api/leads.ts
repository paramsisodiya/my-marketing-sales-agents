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
  const eventService = EventService.getInstance();

  const urlObj = new URL(req.url || '/', 'http://localhost');
  const action = (req.query && req.query.action) || urlObj.searchParams.get('action');
  const id = (req.query && req.query.id) || urlObj.searchParams.get('id');

  if (req.method === 'GET') {
    if (id) {
      const lead = db.getLeadById(id);
      if (!lead) return sendJson(res, 404, { success: false, error: `Lead ${id} not found` });
      return sendJson(res, 200, { success: true, lead });
    }

    const { status, category, temperature, source, minScore, search } = req.query || {};
    const leads = db.getLeads({
      growthStatus: status as any,
      businessCategory: category as any,
      temperature: temperature as any,
      source: source as any,
      minScore: minScore ? Number(minScore) : undefined,
      searchQuery: search as any,
    });

    return sendJson(res, 200, { success: true, leads, count: leads.length });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

      if (action === 'status' || body.action === 'status') {
        const leadId = id || body.leadId || body.id;
        const targetStatus = body.status || body.growthStatus;
        if (!leadId || !targetStatus) {
          return sendJson(res, 400, { success: false, error: 'leadId and status are required' });
        }
        const updated = db.updateLeadStatus(leadId, targetStatus, body.notes);
        if (!updated) return sendJson(res, 404, { success: false, error: 'Lead not found' });
        eventService.logEvent('lead_status_changed', { leadId, metadata: { newStatus: targetStatus } });
        return sendJson(res, 200, { success: true, lead: updated });
      }

      if (action === 'note' || body.action === 'note') {
        const leadId = id || body.leadId || body.id;
        const { content, author } = body;
        if (!leadId || !content) {
          return sendJson(res, 400, { success: false, error: 'leadId and content are required' });
        }
        const note = db.addLeadNote(leadId, content, author);
        if (!note) return sendJson(res, 404, { success: false, error: 'Lead not found' });
        return sendJson(res, 200, { success: true, note });
      }

      const {
        businessName,
        contactName,
        email,
        phone,
        city,
        location,
        website,
        businessCategory,
        requirement,
        timeline,
        source,
        referralCode,
        auditId,
        restaurantId,
      } = body;

      if (!businessName) {
        return sendJson(res, 400, { success: false, error: 'Business name is required' });
      }

      const scoreResult = GrowthScoringEngine.calculateScore({
        phone,
        email,
        requirement,
        timeline,
        hasViewedAuditResult: Boolean(auditId),
        hasClickedContactCta: true,
        hasCreatedQrMenu: Boolean(restaurantId),
      });

      const lead = db.saveLead({
        businessName: businessName.trim(),
        contactName: contactName ? contactName.trim() : businessName.trim() + ' Contact',
        email: email ? email.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        city: city ? city.trim() : 'India',
        location: location || city || 'India',
        website: website ? website.trim() : undefined,
        businessCategory: businessCategory || 'Other',
        requirement,
        timeline,
        source: source || 'WEBSITE',
        referralCode,
        auditId,
        restaurantId,
        leadScore: scoreResult.score,
        leadTemperature: scoreResult.temperature,
        growthStatus: 'NEW',
      });

      eventService.logEvent('lead_created', {
        leadId: lead.id,
        metadata: { source: lead.source, score: lead.leadScore, temperature: lead.leadTemperature },
      });

      return sendJson(res, 201, { success: true, lead });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to process lead request' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

import { AuditEngine } from '../core/growth/audit.engine';
import { DatabaseService } from '../core/database/db.service';
import { EventService } from '../core/growth/event.service';

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

  if (req.method === 'GET') {
    const id = (req.query && req.query.id) || (req.url && new URL(req.url, 'http://localhost').searchParams.get('id'));
    if (id) {
      const audit = db.getAuditById(id);
      if (!audit) return sendJson(res, 404, { success: false, error: 'Audit record not found' });
      return sendJson(res, 200, { success: true, audit });
    }
    const audits = db.getAudits();
    return sendJson(res, 200, { success: true, audits, count: audits.length });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { businessName, websiteUrl, category, city, phone, email, googleBusinessUrl, referralCode } = body;

      if (!businessName || typeof businessName !== 'string') {
        return sendJson(res, 400, { success: false, error: 'Business name is required.' });
      }

      eventService.logEvent('audit_started', {
        metadata: { businessName, category, city, websiteUrl },
      });

      const auditResult = await AuditEngine.executeAudit({
        businessName: businessName.trim(),
        websiteUrl: websiteUrl ? websiteUrl.trim() : undefined,
        category,
        city,
      });

      const auditRecord = db.saveAudit({
        businessName: businessName.trim(),
        websiteUrl: websiteUrl ? websiteUrl.trim() : undefined,
        category: (category as any) || 'Other',
        city: city ? city.trim() : 'India',
        phone: phone ? phone.trim() : undefined,
        email: email ? email.trim() : undefined,
        googleBusinessUrl: googleBusinessUrl ? googleBusinessUrl.trim() : undefined,
        score: auditResult.score,
        grade: auditResult.grade,
        resultsJson: auditResult,
      });

      let leadRecord = null;
      if (phone || email) {
        leadRecord = db.saveLead({
          businessName: businessName.trim(),
          contactName: businessName.trim() + ' Owner',
          phone: phone ? phone.trim() : undefined,
          email: email ? email.trim() : undefined,
          city: city ? city.trim() : 'India',
          location: city ? city.trim() : 'India',
          website: websiteUrl ? websiteUrl.trim() : undefined,
          businessCategory: category,
          industry: category || 'Local Business',
          source: 'AUDIT',
          sourceDetail: `website_audit_${auditRecord.id}`,
          auditId: auditRecord.id,
          referralCode: referralCode || undefined,
          growthStatus: 'NEW',
          digitalPresenceScore: auditResult.score,
        });

        eventService.logEvent('lead_created', {
          leadId: leadRecord.id,
          metadata: { source: 'AUDIT', score: leadRecord.leadScore, temperature: leadRecord.leadTemperature },
        });
      }

      eventService.logEvent('audit_completed', {
        leadId: leadRecord?.id,
        metadata: { auditId: auditRecord.id, score: auditRecord.score },
      });

      return sendJson(res, 200, {
        success: true,
        audit: auditRecord,
        lead: leadRecord,
      });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to complete digital audit' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

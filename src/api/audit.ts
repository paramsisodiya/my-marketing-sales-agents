import { DatabaseService } from '../core/database/db.service';
import { AuditEngine } from '../core/growth/audit.engine';
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
  const eventService = EventService.getInstance();

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      body = body || {};

      const { businessName, websiteUrl, category, city, phone, email, googleBusinessUrl, referralCode } = body;

      if (!businessName || businessName.trim().length === 0) {
        return sendJson(res, 400, { success: false, error: 'Business name is required.' });
      }

      eventService.logEvent('audit_started', { metadata: { businessName, category, city } });

      // Run deterministic, SSRF-protected audit engine
      const auditResult = await AuditEngine.executeAudit({
        businessName,
        websiteUrl,
        category,
        city,
      });

      // Save audit record to database
      const auditRecord = db.saveAudit({
        businessName,
        websiteUrl,
        category: category || 'Other',
        city: city || 'India',
        phone,
        email,
        googleBusinessUrl,
        score: auditResult.score,
        grade: auditResult.grade,
        resultsJson: auditResult,
      });

      // Non-intrusively create or link a lead if contact information was provided
      let leadRecord = null;
      if (phone || email) {
        leadRecord = db.saveLead({
          businessName,
          businessCategory: category || 'Other',
          website: websiteUrl,
          phone,
          email,
          city,
          location: city || 'India',
          source: referralCode ? 'REFERRAL' : 'AUDIT',
          sourceDetail: referralCode ? `referral_${referralCode}` : 'website_audit',
          referralCode,
          auditId: auditRecord.id,
          digitalPresenceScore: auditResult.score,
          painPoints: auditResult.issues,
          opportunities: auditResult.opportunities,
          recommendedServices: auditResult.recommendedActions,
          growthStatus: 'NEW',
        });

        if (referralCode) {
          db.trackReferralLead(referralCode);
        }
      }

      eventService.logEvent('audit_completed', {
        leadId: leadRecord?.id,
        metadata: { auditId: auditRecord.id, score: auditResult.score },
      });

      return sendJson(res, 200, {
        success: true,
        audit: auditRecord,
        lead: leadRecord,
      });
    } catch (err: any) {
      console.error('Audit execution error:', err);
      return sendJson(res, 500, { success: false, error: err.message || 'Audit execution failed' });
    }
  }

  if (req.method === 'GET') {
    try {
      const id = req.query?.id as string;
      if (id) {
        const audit = db.getAuditById(id);
        if (!audit) {
          return sendJson(res, 404, { success: false, error: 'Audit not found' });
        }
        return sendJson(res, 200, { success: true, audit });
      }

      const audits = db.getAudits();
      return sendJson(res, 200, { success: true, count: audits.length, audits });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

import { ReferralEngine } from '../core/growth/referral.engine';
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

  const urlObj = new URL(req.url || '/', 'http://localhost');
  const code = (req.query && req.query.code) || urlObj.searchParams.get('code');
  const action = (req.query && req.query.action) || urlObj.searchParams.get('action');

  if (req.method === 'GET') {
    if (code) {
      const normalized = ReferralEngine.normalizeCode(code);
      const referral = db.getReferralByCode(normalized);
      if (!referral) return sendJson(res, 404, { success: false, error: 'Referral code not found' });
      return sendJson(res, 200, { success: true, referral });
    }

    const referrals = db.getReferrals();
    return sendJson(res, 200, { success: true, referrals, count: referrals.length });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

      if (action === 'track' || body.action === 'track') {
        const targetCode = code || body.code;
        if (!targetCode) return sendJson(res, 400, { success: false, error: 'code is required' });

        const updated = db.trackReferralClick(targetCode);
        eventService.logEvent('referral_clicked', { metadata: { code: targetCode } });
        return sendJson(res, 200, { success: Boolean(updated), referral: updated });
      }

      const { referrerName, referrerContact, customCode, referredBusiness, targetVertical } = body;
      if (!referrerName) {
        return sendJson(res, 400, { success: false, error: 'referrerName is required.' });
      }

      const finalCode = customCode
        ? ReferralEngine.normalizeCode(customCode)
        : ReferralEngine.generateCode(referrerName.split(' ')[0]);

      const referral = db.saveReferral({
        referralCode: finalCode,
        referrerName: referrerName.trim(),
        referrerContact: referrerContact ? referrerContact.trim() : undefined,
        referredBusiness: referredBusiness ? referredBusiness.trim() : undefined,
        targetVertical: targetVertical || undefined,
        status: 'CLICKED',
      });

      return sendJson(res, 201, { success: true, referral });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to process referral' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

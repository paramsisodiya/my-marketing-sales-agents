import { ReferralEngine } from '../src/core/growth/referral.engine';
import { DatabaseService } from '../src/core/database/db.service';
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
  const urlObj = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
  const code = (req.query && req.query.code) || urlObj.searchParams.get('code');
  const action = (req.query && req.query.action) || urlObj.searchParams.get('action');

  if (req.method === 'GET') {
    if (code) {
      const referral = db.getReferralByCode(code);
      if (!referral) return sendJson(res, 404, { success: false, error: 'Referral code not found' });
      return sendJson(res, 200, { success: true, referral });
    }

    const referrals = db.getReferrals();
    return sendJson(res, 200, { success: true, count: referrals.length, referrals });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

      if (action === 'track' || body.action === 'track') {
        const targetCode = code || body.code;
        if (!targetCode) return sendJson(res, 400, { success: false, error: 'Referral code is required' });
        const ok = db.trackReferralClick(targetCode);
        eventService.logEvent('referral_clicked', { metadata: { code: targetCode } });
        return sendJson(res, 200, { success: ok });
      }

      const { referrerName, referrerContact, customCode, referredBusiness } = body;
      if (!referrerName) {
        return sendJson(res, 400, { success: false, error: 'referrerName is required' });
      }

      const referralCode = customCode
        ? ReferralEngine.normalizeCode(customCode)
        : ReferralEngine.generateCode(referrerName);

      const ref = db.saveReferral({
        referralCode,
        referrerName,
        referrerContact,
        referredBusiness,
      });

      return sendJson(res, 200, { success: true, referral: ref });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to save referral' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

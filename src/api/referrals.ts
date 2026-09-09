import { DatabaseService } from '../core/database/db.service';
import { ReferralEngine } from '../core/growth/referral.engine';
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

  if (req.method === 'GET') {
    try {
      const code = req.query?.code as string;
      if (code) {
        const referral = db.getReferralByCode(code);
        if (!referral) {
          return sendJson(res, 404, { success: false, error: 'Referral code not found' });
        }
        return sendJson(res, 200, { success: true, referral });
      }

      const referrals = db.getReferrals();
      return sendJson(res, 200, { success: true, count: referrals.length, referrals });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      body = body || {};
      const action = (req.query?.action || body.action) as string;

      // Track referral click
      if (action === 'track') {
        const code = (req.query?.code || body.code) as string;
        if (!code) return sendJson(res, 400, { success: false, error: 'code is required' });
        const ok = db.trackReferralClick(code);
        eventService.logEvent('referral_clicked', { metadata: { referralCode: code } });
        return sendJson(res, 200, { success: ok });
      }

      // Create referral code
      const { referrerName, referrerContact, customCode, referredBusiness } = body;
      if (!referrerName) {
        return sendJson(res, 400, { success: false, error: 'referrerName is required' });
      }

      const referralCode = customCode
        ? ReferralEngine.normalizeCode(customCode)
        : ReferralEngine.generateCode(referrerName);

      const referral = db.saveReferral({
        referralCode,
        referrerName,
        referrerContact,
        referredBusiness,
      });

      return sendJson(res, 200, { success: true, referral });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

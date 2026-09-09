import { EventService } from '../core/growth/event.service';
import { DatabaseService } from '../core/database/db.service';

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
    const stats = eventService.getEventStats();
    const events = db.getEvents();
    return sendJson(res, 200, {
      success: true,
      stats,
      totalEvents: events.length,
      recentEvents: events.slice(0, 25),
    });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { eventName, anonymousId, leadId, metadata } = body;

      if (!eventName) {
        return sendJson(res, 400, { success: false, error: 'eventName is required' });
      }

      const event = eventService.logEvent(eventName, { anonymousId, leadId, metadata });
      return sendJson(res, 200, { success: true, event });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to record event' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

import { LoggerService } from '../core/observability/logger.service';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const logger = LoggerService.getInstance();
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const level = (req.query && req.query.level) || urlObj.searchParams.get('level');
  const agentId = (req.query && req.query.agentId) || urlObj.searchParams.get('agentId');
  const limit = (req.query && req.query.limit) || urlObj.searchParams.get('limit');

  if (req.method === 'GET') {
    const logs = logger.getLogs({
      level: level as any,
      agentId: agentId as any,
      limit: limit ? parseInt(limit, 10) : 100,
    });
    return sendJson(res, 200, { success: true, logs, count: logs.length });
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

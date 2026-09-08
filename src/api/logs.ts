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

  if (req.method === 'GET') {
    try {
      const limit = req.query?.limit ? Number(req.query.limit) : 100;
      const agentId = req.query?.agentId as string | undefined;
      const workflowId = req.query?.workflowId as string | undefined;
      const level = req.query?.level as any;

      const logs = logger.getRecentLogs(limit, { agentId, workflowId, level });
      return sendJson(res, 200, { success: true, logs });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

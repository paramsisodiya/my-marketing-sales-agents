import { LoggerService } from '../src/core/observability/logger.service';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const logger = LoggerService.getInstance();

  if (req.method === 'GET') {
    try {
      const limit = req.query?.limit ? Number(req.query.limit) : 100;
      const agentId = req.query?.agentId as string | undefined;
      const workflowId = req.query?.workflowId as string | undefined;
      const level = req.query?.level as any;

      const logs = logger.getRecentLogs(limit, { agentId, workflowId, level });
      return res.status(200).json({ success: true, logs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

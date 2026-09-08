import { AgentRegistry } from '../core/agents/agent.registry';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  AgentRegistry.initialize();

  if (req.method === 'GET') {
    try {
      const metadata = AgentRegistry.getAllMetadata();
      return sendJson(res, 200, { success: true, agents: metadata });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const agentId = (req.query?.id || req.body?.agentId) as any;
      const agent = AgentRegistry.getAgent(agentId);

      if (!agent) {
        return sendJson(res, 404, { success: false, error: `Agent ${agentId} not found` });
      }

      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      body = body || {};
      const { task, objective, context, leadData, constraints } = body;
      const output = await agent.execute({
        task: task || 'Execute specialist task',
        objective: objective || 'Generate high-quality output for PrimeSoul',
        context,
        leadData,
        constraints,
      });

      return sendJson(res, 200, { success: true, output });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

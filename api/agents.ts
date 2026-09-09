import { AgentRegistry } from '../src/core/agents/agent.registry';

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

  AgentRegistry.initialize();
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const id = (req.query && req.query.id) || urlObj.searchParams.get('id');

  if (req.method === 'GET') {
    const metadata = AgentRegistry.getAllMetadata();
    return sendJson(res, 200, { success: true, agents: metadata });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const agentId = id || body.agentId || body.id;
      const agent = AgentRegistry.getAgent(agentId);

      if (!agent) {
        return sendJson(res, 404, { success: false, error: `Agent ${agentId} not found` });
      }

      const { task, objective, context, leadData, constraints } = body;
      const output = await agent.execute({
        task: task || 'Execute task',
        objective: objective || 'Generate PrimeSoul output',
        context,
        leadData,
        constraints,
      });

      return sendJson(res, 200, { success: true, agentId, output });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to execute agent' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

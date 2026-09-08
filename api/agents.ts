import { AgentRegistry } from '../src/core/agents/agent.registry';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  AgentRegistry.initialize();

  if (req.method === 'GET') {
    try {
      const metadata = AgentRegistry.getAllMetadata();
      return res.status(200).json({ success: true, agents: metadata });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const agentId = (req.query?.id || req.body?.agentId) as any;
      const agent = AgentRegistry.getAgent(agentId);

      if (!agent) {
        return res.status(404).json({ success: false, error: `Agent ${agentId} not found` });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { task, objective, context, leadData, constraints } = body;
      const output = await agent.execute({
        task: task || 'Execute specialist task',
        objective: objective || 'Generate high-quality output for PrimeSoul',
        context,
        leadData,
        constraints,
      });

      return res.status(200).json({ success: true, output });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}

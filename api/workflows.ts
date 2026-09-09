import { WorkflowEngine } from '../src/core/workflows/workflow.engine';
import { WORKFLOW_DEFINITIONS } from '../src/core/workflows/workflow.definitions';

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

  const workflowEngine = WorkflowEngine.getInstance();
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const action = (req.query && req.query.action) || urlObj.searchParams.get('action');

  if (req.method === 'GET') {
    if (action === 'instances') {
      const instances = workflowEngine.getAllInstances();
      return sendJson(res, 200, { success: true, instances, count: instances.length });
    }
    return sendJson(res, 200, { success: true, workflows: WORKFLOW_DEFINITIONS });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { workflowId, leadId, customInputs } = body;

      if (!workflowId) {
        return sendJson(res, 400, { success: false, error: 'workflowId is required' });
      }

      const instance = await workflowEngine.startWorkflow(workflowId, leadId, customInputs);
      return sendJson(res, 200, { success: true, instance });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Failed to execute workflow' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}

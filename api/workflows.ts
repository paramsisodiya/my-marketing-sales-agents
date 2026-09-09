import { WorkflowEngine } from '../src/core/workflows/workflow.engine';
import { WORKFLOW_DEFINITIONS } from '../src/core/workflows/workflow.definitions';
import { DatabaseService } from '../src/core/database/db.service';

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
  const workflowEngine = WorkflowEngine.getInstance();
  const urlObj = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
  const id = (req.query && req.query.id) || urlObj.searchParams.get('id');

  if (req.method === 'GET') {
    if (id) {
      const instance = db.getWorkflowById(id);
      if (!instance) return sendJson(res, 404, { success: false, error: 'Workflow instance not found' });
      return sendJson(res, 200, { success: true, instance });
    }

    const instances = db.getWorkflows();
    return sendJson(res, 200, { success: true, workflows: WORKFLOW_DEFINITIONS, instances, count: instances.length });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { workflowId, leadId, context, instanceId, approvalId, approved, feedback } = body;

      if (instanceId && approvalId) {
        const updated = await workflowEngine.resumeWorkflowAfterApproval(instanceId, approvalId, Boolean(approved), feedback);
        return sendJson(res, 200, { success: true, instance: updated });
      }

      if (!workflowId) {
        return sendJson(res, 400, { success: false, error: 'workflowId is required' });
      }

      const def = WORKFLOW_DEFINITIONS.find(w => w.id === workflowId);
      if (!def) {
        return sendJson(res, 404, { success: false, error: `Workflow definition '${workflowId}' not found` });
      }

      const instance = await workflowEngine.startWorkflow(def, context || {}, leadId);
      return sendJson(res, 200, { success: true, instance });
    } catch (err: any) {
      return sendJson(res, 500, { success: false, error: err.message || 'Workflow execution error' });
    }
  }

  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
